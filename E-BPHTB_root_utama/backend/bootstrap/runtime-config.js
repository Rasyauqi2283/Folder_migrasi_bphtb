export function buildRuntimeConfig(env = process.env) {
  const startupQuiet = env.STARTUP_QUIET === '1';
  const isLocalDev = env.LOCAL_DEV === '1' || env.NODE_ENV === 'development';
  const defaultPort = parseInt(env.PORT, 10) || (env.SANDBOX ? 3600 : 3000);
  const nextPort = parseInt(env.NEXT_PORT, 10) || 3100;
  const localBase = `http://localhost:${defaultPort}`;

  const apiUrl = isLocalDev
    ? localBase
    : (env.VITE_API_URI || env.API_URL || localBase);

  const apiUrlSource = isLocalDev
    ? 'local dev'
    : (env.VITE_API_URI ? 'VITE_API_URI' : env.API_URL ? 'API_URL' : 'default (localhost)');

  const corsOrigins = isLocalDev
    ? [
        'http://localhost:3000',
        'http://localhost:3100',
        'http://localhost:8080',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        `http://127.0.0.1:${nextPort}`,
        `http://localhost:${defaultPort}`,
        `http://127.0.0.1:${defaultPort}`
      ]
    : (env.CORS_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean) || [
        'http://localhost:3000',
        'http://localhost:8080',
        'http://localhost:5173',
        'http://127.0.0.1:3000'
      ]);

  return {
    startupQuiet,
    isLocalDev,
    defaultPort,
    nextPort,
    localBase,
    apiUrl,
    apiUrlSource,
    corsOrigins
  };
}
