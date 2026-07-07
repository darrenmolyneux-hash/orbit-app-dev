export default {
  bookUploaded: async () => {
    var rows = Custom2Copy1.model.upload_rows;
    if (!rows || !rows.length) return;
    await qry_item_types_list.run();
    const itemTypes = qry_item_types_list.data;
    var bookedRows = [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var needsReview = false;

      const itemType = itemTypes.find(it =>
        it.item_type_name.toLowerCase() === row.item_type.toLowerCase()
      );
      var itemTypeId = itemType ? itemType.item_type_id : null;
      var isDataBearing = itemType ? itemType.is_data_bearing : false;
      if (!itemType) needsReview = true;

      var makeId = null;
      if (itemType) {
        await qry_makes_list.run({ itemTypeId: itemType.item_type_id });
        const make = qry_makes_list.data.find(m =>
          m.make_name.toLowerCase() === row.make.toLowerCase()
        );
        makeId = make ? make.make_id : null;
        if (!make) needsReview = true;
      } else {
        needsReview = true;
      }

      var modelId = null;
      if (makeId) {
        await qry_models_list.run({ makeId: makeId });
        const model = qry_models_list.data.find(mo =>
          mo.model_name.toLowerCase() === row.model.toLowerCase()
        );
        modelId = model ? model.model_id : null;
        if (!model) needsReview = true;
      } else {
        needsReview = true;
      }

      await qry_next_asset_ref.run();
      var ref = qry_next_asset_ref.data[0].asset_ref;
      await qry_upload_asset_insert.run({
        itemTypeId: itemTypeId,
        makeId: makeId,
        modelId: modelId,
        serial: row.serial,
        assetRef: ref,
        dataBearing: isDataBearing,
        needsReview: needsReview
      });
      bookedRows.push({
        serial: row.serial,
        asset_ref: ref,
        needs_review: needsReview
      });
    }
    await storeValue('bookedRows', bookedRows);
    var flaggedCount = bookedRows.filter(function(r) { return r.needs_review; }).length;
    showAlert(
      'Booked ' + bookedRows.length + ' assets' +
      (flaggedCount ? ' — ' + flaggedCount + ' flagged for review' : ''),
      flaggedCount ? 'warning' : 'success'
    );
    await new Promise(resolve => setTimeout(resolve, 500));
    await qry_booked_assets.run();
    closeModal('Modal_BulkUpload');
  }
}