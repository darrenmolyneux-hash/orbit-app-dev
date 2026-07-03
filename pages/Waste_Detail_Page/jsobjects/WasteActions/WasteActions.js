export default {
  onSavePallet: async () => {
    try {
      const isEdit = WastePalletsWidget.model.is_edit;
      if (isEdit) {
        await qry_update_waste_pallet.run();
      } else {
        await qry_get_next_waste_id.run();
        await qry_insert_waste_pallet.run();
      }
      await qry_get_waste_pallets.run();
      showAlert('Pallet saved ✓', 'success');
    } catch (err) {
      showAlert('Failed to save pallet: ' + err.message, 'error');
    }
  },
  onClosePallet: async () => {
    try {
      await qry_close_waste_pallet.run();
      await qry_get_waste_pallets.run();
      showAlert('Pallet closed ✓', 'success');
    } catch (err) {
      showAlert('Failed to close pallet: ' + err.message, 'error');
    }
  },
onSaveItem: async () => {
  try {
    const m = WastePalletsWidget.model;
    await qry_insert_pallet_item.run({
      palletId: Number(m.selectedPalletId),
      itemType: m.item_type,
      itemAssetId: m.item_asset_id ? Number(m.item_asset_id) : null,
      itemPartId: m.item_part_id ? Number(m.item_part_id) : null,
      description: m.item_description || '',
      quantity: Number(m.item_quantity) || 1,
      notes: m.item_notes || '',
      addedBy: appsmith.user.name
    });
    await qry_get_pallet_items.run();
    await qry_get_waste_pallets.run();
    showAlert('Item added ✓', 'success');
  } catch (err) {
    showAlert('Failed to add item: ' + err.message, 'error');
  }
},
  onDeleteItem: async () => {
    try {
      await qry_delete_pallet_item.run();
      await qry_get_pallet_items.run();
      await qry_get_waste_pallets.run();
      showAlert('Item removed ✓', 'success');
    } catch (err) {
      showAlert('Failed to remove item: ' + err.message, 'error');
    }
  }
}