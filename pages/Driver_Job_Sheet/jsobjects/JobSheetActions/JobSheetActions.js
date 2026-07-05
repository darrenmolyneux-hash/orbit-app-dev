export default {
onLoadJobSheet: async () => {
  await qry_jobsheet_bookings.run();

  let attempts = 0;
  let collectionId = appsmith.URL.queryParams.collection_id;
  while (!collectionId && attempts < 10) {
    await new Promise(resolve => setTimeout(resolve, 100));
    collectionId = appsmith.URL.queryParams.collection_id;
    attempts++;
  }

  if (collectionId) {
    await qry_jobsheet_get_coll.run({ collectionId: Number(collectionId) });
    await qry_jobsheet_get_item_types.run();
    await qry_jobsheet_get_items.run({ collectionId: Number(collectionId) });
  }
},
 onOpenCollection: async () => {
  const id = JobSheetWidget.model.selectedCollectionId;
  await navigateTo('Driver_Job_Sheet', { collection_id: id }, 'SAME_WINDOW');
  await JobSheetActions.onLoadJobSheet();
},
  onAddJobSheetItem: async () => {
    try {
      const m = JobSheetWidget.model;
      await qry_jobsheet_insert_item.run({
        collectionId: m.collection_id,
        itemTypeId: m.js_item_type_id,
        quantity: m.js_item_qty,
        createdBy: appsmith.store.userEmail
      });
      await qry_jobsheet_get_items.run({ collectionId: m.collection_id });
      showAlert('Item added ✓', 'success');
    } catch (err) {
      showAlert('Failed to add item: ' + err.message, 'error');
    }
  },
  onTestGetColl: async () => {
    const result = await qry_jobsheet_get_coll.run({ collectionId: 6 });
    console.log('Job sheet collection test:', result);
    return result;
  },
  onSubmitJobSheet: async () => {
    try {
      const m = JobSheetWidget.model;
      await qry_jobsheet_submit.run({
        collectionId: m.collection_id,
        vehicle: m.js_vehicle,
        driver: m.driverName,
        driverSignature: m.js_driver_signature,
        clientSignature: m.js_client_signature,
        clientNameOnsite: m.js_customer_name_onsite
      });
      showAlert('Job sheet submitted ✓', 'success');
      navigateTo('Driver_Job_Sheet', {}, 'SAME_WINDOW');
    } catch (err) {
      showAlert('Failed to submit job sheet: ' + err.message, 'error');
    }
  }
}