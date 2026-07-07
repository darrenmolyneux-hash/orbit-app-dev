export default {
  onPageLoad: async () => {
    await storeValue('asset_page', 1);
    await storeValue('asset_search', '');
    await storeValue('asset_status_filter', '');
    await qry_asset_list_s.run();
    await qry_asset_list_count.run();
  },
  onSearch: async () => {
    await storeValue('asset_search', AssetListWidget.model.searchTerm);
    await storeValue('asset_page', 1);
    await qry_asset_list_s.run();
    await qry_asset_list_count.run();
  },
  onFilterStatus: async () => {
    await storeValue('asset_status_filter', AssetListWidget.model.statusFilter);
    await storeValue('asset_page', 1);
    await qry_asset_list_s.run();
    await qry_asset_list_count.run();
  },
  onPageChange: async () => {
    await storeValue('asset_page', AssetListWidget.model.newPage);
    await qry_asset_list_s.run();
  },
  onPageSizeChange: async () => {
    await storeValue('asset_page_size', AssetListWidget.model.newPageSize);
    await storeValue('asset_page', 1);
    await qry_asset_list_s.run();
    await qry_asset_list_count.run();
  }
}