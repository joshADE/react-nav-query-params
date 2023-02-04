import {
  ComplexEncodingKey,
  ComplexEncodingKeyToTypeMapping,
  // ComplexEncodingOptions,
  EncodingMapValue,
  TypeKeyToTypeMapping,
  TypeMapValue,
  ValidRouteParamPropertyTypeKeys,
} from "./types";

import {
  isIsoDate,
  matchArrayType,
  matchRecordType,
  simpleTypeConvert,
  simpleTypeConvertWithError,
} from "./utils";

export const validTypeMap: {
  [typeKey in ValidRouteParamPropertyTypeKeys]?: TypeMapValue<
    TypeKeyToTypeMapping[typeKey]
  >;
} = {
  string: {
    deafultValue: "",
    encodingMap: {
      encode: (v) => {
        return v;
      },
      decode: (v) => {
        return simpleTypeConvertWithError(v, "sample") as string;
      },
    },
    category: "simple",
    sample: "test",
    match: (value) => {
      return typeof value === "string";
    },
  },
  number: {
    deafultValue: -1,
    encodingMap: {
      encode: (v) => {
        return v.toString();
      },
      decode: (v) => {
        return simpleTypeConvertWithError(v, -1) as number;
      },
    },
    category: "simple",
    sample: -1,
    match: (value) => {
      return typeof value === "number";
    },
  },
  bigint: {
    deafultValue: BigInt(9007199254740991),
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
    sample: BigInt(9007199254740991),
    match: (value) => {
      return typeof value === "bigint";
    },
  },
  boolean: {
    deafultValue: false,
    encodingMap: {
      encode: (v) => {
        return v.toString();
      },
      decode: (v) => {
        return simpleTypeConvertWithError(v, false) as boolean;
      },
    },
    category: "simple",
    sample: false,
    match: (value) => {
      return typeof value === "boolean";
    },
  },
  stringArray: {
    deafultValue: ["sample"],
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
    sample: ["sample"],
    match: (value) => {
      return matchArrayType(value, "string");
    },
  },
  numberArray: {
    deafultValue: [-1],
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
    sample: [-1],
    match: (value) => {
      return matchArrayType(value, "number");
    },
  },
  bigintArray: {
    deafultValue: [BigInt(9007199254740991)],
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
    sample: [BigInt(9007199254740991)],
    match: (value) => {
      return matchArrayType(value, "bigint");
    },
  },
  booleanArray: {
    deafultValue: [false],
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
    sample: [false],
    match: (value) => {
      return matchArrayType(value, "boolean");
    },
  },
  stringRecord: {
    deafultValue: { sample: "sample" },
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
    sample: { sample: "sample" },
    match: (value) => {
      return matchRecordType(value, "string");
    },
  },
  numberRecord: {
    deafultValue: { sample: -1 },
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
    sample: { sample: -1 },
    match: (value) => {
      return matchRecordType(value, "number");
    },
  },
  bigintRecord: {
    deafultValue: { sample: BigInt(-1) },
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
    sample: { sample: BigInt(-1) },
    match: (value) => {
      return matchRecordType(value, "bigint");
    },
  },
  booleanRecord: {
    deafultValue: { sample: false },
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
    sample: { sample: false },
    match: (value) => {
      return matchRecordType(value, "boolean");
    },
  },
  date: {
    deafultValue: new Date(),
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
    sample: new Date(),
    match: (value) => {
      return isIsoDate(String(value));
    },
  },
};

export const EncodingMap: {
  [key in ComplexEncodingKey]: EncodingMapValue<ComplexEncodingKeyToTypeMapping[key]>
} = {
  array: {
    encode: (value) => {
      return value.join(",");
    },
    decode: (value, sampleSimpleValue) => {
      const splitValue = value
        .split(",");
        return splitValue.map((v) => simpleTypeConvert(v, sampleSimpleValue));
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
              simpleTypeConvert(splitEntry[1], sampleSimpleValue),
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
