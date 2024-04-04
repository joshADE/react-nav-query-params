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
  // record types with number keys
  stringRecordWithNumberKeys: Record<number, string>;
  numberRecordWithNumberKeys: Record<number, number>;
  booleanRecordWithNumberKeys: Record<number, boolean>;
  // enums
  stringEnum: string;
  numberEnum: number;
  // no boolean enum
  // date
  date: Date;
};



export type SimpleTypeKeys = keyof Pick<TypeKeyToTypeMapping, "string" | "number" | "boolean">;
export type ComplexTypeKeys = keyof Omit<TypeKeyToTypeMapping, SimpleTypeKeys>;
export type TypeKeys = SimpleTypeKeys | ComplexTypeKeys;


export type SimpleRouteParamPropertyType =
  TypeKeyToTypeMapping[SimpleTypeKeys] | null;

export type OptionsType<T> = Record<string, T> | Record<string, never>;


export type TypeKeyToOptionsTypeMapping = {
  // array types
    stringArray: { separator: string; expanded?: boolean };
    numberArray: { separator: string; expanded?: boolean };
    booleanArray: { separator: string; expanded?: boolean };
    // record types
    stringRecord: {
        objectStartSeparator?: string;
        objectEndSeparator?: string;
        objectEntrySeparator?: string;
        keyValueSeparator?: string;
    };
    numberRecord: {
        objectStartSeparator?: string;
        objectEndSeparator?: string;
        objectEntrySeparator?: string;
        keyValueSeparator?: string;
    };
    booleanRecord: {
        objectStartSeparator?: string;
        objectEndSeparator?: string;
        objectEntrySeparator?: string;
        keyValueSeparator?: string;
    };
    stringRecordWithNumberKeys: {
        objectStartSeparator?: string;
        objectEndSeparator?: string;
        objectEntrySeparator?: string;
        keyValueSeparator?: string;
    };
    numberRecordWithNumberKeys: {
        objectStartSeparator?: string;
        objectEndSeparator?: string;
        objectEntrySeparator?: string;
        keyValueSeparator?: string;
    };
    booleanRecordWithNumberKeys: {
        objectStartSeparator?: string;
        objectEndSeparator?: string;
        objectEntrySeparator?: string;
        keyValueSeparator?: string;
    };
    stringEnum: {
        enumType: string[];
    };
    numberEnum: {
        enumType: number[];
    };
    booleanEnum: {
        enumType: boolean[];
    };
    stringEnumArray: {
        enumType: string[];
        separator: string;
    };
    numberEnumArray: {
        enumType: number[];
        separator: string;
    };
    booleanEnumArray: {
        enumType: boolean[];
        separator: string;
    };
    stringEnumRecord: {
        enumType: string[];
        objectStartSeparator?: string;
        objectEndSeparator?: string;
        objectEntrySeparator?: string;
        keyValueSeparator?: string;
    };
    numberEnumRecord: {
        enumType: number[];
        objectStartSeparator?: string;
        objectEndSeparator?: string;
        objectEntrySeparator?: string;
        keyValueSeparator?: string;
    };
    booleanEnumRecord: {
        enumType: boolean[];
        objectStartSeparator?: string;
        objectEndSeparator?: string;
        objectEntrySeparator?: string;
        keyValueSeparator?: string;
    };
    // date
    date: { 
        format?: "ISO",
        hyphenSeperator: string;
        colonSeperator: string;
    };
}

export type TypeKeyToOptionsTypeMappingKeys = keyof TypeKeyToOptionsTypeMapping;

export type DefaultOptionsType = OptionsType<object>;

export type GetOptionsForValidTypeKey<T> = T extends TypeKeyToOptionsTypeMappingKeys ?
TypeKeyToOptionsTypeMapping[T]: DefaultOptionsType;



export type CustomOptionsTypeValue<
TCustomTypeKeysDefinition extends CustomTypeKeysMap> = {
  [key in keyof TCustomTypeKeysDefinition]: object;
};

export type GetOptionsForPossibleTypeKey<T, C extends CustomTypeKeysMap, O extends CustomOptionsTypeValue<C>> = 
T extends TypeKeyToOptionsTypeMappingKeys ?
TypeKeyToOptionsTypeMapping[T]: 
T extends keyof C ?
O[T]: 
DefaultOptionsType;

export type CustomTypeKeysMap = {
    [key in keyof unknown]: unknown;
};

export type CustomTypeKeysMapDefault = {
    [key in keyof unknown]: unknown;
};

// Guide: { [routeKey]: { [paramKey]: [typeKey] } } <- input of package used for determine type conversion
// ValidTypeKeys = keyof TypeKeyToTypeMapping(defined below)
// PossibleTypeKeys = ValidTypeKeys + CustomTypeKeys(defined by user of package)

export type ValidQueryParamPropertyTypeKeys = keyof TypeKeyToTypeMapping;
