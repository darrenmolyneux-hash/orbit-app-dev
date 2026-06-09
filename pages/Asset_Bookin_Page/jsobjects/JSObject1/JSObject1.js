export default {
	addedAssets: [],
	currentItem: {},

	// OLD REF GENERATOR (kept in case you still want it)
	makeRef(base, idx) {
		const t = Date.now().toString(36);
		const r = Math.random().toString(36).slice(2,8);
		const safeBase = (base || 'ASSET').toString().replace(/\s+/g,'').toUpperCase();
		return `${safeBase}-${t}-${idx}-${r}`;
	},

	generateGroupCode(collectionId) {
		// Guarantee a valid input
		const id = collectionId ?? "0";

		// Convert to string safely
		const str = id.toString();

		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = (hash * 31 + str.charCodeAt(i)) % 1000;
		}

		// Always return a valid 3‑digit code
		return hash.toString().padStart(3, '0');
	}

	// NEW: Build final asset ID (prefix + 4‑digit sequence)
	makeAssetID(prefix, maxSeq) {
		const next = (maxSeq + 1).toString().padStart(4, '0');
		return `${prefix}-${next}`;
	},

		// UPDATED: Add asset(s) to buffer with new unique ID system
		async addToBuffer() {
			const collectionId = appsmith.URL.queryParams.collection;

			// 1. Generate 3‑digit group code
			const prefix = this.generateGroupCode(collectionId);

			// 2. Get highest sequence for this group
			const maxSeq = Get_Max_AssetSeq.data[0].maxseq;

			// 3. Read widget values
			const itemType = ItemTypeDropdown?.selectedOptionLabel || ItemTypeDropdown?.selectedValue || '';
			const make = MakeDropdown?.selectedOptionLabel || MakeDropdown?.selectedValue || '';
			const model = ModelInput?.text || ModelInput?.value || '';
			const assetTag = AssetTagInput?.text || AssetTagInput?.value || '';
			const serialNo = SerialInput?.text || SerialInput?.value || '';
			const kg = Number(KgInput?.text || KgInput?.value || 0);
			const qty = Math.max(1, parseInt(QtyInput?.text || QtyInput?.value || '1', 10));

			if (!itemType) {
				showAlert('Please select Item Type', 'warning');
				return;
			}

			const newItems = [];
			let seq = maxSeq;

			// 4. Generate unique IDs for each quantity
			for (let i = 0; i < qty; i++) {
				seq++;
				const assetID = this.makeAssetID(prefix, seq);

				newItems.push({
					itemType,
					make,
					model,
					assetTag,
					serialNo,
					kg,
					qty: 1,
					asset_id: assetID,
					group_code: prefix,
					collection_id: collectionId
				});
			}

			// 5. Add to buffer
			this.addedAssets = [...this.addedAssets, ...newItems];

			// 6. Clear inputs
			try { ModelInput.setValue(''); } catch(e){}
			try { AssetTagInput.setValue(''); } catch(e){}
			try { SerialInput.setValue(''); } catch(e){}
			try { KgInput.setValue('0'); } catch(e){}
			try { QtyInput.setValue('1'); } catch(e){}

			return this.addedAssets;
		},

			// SAVE TO DB (unchanged except asset_id now included)
			async saveBufferToDB() {
				if (!this.addedAssets.length) {
					showAlert('No assets to save', 'info');
					return;
				}

				try {
					for (const item of this.addedAssets) {
						this.currentItem = {
							itemType: item.itemType,
							make: item.make,
							model: item.model,
							assetTag: item.assetTag,
							serialNo: item.serialNo,
							kg: item.kg,
							asset_id: item.asset_id,
							group_code: item.group_code,
							collection_id: item.collection_id
						};

						await insertAsset.run();
					}

					showAlert('All assets saved', 'success');

					try { getAssets.run(); } catch(e){}

					this.addedAssets = [];
					return true;

				} catch (err) {
					showAlert('Error saving assets: ' + (err.message || err), 'error');
					return false;
				}
			},

				// Bulk insert helper (optional)
				buildBulkValues() {
					if (!this.addedAssets.length) return '';
					return this.addedAssets.map(a => {
						const it = (a.itemType || '').replace(/'/g, "''");
						const mk = (a.make || '').replace(/'/g, "''");
						const md = (a.model || '').replace(/'/g, "''");
						const at = (a.assetTag || '').replace(/'/g, "''");
						const sn = (a.serialNo || '').replace(/'/g, "''");
						const kg = Number(a.kg || 0);
						const id = (a.asset_id || '').replace(/'/g, "''");
						const gc = (a.group_code || '').replace(/'/g, "''");
						const cid = (a.collection_id || '').replace(/'/g, "''");

						return `('${it}','${mk}','${md}','${at}','${sn}',${kg},'${id}','${gc}','${cid}')`;
					}).join(',');
				}
}
