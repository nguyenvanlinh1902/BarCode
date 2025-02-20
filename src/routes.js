import Login from './pages/LoginScreen.js';
import Home from './pages/HomePage.js';
import BarcodePrinter from './pages/PrintBarcode';
import ScanBarcode from './pages/ScanBarcode';
import History from './pages/History';

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
    path: '/print-barcode',
    name: 'Barcode Printer',
    component: BarcodePrinter,
    layout: '/admin',
  },
  {
    path: '/scan-barcode',
    name: 'Barcode Scanner',
    component: ScanBarcode,
    layout: '/admin',
  },
  {
    path: '/history',
    name: 'history',
    component: History,
    layout: '/admin',
  },
  {
    path: '/',
    name: 'home',
    component: Home,
    layout: '/admin',
  },
];

export default dashboardRoutes;
