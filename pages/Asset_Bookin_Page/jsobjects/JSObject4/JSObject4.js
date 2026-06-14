{{
  (function() {
    const serials = tbl_serial_entry.tableData.map(row => row.serial);
    if (serials.some(s => !s || s.trim() === '')) {
      showAlert('Please enter a serial for every item', 'warning');
      return;
    }
    storeValue('pendingSerials', JSON.stringify(serials));
    qry_asset_insert.run(function() {
      qry_booked_assets.run();
      closeModal('SerialEntryModal');
      showAlert(serials.length + ' assets added', 'success');
    }, function(error) {
      showAlert('Failed to add assets — ' + error.message, 'error');
    });
  })()
}}