import React, { useCallback, useEffect } from "react";
import {
  PageType,
  PageRoutingData,
  linkToOtherPages,
  useNavQueryParams,
} from "./AppNavData";
import styles from "./RouterPage.module.css";
import {
  PeopleComponent,
  HomeComponent,
  RootComponent,
} from "./SubRouteComponents";

interface Props {
  type: PageType;
}

const RouterPage = ({ type }: Props) => {
  const { getQueryParams: getQueryParamsRoot, clearQueryParams } =
    useNavQueryParams("root");
  const { getQueryParams: getQueryParamsHome } = useNavQueryParams("home");
  const { getQueryParams: getQueryParamsPeople } = useNavQueryParams("people");

  useEffect(() => {
    console.log("root:", getQueryParamsRoot());
    clearQueryParams({ behaviour: "replace" });
    console.log("home:", getQueryParamsHome());

    console.log("people:", getQueryParamsPeople());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSubRouteComponenet = useCallback((t: PageType) => {
    switch (t) {
      case "root":
        return <RootComponent key={t} />;
      case "home":
        return <HomeComponent key={t} />;
      case "people":
        return <PeopleComponent key={t} />;
      default:
        return <></>;
    }
  }, []);

  const { title, route } = PageRoutingData[type];
  return (
    <div className={styles["content"]}>
      <div className={styles["titleWrapper"]}>
        <h1>
          Viewing <span className={styles["code"]}>{title}</span> Page at{" "}
          <span className={styles["code"]}>&lt;{route}&gt;</span>
        </h1>
      </div>
      <div className={styles["container"]}>
        <h3>Navigate To:</h3>
        <p>
          (Check the console to see the decoded query paramas from the last
          visited page)
        </p>
        <div className={styles["navigations"]}>
          {linkToOtherPages[type].map((elem) => {
            return getSubRouteComponenet(elem);
          })}
        </div>
      </div>
    </div>
  );
};

export default RouterPage;
