/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useMemo,
  createContext,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { validTypeMap } from "./data/data";
import {
  ClearQueryParamsOptions,
  GetQueryParamsResult,
  GetValueTypeOfKeyProperty,
  ParsingErrorResultType,
  QueryStringOptions,
  RouteMappingGlobalOptions,
  RouteParamBaseType,
  RouteMappingCustomSetting,
  RouteMappingConfiguration,
  GetQueryParamsOptions,
  FilterInvalidParamKeys,
  QueryStringParams,
  TypeKeyOptionsMapping,
  TKeyMapper,
  ExtractValueFromMapperTuple,
  TBaseType,
  MapperType,
  TypeKeyMappingValueInit,
} from "./types/types";
import { findTypeKeyOfString } from "./utils/utils";
import {
  TypeKeyToTypeMapping,
  ValidQueryParamPropertyTypeKeys,
  CustomOptionsTypeValue,
  CustomTypeKeysMap,
  CustomTypeKeysMapDefault,
} from "./types/typeKeys";

let loadedByUser = true;


export default <
  TCustomKeysDefinition extends CustomTypeKeysMap = CustomTypeKeysMapDefault,
  TCustomKeyOptions extends CustomOptionsTypeValue<TCustomKeysDefinition> = CustomOptionsTypeValue<TCustomKeysDefinition>,
>(
  customSettings: RouteMappingCustomSetting<TCustomKeysDefinition, TCustomKeyOptions>
) => {
  type PossibleKeys = keyof TCustomKeysDefinition | keyof TypeKeyToTypeMapping;


  type PossibleValueTypes =
    | TCustomKeysDefinition[keyof TCustomKeysDefinition]
    | TypeKeyToTypeMapping[keyof TypeKeyToTypeMapping];


  type TType<U> = {
    [routeKey in keyof U]?: {
      [paramKey in keyof U[routeKey]]?: PossibleValueTypes;
    };
  };


  type TTypeKeys<U extends TBaseType<U, PossibleKeys, TCustomKeysDefinition, TCustomKeyOptions>> = {
    [routeKey in keyof U]: {
      [paramKey in keyof U[routeKey]["typeKeyMapping"]]: TDefaultValue<U[routeKey]["typeKeyMapping"][paramKey]>;
    };
  };


  type TDefault<U extends TBaseType<U, PossibleKeys, TCustomKeysDefinition, TCustomKeyOptions>> = {
    [routeKey in keyof U]:
    {
      programmaticNavigate?: boolean,
      typeKeyMapping: {
          [paramKey in keyof TBaseType<U, PossibleKeys,TCustomKeysDefinition, TCustomKeyOptions>[routeKey]["typeKeyMapping"]]: PossibleKeys;
      };
      options?:  TypeKeyOptionsMapping<
          { [key in keyof U[routeKey]["typeKeyMapping"]]:
            ExtractValueFromMapperTuple<
              TKeyMapper<U>,
              routeKey,
              key
            >
          },
          TCustomKeysDefinition,
          TCustomKeyOptions>
    }
  };

  type TOptions<
    N, U extends MapperType<N>
    > = {
      [routeKey in keyof (U)]:{
        options?: 
        TypeKeyOptionsMapping<
            { [key in keyof (U)[routeKey]["typeKeyMapping"]]:
              ExtractValueFromMapperTuple<
                TKeyMapper<TypeKeyMappingValueInit<N, U>>,
                routeKey,
                key
              >
            },
            TCustomKeysDefinition,
            TCustomKeyOptions>      
      }
    };

  type TDefaultValue<U> = U extends keyof TCustomKeysDefinition
    ? TCustomKeysDefinition[U]
    : U extends keyof TypeKeyToTypeMapping
    ? TypeKeyToTypeMapping[U]
    : never;


  const activator = <
    N extends TType<N> = any,
    Q extends TBaseType<any, PossibleKeys, TCustomKeysDefinition, TCustomKeyOptions> = TDefault<any>,
    S extends TTypeKeys<Q> = TTypeKeys<Q>,
    R extends TType<N> = TType<S>,
    T extends TType<any> = TType<any> extends N ? S : N,
    I extends RouteParamBaseType<any, TCustomKeysDefinition, TCustomKeyOptions, any> = RouteParamBaseType<N, TCustomKeysDefinition, TCustomKeyOptions, Q>,
    V extends I = I, 
  >(
    v: Q & RouteParamBaseType<TType<any> extends N ? R : N, TCustomKeysDefinition, TCustomKeyOptions, TType<any> extends N ? Q : I> 
    & TOptions<N, TType<any> extends N ? Q : V>
  ) => {
    return v as unknown as RouteParamBaseType<T, TCustomKeysDefinition, TCustomKeyOptions>;
  };


  const untypedActivator = <S extends TBaseType<any, PossibleKeys, TCustomKeysDefinition, TCustomKeyOptions> = TDefault<any>, T extends TTypeKeys<any> = TTypeKeys<S>>(
    v: S
  ) => {
    return v as unknown as RouteParamBaseType<T, TCustomKeysDefinition, TCustomKeyOptions>;
  }

  const activatorOld = <
    N extends TType<N> = any,
    Q extends TBaseType<any, PossibleKeys, TCustomKeysDefinition, TCustomKeyOptions> = TDefault<any>,
    S extends TTypeKeys<Q> = TTypeKeys<Q>,
    R extends TType<N> = TType<S>,
    T extends TType<any> = TType<any> extends N ? S : N
  >(
    v: Q & RouteParamBaseType<R, TCustomKeysDefinition, TCustomKeyOptions>
  ) => {
    return v as unknown as RouteParamBaseType<T, TCustomKeysDefinition, TCustomKeyOptions>;
  };

  const creator = <T extends TType<T>>(
    routeMapping: RouteParamBaseType<T, TCustomKeysDefinition, TCustomKeyOptions>,
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
              const { defaultValue, decode, encode, encodingOptions } = overrides;
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
                value.defaultValue = defaultValue;
              }

              if (encodingOptions !== null && encodingOptions !== undefined) {
                value.encodingMap.encodingOptions = encodingOptions;
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
          newParams: QueryStringParams<T, TInputRouteKey, TCustomKeysDefinition>,
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
          let paramsToEncode = Object.entries(newParams) as [
            InputParamKey,
            unknown
          ][];

          // removing the new params with undefined type
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          paramsToEncode = paramsToEncode.filter(([_, value]) => {
            return value !== undefined;
          });

          paramsToEncode.sort(([keyA], [keyB]) => {
            const orderA = (keyOrders as any)[keyA] ?? 0;
            const orderB = (keyOrders as any)[keyB] ?? 0;
            return orderA - orderB;
          });

          const routeProps = routeMapping[routeKey];
          const tyepKeyMapping = routeProps.typeKeyMapping;
          const routeOptions = routeProps.options;

          paramsToEncode.forEach(([paramKey, value]) => {
            const typeKey =
              tyepKeyMapping[paramKey as keyof typeof tyepKeyMapping];

            if (typeKey === "unknown" || typeKey === undefined) {
              return;
            }

            const typeKeyProps = possibleTypeMap[typeKey as keyof typeof possibleTypeMap] as any;
            if (typeKeyProps !== undefined) {
              const typedValue = value as any;
              // removing new params with null value
              if (value === null) {
                params.delete(paramKey.toString());
              } else {
                const paramOptions = routeOptions?.[paramKey as keyof typeof routeOptions];
                const values = typeKeyProps.encodingMap.encode(typedValue, paramOptions ?? typeKeyProps.encodingMap.encodingOptions);
                if (Array.isArray(values)) {
                  params.delete(paramKey.toString());
                  values.forEach((value) => {
                    params.append(
                      paramKey.toString(),
                      value.toString()
                    );
                  });
                } else {
                  params.set(paramKey.toString(), values.toString());
                }
              }
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

          const result: Partial<
            GetValueTypeOfKeyProperty<T, TInputRouteKey, TCustomKeysDefinition>
          > = {};
          const errors: ParsingErrorResultType<
            T,
            TInputRouteKey,
            TCustomKeysDefinition
          > = {};
          const params = new URLSearchParams(query);
          const routeOptions = routeMapping[key].options;
          Object.entries(routeMapping[key].typeKeyMapping).forEach(
            ([key, typeKeyValue]) => {
              const stringRouteValues = params.getAll(key);

              const typedParamKey = key as keyof typeof result;

              if (stringRouteValues.length > 0) {
                const typeKey = typeKeyValue as
                  | ValidQueryParamPropertyTypeKeys
                  | keyof TCustomKeysDefinition;

                const stringRouteValue = stringRouteValues[0];

                const typeKeyProps = possibleTypeMap[typeKey];

                if (typeKeyProps !== undefined) {
                  try {
                    const options = typeKeyProps.encodingMap.encodingOptions as any;
                    const decode = typeKeyProps.encodingMap.decode as any;
                    const paramOptions = routeOptions?.[key as keyof typeof routeOptions];
                    result[typedParamKey] = decode ? decode(
                      stringRouteValues.length > 1 ? stringRouteValues : stringRouteValue,
                      paramOptions ?? options
                    ) : undefined;
                  } catch (e) {
                    // failed to decode, probably because wrong type recieved from query string
                    if (useDefualtValuesMap[typedParamKey]) {
                      const deafultValue = options?.defaults;
                      result[typedParamKey] = deafultValue
                        ? (deafultValue as { [key in string]: any })[
                        typedParamKey as string
                        ]
                        : typeKeyProps.defaultValue;
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
          let clearMap: { [key in FilterInvalidParamKeys<
            T[TInputRouteKey],
            TCustomKeysDefinition
          >]?: boolean } = {};

          let shouldFilter = false;

          if (!options?.include && options?.exclude) {
            shouldFilter = true;
            clearMap = Object.keys(routeMapping[key].typeKeyMapping).reduce(
              (sum, k) => ({ ...sum, [k]: true }),
              clearMap
            );
          }

          if (options?.include) {
            shouldFilter = true;
            clearMap = (options?.include as any[] | undefined)?.reduce(
              (sum, k) => ({ ...sum, [k]: true }),
              clearMap
            );
          }

          if (options?.exclude) {
            shouldFilter = true;
            clearMap = (options?.exclude as any[] | undefined)?.reduce(
              (sum, k) => ({ ...sum, [k]: false }),
              clearMap
            );
          }

          const params = new URLSearchParams(query);

          const clearingParamKeys = Object.keys(!shouldFilter ? routeMapping[key].typeKeyMapping : clearMap);
          const currentParamKeys = Array.from(Object.keys(params));

          const setUnion = currentParamKeys.filter(x => clearingParamKeys.includes(x));

          if (setUnion.length === 0) {
            // no params to clear
            return;
          }

          clearingParamKeys.forEach((key) => {
            const typedParamKey = key as InputParamKey;
            if (!shouldFilter || (shouldFilter && clearMap[typedParamKey])) {
              params.delete(key);
            }
          });
          const stringParams = params.toString();
          if (options.behavior === "push") {
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
    untypedActivator,
    activatorOld,
  };
};
