export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
export type EndpointParamTypes  = Record<string, string | number | boolean>;

export type EndpointDefinition = {
  method?: HttpMethod
  children?: ApiDefinition
};

export type ApiDefinition = {
  [key: string]: EndpointDefinition | ApiDefinition
};

export type EndpointFor<T extends ApiDefinition, Path extends string = ""> = {
  [K in keyof T]:
  T[K] extends { method: HttpMethod }
  ? EndpointWithMethod<Path, K & string, T[K]["method"]> &
  (T[K]["children"] extends ApiDefinition ? EndpointFor<T[K]["children"], BuildPath<Path, K & string>> : object)
  : T[K] extends ApiDefinition
  ? EndpointFor<T[K], BuildPath<Path, K & string>>
  : never
};

export type BuildPath<Base extends string, Part extends string> =
  Base extends "" ? `/api/${KebabCase<Part>}` : `${Base}/${KebabCase<Part>}`;

export type KebabCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? "-" : ""}${Lowercase<T>}${KebabCase<U>}`
  : S;

export type EndpointWithMethod<Base extends string, Part extends string, M extends HttpMethod> = {
  toString: () => BuildPath<Base, Part>
  method: M
  query: (params: EndpointParamTypes) => string
};