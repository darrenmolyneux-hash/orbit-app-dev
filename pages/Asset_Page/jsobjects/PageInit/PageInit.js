export default {
  async init() {
    const res = await qry_GetAssetById.run();
    if (res && Array.isArray(res) && res.length > 0) {
      AssetState.oldStatus = res[0].status_id;
    } else {
      AssetState.oldStatus = null;
    }
    await qry_pre_inventory_summary.run();
  }
}