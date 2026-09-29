import { NextResponse } from 'next/server'

export async function GET() {
  const openApiSpec = {
    openapi: '3.1.0',
    info: {
      title: 'StreamForge OTT Platform API',
      version: '1.0.0',
      description:
        'Production REST API for StreamForge — Netflix/Prime-class OTT monolith supporting custom JWT auth, HMAC-signed HLS streaming, catalog curation, and player QoS telemetry.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server',
      },
      {
        url: 'https://streamforge.dev',
        description: 'Production Edge Monolith',
      },
    ],
    paths: {
      '/api/auth/signup': {
        post: {
          summary: 'Register new account',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Account successfully registered and authenticated' },
            '400': { description: 'Validation error or invalid credentials' },
            '409': { description: 'Email already registered' },
            '429': { description: 'Rate limit exceeded' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          summary: 'Authenticate account',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Successfully authenticated, sets httpOnly access and refresh cookies' },
            '401': { description: 'Invalid email or password' },
            '429': { description: 'Too many login attempts' },
          },
        },
      },
      '/api/rails': {
        get: {
          summary: 'Get curated homepage rails and billboard',
          tags: ['Catalog & Discovery'],
          responses: {
            '200': { description: 'Returns active billboard title and discovery rails filtered by maturity' },
          },
        },
      },
      '/api/content/{slug}': {
        get: {
          summary: 'Get title detail metadata and recommendations',
          tags: ['Catalog & Discovery'],
          parameters: [
            {
              name: 'slug',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'Returns title metadata, cast, episodes, and similar titles' },
            '404': { description: 'Title not found' },
          },
        },
      },
      '/api/search': {
        get: {
          summary: 'Multi-facet catalog search',
          tags: ['Catalog & Discovery'],
          parameters: [
            { name: 'q', in: 'query', schema: { type: 'string' } },
            { name: 'genre', in: 'query', schema: { type: 'string' } },
            { name: 'type', in: 'query', schema: { type: 'string', enum: ['movie', 'series'] } },
            { name: 'minAge', in: 'query', schema: { type: 'integer' } },
          ],
          responses: {
            '200': { description: 'List of matching titles' },
          },
        },
      },
      '/api/search/autocomplete': {
        get: {
          summary: 'Instant title search autocomplete suggestions',
          tags: ['Catalog & Discovery'],
          parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2 } },
          ],
          responses: {
            '200': { description: 'Top autocomplete matches' },
          },
        },
      },
      '/api/video/playback/{assetId}': {
        get: {
          summary: 'Obtain signed HLS master URL and subtitles',
          tags: ['Video & Streaming'],
          parameters: [
            { name: 'assetId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Returns signed master.m3u8 URL, signed subtitles, and plan max resolution' },
            '403': { description: 'Subscription entitlement required or kids age restriction' },
            '404': { description: 'Video asset not found' },
          },
        },
      },
      '/api/hls/{assetId}/{path}': {
        get: {
          summary: 'HLS manifest proxy and segment streamer with HMAC verification',
          tags: ['Video & Streaming'],
          parameters: [
            { name: 'assetId', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'path', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'token', in: 'query', required: true, schema: { type: 'string' } },
            { name: 'exp', in: 'query', required: true, schema: { type: 'integer' } },
            { name: 'qMax', in: 'query', required: true, schema: { type: 'integer' } },
          ],
          responses: {
            '200': { description: 'Rewritten HLS manifest (.m3u8) or video segment (.ts)' },
            '403': { description: 'Invalid token or quality exceeds plan entitlement' },
          },
        },
      },
      '/api/player/beacon': {
        post: {
          summary: 'Consolidated QoS telemetry, watch progress, and session heartbeat',
          tags: ['Player & Telemetry'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['titleId'],
                  properties: {
                    titleId: { type: 'string' },
                    playbackSessionId: { type: 'string' },
                    progress: {
                      type: 'object',
                      properties: {
                        positionSeconds: { type: 'number' },
                        durationSeconds: { type: 'number' },
                        isCompleted: { type: 'boolean' },
                      },
                    },
                    events: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
          responses: {
            '202': { description: 'Beacon accepted and processed' },
          },
        },
      },
      '/api/watchlist': {
        get: {
          summary: 'Get active profile watchlist',
          tags: ['Watchlist & Ratings'],
          responses: {
            '200': { description: 'Profile watchlist items' },
            '401': { description: 'Authentication required' },
          },
        },
        post: {
          summary: 'Add title to watchlist',
          tags: ['Watchlist & Ratings'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['titleId'],
                  properties: { titleId: { type: 'string' } },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Added to watchlist' },
          },
        },
      },
      '/api/ratings': {
        post: {
          summary: 'Like or dislike title',
          tags: ['Watchlist & Ratings'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['titleId', 'value'],
                  properties: {
                    titleId: { type: 'string' },
                    value: { type: 'string', enum: ['like', 'dislike'] },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Rating updated' },
          },
        },
      },
      '/api/health/live': {
        get: {
          summary: 'Kubernetes/Docker liveness probe',
          tags: ['System Health'],
          responses: {
            '200': { description: 'Service process is alive' },
          },
        },
      },
      '/api/health/ready': {
        get: {
          summary: 'Readiness probe verifying DB and Redis availability',
          tags: ['System Health'],
          responses: {
            '200': { description: 'All backing services connected' },
            '503': { description: 'One or more backing services unavailable' },
          },
        },
      },
    },
  }

  return NextResponse.json(openApiSpec, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600',
    },
  })
}
