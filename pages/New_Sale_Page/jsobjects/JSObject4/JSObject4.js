export default {
  runOnAddToSale: function() {
    SaleHelpers.addItem(AssetSearchWidget.model.assetToAdd);
  }
}