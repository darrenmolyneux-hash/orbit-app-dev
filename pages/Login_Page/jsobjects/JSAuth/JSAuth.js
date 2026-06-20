export default {
  resetLogin: () => {
    storeValue('isLoggedIn', false);
  },

  handleLogin: async () => {
    var email = Custom1.model.loginEmail;
    var password = Custom1.model.loginPassword;

    if (!email || !password) {
      showAlert('Please enter both email and password.', 'warning');
      return;
    }

    try {
      const result = await LoginAPI.run();

      // Supabase returns an error object (with error/error_description or
      // msg) on failed login, rather than throwing — so we need to check
      // the response shape, not just rely on try/catch.
      if (result.error || result.error_description || result.msg) {
        var message = result.error_description || result.msg || 'Invalid email or password.';
        showAlert(message, 'error');
        return;
      }

      if (!result.access_token) {
        showAlert('Login failed — no session returned.', 'error');
        return;
      }

      // Store the session. access_token is the JWT used to authenticate
      // future requests; persisted via storeValue so it survives page
      // navigation within the app.
      await storeValue('supabaseAccessToken', result.access_token);
      await storeValue('supabaseRefreshToken', result.refresh_token);
      await storeValue('supabaseUserEmail', result.user ? result.user.email : email);
      await storeValue('isLoggedIn', true);

      // Navigate to the actual app home page now that login succeeded.
      navigateTo('Home', {}, 'SAME_WINDOW');

    } catch (e) {
      showAlert('Something went wrong — please try again.', 'error');
    }
  },

  // Call this from every page's onPageLoad (except Login_Page itself).
  // Redirects to Login_Page if there's no valid session.
  checkAuth: () => {
    if (!appsmith.store.isLoggedIn) {
      navigateTo('Login_Page', {}, 'SAME_WINDOW');
    }
  }
}