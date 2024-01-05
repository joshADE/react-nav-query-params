import React, { useEffect, useMemo, useState } from "react";
import {
  useNavQueryParams,
  PageRoutingData,
  RouteMapping,
  linkToOtherPages,
} from "./AppNavData";
import Button from "./Button";
import styles2 from "./SubRouteComponent.module.css";

const Route1Component = () => {
  const type = "route1";
  const { title, route } = PageRoutingData[type];
  const {
    getQueryString: getQueryStringRoute1,
    clearQueryParams: clearQueryParamsRoute1,
  } = useNavQueryParams("route1");
  useEffect(() => {
    clearQueryParamsRoute1({ include: [] });
  }, [clearQueryParamsRoute1]);

  const [focus, setFocus] = useState<RouteMapping["route1"]["focus"]>("route2");
  const [display, setDisplay] = useState<RouteMapping["route1"]["display"]>({
    route2: true,
  });
  const [numbers, setNumbers] = useState<RouteMapping["route1"]["numbers"]>([
    10,
  ]);
  const [newNumber, setNewNumber] = useState<string>("0");

  const [names, setNames] = useState<RouteMapping["route1"]["names"]>([
    "Fred",
  ]);
  const [newName, setNewName] = useState<string>("John");

  const queryString = useMemo(() => {
    return getQueryStringRoute1(
      {
        focus,
        display,
        numbers,
        names,
      },
      { replaceAllParams: true }
    );
  }, [focus, getQueryStringRoute1, display, numbers, names]);

  // console.log("Route1Component", focus, display, numbers, names);
  return (
    <div className={styles2["section"]}>
      <h5 className={styles2["section-title"]}>{title}</h5>

      <div className={styles2["section-body"]}>
        <div className={styles2["param-container"]}>
          <h6 className={styles2["param-title"]}>
            Focus: <span className={styles2["param-type"]}>&lt;string&gt;</span>
          </h6>
          {linkToOtherPages[type].map((other) => {
            const id = `radio-${other}`;
            const { title } = PageRoutingData[other];
            return (
              <div key={other}>
                <label htmlFor={id}>{title}</label>
                <input
                  id={id}
                  type="radio"
                  name="focus"
                  value={other}
                  checked={focus === other}
                  onChange={(e) => e.target.checked && setFocus(other)}
                />
              </div>
            );
          })}
        </div>
        <div className={styles2["param-container"]}>
          <h6 className={styles2["param-title"]}>
            Display:{" "}
            <span className={styles2["param-type"]}>
              &lt;{`{[path: string]: boolean}`}&gt;
            </span>
          </h6>
          {linkToOtherPages[type].map((other) => {
            const id = `checkbox-${other}`;
            const { title } = PageRoutingData[other];
            return (
              <div key={other}>
                <label htmlFor={id}>{title}</label>
                <input
                  id={id}
                  type="checkbox"
                  name="display"
                  checked={display[other] ?? false}
                  onChange={() =>
                    setDisplay((d) => ({ ...d, [other]: !d[other] }))
                  }
                />
              </div>
            );
          })}
        </div>
        <div className={styles2["param-container"]}>
          <h6 className={styles2["param-title"]}>
            Numbers:{" "}
            <span className={styles2["param-type"]}>&lt;{`number[]`}&gt;</span>
          </h6>
          <div className={styles2["numbers"]}>
            {numbers.map((num, i) => {
              return <span key={i}>{i > 0 ? `, ${num}` : num}</span>;
            })}
          </div>
          <div className={styles2["numbers-controls"]}>
            <input
              className={styles2["input"]}
              type="text"
              name="numbers"
              value={newNumber}
              onChange={(e) => {
                const numberValue = Number(e.target.value);
                setNewNumber((prev) =>
                  isNaN(numberValue) ? prev : numberValue.toString()
                );
              }}
            />
            <button
              className={styles2["button"]}
              type="button"
              onClick={() => {
                setNumbers((prev) => prev.concat(Number(newNumber)));
                setNewNumber("0");
              }}
            >
              Push
            </button>
            <button
              className={styles2["button"]}
              type="button"
              onClick={() => {
                setNumbers((prev) =>
                  prev.filter((_, i) => i !== prev.length - 1)
                );
              }}
            >
              Pop
            </button>
            <button
              className={styles2["button"]}
              type="button"
              onClick={() => {
                setNumbers([]);
              }}
            >
              Clear
            </button>
          </div>
        </div>
        <div className={styles2["param-container"]}>
          <h6 className={styles2["param-title"]}>
            Names:{" "}
            <span className={styles2["param-type"]}>&lt;{`string[]`}&gt;</span>
          </h6>
          <div className={styles2["numbers"]}>
            {names.map((n, i) => {
              return <span key={i}>{i > 0 ? `, ${n}` : n}</span>;
            })}
          </div>
          <div className={styles2["numbers-controls"]}>
            <input
              className={styles2["input"]}
              type="text"
              name="names"
              value={newName}
              onChange={(e) => {
                const newName = e.target.value;
                setNewName(newName);
              }}
            />
            <button
              className={styles2["button"]}
              type="button"
              onClick={() => {
                if(newName){
                  setNames((prev) => prev.concat(newName));
                  setNewName("");
                }
              }}
            >
              Push
            </button>
            <button
              className={styles2["button"]}
              type="button"
              onClick={() => {
                setNames((prev) =>
                  prev.filter((_, i) => i !== prev.length - 1)
                );
              }}
            >
              Pop
            </button>
            <button
              className={styles2["button"]}
              type="button"
              onClick={() => {
                setNames([]);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      <div className={styles2["query"]}>
        Query String: <span>{queryString}</span>
      </div>
      <Button
        to={route}
        isParamButton
        queryParamString={queryString}
      />
    </div>
  );
};

const Route2Component = () => {
  const type = "route2";

  const { title, route } = PageRoutingData[type];
  const {
    getQueryString: getQueryStringRoute2,
    clearQueryParams: clearQueryParamsRoute2,
  } = useNavQueryParams(type);
  useEffect(() => {
    clearQueryParamsRoute2();
  }, [clearQueryParamsRoute2]);

  const [defaultViewCount, setDefaultViewCount] =
    useState<RouteMapping["route2"]["defaultViewCount"]>(1);
  const [openModal, setOpenModal] =
    useState<RouteMapping["route2"]["openModal"]>(false);

  const queryString = useMemo(() => {
    return getQueryStringRoute2(
      { defaultViewCount, openModal },
      { replaceAllParams: true }
    );
  }, [defaultViewCount, getQueryStringRoute2, openModal]);
  return (
    <div className={styles2["section"]}>
      <h5 className={styles2["section-title"]}>{title}</h5>

      <div className={styles2["section-body"]}>
        <div className={styles2["param-container"]}>
          <h6 className={styles2["param-title"]}>
            DefaultViewCount:{" "}
            <span className={styles2["param-type"]}>&lt;number&gt;</span>
          </h6>
          <input
            className={styles2["input"]}
            type="text"
            name="focus"
            value={defaultViewCount}
            onChange={(e) => {
              const numberValue = Number(e.target.value);
              setDefaultViewCount((prev) =>
                isNaN(numberValue) ? prev : numberValue
              );
            }}
          />
        </div>
        <div className={styles2["param-container"]}>
          <h6 className={styles2["param-title"]}>
            OpenModal:{" "}
            <span className={styles2["param-type"]}>&lt;{`boolean`}&gt;</span>
          </h6>
          <div>
            <label htmlFor={"openModal"}>isOpen:</label>
            <input
              id={"openModal"}
              type="checkbox"
              checked={openModal ?? false}
              onChange={(e) => setOpenModal(e.target.checked)}
            />
          </div>
        </div>
      </div>
      <div className={styles2["query"]}>
        Query String: <span>{queryString}</span>
      </div>
      <Button to={route} isParamButton queryParamString={queryString} />
    </div>
  );
};

const Route3Component = () => {
  const type = "route3";

  const { title, route } = PageRoutingData[type];
  const {
    getQueryString: getQueryStringRoute3,
    clearQueryParams: clearQueryParamsRoute3,
  } = useNavQueryParams(type);
  useEffect(() => {
    clearQueryParamsRoute3({ exclude: ["name"] });
  }, [clearQueryParamsRoute3]);

  const [name, setName] = useState<RouteMapping["route3"]["name"]>("Bob");
  const [trigger, setTrigger] =
    useState<RouteMapping["route3"]["trigger"]>("first");

  const queryString = useMemo(() => {
    return getQueryStringRoute3(
      { name, trigger },
      { replaceAllParams: true, keyOrder: { trigger: -1 } }
    );
  }, [name, getQueryStringRoute3, trigger]);

  return (
    <div className={styles2["section"]}>
      <h5 className={styles2["section-title"]}>{title}</h5>

      <div className={styles2["section-body"]}>
        <div className={styles2["param-container"]}>
          <h6 className={styles2["param-title"]}>
            Name: <span className={styles2["param-type"]}>&lt;string&gt;</span>
          </h6>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className={styles2["param-container"]}>
          <h6 className={styles2["param-title"]}>
            Trigger:{" "}
            <span className={styles2["param-type"]}>
              &lt;{`"first" | "second" | "third"`}&gt;
            </span>
          </h6>
          {(["first", "second", "third"] as const).map((trig, index) => {
            const id = `${trig}-${index}`;
            return (
              <div key={id}>
                <label htmlFor={id}>{trig}</label>
                <input
                  id={id}
                  type="radio"
                  name="trigger"
                  checked={trigger === trig}
                  onChange={() => setTrigger(trig)}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles2["query"]}>
        Query String: <span>{queryString}</span>
      </div>
      <Button to={route} isParamButton queryParamString={queryString} />
    </div>
  );
};

export { Route1Component, Route2Component, Route3Component };
