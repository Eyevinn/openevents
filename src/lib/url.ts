/**
 * Returns the public-facing base URL of the application at runtime.
 *
 * OSC maps the service config field `siteUrl` to the env var `SITE_URL`.
 * This function must be called inside request handlers (not at module level)
 * so the value is read at runtime, not baked in at build time.
 */
export function getAppUrl(): string {
  return process.env.SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}
