export default {
	onGoogleSignIn: async () => {
		try {
			const email = Custom1.model.google_email;
			await qry_get_user_by_email.run({ email: email });
			const user = qry_get_user_by_email.data && qry_get_user_by_email.data[0];
			if (!user) {
				await storeValue('loginErrorMessage', 'No account found for this email. Contact your administrator for access.');
				return;
			}
			if (!user.is_active) {
				await storeValue('loginErrorMessage', 'Your account has been deactivated. Contact your administrator.');
				return;
			}
			await storeValue('loginErrorMessage', '');
			await storeValue('userEmail', user.email);
			await storeValue('userName', user.full_name);
			await storeValue('userRole', user.role);
			await storeValue('userId', user.user_id);
			navigateTo('Home', {}, 'SAME_WINDOW');
		} catch (err) {
			await storeValue('loginErrorMessage', 'Sign-in failed: ' + err.message);
		}
	}
}