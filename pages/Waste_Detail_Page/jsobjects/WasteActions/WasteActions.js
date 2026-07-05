export default {
  onCreatePallet: async () => {
    try {
      await qry_get_next_waste_id.run();
      await qry_insert_waste_pallet.run({
        weight: null,
        notes: '',
        wasteType: 'mixed_electrical',
        createdBy: appsmith.store.userEmail
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
          weight: m.pallet_weight ? Number(m.pallet_weight) : null,
          notes: m.pallet_notes || '',
          wasteType: m.pallet_waste_type
        });
      } else {
        await qry_get_next_waste_id.run();
        await qry_insert_waste_pallet.run({
          weight: m.pallet_weight ? Number(m.pallet_weight) : null,
          notes: m.pallet_notes || '',
          wasteType: m.pallet_waste_type,
          createdBy: appsmith.store.userEmail
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
        addedBy: appsmith.store.userEmail
      });
      await qry_get_pallet_items.run({ palletId: Number(m.selectedPalletId) });
      await qry_get_waste_pallets.run();
      showAlert('Item added ✓', 'success');
    } catch (err) {
      showAlert('Failed to add item: ' + err.message, 'error');
    }
  },
  onDispatchBatch: async (batchId) => {
    try {
      await qry_dispatch_batch.run({
        batchId: batchId,
        dispatchedBy: appsmith.store.userEmail
      });
      await qry_home_waste_batches.run();
      await qry_get_waste_pallets.run();
      showAlert('Batch dispatched ✓', 'success');
    } catch (err) {
      showAlert('Failed to dispatch batch: ' + err.message, 'error');
    }
  },
  onCreateWasteBatch: async () => {
    try {
      const m = WastePalletsWidget.model;
      if (!m.batch_vendor_id || !m.batch_pallet_ids || !m.batch_pallet_ids.length) {
        showAlert('Missing vendor or pallet selection', 'error');
        return;
      }

      await qry_next_batch_ref.run();
      const batchRef = qry_next_batch_ref.data[0].next_ref;

      await qry_create_waste_batch.run({
        batchRef: batchRef,
        vendorId: Number(m.batch_vendor_id),
        createdBy: appsmith.store.userEmail,
        collectionDate: m.batch_collection_date || null,
        wasteNoteNumber: m.batch_waste_note_number || null
      });
      const batchId = qry_create_waste_batch.data[0].batch_id;

      await qry_add_pallets_to_batch.run({
        batchId: batchId,
        palletIds: m.batch_pallet_ids.join(',')
      });

      await qry_get_waste_pallets.run();
      await qry_home_waste_batches.run();
      showAlert('Batch ' + batchRef + ' created ✓', 'success');
    } catch (err) {
      showAlert('Failed to create batch: ' + err.message, 'error');
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