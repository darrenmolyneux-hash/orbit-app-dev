export default {
  onSaveSurvey: async () => {
    const siteId = appsmith.store.new_site_id;
    if (!siteId) {
      showAlert('No site ID found — please create the customer first.', 'error');
      return;
    }
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
    await storeValue('ss_manual_handling_required', m.ss_manual_handling_required);
    await storeValue('ss_manual_handling_required_notes', m.ss_manual_handling_required_notes);
    await storeValue('ss_escort_required', m.ss_escort_required);
    await storeValue('ss_site_induction_required', m.ss_site_induction_required);
    await storeValue('ss_ppe_requirements', m.ss_ppe_requirements);
    await storeValue('ss_site_hazards', m.ss_site_hazards);
    await storeValue('ss_security_procedures', m.ss_security_procedures);
    await storeValue('ss_security_procedures_details', m.ss_security_procedures_details);
    await storeValue('ss_driver_instructions', m.ss_driver_instructions);
    try {
      await qry_site_survey_create.run();
      showAlert('Site survey saved', 'success');
      storeValue('show_site_survey', false);
      storeValue('new_site_id', null);
      storeValue('new_customer_id', null);
      navigateTo('Customer_List', {}, 'SAME_WINDOW');
    } catch (err) {
      showAlert('Failed to save site survey: ' + err.message, 'error');
    }
  },
  onSkipSurvey: () => {
    storeValue('show_site_survey', false);
    storeValue('new_site_id', null);
    storeValue('new_customer_id', null);
    navigateTo('Customer_List', {}, 'SAME_WINDOW');
  }
}