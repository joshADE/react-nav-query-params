import { useMemo, createContext, useContext, useCallback } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { validTypeMap } from "./data";
import {
  ClearQueryParamsOptions,
  GetQueryParamsResult,
  GetValueTypeOfKeyProperty,
  ParsingErrorResultType,
  QueryStringOptions,
  RouteMappingGlobalOptions,
  RouteParamBaseType,
  ValidRouteParamPropertyTypeKeys,
  RouteMappingCustomSetting,
  RouteMappingConfiguration,
  activator as untypedActivator,
  GetQueryParamsOptions,
} from "./types";
import { findTypeKeyOfString } from "./utils";

let loadedByUser = true;

export default <M extends {} = {}>(
  customSettings: RouteMappingCustomSetting<M>
) => {
  const activator = <T extends {}>(v: RouteParamBaseType<T, M>) => untypedActivator<T, M>(v);

  const creator = <T extends {}>(
    routeMapping: RouteParamBaseType<T, M>,
    initialOptions: RouteMappingGlobalOptions = {},
    configurations: RouteMappingConfiguration = {}
  ) => {
    const NavQueryContext =
      createContext<Partial<RouteMappingGlobalOptions>>(initialOptions);

    const validTypeMapWithOverrides =
      configurations?.validTypeEncodingMapOverride
        ? (Object.fromEntries(
            Object.entries(validTypeMap).map(([key, value]) => {
              const typeKey = key as ValidRouteParamPropertyTypeKeys;
              const typeMapOverride =
                configurations.validTypeEncodingMapOverride!;
              if (typeMapOverride[typeKey] !== undefined) {
                const overrides = typeMapOverride[typeKey]!;
                const { defaultValue, decode, encode } = overrides;
                if (
                  decode !== null &&
                  decode !== undefined &&
                  encode !== null &&
                  encode !== undefined
                ) {
                  value.encodingMap.decode = decode;
                  value.encodingMap.encode = encode;
                }
                if (defaultValue !== null && defaultValue !== undefined) {
                  value.deafultValue = defaultValue;
                }
              }
              return [typeKey, value];
            })
          ) as typeof validTypeMap)
        : validTypeMap;
    const possibleTypeMap = {
      ...(customSettings?.customTypeKeyMapping ?? {}),
      ...validTypeMapWithOverrides,
    };
    // const encodingOptions = configurations.encodingOptions;

    const initialize = () => {
      // console.log("from: ",loadedByUser);
      loadedByUser = false;
      // console.log("to: ",loadedByUser);
    };

    window.history.pushState = new Proxy(window.history.pushState, {
      apply: (target, thisArg, argArray) => {
        // trigger here what you need
        initialize();
        return target.apply(thisArg, argArray);
      },
    });
    window.history.replaceState = new Proxy(window.history.replaceState, {
      apply: (target, thisArg, argArray) => {
        // trigger here what you need
        initialize();
        return target.apply(thisArg, argArray);
      },
    });
    // auto-generating typekeys;

    // const typeKeys =
    // Object.fromEntries(Object.entries(routeMapping).map(([routeKey, paramMap]) => {
    //     const rK = routeKey as keyof T ;
    //     const map = paramMap as RouteParamBaseTypeValue<T, typeof rK>;
    //     return [rK, Object.fromEntries(Object.entries(map.sample).map(([paramKey, sampleValue]) => {
    //         const pK = paramKey as keyof T[typeof rK];
    //         return [pK, findTypeKey(sampleValue)];
    //     }))]
    // }));

    const useNavQueryParams = <K extends keyof T>(key: K) => {
      const [_, setSearchParams] = useSearchParams();
      const { search } = useLocation();

      const currentOptions = useContext(NavQueryContext);

      const overridedOptions = {
        ...initialOptions,
        ...currentOptions,
      };

      const { programmaticNavigate } = overridedOptions;

      const ignoreQueryParams = useMemo(() => {
        const allowOnlyNavigateProgrommatically =
          routeMapping[key].programmaticNavigate ??
          programmaticNavigate ??
          false;
        return loadedByUser && allowOnlyNavigateProgrommatically;
      }, [
        programmaticNavigate,
        routeMapping[key].programmaticNavigate,
        loadedByUser,
      ]);

      const query = useMemo(() => new URLSearchParams(search), [search]);

      const getQueryString = useCallback(
        (
          newParams: Partial<GetValueTypeOfKeyProperty<T, K, M>>,
          options: QueryStringOptions<
            T,
            K,
            M,
            keyof GetValueTypeOfKeyProperty<T, K, M>
          > = {}
        ) => {
          let result = options?.full ? "?" : "";

          const params = new URLSearchParams(
            options?.replaceAllParams ? {} : query
          );

          const routeKey = key as K;
          const keyOrders = options?.keyOrder ?? {};
          const paramsToEncode = Object.entries(newParams);

          paramsToEncode.sort(
            ([keyA], [keyB]) => keyOrders[keyA] ?? 0 - keyOrders[keyB] ?? 0
          );

          paramsToEncode.forEach(([paramKey, value]) => {
            
                let typeKey = routeMapping[routeKey].typeKeyMapping[paramKey];

                if (typeKey === "unknown") {
                    return;
                }

                const typeKeyProps = possibleTypeMap[typeKey];
                if (typeKeyProps !== undefined) {
                    params.set(
                      paramKey,
                      typeKeyProps.encodingMap.encode(value)
                    );
                }
            });
            result += params.toString();
          return result;
        },
        []
      );

      const getQueryParams = useCallback(
        (options: GetQueryParamsOptions<T, K, M> = {}): GetQueryParamsResult<T, K, M> => {
          if (ignoreQueryParams) {
            return { values: {} };
          }

          let useDefualtValuesMap = {};
          if (options?.useDefault){
            useDefualtValuesMap = options.useDefault.reduce((sum, curr) => ({...sum, [curr]: true}), useDefualtValuesMap);
          }

          // const routeKey = key as string;
          let result: Partial<GetValueTypeOfKeyProperty<T, K, M>> = {};
          let errors: ParsingErrorResultType<T, K, M> = {};
          const params = new URLSearchParams(query);
          Object.entries(routeMapping[key].typeKeyMapping).forEach(
            ([key, typeKeyValue]) => {
              const stringRouteValue = params.get(key);

              if (stringRouteValue) {
                const typeKey = typeKeyValue as
                  | ValidRouteParamPropertyTypeKeys
                  | keyof M; //typeKeys[routeKey][key];

                // if (typeKey === "unknown") {
                //   return;
                // }

                const typeKeyProps = possibleTypeMap[typeKey];
                if (typeKeyProps !== undefined) {
                  try {
                    result[key] = typeKeyProps.encodingMap.decode(
                      stringRouteValue,
                      null
                    );
                  } catch (e) {
                    // failed to decode, probably because wrong type recieved from query string
                    if (useDefualtValuesMap[key]){
                      const deafultValue = options?.defaults;
                      result[key] =
                        deafultValue ? deafultValue[key] : typeKeyProps.deafultValue;
                    }else{
                      errors[key] = {
                        actualType: findTypeKeyOfString(stringRouteValue, possibleTypeMap),
                        expectedType: typeKey,
                        errorStringValue: stringRouteValue,
                      };
                    }
                  }
                }
              }
              return;
            }
          );
          return { values: result, errors };
        },
        [ignoreQueryParams]
      );

      const clearQueryParams = useCallback(
        (
          options: ClearQueryParamsOptions<
            T,
            K,
            M,
            keyof GetValueTypeOfKeyProperty<T, K, M>
          > = {}
        ) => {
          const clearMap = {};
          let shouldFilter = false;

          if (options?.include || options?.exclude) {
            shouldFilter = true;
            if (!options.include) {
              Object.keys(routeMapping[key].typeKeyMapping).reduce(
                (sum, k) => ({ ...sum, [k]: true }),
                clearMap
              );
            } else {
              options.include.reduce(
                (sum, k) => ({ ...sum, [k]: true }),
                clearMap
              );
            }
            options?.exclude?.reduce(
              (sum, k) => ({ ...sum, [k]: false }),
              clearMap
            );
          }

          setSearchParams((oldParams) => {
            const params = new URLSearchParams(oldParams);
            Object.keys(routeMapping[key].typeKeyMapping).forEach((key) => {
              if (!shouldFilter || (shouldFilter && clearMap[key])) {
                params.delete(key);
              }
            });
            return params;
          });
        },
        []
      );

      const getRouteMapping = useCallback(() => {
        return routeMapping[key];
      }, []);

      return {
        getQueryString,
        getQueryParams,
        clearQueryParams,
        getRouteMapping,
      };
    };

    return {
      NavQueryContext,
      useNavQueryParams,
    };
  };

  return {
    activator,
    creator,
  };
};
  