export default {
  addMultipleAssets: async () => {
    const qty = Number(QtyInput.text);
		await GetCollectionCode.run();


    // SAFETY CHECK: Ensure query returned a row
    const codeData = GetCollectionCode.data;

    if (!codeData || codeData.length === 0) {
      showAlert("No collection code found for this booking", "error");
      return;
    }

    const collectionCode = codeData[0].collection_code;

    for (let i = 0; i < qty; i++) {

      // Insert the asset and get the new asset_id
      const insertResult = await insertAsset.run();
      const newAssetId = insertResult[0].asset_id;

      // Get the next global asset number
      const globalNumber = (await GetGlobalAssetNumber.run())[0].global_number;

      // Build the final asset reference (global counter padded to 5 digits)
      const padded = String(globalNumber).padStart(5, "0");
      const assetRef = `${collectionCode}-${padded}`;

      // Update the asset with the final reference
      await UpdateAssetRef.run({
        asset_ref: assetRef,
        asset_id: newAssetId
      });
    }

    // Refresh table
    await getAssetsQuery.run();

    // Reset fields
    resetWidget("ItemTypeDropdown");
    resetWidget("MakeInput");
    resetWidget("ModelInput");
    resetWidget("SerialInput");
    resetWidget("AssetTagInput");
    resetWidget("KgInput");
    resetWidget("QtyInput");

    showAlert(qty + " asset(s) added", "success");
  }
}
