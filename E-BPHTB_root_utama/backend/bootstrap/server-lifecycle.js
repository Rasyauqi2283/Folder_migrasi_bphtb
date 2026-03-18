import net from 'net';

function isPortFree(port, host = '0.0.0.0') {
  return new Promise((resolve) => {
    const tester = net.createServer();

    tester.once('error', () => resolve(false));
    tester.once('listening', () => {
      tester.close(() => resolve(true));
    });

    tester.listen(port, host);
  });
}

export async function getPortCandidates(basePort, env = process.env) {
  const isDev = env.LOCAL_DEV === '1' || env.NODE_ENV === 'development';
  if (!isDev) return [basePort];
  return [basePort, basePort + 1, basePort + 2];
}

export async function resolveListeningPort(basePort, env = process.env) {
  const candidates = await getPortCandidates(basePort, env);
  for (const port of candidates) {
    // Best-effort preflight check. Final bind still guarded by listen error event.
    if (await isPortFree(port)) return { requestedPort: basePort, selectedPort: port };
  }
  return { requestedPort: basePort, selectedPort: basePort };
}

export async function listenWithFallback({ app, host = '0.0.0.0', basePort, env = process.env }) {
  const candidates = await getPortCandidates(basePort, env);

  for (const port of candidates) {
    try {
      const server = await new Promise((resolve, reject) => {
        const instance = app.listen(port, host);
        instance.once('listening', () => resolve(instance));
        instance.once('error', reject);
      });
      return { server, selectedPort: port, requestedPort: basePort };
    } catch (err) {
      if (err?.code !== 'EADDRINUSE') throw err;
    }
  }

  const error = new Error(`No available port found from candidates: ${candidates.join(', ')}`);
  error.code = 'EALLPORTSUSED';
  error.candidates = candidates;
  throw error;
}

export function registerGracefulShutdown({ server, pool, logger = console }) {
  let isShuttingDown = false;

  const shutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info?.(`[SHUTDOWN] Received ${signal}, closing resources...`);

    const closeServer = new Promise((resolve) => {
      server.close((err) => {
        if (err) logger.error?.('[SHUTDOWN] Error closing server:', err);
        resolve();
      });
    });

    const closeDb = pool?.end ? pool.end().catch((err) => logger.error?.('[SHUTDOWN] Error closing DB pool:', err)) : Promise.resolve();

    await Promise.allSettled([closeServer, closeDb]);
    logger.info?.('[SHUTDOWN] Completed');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}
