
import { TypeMapValue } from "../types/encodingTypes";
import {
  TypeKeyToTypeMapping, 
  ValidQueryParamPropertyTypeKeys,
  GetOptionsForValidTypeKey,
} from "../types/typeKeys";
import {
  isIsoDate,
  matchArrayTypeWithArrayCheck,
  matchRecordType,
  simpleTypeConvertWithError,
  matchRecordTypeWithNumberKeys,
} from "../utils/utils";

import { EncodingHelpers } from "../encodingHelpers/encodingHelpers";


export const validTypeMap: {
  [typeKey in ValidQueryParamPropertyTypeKeys]?: TypeMapValue<
    TypeKeyToTypeMapping[typeKey],
    GetOptionsForValidTypeKey<typeKey>
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
      encode: (v, o) => {
        return EncodingHelpers.stringArray.encode(v, o);
      },
      decode: (v, o) => {
        return EncodingHelpers.stringArray.decode(v, o);
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
      encode: (v, o) => {
        return EncodingHelpers.numberArray.encode(v, o);
      },
      decode: (v, o) => {
        return EncodingHelpers.numberArray.decode(v, o);
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
      encode: (v, o) => {
        return EncodingHelpers.booleanArray.encode(v, o);
      },
      decode: (v, o) => {
        return EncodingHelpers.booleanArray.decode(v, o);
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
      encode: (v, o) => {
        return EncodingHelpers.stringRecord.encode(v, o);
      },
      decode: (v, o) => {
        return EncodingHelpers.stringRecord.decode(v, o);
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
      encode: (v, o) => {
        return EncodingHelpers.numberRecord.encode(v, o);
      },
      decode: (v, o) => {
        return EncodingHelpers.numberRecord.decode(v, o);
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
      encode: (v, o) => {
        return EncodingHelpers.booleanRecord.encode(v, o);
      },
      decode: (v, o) => {
        return EncodingHelpers.booleanRecord.decode(v, o);
      },
    },
    category: "complex",
    match: (value) => {
      return matchRecordType(value, "boolean");
    },
  },
  stringRecordWithNumberKeys: {
    defaultValue: { 0: "sample" },
    encodingMap: {
      encode: (v, o) => {
        return EncodingHelpers.stringRecordWithNumberKeys.encode(v, o);
      },
      decode: (v, o) => {
        return EncodingHelpers.stringRecordWithNumberKeys.decode(v, o);
      },
    },
    category: "complex",
    match: (value) => {
      return matchRecordTypeWithNumberKeys(value, "string");
    },
  },
  numberRecordWithNumberKeys: {
    defaultValue: { 0: -1 },
    encodingMap: {
      encode: (v, o) => {
        return EncodingHelpers.numberRecordWithNumberKeys.encode(v, o);
      },
      decode: (v, o) => {
        return EncodingHelpers.numberRecordWithNumberKeys.decode(v, o);
      },
    },
    category: "complex",
    match: (value) => {
      return matchRecordTypeWithNumberKeys(value, "number");
    },
  },
  booleanRecordWithNumberKeys: {
    defaultValue: { 0: false },
    encodingMap: {
      encode: (v, o) => {
        return EncodingHelpers.booleanRecordWithNumberKeys.encode(v, o);
      },
      decode: (v, o) => {
        return EncodingHelpers.booleanRecordWithNumberKeys.decode(v, o);
      },
    },
    category: "complex",
    match: (value) => {
      return matchRecordTypeWithNumberKeys(value, "boolean");
    },
  },
  stringEnum: {
    defaultValue: "sample",
    encodingMap: {
      encode: (v, o) => {
        return EncodingHelpers.stringEnum.encode(v, o);
      },
      decode: (v, o) => {
        return EncodingHelpers.stringEnum.decode(v, o);
      },
    },
    category: "complex",
    match: (value, o) => {
      return typeof value === "string" && o?.enumType?.includes ? o.enumType.includes(value) : false;
    },
  },
  numberEnum: {
    defaultValue: -1,
    encodingMap: {
      encode: (v, o) => {
        return EncodingHelpers.numberEnum.encode(v, o);
      },
      decode: (v, o) => {
        return EncodingHelpers.numberEnum.decode(v, o);
      },
    },
    category: "complex",
    match: (value, o) => {
      return typeof value === "number" && o?.enumType?.includes ? o.enumType.includes(value) : false;
    },
  },
  date: {
    defaultValue: new Date(),
    encodingMap: {
      encode: (v, o) => {
        return EncodingHelpers.date.encode(v, o);
      },
      decode: (v, o) => {
        return EncodingHelpers.date.decode(v, o);
      },
    },
    category: "complex",
    match: (value) => {
      return isIsoDate(String(value));
    },
  },
};

