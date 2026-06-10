export default {
  addMultipleAssets: async () => {
    const qty = Number(QtyInput.text || 1);

    await GetCollectionCode.run();

    const codeData = GetCollectionCode.data;

    if (!codeData || codeData.length === 0) {
      showAlert("No collection code found for this booking", "error");
      return;
    }

    const collectionCode = codeData[0].collection_code;

    for (let i = 0; i < qty; i++) {
      const insertResult = await insertAsset.run();
      const newAssetId = insertResult[0].asset_id;

      const globalNumber = (await GetGlobalAssetNumber.run())[0].global_number;

      const padded = String(globalNumber).padStart(5, "0");
      const assetRef = `${collectionCode}-${padded}`;

      await UpdateAssetRef.run({
        asset_ref: assetRef,
        asset_id: newAssetId
      });
    }

    await getAssetsQuery.run();

    // Clear text inputs
    await SerialInput.setValue("");
    await AssetTagInput.setValue("");
    await QtyInput.setValue("");

    // Reset dropdowns
    resetWidget("ItemTypeDropdown", true);
    resetWidget("MakeInput", true);
    resetWidget("ModelInput", true);

    await getAssetsQuery.run();

    showAlert(qty + " asset(s) added", "success");
  }
}