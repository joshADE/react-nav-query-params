import { createNavManager } from "react-nav-query-params";
export type { Adapter } from "react-nav-query-params";

export const PageRoutingData = {
  root: { key: "root", route: "/", title: "Main" },
  home: { key: "home", route: "/home", title: "Home" },
  people: { key: "people", route: "/people", title: "People" },
};

export const linkToOtherPages: {
  [type in PageType]: Exclude<PageType, type>[];
} = {
  root: ["people", "home"],
  home: ["root"],
  people: ["root", "home"],
};

export type PageType = keyof typeof PageRoutingData;

// do not include optional types in the route mapping object type

export type RouteMapping = {
  root: {
    // <-- route key
    display: { [type in PageType]?: boolean }; // <-- param key
    focus: PageType;
    numbers: number[];
    salutation: string;
  };
  home: {
    openModal: boolean;
    defaultViewCount: number;
  };
  people: {
    trigger: "first" | "second" | "third";
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

const { creator, activator } = createNavManager<{
  myCustomRecord: Record<string, number | string | boolean>;
}>({
  customTypeKeyMapping: {
    // <- define custom type keys to encode and decode
    myCustomRecord: {
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
        decode: (v) => {
          // <- can throw an Error inside the decode function saying the string value cannot be decoded
          const decoded = JSON.parse(v);
          if (!isCustomRecordType(decoded)) {
            throw new Error("Failed to decode myCustomRecord");
          }
          return decoded;
        },
      },
      sample: {}, // <- sample value of the type (if you type sample using the 'as' keyword you dont have to specify the type above)
    },
  },
});

// activator function helps to determine the corresponding type key given the type of the route keys and their params keys
const routeMapping = activator({
  root: {
    typeKeyMapping: {
      numbers: "numberArray", // <-- param key : type key (mapping)
      focus: "string",
      salutation: "string",
      display: "myCustomRecord",
    },
    programmaticNavigate: true, // only read the query params for this route when naviating programmatically if set to true
  },
  home: {
    typeKeyMapping: {
      openModal: "boolean",
      defaultViewCount: "number",
    },
  },
  people: {
    typeKeyMapping: {
      trigger: "string",
      name: "string",
    },
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
    },
  }
);
