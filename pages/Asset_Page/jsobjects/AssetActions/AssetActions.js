export default {
  updateStatus: async () => {
    const newStatusId = Custom5.model.selectedStatusId;
    storeValue('pending_status_id', newStatusId);
    if (newStatusId === 15) {
      showModal('Harvest_Warning');
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
      closeModal('Harvest_Warning');
      storeValue('pending_status_id', null);
      showAlert('Asset status updated. Starting pre-inventory...', 'success');
      navigateTo('PreInventory_Page', { asset_id: appsmith.URL.queryParams.asset_id }, 'SAME_WINDOW');
    } catch (err) {
      showAlert('Error updating status: ' + err.message, 'error');
      console.log('confirmHarvest error:', err);
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
    if (Tabs1.selectedTab === 'Add/Remove parts') {
      await JSParts.init();
    }
  },
  saveGrading: async () => {
    await qry_grading_save.run();
    await qry_update_overall_grade.run();
    await qry_GetAssetById.run();
  }
}