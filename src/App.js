import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { HelmetProvider } from 'react-helmet-async';

import Navigation from './components/Navigation';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import SkeletonLoader from './components/SkeletonLoader';

import { setUser, setLoading as setAuthLoading } from './redux/authSlice';
import { userAPI } from './services/api';

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
const Profile = lazy(() => import('./pages/Profile'));
const RenovationTracker = lazy(() => import('./pages/RenovationTracker'));
const AdminRenovationTrackers = lazy(() => import('./pages/AdminRenovationTrackers'));

const UserRoute = ({ children, appLoading }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (appLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Ensure user object exists before rendering protected children
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return children;
};

const AdminRoute = ({ children, appLoading }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (appLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || user?.role !== 'admin') {
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
};

function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const [appLoading, setAppLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (token && !user) {
        setAppLoading(true);
        try {
          const response = await userAPI.getProfile();
          dispatch(setUser({ user: response.data.user, token }));
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // If token is invalid, it will be handled by axios interceptors or we could clear it here
        } finally {
          setAppLoading(false);
        }
      }
    };

    fetchProfile();
  }, [token, user, dispatch]);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router basename={import.meta.env.BASE_URL} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
                      <UserRoute appLoading={appLoading}>
                        <UserDashboard />
                      </UserRoute>
                    )}
                  />
                  <Route
                    path="/admin/dashboard"
                    element={(
                      <AdminRoute appLoading={appLoading}>
                        <AdminDashboard />
                      </AdminRoute>
                    )}
                  />
                  <Route
                    path="/monitoring"
                    element={(
                      <AdminRoute appLoading={appLoading}>
                        <MonitoringDashboard />
                      </AdminRoute>
                    )}
                  />
                  <Route
                    path="/admin/renovation-trackers"
                    element={(
                      <AdminRoute appLoading={appLoading}>
                        <AdminRenovationTrackers />
                      </AdminRoute>
                    )}
                  />
                  <Route path="/valuation" element={<ValuationEstimator />} />
                  <Route path="/roi-planner" element={<ROIPlanner />} />
                  <Route
                    path="/notifications"
                    element={(
                      <UserRoute appLoading={appLoading}>
                        <Notifications />
                      </UserRoute>
                    )}
                  />
                  <Route
                    path="/profile"
                    element={(
                      <UserRoute appLoading={appLoading}>
                        <Profile />
                      </UserRoute>
                    )}
                  />
                  <Route
                    path="/renovation-tracker"
                    element={(
                      <UserRoute appLoading={appLoading}>
                        <RenovationTracker />
                      </UserRoute>
                    )}
                  />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <ToastContainer position="bottom-right" autoClose={3000} />
          </div>
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
