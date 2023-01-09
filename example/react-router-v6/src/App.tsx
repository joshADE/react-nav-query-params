import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { PageRoutingData, PageType, NavQueryContext } from './AppNavData';
import './App.css';
import RouterPage from './RouterPage';
const router = createBrowserRouter(Object.entries(PageRoutingData).map(([key, value]) => {
  const { route } = value;
  const tyepKey = key as PageType;
  return {
    path: route,
    element: <RouterPage key={tyepKey} type={tyepKey} />
  };
}), 
{ 
  basename: window.location.href.includes("github") ? '/react-nav-query-params/' : '/' // for deployment to gh-pages to load resources 
})

const App = () => {

  
  return (
    <div className="App">
      <NavQueryContext.Provider value={{}}>
      <RouterProvider router={router} />
      </NavQueryContext.Provider>
    </div>
  );
}

export default App;
