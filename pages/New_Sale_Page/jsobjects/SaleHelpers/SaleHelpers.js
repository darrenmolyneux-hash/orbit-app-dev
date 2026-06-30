export default {
  addItem(row) {
    const current = appsmith.store.saleList || [];
    const updated = [...current, row];
    return storeValue("saleList", updated);
  },
  removeItem(asset_id) {
    const current = appsmith.store.saleList || [];
    const updated = current.filter(item => item.asset_id !== asset_id);
    return storeValue("saleList", updated);
  }
}