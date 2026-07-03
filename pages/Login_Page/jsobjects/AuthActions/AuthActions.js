export default {
  onLoginSubmit: async () => {
    try {
      const email = Custom1.model.loginEmail;
      const password = Custom1.model.loginPassword;

      await qry_get_login_user.run({ email: email });
      const user = qry_get_login_user.data && qry_get_login_user.data[0];

      if (!user) {
        await storeValue('loginErrorMessage', 'No account found for this email. Contact your administrator for access.');
        return;
      }
      if (!user.is_active) {
        await storeValue('loginErrorMessage', 'Your account has been deactivated. Contact your administrator.');
        return;
      }
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        const minsLeft = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
        await storeValue('loginErrorMessage', 'Account locked due to too many failed attempts. Try again in ' + minsLeft + ' minute(s).');
        return;
      }
      if (!user.password_hash) {
        await storeValue('loginErrorMessage', 'This account has no password set. Contact your administrator.');
        return;
      }

      await qry_verify_password.run({ email: email, password: password });
      const verified = qry_verify_password.data && qry_verify_password.data[0];

      if (!verified) {
        await qry_record_failed_login.run({ email: email });
        const attemptsLeft = Math.max(0, 4 - (user.failed_login_attempts || 0));
        await storeValue('loginErrorMessage', 'Incorrect password. ' + attemptsLeft + ' attempt(s) remaining before lockout.');
        return;
      }

      await qry_record_successful_login.run({ userId: user.user_id });
      await storeValue('loginErrorMessage', '');
      await storeValue('userEmail', user.email);
      await storeValue('userName', user.full_name);
      await storeValue('userRole', user.role);
      await storeValue('userId', user.user_id);

      if (user.must_change_password) {
        await storeValue('requirePasswordChange', true);
        return;
      }

      navigateTo('Home', {}, 'SAME_WINDOW');
    } catch (err) {
      await storeValue('loginErrorMessage', 'Sign-in failed: ' + err.message);
    }
  },

  onSetNewPassword: async () => {
    try {
      const newPassword = Custom1.model.newPassword;
      const userId = appsmith.store.userId;

      await qry_set_new_password.run({ userId: Number(userId), newPassword: newPassword, mustChange: false });
      await storeValue('changePwErrorMessage', '');
      await storeValue('requirePasswordChange', false);
      showAlert('Password updated ✓', 'success');
      navigateTo('Home', {}, 'SAME_WINDOW');
    } catch (err) {
      await storeValue('changePwErrorMessage', 'Failed to set password: ' + err.message);
    }
  }
}