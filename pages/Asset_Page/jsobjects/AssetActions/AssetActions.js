export default {
  updateStatus: async () => {
    const newStatusId = Custom5.model.selectedStatusId;
    const previousStatus = qry_GetAssetById.data[0]?.status_id;
    storeValue('pending_status_id', newStatusId);
    if (newStatusId === 15) { showModal('Harvest_Warning'); return; }
    if (newStatusId === 13) { showModal('Repair_Warning'); return; }
    await UpdateAssetStatus.run();
    await InsertAssetAuditLog.run({
      fieldName: 'status',
      oldValue: previousStatus ?? '—',
      newValue: newStatusId
    });
    await qry_insert_status_history.run();
    await qry_GetAssetById.run();
    storeValue('pending_status_id', null);
  },
  cancelHarvest: () => { storeValue('pending_status_id', null); qry_GetAssetById.run(); },
  confirmHarvest: async () => {
    try {
      const previousStatus = qry_GetAssetById.data[0]?.status_id;
      await UpdateAssetStatus.run();
      await InsertAssetAuditLog.run({
        fieldName: 'status',
        oldValue: previousStatus ?? '—',
        newValue: Custom5.model.selectedStatusId
      });
      await qry_insert_status_history.run();
      await qry_set_stripped_date.run();
      closeModal('Harvest_Warning');
      storeValue('pending_status_id', null);
      showAlert('Asset status updated. Starting pre-inventory...', 'success');
      navigateTo('PreInventory_Page', { asset_id: appsmith.URL.queryParams.asset_id }, 'SAME_WINDOW');
    } catch (err) { showAlert('Error: ' + err.message, 'error'); }
  },
  cancelRepair: () => { storeValue('pending_status_id', null); qry_GetAssetById.run(); },
  confirmRepair: async () => {
    try {
      const previousStatus = qry_GetAssetById.data[0]?.status_id;
      await UpdateAssetStatus.run();
      await InsertAssetAuditLog.run({
        fieldName: 'status',
        oldValue: previousStatus ?? '—',
        newValue: Custom5.model.selectedStatusId
      });
      await qry_insert_status_history.run();
      closeModal('Repair_Warning');
      storeValue('pending_status_id', null);
      showAlert('Asset marked as In Repair.', 'success');
      showModal('ModalAddPart');
    } catch (err) { showAlert('Error: ' + err.message, 'error'); }
  },
  viewSale: () => {
    const saleId = Custom5.model.saleId;
    if (!saleId) { showAlert('No sale linked to this asset', 'warning'); return; }
    navigateTo('SaleDetails', { sale_id: saleId }, 'SAME_WINDOW');
  },
  saveCost: async () => {
    const m = FinancialWidget.model;
    const previousCost = qry_GetAssetById.data[0]?.original_cost;
    await storeValue('asset_original_cost', m.input_cost);
    await UpdateOriginalCost.run();
    await qry_GetAssetById.run();
    const newCost = qry_GetAssetById.data[0]?.original_cost;
    if (newCost !== previousCost) {
      await InsertAssetAuditLog.run({
        fieldName: 'Cost',
        oldValue: previousCost ?? '—',
        newValue: newCost ?? '—'
      });
      await qry_asset_history.run();
    }
    showAlert('Cost saved ✓', 'success');
  },
	saveHarvestedPartCost: async (harvestedPartId, newCost) => {
  try {
    await qry_update_harvested_part_cost.run({
      harvestedPartId: harvestedPartId,
      newCost: newCost
    });
    await qry_get_asset_parts_combined.run();
    await qry_get_asset_parts_cost.run();
    showAlert('Cost updated ✓', 'success');
  } catch (err) {
    showAlert('Failed to update cost — ' + err.message, 'error');
  }
},
  saveSellPrice: async () => {
    const m = FinancialWidget.model;
    const previousPrice = qry_GetAssetById.data[0]?.sell_price;
    await storeValue('asset_sell_price', m.input_sell);
    await UpdateSellPrice.run();
    await qry_GetAssetById.run();
    const newPrice = qry_GetAssetById.data[0]?.sell_price;
    if (newPrice !== previousPrice) {
      await InsertAssetAuditLog.run({
        fieldName: 'Sell Price',
        oldValue: previousPrice ?? '—',
        newValue: newPrice ?? '—'
      });
      await qry_asset_history.run();
    }
    showAlert('Sell price saved ✓', 'success');
  },
  onViewSale: () => {
    navigateTo('SaleDetails', { sale_id: FinancialWidget.model.sale_id }, 'SAME_WINDOW');
  },
  onTabChange: async () => {
    if (Tabs1.selectedTab === 'Grading') {
      await Query3qry_grading_get.run();
      await storeValue('gradingLoadedAt', Date.now());
    }
    if (Tabs1.selectedTab === 'History') {
      await qry_asset_history.run();
    }
    if (Tabs1.selectedTab === 'Remove parts') {
      await qry_repair_scraps.run();
      await qry_scrap_locations.run();
      if (appsmith.store.harvest_step === 0) { await JSParts.init(); }
    }
    if (Tabs1.selectedTab === 'Add parts') {
      await qry_add_parts_search.run();
      await qry_get_asset_parts_combined.run();
      await qry_get_parts_stock.run();
      await qry_part_types_list.run();
      await qry_search_available_parts.run();
      await qry_get_open_hdd_pallets.run();
    }
    if (Tabs1.selectedTab === 'Pricing') {
      await qry_purchaseHistory.run();
      await qry_saleHistory.run();
      await qry_priceTrend.run();
      await qry_estimatedValue.run();
    }
  },
  confirmAddPart_fromWidget: async () => {
    const row = appsmith.store.add_part_row;
    if (!row) { showAlert('No part selected', 'warning'); return; }
    if (row.availability === 'in_stock') {
      await Promise.all([
        storeValue('hp_install_id', row.harvested_part_id),
        storeValue('pal_part_id', row.harvested_part_id),
        storeValue('pal_action', 'stock_to_asset'),
        storeValue('pal_movement_type', 'stock_to_asset'),
        storeValue('pal_from_asset_id', null),
        storeValue('pal_from_location_id', null),
        storeValue('pal_to_asset_id', Number(appsmith.URL.queryParams.asset_id)),
        storeValue('pal_to_location_id', null),
        storeValue('hp_condition_grade', row.condition_grade),
        storeValue('hp_notes', 'Installed from stock'),
        storeValue('hp_part_cost', row.part_cost),
        storeValue('hp_signature', appsmith.store.userName + ' | ' + new Date().toISOString())
      ]);
      try {
        await qry_install_part.run();
        await qry_install_part_pia.run({ assetId: Number(appsmith.URL.queryParams.asset_id) });
        await qry_update_part_cost.run();
        await qry_insert_parts_audit_log.run();
        await qry_add_parts_search.run();
        await qry_get_asset_parts_combined.run();
        await qry_get_asset_parts_cost.run();
        showAlert('Part installed ✓', 'success');
      } catch (err) { showAlert('Install failed: ' + err.message, 'error'); }
    } else {
      storeValue('donor_pia_id', row.donor_pia_id);
      storeValue('donor_asset_id', row.donor_asset_id);
      storeValue('donor_part_type', row.part_type);
      storeValue('donor_make', row.donor_make);
      storeValue('donor_model', row.donor_model);
      storeValue('donor_asset_ref', row.donor_asset_ref);
      storeValue('donor_is_battery', row.is_battery);
      storeValue('add_part_step', 'removal_wizard');
      showModal('ModalAddPart');
    }
  },
  applyLockStatus: async (locks) => {
    showAlert('applyLock type: ' + typeof qry_update_status_direct, 'info');
    const biosLock = locks['BIOS Lock'];
    const mdmLock = locks['MDM Lock'];
    const icloudLock = locks['iCloud Lock'];
    const anyLock = biosLock || mdmLock || icloudLock;
    if (!anyLock) return;
    let targetStatusId = null;
    if (icloudLock) targetStatusId = 10;
    else if (mdmLock) targetStatusId = 8;
    else if (biosLock) targetStatusId = 9;
    await storeValue('pending_status_id', targetStatusId);
    await qry_update_status_direct.run();
    await qry_insert_status_history_dire.run();
    await qry_GetAssetById.run();
    storeValue('pending_status_id', null);
  },
  clearLocks: async () => {
    await storeValue('grade_bios', false);
    await storeValue('grade_mdm', false);
    await storeValue('grade_efi', false);
    await storeValue('grade_icloud', false);
    await storeValue('grade_intune', false);
    await storeValue('grade_overall', Custom_Grading.model.overallGrade || '');
    await storeValue('grade_notes', Custom_Grading.model.notes || '');
    await qry_grading_save.run();
    await storeValue('pending_status_id', 23);
    await qry_update_status_direct.run();
    await qry_insert_status_history_dire.run();
    await storeValue('pending_status_id', 1);
    await qry_update_status_direct.run();
    await qry_insert_status_history_dire.run();
    await qry_GetAssetById.run();
    await Query3qry_grading_get.run();
    await qry_asset_history.run();
    await storeValue('gradingLoadedAt', Date.now());
    storeValue('pending_status_id', null);
    showAlert('Locks cleared — asset released ✓', 'success');
  },
  handleShred: async () => {
    try {
      const m = DriveWidget.model;
      const createNew = m.shred_create_new_pallet;
      let palletId = m.shred_pallet_id;
      if (createNew) {
        const result = await qry_insert_hdd_waste_pallet.run();
        palletId = result[0]?.pallet_id || null;
      }
      await storeValue('shred_serial', m.shred_serial || '');
      await storeValue('shred_model', m.shred_model || '');
      await storeValue('shred_interface', m.shred_interface || '');
      await storeValue('shred_capacity', m.shred_capacity || '');
      await storeValue('shred_type', m.shred_type || 'manual');
      await storeValue('shred_pallet_id', palletId);
      await storeValue('shred_notes', m.shred_notes || '');
      await storeValue('shred_cert_ref', '');
      await qry_insert_shred_record.run();
      await qry_get_shred_records.run();
      await qry_get_open_hdd_pallets.run();
      showAlert('Shred record created ✓', 'success');
    } catch(err) {
      showAlert('Shred error: ' + err.message, 'error');
    }
  },
  removeInstalledPart: async (harvestedPartId) => {
    try {
      await qry_uninstall_part.run({ harvestedPartId: harvestedPartId });
      await qry_clear_pia_link.run({
        assetId: Number(appsmith.URL.queryParams.asset_id),
        harvestedPartId: harvestedPartId
      });
      await Promise.all([
        storeValue('pal_part_id', harvestedPartId),
        storeValue('pal_action', 'asset_to_stock'),
        storeValue('pal_movement_type', 'asset_to_stock'),
        storeValue('pal_from_asset_id', Number(appsmith.URL.queryParams.asset_id)),
        storeValue('pal_to_asset_id', null),
        storeValue('pal_from_location_id', null),
        storeValue('pal_to_location_id', null),
        storeValue('hp_condition_grade', ''),
        storeValue('hp_notes', 'Removed from asset — returned to stock'),
        storeValue('hp_signature', appsmith.store.userName + ' | ' + new Date().toISOString())
      ]);
      await qry_insert_parts_audit_log.run();
      await qry_get_asset_parts_combined.run();
      await qry_search_available_parts.run();
      await qry_get_asset_parts_cost.run();
      showAlert('Part removed and returned to stock ✓', 'success');
    } catch (err) {
      showAlert('Failed to remove part — ' + err.message, 'error');
    }
  },
  saveGrading: async () => {
    try {
      const previousGrade = qry_GetAssetById.data[0]?.overall_grade;
      await qry_grading_save.run();
      await qry_update_overall_grade.run();
      await qry_GetAssetById.run();
      const newGrade = qry_GetAssetById.data[0]?.overall_grade;
      if (newGrade !== previousGrade) {
        await InsertAssetAuditLog.run({
          fieldName: 'Overall Grade',
          oldValue: previousGrade || '—',
          newValue: newGrade || '—'
        });
        await qry_asset_history.run();
      }
      const biosLock = appsmith.store.lock_bios || false;
      const mdmLock = appsmith.store.lock_mdm || false;
      const icloudLock = appsmith.store.lock_icloud || false;
      const anyLock = biosLock || mdmLock || icloudLock;
      if (anyLock) {
        await AssetActions.applyLockStatus({ 'BIOS Lock': biosLock, 'MDM Lock': mdmLock, 'iCloud Lock': icloudLock });
        await Query3qry_grading_get.run();
        await storeValue('gradingLoadedAt', Date.now());
      }
      showAlert('Grading saved ✓', 'success');
    } catch(err) {
      showAlert('Save error: ' + err.message, 'error');
    }
  }
}