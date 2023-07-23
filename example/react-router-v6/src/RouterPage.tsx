import React, { useCallback, useMemo } from "react";
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
  const { getQueryParams: getQueryParamsRoute1 } = useNavQueryParams("route1");
  const { getQueryParams: getQueryParamsRoute2 } = useNavQueryParams("route2");
  const { getQueryParams: getQueryParamsRoute3 } = useNavQueryParams("route3");

  const data = useMemo(() => {
    const route1 = ("route1: " + JSON.stringify(getQueryParamsRoute1(), null, 2));

    const route2 = ("route2: " + JSON.stringify(getQueryParamsRoute2(), null, 2));

    const route3 = ("route3: " + JSON.stringify(getQueryParamsRoute3(), null, 2));

  
    return `${route1}\n\n${route2}\n\n${route3}`;
  }, [getQueryParamsRoute1, getQueryParamsRoute2, getQueryParamsRoute3]);

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
      <div className={styles["textarea-wrapper"]}>
        <textarea
          cols={100}
          className={styles["textarea"]} 
          readOnly
          value={data}
          
        />
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
