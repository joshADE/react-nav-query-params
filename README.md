# react-nav-query-params

> A react package for easily managing query parameters across various routes throughout an application with typescript support, serialization/deserialization, and error handling. Note: This package is still in development, so there may be some bugs, major changes over time.

[![NPM](https://img.shields.io/npm/v/react-nav-query-params.svg)](https://www.npmjs.com/package/react-nav-query-params) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-nav-query-params
```

## Guide

Note: This package is meant for mainly TypeScript users as it works best in in TypeScript based applications to type URL query parameters and group them based on routes. JavaScript user can still benefit from using this package, but they will not get all the advantages that the package has to offer.

### Setup

#### TypeScript(TS) Users
```tsx

// import the function from the package
import { createNavManager } from "react-nav-query-params";

// (Optional) Define strings or keys for your routes
export type RoutesType = "route1" | "route2" | "route3"; 

// (Suggested) Create a variable to store your route strings
export const Routes = {
  Route1: "route1",
  Route2: "route2",
  Route3: "route3",
} satisfies { [key in string]?: RoutesType };

// define the types of the query params that are passed or recieved in application
// keys are strings correspond to different pages or components (route key)
// values correspond to the name and type of the query params associated with route key (ignore for JavaScript users)


export type QueryParamTypeMapping  { // <-- * use type
    [Routes.Route1]: {
        param1: {[type in PagesType]?: boolean};
        param2: PagesType;
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
    }
}


// * there are limited types you can use with this package that are grouped into one 
// * of two categories based on how encoding/decoding is handled
// * simple types (SimpleType) => string | number | boolean | bigint
// * complex types => Record<string, SimpleType> | Date | Array<SimpleType>
// * encoding/decoding is done based on type key (a key associated with a specific type)

const { creator, activator } = createNavManager({
  customTypeKeyMapping: {}
});

// use the activator function returned to help enforce typescript's type checking / autocompletion
// activator function helps to determine the corresponding type key used for encoding/decoding given the type of each params keys

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
    },
  },
});


// call creator function with the routeMapping
// and you will get back a context to wrap around application(optional)
// as well as a hook to 'look up' functions that help manage each grouping of query params based on the route string provided

export const { NavQueryContext, useNavQueryParams } = creator(
  routeMapping
);

```


#### JavaScript(JS) Users
```jsx

// import the function from the package
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
    },
  },
});


// call creator function with the routeMapping
// and you will get back a context to wrap around application(optional)
// as well as a hook to 'look up' functions that help manage each grouping of query params based on the route key provided

export const { NavQueryContext, useNavQueryParams } = creator(
  routeMapping
);

```



### Usage(TS/JS Users)
```tsx

const router = createBrowserRouter([ // from react router v6
  {
    path: "/",
    element: <RouterPage />
  }
])

function App(){
  return (
    <div className="App">
      <NavQueryContext.Provider value={{}}>
        <RouterProvider router={router} />  {/* from react router v6 */}
      </NavQueryContext.Provider>
    </div>
  );
}

// A component where you read the query params
function ReadingParams(){
    const { getQueryParams: getQueryParamsRoute1, clearQueryParams: clearQueryParamsRoute1 } = useNavQueryParams(Routes.Route1);
    const { getQueryParams: getQueryParamsRoute2, clearQueryParams: clearQueryParamsRoute2 } = useNavQueryParams(Routes.Route2);
    const { getQueryParams: getQueryParamsRoute3, clearQueryParams: clearQueryParamsRoute3 } = useNavQueryParams(Routes.Route3);

    // all functions returned by the hook are memoized using useCallback,
    // getQueryParams has a dependency on the query string used in the url
    // so if the query string changes, all effects with the function as a
    // dependency will rerun


    useEffect(() => {
        console.log("route1:", getQueryParamsRoute1()); // logs out route1: { values, errors } -> values.param1, and errors.param1, etc...
        clearQueryParamsRoute1(); // clears all query params from url associated with route1
        console.log("route2:", getQueryParamsRoute2());
        clearQueryParamsRoute2();
        console.log("route3:", getQueryParamsRoute3());
        clearQueryParamsRoute3();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

  return (
    <div>
        Check the console to see the query params       
    </div>
  )
}

// In some other component...
function NavigatingAndSettingParams() {
  const { getQueryString  } = useNavQueryParams(Routes.Route1);

  const queryString = getQueryString({ param2: "route3", param1: { "route3": true }, param3: [10, 30] }, 
  { // (optional argument)
    replaceAllParams: true, // replace the current query params, when getting query string
    full: true, // include the '?' in query string
  });


  const navigate = useNavigate(); // from react router v6

 
    return (
    <div>
        <button onClick={() => navigate("route3" + queryString)}>Click Me</button>     
    </div>
  );
}

```

### List of Type Keys & Types
```tsx
type TypeKeys = {
  // simple types
  "string": string;
  "number": number;
  "bigint": bigint;
  "boolean": boolean;

  // complex types
  // array types
  "stringArray": string[];
  "numberArray": number[];
  "bigintArray": bigint[];
  "booleanArray": boolean[];
  // record types
  "stringRecord": Record<string, string>;
  "numberRecord": Record<string, number>;
  "bigintRecord": Record<string, bigint>;
  "booleanRecord": Record<string, boolean>;
  // date
  "date": Date;
};

```


### Custom Types / Type Keys

#### TypeScript(TS) Users
```tsx


function isNumericRange(value: unknown): value is [number, number] {
  return Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number";
}


const { creator, activator } = createNavManager({
  customTypeKeyMapping: { // <- define custom type keys to encode and decode
    customTypeKeyMapping: {
    numericRangeCustomType: {
      category: "custom", // <- always use "custom"
      sample: [1, 2] as [number, number], // <- sample value of the type
      encodingMap: { // <- specify a way to encode/decode type associated with key
        encode: (value) => {
          return JSON.stringify(value);
        },
        decode: (value) => { // <- can throw an Error inside the decode function saying the string value cannot be decoded
          const decoded = JSON.parse("["+value+"]"); 
          if (!isNumericRange(decoded)) throw new Error("Error while decoding");
          return decoded;
        },
      },
      match: (value) => { // <- specify a way to match for the type key given an unknown value (for error handling)
        return isNumericRange(value);
      },
    },
  }
});

creator() / activator() //<-- now has access to custom type/type key

```


#### JavaScript(JS) Users
```jsx


function isNumericRange(value) {
  return Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number";
}


const { creator, activator } = createNavManager({
  customTypeKeyMapping: { // <- define custom type keys to encode and decode
    customTypeKeyMapping: {
    numericRangeCustomType: {
      category: "custom", // <- always use "custom"
      sample: [1, 2], // <- sample value of the type
      encodingMap: { // <- specify a way to encode/decode type associated with key
        encode: (value) => {
          return JSON.stringify(value);
        },
        decode: (value) => { // <- can throw an Error inside the decode function saying the string value cannot be decoded
          const decoded = JSON.parse("["+value+"]"); 
          if (!isNumericRange(decoded)) throw new Error("Error while decoding");
          return decoded;
        },
      },
      match: (value) => { // <- specify a way to match for the type key given an unknown value (for error handling)
        return isNumericRange(value);
      },
    },
  }
});

creator() / activator() //<-- now has access to custom type/type key

```


