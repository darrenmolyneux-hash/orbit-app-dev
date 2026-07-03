export default {
  checkAdminAccess: () => {
    if (appsmith.store.userRole !== 'admin') {
      showAlert('Access denied — Admin only.', 'error');
      navigateTo('Home', {}, 'SAME_WINDOW');
    }
  }
}