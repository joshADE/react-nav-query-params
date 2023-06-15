import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { PageRoutingData, PageType } from "./AppNavData";
import "./App.css";
import RouterPage from "./RouterPage";
import RouteBasePage from "./RouteBasePage";
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <RouteBasePage />,
      children: Object.entries(PageRoutingData).map(([key, value], i) => {
        const { route } = value;
        const tyepKey = key as PageType;
        return {
          index: route === "/route1",
          path: route,
          element: <RouterPage key={tyepKey} type={tyepKey} />,
        };
      }),
    },
  ],
  {
    basename: window.location.href.includes("github")
      ? "/react-nav-query-params/route1"
      : "/", // for deployment to gh-pages to load resources
  }
);

const App = () => {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
