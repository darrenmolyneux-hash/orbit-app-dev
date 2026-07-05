export default {
  onPageLoad: () => {
    storeValue('show_site_survey', false);
  },
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
  onSaveSurvey: async () => {
    const m = SiteSurveyWidget.model;
    await storeValue('ss_vehicle_access_height', m.ss_vehicle_access_height);
    await storeValue('ss_vehicle_access_height_notes', m.ss_vehicle_access_height_notes);
    await storeValue('ss_parking_loading_bay', m.ss_parking_loading_bay);
    await storeValue('ss_parking_loading_bay_notes', m.ss_parking_loading_bay_notes);
    await storeValue('ss_lift_restrictions', m.ss_lift_restrictions);
    await storeValue('ss_lift_restrictions_notes', m.ss_lift_restrictions_notes);
    await storeValue('ss_narrow_corridors', m.ss_narrow_corridors);
    await storeValue('ss_narrow_corridors_notes', m.ss_narrow_corridors_notes);
    await storeValue('ss_stairs_involved', m.ss_stairs_involved);
    await storeValue('ss_stairs_involved_notes', m.ss_stairs_involved_notes);
    await storeValue('ss_escort_required', m.ss_escort_required);
    await storeValue('ss_site_induction_required', m.ss_site_induction_required);
    await storeValue('ss_ppe_requirements', m.ss_ppe_requirements);
    await storeValue('ss_site_hazards', m.ss_site_hazards);
    await storeValue('ss_manual_handling_required', m.ss_manual_handling_required);
    await storeValue('ss_manual_handling_required_notes', m.ss_manual_handling_required_notes);
    await storeValue('ss_security_procedures', m.ss_security_procedures);
    await storeValue('ss_security_procedures_details', m.ss_security_procedures_details);
    await storeValue('ss_driver_instructions', m.ss_driver_instructions);

    const existing = m.existingSurvey;
    if (existing && existing.survey_id) {
      await storeValue('ss_survey_id', existing.survey_id);
      await qry_site_survey_update.run();
      showAlert('Site survey updated ✓', 'success');
    } else {
      await qry_site_survey_create.run();
      showAlert('Site survey saved ✓', 'success');
    }

    storeValue('show_site_survey', false);
    await qry_get_customer_sites.run();
  },
	onTestGetSiteSurvey: async () => {
  const result = await qry_get_site_survey.run({ siteId: 10 });
  console.log('Site survey result:', result);
  return result;
},
  onViewSite: async () => {
    const s = CustomerDetailWidget.model.selected_site;
    storeValue('active_site', s);
    storeValue('new_site_id', s.site_id);
    await qry_get_site_survey.run({ siteId: s.site_id });
    storeValue('show_site_survey', true);
  },
  onViewCollection: () => {
    const id = CustomerDetailWidget.model.selected_collection_id;
    navigateTo('Collection_job_View', { collectionId: id }, 'SAME_WINDOW');
  },
  onSkipSurvey: () => {
    storeValue('show_site_survey', false);
  }
}