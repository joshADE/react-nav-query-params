import React, { useMemo, useState } from 'react';
import { useNavQueryParams, PageRoutingData, RouteMapping, linkToOtherPages } from './AppNavData';
import Button from './Button';
import styles2 from "./SubRouteComponent.module.css";


const RootComponent = () => {
  const type = "root";

  const { title, route } = PageRoutingData[type];
  const { getQueryString: getQueryStringRoot  } = useNavQueryParams(type);

  const [focus, setFocus] = useState<RouteMapping["root"]["focus"]>("people");
  const [display, setDisplay] = useState<RouteMapping["root"]["display"]>({ people: true });
  const [numbers, setNumbers] = useState<RouteMapping["root"]["numbers"]>([10]);
  const [newNumber, setNewNumber] = useState<string>("0");

  const queryString = useMemo(() => {
    return getQueryStringRoot({ focus, display, numbers }, { replaceAllParams: true});
  }, [focus, getQueryStringRoot, display, numbers])


  return (
    <div className={styles2["section"]}>
      <h5 className={styles2["section-title"]}>{title}</h5>
      
      <div className={styles2["section-body"]}>
        <div className={styles2["param-container"]}>
          <h6 className={styles2["param-title"]}>Focus: <span className={styles2["param-type"]}>&lt;string&gt;</span></h6>
          {linkToOtherPages[type].map(other => {
            const id = `radio-${other}`;
            const { title } = PageRoutingData[other];
            return (
              <div
                key={other}
              >
                <label htmlFor={id}>{title}</label>
                <input 
                  id={id}
                  type="radio" 
                  name="focus" 
                  value={other}
                  checked={focus === other} 
                  onChange={(e) => e.target.checked && setFocus(other)}
                />
              </div>);
          })}
        </div>
        <div className={styles2["param-container"]}>
          <h6 className={styles2["param-title"]}>Display: <span className={styles2["param-type"]}>&lt;{`{[path: string]: boolean}`}&gt;</span></h6>
          {linkToOtherPages[type].map(other => {
            const id = `checkbox-${other}`;
            const { title } = PageRoutingData[other];
            return (
              <div
                key={other}
              >
                <label htmlFor={id}>{title}</label>
                <input 
                  id={id}
                  type="checkbox" 
                  name="focus"
                  checked={display[other] ?? false} 
                  onChange={() => setDisplay(d => ({...d, [other]: !d[other]}))}
                />
              </div>);
          })}
        </div>
        <div className={styles2["param-container"]}>
          <h6 className={styles2["param-title"]}>Numbers: <span className={styles2["param-type"]}>&lt;{`number[]`}&gt;</span></h6>
          <div className={styles2["numbers"]}>
          {numbers.map((num, i) => {

            return (
                <span key={i}>{i > 0 ? `, ${num}` : num}</span>
              );
          })}
          </div>
          <div className={styles2["numbers-controls"]}>
            <input
              className={styles2["input"]}
              type="text" 
              name="focus"
              value={newNumber} 
              onChange={(e) => { 
                const numberValue = Number(e.target.value);
                setNewNumber(prev => isNaN(numberValue)? prev : numberValue.toString())
              }}
            />
            <button
              className={styles2["button"]}
              type="button"
              onClick={() => { setNumbers(prev => prev.concat(Number(newNumber))); setNewNumber("0"); }}
            >
              Push
            </button>
            <button
              className={styles2["button"]}
              type="button"
              onClick={() => { setNumbers(prev => prev.filter((_, i) => i !== prev.length - 1)); }}
            >
              Pop
            </button>
            <button
              className={styles2["button"]}
              type="button"
              onClick={() => { setNumbers([]); }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      <div className={styles2["query"]}>Query String: <span>{queryString}</span></div>
      <Button to={route} isParamButton queryParamString={queryString + "&salutation=John"} />
    </div>
  )
}

const HomeComponent = () => {
  const type = "home";
  
  const { title, route } = PageRoutingData[type];
  const { getQueryString: getQueryStringHome } = useNavQueryParams(type);

  const [defaultViewCount, setDefaultViewCount] = useState<RouteMapping["home"]["defaultViewCount"]>(1);
  const [openModal, setOpenModal] = useState<RouteMapping["home"]["openModal"]>(false);

  const queryString = useMemo(() => {
    return getQueryStringHome({ defaultViewCount, openModal }, { replaceAllParams: true});
  }, [defaultViewCount, getQueryStringHome, openModal])
  return (
    <div className={styles2["section"]}>
        <h5 className={styles2["section-title"]}>{title}</h5>
        
        <div className={styles2["section-body"]}>
          <div className={styles2["param-container"]}>
            <h6 className={styles2["param-title"]}>DefaultViewCount: <span className={styles2["param-type"]}>&lt;number&gt;</span></h6>
            <input
              className={styles2["input"]}
              type="text" 
              name="focus"
              value={defaultViewCount} 
              onChange={(e) => { 
                const numberValue = Number(e.target.value);
                setDefaultViewCount(prev => isNaN(numberValue)? prev : numberValue)
              }}
            />
          </div>
          <div className={styles2["param-container"]}>
            <h6 className={styles2["param-title"]}>OpenModal: <span className={styles2["param-type"]}>&lt;{`boolean`}&gt;</span></h6>
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
        <div className={styles2["query"]}>Query String: <span>{queryString}</span></div>
        <Button to={route} isParamButton queryParamString={queryString} />
      </div>
  )
}

const PeopleComponent = () => {
  const type = "people";

  const { title, route } = PageRoutingData[type];
  const { getQueryString: getQueryStringPeople} = useNavQueryParams(type);

  const [name, setName] = useState<RouteMapping["people"]["name"]>("John");
  const [trigger, setTrigger] = useState<RouteMapping["people"]["trigger"]>("first");

  const queryString = useMemo(() => {
    return getQueryStringPeople({ name, trigger  }, { replaceAllParams: true});
  }, [name, getQueryStringPeople, trigger])
 

  return (
      <div className={styles2["section"]}>
        <h5 className={styles2["section-title"]}>{title}</h5>
        
        <div className={styles2["section-body"]}>
          <div className={styles2["param-container"]}>
            <h6 className={styles2["param-title"]}>Name: <span className={styles2["param-type"]}>&lt;string&gt;</span></h6>
            <input
              type="text"  
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className={styles2["param-container"]}>
            <h6 className={styles2["param-title"]}>Trigger: <span className={styles2["param-type"]}>&lt;{`"first" | "second" | "third"`}&gt;</span></h6>
            {(["first", "second", "third"] as const).map((trig, index) => {
              const id = `${trig}-${index}`;
              return (
                <div
                  key={id}
                >
                  <label htmlFor={id}>{trig}</label>
                  <input 
                    id={id}
                    type="radio" 
                    name="trigger"
                    checked={trigger === trig} 
                    onChange={() => setTrigger(trig)}
                  />
                </div>);
            })}
          </div>
        </div>
        <div className={styles2["query"]}>Query String: <span>{queryString}</span></div>
        <Button to={route} isParamButton queryParamString={queryString} />
      </div>
  )
}

export { RootComponent, HomeComponent, PeopleComponent }