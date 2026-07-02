export default {
  async init() {
    await qry_GetAssetById.run();
    await qry_get_part_types.run();
  },
  async saveAssessmentFromWidget() {
    const scrap = Custom_PreInventory.model.scrapState || {};
    const notes = Custom_PreInventory.model.notesState || {};
    Object.keys(scrap).forEach(function(id) {
      storeValue('scrap_' + id, scrap[id]);
      storeValue('notes_' + id, notes[id] || '');
    });
    await this.savePreInventory();
  },
  async savePreInventory() {
    const parts = qry_get_part_types.data;
    if (!parts || parts.length === 0) {
      showAlert('No parts to save.', 'error');
      return;
    }
    let savedCount = 0;
    let errorCount = 0;
    for (const part of parts) {
      try {
        const isScrap = appsmith.store['scrap_' + part.part_type_id] || false;
        const notes = appsmith.store['notes_' + part.part_type_id] || '';
        storeValue('pi_part_type_id', part.part_type_id);
        storeValue('pi_salvageable',  !isScrap);
        storeValue('pi_notes',        notes);
        await qry_get_next_part_ref.run();
        await qry_pre_inventory_insert.run();
        const newId = qry_pre_inventory_insert.data[0]?.id;
        if (newId && isScrap) {
          storeValue('pi_new_part_id', newId);
          await qry_pre_inventory_scrap_log.run();
        }
        savedCount++;
      } catch (err) {
        errorCount++;
        console.log('Part save error:', part.name, err.message);
      }
    }
    if (errorCount > 0) {
      showAlert(errorCount + ' parts failed to save. Check browser console.', 'error');
      return;
    }
    showAlert(savedCount + ' parts logged successfully ✓', 'success');
    navigateTo('Asset_Page', { asset_id: appsmith.URL.queryParams.asset_id }, 'SAME_WINDOW');
  }
}