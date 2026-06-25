export default {
  updateStatus: async () => {
    const newStatusId = Custom5.model.selectedStatusId;
    storeValue('pending_status_id', newStatusId);
    if (newStatusId === 15) {
      showModal('Harvest_Warning');
      return;
    }
    if (newStatusId === 13) {
      showModal('Repair_Warning');
      return;
    }
    await UpdateAssetStatus.run();
    await InsertAssetAuditLog.run();
    await qry_insert_status_history.run();
    await qry_GetAssetById.run();
    storeValue('pending_status_id', null);
  },
  cancelHarvest: () => {
    storeValue('pending_status_id', null);
    qry_GetAssetById.run();
  },
  confirmHarvest: async () => {
    try {
      await UpdateAssetStatus.run();
      await InsertAssetAuditLog.run();
      await qry_insert_status_history.run();
      await qry_set_stripped_date.run();
      closeModal('Harvest_Warning');
      storeValue('pending_status_id', null);
      showAlert('Asset status updated. Starting pre-inventory...', 'success');
      navigateTo('PreInventory_Page', { asset_id: appsmith.URL.queryParams.asset_id }, 'SAME_WINDOW');
    } catch (err) {
      showAlert('Error updating status: ' + err.message, 'error');
      console.log('confirmHarvest error:', err);
    }
  },
  cancelRepair: () => {
    storeValue('pending_status_id', null);
    qry_GetAssetById.run();
  },
  confirmRepair: async () => {
    try {
      await UpdateAssetStatus.run();
      await InsertAssetAuditLog.run();
      await qry_insert_status_history.run();
      closeModal('Repair_Warning');
      storeValue('pending_status_id', null);
      showAlert('Asset marked as In Repair. Select a part to add...', 'success');
      showModal('ModalAddPart');
    } catch (err) {
      showAlert('Error updating status: ' + err.message, 'error');
      console.log('confirmRepair error:', err);
    }
  },
  viewSale: () => {
    const saleId = Custom5.model.saleId;
    if (!saleId) {
      showAlert('No sale linked to this asset', 'warning');
      return;
    }
    navigateTo('SaleDetails', { sale_id: saleId }, 'SAME_WINDOW');
  },
  saveCost: async () => {
    await UpdateOriginalCost.run();
    await qry_GetAssetById.run();
  },
  onTabChange: async () => {
    if (Tabs1.selectedTab === 'Grading') {
      await Query3qry_grading_get.run();
    }
    if (Tabs1.selectedTab === 'Remove parts' && appsmith.store.harvest_step === 0) {
      await JSParts.init();
    }
    if (Tabs1.selectedTab === 'Add parts') {
      await qry_add_parts_search.run();
      await qry_get_asset_parts_combined.run();
    }
  },
  confirmAddPart_fromWidget: async () => {
    const row = appsmith.store.add_part_row;
    if (!row) {
      showAlert('No part selected', 'warning');
      return;
    }
    if (row.availability === 'in_stock') {
      storeValue('hp_install_id',        row.harvested_part_id);
      storeValue('pal_part_id',          row.harvested_part_id);
      storeValue('pal_action',           'stock_to_asset');
      storeValue('pal_movement_type',    'stock_to_asset');
      storeValue('pal_from_asset_id',    null);
      storeValue('pal_from_location_id', null);
      storeValue('pal_to_asset_id',      Number(appsmith.URL.queryParams.asset_id));
      storeValue('pal_to_location_id',   null);
      storeValue('hp_condition_grade',   row.condition_grade);
      storeValue('hp_notes',             'Installed from stock');
      storeValue('hp_signature',         appsmith.user.name + ' | ' + new Date().toISOString());
      try {
        await qry_install_part.run();
        await qry_install_part_pia.run();
        await qry_update_part_cost.run();
        await qry_insert_parts_audit_log.run();
        await qry_add_parts_search.run();
        await qry_get_asset_parts_combined.run();
        showAlert('Part installed successfully ✓', 'success');
      } catch (err) {
        showAlert('Install failed: ' + err.message, 'error');
      }
    } else {
      storeValue('donor_pia_id',     row.donor_pia_id);
      storeValue('donor_asset_id',   row.donor_asset_id);
      storeValue('donor_part_type',  row.part_type);
      storeValue('donor_make',       row.donor_make);
      storeValue('donor_model',      row.donor_model);
      storeValue('donor_asset_ref',  row.donor_asset_ref);
      storeValue('donor_is_battery', row.is_battery);
      storeValue('add_part_step',    'removal_wizard');
      showModal('ModalAddPart');
    }
  },
  saveGrading: async () => {
    await qry_grading_save.run();
    await qry_update_overall_grade.run();
    await qry_GetAssetById.run();
  }
}