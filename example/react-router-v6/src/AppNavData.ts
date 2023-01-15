import { createNavManager, activator } from 'react-nav-query-params';


export const PageRoutingData = {
    root: { key: "root", route: "/", title: "Main" },
    home: { key: "home", route: "/home", title: "Home" },
    people: { key: "people", route: "/people", title: "People" },
}

export const linkToOtherPages : { [type in PageType]: Exclude<PageType, type>[] } = {
    root: ["people", "home"],
    home: ["root"],
    people: ["root", 'home'],
}  

export type PageType = keyof typeof PageRoutingData;


// do not include optional types in the route mapping object type


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


const routeMapping = activator<RouteMapping>({
    "root": {
        sample: {
            numbers: [1], // array types must have one entry in sample and the type of the entry will be the value type
            focus: "home",
            salutation: "Jo",
            display: { people: true }, // object types must have one entry in sample and the type of the entry will be the value type
        },
        programmaticNavigate: true, // only read the query params for this route when naviating programmatically
    },
    "home": {
        sample: {
            openModal: false,
            defaultViewCount: 1,
        },
    },
    "people": {
        sample: {
            trigger: "first",
            name: "Joe",
        },
    },
});

export const { NavQueryContext, useNavQueryParams } = createNavManager(
    routeMapping, 
    {}, 
    {
        encodingMap: {
            "record": {
                encode: (v, o) => {
                    const oS = o?.['record']?.objectStartSeparator ?? "+";
                    return oS + "test";
                },
                decode: (v) => {
                    return {}
                },
                defaultValue: {}
            }
        },
        encodingOptions: {
            "record": {
                objectEndSeperator: "}",
                objectStartSeparator: "{",
                entrySeperator: ",",
                keyValueSeperator: ":"
            }
        }
    }
);

