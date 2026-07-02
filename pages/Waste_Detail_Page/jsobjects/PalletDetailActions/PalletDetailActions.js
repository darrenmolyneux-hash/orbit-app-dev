export default {
  onGoBack: () => {
    navigateTo('Waste_Page', {}, 'SAME_WINDOW');
  },
  onClosePallet: async () => {
    storeValue('pallet_id', Number(appsmith.URL.queryParams.pallet_id));
    storeValue('pallet_status', 'closed');
    storeValue('pallet_vendor_id', null);
    storeValue('pallet_weight', null);
    storeValue('pallet_collection_date', null);
    storeValue('pallet_notes', null);
    storeValue('pallet_waste_type', null);
    await qry_close_waste_pallet.run();
    await qry_get_pallet_detail.run();
  },
 onSearchAssets: async () => {
  storeValue('pallet_search', PalletDetailWidget.model.search_query);
  const results = await qry_search_assets_for_pallet.run();
  storeValue('asset_search_results', results);
},
onSearchParts: async () => {
  storeValue('pallet_search', PalletDetailWidget.model.search_query);
  const results = await qry_search_parts_for_pallet.run();
  storeValue('part_search_results', results);
},
  onSaveItem: async () => {
    const m = PalletDetailWidget.model;
    storeValue('item_type', m.item_type);
    storeValue('item_asset_id', m.item_asset_id);
    storeValue('item_part_id', m.item_part_id);
    storeValue('item_description', m.item_description);
    storeValue('item_quantity', m.item_quantity);
    storeValue('item_notes', m.item_notes);
    await qry_insert_pallet_item.run();
    await qry_get_pallet_items.run();
  },
  onDeleteItem: async () => {
    storeValue('item_id', PalletDetailWidget.model.delete_item_id);
    await qry_delete_pallet_item.run();
    await qry_get_pallet_items.run();
  }
}