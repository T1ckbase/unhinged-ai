import './env.ts';
import { delay } from '@std/async';
import { CoreAssistantMessage, CoreUserMessage, generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { executeBash } from './bash.ts';
import { countTokens } from './utils.ts';
import SYSTEM_PROMPT from './system_prompt.md' with { type: 'text' };

const MAX_TOKENS = 128000;

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
  while (countTokens([...initialMessages, ...historyMessages]) > MAX_TOKENS * 0.9 || historyMessages.length >= 35) {
    historyMessages.splice(0, 2);
  }
  try {
    const result = await generateText({
      model,
      messages: [...initialMessages, ...historyMessages],
      maxRetries: Number.MAX_SAFE_INTEGER,
      maxSteps: Infinity,
    });

    const command = result.text.trim();

    console.log([
      `---`,
      'Assistant',
      '---',
      command,
      '',
    ].join('\n'));

    const output = await executeBash(command);

    historyMessages.push(
      { role: 'assistant', content: result.text },
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

    await delay(1000);
  } catch (error) {
    console.error('Error:', error);
    await delay(5000);
  }
}
