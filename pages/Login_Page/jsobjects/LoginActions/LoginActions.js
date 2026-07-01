export default {
  handleLogin: async () => {
    try {
      await storeValue('loginEmail', Custom1.model.loginEmail);
      await storeValue('loginPassword', Custom1.model.loginPassword);

      const res = await api_supabase_login.run();

      if (!res.access_token) {
        showAlert('Invalid email or password', 'error');
        return;
      }

      const userRes = await qry_get_user_role.run();
      const user = userRes?.[0];

      if (!user) {
        showAlert('Account not found — contact your administrator', 'error');
        return;
      }

      if (!user.is_active) {
        showAlert('Your account is inactive — contact your administrator', 'error');
        return;
      }

      await storeValue('isLoggedIn', true);
      await storeValue('userRole', user.role);
      await storeValue('userName', user.full_name);
      await storeValue('userEmail', Custom1.model.loginEmail);
      await storeValue('accessToken', res.access_token);

      navigateTo('Home', {}, 'SAME_WINDOW');

    } catch(e) {
      showAlert('Login failed — check your email and password', 'error');
    }
  }
}