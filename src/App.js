import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navigation from './components/Navigation';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Recommendations from './pages/Recommendations';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ValuationEstimator from './pages/ValuationEstimator';
import ROIPlanner from './pages/ROIPlanner';
import Notifications from './pages/Notifications';

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
    <Router>
      <div className="min-h-screen ui-page">
        <Navigation />
        <main className="pt-16">
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
        </main>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
