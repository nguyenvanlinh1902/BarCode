import Login from './screens/LoginScreen.js';
import Home from './screens/HomePage.js';
import BarcodePrinter from './screens/BarcodePrinter.js';

const dashboardRoutes = [
  {
    upgrade: true,
    path: '/login',
    name: 'login',
    component: Login,
    layout: '/admin',
  },
  {
    path: '/home',
    name: 'home',
    component: Home,
    layout: '/admin',
  },
  {
    path: '/',
    name: 'home',
    component: Home,
    layout: '/admin',
  },
  {
    path: '/barcode-printer',
    name: 'Barcode Printer',
    component: BarcodePrinter,
    layout: '/admin',
  },
];

export default dashboardRoutes;
