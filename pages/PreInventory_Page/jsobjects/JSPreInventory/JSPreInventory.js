export default {
  async init() {
    await qry_GetAssetById.run();
    await qry_get_part_types.run();
  },

  async savePreInventory(assessedParts) {
    if (!assessedParts || assessedParts.length === 0) {
      showAlert('No parts to save.', 'error');
      return;
    }
    let savedCount = 0;
    let errorCount = 0;
    for (const part of assessedParts) {
      try {
        storeValue('pi_part_type_id', part.part_type_id);
        storeValue('pi_make',         part.make);
        storeValue('pi_model',        part.model);
        storeValue('pi_condition',    part.condition);
        storeValue('pi_is_battery',   part.is_battery);
        storeValue('pi_salvageable',  part.is_salvageable);
        storeValue('pi_notes',        part.notes);
        await qry_get_next_part_ref.run();
        await qry_pre_inventory_insert.run();
        const newId = qry_pre_inventory_insert.data[0]?.id;
        if (newId && !part.is_salvageable) {
          storeValue('pi_new_part_id', newId);
          await qry_pre_inventory_scrap_log.run();
        }
        savedCount++;
      } catch (err) {
        errorCount++;
        console.log('Part save error:', part.part_type_name, err.message);
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