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
    storeValue('col_customer_id', m.col_customer_id);
    storeValue('col_site_id', m.col_site_id);
    storeValue('col_job_type', m.col_job_type);
    storeValue('col_date', m.col_date);
    storeValue('col_instructions', m.col_instructions);
    storeValue('col_notes', m.col_notes);
    storeValue('col_dial', m.col_dial);
    storeValue('col_dial_expiry', m.col_dial_expiry);
    storeValue('col_msa', m.col_msa);
    storeValue('col_site_contact', m.col_site_contact);
    storeValue('col_contact_number', m.col_contact_number);
    storeValue('col_contact_email', m.col_contact_email);
    storeValue('col_address1', m.col_address1);
    storeValue('col_address2', m.col_address2);
    storeValue('col_city', m.col_city);
    storeValue('col_postcode', m.col_postcode);
    storeValue('col_expected_assets', m.col_expected_assets);
    try {
      await qry_collection_create.run();
      const newId = qry_collection_create.data[0].collection_id;
      storeValue('newCollectionId', newId);
      await qry_create_col_asset_ref.run();
      showAlert('Collection created successfully ✓', 'success');
      navigateTo('Upcoming_Collection', {}, 'SAME_WINDOW');
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