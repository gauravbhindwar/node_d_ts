import { catalogue, ErrorCatalogueKey } from './catalogue';
import { TaskError } from './TaskError';

export const buildError = <E extends ErrorCatalogueKey>(code: E, ...args: Parameters<typeof catalogue[E]>) => (
  new TaskError(code, catalogue[code].apply(null, args))
);
