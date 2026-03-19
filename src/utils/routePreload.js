const importUserDashboard = () => import('../pages/UserDashboard');
const importAdminDashboard = () => import('../pages/AdminDashboard');

export const preloadDashboardByRole = (role) => {
  if (role === 'admin') {
    return importAdminDashboard();
  }

  return importUserDashboard();
};

export const preloadCommonDashboards = () =>
  Promise.allSettled([importUserDashboard(), importAdminDashboard()]);
