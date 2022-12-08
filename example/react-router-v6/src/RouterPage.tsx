import React, { useCallback, useEffect } from 'react';
import { PageType, PageRoutingData, linkToOtherPages, useNavQueryParams } from './AppNavData';
import styles from "./RouterPage.module.css"
import { CompComponent, HomeComponent, RootComponent } from './SubRouteComponents';

interface Props {
    type: PageType,
}

const RouterPage = ({
    type,
}:Props) => {
    const { getQueryParams: getQueryParamsRoot, clearQueryParams: clearQueryParamsRoot  } = useNavQueryParams("root");
    const { getQueryParams: getQueryParamsHome, clearQueryParams: clearQueryParamsHome  } = useNavQueryParams("home");
    const { getQueryParams: getQueryParamsComp, clearQueryParams: clearQueryParamsComp  } = useNavQueryParams("components");

    useEffect(() => {
        console.log("root:", getQueryParamsRoot());
        clearQueryParamsRoot();
        console.log("home:", getQueryParamsHome());
        clearQueryParamsHome();
        console.log("components:", getQueryParamsComp());
        clearQueryParamsComp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getSubRouteComponenet = useCallback((t:PageType) => {
        switch(t){
            case "root":
                return <RootComponent key={t} />;
            case "home":
                return <HomeComponent key={t} />;
            case "components":
                return <CompComponent key={t} />;
            default:
                return <></>;
        }
    }, [])

    const { title, route } = PageRoutingData[type];
  return (
    <div className={styles["content"]}>
        <div className={styles["titleWrapper"]}>
            <h1>Viewing <span className={styles["code"]}>{title}</span> Page at <span className={styles["code"]}>&lt;{route}&gt;</span></h1>
        </div>
        <div className={styles["container"]}>
            <h3>Navigate To:</h3>

            <div className={styles["navigations"]}>
                {linkToOtherPages[type].map(elem => {
                    return (getSubRouteComponenet(elem));
                })}
            </div>

        </div>        
    </div>
  )
}

export default RouterPage