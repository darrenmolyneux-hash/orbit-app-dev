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
		await qry_get_asset_parts_combined.run();
		await qry_get_parts_stock.run();
		await qry_get_locations.run();
		await qry_get_asset_parts_cost.run();
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

	signed: false,

	start(row) {
		this.signed = false;
		storeValue('hp_serial',           row.serial_number || '');
		storeValue('hp_spec',             row.spec || '');
		storeValue('hp_part_make',        row.part_make || '');
		storeValue('hp_part_model',       row.part_model || '');
		storeValue('hp_part_type_id',     row.part_type_id || '');
		storeValue('hp_part_type',        row.part_type || '');
		storeValue('hp_is_battery',       row.is_battery || false);
		storeValue('hp_battery_chem',     row.battery_chemistry || '');
		storeValue('hp_battery_wh',       row.battery_wh || null);
		storeValue('hp_condition_grade',  '');
		storeValue('hp_removed_by',       appsmith.store.userName);
		storeValue('hp_notes',            '');
		storeValue('hp_signature',        '');
		storeValue('hp_dest_type',        row.is_battery ? 'scrap_weee' : '');
		storeValue('hp_dest_location_id', null);
		storeValue('hp_dest_location_label', '');
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
		const f = RemovePartsWidget.model.formData || {};
		if (!f.serial || f.serial.trim() === '') {
			showAlert('Serial number is required before proceeding.', 'error');
			return;
		}
		if (!f.condition_grade) {
			showAlert('Please select a condition grade.', 'error');
			return;
		}
		if (appsmith.store.hp_is_battery) {
			const allChecked = f.c1 && f.c2 && f.c3 && f.c5 && f.c6;
			if (!allChecked) {
				showAlert('All R2V3 battery checklist items must be completed before proceeding.', 'error');
				return;
			}
			storeValue('hp_c1', !!f.c1);
			storeValue('hp_c2', !!f.c2);
			storeValue('hp_c3', !!f.c3);
			storeValue('hp_c4', !!f.c4);
			storeValue('hp_c5', !!f.c5);
			storeValue('hp_c6', !!f.c6);
			storeValue('hp_voltage', f.voltage ? parseFloat(f.voltage) : null);
		}
		storeValue('hp_serial',          f.serial.trim());
		storeValue('hp_condition_grade', f.condition_grade);
		storeValue('hp_notes',           f.notes || '');
		storeValue('hp_removed_by',      appsmith.user.name);
		await storeValue('harvest_step', 3);
	},

	step3to4() {
		const f = RemovePartsWidget.model.formData || {};
		if (!f.dest_type) {
			showAlert('Please select a destination type.', 'error');
			return;
		}
		if (!f.dest_location) {
			showAlert('Please select a destination location.', 'error');
			return;
		}
		storeValue('hp_dest_type',        f.dest_type);
		storeValue('hp_dest_location_id', f.dest_location);
		storeValue('harvest_step', 4);
	},
	async scrollToWizard() {
		await new Promise(resolve => setTimeout(resolve, 150));
		scrollTo('RemovePartsWidget', 'start');
	},

	onWizardBack() {
		const target = RemovePartsWidget.model.backTo;
		if (target) storeValue('harvest_step', target);
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
			storeValue('pal_part_id', newPartId);
			await qry_link_assessment_to_removal.run();
			storeValue('pal_action',          'harvest');
			storeValue('pal_movement_type',   'harvest');
			storeValue('pal_from_asset_id',   appsmith.URL.queryParams.asset_id);
			storeValue('pal_to_asset_id',     null);
			storeValue('pal_from_location_id', null);
			storeValue('pal_to_location_id',  appsmith.store.hp_dest_location_id);
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
			await qry_pre_inventory_summary.run();
			await qry_get_asset_parts_combined.run();
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
							 appsmith.store.userName + ' | ' + new Date().toISOString()
							);
		try {
			await qry_install_part.run();
			await qry_insert_parts_audit_log.run();
			showAlert('Part installed and movement logged ✓', 'success');
			await qry_get_asset_parts_combined.run();
			await qry_get_parts_stock.run();
		} catch (err) {
			showAlert('Install failed: ' + err.message, 'error');
			console.log('JSParts.installPart error:', err);
		}
	},

	logRemoval() {
		var data = RemovePartsWidget.model.formData || {};
		storeValue('hp_part_type_id',    appsmith.store.hp_part_type_id);
		storeValue('hp_condition_grade', data.condition_grade);
		storeValue('hp_spec',            appsmith.store.hp_spec || '');
		storeValue('hp_serial',          data.serial || '');
		storeValue('hp_removed_by',      appsmith.user.name);
		storeValue('hp_notes',           data.notes || '');
		return qry_get_next_part_ref.run().then(() => {
			return qry_insert_harvested_part.run().then(() => {
				return qry_get_asset_parts_combined.run();
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

	disposeByDate() {
		const d = new Date();
		d.setFullYear(d.getFullYear() + 1);
		return d.toLocaleDateString('en-GB');
	},

	locationOptions() {
		const type = appsmith.store.hp_dest_type || '';
		const all  = qry_get_locations.data || [];
		return all
			.filter(l => {
			if (type === 'stock') return l.location_type === 'stock';
			return ['scrap_weee', 'scrap_general'].includes(l.location_type);
		})
			.map(l => ({
			label: l.location_code + ' — ' + l.location_name,
			value: String(l.location_id)
		}));
	},

	donorLocationOptions() {
		const all = qry_get_locations.data || [];
		return all
			.filter(l => l.location_type === 'stock')
			.map(l => ({
			label: l.location_code + ' — ' + l.location_name,
			value: String(l.location_id)
		}));
	},

	get confirmDisabled() {
		return !appsmith.store.harvest_signed;
	},

	signOffLabel() {
		return appsmith.store.harvest_signed
			? '✓ Signed: ' + appsmith.store.userName
		: 'Sign off as technician';
	},

	async savePreInventory() {
		const parts = qry_get_part_types.data;
		if (!parts || parts.length === 0) {
			showAlert('No parts to save.', 'error');
			return;
		}
		let savedCount = 0;
		let errorCount = 0;
		for (const part of parts) {
			try {
				const isScrap = appsmith.store['scrap_' + part.part_type_id] || false;
				const notes = appsmith.store['notes_' + part.part_type_id] || '';
				storeValue('pi_part_type_id', part.part_type_id);
				storeValue('pi_salvageable',  !isScrap);
				storeValue('pi_notes',        notes);
				await qry_get_next_part_ref.run();
				await qry_pre_inventory_insert.run();
				const newId = qry_pre_inventory_insert.data[0]?.id;
				if (newId && isScrap) {
					storeValue('pi_new_part_id', newId);
					await qry_pre_inventory_scrap_log.run();
				}
				savedCount++;
			} catch (err) {
				errorCount++;
				console.log('Part save error:', part.name, err.message);
			}
		}
		if (errorCount > 0) {
			showAlert(errorCount + ' parts failed to save. Check browser console.', 'error');
			return;
		}
		showAlert(savedCount + ' parts logged successfully ✓', 'success');
		navigateTo('Asset_Page', { asset_id: appsmith.URL.queryParams.asset_id }, 'SAME_WINDOW');
	},

	async confirmAddPart() {
		const row = Table2.triggeredRow;
		const cost = appsmith.store.hp_part_cost || null;

		if (!row || !row.part_type) {
			showAlert('Please select a part first.', 'error');
			return;
		}

		if (row.availability === 'in_stock') {
			storeValue('hp_install_id',        row.harvested_part_id);
			storeValue('pal_part_id',          row.harvested_part_id);
			storeValue('pal_action',           'stock_to_asset');
			storeValue('pal_movement_type',    'stock_to_asset');
			storeValue('pal_from_asset_id',    null);
			storeValue('pal_from_location_id', null);
			storeValue('pal_to_asset_id',      Number(appsmith.URL.queryParams.asset_id));
			storeValue('pal_to_location_id',   null);
			storeValue('hp_condition_grade',   row.condition_grade);
			storeValue('hp_notes',             'Installed from stock');
			storeValue('hp_part_cost',         cost);
			storeValue('hp_signature',
								 appsmith.store.userName + ' | ' + new Date().toISOString()
								);
			try {
				await qry_install_part.run();
				await qry_install_part_pia.run();
				await qry_update_part_cost.run();
				await qry_insert_parts_audit_log.run();
				await qry_get_asset_parts_combined.run();
				await qry_get_asset_parts_cost.run();
				closeModal('ModalAddPart');
				showAlert('Part installed successfully ✓', 'success');
			} catch (err) {
				showAlert('Install failed: ' + err.message, 'error');
			}

		} else {
			storeValue('donor_pia_id',     row.donor_pia_id);
			storeValue('donor_asset_id',   row.donor_asset_id);
			storeValue('donor_part_type',  row.part_type);
			storeValue('donor_make',       row.donor_make);
			storeValue('donor_model',      row.donor_model);
			storeValue('donor_asset_ref',  row.donor_asset_ref);
			storeValue('donor_is_battery', row.is_battery);
			storeValue('add_part_step',    'removal_wizard');
			showAlert('Complete the removal details below to pull this part.', 'info');
		}
	},

onLogScrap: async () => {
  try {
    await qry_log_scrap.run();
    if (!qry_log_scrap.data || qry_log_scrap.data.length === 0) {
      showAlert('This part type has already been removed from this asset.', 'warning');
      return;
    }
    showAlert('Scrapped part logged', 'success');
  } catch(err) {
    showAlert('Failed to log scrap: ' + err.message, 'error');
  }
},

	onRaiseOrder: async () => {
		try {
			await qry_raise_parts_order.run();
			await qry_parts_orders.run();
			showAlert('Parts order raised', 'success');
		} catch(err) {
			showAlert('Failed to raise order: ' + err.message, 'error');
		}
	},

	onMarkReceived: async () => {
		try {
			const orderId = RepairPartsWidget.model.receivingOrderId;
			await qry_mark_order_received.run({ orderId: orderId });
			await qry_fit_ordered_part.run({ orderId: orderId });
			await qry_parts_orders.run();
			showAlert('Part marked as received and fitted', 'success');
		} catch(err) {
			showAlert('Failed to mark received: ' + err.message, 'error');
		}
	},

	onRequestPart: async () => {
		try {
			const assetRef = qry_GetAssetById.data[0] ? qry_GetAssetById.data[0].asset_ref : appsmith.URL.queryParams.asset_id;
			const partDesc = RepairPartsWidget.model.requestedPartDesc;
			const requestedBy = appsmith.store.userName;

			const payload = {
				text: "Part request - Asset " + assetRef + " - Part needed: " + partDesc,
				blocks: [
					{
						type: "header",
						text: { type: "plain_text", text: "🔧 Repair Part Request", emoji: true }
					},
					{
						type: "section",
						fields: [
							{ type: "mrkdwn", text: ":package: *Asset Ref*\n" + assetRef },
							{ type: "mrkdwn", text: ":bust_in_silhouette: *Requested by*\n" + requestedBy }
						]
					},
					{ type: "divider" },
					{
						type: "section",
						text: { type: "mrkdwn", text: ":wrench: *Part needed*\n" + partDesc }
					},
					{
						type: "context",
						elements: [
							{ type: "mrkdwn", text: "Submitted via Orbit • " + new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) }
						]
					}
				],
				attachments: [
					{
						color: "#A3E851",
						blocks: []
					}
				]
			};

			console.log('Payload being sent:', JSON.stringify(payload));
			await Slack_Webhook.run({ slackPayload: payload });
			showAlert('Part request sent to Slack', 'success');
		} catch(err) {
			showAlert('Failed to send request: ' + err.message, 'error');
		}
	},

	async confirmDonorRemoval() {
		if (!appsmith.store.inp_donor_serial) {
			showAlert('Serial number is required.', 'error');
			return;
		}
		if (!appsmith.store.inp_donor_condition) {
			showAlert('Condition grade is required.', 'error');
			return;
		}
		try {
			storeValue('hp_part_type_id',     appsmith.store.donor_pia_id);
			storeValue('hp_serial',           appsmith.store.inp_donor_serial);
			storeValue('hp_condition_grade',  appsmith.store.inp_donor_condition);
			storeValue('hp_notes',            appsmith.store.inp_donor_notes || 'Removed for install on repair asset');
			storeValue('hp_removed_by',       appsmith.store.userName);
			storeValue('hp_dest_type',        'stock');
			storeValue('hp_dest_location_id', appsmith.store.inp_donor_location_id);
			storeValue('hp_signature',        appsmith.store.userName + ' | ' + new Date().toISOString());

			await qry_get_next_part_ref.run();
			await qry_insert_harvested_part_dono.run();
			const newPartId = qry_insert_harvested_part_dono.data[0]?.id;
			if (!newPartId) {
				showAlert('Part removal failed — no ID returned.', 'error');
				return;
			}

			storeValue('hp_install_id', newPartId);
			await qry_link_donor_pia.run();

			storeValue('pal_part_id',          newPartId);
			storeValue('pal_action',           'donor_to_asset');
			storeValue('pal_movement_type',    'stock_to_asset');
			storeValue('pal_from_asset_id',    appsmith.store.donor_asset_id);
			storeValue('pal_from_location_id', null);
			storeValue('pal_to_asset_id',      Number(appsmith.URL.queryParams.asset_id));
			storeValue('pal_to_location_id',   null);
			storeValue('hp_part_cost',         appsmith.store.inp_donor_cost || null);

			await qry_install_part.run();
			await qry_install_part_pia.run();
			await qry_update_part_cost.run();
			await qry_insert_parts_audit_log.run();
			await qry_get_asset_parts_combined.run();
			await qry_get_asset_parts_cost.run();

			storeValue('add_part_step', null);
			closeModal('ModalAddPart');
			showAlert('Part removed from donor and installed successfully ✓', 'success');
		} catch (err) {
			showAlert('Donor removal failed: ' + err.message, 'error');
		}
	}

}