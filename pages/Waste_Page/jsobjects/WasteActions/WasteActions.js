export default {
  onSavePallet: async () => {
    const m = WastePalletsWidget.model;
    storeValue('pallet_waste_type', m.pallet_waste_type);
    storeValue('pallet_vendor_id', m.pallet_vendor_id);
    storeValue('pallet_weight', m.pallet_weight);
    storeValue('pallet_collection_date', m.pallet_collection_date);
    storeValue('pallet_status', m.pallet_status);
    storeValue('pallet_notes', m.pallet_notes);
    storeValue('pallet_id', m.pallet_id);
    if (m.is_edit) {
      await qry_update_waste_pallet.run();
    } else {
      await qry_insert_waste_pallet.run();
    }
    await qry_get_waste_pallets.run();
  },
  onViewPallet: () => {
    const p = WastePalletsWidget.model.selected_pallet;
    navigateTo('Waste_Detail_Page', { pallet_id: p.pallet_id }, 'SAME_WINDOW');
  }
}