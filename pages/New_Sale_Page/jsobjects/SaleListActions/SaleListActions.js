export default {
  runOnPriceChange: function() {
    const update = Custom2.model.priceUpdate;
    if (!update) return;
    const current = appsmith.store.saleList || [];
    const updated = current.map(function(it, i) {
      return i === update.idx ? { ...it, sell_price: update.value } : it;
    });
    storeValue('saleList', updated);
  },
  runOnRemoveItem: function() {
    const id = Custom2.model.removeId;
    SaleHelpers.removeItem(id);
  },
  runOnPlatformChange: function() {
    storeValue('selectedPlatform', Custom2.model.selectedPlatform);
  },
  runOnProcessOrder: function() {
    if (!appsmith.store.selectedPlatform) {
      showAlert('Select a sale platform before processing', 'warning');
      return;
    }
    ProcessSale.run();
  }
}