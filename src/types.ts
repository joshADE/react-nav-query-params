// Guide: { [routeKey]: { [paramKey]: [typeKey] } } <- input of package used for determine type conversion
// ValidTypeKeys = keyof TypeKeyToTypeMapping(defined below)
// PossibleTypeKeys = ValidTypeKeys + CustomTypeKeys(defined by user of package)

export type EncodingMapValue<ParamType> = {
  encode: (value: ParamType) => string;
  decode: (value: string) => ParamType;
  defaultValue?: ParamType;
};

export type EncodingMapComplexValue<ParamType> = {
  encode: (value: ParamType) => string;
  decode: (value: string, sampleSimpleValue: unknown) => ParamType;
  defaultValue?: ParamType;
};

export type SimpleRouteParamPropertyType =
  | string
  | number
  | boolean
  | null;

export type ComplexEncodingKeyToTypeMapping = {
  array: Array<SimpleRouteParamPropertyType>;
  record: Record<string, SimpleRouteParamPropertyType>;
  date: Date;
};

export type ComplexEncodingKey = keyof ComplexEncodingKeyToTypeMapping;

export type TypeMapValue<ParamType> = {
  defaultValue?: ParamType;
  encodingMap: EncodingMapValue<ParamType>;
  category: "simple" | "complex" | "custom";
  match?: (value: unknown) => boolean;
  matchPriority?: number;
};

export type TypeKeyToTypeMapping = {
  // simple types
  string: string;
  number: number;
  boolean: boolean;

  // complex types
  // array types
  stringArray: string[];
  numberArray: number[];
  booleanArray: boolean[];
  // record types
  stringRecord: Record<string, string>;
  numberRecord: Record<string, number>;
  booleanRecord: Record<string, boolean>;
  // date
  date: Date;
};

export type ValidQueryParamPropertyTypeKeys = keyof TypeKeyToTypeMapping;

export type FilterInvalidParamKeys<
  TInputQueryParamToTypeMapping,
  TCustomTypeKeysDefinition extends TCustomType = {}
> = {
  [paramKey in keyof TInputQueryParamToTypeMapping]: TInputQueryParamToTypeMapping[paramKey] extends
    | TypeKeyToTypeMapping[ValidQueryParamPropertyTypeKeys]
    | TCustomTypeKeysDefinition[keyof TCustomTypeKeysDefinition]
    ? paramKey
    : never;
}[keyof TInputQueryParamToTypeMapping];

// input type for getting query string params function
export type QueryStringParams<
  TInputQueryParamMap,
  TInputRouteKey extends keyof TInputQueryParamMap,
  TCustomTypeKeysDefinition extends TCustomType = {}
> = {
  [key in FilterInvalidParamKeys<
    TInputQueryParamMap[TInputRouteKey],
    TCustomTypeKeysDefinition
  >]?: TInputQueryParamMap[TInputRouteKey][key] | null | undefined;
};

export type GetValueTypeOfKeyProperty<
  TInputQueryParamMap,
  TInputRouteKey extends keyof TInputQueryParamMap,
  TCustomTypeKeysDefinition extends TCustomType = {}
> = {
  [key in FilterInvalidParamKeys<
    TInputQueryParamMap[TInputRouteKey],
    TCustomTypeKeysDefinition
  >]: TInputQueryParamMap[TInputRouteKey][key];
};

// helps restrict the typeKey used when a type argument is passed
export type GetTypeKeyOfValueType<
  TInputQueryParamMap,
  TInputRouteKey extends keyof TInputQueryParamMap,
  TInputParamKey extends keyof TInputQueryParamMap[TInputRouteKey]
> = {
  [typeKey in ValidQueryParamPropertyTypeKeys]: TInputQueryParamMap[TInputRouteKey][TInputParamKey] extends TypeKeyToTypeMapping[typeKey]
    ? typeKey
    : never;
}[ValidQueryParamPropertyTypeKeys];

// helps restrict the typeKey used when a type argument is passed
export type GetTypeKeyOfCustomValueType<
  TInputQueryParamMap,
  TInputRouteKey extends keyof TInputQueryParamMap,
  TInputParamKey extends keyof TInputQueryParamMap[TInputRouteKey],
  TCustomTypeKeysDefinition extends TCustomType = {}
> = {
  [typeKey in keyof TCustomTypeKeysDefinition]: TInputQueryParamMap[TInputRouteKey][TInputParamKey] extends TCustomTypeKeysDefinition[typeKey]
    ? typeKey
    : never;
}[keyof TCustomTypeKeysDefinition];


type TypeKeyMapping<
  TInputQueryParamMap,
  TInputRouteKey extends keyof TInputQueryParamMap,
  TCustomTypeKeysDefinition extends TCustomType = {}
> = {
  [paramKey in keyof TInputQueryParamMap[TInputRouteKey]]:
    | GetTypeKeyOfValueType<TInputQueryParamMap, TInputRouteKey, paramKey>
    | GetTypeKeyOfCustomValueType<
        TInputQueryParamMap,
        TInputRouteKey,
        paramKey,
        TCustomTypeKeysDefinition
      >;
};

export type InferTypeFromFromTypeKeys<
  TCustomTypeKeysDefinition extends TCustomType,
  TInputQueryParamMap extends {
    [routeKey in keyof TInputQueryParamMap]?: {
      [paramKey in keyof TInputQueryParamMap[routeKey]]?:
        | string
        | ValidQueryParamPropertyTypeKeys
        | keyof TCustomTypeKeysDefinition;
    };
  }
> = {
  [routeKey in keyof TInputQueryParamMap]: {
    [paramKey in keyof TInputQueryParamMap[routeKey]]: TInputQueryParamMap[routeKey][paramKey] extends ValidQueryParamPropertyTypeKeys
      ? TypeKeyToTypeMapping[TInputQueryParamMap[routeKey][paramKey]]
      : TInputQueryParamMap[routeKey][paramKey] extends keyof TCustomTypeKeysDefinition
      ? TCustomTypeKeysDefinition[TInputQueryParamMap[routeKey][paramKey]]
      : unknown;
  };
};

type TCustomType = { [customTypeKey: string]: any };

export type RouteParamBaseTypeValue<
  TInputMapping,
  TInputRouteKey extends keyof TInputMapping = keyof TInputMapping,
  TCustomKeysDefinition extends TCustomType = {}
> = {
  typeKeyMapping: 
  TypeKeyMapping<TInputMapping, TInputRouteKey, TCustomKeysDefinition>;
  programmaticNavigate?: boolean;
};


export type InferRouteParamBaseTypeValue<
  TInputMapping,
  TInputRouteKey extends keyof TInputMapping,
  TCustomKeysDefinition extends TCustomType = {}
> = {
  typeKeyMapping: {
    [paramKey in keyof TInputMapping[TInputRouteKey]]:
      | keyof TCustomKeysDefinition
      | ValidQueryParamPropertyTypeKeys;
  };
  programmaticNavigate?: boolean;
};

export type RouteParamBaseType<
  TInputMapping extends {},
  TInputRouteKey extends keyof TInputMapping = keyof TInputMapping,
  TCustomKeysDefinition extends TCustomType = {}
> = {
  [routeKey in TInputRouteKey]: RouteParamBaseTypeValue<
    TInputMapping,
    routeKey,
    TCustomKeysDefinition
  >;
};

export type InferRouteParamBaseType<
  TInputMapping,
  TCustomKeysDefinition extends TCustomType = {}
> = {
  [routeKey in keyof TInputMapping]: InferRouteParamBaseTypeValue<
    TInputMapping,
    routeKey,
    TCustomKeysDefinition
  >;
};


export type RouteMappingGlobalOptions = {
  programmaticNavigate?: boolean;
  adapter?: Adapter;
};

export type RouteMappingCustomSetting<TCustomKeysDefinition extends {} = {}> = {
  customTypeKeyMapping: {
    [key in keyof TCustomKeysDefinition]: TypeMapValue<
      TCustomKeysDefinition[key]
    >;
  };
};

export type ValidTypeEncodingMapOverride = {
  [typeKey in ValidQueryParamPropertyTypeKeys]?: Partial<
    EncodingMapValue<TypeKeyToTypeMapping[typeKey]>
  >;
};

export type RouteMappingConfiguration = {
  validTypeEncodingMapOverride?: ValidTypeEncodingMapOverride;
};

// options used when retrieving the query string
export type QueryStringOptions<
  TInputMapping,
  TInputRouteKey extends keyof TInputMapping,
  TCustomKeysDefinition extends {},
  TInputParamKey extends FilterInvalidParamKeys<
    TInputMapping[TInputRouteKey],
    TCustomKeysDefinition
  >
> = {
  full?: boolean;
  replaceAllParams?: boolean;
  keyOrder?: Partial<Record<TInputParamKey, number>>;
};

// options used when clearing the query params
export type ClearQueryParamsOptions<
  TInputMapping,
  TInputRouteKey extends keyof TInputMapping,
  TCustomKeysDefinition extends {},
  TInputParamKey extends FilterInvalidParamKeys<
    TInputMapping[TInputRouteKey],
    TCustomKeysDefinition
  >
> = {
  include?: TInputParamKey[];
  exclude?: TInputParamKey[];
  behavior?: "push" | "replace";
};

// result when there is an error decoding/parsing
export type ParsingErrorResultType<
  TInputMapping,
  TInputRouteKey extends keyof TInputMapping,
  TCustomKeysDefinition extends {} = {}
> = {
  [key in FilterInvalidParamKeys<
        TInputMapping[TInputRouteKey],
        TCustomKeysDefinition
      >]?: {
    expectedType: ValidQueryParamPropertyTypeKeys | keyof TCustomKeysDefinition;
    actualType: ValidQueryParamPropertyTypeKeys | keyof TCustomKeysDefinition;
    errorStringValue: string;
  };
};

// options used when retrieving the query params
export type GetQueryParamsOptions<
  TInputMapping,
  TInputRouteKey extends keyof TInputMapping,
  TCustomKeysDefinition extends {} = {}
> = {
  defaults?: {
        [key in FilterInvalidParamKeys<
          TInputMapping[TInputRouteKey],
          TCustomKeysDefinition
        >]?: TInputMapping[TInputRouteKey][key];
      };
  useDefault?: FilterInvalidParamKeys<
        TInputMapping[TInputRouteKey],
        TCustomKeysDefinition
      >[];
};

// result of retrieving the query params
export type GetQueryParamsResult<
  TInputMapping,
  TInputRouteKey extends keyof TInputMapping,
  TCustomKeysDefinition extends {} = {}
> = {
  values: Partial<
    GetValueTypeOfKeyProperty<
      TInputMapping,
      TInputRouteKey,
      TCustomKeysDefinition
    >
  >;
  errors?: ParsingErrorResultType<
    TInputMapping,
    TInputRouteKey,
    TCustomKeysDefinition
  >;
};

export type RouterLocation = {
  search: string;
};

export type Adapter = {
  location: RouterLocation;
  pushLocation: (location: RouterLocation) => void;
  replaceLocation: (location: RouterLocation) => void;
};
