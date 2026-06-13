export default {
  addMultipleAssets: async () => {
    const qty = Number(inp_qty.text || 1);

    await qry_collection_code_get.run();

    const codeData = qry_collection_code_get.data;

    if (!codeData || codeData.length === 0) {
      showAlert("No collection code found for this booking", "error");
      return;
    }

    const collectionCode = codeData[0].collection_code;

    for (let i = 0; i < qty; i++) {
      const insertResult = await insertAsset.run();
      const newAssetId = insertResult[0].asset_id;

      const globalNumber = (await qry_global_asset_number.run())[0].global_number;

      const padded = String(globalNumber).padStart(5, "0");
      const assetRef = `${collectionCode}-${padded}`;

      await qry_asset_ref_update.run({
        asset_ref: assetRef,
        asset_id: newAssetId
      });
    }

    await qry_booked_assets.run();

    // Clear text inputs
    await inp_serial.setValue("");
    await inp_asset_tag.setValue("");
    await inp_qty.setValue("");

    // Reset dropdowns
    resetWidget("ItemTypeDropdown", true);
    resetWidget("MakeInput", true);
    resetWidget("ModelInput", true);

    await qry_booked_assets.run();

    showAlert(qty + " asset(s) added", "success");
  }
}