import './env.ts';
import { delay } from '@std/async';
import { CoreAssistantMessage, CoreUserMessage, streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { executeBash } from './bash.ts';
import { countTokens } from './utils.ts';
import SYSTEM_PROMPT from './system_prompt.md' with { type: 'text' };

// const MAX_TOKENS = 128000;

const textEncoder = new TextEncoder();

const initialMessages: (CoreUserMessage | CoreAssistantMessage)[] = [
  { role: 'user', content: `<system>\n${SYSTEM_PROMPT}\n</system>` },
  { role: 'assistant', content: 'GYATT! GYATT! I will follow system instructions!' },
  // { role: 'user', content: await executeBash("echo \"Welcome to $(cat /etc/os-release | grep PRETTY_NAME | cut -d'=' -f2 | tr -d '\"')!\"") },
  // { role: 'assistant', content: 'whoami' },
  // { role: 'user', content: await executeBash('whoami') },
  // { role: 'user', content: 'Welcome to Ubuntu 24.04.1 LTS' },
];

const historyMessages: (CoreUserMessage | CoreAssistantMessage)[] = [
  { role: 'user', content: await executeBash("echo \"Welcome to $(cat /etc/os-release | grep PRETTY_NAME | cut -d'=' -f2 | tr -d '\"')!\"") },
];

Deno.serve({ port: 7860, hostname: '0.0.0.0' }, (_req) => new Response(JSON.stringify(historyMessages, null, 2)));

const model = google('gemma-3-27b-it');

while (true) {
  while (countTokens([...initialMessages, ...historyMessages]) > 12800 /*|| historyMessages.length >= 40*/) {
    historyMessages.splice(0, 2);
  }
  try {
    console.log('---\nAssistant\n---');

    const result = streamText({
      model,
      messages: [...initialMessages, ...historyMessages],
      maxRetries: Number.MAX_SAFE_INTEGER,
      maxSteps: Infinity,
    });

    let text = '';
    for await (const chunk of result.textStream) {
      await Deno.stdout.write(textEncoder.encode(chunk));
      text += chunk;
    }
    console.log('\n');

    const command = text.trim();

    const output = await executeBash(command);

    historyMessages.push(
      { role: 'assistant', content: text },
      { role: 'user', content: output },
    );

    console.log([
      '---',
      'Bash Output',
      '---',
      output,
      '',
    ].join('\n'));

    console.log([
      '---',
      'Info',
      '---',
      `messages: ${historyMessages.length}`,
      `tokens: ${countTokens(historyMessages)}`,
      '',
    ].join('\n'));

    await delay(2000);
  } catch (error) {
    console.error('Error:', error);
    await delay(5000);
  }
}
