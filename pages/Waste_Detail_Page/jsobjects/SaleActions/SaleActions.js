export default {
  onCreatePallet: async () => {
    try {
      await qry_insert_sale_pallet.run({
        customerId: Number(SalePalletsWidget.model.new_pallet_customer_id),
        createdBy: appsmith.user.email
      });
      await qry_get_sale_pallets.run();
      showAlert('Sale pallet created ✓', 'success');
    } catch (err) {
      showAlert('Failed to create pallet: ' + err.message, 'error');
    }
  },
  onClosePallet: async () => {
    try {
      await qry_close_sale_pallet.run({ palletId: Number(SalePalletsWidget.model.selectedPalletId) });
      await qry_get_sale_pallets.run();
      showAlert('Pallet closed ✓', 'success');
    } catch (err) {
      showAlert('Failed to close pallet: ' + err.message, 'error');
    }
  },
  onSaveItem: async () => {
    try {
      const m = SalePalletsWidget.model;
      await qry_insert_sale_pallet_item.run({
        palletId: Number(m.selectedPalletId),
        assetId: Number(m.item_asset_id),
        salePrice: Number(m.item_sale_price) || 0,
        notes: m.item_notes || '',
        addedBy: appsmith.user.email
      });
      await new Promise(resolve => setTimeout(resolve, 300));
      await qry_get_sale_pallet_items.run({ palletId: Number(m.selectedPalletId) });
      await qry_get_sale_pallet_detail.run();
      await qry_get_sale_pallets.run();
      showAlert('Asset added ✓', 'success');
    } catch (err) {
      showAlert('Failed to add asset: ' + err.message, 'error');
    }
  },
  onScanAsset: async () => {
    try {
      const m = SalePalletsWidget.model;
      await qry_get_asset_by_ref.run({ ref: m.scan_value });
      const asset = qry_get_asset_by_ref.data && qry_get_asset_by_ref.data[0];
      if (!asset) {
        showAlert('No matching asset found (or it may already be sold/disposed)', 'error');
        return;
      }
      await qry_insert_sale_pallet_item.run({
        palletId: Number(m.selectedPalletId),
        assetId: asset.asset_id,
        salePrice: 0,
        notes: '',
        addedBy: appsmith.user.email
      });
      if (!qry_insert_sale_pallet_item.data || qry_insert_sale_pallet_item.data.length === 0) {
        showAlert('This asset is already on the pallet', 'warning');
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 300));
      await qry_get_sale_pallet_items.run({ palletId: Number(m.selectedPalletId) });
      await qry_get_sale_pallet_detail.run();
      await qry_get_sale_pallets.run();
      showAlert('Asset added ✓', 'success');
    } catch (err) {
      showAlert('Failed to add asset: ' + err.message, 'error');
    }
  },
  onDeleteItem: async () => {
    try {
      const m = SalePalletsWidget.model;
      await qry_delete_pallet_item.run({ itemId: Number(m.delete_item_id) });
      await new Promise(resolve => setTimeout(resolve, 300));
      await qry_get_sale_pallet_items.run({ palletId: Number(m.selectedPalletId) });
      await qry_get_sale_pallet_detail.run();
      await qry_get_sale_pallets.run();
      showAlert('Asset removed ✓', 'success');
    } catch (err) {
      showAlert('Failed to remove asset: ' + err.message, 'error');
    }
  },
  onApplyPrice: async () => {
    try {
      await qry_update_sale_pallet_prices.run({
        palletId: Number(SalePalletsWidget.model.selectedPalletId),
        totalPrice: Number(SalePalletsWidget.model.sale_total)
      });
      await new Promise(resolve => setTimeout(resolve, 300));
      await qry_get_sale_pallet_detail.run();
      await qry_get_sale_pallet_items.run({ palletId: Number(SalePalletsWidget.model.selectedPalletId) });
      await qry_get_sale_pallets.run();
      showAlert('Price applied ✓', 'success');
    } catch (err) {
      showAlert('Failed to apply price: ' + err.message, 'error');
    }
  },
  onProcessOrder: async () => {
    try {
      await qry_process_sale_pallet.run({
        palletId: Number(SalePalletsWidget.model.selectedPalletId),
        processedBy: appsmith.user.email
      });
      await qry_get_sale_pallets.run();
      showAlert('Pallet processed as sale ✓', 'success');
    } catch (err) {
      showAlert('Failed to process order: ' + err.message, 'error');
    }
  }
}