export default {
  onCustomerSelected: async () => {
    const m = CreateCollectionWidget.model;
    storeValue('col_customer_id', m.col_customer_id);
    await qry_sites_for_customer.run();
    await qry_compliance.run();
  },
  onSiteSelected: async () => {
    storeValue('col_site_id', CreateCollectionWidget.model.col_site_id);
    await qry_site_survey_status.run();
  },
  onSaveCollection: async () => {
    const m = CreateCollectionWidget.model;
    await storeValue('col_customer_id', m.col_customer_id);
    await storeValue('col_site_id', m.col_site_id);
    await storeValue('col_job_type', m.col_job_type);
    await storeValue('col_date', m.col_date);
    await storeValue('col_instructions', m.col_instructions);
    await storeValue('col_notes', m.col_notes);
    await storeValue('col_dial', m.col_dial);
    await storeValue('col_dial_expiry', m.col_dial_expiry);
    await storeValue('col_msa', m.col_msa);
    await storeValue('col_site_contact', m.col_site_contact);
    await storeValue('col_contact_number', m.col_contact_number);
    await storeValue('col_contact_email', m.col_contact_email);
    await storeValue('col_address1', m.col_address1);
    await storeValue('col_address2', m.col_address2);
    await storeValue('col_city', m.col_city);
    await storeValue('col_postcode', m.col_postcode);
    await storeValue('col_crew_size', m.col_crew_size);
    await storeValue('col_tail_lift_required', m.col_tail_lift_required);
    await storeValue('col_oversized_items', m.col_oversized_items);
    await storeValue('col_oversized_items_notes', m.col_oversized_items_notes);
    await storeValue('col_equipment_location_floor', m.col_equipment_location_floor);
    await storeValue('col_items_one_location', m.col_items_one_location);
    await storeValue('col_items_location_notes', m.col_items_location_notes);
    await storeValue('col_different_site_contact', m.col_different_site_contact);
    await storeValue('col_contact_override_name', m.col_contact_override_name);
    await storeValue('col_contact_override_number', m.col_contact_override_number);

    let assets = m.col_expected_assets;
    if (!assets || assets === 'null') {
      assets = '[]';
    } else if (typeof assets === 'object') {
      assets = JSON.stringify(assets);
    }
    await storeValue('col_expected_assets', assets);

    try {
      await qry_collection_create.run();
      const newId = qry_collection_create.data[0].collection_id;
      storeValue('newCollectionId', newId);
      await qry_create_col_asset_ref.run();
      navigateTo('Home', {}, 'SAME_WINDOW');
      showAlert('Collection created successfully ✓', 'success');
    } catch(err) {
      showAlert('Failed to create collection: ' + err.message, 'error');
    }
  },
  onCancel: () => {
    navigateTo('Upcoming_Collection', {}, 'SAME_WINDOW');
  },
  onGoToSurvey: () => {
    const customerId = CreateCollectionWidget.model.col_customer_id;
    navigateTo('Customer_Detail_Page', { customer_id: customerId }, 'SAME_WINDOW');
  }
}