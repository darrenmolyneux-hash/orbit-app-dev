export default {
  addAsset: async function() {
    try {
      var asset = Custom3.model.asset;
      var qty = parseInt(asset.qty) || 1;
      await storeValue('pendingItemType', Number(asset.item_type_id));
      await storeValue('pendingMake', Number(asset.make_id));
      await storeValue('pendingModel', Number(asset.model_id));
      await storeValue('pendingDataBearing', asset.is_data_bearing === true);
      var refs = [];
      var serials = [];
      for (var i = 0; i < qty; i++) {
        await qry_next_asset_ref.run();
        var row = qry_next_asset_ref.data[0];
        refs.push(row ? row.asset_ref : null);
        serials.push(i === 0 ? (asset.serial_no || '') : '');
      }
      await storeValue('pendingSerials', JSON.stringify(serials));
      await storeValue('pendingAssetRefs', JSON.stringify(refs));
      await qry_asset_insert.run();
      await qry_booked_assets.run();
      return true;
    } catch (error) {
      const msg = error?.message || '';
      if (msg.includes('idx_assets_serial_unique') || msg.includes('duplicate key')) {
        showAlert('An asset with this serial number already exists — please check and try again.', 'error');
      } else {
        showAlert('Failed to add asset — ' + (msg || 'unknown error'), 'error');
      }
      return false;
    }
  },
  onSaveAssetSerial: async () => {
    try {
      const row = tbl_booked_assets.updatedRow;
      await qry_asset_serial_update.run({
        asset_id: row.asset_id,
        serial_number: row.serial_number
      });
      await qry_booked_assets.run();
      showAlert('Serial number updated', 'success');
    } catch (error) {
      const msg = error?.message || '';
      if (msg.includes('idx_assets_serial_unique') || msg.includes('duplicate key')) {
        showAlert('An asset with this serial number already exists — please check and try again.', 'error');
      } else {
        showAlert('Failed to update serial — ' + (msg || 'unknown error'), 'error');
      }
    }
  },
  confirmAssets: async function() {
    await qry_collection_update_status.run();
    navigateTo('Collection_job_View', { collectionId: appsmith.URL.queryParams.collectionId }, 'SAME_WINDOW');
  }
}