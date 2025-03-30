import { API_CONFIG } from "@/constants";
import { ApiDefinition, EndpointFor, EndpointParamTypes } from "@/types";

const camelToKebab = (str: string): string => 
    str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const createEndpoint = <T extends ApiDefinition>(config: T): EndpointFor<T> => {
  const handler = {
    get: (target: any, prop: string) => {
      // Converti ogni segmento del percorso in kebab-case
      const kebabProp = camelToKebab(prop);
      
      if (prop === "toString") {
        return () => target.method ? `${camelToKebab(target.path)}.php` : camelToKebab(target.path);
      }
      
      if (prop === "query") {
        return (params: EndpointParamTypes) => {
          const basePath = target.method ? `${camelToKebab(target.path)}.php` : camelToKebab(target.path);
          const query = new URLSearchParams();
          for (const [key, value] of Object.entries(params)) {
            if (value !== undefined) query.append(key, value.toString());
          }
          return `${basePath}?${query}`;
        };
      }

      const currentConfig = target.config[prop];
      const newPath = `${target.path}/${kebabProp}`;

      return new Proxy(
        {
          path: newPath,
          method: currentConfig?.method,
          config: currentConfig,
        },
        handler
      );
    },
  };

  return new Proxy(
    { 
      path: "/api",
      method: undefined, 
      config: config, 
    },
    handler
  ) as any;
};

export const api = createEndpoint(API_CONFIG);