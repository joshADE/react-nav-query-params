import { createNavManager, activator } from 'react-nav-query-params';


export const PageRoutingData = {
    root: { key: "root", route: "/", title: "Main" },
    home: { key: "home", route: "/home", title: "Home" },
    components: { key: "components", route: "/components", title: "Components" },
}

export const linkToOtherPages : { [type in PageType]: Exclude<PageType, type>[] } = {
    root: ["components", "home"],
    home: ["root"],
    components: ["root", 'home'],
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
    "components": {
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
            display: { components: true }, // mapped object types must have one entry in sample and the type of the entry will be the value type
        },
        programmaticNavigate: true, // only read the query params for this route when naviating programmatically
    },
    "home": {
        sample: {
            openModal: false,
            defaultViewCount: 1,
        },
    },
    "components": {
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
            "advanced-record": {
                encode: (v, o) => {
                    const oS = o?.['advanced-record']?.objectStartSeparator ?? "+";
                    return oS + "test";
                },
                decode: (v, o) => {
                    return {}
                },
                defaultValue: {}
            }
        },
        encodingOptions: {
            "advanced-record": {
                objectEndSeperator: "}",
                objectStartSeparator: "{",
                entrySeperator: ",",
                keyValueSeperator: ":"
            }
        }
    }
    );

