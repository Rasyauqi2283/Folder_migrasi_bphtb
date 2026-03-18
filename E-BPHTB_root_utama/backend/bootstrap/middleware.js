/**
 * Bootstrap: config routes + core middleware + static.
 * Lapisan middleware untuk E-BPHTB (config -> middleware -> routes -> server start).
 */
import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import pgSession from 'connect-pg-simple';
import { staticConfig } from '../config/static.js';
import { runFullDatabaseMonitoring } from '../../database_monitoring.js';

const PGStore = pgSession(session);

/**
 * Register /api/config and /api/database-monitoring.
 * @param {object} appInstance - Express app
 * @param {{ getApiUrl: () => string }} opts - getApiUrl() returns current API URL (updated after server binds port)
 */
export function registerConfigRoutes(appInstance, { getApiUrl }) {
  appInstance.get('/api/config', (_req, res) => {
    res.json({
      apiUrl: getApiUrl(),
      environment: process.env.NODE_ENV
    });
  });

  appInstance.get('/api/database-monitoring', async (_req, res) => {
    try {
      console.log('🔍 Running database monitoring...');
      await runFullDatabaseMonitoring();
      res.json({
        success: true,
        message: 'Database monitoring completed. Check server logs for details.'
      });
    } catch (error) {
      console.error('❌ Database monitoring failed:', error);
      res.status(500).json({
        success: false,
        message: 'Database monitoring failed',
        error: error.message
      });
    }
  });
}

/**
 * Register core middleware: cookie, session (PG store), CORS, body parsers.
 * @param {object} appInstance - Express app
 * @param {{ pool: object, corsOrigins: string[], startupQuiet: boolean }} opts
 */
export function registerCoreMiddleware(appInstance, { pool, corsOrigins, startupQuiet }) {
  appInstance.use(cookieParser());
  appInstance.use(session({
    store: new PGStore({
      pool,
      tableName: 'user_sessions',
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'default-secret-untuk-development',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    },
    name: 'bappenda.sid'
  }));

  appInstance.use((_req, _res, next) => next());

  appInstance.use(cors({
    origin: corsOrigins,
    credentials: true
  }));

  if (!startupQuiet) {
    console.log('CORS Origins:', corsOrigins);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('SESSION_SECRET exists:', !!process.env.SESSION_SECRET);
  }

  appInstance.use(express.json({ limit: '10mb' }));
  appInstance.use(express.urlencoded({ extended: true, limit: '10mb' }));
}

/**
 * Apply full middleware stack: config routes, static, core middleware, morgan.
 * @param {object} appInstance - Express app
 * @param {object} opts - { pool, runtime, apiUrlRef, logger }
 */
export function registerAppMiddleware(appInstance, { pool, runtime, apiUrlRef, logger }) {
  const { corsOrigins, startupQuiet } = runtime;
  const getApiUrl = () => apiUrlRef.current;

  registerConfigRoutes(appInstance, { getApiUrl });
  staticConfig(appInstance);
  registerCoreMiddleware(appInstance, { pool, corsOrigins, startupQuiet });

  const morganMiddleware = morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    { stream: { write: (msg) => logger.info(msg.trim()) } }
  );

  return { morganMiddleware };
}
