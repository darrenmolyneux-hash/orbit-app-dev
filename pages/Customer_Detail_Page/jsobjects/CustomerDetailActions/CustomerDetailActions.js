export default {
  onGoBack: () => {
    navigateTo('Customer_List', {}, 'SAME_WINDOW');
  },
  onSaveCustomer: async () => {
    const m = CustomerDetailWidget.model;
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
    await qry_update_customer.run();
    await qry_get_customer.run();
    showAlert('Customer updated ✓', 'success');
  },
  onSaveSite: async () => {
    const m = CustomerDetailWidget.model;
    storeValue('address1', m.address1);
    storeValue('address2', m.address2);
    storeValue('city', m.city);
    storeValue('postcode', m.postcode);
    storeValue('site_contact', m.site_contact);
    storeValue('site_phone', m.site_phone);
    storeValue('site_email', m.site_email);
    await qry_insert_site.run();
    await qry_get_customer_sites.run();
    showAlert('Site added ✓', 'success');
  },
  onViewSite: () => {
    const s = CustomerDetailWidget.model.selected_site;
    storeValue('active_site', s);
    storeValue('new_site_id', s.site_id);
    storeValue('show_site_survey', true);
  },
  onViewCollection: () => {
    const id = CustomerDetailWidget.model.selected_collection_id;
    navigateTo('Collection_job_View', { collectionId: id }, 'SAME_WINDOW');
  },
  onSaveSurvey: async () => {
    const m = SiteSurveyWidget.model;
    storeValue('ss_vehicle_access', m.ss_vehicle_access);
    storeValue('ss_vehicle_access_notes', m.ss_vehicle_access_notes);
    storeValue('ss_parking_loading_bay', m.ss_parking_loading_bay);
    storeValue('ss_parking_notes', m.ss_parking_notes);
    storeValue('ss_access_restrictions', m.ss_access_restrictions);
    storeValue('ss_access_restriction_notes', m.ss_access_restriction_notes);
    storeValue('ss_time_restrictions', m.ss_time_restrictions);
    storeValue('ss_time_restriction_notes', m.ss_time_restriction_notes);
    storeValue('ss_equipment_floor', m.ss_equipment_floor);
    storeValue('ss_floor_access_type', m.ss_floor_access_type);
    storeValue('ss_lift_restrictions', m.ss_lift_restrictions);
    storeValue('ss_lift_notes', m.ss_lift_notes);
    storeValue('ss_narrow_corridors', m.ss_narrow_corridors);
    storeValue('ss_corridor_notes', m.ss_corridor_notes);
    storeValue('ss_security_procedures', m.ss_security_procedures);
    storeValue('ss_security_details', m.ss_security_details);
    storeValue('ss_driver_instructions', m.ss_driver_instructions);
    await qry_site_survey_create.run();
    showAlert('Site survey saved ✓', 'success');
    storeValue('show_site_survey', false);
    await qry_get_customer_sites.run();
  },
  onSkipSurvey: () => {
    storeValue('show_site_survey', false);
  }
}