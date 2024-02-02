import {
  ComplexEncodingKey,
  ComplexEncodingKeyToTypeMapping,
  EncodingMapComplexValue,
  TypeKeyToTypeMapping,
  TypeMapValue,
  ValidQueryParamPropertyTypeKeys,
} from "./types";

import {
  isIsoDate,
  matchArrayType,
  matchArrayTypeWithArrayCheck,
  matchRecordType,
  simpleTypeConvertWithError,
} from "./utils";

export const validTypeMap: {
  [typeKey in ValidQueryParamPropertyTypeKeys]?: TypeMapValue<
    TypeKeyToTypeMapping[typeKey]
  >;
} = {
  string: {
    defaultValue: "",
    encodingMap: {
      encode: (v) => {
        return v;
      },
      decode: (v) => {
        return simpleTypeConvertWithError(v, "string") as string;
      },
    },
    category: "simple",
    match: (value) => {
      return typeof value === "string";
    },
  },
  number: {
    defaultValue: -1,
    encodingMap: {
      encode: (v) => {
        return v.toString();
      },
      decode: (v) => {
        return simpleTypeConvertWithError(v, "number") as number;
      },
    },
    category: "simple",
    match: (value) => {
      return typeof value === "number";
    },
  },
  boolean: {
    defaultValue: false,
    encodingMap: {
      encode: (v) => {
        return v.toString();
      },
      decode: (v) => {
        return simpleTypeConvertWithError(v, "boolean") as boolean;
      },
    },
    category: "simple",
    match: (value) => {
      return typeof value === "boolean";
    },
  },
  stringArray: {
    defaultValue: ["sample"],
    encodingMap: {
      encode: (v) => {
        return EncodingMap.array.encode(v);
      },
      decode: (v) => {
        const result = EncodingMap.array.decode(v, "string") as string[];
        if (!matchArrayType(result, "string")) {
          throw new Error("Failed to decode as string array.");
        }
        return result;
      },
    },
    category: "complex",
    match: (value) => {
      return matchArrayTypeWithArrayCheck(value, "string");
    },
  },
  numberArray: {
    defaultValue: [-1],
    encodingMap: {
      encode: (v) => {
        return EncodingMap.array.encode(v);
      },
      decode: (v) => {
        const result = EncodingMap.array.decode(v, "number") as number[];
        if (!matchArrayType(result, "number")) {
          throw new Error("Failed to decode as number array.");
        }
        return result;
      },
    },
    category: "complex",
    match: (value) => {
      return matchArrayTypeWithArrayCheck(value, "number");
    },
  },
  booleanArray: {
    defaultValue: [false],
    encodingMap: {
      encode: (v) => {
        return EncodingMap.array.encode(v);
      },
      decode: (v) => {
        const result = EncodingMap.array.decode(v, "boolean") as boolean[];
        if (!matchArrayType(result, "boolean")) {
          throw new Error("Failed to decode as boolean array.");
        }
        return result;
      },
    },
    category: "complex",
    match: (value) => {
      return matchArrayTypeWithArrayCheck(value, "boolean");
    },
  },
  stringRecord: {
    defaultValue: { sample: "sample" },
    encodingMap: {
      encode: (v) => {
        return EncodingMap.record.encode(v);
      },
      decode: (v) => {
        const result = EncodingMap.record.decode(v, "string") as Record<
          string,
          string
        >;
        if (!matchRecordType(result, "string")) {
          throw new Error("Failed to decode as string record.");
        }
        return result;
      },
    },
    category: "complex",
    match: (value) => {
      return matchRecordType(value, "string");
    },
  },
  numberRecord: {
    defaultValue: { sample: -1 },
    encodingMap: {
      encode: (v) => {
        return EncodingMap.record.encode(v);
      },
      decode: (v) => {
        const result = EncodingMap.record.decode(v, "number") as Record<
          string,
          number
        >;
        if (!matchRecordType(result, "number")) {
          throw new Error("Failed to decode as number record.");
        }
        return result;
      },
    },
    category: "complex",
    match: (value) => {
      return matchRecordType(value, "number");
    },
  },
  booleanRecord: {
    defaultValue: { sample: false },
    encodingMap: {
      encode: (v) => {
        return EncodingMap.record.encode(v);
      },
      decode: (v) => {
        const result = EncodingMap.record.decode(v, "boolean") as Record<
          string,
          boolean
        >;
        if (!matchRecordType(result, "boolean")) {
          throw new Error("Failed to decode as boolean record.");
        }
        return result;
      },
    },
    category: "complex",
    match: (value) => {
      return matchRecordType(value, "boolean");
    },
  },
  date: {
    defaultValue: new Date(),
    encodingMap: {
      encode: (v) => {
        return EncodingMap.date.encode(v);
      },
      decode: (v) => {
        // "string" is a dummy value
        const result = EncodingMap.date.decode(v, "string") as Date;
        if (!(result instanceof Date)) {
          throw new Error("Failed to decode as date.");
        }
        return result;
      },
    },
    category: "complex",
    match: (value) => {
      return isIsoDate(String(value));
    },
  },
};

export const EncodingMap: {
  [key in ComplexEncodingKey]: EncodingMapComplexValue<ComplexEncodingKeyToTypeMapping[key]>
} = {
  array: {
    encode: (value) => {
      return value.join(",");
    },
    decode: (value, simpleType) => {
      const splitValue = value
        .split(",");
        return splitValue.map((v) => simpleTypeConvertWithError(v, simpleType));
    }
  },
  record: {
    encode: (value) => {
      const newObject = Object.fromEntries(
        Object.entries(value as object).map(([k, v]) => [k, String(v)])
      );
      const objectStartSeparator = "<";
      const objectEndSeperator = ">";
      const entrySeperator = ",";
      const keyValueSeperator = ":";
      const encoded =
        objectStartSeparator +
        Object.entries(newObject)
          .map(([k, v]) => `${k}${keyValueSeperator}${v}`)
          .join(entrySeperator) +
        objectEndSeperator; // { result }
      return encoded;
    },
    decode: (value, simpleType) => {
      const objectStartSeparator = "<";
      const objectEndSeperator = ">";
      const entrySeperator = ",";
      const keyValueSeperator = ":";
      let trimmed = value.startsWith(objectStartSeparator)
        ? value.slice(objectStartSeparator.length, value.length)
        : value;
      trimmed = trimmed.endsWith(objectEndSeperator)
        ? trimmed.slice(0, trimmed.length - objectEndSeperator.length)
        : trimmed;
      const entries = trimmed.split(entrySeperator);
      const newObject = Object.fromEntries(
        entries.map((s) => {
          const splitEntry = s.split(keyValueSeperator);
          const len = splitEntry.length;
          if (len >= 2) {
            return [
              splitEntry[0],
              simpleTypeConvertWithError(splitEntry[1], simpleType),
            ];
          } else {
            return [splitEntry[0], null];
          }
        })
      );
      return newObject;
    },
  },
  date: {
    encode: (value) => {
      const hyphenSeperator = "-";
      const colonSeperator = ":";
      return value
        .toISOString()
        .replace("-", hyphenSeperator)
        .replace(":", colonSeperator);
    },
    decode: (value) => {
      const hyphenSeperator = "-";
      const colonSeperator = ":";
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

export type EncodingMapType = typeof EncodingMap;
