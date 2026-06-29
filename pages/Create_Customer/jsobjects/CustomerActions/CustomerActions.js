export default {
  onCreateCustomer: async () => {
    const m = CreateCustomerWidget.model;

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

onSurveyFirst: () => {
  closeModal('Modal_SurveyPrompt');
  storeValue('show_site_survey', true);
  scrollTo('SiteSurveyWidget', 0, 'smooth');
},

  onSkipSurvey: () => {
    closeModal('Modal_SurveyPrompt');
  }
}