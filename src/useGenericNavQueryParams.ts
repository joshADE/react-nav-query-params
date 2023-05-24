import {
  useMemo,
  createContext,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { validTypeMap } from "./data";
import {
  ClearQueryParamsOptions,
  GetQueryParamsResult,
  GetValueTypeOfKeyProperty,
  ParsingErrorResultType,
  QueryStringOptions,
  RouteMappingGlobalOptions,
  RouteParamBaseType,
  ValidQueryParamPropertyTypeKeys,
  RouteMappingCustomSetting,
  RouteMappingConfiguration,
  activator as untypedActivator,
  GetQueryParamsOptions,
  FilterInvalidParamKeys,
  TypeMapValue,
  // CleanQueryParamMapKeys,
  TypeKeyToTypeMapping,
  // InferTypeFromFromTypeKeys,
  // InferRouteParamBaseType,
  // RouteParamBaseTypeValue
} from "./types";
import { findTypeKeyOfString } from "./utils";

let loadedByUser = true;

export default <
  TCustomKeysDefinition extends { [customTypeKey: string]: any } = {}
>(
  customSettings: RouteMappingCustomSetting<TCustomKeysDefinition>
) => {
  type KeyType = string;
  type ValueType =
    | TCustomKeysDefinition[keyof TCustomKeysDefinition]
    | TypeKeyToTypeMapping[keyof TypeKeyToTypeMapping];
  type TType = {
    [routeKey in KeyType]?: { [paramKey in KeyType]?: ValueType };
  };
  type TDefault = { [routeKey in KeyType]?: { [paramKey in KeyType]?: any } };

  // type InferKey<G extends TType, H extends keyof G, I extends keyof G[H]> = {
  //   [routeKey in H]?: { [paramKey in I]?: any };
  // };

  // type ExcludeString<T> = T | Exclude<T, string>;
  // type ExcludeStringKeys<K1 extends string, K2 extends string, G extends TType<K1, K2>> = {
  //   [routeKey in ExcludeString<keyof G>]?: {
  //     [paramKey in ExcludeString<keyof G[routeKey]>]?: G[routeKey][paramKey];
  //   };
  // };

  const activator = <T extends TType = TDefault>(
    v: RouteParamBaseType<T, TCustomKeysDefinition>
  ) => {
    return untypedActivator<T, TCustomKeysDefinition>(v);
  };

  const creator = <T extends TType>(
    routeMapping: RouteParamBaseType<T, TCustomKeysDefinition>,
    initialOptions: RouteMappingGlobalOptions = {},
    configurations: RouteMappingConfiguration = {}
  ) => {
    const NavQueryContext =
      createContext<Partial<RouteMappingGlobalOptions>>(initialOptions);

    const validTypeMapWithOverrides =
      configurations?.validTypeEncodingMapOverride
        ? (Object.fromEntries(
            Object.entries(validTypeMap).map(([key, value]) => {
              const typeKey = key as ValidQueryParamPropertyTypeKeys;
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

    const initialize = () => {
      // console.log("from: ",loadedByUser);
      loadedByUser = false;
      // console.log("to: ",loadedByUser);
    };

    const useNavQueryParams = <TInputRouteKey extends keyof T>(
      key: TInputRouteKey
    ) => {
      type InputParamKey = FilterInvalidParamKeys<
        T[TInputRouteKey],
        TCustomKeysDefinition
      >;

      const currentOptions = useContext(NavQueryContext);

      const overridedOptions = {
        ...initialOptions,
        ...currentOptions,
      };

      const { adapter } = overridedOptions;

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

      useEffect(() => {
        initialize();
      }, []);

      if (!adapter) {
        throw new Error(
          "useNavQueryParams must be provided with an adapter in the context."
        );
      }

      const { search } = adapter.location;

      const query = useMemo(() => new URLSearchParams(search), [search]);

      const getQueryString = useCallback(
        (
          newParams: Partial<
            GetValueTypeOfKeyProperty<T, TInputRouteKey, TCustomKeysDefinition>
          >,
          options: QueryStringOptions<
            T,
            TInputRouteKey,
            TCustomKeysDefinition,
            FilterInvalidParamKeys<T[TInputRouteKey], TCustomKeysDefinition>
          > = {}
        ) => {
          let result = options?.full ? "?" : "";

          const params = new URLSearchParams(
            options?.replaceAllParams ? {} : query
          );

          const routeKey = key as TInputRouteKey;

          const keyOrders =
            options?.keyOrder ?? ({} as Record<InputParamKey, number>);
          const paramsToEncode = Object.entries(newParams) as [
            InputParamKey,
            unknown
          ][];

          paramsToEncode.sort(([keyA], [keyB]) => {
            const orderA = (keyOrders as any)[keyA] ?? 0;
            const orderB = (keyOrders as any)[keyB] ?? 0;
            return orderA - orderB;
          });

          const routeProps = routeMapping[routeKey];
          const tyepKeyMapping = routeProps.typeKeyMapping;

          paramsToEncode.forEach(([paramKey, value]) => {
            let typeKey =
              tyepKeyMapping[paramKey as keyof typeof tyepKeyMapping];

            if (typeKey === "unknown" || typeKey === undefined) {
              return;
            }

            const typeKeyProps = possibleTypeMap[typeKey] as TypeMapValue<any>;
            if (typeKeyProps !== undefined) {
              const typedValue = value as any;
              params.set(
                paramKey.toString(),
                typeKeyProps.encodingMap.encode(typedValue)
              );
            }
          });
          result += params.toString();
          return result;
        },
        [query]
      );

      const getQueryParams = useCallback(
        (
          options: GetQueryParamsOptions<
            T,
            TInputRouteKey,
            TCustomKeysDefinition
          > = {}
        ): GetQueryParamsResult<T, TInputRouteKey, TCustomKeysDefinition> => {
          if (ignoreQueryParams) {
            return { values: {} };
          }

          let useDefualtValuesMap = {} as {
            [key in FilterInvalidParamKeys<
              T[TInputRouteKey],
              TCustomKeysDefinition
            >]?: boolean;
          };
          if (options?.useDefault) {
            useDefualtValuesMap = (options.useDefault as string[]).reduce(
              (sum, curr) => ({ ...sum, [curr]: true }),
              useDefualtValuesMap
            );
          }

          // const routeKey = key as string;
          let result: Partial<
            GetValueTypeOfKeyProperty<T, TInputRouteKey, TCustomKeysDefinition>
          > = {};
          let errors: ParsingErrorResultType<
            T,
            TInputRouteKey,
            TCustomKeysDefinition
          > = {};
          const params = new URLSearchParams(query);
          Object.entries(routeMapping[key].typeKeyMapping).forEach(
            ([key, typeKeyValue]) => {
              const stringRouteValue = params.get(key);

              const typedParamKey = key as keyof typeof result;

              if (stringRouteValue) {
                const typeKey = typeKeyValue as
                  | ValidQueryParamPropertyTypeKeys
                  | keyof TCustomKeysDefinition;

                const typeKeyProps = possibleTypeMap[typeKey];
                if (typeKeyProps !== undefined) {
                  try {
                    result[typedParamKey] = typeKeyProps.encodingMap.decode(
                      stringRouteValue,
                      null
                    );
                  } catch (e) {
                    // failed to decode, probably because wrong type recieved from query string
                    if (useDefualtValuesMap[typedParamKey]) {
                      const deafultValue = options?.defaults;
                      result[typedParamKey] = deafultValue
                        ? (deafultValue as { [key in string]: any })[
                            typedParamKey as string
                          ]
                        : typeKeyProps.deafultValue;
                    } else {
                      (errors as { [key in string]: any })[
                        typedParamKey as string
                      ] = {
                        actualType: findTypeKeyOfString(
                          stringRouteValue,
                          possibleTypeMap
                        ),
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
        [ignoreQueryParams, query]
      );

      const clearQueryParams = useCallback(
        (
          options: ClearQueryParamsOptions<
            T,
            TInputRouteKey,
            TCustomKeysDefinition,
            FilterInvalidParamKeys<T[TInputRouteKey], TCustomKeysDefinition>
          > = {}
        ) => {
          const clearMap = {} as {
            [key in FilterInvalidParamKeys<
              T[TInputRouteKey],
              TCustomKeysDefinition
            >]?: boolean;
          };
          let shouldFilter = false;

          if (options?.include || options?.exclude) {
            shouldFilter = true;
            if (!options.include) {
              Object.keys(routeMapping[key].typeKeyMapping).reduce(
                (sum, k) => ({ ...sum, [k]: true }),
                clearMap
              );
            } else {
              (options.include as any[]).reduce(
                (sum, k) => ({ ...sum, [k]: true }),
                clearMap
              );
            }
            (options?.exclude as any[] | undefined)?.reduce(
              (sum, k) => ({ ...sum, [k]: false }),
              clearMap
            );
          }

          const params = new URLSearchParams(query);
          Object.keys(routeMapping[key].typeKeyMapping).forEach((key) => {
            const typedParamKey = key as InputParamKey;
            if (!shouldFilter || (shouldFilter && clearMap[typedParamKey])) {
              params.delete(key);
            }
          });
          const stringParams = params.toString();
          if (options.behaviour === "push") {
            adapter.pushLocation({ search: stringParams });
          } else {
            adapter.replaceLocation({ search: stringParams });
          }
        },
        [query]
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
