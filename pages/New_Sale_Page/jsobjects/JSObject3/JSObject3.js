export default {
	Custom2onSearch: async function() {
		await SearchSaleItem.run();
		await GetAssetStatus.run();
		await CheckAssetOnSale.run();
	}
}