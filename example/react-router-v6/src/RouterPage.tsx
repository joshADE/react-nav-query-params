import React, { useCallback, useEffect } from "react";
import {
  PageType,
  PageRoutingData,
  linkToOtherPages,
  useNavQueryParams,
} from "./AppNavData";
import styles from "./RouterPage.module.css";
import {
  Route1Component,
  Route2Component,
  Route3Component,
} from "./SubRouteComponents";

interface Props {
  type: PageType;
}

const RouterPage = ({ type }: Props) => {
  const {
    getQueryParams: getQueryParamsRoute1,
    clearQueryParams,
  } = useNavQueryParams("route1");
  const { getQueryParams: getQueryParamsRoute2 } = useNavQueryParams("route2");
  const { getQueryParams: getQueryParamsRoute3 } = useNavQueryParams("route3");

  useEffect(() => {
    console.log("route1:", getQueryParamsRoute1());
    clearQueryParams({ behaviour: "replace" });
    console.log("route2:", getQueryParamsRoute2());

    console.log("route3:", getQueryParamsRoute3());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSubRouteComponenet = useCallback((t: PageType) => {
    switch (t) {
      case "route1":
        return <Route1Component key={t} />;
      case "route2":
        return <Route2Component key={t} />;
      case "route3":
        return <Route3Component key={t} />;
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
