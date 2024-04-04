import {
    EncodingHelperTypeKeyToTypeMapping,
    EncodingHelperEncodingMapValue,
    EncodingHelperTypeGenerator,
    JoinInnerAndOuterKey,
} from "../types/encodingHelperTypes";

import {
    GetOptionsForValidTypeKey,
    SimpleTypeKeys,
    TypeKeyToTypeMapping,
} from "../types/typeKeys";

import { 
    EncodingMapValue
} from "../types/encodingTypes";

import { isIsoDate, simpleTypeConvertWithError } from "../utils/utils";

export const EncodingHelperConstants = {
    array: {
        separator: ",",
    },
    record: {
        objectStartSeparator: "<",
        objectEndSeparator: ">",
        objectEntrySeparator: ">",
        keyValueSeparator: ":",
    },
    date: {
        hyphenSeperator: "-",
        colonSeperator: ":",
    }
} as const;

export const EncodingHelperGenerator = <
K extends SimpleTypeKeys, 
T extends keyof EncodingHelperTypeGenerator<K>,
O extends GetOptionsForValidTypeKey<JoinInnerAndOuterKey<K, T>>,
R extends EncodingMapValue<EncodingHelperTypeGenerator<K>[T],O>
>
(simpleTypeKey: K, generatedType: T, overridedOptions?: O) : R => {
    type ResultType<TGenerated extends keyof EncodingHelperTypeGenerator<K>> = EncodingMapValue<
    EncodingHelperTypeGenerator<K>[TGenerated],
    GetOptionsForValidTypeKey<JoinInnerAndOuterKey<K, TGenerated>>
    >;
    

    if (generatedType === "array") {
            const encodingHelperMapValueArray: ResultType<"array"> = {
                encode: (value, options) => {
                    const stringArray = value.map((v) => String(v));
                    if (options?.expanded) {
                        return stringArray;
                    }
                    return stringArray.join(options?.separator ?? EncodingHelperConstants.array.separator);
                },
                decode: (value, options) => {
                    const splitValue = Array.isArray(value) ? value 
                    : !options?.expanded ? value.split(options?.separator ?? EncodingHelperConstants.array.separator) : [value];
                    const converted = splitValue.map((v) => simpleTypeConvertWithError(v, simpleTypeKey));
                    if (converted.includes(null)) {
                        throw new Error("Failed to decode as array.");
                    }
                    return converted as EncodingHelperTypeGenerator<K>["array"];
                },
                encodingOptions: {
                    separator: EncodingHelperConstants.array.separator,
                    expanded: false,
                    ...overridedOptions,
                } as GetOptionsForValidTypeKey<JoinInnerAndOuterKey<K, "array">>
            };
            return encodingHelperMapValueArray as R;
    } else if (generatedType === "record") {
            const encodingHelperMapValueRecord: ResultType<"record"> = {
                encode: (value, options) => {
                    const newObject = Object.fromEntries(
                        Object.entries(value as object).map(([k, v]) => [k, String(v)])
                    );
                    const objectStartSeparator = options?.objectStartSeparator ?? EncodingHelperConstants.record.objectStartSeparator;
                    const objectEndSeperator = options?.objectEndSeparator ?? EncodingHelperConstants.record.objectEndSeparator;
                    const entrySeperator = options?.objectEntrySeparator ?? EncodingHelperConstants.record.objectEntrySeparator;
                    const keyValueSeperator = options?.keyValueSeparator ?? EncodingHelperConstants.record.keyValueSeparator;
                    const encoded =
                        objectStartSeparator +
                        Object.entries(newObject)
                            .map(([k, v]) => `${k}${keyValueSeperator}${v}`)
                            .join(entrySeperator) +
                        objectEndSeperator;
                    return encoded;
                },
                decode: (value, options) => {
                    const stringValue = Array.isArray(value) ? value[0]: value;
                    const objectStartSeparator = options?.objectStartSeparator ?? EncodingHelperConstants.record.objectStartSeparator;
                    const objectEndSeperator = options?.objectEndSeparator ?? EncodingHelperConstants.record.objectEndSeparator;
                    const entrySeperator = options?.objectEntrySeparator ?? EncodingHelperConstants.record.objectEntrySeparator;
                    const keyValueSeperator = options?.keyValueSeparator ?? EncodingHelperConstants.record.keyValueSeparator;
                    
                    let trimmed = stringValue.startsWith(objectStartSeparator)
                        ? stringValue.slice(objectStartSeparator.length, value.length)
                        : stringValue;
                    trimmed = trimmed.endsWith(objectEndSeperator)
                        ? trimmed.slice(0, trimmed.length - objectEndSeperator.length)
                        : trimmed;
                    const entries = trimmed.split(entrySeperator);
                    const newObject = Object.fromEntries(
                        entries.map((s) => {
                            const splitEntry = s.split(keyValueSeperator);
                            const len = splitEntry.length;
                            if (len === 2) {
                                return [
                                    splitEntry[0],
                                    simpleTypeConvertWithError(splitEntry[1], simpleTypeKey),
                                ];
                            } else {
                                return [splitEntry[0], null];
                            }
                        })
                    );
                    if (Object.values(newObject).includes(null)) {
                        throw new Error("Failed to decode as record.");
                    }
                    return newObject as EncodingHelperTypeGenerator<K>["record"];
                },
                encodingOptions: {
                    objectStartSeparator: EncodingHelperConstants.record.objectStartSeparator,
                    objectEndSeparator: EncodingHelperConstants.record.objectEndSeparator,
                    objectEntrySeparator: EncodingHelperConstants.record.objectEntrySeparator,
                    keyValueSeparator: EncodingHelperConstants.record.keyValueSeparator,
                    ...overridedOptions,
                } as GetOptionsForValidTypeKey<JoinInnerAndOuterKey<K, "record">>
            };
            return encodingHelperMapValueRecord as R;
    } else if (generatedType === "recordWithNumberKeys") {
        const encodingHelperMapValueRecordWithNumberKeys: ResultType<"recordWithNumberKeys"> = {
                encode: (value, options) => {
                    const newObject = Object.fromEntries(
                        Object.entries(value as object).map(([k, v]) => [String(k), String(v)])
                    );
                    const objectStartSeparator = options?.objectStartSeparator ?? EncodingHelperConstants.record.objectStartSeparator;
                    const objectEndSeperator = options?.objectEndSeparator ?? EncodingHelperConstants.record.objectEndSeparator;
                    const entrySeperator = options?.objectEntrySeparator ?? EncodingHelperConstants.record.objectEntrySeparator;
                    const keyValueSeperator = options?.keyValueSeparator ?? EncodingHelperConstants.record.keyValueSeparator;
                    const encoded =
                        objectStartSeparator +
                        Object.entries(newObject)
                            .map(([k, v]) => `${k}${keyValueSeperator}${v}`)
                            .join(entrySeperator) +
                        objectEndSeperator;
                    return encoded;
                },
                decode: (value, options) => {
                    const stringValue = Array.isArray(value) ? value[0]: value;
                    const objectStartSeparator = options?.objectStartSeparator ?? EncodingHelperConstants.record.objectStartSeparator;
                    const objectEndSeperator = options?.objectEndSeparator ?? EncodingHelperConstants.record.objectEndSeparator;
                    const entrySeperator = options?.objectEntrySeparator ?? EncodingHelperConstants.record.objectEntrySeparator;
                    const keyValueSeperator = options?.keyValueSeparator ?? EncodingHelperConstants.record.keyValueSeparator;
                    
                    let trimmed = stringValue.startsWith(objectStartSeparator)
                        ? stringValue.slice(objectStartSeparator.length, value.length)
                        : stringValue;
                    trimmed = trimmed.endsWith(objectEndSeperator)
                        ? trimmed.slice(0, trimmed.length - objectEndSeperator.length)
                        : trimmed;
                    const entries = trimmed.split(entrySeperator);
                    const newObject = Object.fromEntries(
                        entries.map((s) => {
                            const splitEntry = s.split(keyValueSeperator);
                            const len = splitEntry.length;
                            if (len === 2) {
                                return [
                                    Number(splitEntry[0]),
                                    simpleTypeConvertWithError(splitEntry[1], simpleTypeKey),
                                ];
                            } else {
                                return [splitEntry[0], null];
                            }
                        })
                    );
                    if (Object.values(newObject).includes(null) || Object.keys(newObject).some((k) => isNaN(k as unknown as number))) {
                        throw new Error("Failed to decode as recordWithNumberKeys.");
                    }
                    return newObject as EncodingHelperTypeGenerator<K>["recordWithNumberKeys"];
                },
                encodingOptions: {
                    objectStartSeparator: EncodingHelperConstants.record.objectStartSeparator,
                    objectEndSeparator: EncodingHelperConstants.record.objectEndSeparator,
                    objectEntrySeparator: EncodingHelperConstants.record.objectEntrySeparator,
                    keyValueSeparator: EncodingHelperConstants.record.keyValueSeparator,
                    ...overridedOptions,
                } as GetOptionsForValidTypeKey<JoinInnerAndOuterKey<K, "recordWithNumberKeys">>
            };
            return encodingHelperMapValueRecordWithNumberKeys as R;
    } else if (generatedType === "enum") {
        const encodingHelperMapValueEnum: ResultType<"enum"> = {
                encode: (value, options) => {
                    if (options?.enumType) {
                        if (!(options.enumType as TypeKeyToTypeMapping[K][]).includes(value)) {
                            return "";
                        }
                    }
                    return String(value);
                },
                decode: (value, options) => {
                    const convertedValue = simpleTypeConvertWithError(value, simpleTypeKey);

                    if (convertedValue === null) {
                        throw new Error("Failed to decode as enum.");
                    }

                    if (options?.enumType) {
                        if (!(options.enumType as TypeKeyToTypeMapping[K][]).includes(convertedValue as TypeKeyToTypeMapping[K])) {
                            throw new Error("Failed to decode as enum.");
                        }
                    }
                    
                    return convertedValue as EncodingHelperTypeGenerator<K>["enum"];
                },
                encodingOptions: {
                    ...overridedOptions,
                } as GetOptionsForValidTypeKey<JoinInnerAndOuterKey<K, "enum">>
            };
            return encodingHelperMapValueEnum as unknown as R;
    }

    throw new Error("Invalid type");
}


export const EncodingHelpers: {
  [key in keyof EncodingHelperTypeKeyToTypeMapping]: EncodingHelperEncodingMapValue<key>
} = {
    stringArray: {
        encode: (value, options) => {
            return EncodingHelperGenerator("string", "array", options).encode(value, options);
        },
        decode: (value, options) => {
            return EncodingHelperGenerator("string", "array", options).decode(value, options);
        },
    },
    numberArray: {
        encode: (value, options) => {
            return EncodingHelperGenerator("number", "array", options).encode(value, options);
        },
        decode: (value, options) => {
            return EncodingHelperGenerator("number", "array", options).decode(value, options);
        },
    },
    booleanArray: {
        encode: (value, options) => {
            return EncodingHelperGenerator("boolean", "array", options).encode(value, options);
        },
        decode: (value, options) => {
            return EncodingHelperGenerator("boolean", "array", options).decode(value, options);
        },
    },
    stringRecord: {
        encode: (value, options) => {
            return EncodingHelperGenerator("string", "record", options).encode(value, options);
        },
        decode: (value, options) => {
            return EncodingHelperGenerator("string", "record", options).decode(value, options);
        },
    },
    numberRecord: {
        encode: (value, options) => {
            return EncodingHelperGenerator("number", "record", options).encode(value, options);
        },
        decode: (value, options) => {
            return EncodingHelperGenerator("number", "record", options).decode(value, options);
        },
    },
    booleanRecord: {
        encode: (value, options) => {
            return EncodingHelperGenerator("boolean", "record", options).encode(value, options);
        },
        decode: (value, options) => {
            return EncodingHelperGenerator("boolean", "record", options).decode(value, options);
        },
    },
    stringRecordWithNumberKeys: {
        encode: (value, options) => {
            return EncodingHelperGenerator("string", "recordWithNumberKeys", options).encode(value, options);
        },
        decode: (value, options) => {
            return EncodingHelperGenerator("string", "recordWithNumberKeys", options).decode(value, options);
        },
    },
    numberRecordWithNumberKeys: {
        encode: (value, options) => {
            return EncodingHelperGenerator("number", "recordWithNumberKeys", options).encode(value, options);
        },
        decode: (value, options) => {
            return EncodingHelperGenerator("number", "recordWithNumberKeys", options).decode(value, options);
        },
    },
    booleanRecordWithNumberKeys: {
        encode: (value, options) => {
            return EncodingHelperGenerator("boolean", "recordWithNumberKeys", options).encode(value, options);
        },
        decode: (value, options) => {
            return EncodingHelperGenerator("boolean", "recordWithNumberKeys", options).decode(value, options);
        },
    },
    stringEnum: {
        encode: (value, options) => {
            return EncodingHelperGenerator("string", "enum", options).encode(value, options);
        },
        decode: (value, options) => {
            return EncodingHelperGenerator("string", "enum", options).decode(value, options);
        },
    },
    numberEnum: {
        encode: (value, options) => {
            return EncodingHelperGenerator("number", "enum", options).encode(value, options);
        },
        decode: (value, options) => {
            return EncodingHelperGenerator("number", "enum", options).decode(value, options);
        },
    },
    booleanEnum: {
        encode: (value, options) => {
            return EncodingHelperGenerator("boolean", "enum", options).encode(value, options);
        },
        decode: (value, options) => {
            return EncodingHelperGenerator("boolean", "enum", options).decode(value, options);
        },
    },
  date: {
    encode: (value, options) => {
      const hyphenSeperator = options?.hyphenSeperator ?? EncodingHelperConstants.date.hyphenSeperator;
      const colonSeperator = options?.colonSeperator ?? EncodingHelperConstants.date.colonSeperator;
      return value
        .toISOString()
        .replace("-", hyphenSeperator)
        .replace(":", colonSeperator);
    },
    decode: (value, options) => {
      value = Array.isArray(value) ? value[0]: value;
      const hyphenSeperator = options?.hyphenSeperator ?? EncodingHelperConstants.date.hyphenSeperator;
      const colonSeperator = options?.colonSeperator ?? EncodingHelperConstants.date.colonSeperator;
      let newValue = value.replace(hyphenSeperator, "-");
      newValue = newValue.replace(colonSeperator, ":");
      if (isIsoDate(newValue)) {
        return new Date(newValue);
      } else {
        throw new Error("Failed to decode as date.");
      }
    },

  },
};