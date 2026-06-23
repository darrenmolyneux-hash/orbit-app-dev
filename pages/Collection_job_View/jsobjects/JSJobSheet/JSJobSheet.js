export default {
  async syncFromSheet() {
    try {
      showAlert('Syncing from AppSheet...', 'info');
      
      await SheetAPI.run();
      const rows = SheetAPI.data.values;
      
      if (!rows || rows.length < 2) {
        showAlert('No data found in sheet.', 'warning');
        return;
      }
      
      const collectionId = String(appsmith.URL.queryParams.collectionId);
      
      const match = rows.slice(1).find(row => String(row[1] || '').trim() === collectionId);
      
      if (!match) {
        showAlert('No matching collection found in sheet for ID: ' + collectionId, 'warning');
        return;
      }
      
      storeValue('js_collection_date',      match[2]  || '');
      storeValue('js_collection_time',      match[3]  || '');
      storeValue('js_vehicle',              match[28] || '');
      storeValue('js_driver',               match[29] || '');
      storeValue('js_driver_sig',           match[30] || '');
      storeValue('js_assistant',            match[31] || '');
      storeValue('js_client',               match[35] || '');
      storeValue('js_client_sig',           match[36] || '');
      storeValue('js_client_sig_timestamp', match[37] || '');
      
      showAlert('Synced ✓ — click Save to write to database.', 'success');
      
    } catch(err) {
      showAlert('Sync failed: ' + err.message, 'error');
    }
  },

  async saveJobSheet() {
    await qry_update_collection_job_sheet.run();
    await qry_collection_get.run();
    showAlert('Job sheet saved ✓', 'success');
  }
}