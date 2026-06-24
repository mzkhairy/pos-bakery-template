const BRANCH = process.env.BRANCH_ID || 'unknown';

export const logger = {
  info: (msg: string, meta?: object) =>
    console.log(`[${BRANCH}] [INFO] ${msg}`, meta ? JSON.stringify(meta) : ''),
  warn: (msg: string, meta?: object) =>
    console.warn(`[${BRANCH}] [WARN] ${msg}`, meta ? JSON.stringify(meta) : ''),
  error: (msg: string, meta?: object) =>
    console.error(`[${BRANCH}] [ERROR] ${msg}`, meta ? JSON.stringify(meta) : ''),
};
