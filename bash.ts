const MAX_OUTPUT_LENGTH = 30000;
const TIMEOUT = 2 * 60 * 1000;

export async function executeBash(bashCommand: string): Promise<string> {
  try {
    const command = new Deno.Command('bash', {
      args: ['-c', bashCommand],
      cwd: Deno.cwd(),
      signal: AbortSignal.timeout(TIMEOUT),
      stdout: 'piped',
      stderr: 'piped',
    });

    const process = await command.output();
    const stdout = new TextDecoder().decode(process.stdout);
    const stderr = new TextDecoder().decode(process.stderr);

    return [`<stdout>`, stdout.slice(0, MAX_OUTPUT_LENGTH), `</stdout>`, `<stderr>`, stderr.slice(0, MAX_OUTPUT_LENGTH), `</stderr>`].join('\n');
  } catch (error) {
    if (error instanceof DOMException && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
      const stderr = `Command timed out or was aborted after ${TIMEOUT}ms.`;
      return [`<stderr>`, stderr, `</stderr>`].join('\n');
    }
    throw error;
  }
}
