export default {

async init() {
    storeValue('stock_type_filter', '');
    storeValue('stock_grade_filter', '');
    storeValue('hp_part_type_id', '');
    storeValue('hp_condition_grade', '');
    storeValue('hp_spec', '');
    storeValue('hp_serial', '');
    storeValue('hp_removed_by', '');
    storeValue('hp_notes', '');
    storeValue('harvest_step', 0);
    storeValue('harvest_signed', false);
    storeValue('hp_is_battery', false);
    storeValue('hp_signature', '');
    this.initPreInventory();
    await qry_get_part_types.run();
    storeValue('partTypesData', qry_get_part_types.data);
    storeValue('partTypesTimestamp', Date.now());
    await qry_get_asset_parts.run();
    await qry_get_parts_stock.run();
    await qry_get_locations.run();
  },

  initPreInventory() {
    storeValue('pi_part_type_id', null);
    storeValue('pi_make',         '');
    storeValue('pi_model',        '');
    storeValue('pi_condition',    '');
    storeValue('pi_is_battery',   false);
    storeValue('pi_salvageable',  true);
    storeValue('pi_notes',        '');
    storeValue('pi_new_part_id',  null);
    storeValue('pi_saved',        false);
  },

  start(row) {
    this.signed = false;
    storeValue('hp_serial',           row.serial_number || '');
    storeValue('hp_spec',             row.spec || '');
    storeValue('hp_part_make',        row.part_make || '');
    storeValue('hp_part_model',       row.part_model || '');
    storeValue('hp_part_type_id',     row.part_type_id || '');
    storeValue('hp_is_battery',       row.is_battery || false);
    storeValue('hp_battery_chem',     row.battery_chemistry || '');
    storeValue('hp_battery_wh',       row.battery_wh || null);
    storeValue('hp_condition_grade',  '');
    storeValue('hp_removed_by',       appsmith.user.name);
    storeValue('hp_notes',            '');
    storeValue('hp_signature',        '');
    storeValue('hp_dest_type',        row.is_battery ? 'scrap_weee' : '');
    storeValue('hp_dest_location_id', null);
    storeValue('hp_dest_asset_id',    null);
    storeValue('hp_voltage',          null);
    storeValue('hp_c1', false);
    storeValue('hp_c2', false);
    storeValue('hp_c3', false);
    storeValue('hp_c4', false);
    storeValue('hp_c5', false);
    storeValue('hp_c6', false);
    storeValue('harvest_signed', false);
    storeValue('harvest_step', 2);
  },

  async step2to3() {
    if (!inp_serialConfirm.text || inp_serialConfirm.text.trim() === '') {
      showAlert('Serial number is required before proceeding.', 'error');
      return;
    }
    if (!sel_condition.selectedOptionValue) {
      showAlert('Please select a condition grade.', 'error');
      return;
    }
    if (appsmith.store.hp_is_battery) {
      const allChecked = chk_no_swelling.isChecked
        && chk_no_leakage.isChecked
        && chk_no_physical_damage.isChecked
        && chk_fire_safe.isChecked
        && chk_weee_stream.isChecked;
      if (!allChecked) {
        showAlert('All R2V3 battery checklist items must be completed before proceeding.', 'error');
        return;
      }
      storeValue('hp_c1', chk_no_swelling.isChecked);
      storeValue('hp_c2', chk_no_leakage.isChecked);
      storeValue('hp_c3', chk_no_physical_damage.isChecked);
      storeValue('hp_c4', chk_voltage_measured.isChecked);
      storeValue('hp_c5', chk_fire_safe.isChecked);
      storeValue('hp_c6', chk_weee_stream.isChecked);
      storeValue('hp_voltage', inp_voltage.text ? parseFloat(inp_voltage.text) : null);
    }
    storeValue('hp_serial',          inp_serialConfirm.text.trim());
    storeValue('hp_condition_grade', sel_condition.selectedOptionValue);
    storeValue('hp_notes',           inp_removal_notes.text || '');
    storeValue('hp_removed_by',      appsmith.user.name);
    storeValue('harvest_step', 3);
  },

  step3to4() {
    if (!sel_dest_type.selectedOptionValue) {
      showAlert('Please select a destination type.', 'error');
      return;
    }
    if (!sel_dest_location.selectedOptionValue) {
      showAlert('Please select a destination location.', 'error');
      return;
    }
    storeValue('hp_dest_type',        sel_dest_type.selectedOptionValue);
    storeValue('hp_dest_location_id', sel_dest_location.selectedOptionValue);
    storeValue('harvest_step', 4);
  },

  signOff() {
    const sig = appsmith.user.name + ' | ' + new Date().toISOString();
    storeValue('hp_signature',   sig);
    storeValue('harvest_signed', true);
    this.signed = true;
  },

  async submit() {
    if (!appsmith.store.harvest_signed) {
      showAlert('Please sign off before submitting.', 'error');
      return;
    }
    try {
      await qry_get_next_part_ref.run();
      await qry_insert_harvested_part.run();
      const newPartId = qry_insert_harvested_part.data[0]?.id;
      if (!newPartId) {
        showAlert('Part insert failed — no ID returned.', 'error');
        return;
      }
      storeValue('pal_part_id',         newPartId);
      storeValue('pal_action',          'harvest');
      storeValue('pal_movement_type',   'harvest');
      storeValue('pal_from_asset_id',   appsmith.URL.queryParams.asset_id);
      storeValue('pal_to_asset_id',
        appsmith.store.hp_dest_type === 'asset'
          ? appsmith.store.hp_dest_asset_id
          : null
      );
      storeValue('pal_from_location_id', null);
      storeValue('pal_to_location_id',
        appsmith.store.hp_dest_type !== 'asset'
          ? appsmith.store.hp_dest_location_id
          : null
      );
      await qry_insert_parts_audit_log.run();
      const auditId = qry_insert_parts_audit_log.data[0]?.id;
      if (!auditId) {
        showAlert('Audit log insert failed. Contact your administrator.', 'error');
        return;
      }
      storeValue('pal_new_audit_id', auditId);
      if (appsmith.store.hp_is_battery) {
        await qry_insert_battery_inspection.run();
      }
      storeValue('harvest_step', 5);
      showAlert('Part removed and R2V3 audit record created ✓', 'success');
      await qry_get_asset_parts.run();
    } catch (err) {
      showAlert('Error: ' + err.message, 'error');
      console.log('JSParts.submit error:', err);
    }
  },

  async installPart(row) {
    storeValue('hp_install_id',        row.id);
    storeValue('pal_part_id',          row.id);
    storeValue('pal_action',           'stock_to_asset');
    storeValue('pal_movement_type',    'stock_to_asset');
    storeValue('pal_from_asset_id',    null);
    storeValue('pal_from_location_id', row.current_location_id || null);
    storeValue('pal_to_asset_id',      appsmith.URL.queryParams.asset_id);
    storeValue('pal_to_location_id',   null);
    storeValue('hp_condition_grade',   row.condition_grade);
    storeValue('hp_notes',             'Installed from stock');
    storeValue('hp_signature',
      appsmith.user.name + ' | ' + new Date().toISOString()
    );
    try {
      await qry_install_part.run();
      await qry_insert_parts_audit_log.run();
      showAlert('Part installed and movement logged ✓', 'success');
      await qry_get_asset_parts.run();
      await qry_get_parts_stock.run();
    } catch (err) {
      showAlert('Install failed: ' + err.message, 'error');
      console.log('JSParts.installPart error:', err);
    }
  },

  logRemoval() {
    var data = Custom6.model;
    storeValue('hp_part_type_id',    data.hp_part_type_id);
    storeValue('hp_condition_grade', data.hp_condition_grade);
    storeValue('hp_spec',            data.hp_spec || '');
    storeValue('hp_serial',          data.hp_serial || '');
    storeValue('hp_removed_by',      data.hp_removed_by || '');
    storeValue('hp_notes',           data.hp_notes || '');
    return qry_get_next_part_ref.run().then(() => {
      return qry_insert_harvested_part.run().then(() => {
        return qry_get_asset_parts.run();
      });
    });
  },

  reset() {
    storeValue('harvest_step',   0);
    storeValue('harvest_signed', false);
    storeValue('hp_is_battery',  false);
    storeValue('hp_signature',   '');
    this.signed = false;
  },

  showStep(n) {
    return appsmith.store.harvest_step === n;
  },

  showBattery() {
    return appsmith.store.hp_is_battery === true
      && appsmith.store.harvest_step === 2;
  },

  get disposeByDate() {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toLocaleDateString('en-GB');
  },

  get locationOptions() {
    const type = appsmith.store.hp_dest_type || '';
    const all  = qry_get_locations.data || [];
    return all
      .filter(l => {
        if (type === 'stock') return l.location_type === 'stock';
        if (type === 'asset') return false;
        return ['scrap_weee','scrap_metal','scrap_general'].includes(l.location_type);
      })
      .map(l => ({
        label: l.location_code + ' — ' + l.location_name,
        value: l.location_id
      }));
  },

  get confirmDisabled() {
    return !appsmith.store.harvest_signed;
  },

  get signOffLabel() {
    return appsmith.store.harvest_signed
      ? '✓ Signed: ' + appsmith.user.name
      : 'Sign off as technician';
  },

  async savePreInventory() {
    const parts = CustomPreInventory.model.assessedParts;
    if (!parts || parts.length === 0) {
      showAlert('No parts to save.', 'error');
      return;
    }
    let savedCount = 0;
    let errorCount = 0;
    for (const part of parts) {
      try {
        storeValue('pi_part_type_id', part.part_type_id);
        storeValue('pi_make',         part.make);
        storeValue('pi_model',        part.model);
        storeValue('pi_condition',    part.condition);
        storeValue('pi_is_battery',   part.is_battery);
        storeValue('pi_salvageable',  part.is_salvageable);
        storeValue('pi_notes',        part.notes);
        await qry_get_next_part_ref.run();
        await qry_pre_inventory_insert.run();
        const newId = qry_pre_inventory_insert.data[0]?.id;
        if (newId && !part.is_salvageable) {
          storeValue('pi_new_part_id', newId);
          await qry_pre_inventory_scrap_log.run();
        }
        savedCount++;
      } catch (err) {
        errorCount++;
        console.log('Part save error:', part.part_type_name, err.message);
      }
    }
    if (savedCount > 0) {
      showAlert(savedCount + ' parts logged successfully ✓', 'success');
      await qry_get_asset_parts.run();
    }
    if (errorCount > 0) {
      showAlert(errorCount + ' parts failed to save. Check browser console.', 'error');
    }
  }

}