export default {
  onSaveVendor: async () => {
    const m = VendorsWidget.model;
    storeValue('vendor_name', m.vendor_name);
    storeValue('vendor_permit', m.vendor_permit);
    storeValue('vendor_permit_expiry', m.vendor_permit_expiry);
    storeValue('vendor_review_date', m.vendor_review_date);
    storeValue('vendor_contact_name', m.vendor_contact_name);
    storeValue('vendor_contact_phone', m.vendor_contact_phone);
    storeValue('vendor_contact_email', m.vendor_contact_email);
    storeValue('vendor_address', m.vendor_address);
    storeValue('vendor_notes', m.vendor_notes);
    storeValue('vendor_active', m.vendor_active);
    storeValue('vendor_id', m.vendor_id);
    if (m.is_edit) {
      await qry_update_vendor.run();
    } else {
      await qry_insert_vendor.run();
    }
    await qry_get_vendors.run();
  },
  onDeleteVendor: async () => {
    storeValue('vendor_id', VendorsWidget.model.vendor_id);
    await qry_delete_vendor.run();
    await qry_get_vendors.run();
  }
}