export default {
  init: async function() {
    await qry_item_types_list.run();
    await qry_makes_list.run();
    return true;
  }
}