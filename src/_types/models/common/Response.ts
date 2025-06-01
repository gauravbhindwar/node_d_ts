/**
 * Representation of an informational, warning, or error notice, typically
 * from a third-party service.
 */
export interface Notice {
  /**
   * A typically human-readable message giving a quick description of the issue
   */
  message: string
  /**
   * An optional status code, typically the HTTP status code (e.g. 401, 404,
   * etc)
   */
  status?: number
  /**
   * Some third-party services provide their own error codes, often in addition
   * to an HTTP status code. If so, store that code here
   */
  app_code?: string
  /**
   * An optional stacktrace object, useful for determining where and why an
   * error occurred
   */
  trace?: any
}
