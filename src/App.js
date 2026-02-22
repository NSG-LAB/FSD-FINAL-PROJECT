import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import SkeletonLoader from './components/SkeletonLoader';

// Lazy load page components for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Recommendations = lazy(() => import('./pages/Recommendations'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ValuationEstimator = lazy(() => import('./pages/ValuationEstimator'));
const ROIPlanner = lazy(() => import('./pages/ROIPlanner'));
const Notifications = lazy(() => import('./pages/Notifications'));
const MonitoringDashboard = lazy(() => import('./pages/MonitoringDashboard'));

const UserRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen ui-page">
          <Navigation />
          <main className="pt-16">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <SkeletonLoader type="title" className="mb-4" />
                  <div className="space-y-3">
                    <SkeletonLoader type="text" className="w-3/4 mx-auto" />
                    <SkeletonLoader type="text" className="w-1/2 mx-auto" />
                  </div>
                </div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/recommendations" element={<Recommendations />} />
                <Route
                  path="/user/dashboard"
                  element={(
                    <UserRoute>
                      <UserDashboard />
                    </UserRoute>
                  )}
                />
                <Route
                  path="/admin/dashboard"
                  element={(
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  )}
                />
                <Route
                  path="/monitoring"
                  element={(
                    <AdminRoute>
                      <MonitoringDashboard />
                    </AdminRoute>
                  )}
                />
                <Route path="/valuation" element={<ValuationEstimator />} />
                <Route path="/roi-planner" element={<ROIPlanner />} />
                <Route
                  path="/notifications"
                  element={(
                    <UserRoute>
                      <Notifications />
                    </UserRoute>
                  )}
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </main>
          <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
