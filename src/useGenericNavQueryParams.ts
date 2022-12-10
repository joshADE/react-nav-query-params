import { useMemo, createContext, useContext, useCallback } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

function isIsoDate(str: string) {
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
    const d = new Date(str); 
    return d instanceof Date && !isNaN(Number(d.toISOString())) && d.toISOString()===str; // valid date 
}

export type SimpleRouteParamPropertyType = string | number | bigint | boolean | null;

export function simpleTypeConvert(stringRouteValue :string, sample :unknown) {
    switch(typeof sample){
        case "number":
            const numberValue = Number(stringRouteValue);
            if (numberValue !== null && numberValue !== undefined && !isNaN(numberValue)) {
                return numberValue;
            }
        case "bigint":
            try {
                const bigIntValue = BigInt(stringRouteValue);
                if (bigIntValue !== null && bigIntValue !== undefined && typeof bigIntValue === "bigint") {
                    return bigIntValue;
                }
            } catch (e) {}
        case "boolean":
            return stringRouteValue === "true";
        case "string":
            if (stringRouteValue === "null" || stringRouteValue === "undefined"){
                return null;
            }
            return stringRouteValue;
        default:
        }
        return null;
}

export type EncodingMapValue<T, O> = {
    encode: (value: T, options?: O) => string;
    decode: (value: string, sampleSimpleValue: unknown, options?: O) => T;
    defaultValue?: T;
}
export type ComplexEncodingKeyToTypeMapping = {
    "array": Array<SimpleRouteParamPropertyType>;
    "record": Record<string, SimpleRouteParamPropertyType>;
    "date": Date;
}

export type ComplexEncodingKey = keyof ComplexEncodingKeyToTypeMapping;

export type ComplexEncodingOptions<T extends ComplexEncodingKey> = Partial<{[key in T]: unknown}> & {
    "array": { itemSeperator: string; }
    "record": { keyValueSeperator: string; objectStartSeparator: string; objectEndSeperator: string; entrySeperator: string }
    "date": { hyphenSeperator: string; }
}

export const EncodingMap : {[key in ComplexEncodingKey]: EncodingMapValue<ComplexEncodingKeyToTypeMapping[key], Partial<ComplexEncodingOptions<key>> >} = {
    "array": {
        encode: (value, options) => {
            return value.join(options?.["array"]?.itemSeperator ?? ",");
        },
        decode: (value, sampleSimpleValue, options) => {
            return value.split(options?.["array"]?.itemSeperator ?? ",").map(v => simpleTypeConvert(v, sampleSimpleValue));
        },
        defaultValue: []
    },
    "record": {
        encode: (value, options) => {
            const newObject = Object.fromEntries(Object.entries(value as object).map(([k, v]) => ([k, String(v)])));
            const objectStartSeparator = options?.["record"]?.objectStartSeparator ?? "<";
            const objectEndSeperator = options?.["record"]?.objectEndSeperator ?? ">";
            const entrySeperator = options?.["record"]?.entrySeperator ?? ",";
            const keyValueSeperator = options?.["record"]?.keyValueSeperator ?? ":";
            const encoded = objectStartSeparator + Object.entries(newObject).map(([k, v]) => (`${k}${keyValueSeperator}${v}`)).join(entrySeperator) + objectEndSeperator; // { result }
            return encoded;
        },
        decode: (value, sampleSimpleValue, options) => {
            const objectStartSeparator = options?.["record"]?.objectStartSeparator ?? "<";
            const objectEndSeperator = options?.["record"]?.objectEndSeperator ?? ">";
            const entrySeperator = options?.["record"]?.entrySeperator ?? ",";
            const keyValueSeperator = options?.["record"]?.keyValueSeperator ?? ":";
            let trimmed = value.startsWith(objectStartSeparator) ? value.slice(objectStartSeparator.length, value.length) : value;
            trimmed = trimmed.endsWith(objectEndSeperator) ? trimmed.slice(0, trimmed.length - objectEndSeperator.length) : trimmed;
            const entries = trimmed.split(entrySeperator);
            const newObject = Object.fromEntries(entries.map(s => { 
                const splitEntry = s.split(keyValueSeperator);
                const len = splitEntry.length;
                if (len >= 2){
                    return [splitEntry[0], simpleTypeConvert(splitEntry[1], sampleSimpleValue)];
                }else {
                    return [splitEntry[0], null];
                }
            }));
            return newObject;

        },
        defaultValue: {}
    },
    "date": {
        defaultValue: new Date(),
        encode: (value, options) => {
            const hyphenSeperator = options?.["date"]?.hyphenSeperator ?? "-";
            return value.toISOString().replace("-", hyphenSeperator);
        },
        decode: (value, sampleSimpleValue, options) => {
            const hyphenSeperator = options?.["date"]?.hyphenSeperator ?? "-";
            const newValue = value.replace(hyphenSeperator, "-");
            return (sampleSimpleValue) ? isIsoDate(newValue) ? new Date(newValue) : EncodingMap.date.defaultValue ?? new Date() : sampleSimpleValue as Date;
        },
    }
}

// Record<string, ValidRouteParamPropertyType> | Array<ValidRouteParamPropertyType> | Date;
export type ComplexRouteParamPropertyType = ComplexEncodingKeyToTypeMapping[keyof ComplexEncodingKeyToTypeMapping];

export type ValidRouteParamPropertyType = SimpleRouteParamPropertyType | ComplexRouteParamPropertyType;

type FilterInvalidProperty<S> = {
    [key in keyof S]: S[key] extends ValidRouteParamPropertyType ? key : never;
}[keyof (S)];

export type GetValueTypeOfKeyProperty<S, T extends keyof S> = { [key in FilterInvalidProperty<S[T]>]: S[T][key] };


type SampleType<T, K extends keyof T> = Required<GetValueTypeOfKeyProperty<T, K>>;


export type RouteParamBaseType<T> = { 
    [key in keyof T]: {
        sample: SampleType<T, key>;
        programmaticNavigate?: boolean;
    }
};

export function activator<T>(routeMapping: RouteParamBaseType<T>) {
    return routeMapping;
}

export type EncodingMapType = typeof EncodingMap;

export type RouteMappingGlobalOptions = {
    programmaticNavigate?: boolean;
}

export type RouteMappingConfiguration = {
    encodingMap?: Partial<EncodingMapType>;
    encodingOptions?: Partial<ComplexEncodingOptions<ComplexEncodingKey>>;
}

export type QueryStringOptions = {
    full?: boolean;
    replaceAllParams?: boolean;

}



let loadedByUser = true; 
export default <T>(routeMapping: RouteParamBaseType<T>, initialOptions: RouteMappingGlobalOptions = {}, configurations: RouteMappingConfiguration = {}) => {
    const NavQueryContext = createContext<Partial<RouteMappingGlobalOptions>>(initialOptions);

    const encodingMap = {...EncodingMap, ...configurations.encodingMap };
    const encodingOptions = configurations.encodingOptions;

    const initialize = () => {
        // console.log("from: ",loadedByUser);
        loadedByUser = false;
        // console.log("to: ",loadedByUser);
    }

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


    const useNavQueryParams = <K extends keyof T>(key: K) => {
        const [_, setSearchParams] = useSearchParams();
        const { search } = useLocation();

        const currentOptions = useContext(NavQueryContext);

        const overridedOptions = {
            ...initialOptions,
            ...currentOptions
        };

        const {
            programmaticNavigate
        } = overridedOptions;


        const ignoreQueryParams = useMemo(() => {
           const allowOnlyNavigateProgrommatically = routeMapping[key].programmaticNavigate ?? programmaticNavigate ?? false;
           return loadedByUser && allowOnlyNavigateProgrommatically;
        }, [programmaticNavigate, routeMapping[key].programmaticNavigate, loadedByUser]);

        const query = useMemo(() => new URLSearchParams(search), [search]);

        const getQueryString = useCallback((newParams: Partial<GetValueTypeOfKeyProperty<T, K>>, options: QueryStringOptions = {}) => {
            let result = options?.full ? "?": "";

            const params = new URLSearchParams(options?.replaceAllParams ? {} : query);

            Object.entries(newParams).forEach(([key, value]) => {
                const type = typeof value;
                if (["string", "number", "bigint", "boolean"].includes(type)){
                    params.set(key, String(value));
                }else  if (Array.isArray(value)){
                    // array of above types
                    params.set(key, encodingMap["array"].encode(value as ComplexEncodingKeyToTypeMapping["array"], encodingOptions));
                }else if (value instanceof Date){
                    const d = new Date(value as Date);
                    params.set(key, encodingMap["date"].encode(d as ComplexEncodingKeyToTypeMapping["date"], encodingOptions));
                }else if (value === undefined || value === null){
                    result = "null";
                }else{
                    // record with values as the above types
                    // provide default encoding
                    params.set(key, encodingMap["record"].encode(value as ComplexEncodingKeyToTypeMapping["record"], encodingOptions));
                }
                
            });
            result += params.toString();
            return result;
        }, []);

        const getQueryParams = useCallback(() : Partial<GetValueTypeOfKeyProperty<T, K>> => {
            if (ignoreQueryParams){
                return {};
            }

            let result: Partial<GetValueTypeOfKeyProperty<T, K>> = {};
            const params = new URLSearchParams(query);
            Object.entries(routeMapping[key].sample).forEach(([key, value]) => {
                const stringRouteValue = params.get(key);
                if (stringRouteValue) {
                    // check if simple type
                    const output = simpleTypeConvert(stringRouteValue, value);
                    if (output !== null){
                        result[key] = output;
                        return;
                    }
                    // check if advanced type
                    const type = typeof value;
                    
                    if (Array.isArray(value)){
                        // array of above types
                        const sampleSimpleValue = value.length > 0 ? value[0] : "sample";
                        result[key] = encodingMap["array"].decode(stringRouteValue, sampleSimpleValue, encodingOptions);
                        return;
                    }else if (value instanceof Date){
                        result[key] = encodingMap["date"].decode(stringRouteValue, value, encodingOptions);
                        return;
                    } else if (type === "object" && stringRouteValue !== "null" && stringRouteValue !== "undefined"){
                        // record with values as the above types
                        // provide default encoding
                        const sampleSimpleValues = Object.values(value as Object);
                        const sampleSimpleValue = sampleSimpleValues.length > 0 ? sampleSimpleValues[0] : "sample";
                        result[key] = encodingMap["record"].decode(stringRouteValue, sampleSimpleValue, encodingOptions);
                        return;
                    } else {
                        return null;
                    }
                }
                return null;
            });
            return result;
        }, [ignoreQueryParams]);

        const clearQueryParams = useCallback(() => {
            setSearchParams(oldParams => {
                const params = new URLSearchParams(oldParams);
                Object.keys(routeMapping[key].sample).forEach((key) => {
                    params.delete(key);
                });
                return params;
            })
        }, []);

        const getRouteMapping = useCallback(() => {
            return routeMapping[key];
        }, [])

        return {
            getQueryString,
            getQueryParams,
            clearQueryParams,
            getRouteMapping
        };
    }

    return {
        NavQueryContext,
        useNavQueryParams
    };

}