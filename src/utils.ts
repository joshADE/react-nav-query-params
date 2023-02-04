import { validTypeMap } from "./data";
import { ValidRouteParamPropertyTypeKeys } from "./types";

export function isIsoDate(str: string) {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
  const d = new Date(str);
  return d instanceof Date && d.toISOString() === str; // valid date
}


export function simpleTypeConvert(stringRouteValue: string, sample: unknown) {
  switch (typeof sample) {
    case "number":
      const numberValue = Number(stringRouteValue);
      if (
        numberValue !== null &&
        numberValue !== undefined &&
        !isNaN(numberValue)
      ) {
        return numberValue;
      }
    case "bigint":
      try {
        const bigIntValue = BigInt(stringRouteValue);
        if (
          bigIntValue !== null &&
          bigIntValue !== undefined &&
          typeof bigIntValue === "bigint"
        ) {
          return bigIntValue;
        }
      } catch (e) {}
    case "boolean":
      return stringRouteValue === "true";
    case "string":
      if (stringRouteValue === "null" || stringRouteValue === "undefined") {
        return null;
      }
      return stringRouteValue;
    default:
  }
  return null;
}

export function simpleTypeConvertWithError(
  stringRouteValue: string,
  sample: unknown
) {
  switch (typeof sample) {
    case "number":
      const numberValue = Number(stringRouteValue);
      if (
        numberValue !== null &&
        numberValue !== undefined &&
        !isNaN(numberValue)
      ) {
        return numberValue;
      } else {
        throw new Error("Number expected!");
      }
    case "bigint":
      try {
        const bigIntValue = BigInt(stringRouteValue);
        if (
          bigIntValue !== null &&
          bigIntValue !== undefined &&
          typeof bigIntValue === "bigint"
        ) {
          return bigIntValue;
        }
      } catch (e) {
        throw new Error("BigInt expected!");
      }
    case "boolean":
      if (stringRouteValue === "true") return true;
      else if (stringRouteValue === "false") return false;
      else throw new Error("Boolean expected!");
    case "string":
      if (stringRouteValue === "null" || stringRouteValue === "undefined") {
        throw new Error("String expected!");
      }
      return stringRouteValue;
    default:
      return null;
  }
}

export function matchArrayType(
  value: unknown,
  simpleType: "string" | "number" | "boolean" | "bigint"
) {
  return (
    typeof value !== "string" && Array.isArray(value) &&
    value.length > 1 &&
    value.every((e) => typeof e === simpleType)
  );
}

export function matchRecordType(
  value: unknown,
  simpleType: "string" | "number" | "boolean" | "bigint"
) {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const keys = Object.keys(value);

  return keys.length > 0 && keys.every((e) => typeof value[e] === simpleType);
}

export function findTypeKey(
  input: unknown,
  possibleTypeMap: typeof validTypeMap,
): ValidRouteParamPropertyTypeKeys | "unknown" {
  const entries = Object.entries(possibleTypeMap);

  const simpleEntries = entries.filter(([, value]) => {
    return value.category === "simple";
  });

  // find a first match in simple key types
  const foundSimpleMatch = simpleEntries
    .sort(([, valueA], [, valueB]) => {
      return (valueA.matchPriority ?? 0) - (valueB.matchPriority ?? 0);
    })
    .find(([, value]) => {
      return value.match(input);
    });

  if (foundSimpleMatch) {
    return foundSimpleMatch[0] as ValidRouteParamPropertyTypeKeys;
  }

  const complexEntries = entries.filter(([, value]) => {
    return value.category === "complex";
  });

  // find a first match in complex key types
  const foundComplexMatch = complexEntries
    .sort(([, valueA], [, valueB]) => {
      return (valueA.matchPriority ?? 0) - (valueB.matchPriority ?? 0);
    })
    .find(([, value]) => {
      return value.match(input);
    });

  if (foundComplexMatch) {
    return foundComplexMatch[0] as ValidRouteParamPropertyTypeKeys;
  }

  const customEntries = entries.filter(([, value]) => {
    return value.category === "custom";
  });

  // find a first match in custom key types
  const foundCustomMatch = customEntries
    .sort(([, valueA], [, valueB]) => {
      return (valueA.matchPriority ?? 0) - (valueB.matchPriority ?? 0);
    })
    .find(([, value]) => {
      return value.match(input);
    });

  if (foundCustomMatch) {
    return foundCustomMatch[0] as ValidRouteParamPropertyTypeKeys;
  }

  return "unknown";
}

function decodeAndMatch(
  input: string,
  decodeFunction: (
    value: string,
    sampleSimpleValue: unknown
  ) => unknown,
  matchFunction: (value: unknown) => boolean
) {
  try {
    const decoded = decodeFunction(input, null);
    return matchFunction(decoded);
  } catch (e) {
    return false;
  }
}

export function findTypeKeyOfString(
  input: string,
  possibleTypeMap: typeof validTypeMap
): ValidRouteParamPropertyTypeKeys {
  const entries = Object.entries(possibleTypeMap);

  const simpleEntries = entries.filter(([, value]) => {
    return value.category === "simple";
  });

  // find a first match in simple key types
  const foundSimpleMatch = simpleEntries
    .filter(([key]) => key !== "string")
    .sort(([, valueA], [, valueB]) => {
      return (valueA.matchPriority ?? 0) - (valueB.matchPriority ?? 0);
    })
    .find(([, value]) => {
      return decodeAndMatch(input, value.encodingMap.decode, value.match);
    });

  if (foundSimpleMatch) {
    return foundSimpleMatch[0] as ValidRouteParamPropertyTypeKeys;
  }

  const complexEntries = entries.filter(([, value]) => {
    return value.category === "complex";
  });

  // find a first match in complex key types
  const foundComplexMatch = complexEntries
    .sort(([, valueA], [, valueB]) => {
      return (valueA.matchPriority ?? 0) - (valueB.matchPriority ?? 0);
    })
    .find(([, value]) => {
      return decodeAndMatch(input, value.encodingMap.decode, value.match);
    });

  if (foundComplexMatch) {
    return foundComplexMatch[0] as ValidRouteParamPropertyTypeKeys;
  }

  const customEntries = entries.filter(([, value]) => {
    return value.category === "custom";
  });

  // find a first match in custom key types
  const foundCustomMatch = customEntries
    .sort(([, valueA], [, valueB]) => {
      return (valueA.matchPriority ?? 0) - (valueB.matchPriority ?? 0);
    })
    .find(([, value]) => {
      return decodeAndMatch(input, value.encodingMap.decode, value.match);
    });

  if (foundCustomMatch) {
    return foundCustomMatch[0] as ValidRouteParamPropertyTypeKeys;
  }

  return "string";
} 