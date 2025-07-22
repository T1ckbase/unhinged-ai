const ENV_VARS = [
  'GOOGLE_GENERATIVE_AI_API_KEY',
] as const;

type EnvType = { [K in typeof ENV_VARS[number]]: string };

for (const envVar of ENV_VARS) {
  if (!Deno.env.get(envVar)) {
    throw new Error(`Environment variable "${envVar}" is not set.`);
  }
}

declare global {
  namespace Deno {
    interface Env {
      delete<K extends keyof EnvType>(key: K): void;
      get<K extends keyof EnvType>(key: K): EnvType[K];
      has<K extends keyof EnvType>(key: K): boolean;
      set<K extends keyof EnvType>(key: K): void;
      toObject(): EnvType;
    }
  }

  namespace NodeJS {
    interface ProcessEnv extends EnvType {}
  }
}
