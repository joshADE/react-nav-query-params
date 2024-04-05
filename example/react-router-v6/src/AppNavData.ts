import { createNavManager } from "react-nav-query-params";
export type { Adapter } from "react-nav-query-params";

export const PageRoutingData = {
  route1: { key: "route1", route: "/", title: "Route1" },
  route2: { key: "route2", route: "/route2", title: "Route2" },
  route3: { key: "route3", route: "/route3", title: "Route3" },
};

export const linkToOtherPages: {
  [type in PageType]: Exclude<PageType, type>[];
} = {
  route1: ["route2", "route3"],
  route2: ["route1"],
  route3: ["route1", "route2"],
};

export type PageType = keyof typeof PageRoutingData;

export enum TriggerEnum {
  first = "first",
  second = "second",
  third = "third",
}

// do not include optional types in the route mapping object type

export type RouteMapping = {
  route1: {
    // <-- route key
    display: { [type in PageType]?: boolean }; // <-- param key
    focus: PageType;
    numbers: number[];
    names: string[],
  };
  route2: {
    openModal: boolean;
    defaultViewCount: number;
  };
  route3: {
    trigger: TriggerEnum;
    name: string;
  };
};

function isCustomRecordType(
  value: unknown
): value is Record<string, number | string | boolean> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.entries(value).every(([k, v]) => {
      const kType = typeof k;
      const vType = typeof v;
      return (
        kType === "string" &&
        (vType === "string" || vType === "number" || vType === "boolean")
      );
    })
  );
}

const { creator, 
  activator,
} = createNavManager<{
  myCustomRecord: Record<string, number | string | boolean>;
},{
  myCustomRecord: { expanded?: boolean, test: string },
}>({
  customTypeKeyMapping: {
    // <- define custom type keys to encode and decode
    myCustomRecord: {
      defaultValue: {}, // <- specify a default value for the type key
      category: "custom", // <- always use "custom"
      match: (v) => {
        // <- specify a way to match for the type key given an unkown value (error handling)
        return isCustomRecordType(v);
      },
      encodingMap: {
        // <- specify a way to encode/decode type associated with key
        encode: (v) => {
          return JSON.stringify(v);
        },
        decode: (v, o) => {
          // <- can throw an Error inside the decode function saying the string value cannot be decoded
          const decoded = JSON.parse(Array.isArray(v) ? v[0] : v);
          if (!isCustomRecordType(decoded)) {
            throw new Error("Failed to decode myCustomRecord");
          }
          return decoded;
        },
        encodingOptions: {
          expanded: true,
          test: "test",
        }, // <- specify options for encoding/decoding
        
      },
    },
  },
});

// activator function helps to determine the corresponding type key given the type of the route keys and their params keys
const routeMapping = activator
<RouteMapping>
({
  route1: {
    typeKeyMapping: {
      numbers: "numberArray", // <-- param key : type key (mapping)
      focus: "string",
      display: "booleanRecord",
      names: "stringArray",
    },
    programmaticNavigate: true, // only read the query params for this route when naviating programmatically if set to true
    options: {
      numbers: {
        separator: "*",
        expanded: true,
      },
      names: {
        separator: "*",
        expanded: true,
      },
    }
  },
  route2: {
    typeKeyMapping: {
      openModal: "boolean",
      defaultViewCount: "number",
    },
    programmaticNavigate: false,

  },
  route3: {
    typeKeyMapping: {
      trigger: "stringEnum",
      name: "string",
    },
    options: {
      trigger: {
        enumType: Object.values(TriggerEnum),
      },
    }
  },
});

export const { NavQueryContext, useNavQueryParams } = creator(
  routeMapping,
  {},
  {
    validTypeEncodingMapOverride: {
      stringRecord: {
        defaultValue: {}, // set the default value for the stringRecord type key (can also specify default for each param key when using hook, but this value will be a fallback)
      },
      numberArray: {
        encodingOptions: {
          separator: "*",
          expanded: true,
        }
      },
    },
  }
);
