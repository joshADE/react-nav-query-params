import { 
  TypeKeyToTypeMapping, 
  CustomTypeKeysMap,
  CustomTypeKeysMapDefault,
  ValidQueryParamPropertyTypeKeys,
  CustomOptionsTypeValue,
  GetOptionsForValidTypeKey,
  GetOptionsForPossibleTypeKey,
} from "./typeKeys";
import { EncodingMapValue, CustomTypeKeysDefinitionValue } from "./encodingTypes";


export type FilterInvalidParamKeys<
  TInputMappingTypeKeysForRoute,
  TCustomTypeKeysDefinition extends CustomTypeKeysMap = CustomTypeKeysMapDefault
> = {
  [paramKey in keyof TInputMappingTypeKeysForRoute]: TInputMappingTypeKeysForRoute[paramKey] extends
    | TypeKeyToTypeMapping[ValidQueryParamPropertyTypeKeys]
    | TCustomTypeKeysDefinition[keyof TCustomTypeKeysDefinition]
    ? paramKey
    : never;
}[keyof TInputMappingTypeKeysForRoute];

// input type for getting query string params function
export type QueryStringParams<
  TInputQueryParamMap,
  TInputRouteKey extends keyof TInputQueryParamMap,
  TCustomTypeKeysDefinition extends CustomTypeKeysMap = CustomTypeKeysMapDefault
> = {
  [key in FilterInvalidParamKeys<
    TInputQueryParamMap[TInputRouteKey],
    TCustomTypeKeysDefinition
  >]?: TInputQueryParamMap[TInputRouteKey][key] | null | undefined;
};

export type GetValueTypeOfKeyProperty<
  TInputQueryParamMap,
  TInputRouteKey extends keyof TInputQueryParamMap,
  TCustomTypeKeysDefinition extends CustomTypeKeysMap = CustomTypeKeysMapDefault
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
  TCustomTypeKeysDefinition extends CustomTypeKeysMap = CustomTypeKeysMapDefault
> = {
  [typeKey in keyof TCustomTypeKeysDefinition]: TInputQueryParamMap[TInputRouteKey][TInputParamKey] extends TCustomTypeKeysDefinition[typeKey]
    ? typeKey
    : never;
}[keyof TCustomTypeKeysDefinition];


export type TypeKeyMapping<
  TInputQueryParamMap,
  TInputRouteKey extends keyof TInputQueryParamMap,
  TCustomTypeKeysDefinition extends CustomTypeKeysMap = CustomTypeKeysMapDefault
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

// export type InferTypeFromFromTypeKeys<
//   TCustomTypeKeysDefinition extends CustomTypeKeysMap,
//   TInputQueryParamMap extends {
//     [routeKey in keyof TInputQueryParamMap]?: {
//       [paramKey in keyof TInputQueryParamMap[routeKey]]?:
//         | string
//         | ValidQueryParamPropertyTypeKeys
//         | keyof TCustomTypeKeysDefinition;
//     };
//   }
// > = {
//   [routeKey in keyof TInputQueryParamMap]: {
//     [paramKey in keyof TInputQueryParamMap[routeKey]]: TInputQueryParamMap[routeKey][paramKey] extends ValidQueryParamPropertyTypeKeys
//       ? TypeKeyToTypeMapping[TInputQueryParamMap[routeKey][paramKey]]
//       : TInputQueryParamMap[routeKey][paramKey] extends keyof TCustomTypeKeysDefinition
//       ? TCustomTypeKeysDefinition[TInputQueryParamMap[routeKey][paramKey]]
//       : unknown;
//   };
// };

export type GetOptionsForTypeKeyWithCustomKeys<
  TTypeKey, 
  TCustomTypeKeysDefinition extends CustomTypeKeysMap, 
  TCustomKeyDefinitionOptions extends CustomOptionsTypeValue<TCustomTypeKeysDefinition>
> 
= GetOptionsForPossibleTypeKey<TTypeKey, TCustomTypeKeysDefinition, TCustomKeyDefinitionOptions> | undefined;


export type TypeKeyOptionsMapping<
  TInputMappingTypeKeysForRoute,
  TCustomTypeKeysDefinition extends CustomTypeKeysMap = CustomTypeKeysMapDefault,
  TCustomKeysDefinitionOptions extends CustomOptionsTypeValue<TCustomTypeKeysDefinition> = CustomOptionsTypeValue<TCustomTypeKeysDefinition>,
> = {
[paramKey in keyof TInputMappingTypeKeysForRoute]?:
    GetOptionsForTypeKeyWithCustomKeys<TInputMappingTypeKeysForRoute[paramKey], TCustomTypeKeysDefinition, TCustomKeysDefinitionOptions>;
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MapperType<N = any> = {[routeKey in keyof N]: { typeKeyMapping: { [paramKey in keyof N[routeKey]]?: unknown}}};

export type TKeyMapper<U extends MapperType> = {
    [routeKey in keyof U]: {
        [paramKey in keyof U[routeKey]["typeKeyMapping"]]: [routeKey, paramKey, U[routeKey]["typeKeyMapping"][paramKey]];
      }[keyof U[routeKey]["typeKeyMapping"]];
  }[keyof U];

  export type TypeKeyMappingValue<N, U extends MapperType<N>> = {
    [routeKey in keyof U]: {
        [paramKey in keyof U[routeKey]["typeKeyMapping"]]: U[routeKey]["typeKeyMapping"][paramKey];
      };
  };

    export type TypeKeyMappingValueInit<N, U extends MapperType<N>> = {
    [routeKey in keyof U]: {
        typeKeyMapping: {
          [paramKey in keyof U[routeKey]["typeKeyMapping"]]: U[routeKey]["typeKeyMapping"][paramKey];
        };
      };
  };

export type ExtractValueFromMapperTuple<T, R, P> = T extends [R, P, (infer TT)] ? TT : never;


export type RouteParamBaseTypeValue<
  TInputMapping,
  TInputRouteKey extends keyof TInputMapping = keyof TInputMapping,
  TCustomKeysDefinition extends CustomTypeKeysMap = CustomTypeKeysMapDefault,
  TCustomKeysDefinitionOptions extends CustomOptionsTypeValue<TCustomKeysDefinition> = CustomOptionsTypeValue<TCustomKeysDefinition>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TInput extends MapperType<TInputMapping> | any = any,
> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeKeyMapping: TInput extends MapperType<TInputMapping> ?
  TypeKeyMappingValueInit<TInputMapping, TInput>[TInputRouteKey]["typeKeyMapping"] :
  TypeKeyMapping<TInputMapping, TInputRouteKey, TCustomKeysDefinition>;
  programmaticNavigate?: boolean;
  options?: TypeKeyOptionsMapping<
  { [key in keyof TInputMapping[TInputRouteKey]]:
      ExtractValueFromMapperTuple<
          TKeyMapper<{ [routeKey in keyof TInputMapping]: { typeKeyMapping:  RouteParamBaseTypeValue<TInputMapping, routeKey, TCustomKeysDefinition, TCustomKeysDefinitionOptions, TInput>["typeKeyMapping"]}}>,
          TInputRouteKey,
          key
        >
  },
  TCustomKeysDefinition,
  TCustomKeysDefinitionOptions>
};



// export type InferRouteParamBaseTypeValue<
//   TInputMapping,
//   TInputRouteKey extends keyof TInputMapping,
//   TCustomKeysDefinition extends TCustomType = {},
//   TCustomKeysDefinitionOptions extends { [key in keyof TCustomKeysDefinition]: any } = { [key in keyof TCustomKeysDefinition]: {} }
// > = {
//   typeKeyMapping: {
//     [paramKey in keyof TInputMapping[TInputRouteKey]]:
//       | keyof TCustomKeysDefinition
//       | ValidQueryParamPropertyTypeKeys;
//   };
//   programmaticNavigate?: boolean;
//   options?: TypeKeyOptionsMapping<
//   { [key in keyof TInputMapping[TInputRouteKey]]:
//       ExtractValueFromMapperTuple<
//           TKeyMapper<{ [routeKey in keyof TInputMapping]: { typeKeyMapping:  InferRouteParamBaseTypeValue<TInputMapping, routeKey, TCustomKeysDefinition, TCustomKeysDefinitionOptions>["typeKeyMapping"]}}>,
//           TInputRouteKey,
//           key
//         >
//   },
//   TCustomKeysDefinitionOptions>
// };


export type TBaseType<U, PossibleKeys, TCustomKeys extends CustomTypeKeysMap, TCustomKeyOptions extends CustomOptionsTypeValue<TCustomKeys>> = {
  [routeKey in keyof U]:{
    programmaticNavigate?: boolean,
    typeKeyMapping: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [paramKey in keyof U[routeKey]]: PossibleKeys
    },
    options?: TypeKeyOptionsMapping<
          { [key in keyof TBaseType<U, PossibleKeys,TCustomKeys, TCustomKeyOptions>[routeKey]["typeKeyMapping"]]:
            ExtractValueFromMapperTuple<
              TKeyMapper<TBaseType<U, PossibleKeys, TCustomKeys, TCustomKeyOptions>>,
              routeKey,
              key
            >
          },
          TCustomKeys,
          TCustomKeyOptions>
  }
};


export type TBaseTypeWithTypeKeys<U, PossibleKeys> = {
  [routeKey in keyof U]:{
        [paramKey in keyof U[routeKey]]: PossibleKeys
  };
}

export type RouteParamBaseType<
TInputMapping extends object,
TCustomKeysDefinition extends CustomTypeKeysMap = CustomTypeKeysMapDefault,
TCustomKeysDefinitionOptions extends CustomOptionsTypeValue<TCustomKeysDefinition> = CustomOptionsTypeValue<TCustomKeysDefinition>,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
TInput extends MapperType<TInputMapping> | any = any,
> = {
  [routeKey in keyof TInputMapping]: RouteParamBaseTypeValue<
    TInputMapping,
    routeKey,
    TCustomKeysDefinition,
    TCustomKeysDefinitionOptions,
    TInput
  >;
};

// export type InferRouteParamBaseType<
//   TInputMapping,
//   TCustomKeysDefinition extends CustomTypeKeysMap = CustomTypeKeysMapDefault,
//   TCustomKeysDefinitionOptions extends CustomOptionsTypeValue<TCustomKeysDefinition> = CustomOptionsTypeValue<TCustomKeysDefinition>,
// > = {
//   [routeKey in keyof TInputMapping]: InferRouteParamBaseTypeValue<
//     TInputMapping,
//     routeKey,
//     TCustomKeysDefinition,
//     TCustomKeysDefinitionOptions
//   >;
// };


export type RouteMappingGlobalOptions = {
  programmaticNavigate?: boolean;
  adapter?: Adapter;
};

export type RouteMappingCustomSetting<
TCustomKeysDefinition extends CustomTypeKeysMap = CustomTypeKeysMapDefault,
TCustomKeyOptions extends CustomOptionsTypeValue<TCustomKeysDefinition> = CustomOptionsTypeValue<TCustomKeysDefinition>, 
> = {
  customTypeKeyMapping: CustomTypeKeysDefinitionValue<TCustomKeysDefinition, TCustomKeyOptions>;
};

export type ValidTypeEncodingMapOverride = {
  [typeKey in ValidQueryParamPropertyTypeKeys]?: Partial<
    EncodingMapValue<TypeKeyToTypeMapping[typeKey], GetOptionsForValidTypeKey<typeKey>>
  >;
};

export type RouteMappingConfiguration = {
  validTypeEncodingMapOverride?: ValidTypeEncodingMapOverride;
};

// options used when retrieving the query string
export type QueryStringOptions<
  TInputMapping,
  TInputRouteKey extends keyof TInputMapping,
  TCustomKeysDefinition extends CustomTypeKeysMap,
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
  TCustomKeysDefinition extends CustomTypeKeysMap,
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
  TCustomKeysDefinition extends CustomTypeKeysMap = CustomTypeKeysMapDefault
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
  TCustomKeysDefinition extends CustomTypeKeysMap = CustomTypeKeysMapDefault
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
  TCustomKeysDefinition extends CustomTypeKeysMap = CustomTypeKeysMapDefault
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
