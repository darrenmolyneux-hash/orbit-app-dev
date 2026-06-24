export default {
  async run() {
    if (!SalePlatformSelect.selectedOptionValue) {
      showAlert("Please select a sale platform before processing", "warning");
      return;
    }

    const items = appsmith.store.saleList || [];
    if (items.length === 0) {
      showAlert("No items in sale", "warning");
      return;
    }
    const total = items.reduce(
      (sum, item) => sum + Number(item.sell_price || 0),
      0
    );
    const saleHeader = await InsertSaleHeader.run({
      total_price: total
    });
    const sale_id = saleHeader[0].sale_id;
    const sale_ref = saleHeader[0].sale_ref;
    await storeValue('currentSaleId', sale_id);
    await GetPlatformFee.run();
    const feePercentage = Number(GetPlatformFee.data[0]?.fee_percentage || 0);
    for (let item of items) {
      const saleItemResult = await InsertSaleItem.run({
        sale_id: sale_id,
        asset_id: item.asset_id,
        sell_price: item.sell_price
      });
      const sale_item_id = saleItemResult[0].sale_item_id;
      const feeAmount = Number(item.sell_price) * (feePercentage / 100);
      await InsertSaleFee.run({
        sale_item_id: sale_item_id,
        fee_type: 'Platform Fee',
        fee_amount: feeAmount.toFixed(2)
      });
      await MarkAssetSold.run({
        asset_id: item.asset_id,
        sale_id: sale_id
      });
    }
    storeValue("saleList", []);
    showAlert("Sale processed: " + sale_ref, "success");
    navigateTo('SaleDetails', { sale_id: sale_id });
    return sale_ref;
  }
}