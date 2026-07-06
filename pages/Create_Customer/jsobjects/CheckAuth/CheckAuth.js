checkAuth: () => {
  console.log('checkAuth running, userEmail =', appsmith.store.userEmail);
  if (!appsmith.store.userEmail) {
    navigateTo('Login_Page', {}, 'SAME_WINDOW');
  }
}