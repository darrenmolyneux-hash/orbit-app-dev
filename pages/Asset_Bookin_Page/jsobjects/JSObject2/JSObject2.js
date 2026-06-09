export default {
  async getItemTypes() {
    await Get_ItemTypes.run();
    return Get_ItemTypes.data.map(d => ({ label: d.item_type_name, value: d.item_type_id + "" }));
  },
  async selectItemType(value) {
    await storeValue('selectedItemType', value);
    await Get_Makes.run();
    return Get_Makes.data;
  }
}
