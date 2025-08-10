import { CoreAssistantMessage, CoreUserMessage } from 'ai';

// https://ai.google.dev/gemini-api/docs/tokens
export function countTokens(messages: (CoreUserMessage | CoreAssistantMessage)[]) {
  const charCount = messages.reduce((acc, msg) => {
    return acc + (msg.content as string).length;
  }, 0);
  return Math.floor(charCount / 4);
}
