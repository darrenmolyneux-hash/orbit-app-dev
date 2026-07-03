export default {
  onCreatePallet: async () => {
    try {
      await qry_get_next_waste_id.run();
      await qry_insert_waste_pallet.run({
        vendorId: null,
        weight: null,
        collectionDate: null,
        notes: '',
        wasteType: 'mixed_electrical',
        createdBy: appsmith.user.email
      });
      await qry_get_waste_pallets.run();
      showAlert('Pallet created ✓', 'success');
    } catch (err) {
      showAlert('Failed to create pallet: ' + err.message, 'error');
    }
  },
  onSavePallet: async () => {
    try {
      const m = WastePalletsWidget.model;
      const isEdit = m.is_edit;
      if (isEdit) {
        await qry_update_waste_pallet.run({
          palletId: Number(m.pallet_id),
          status: m.pallet_status,
          vendorId: m.pallet_vendor_id ? Number(m.pallet_vendor_id) : null,
          weight: m.pallet_weight ? Number(m.pallet_weight) : null,
          collectionDate: m.pallet_collection_date,
          notes: m.pallet_notes || '',
          wasteType: m.pallet_waste_type
        });
      } else {
        await qry_get_next_waste_id.run();
        await qry_insert_waste_pallet.run({
          vendorId: m.pallet_vendor_id ? Number(m.pallet_vendor_id) : null,
          weight: m.pallet_weight ? Number(m.pallet_weight) : null,
          collectionDate: m.pallet_collection_date,
          notes: m.pallet_notes || '',
          wasteType: m.pallet_waste_type,
          createdBy: appsmith.user.email
        });
      }
      await qry_get_waste_pallets.run();
      showAlert('Pallet saved ✓', 'success');
    } catch (err) {
      showAlert('Failed to save pallet: ' + err.message, 'error');
    }
  },
  onClosePallet: async () => {
    try {
      await qry_close_waste_pallet.run({ palletId: Number(WastePalletsWidget.model.selectedPalletId) });
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
        addedBy: appsmith.user.email
      });
      await qry_get_pallet_items.run({ palletId: Number(m.selectedPalletId) });
      await qry_get_waste_pallets.run();
      showAlert('Item added ✓', 'success');
    } catch (err) {
      showAlert('Failed to add item: ' + err.message, 'error');
    }
  },
  onDeleteItem: async () => {
    try {
      const m = WastePalletsWidget.model;
      await qry_delete_pallet_item.run({ itemId: Number(m.delete_item_id) });
      await qry_get_pallet_items.run({ palletId: Number(m.selectedPalletId) });
      await qry_get_waste_pallets.run();
      showAlert('Item removed ✓', 'success');
    } catch (err) {
      showAlert('Failed to remove item: ' + err.message, 'error');
    }
  }
}