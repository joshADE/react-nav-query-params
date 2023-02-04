export type SimpleRouteParamPropertyType =
  | string
  | number
  | bigint
  | boolean
  | null;

export type EncodingMapValue<T> = {
  encode: (value: T) => string;
  decode: (value: string, sampleSimpleValue: unknown) => T;
  defaultValue?: T;
};
export type ComplexEncodingKeyToTypeMapping = {
  array: Array<SimpleRouteParamPropertyType>;
  record: Record<string, SimpleRouteParamPropertyType>;
  date: Date;
};

export type ComplexEncodingKey = keyof ComplexEncodingKeyToTypeMapping;

// export type ComplexEncodingOptions<T extends ComplexEncodingKey> = Partial<{
//   [key in T]: unknown;
// }> & {
//   array: { itemSeperator: string };
//   record: {
//     keyValueSeperator: string;
//     objectStartSeparator: string;
//     objectEndSeperator: string;
//     entrySeperator: string;
//   };
//   date: { hyphenSeperator: string; colonSeperator: string };
// };

export type TypeMapValue<T> = {
  deafultValue?: T;
  encodingMap: EncodingMapValue<T>;
  category: "simple" | "complex" | "custom";
  sample: T;
  match: (value: unknown) => boolean;
  matchPriority?: number;
};

export type TypeKeyToTypeMapping = {
  // simple types
  string: string;
  number: number;
  bigint: bigint;
  boolean: boolean;
  // null: null;

  // complex types
  // array types
  stringArray: string[];
  numberArray: number[];
  bigintArray: bigint[];
  booleanArray: boolean[];
  // nullArray: null[];
  // record types
  stringRecord: Record<string, string>;
  numberRecord: Record<string, number>;
  bigintRecord: Record<string, bigint>;
  booleanRecord: Record<string, boolean>;
  // nullRecord: Record<string, null>;
  // date
  date: Date;
};

export type ValidRouteParamPropertyTypeKeys = keyof TypeKeyToTypeMapping;


// Record<string, ValidRouteParamPropertyType> | Array<ValidRouteParamPropertyType> | Date;
export type ComplexRouteParamPropertyType = ComplexEncodingKeyToTypeMapping[keyof ComplexEncodingKeyToTypeMapping];

export type ValidRouteParamPropertyType = SimpleRouteParamPropertyType | ComplexRouteParamPropertyType;

type FilterInvalidProperty<S, C extends {} = {}> = {
  [key in keyof S]: S[key] extends (TypeKeyToTypeMapping[ValidRouteParamPropertyTypeKeys] | C[keyof C])
    ? key
    : never;
}[keyof S];

export type GetValueTypeOfKeyProperty<S, T extends keyof S, C extends {} = {}> = { [key in FilterInvalidProperty<S[T], C>]: S[T][key] };

// export type MapKeyPropertyToTypeKey<S, T extends keyof S> = {
//   [key in FilterInvalidProperty<S[T]>]: ValidRouteParamPropertyTypeKeys;
// };


export type GetTypeKeyOfValueType<
  S,
  T extends keyof S,
  K extends keyof S[T]
> = {
  [key in ValidRouteParamPropertyTypeKeys]: S[T][K] extends TypeKeyToTypeMapping[key]
    ? key
    : never;
}[keyof TypeKeyToTypeMapping];

export type GetTypeKeyOfCustomValueType<
  S,
  T extends keyof S,
  K extends keyof S[T],
  C extends {} = {}
> = {
  [key in keyof C]: S[T][K] extends C[key]
    ? key
    : never;
}[keyof C];

type TypeKeyMapping<T, K extends keyof T, C extends {} = {}> = {
  [key in keyof T[K]]:
    | GetTypeKeyOfValueType<T, K, key>
    | GetTypeKeyOfCustomValueType<T, K, key, C>;
};

export type RouteParamBaseTypeValue<T, K extends keyof T, C extends {} = {}> = {
  typeKeyMapping: TypeKeyMapping<T, K, C>;
  programmaticNavigate?: boolean;
};

export type RouteParamBaseType<T, C extends {} = {}> = { 
    [key in keyof T]: RouteParamBaseTypeValue<T, key, C>;
};

export function activator<T extends {}, C extends {} = {}>(routeMapping: RouteParamBaseType<T, C>) {
  return routeMapping;
}

export type RouteMappingGlobalOptions = {
  programmaticNavigate?: boolean;
};

export type RouteMappingCustomSetting<M extends {} = {}> = {
  customTypeKeyMapping: { [key in keyof M]: TypeMapValue<M[key]> };
};


export type ValidTypeMappingOverride = {
  [key in ValidRouteParamPropertyTypeKeys]?: Partial<EncodingMapValue<
    TypeKeyToTypeMapping[key]
  >>;
};

export type RouteMappingConfiguration = {
  validTypeEncodingMapOverride?: ValidTypeMappingOverride;
};

export type QueryStringOptions<
  T,
  K extends keyof T,
  C extends {},
  S extends keyof GetValueTypeOfKeyProperty<T, K, C>
> = {
  full?: boolean;
  replaceAllParams?: boolean;
  keyOrder?: Partial<Record<S, number>>;
};

export type ClearQueryParamsOptions<
  T,
  K extends keyof T,
  C extends {},
  S extends keyof GetValueTypeOfKeyProperty<T, K, C>,
> = {
  include?: S[];
  exclude?: S[];
};

export type ParsingErrorResultType<T, K extends keyof T, C extends {} = {}> = {
  [key in FilterInvalidProperty<T[K], C>]?: {
    expectedType: ValidRouteParamPropertyTypeKeys | keyof C;
    actualType: ValidRouteParamPropertyTypeKeys | keyof C;
    errorStringValue: string;
  };
};

export type GetQueryParamsOptions<T, K extends keyof T, C extends {} = {}> = {
  defaults?: { [key in FilterInvalidProperty<T[K], C>]?: T[K][key] };
  useDefault?: (FilterInvalidProperty<T[K], C>)[];
};

export type GetQueryParamsResult<T, K extends keyof T, C extends {} = {}> = {
  values: Partial<GetValueTypeOfKeyProperty<T, K, C>>;
  errors?: ParsingErrorResultType<T, K, C>;
};



