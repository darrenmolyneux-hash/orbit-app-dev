export default {
	onCreateCustomer: async () => {
		const m = CreateCustomerWidget.model;
		if (!m.customer_name) {
			showAlert('Please enter a customer name.', 'warning');
			return;
		}
		storeValue('customer_name', m.customer_name);
		storeValue('contact_name', m.contact_name);
		storeValue('contact_number', m.contact_number);
		storeValue('email', m.email);
		storeValue('job_title', m.job_title);
		storeValue('dial_rating', m.dial_rating);
		storeValue('dial_expiry', m.dial_expiry);
		storeValue('msa_signed', m.msa_signed);
		storeValue('account_manager', m.account_manager);
		storeValue('address1', m.address1);
		storeValue('address2', m.address2);
		storeValue('city', m.city);
		storeValue('postcode', m.postcode);
		storeValue('default_instructions', m.default_instructions);
		storeValue('site_contact', m.site_contact);
		storeValue('site_phone', m.site_phone);
		storeValue('site_email', m.site_email);
		try {
			await qry_customer_exists.run();
			const existing = qry_customer_exists.data;
			if (existing && existing.length > 0) {
				showAlert('A customer with this name already exists.', 'warning');
				return;
			}
			await qry_customer_create.run();
			await storeValue('new_customer_id', qry_customer_create.data[0].customer_id);
			await qry_site_create.run();
			await storeValue('new_site_id', qry_site_create.data[0].site_id);
			showAlert(m.customer_name + ' created successfully.', 'success');
			showModal('Modal_SurveyPrompt');
		} catch (err) {
			showAlert('Failed to create customer: ' + err.message, 'error');
		}
	},

	onSaveSurvey: async () => {
		const s = SiteSurveyWidget.model; // adjust to your actual survey widget name if different

		await storeValue('ss_vehicle_access_height', s.vehicle_access_height);
		await storeValue('ss_vehicle_access_height_notes', s.vehicle_access_height_notes);
		await storeValue('ss_parking_loading_bay', s.parking_loading_bay);
		await storeValue('ss_parking_loading_bay_notes', s.parking_notes);
		await storeValue('ss_lift_restrictions', s.lift_restrictions);
		await storeValue('ss_lift_restrictions_notes', s.lift_notes);
		await storeValue('ss_narrow_corridors', s.narrow_corridors);
		await storeValue('ss_narrow_corridors_notes', s.corridor_notes);
		await storeValue('ss_stairs_involved', s.stairs_involved);
		await storeValue('ss_stairs_involved_notes', s.stairs_notes);
		await storeValue('ss_manual_handling_required', s.manual_handling_required);
		await storeValue('ss_manual_handling_required_notes', s.manual_handling_notes);
		await storeValue('ss_escort_required', s.escort_required);
		await storeValue('ss_site_induction_required', s.site_induction_required);
		await storeValue('ss_ppe_requirements', s.ppe_requirements);
		await storeValue('ss_site_hazards', s.site_hazards);
		await storeValue('ss_security_procedures', s.security_procedures);
		await storeValue('ss_security_procedures_details', s.security_details);
		await storeValue('ss_driver_instructions', s.driver_instructions);

		try {
			await qry_site_survey_create.run();
			showAlert('Site survey saved successfully.', 'success');
			closeModal('Modal_SiteSurvey'); // adjust to your actual modal name if it's in one
		} catch (err) {
			showAlert('Failed to save survey: ' + err.message, 'error');
		}
	},

	onSurveyFirst: () => {
		closeModal('Modal_SurveyPrompt');
		storeValue('show_site_survey', true);
	},

	onSkipSurvey: () => {
		closeModal('Modal_SurveyPrompt');
	}
}