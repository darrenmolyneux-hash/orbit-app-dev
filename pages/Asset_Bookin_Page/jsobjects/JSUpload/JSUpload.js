export default {
  bookUploaded: async () => {
    var rows = Custom2.model.upload_rows;
    if (!rows || !rows.length) return;

    await qry_item_types_list.run();
    await qry_makes_list.run();
    await qry_models_list.run();

    const itemTypes = qry_item_types_list.data;

    var bookedRefs = [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];

      // Look up item_type_id from name
      const itemType = itemTypes.find(it => 
        it.item_type_name.toLowerCase() === row.item_type.toLowerCase()
      );
      if (!itemType) {
        showAlert('Unknown item type: ' + row.item_type, 'error');
        continue;
      }

      // Run makes for this item type
      await storeValue('selectedItemType', itemType.item_type_id);
      await qry_makes_list.run();
      const make = qry_makes_list.data.find(m => 
        m.make_name.toLowerCase() === row.make.toLowerCase()
      );
      if (!make) {
        showAlert('Unknown make: ' + row.make + ' for ' + row.item_type, 'error');
        continue;
      }

      // Run models for this make
      await storeValue('selectedMake', make.make_id);
      await qry_models_list.run();
      const model = qry_models_list.data.find(mo => 
        mo.model_name.toLowerCase() === row.model.toLowerCase()
      );
      if (!model) {
        showAlert('Unknown model: ' + row.model + ' for ' + row.make, 'error');
        continue;
      }

      storeValue('pendingItemType', itemType.item_type_id);
      storeValue('pendingMake', make.make_id);
      storeValue('pendingModel', model.model_id);
      storeValue('pendingSerial', row.serial);
      storeValue('pendingDataBearing', itemType.is_data_bearing);

      await qry_next_asset_ref.run();
      var ref = qry_next_asset_ref.data[0].asset_ref;
      bookedRefs.push(ref);
      await qry_upload_asset_insert.run();
    }

    storeValue('bookedRefs', bookedRefs);
    showAlert('Booked ' + bookedRefs.length + ' assets successfully', 'success');
    await new Promise(resolve => setTimeout(resolve, 500));
    qry_booked_assets.run();
  }
}