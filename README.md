# react-nav-query-params

> A react package for easily managing query parameters across various routes throughout an application with typescript support, serialization/deserialization, and error handling. 

## Usage

```tsx
import React, { useState } from 'react';
import { createNavManager } from "react-nav-query-params";
import { RouterProvider, createBrowserRouter, useNavigate } from 'react-router-dom';

export const PageRoutingData = {
  root: { key: "root", route: "/", title: "Main" },
  home: { key: "home", route: "/home", title: "Home" },
  people: { key: "people", route: "/people", title: "People" },
};

export type PageType = keyof typeof PageRoutingData;

export const linkToOtherPages: {
  [type in PageType]: Exclude<PageType, type>[];
} = {
  root: ["people", "home"],
  home: ["root"],
  people: ["root", "home"],
};

// define the types of the query params are that passed or recieved in application
// keys correspond to different pages or components (route key)
// values correspond to the name and type of the query params associated with route key

export interface RouteMapping  {
    "root": {
        display: {[type in PageType]?: boolean};
        focus: PageType;
        numbers: number[];
        salutation: string;
    },
    "home": {
        openModal: boolean;
        defaultViewCount: number;
    },
    "people": {
        trigger: "first" | "second" | "third";
        name: string;
    }
}


// * there are limited types you can use with this package that are grouped into one of two categories based on how encoding/decoding is handled
// * simple types (SimpleType) => string | number | boolean | bigint
// * complex types => Record<string, SimpleType> | Date | Array<SimpleType>
// * encoding/decoding is done based on type key (a key associated with a specific type)

const { creator, activator } = createNavManager({
  customTypeKeyMapping: {},
});

// creating the routeMapping with activator function helps enforce typescript's type checking / autocompletion
// activator function helps to determine the corresponding type key given the type of the route keys and their params keys
const routeMapping = activator<RouteMapping>({
  root: {
    typeKeyMapping: {
      numbers: "numberArray", // <-- param key : type key (mapping)
      focus: "string",
      salutation: "string",
      display: "booleanRecord",
    },
    programmaticNavigate: false, // only read the query params for this route when navigating programmatically if set to true
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


// call creator function with the routeMapping
// and you will get back a context to wrap around application
// as well as a hook to 'look up' functions that help manage groups of query params names and types based on route key provided
export const { NavQueryContext, useNavQueryParams } = creator(
  routeMapping,
  {}, // object of options you can pass to createNavManager(same as the 'value' prop in NavQueryContext.Provider) so you can override the inital options when creating context provider
  { // object of configurations passed to the creator function. Here, you can specify to use a custom encoding/decoding function for a specific type key or change the default value
    validTypeEncodingMapOverride: {
      stringRecord: {
        defaultValue: {}, // set the default value for the stringRecord type key (can also specify default for each param key when using hook, but this value will be a fallback)
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
    const { getQueryParams: getQueryParamsRoot, clearQueryParams: clearQueryParamsRoot  } = useNavQueryParams("root");
    const { getQueryParams: getQueryParamsHome, clearQueryParams: clearQueryParamsHome  } = useNavQueryParams("home");
    const { getQueryParams: getQueryParamsPeople, clearQueryParams: clearQueryParamsPeople  } = useNavQueryParams("people");

    useEffect(() => {
        console.log("root:", getQueryParamsRoot());
        clearQueryParamsRoot();
        console.log("home:", getQueryParamsHome());
        clearQueryParamsHome();
        console.log("people:", getQueryParamsPeople());
        clearQueryParamsPeople();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

  return (
    <div>
        Check the console to see the query params       
    </div>
  )
}

// In some other component...
const { getQueryString  } = useNavQueryParams("root");

const queryString = getQueryString({ focus: "people", display: { "home": true }, numbers: [10, 30] }, 
{ 
  replaceAllParams: true, // replace the current query params, when getting query string
  full: true, // include the '?' in query string
});


const navigate = useNavigate(); // from react router v6

navigate("testpath" + queryString);
// "/testpath?focus=people&number=10%2C30&..."



// see example/react-router-v6 folder for a more detailed and complete example
```
