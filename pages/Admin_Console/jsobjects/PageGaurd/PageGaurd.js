export default {
  checkAuth: () => {
    if (!appsmith.store.isLoggedIn) {
      navigateTo('Login_Page', {}, 'SAME_WINDOW');
      return;
    }
  },

  checkAdmin: () => {
    if (!appsmith.store.isLoggedIn) {
      navigateTo('Login_Page', {}, 'SAME_WINDOW');
      return;
    }
    if (appsmith.store.userRole !== 'admin') {
      navigateTo('Home', {}, 'SAME_WINDOW');
      showAlert('Admin access required', 'error');
    }
  }
}