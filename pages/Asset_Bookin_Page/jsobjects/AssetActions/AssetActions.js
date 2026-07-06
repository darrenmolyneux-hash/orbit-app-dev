export default {
  onViewAsset: () => {
    const id = Custom4.model.selectedAssetId;
    navigateTo('Asset_Page', { asset_id: id }, 'SAME_WINDOW');
  },
  onSerialEdited: async () => {
    try {
      const id = Custom4.model.editedAssetId;
      const serial = Custom4.model.editedSerial;
      await qry_asset_serial_update.run({
        asset_id: id,
        serial_number: serial
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
  }
}