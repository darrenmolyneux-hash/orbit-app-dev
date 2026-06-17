export default {

  updateStatus: async () => {
    const newStatusId = Custom5.model.selectedStatusId;
    storeValue('pending_status_id', newStatusId);

    if (newStatusId === 15) {
      showModal('Modal1');
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
      await qry_GetAssetById.run();
      JSParts.init();
      closeModal('Modal1');
      storeValue('pending_status_id', null);
      Tabs1.selectedTab = 'Add/Remove parts';
      showAlert('Asset sent for parts harvesting. Log components below.', 'success');
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