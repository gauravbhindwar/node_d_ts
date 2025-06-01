import { Request, Response } from "express";
import { flatten, unflatten } from "flat";
import _ from "lodash";

const formatErrorResponse = (input) => {
  const words = input.split(",");
  const formattedWords = words.map((word) => _.startCase(word.trim()));
  return formattedWords.join(",");
};

const generalResponse = (
  _req: Request,
  response: Response,
  data: any = [],
  message = "",
  response_type = "success",
  toast = false,
  statusCode = 200
) => {
  if (_.isArray(data) || _.isObject(data))
    data = sanitizeDateValuesInObject(data);
  if (statusCode !== 200) {
    return response.status(statusCode).send({
      responseData: data,
      message: message ? formatErrorResponse(message) : "",
      toast: toast,
      response_type: response_type,
    });
  }
  return response.status(statusCode).send({
    responseData: data,
    message: message ? _.startCase(message) : "",
    toast: toast,
    response_type: response_type,
  });
};

/**
 *
 * @param result any object
 * @returns object
 * This function remove problematic time component from date only values. It converts Date object to YYYY-MM-DD.
 * example of @db.Date column result 1995-05-17T00:00:00.000Z
 */
export function sanitizeDateValuesInObject(result: any): any {
  if (_.isArray(result))
    return result.map((r) => sanitizeDateValuesInObject(r));
  if (!_.isObject(result)) return result;
  result = flatten(result);
  result = _.mapValues(result, (value, _key) => {
    if (
      value instanceof Date &&
      value.toISOString().endsWith("T00:00:00.000Z")
    ) {
      return value;
    }
    if (_key.includes("Time")) {
      return value;
    }

    return value;
  });
  result = unflatten(result);
  return result;
}


export default generalResponse;
