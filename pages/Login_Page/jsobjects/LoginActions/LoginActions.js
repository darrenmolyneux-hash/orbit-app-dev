export default {
  handleLogin: async () => {
    try {
      const email = Custom1.model.loginEmail;
      const password = Custom1.model.loginPassword;

      const res = await api_supabase_login.run();

      if (!res.access_token) {
        await Custom1.updateModel({ loginErrorMessage: 'Invalid email or password' });
        return;
      }

      const userRes = await qry_get_user_role.run();
      const user = userRes?.[0];

      if (!user) {
        await Custom1.updateModel({ loginErrorMessage: 'Account not found — contact your administrator' });
        return;
      }

      if (!user.is_active) {
        await Custom1.updateModel({ loginErrorMessage: 'Your account is inactive — contact your administrator' });
        return;
      }

      await storeValue('isLoggedIn', true);
      await storeValue('userRole', user.role);
      await storeValue('userName', user.full_name);
      await storeValue('userEmail', email);
      await storeValue('accessToken', res.access_token);

      navigateTo('Home', {}, 'SAME_WINDOW');

    } catch(e) {
      await Custom1.updateModel({ loginErrorMessage: 'Login failed — check your email and password' });
    }
  }
}