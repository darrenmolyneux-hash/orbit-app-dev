export default {
  checkAuth: () => {
    if (!appsmith.store.isLoggedIn) {
      navigateTo('Login_Page', {}, 'SAME_WINDOW');
    }
  }
}