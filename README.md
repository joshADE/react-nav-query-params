# react-nav-query-params

> A react package for easily managing query parameters across various routes throughout an application with typescript support, serialization/deserialization, and error handling. Note: This package is still in development, so there may be some bugs and major changes over time.

[![NPM](https://img.shields.io/npm/v/react-nav-query-params.svg)](https://www.npmjs.com/package/react-nav-query-params) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-nav-query-params
```

## Guide

Note: This package is meant for mainly TypeScript users as it works best in TypeScript-based applications to type URL query parameters and group them based on routes. JavaScript users can still benefit from using this package, but they will not get all the advantages that the package has to offer.

### Defining the Routes and Param Keys

#### TypeScript(TS) Users
```tsx

// Import the function from the package
import { createNavManager } from "react-nav-query-params";

// (Suggested) Create a variable to store your route key strings
export const Routes = {
  Route1: "route1",
  Route2: "route2",
  Route3: "route3",
};

// (Optional) Define the types of query params that are used in the application grouped by route keys used above
// keys are strings corresponding to different pages or components (route key)
// values correspond to the name and type of the query params associated with the route key (ignore if not using TypeScript (JavaScript users))

type SampleStringUnion = "one" | "two" | "three";

enum SampleEnum = {
  one = "one",
  two = "two",
  three = "three"
}

export type QueryParamTypeMapping  { // <-- * use type
    [Routes.Route1]: {
        param1: {[sample in SampleStringUnion]?: boolean};
        param2: SampleStringUnion;
        param3: number[];
        param4: string;
    },
    [Routes.Route2]: {
        param5: boolean;
        param6: number;
    },
    [Routes.Route3]: {
        param7: "first" | "second" | "third";
        param8: string;
        param9: SampleEnum;
    }
}


// * there are limited types you can use with this package that are grouped into one 
// * of two categories based on how encoding/decoding is handled
// * simple types (SimpleType) => string | number | boolean | bigint
// * complex types => Record<string, SimpleType> | Date | Array<SimpleType>
// * encoding/decoding is done based on type key (a key associated with a specific type)
// The supported type keys are listed  below under the section 'List of Type Keys & Types'

const { creator, activator } = createNavManager({
  customTypeKeyMapping: {}
});

// use the activator function returned to help enforce typescript's type checking/auto-completion
// activator function helps to determine the corresponding type key used for encoding/decoding given the type of each params keys
// (could also exclude the generic argument, as seen in the JS example below)

const routeMapping = activator<QueryParamTypeMapping>({ 
  [Routes.Route1]: {
    typeKeyMapping: {
      param1: "booleanRecord", // <-- param key : type key (mapping)
      param2: "string",
      param3: "numberArray",
      param4: "string",
    },
    programmaticNavigate: false, // for reading query params (optional)
  },
  [Routes.Route2]: {
    typeKeyMapping: {
      param5: "boolean",
      param6: "number",
    },
  },
  [Routes.Route3]: {
    typeKeyMapping: {
      param7: "string",
      param8: "string",
      param9: "stringEnum",
    },
    options: { // here you can specify extra options for the 
              // param key based on the type key that is used
      param9: { // param9 is a 'stringEnum' which has an option of enumType
                // to specify the valid values when encoding/decoding
        enumType: Object.values(SampleEnum),
      },
    }
  },
});


// call creator function with the routeMapping
// and you will get back a context to wrap around the application
// as well as a hook to manage the query params given a specific route key
// (Refer to the 'Usage' section below)

export const { NavQueryContext, useNavQueryParams } = creator(
  routeMapping
);

```


#### JavaScript(JS) Users
```jsx

// Import the function from the package
import { createNavManager } from "react-nav-query-params";

// (Suggested) Create a variable to store your route strings
export const Routes = {
  Route1: "route1",
  Route2: "route2",
  Route3: "route3",
};

// * there are limited types you can use with this package that are grouped into one 
// * of two categories based on how encoding/decoding is handled
// * simple types (SimpleType) => string | number | boolean | bigint
// * complex types => Record<string, SimpleType> | Date | Array<SimpleType>
// * encoding/decoding is done based on type key (a key associated with a specific type)
// The supported type keys are listed  below under the section 'List of Type Keys & Types'

const { creator, activator } = createNavManager({
  customTypeKeyMapping: {}
});


const routeMapping = activator({ 
  [Routes.Route1]: {
    typeKeyMapping: {
      param1: "booleanRecord", // <-- param key : type key (mapping)
      param2: "string",
      param3: "numberArray",
      param4: "string",
    },
    programmaticNavigate: false, // for reading query params (optional)
  },
  [Routes.Route2]: {
    typeKeyMapping: {
      param5: "boolean",
      param6: "number",
    },
  },
  [Routes.Route3]: {
    typeKeyMapping: {
      param7: "string",
      param8: "string",
      param9: "stringEnum",
    },
    options: { // here you can specify extra options for the 
              // param key based on the type key that is used
      param9: { // param9 is a 'stringEnum' which has an option of enumType
                // to specify the valid values when encoding/decoding
        enumType: Object.values(SampleEnum),
      },
    }
  },
});


// call creator function with the routeMapping
// and you will get back a context to wrap around the application
// as well as a hook to manage the query params given a specific route key
// (Refer to the 'Usage' section below)

export const { NavQueryContext, useNavQueryParams } = creator(
  routeMapping
);

```



### Setup(Both TS/JS Users)
```tsx

// (example below uses react-router v6, and will look slightly different for other routing solutions)
// (This example is much more complicated because of how react-router v6 defines routes
// and how it prevents access to the location and history object from the components that are not used inside the main Browser router object) 
// (For other routing solutions, such as Next.js router the setup may be easier)
// The main purpose of this step is to provide the package access to the location and history objects
// used by your routing solution so that the package can read and update the query params


// If you are using react-router v6, add a component 'RouteBasePage' to the root of your router with the path '/'
// that uses the 'NavQueryContext' given by this package (look below for the implementation of RouteBasePage)
const router = createBrowserRouter([ // from react-router v6
  {
      path: "/",
      element: <RouteBasePage />,
      children: [{
          path: "/",
          element: <ReadingParams />,
          index: true,
        },
        {
          path: "/route1",
          element: <NavigatingAndSettingParams />
        }]
    }
])

// In the root App component... 
function App(){
  return (
    <div className="App">
        <RouterProvider router={router} />  {/* from react-router v6 */}
    </div>
  );
}



// In a child component of the app component need to create an adapter object that tells this package how to manage history and location objects.
// need access to the history.push/replace and location data from the react-router v6

import { Adapter } from "react-nav-query-params"; //<-- TS users only
import { useLocation, useNavigate, Outlet } from "react-router-dom"; //<-- react router v6 users only

function RouteBasePage(){
  // The following is specific to react-router v6 and might look different for each routing solution, 
  // but the adapter created needs to be provided in a similar manner in the NavQueryContext.Provider
  // or else the useNavQueryParams hook will not work

  const location = useLocation(); // <-- for react-router, can only be called in a child component of RouterProvider
  const navigate = useNavigate(); // <-- for react-router, can only be called in a child component of RouterProvider

  const adapter = useMemo(() => { //<-- JS users, const adapter = useMemo<Adapter>(() => { //<-- TS users
    return {
      location: location,
      pushLocation: (l) => { // the type of 'l' here is Adapter["location"] for TS users
        if (l.search !== null || l.search !== undefined)
          navigate("?" + l.search, { replace: false });
      },
      replaceLocation: (l) => {
        if (l.search !== null || l.search !== undefined)
          navigate("?" + l.search, { replace: true });
      },
    };
  }, [location, navigate]);
  
  return (
    <NavQueryContext.Provider
      value={{
        adapter: adapter,
      }}
    >
      <Outlet />
    </NavQueryContext.Provider>
  );
}

```

### Usage(Both TS/JS Users)
```tsx

// A component where you read the query params
function ReadingParams(){
    const { getQueryParams: getQueryParamsRoute1, clearQueryParams: clearQueryParamsRoute1 } = useNavQueryParams(Routes.Route1);

    // All functions returned by the hook are memoized using useCallback,
    // getQueryParams has a dependency on the query string used in the URL
    // so if the query string changes, all dependency arrays with the 
    // function as a dependency will rerun

    // url: localhost:3000/route1?param1=%7B%22one%22%3Atrue%7D&param2=three

    console.log(
      "Value of param2 query param is 'two': ",
      getQueryParamsRoute1().values?.param2 === "two") //<-- false

    // getQueryParamsRoute1 function will get the query params that 
    // are associated with the 'route1' route key which is mapped to the 
    // the url path route1 


     

  return (
    <div>
    {/* The below button is optional */}
      <button
        // clearQueryParamsRoute1 clears all query params from 
        // url associated with route1
        onClick={() => { clearQueryParamsRoute1() }}
      >
        Clear Params
      </button>
        Check the console to see the query params       
    </div>
  )
}

// In some other component...
function NavigatingAndSettingParams() {
  const { getQueryString  } = useNavQueryParams(Routes.Route1);

  const queryString = getQueryString({ param2: "three", param1: { "three": true }, param3: [10, 30] }, 
  { // (optional argument)
    replaceAllParams: true, // replace the current query params, when getting the query string
    full: true, // include the '?' in the query string
  });


  const navigate = useNavigate(); // from react router v6

    // url: localhost:3000/route1?param2=three&param1=%7B%three%22%3Atrue%7D&
    // param3=10%2C30

 
    return (
    <div>
        <button onClick={() => navigate("/route1" + queryString)}>Click Me</button>     
    </div>
  );
}

```

### List of Provided Type Keys & Types & Options
```tsx
// (It is possible to create your own type keys / types as well as options)
// (Look below at the Custom Types / Type Keys section)
type TypeKeys = {
  // simple types
  "string": string;
  "number": number;
  "boolean": boolean;

  // complex types
  // array types
  "stringArray": string[];
  "numberArray": number[];
  "booleanArray": boolean[];
  // record types
  "stringRecord": Record<string, string>;
  "numberRecord": Record<string, number>;
  "booleanRecord": Record<string, boolean>;
  // enums
  "stringEnum": string;
  "numberEnum": number;
  // date
  "date": Date;
};

type TypeKeyToOptions = {
  // array types
  stringArray: { 
    separator: string; // specify the separator used when encoding/decoding
                        // the array i.e. '*' rather than ','(%2C)
    expanded?: boolean; // set to true to encode in the long form (i.e. param3=20&param3=40)
                        // rather than short form (param3=20,40)
  };
  numberArray: { 
    separator: string; 
    expanded?: boolean; 
  };
  booleanArray: { 
    separator: string; 
    expanded?: boolean; 
  };
  // record types
  stringRecord: {
      objectStartSeparator?: string; // replaces the objectStartSeparator character'{' when 
                                      // encoding/decoding
      objectEndSeparator?: string;
      objectEntrySeparator?: string;
      keyValueSeparator?: string;
  };
  numberRecord: {
      objectStartSeparator?: string;
      objectEndSeparator?: string;
      objectEntrySeparator?: string;
      keyValueSeparator?: string;
  };
  booleanRecord: {
      objectStartSeparator?: string;
      objectEndSeparator?: string;
      objectEntrySeparator?: string;
      keyValueSeparator?: string;
      parseNumbers?: boolean;
  };
  stringEnum: {
      enumType: string[]; // specify the allowed values used when encoding/decoding the enum 
                          // i.e. Object.values(EnumType) where all the values have 
                          // to extends the string type
  };
  numberEnum: {
      enumType: number[];
  };
  // date
  date: { 
      format?: "ISO", // specify the format (currently the only supported format is ISO)
      hyphenSeperator: string;  // replaces the hyphenSeperator character'-' when 
                                // encoding/decoding the ISO date
      colonSeperator: string;
  };
};

```


### Custom Types / Type Keys

#### TypeScript(TS) Users
```tsx


function isNumericRange(value: unknown): value is [number, number] {
  return Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number";
}


const { creator, activator } = createNavManager<{
  numericRange: [number, number]; // <-- name: type of custom typekey
},{
  numericRange: { expanded?: boolean, test: string },  // <-- name: options (must be object type) of custom typekey
}>
({
  customTypeKeyMapping: { // <- define custom type keys to encode and decode
    numericRange: {
      category: "custom", // <- always use "custom"
      defaultValue: [0, 1] // <-- optional default value(used for type setting)
      encodingMap: { // <- specify a way to encode/decode type associated with the custom type key
        encode: (value, options) => { // <-- encode funtion takes in a value matching the type ([number, number]) and must return a string or string[]
          return JSON.stringify(value);
        },
        decode: (value, options) => {  // <-- decode funtion takes in a string or string[] and 
          // must return a value matching the type ([number, number])
          // <- You can also throw an Error inside the decode function saying the string 
          // value cannot be decoded
          let valueToDecode = "";
          if (Array.IsArray(value)){
            // value here is string[],(i.e. param3=20%2C3&param3=40%2C5 => 
            // ['[20,3]','[40,5]']) so get the first entry (or use all the entries if you prefer
            // by checking the expanded property from the options object)
            valueToDecode = value[0];
          }
          const decoded = JSON.parse(valueToDecode); 
          if (!isNumericRange(decoded)) throw new Error("Error while decoding");
          return decoded; // <-- [20, 3]
        },
        encodingOptions: { // <- optionally specify default options for encoding/decoding
          expanded: true,
          test: "test",
        },
      },
      match: (value) => { // <- optianally specify a way to match for the type key given an unknown value (for error handling)
        return isNumericRange(value);
      },
    },
  }
});

creator() / activator() //<-- now have access to custom type/type key

```


#### JavaScript(JS) Users
```jsx

// Creating custom type keys with this package using only JavaScript is very difficult because
// javascript does allow you to specify types (niether does it enforce type checking)
// and any custom type key you create with have the associated type of any, but you can still use
// the package to create type keys that enforce/validate the query params

function isNumericRange(value) {
  return Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number";
}


const { creator, activator } = createNavManager({
  customTypeKeyMapping: { // <- define custom type keys to encode and decode
    numericRange: {
      category: "custom", // <- always use "custom"
      defaultValue: [0, 1], // <-- optional default value(used for type setting)
      encodingMap: { // <- specify a way to encode/decode type associated with the custom type key
        encode: (value, options) => { // <-- encode funtion takes in a value matching the type (any) and must return a string or string[]
          return JSON.stringify(value);
        },
        decode: (value, options) => {  // <-- decode funtion takes in a string or string[] and 
          // must return a value matching the type (any)
          // <- You can also throw an Error inside the decode function saying the string 
          // value cannot be decoded
          let valueToDecode = "";
          if (Array.IsArray(value)){
            // value here is string[],(i.e. param3=20%2C3&param3=40%2C5 => 
            // ['[20,3]','[40,5]']) so get the first entry (or use all the entries if you prefer
            // by checking the expanded property from the options object)
            valueToDecode = value[0];
          }
          const decoded = JSON.parse(valueToDecode); 
          if (!isNumericRange(decoded)) throw new Error("Error while decoding");
          return decoded; // <-- [20, 3]
        },
        encodingOptions: { // <- optionally specify default options for encoding/decoding
          expanded: true,
          test: "test",
        },
      },
      match: (value) => { // <- optianally specify a way to match for the type key given an unknown value (for error handling)
        return isNumericRange(value);
      },
    },
  }
});

creator() / activator() //<-- now have access to custom type/type key

```

### Functions returned by useNavQueryParams(routeKey)

- getQueryString(newParams, options?)
  - Args
    - newParams: Object containing the new values for each param key of the associated route key, a value of null will remove an existing param if it present in the current url query string
      - e.g. { param3: [12] } <- param3 will be set to param3=12 in the query string
    - options: Object containing one of the following options
      - full: (optional boolean) Specify whether to include the '?' in the query string
      - replaceAllParams: (optional boolean) Specify whether to replace all current query params
      - keyOrder: (optional object) Specify the order in which the query params associated with the route key will appear in the query string
        - e.g. { param1: 4, param2: 2 } <- param2 will appear before param1 in the string as it has a lower order number
   - Returns: the query string
- getQueryParams(options?)
  - Args
    - options: Object containing one of the following options
      - useDefaults: (optional array) An array containing a list of param keys to use default values
        - e.g. ["param3"] <- if param3 has a default value, it will be used when an error is thrown while decoding 
      - defaults: (optional object) Specify the default values that are returned if it fails to decode a specific param key value
        - e.g. { param3: [0] } <- param3 will default to '[0]' if it attempted to decode an invalid value and threw an error
   - Returns: Object containing the below key/value pairs
      - values: (object) Contains the values of the param keys that were successfully decoded 
        - e.g. { param3: [10, 30] } <- param3 will be a array of number | undefined
      - errors: (object) Contains error data about the param keys that failed to be decoded
        - e.g.  { param3: { expectedType: "numberArray", actualType: "number", errorStringValue: "15" } }
- clearQueryParams(options?)
  - Args
    - options: Object containing one of the following options
      - behavior: (optional string) Specify either "replace" to replace the entry in the browser history, or "push" to add to the history 
      - include: (optional array) Specify the param keys to include only when clearing the query params
        - e.g. ["param1", "param3"] <- param1/param3 only will be removed from the URL
      - exclude: (optional array) Specify the param keys to exclude when clearing the query params (takes precedence over include array, if include is not provided, it will clear the other params)
        - e.g. ["param1", "param3"] <- param2/param4 only will be removed from the URL and param1/param3 will be left
   - Returns: void
