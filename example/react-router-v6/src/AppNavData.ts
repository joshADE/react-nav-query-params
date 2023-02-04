import { createNavManager } from "react-nav-query-params";

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

export interface RouteMapping {
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
}

const { creator, activator } = createNavManager({
  customTypeKeyMapping: {
    // homes: {
    //   category: "custom",
    //   encodingMap: {
    //     encode: (v) => {
    //       return v.prop1.toString() + "-" + v.prop2;
    //     },
    //     decode: (v) => {
    //       const props = v.split("-");
    //       if (props.length < 2) throw new Error("Error decoding homes");
    //       return {
    //         prop1: props.length > 0 ? Number(props[0]) : -1,
    //         prop2: props.length > 1 ? props[1] : "error",
    //       };
    //     },
    //   },
    //   sample: { prop1: 23, prop2: "test" },
    //   match: (value) => {
    //     try {
    //       if (!value || typeof value !== "object") return false;
    //       if (!Object.hasOwn(value, "prop1") || !Object.hasOwn(value, "prop2"))
    //         return false;
    //       const v = value as { prop1: any; prop2: any };
    //       return typeof v.prop1 === "number" && typeof v.prop2 === "string";
    //     } catch {
    //       return false;
    //     }
    //   },
    // },
    myCustomObject: {
      category: "custom",
      match: (v) => {
        return typeof v === "object";
      },
      encodingMap: {
        encode: (v) => {
          return JSON.stringify(v);
        },
        decode: (v) => {
          return JSON.parse(v);
        },
      },
      sample: {} as { [key: string]: number | string | boolean },
    },
  },
});

// activator function helps to determine the corresponding type key given the type of the route keys and their params keys
const routeMapping = activator<RouteMapping>({
  root: {
    typeKeyMapping: {
      numbers: "numberArray", // <-- param key : type key (mapping)
      focus: "string",
      salutation: "string",
      display: "myCustomObject",
    },
    programmaticNavigate: false, // only read the query params for this route when naviating programmatically if set to true
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
