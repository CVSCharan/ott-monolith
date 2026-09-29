import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  redact: {
    paths: [
      'password',
      'pin',
      'token',
      'refreshToken',
      'accessToken',
      'secret',
      'authorization',
      'cookie',
      '*.password',
      '*.pin',
      '*.token',
      '*.secret',
    ],
    censor: '[REDACTED]',
  },
  base: {
    env: process.env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})
