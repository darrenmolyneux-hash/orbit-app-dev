export default {
  checkAuth: () => {
    if (!appsmith.store.userEmail) {
      navigateTo('Login_Page', {}, 'SAME_WINDOW');
    }
  }
}