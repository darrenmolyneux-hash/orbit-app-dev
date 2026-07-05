export default {
  onNavClick: () => {
    const page = NavWidget.model.targetPage;
    navigateTo(page, {}, 'SAME_WINDOW');
  },
  onAvatarClick: () => {
    navigateTo('Profile_Page', {}, 'SAME_WINDOW');
  }
}