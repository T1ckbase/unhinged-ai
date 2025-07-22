import './env.ts';
import { delay } from '@std/async';
import { CoreMessage, generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { executeBash } from './bash.ts';
import dedent from 'dedent';
import SYSTEM_PROMPT from './system_prompt.md' with { type: 'text' };

const messages: CoreMessage[] = [
  { role: 'user', content: `<system>\n${SYSTEM_PROMPT}\n</system>` },
  { role: 'assistant', content: 'GYATT! GYATT! I will follow system instructions!' },
  { role: 'user', content: await executeBash("echo \"Welcome to $(cat /etc/os-release | grep PRETTY_NAME | cut -d'=' -f2 | tr -d '\"')!\"") },
  // { role: 'assistant', content: 'whoami' },
  // { role: 'user', content: await executeBash('whoami') },
  // { role: 'user', content: 'Welcome to Ubuntu 24.04.1 LTS' },
];

// Deno.serve({ port: 7860, hostname: '0.0.0.0' }, (_req) => new Response(JSON.stringify(messages, null, 2)));

const model = google('gemma-3-27b-it');

while (true) {
  try {
    const result = await generateText({
      model,
      messages: messages,
      maxRetries: Number.MAX_SAFE_INTEGER,
      maxSteps: Infinity,
    });

    const command = result.text.trim();
    const output = await executeBash(command);

    messages.push(
      { role: 'assistant', content: result.text },
      { role: 'user', content: output },
    );

    console.log(dedent`
      ---
      Assistant
      ---
      ${command}

      ---
      Bash Output
      ---
      ${output}
    `);

    await delay(1000);
  } catch (error) {
    console.error('Error:', error);
    await delay(5000);
  }
}
