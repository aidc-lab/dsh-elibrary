import { createAdmission } from './lib/access.js'
import { API_PREFIX, normalizeSettings } from './lib/config.js'
import { LibraryStore } from './lib/library.js'
import { createHandler } from './lib/router.js'

/** Host services this plugin needs: the named-route HTTP carrier. */
export const inject = ['webServer']

/**
 * Read one optional Host service without making the whole plugin wait for it.
 *
 * @param {object} ctx Host plugin context
 * @param {string} name service name
 * @returns {any}
 */
function readService(ctx, name) {
  try {
    return typeof ctx.get === 'function' ? ctx.get(name) : undefined
  } catch {
    return undefined
  }
}

/**
 * Register the e-library HTTP route on the DSH web server.
 *
 * One `prefix` registration owns `/elibrary/api` (and everything under it) and
 * is disposed through `ctx.effect` with the plugin fiber.
 *
 * @param {object} ctx Host plugin context (injects `webServer`)
 * @param {object} [config] plugin row config: `requestTimeoutMs`
 */
export function apply(ctx, config) {
  const settings = normalizeSettings(config)
  const library = new LibraryStore()
  const handler = createHandler(settings, library)
  const admitRequest = createAdmission(() => readService(ctx, 'connection'))
  ctx.effect(() => {
    const dispose = ctx.webServer.register({
      kind: 'prefix',
      path: API_PREFIX,
      handler: (req, res) => {
        if (!admitRequest(req, res)) return
        void handler(req, res)
      },
    })
    return () => dispose()
  })
}
