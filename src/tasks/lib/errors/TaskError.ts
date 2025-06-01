import { IS_DEVELOPMENT } from '../../../settings';
import { TaskResponse } from '../Response';
import { ErrorCatalogueReturnValue } from './catalogue';

export class TaskError extends Error {
  code: string;

  constructor(code: string, data: ErrorCatalogueReturnValue) {
    super(data.message);
    Object.assign(this, data);
    this.code = code;
  }

  raw(): TaskResponse {
    return {
      ok: false,
      success: false,
      error: true,
      message: this.message,
      ...(IS_DEVELOPMENT ? { stack: this.stack } : {}),
    };
  }
}
