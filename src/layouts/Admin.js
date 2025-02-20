import React from 'react';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';

import AdminNavbar from '../components/Navbars/Navbar';

import routes from '../routes.js';

function Admin() {
  const location = useLocation();
  const mainPanel = React.useRef(null);

  const history = useHistory();
  const userRole = localStorage.getItem('userRole');

  if (!userRole && location.pathname !== '/login') {
    history.push('/login');
  }

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === '/admin') {
        return (
          <Route
            path={prop.path}
            render={(props) => <prop.component {...props} />}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };
  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainPanel.current.scrollTop = 0;
    if (
      window.innerWidth < 993 &&
      document.documentElement.className.indexOf('nav-open') !== -1
    ) {
      document.documentElement.classList.toggle('nav-open');
      var element = document.getElementById('bodyClick');
      element.parentNode.removeChild(element);
    }
  }, [location]);

  return (
    <>
      <div className="wrapper">
        <div className="main-panel" ref={mainPanel}>
          {userRole && location.pathname !== '/login' && <AdminNavbar />}
          <div className="content">
            <Switch>{getRoutes(routes)}</Switch>
          </div>
        </div>
      </div>
    </>
  );
}

export default Admin;
