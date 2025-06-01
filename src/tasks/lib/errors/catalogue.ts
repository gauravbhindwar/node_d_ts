/**
 * A catalogue of known errors which may be used when constructing an error
 * type to pass to the client.
 */
export const catalogue = {
  request_not_found: (request_id: number) => ({
    description: `Request with id "${request_id}" could not be found`,
    message: `Request with id "${request_id}" could not be found`,
  }),
  task_not_found: (task_id) => ({
    description: `Task with id "${task_id}" could not be found`,
    message: `Task with id "${task_id}" could not be found`,
  }),
  system_not_found: (system_id: number) => ({
    description: `System could not be found for task with id "${system_id}"`,
    message: `System could not be found for task with id "${system_id}"`,
  }),
  integration_not_found: (task_id: number, system_id: number) => ({
    description: `Integration not found for task with id "${task_id}" (system: "${system_id}")`,
    message: `Integration not found for task with id "${task_id}" (system: "${system_id}")`,
  }),
  event_not_supported: (integration_name: string, event_name: string) => ({
    description: `Integration "${integration_name}" does not support the "${event_name}" event`,
    message: `Integration "${integration_name}" does not support the "${event_name}" event`,
  }),
  no_result: (integration_name: string) => ({
    description: `No result returned from integration ${integration_name}`,
    message: `No result returned from integration ${integration_name}`,
  }),
  integration_error: (integration_name: string, errors: any[]) => ({
    description: `One or more errors occurred when calling the ${integration_name} integration`,
    message: `One or more errors occurred when calling the ${integration_name} integration`,
    errors,
  }),
};

export type ErrorCatalogueKey = keyof typeof catalogue;
export type ErrorCatalogueReturnValue = { message: string; description: string };
export type ErrorCatalogueFunction = (...args: any) => ErrorCatalogueReturnValue;
