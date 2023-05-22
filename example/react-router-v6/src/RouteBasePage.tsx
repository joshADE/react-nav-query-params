import { useMemo } from "react";
import { NavQueryContext } from "./AppNavData";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { Adapter } from "./AppNavData";

const RouteBasePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const adapter = useMemo<Adapter>(() => {
    return {
      location: location,
      pushLocation: (l: Adapter["location"]) =>
        l.search ? navigate("?" + l.search, { replace: false }) : {},
      replaceLocation: (l: Adapter["location"]) =>
        l.search ? navigate("?" + l.search, { replace: true }) : {},
    };
  }, [location, navigate]);
  return (
    <NavQueryContext.Provider
      value={{
        adapter: adapter,
      }}
    >
      <div>
        <Outlet />
      </div>
    </NavQueryContext.Provider>
  );
};

export default RouteBasePage;
