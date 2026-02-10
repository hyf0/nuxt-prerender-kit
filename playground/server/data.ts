/**
 * Example server-only data module.
 * This should be tree-shaken from the client bundle when used with usePrerenderData.
 */
export function getData() {
  console.log('[server] getData called - this should only appear during prerender')
  return {
    message: 'Hello from server!',
    timestamp: new Date().toISOString(),
  }
}
