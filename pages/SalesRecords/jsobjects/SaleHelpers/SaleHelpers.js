export default {
  addItem(row) {
    const current = appsmith.store.saleItems || [];
    const updated = [...current, row];
    return storeValue("saleItems", updated);
  },
	async onLoad() {
  await GetSales.run();
  await storeValue('salesData', GetSales.data);
}

}