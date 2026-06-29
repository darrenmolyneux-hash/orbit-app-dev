export default {
  onSaveSurvey: async () => {
    const siteId = appsmith.store.new_site_id;
    if (!siteId) {
      showAlert('No site ID found — please create the customer first.', 'error');
      return;
    }
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
    try {
      await qry_site_survey_create.run();
      showAlert('Site survey saved', 'success');
      storeValue('show_site_survey', false);
      try { scrollTo('Container6', 0, 'smooth'); } catch(e) {}
    } catch (err) {
      showAlert('Failed to save site survey: ' + err.message, 'error');
    }
  },
  onSkipSurvey: () => {
    storeValue('show_site_survey', false);
    try { scrollTo('Container6', 0, 'smooth'); } catch(e) {}
  }
}