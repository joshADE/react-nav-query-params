import { validTypeMap } from "../data/data";
import { SimpleTypeKeys, ValidQueryParamPropertyTypeKeys } from "../types/typeKeys";

export function isIsoDate(str: string) {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
  const d = new Date(str);
  return d instanceof Date && d.toISOString() === str; // valid date
}


export function simpleTypeConvert(stringRouteValue: string | string[], simpleType: SimpleTypeKeys) {
  stringRouteValue = Array.isArray(stringRouteValue) ? stringRouteValue[0] : stringRouteValue;
  switch (simpleType) {
    case "number": {
      const numberValue = Number(stringRouteValue);
      if (
        numberValue !== null &&
        numberValue !== undefined &&
        !isNaN(numberValue)
      ) {
        return numberValue;
      }
    }
    break;
    case "boolean": {
      return stringRouteValue === "true";
    }
    case "string": {
      if (stringRouteValue === "null" || stringRouteValue === "undefined") {
        return null;
      }
      return stringRouteValue;
    }
    default:
  }
  return null;
}

export function simpleTypeConvertWithError(
  stringRouteValue: string | string[],
  simpleType: SimpleTypeKeys
) {
  stringRouteValue = Array.isArray(stringRouteValue) ? stringRouteValue[0] : stringRouteValue;
  switch (simpleType) {
    case "number": {
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
    }
    case "boolean":
      {
      if (stringRouteValue === "true") return true;
      else if (stringRouteValue === "false") return false;
      else throw new Error("Boolean expected!");
      }
    case "string": {
      if (stringRouteValue === "null" || stringRouteValue === "undefined") {
        throw new Error("String expected!");
      }
      return stringRouteValue;
    }
    default:
      return null;
  }
}

export function matchArrayType(
  value: unknown,
  simpleType: "string" | "number" | "boolean"
) {
  return (
    typeof value !== "string" && Array.isArray(value) &&
    value.every((e) => typeof e === simpleType)
  );
}

export function matchArrayTypeWithArrayCheck(
  value: unknown,
  simpleType: "string" | "number" | "boolean"
) {
  return (
    typeof value !== "string" &&
    Array.isArray(value) &&
    value.length > 1 &&
    value.every((e) => typeof e === simpleType)
  );
}

export function matchRecordType(
  value: unknown,
  simpleType: "string" | "number" | "boolean"
) {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const keys = Object.keys(value);

  return keys.length > 0 && keys.every((e) => typeof value[e as keyof typeof value] === simpleType);
}

export function matchRecordTypeWithNumberKeys(
  value: unknown,
  simpleType: "string" | "number" | "boolean"
) {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const keys = Object.keys(value);

  return keys.length > 0 && keys.every((e) => typeof e === "number" && typeof value[e as keyof typeof value] === simpleType);
}


export function findTypeKey(
  input: unknown,
  possibleTypeMap: typeof validTypeMap,
): ValidQueryParamPropertyTypeKeys | "unknown" {
  const entries = Object.entries(possibleTypeMap);

  const simpleEntries = entries.filter(([, value]) => {
    return value.category === "simple";
  });

  // find a first match in simple key types
  const foundSimpleMatch = simpleEntries
    .sort(([, valueA], [, valueB]) => {
      return (valueA.matchPriority ?? 0) - (valueB.matchPriority ?? 0);
    })
    .filter(([, value]) => value.match !== undefined)
    .find(([, value]) => {
      return value.match!(input);
    });

  if (foundSimpleMatch) {
    return foundSimpleMatch[0] as ValidQueryParamPropertyTypeKeys;
  }

  const complexEntries = entries.filter(([, value]) => {
    return value.category === "complex";
  });

  // find a first match in complex key types
  const foundComplexMatch = complexEntries
    .sort(([, valueA], [, valueB]) => {
      return (valueA.matchPriority ?? 0) - (valueB.matchPriority ?? 0);
    })
    .filter(([, value]) => value.match !== undefined)
    .find(([, value]) => {
      return value.match!(input);
    });

  if (foundComplexMatch) {
    return foundComplexMatch[0] as ValidQueryParamPropertyTypeKeys;
  }

  const customEntries = entries.filter(([, value]) => {
    return value.category === "custom";
  });

  // find a first match in custom key types
  const foundCustomMatch = customEntries
    .sort(([, valueA], [, valueB]) => {
      return (valueA.matchPriority ?? 0) - (valueB.matchPriority ?? 0);
    })
    .filter(([, value]) => value.match !== undefined)
    .find(([, value]) => {
      return value.match!(input);
    });

  if (foundCustomMatch) {
    return foundCustomMatch[0] as ValidQueryParamPropertyTypeKeys;
  }

  return "unknown";
}

function decodeAndMatch(
  input: string,
  decodeFunction: (
    value: string, options?: unknown) => unknown,
  matchFunction: (value: unknown) => boolean,
  options: unknown = {},
) {
  try {
    const decoded = decodeFunction(input, options);
    return matchFunction(decoded);
  } catch (e) {
    return false;
  }
}

export function findTypeKeyOfString(
  input: string,
  possibleTypeMap: typeof validTypeMap
): ValidQueryParamPropertyTypeKeys {
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
    .filter(([, value]) => value.match !== undefined)
    .find(([, value]) => {
      return decodeAndMatch(input, value.encodingMap.decode, value.match!, value.encodingMap.encodingOptions ?? {});
    });

  if (foundSimpleMatch) {
    return foundSimpleMatch[0] as ValidQueryParamPropertyTypeKeys;
  }

  const complexEntries = entries.filter(([, value]) => {
    return value.category === "complex";
  });

  // find a first match in complex key types
  const foundComplexMatch = complexEntries
    .sort(([, valueA], [, valueB]) => {
      return (valueA.matchPriority ?? 0) - (valueB.matchPriority ?? 0);
    })
    .filter(([, value]) => value.match !== undefined)
    .find(([, value]) => {
      return decodeAndMatch(input, value.encodingMap.decode, value.match!, value.encodingMap.encodingOptions ?? {});
    });

  if (foundComplexMatch) {
    return foundComplexMatch[0] as ValidQueryParamPropertyTypeKeys;
  }

  const customEntries = entries.filter(([, value]) => {
    return value.category === "custom";
  });

  // find a first match in custom key types
  const foundCustomMatch = customEntries
    .sort(([, valueA], [, valueB]) => {
      return (valueA.matchPriority ?? 0) - (valueB.matchPriority ?? 0);
    })
    .filter(([, value]) => value.match !== undefined)
    .find(([, value]) => {
      return decodeAndMatch(input, value.encodingMap.decode, value.match!, value.encodingMap.encodingOptions ?? {});
    });

  if (foundCustomMatch) {
    return foundCustomMatch[0] as ValidQueryParamPropertyTypeKeys;
  }

  return "string";
} 