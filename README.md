# react-nav-query-params

> A react package for easily managing query parameters across various routes throughout an application with typescript support, serialization/deserialization, and error handling. 

## Install

(Coming soon)

## Usage

```tsx

// import the function from the package
import { createNavManager } from "react-nav-query-params";

export type PagesType = "route1" | "route2" | "route3";

// define the types of the query params that are passed or recieved in application
// keys correspond to different pages or components (route key)
// values correspond to the name and type of the query params associated with route key

export interface RouteMapping  {
    "route1": {
        param1: {[type in PagesType]?: boolean};
        param2: PagesType;
        param3: number[];
        param4: string;
        param9: {[type in PagesType]?: boolean};
    },
    "route2": {
        param5: boolean;
        param6: number;
    },
    "route3": {
        param7: "first" | "second" | "third";
        param8: string;
    }
}


// * there are limited types you can use with this package that are grouped into one of two 
// * categories based on how encoding/decoding is handled
// * simple types (SimpleType) => string | number | boolean | bigint
// * complex types => Record<string, SimpleType> | Date | Array<SimpleType>
// * encoding/decoding is done based on type key (a key associated with a specific type)

const { creator, activator } = createNavManager<{
  myCustomObject: { 
    [key: string]: number | string | boolean 
  }
}>({
  customTypeKeyMapping: { // <- define custom type keys to encode and decode
    myCustomObject: {
      category: "custom", // <- always use "custom"
      match: (v) => {     // <- specify a way to match for the type key given an unkown value (error handling)
        return typeof v === "object";
      },
      encodingMap: {      // <- specify a way to encode/decode type associated with key
        encode: (v) => {
          return JSON.stringify(v);
        },
        decode: (v) => {    // <- can throw an Error inside the decode function saying the string value cannot be decoded
          return JSON.parse(v);
        },
      },
      sample: {}        // <- sample value of the type
    },
  }
});

// use the activator function returned to help enforce typescript's type checking / autocompletion
// activator function helps to determine the corresponding type key used for encoding/decoding given the type of each params keys
const routeMapping = activator<RouteMapping>({
  route1: {
    typeKeyMapping: {
      param1: "booleanRecord", // <-- param key : type key (mapping)
      param2: "string",
      param3: "numberArray",
      param4: "string",
      param9: "myCustomObject", // could also be booleanRecord type key
    },
    programmaticNavigate: false, // only read the query params for this route when navigating programmatically if set to true
  },
  route2: {
    typeKeyMapping: {
      param5: "boolean",
      param6: "number",
    },
  },
  route3: {
    typeKeyMapping: {
      param7: "string",
      param8: "string",
    },
  },
});


// call creator function with the routeMapping
// and you will get back a context to wrap around application
// as well as a hook to 'look up' functions that help manage each grouping of query params based on the route key provided

export const { NavQueryContext, useNavQueryParams } = creator(
  routeMapping,
  {}, // object of options you can pass to createNavManager(same as the 'value' prop in NavQueryContext.Provider)
  { // object of configurations passed to the creator function. Here, you can specify to use a custom encoding/decoding function for a specific type key
    validTypeEncodingMapOverride: {
      stringRecord: {
        defaultValue: {}, // set the default value for the stringRecord type key 
      },
    },
  }
);


const router = createBrowserRouter([
  {
    path: "/",
    element: <RouterPage />
  }
])

const App = () => {
  return (
    <div className="App">
      <NavQueryContext.Provider value={{}}>
      <RouterProvider router={router} />
      </NavQueryContext.Provider>
    </div>
  );
}

const RouterPage = () => {
    const { getQueryParams: getQueryParamsRoute1, clearQueryParams: clearQueryParamsRoute1 } = useNavQueryParams("route1");
    const { getQueryParams: getQueryParamsRoute2, clearQueryParams: clearQueryParamsRoute2 } = useNavQueryParams("route2");
    const { getQueryParams: getQueryParamsRoute3, clearQueryParams: clearQueryParamsRoute3 } = useNavQueryParams("route3");

    useEffect(() => {
        console.log("route1:", getQueryParamsRoute1());
        clearQueryParamsRoute1();
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
const { getQueryString  } = useNavQueryParams("route1");

const queryString = getQueryString({ param2: "route3", param1: { "route3": true }, param3: [10, 30] }, 
{ 
  replaceAllParams: true, // replace the current query params, when getting query string
  full: true, // include the '?' in query string
});


const navigate = useNavigate(); // from react router v6

navigate("route3" + queryString);
// "/route3?param2=route3&param3=10%2C30&..."

// see example/react-router-v6 folder for a more detailed and complete example
```



