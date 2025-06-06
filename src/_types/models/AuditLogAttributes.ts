export enum SourceType {
  USER = 'USER',
  CRON = 'CRON',
  SYSTEM = 'SYSTEM',
}

export enum Action {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export interface AuditLogAttributes {
  /**
   * The unique identifier of the audit log record.
   */
  id: string
  /**
   * The origin of the audit log entry. Either user-generated ("USER"),
   * generated by a cron task ("CRON"), or by the system during synchronous
   * operation ("SYSTEM").
   */
  source_type: SourceType
  /**
   * If the audit log entry was generated by a user action, this should be
   * the id of the user. Note that the user record may no longer exist if
   * the user has been deleted, in which case the user record may be
   * re-constructed from the audit-log.
   */
  source_id?: string
  /**
   * The table that was modified.
   */
  table_name: string
  /**
   * The id of the record that was modified.
   */
  table_row_id: string
  /**
   * The type of action taken, i.e. "CREATE", "UPDATE", or "DELETE".
   */
  action: Action
  /**
   * When the action occurred.
   */
  timestamp: Date
  /**
   * A map of the values before they changed.
   */
  previous_values?: Record<string, any>
  /**
   * A map of the newly changed values.
   */
  updated_values: Record<string, any>
  /**
   * An optional transaction id to correlate multiple audit logs together.
   */
  transaction_id?: string

  //
  // Relations
  //
  /**
   * The ID of the request associated with the audit log entry.
   */
  request_id?: number
  /**
   * The ID of the system associated with the audit log entry.
   */
  system_id?: number
  /**
   * The ID of the processing activity associated with the audit log entry.
   */
  processing_activity_id?: number
}
