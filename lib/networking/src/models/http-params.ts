export type HttpParamValue = string | number | boolean;

export type HttpParams = Record<
  string,
  HttpParamValue | readonly HttpParamValue[]
>;
