export default {
  async init() {
    await GetAssetById.run();
    AssetState.oldStatus = GetAssetById.data[0].status;
  },

  async changeStatus() {
    await UpdateAssetStatus.run();
    await InsertAssetAuditLog.run();
    AssetState.oldStatus = GetAssetById.data[0].status;
    await GetAssetAuditLog.run();
  }
}
