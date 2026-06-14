export default {
  confirmSerials: async () => {
    const serials = tbl_serial_entry.tableData.map(row => row.serial);
    
    if (serials.some(s => !s || s.trim() === '')) {
      await showAlert('Please enter a serial for every item', 'warning');
      return;
    }
    
    await storeValue('pendingSerials', JSON.stringify(serials));
    
    try {
      await qry_asset_insert.run();
      await qry_booked_assets.run();
      await closeModal('SerialEntryModal');
      await showAlert(serials.length + ' assets added', 'success');
    } catch (error) {
      await showAlert('Failed to add assets — ' + error.message, 'error');
    }
  }
}