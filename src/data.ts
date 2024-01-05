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
        return simpleTypeConvertWithError(v, "sample") as string;
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
        return simpleTypeConvertWithError(v, -1) as number;
      },
    },
    category: "simple",
    match: (value) => {
      return typeof value === "number";
    },
  },
  bigint: {
    defaultValue: BigInt(9007199254740991),
    encodingMap: {
      encode: (v) => {
        return v.toString();
      },
      decode: (v) => {
        return simpleTypeConvertWithError(
          v,
          BigInt(9007199254740991)
        ) as bigint;
      },
    },
    category: "simple",
    match: (value) => {
      return typeof value === "bigint";
    },
  },
  boolean: {
    defaultValue: false,
    encodingMap: {
      encode: (v) => {
        return v.toString();
      },
      decode: (v) => {
        return simpleTypeConvertWithError(v, false) as boolean;
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
        const result = EncodingMap.array.decode(v, "sample") as string[];
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
        const result = EncodingMap.array.decode(v, -1) as number[];
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
  bigintArray: {
    defaultValue: [BigInt(9007199254740991)],
    encodingMap: {
      encode: (v) => {
        return EncodingMap.array.encode(v);
      },
      decode: (v) => {
        const result = EncodingMap.array.decode(
          v,
          BigInt(9007199254740991)
        ) as bigint[];
        if (!matchArrayType(result, "bigint")) {
          throw new Error("Failed to decode as bigint array.");
        }
        return result;
      },
    },
    category: "complex",
    match: (value) => {
      return matchArrayTypeWithArrayCheck(value, "bigint");
    },
  },
  booleanArray: {
    defaultValue: [false],
    encodingMap: {
      encode: (v) => {
        return EncodingMap.array.encode(v);
      },
      decode: (v) => {
        const result = EncodingMap.array.decode(v, false) as boolean[];
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
        const result = EncodingMap.record.decode(v, "sample") as Record<
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
        const result = EncodingMap.record.decode(v, -1) as Record<
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
  bigintRecord: {
    defaultValue: { sample: BigInt(-1) },
    encodingMap: {
      encode: (v) => {
        return EncodingMap.record.encode(v);
      },
      decode: (v) => {
        const result = EncodingMap.record.decode(v, BigInt(-1)) as Record<
          string,
          bigint
        >;
        if (!matchRecordType(result, "bigint")) {
          throw new Error("Failed to decode as bigint record.");
        }
        return result;
      },
    },
    category: "complex",
    match: (value) => {
      return matchRecordType(value, "bigint");
    },
  },
  booleanRecord: {
    defaultValue: { sample: false },
    encodingMap: {
      encode: (v) => {
        return EncodingMap.record.encode(v);
      },
      decode: (v) => {
        const result = EncodingMap.record.decode(v, false) as Record<
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
        const result = EncodingMap.date.decode(v, new Date()) as Date;
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
    decode: (value, sampleSimpleValue) => {
      const splitValue = value
        .split(",");
        return splitValue.map((v) => simpleTypeConvertWithError(v, sampleSimpleValue));
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
    decode: (value, sampleSimpleValue) => {
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
              simpleTypeConvertWithError(splitEntry[1], sampleSimpleValue),
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
    decode: (value, sampleSimpleValue) => {
      const hyphenSeperator = "-";
      const colonSeperator = ":";
      let newValue = value.replace(hyphenSeperator, "-");
      newValue = newValue.replace(colonSeperator, ":");
      if (isIsoDate(newValue)) {
        return new Date(newValue);
      } else {
        return sampleSimpleValue as Date;
      }
    },
  },
};

export type EncodingMapType = typeof EncodingMap;
