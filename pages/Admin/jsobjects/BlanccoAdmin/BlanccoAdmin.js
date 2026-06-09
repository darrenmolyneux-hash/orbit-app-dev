export default {
  async syncAllAssets() {
    await GetAssetsForBlancco.run();

    const assets = GetAssetsForBlancco.data || [];
    let updated = 0;

    for (const asset of assets) {
      if (!asset.serialnumber) continue;

      await BlanccoSearch.run({
        serialnumber: asset.serialnumber
      });

      await UpdateAssetFromBlancco.run({
        serialnumber: asset.serialnumber
      });

      updated++;
    }

    showAlert(`Blancco sync complete. Updated ${updated} assets.`, "success");
  }
}