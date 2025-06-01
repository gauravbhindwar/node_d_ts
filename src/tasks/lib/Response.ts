import { Notice } from "@/_types/models/common/Response";

export interface TaskResponse {
  //
  // Opaque error management
  //
  /**
   * Whether or not the task concluded successfully. True if successful, false
   * otherwise.
   */
  ok: boolean
  /**
   * Whether or not the task concluded successfully. True if successful, false
   * otherwise.
   */
  success: boolean
  /**
   * Whether or not the task failed execution. True if a problem occurred,
   * false otherwise.
   */
  error: boolean

  //
  // Detailed error management
  //
  /**
   * A list of warnings or issues that arose during the request that did not
   * prevent the request from completing.
   */
  warnings?: Notice[]
  /**
   * A list of errors that arose during the request that prevented the proper
   * completion of the request.
   */
  errors?: Notice[]

  message: string
}
