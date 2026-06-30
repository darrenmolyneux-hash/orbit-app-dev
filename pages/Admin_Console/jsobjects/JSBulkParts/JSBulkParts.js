export default {
	onRaiseBulkOrder: async () => {
		try {
			const order = BulkPartsWidget.model.bulkOrder;
			await qry_bulk_raise_order.run({
				partTypeId: order.part_type_id,
				partDescription: order.part_description,
				supplier: order.supplier,
				orderRef: order.order_ref,
				unitCost: order.unit_cost,
				quantity: order.quantity,
				expectedDelivery: order.expected_delivery,
				notes: order.notes,
				locationId: order.location_id
			});
			await qry_bulk_orders_pending.run();
			showAlert('Bulk order raised', 'success');
		} catch(err) {
			showAlert('Failed to raise bulk order: ' + err.message, 'error');
		}
	},

	onReceiveBulkOrder: async () => {
		try {
			const orderId = BulkPartsWidget.model.receivingBulkOrderId;
			const order = qry_bulk_orders_pending.data.find(o => o.order_id === orderId);
			if (!order) {
				showAlert('Order not found', 'error');
				return;
			}
			await qry_bulk_mark_received.run({ orderId: orderId });
			const partTypeId = order.part_type_id;
			const partModel = order.part_description || '';
			const unitCost = order.unit_cost;
			const locationId = order.location_id;
			const qty = order.quantity;
			let created = 0;
			for (let i = 0; i < qty; i++) {
				await qry_create_bulk_stock_unit.run({
					partTypeId: partTypeId,
					partMake: '',
					partModel: partModel,
					unitCost: unitCost,
					locationId: locationId,
					isBattery: false
				});
				created++;
			}
			showAlert(created + ' units added to stock', 'success');
		} catch(err) {
			showAlert('Failed to receive bulk order: ' + err.message, 'error');
		}
	}
}