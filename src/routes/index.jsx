import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import AppLayout   from '../layouts/AppLayout';
import AuthLayout  from '../layouts/AuthLayout';

// Auth pages — always loaded eagerly (small, needed immediately)
import Login    from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// App pages — lazy-loaded for code splitting
const Dashboard    = lazy(() => import('../pages/Dashboard'));
const Transactions = lazy(() => import('../pages/Transactions'));
const Categories   = lazy(() => import('../pages/Categories'));
const Cards        = lazy(() => import('../pages/Cards'));
const Installments = lazy(() => import('../pages/Installments'));
const Goals        = lazy(() => import('../pages/Goals'));
const Reports      = lazy(() => import('../pages/Reports'));
const Profile      = lazy(() => import('../pages/Profile'));

const router = createBrowserRouter([
  // ── Public routes ──────────────────────────────────
  {
    element: <AuthLayout />,
    children: [
      { path: '/login',    element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },

  // ── Protected routes ───────────────────────────────
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/',             element: <Dashboard /> },
          { path: '/transactions', element: <Transactions /> },
          { path: '/categories',   element: <Categories /> },
          { path: '/cards',         element: <Cards /> },
          { path: '/installments', element: <Installments /> },
          { path: '/goals',        element: <Goals /> },
          { path: '/reports',      element: <Reports /> },
          { path: '/profile',      element: <Profile /> },
        ],
      },
    ],
  },
]);

export default router;
