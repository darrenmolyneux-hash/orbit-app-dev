export default {
  async init() {
    await qry_collection_get.run();
    await qry_collection_summary.run();
    storeValue('collection_summary', qry_collection_summary.data[0]);
  }
}