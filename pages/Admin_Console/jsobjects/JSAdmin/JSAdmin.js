export default {
  save: async () => {
    const m = Custom_Admin.model;
    const section = m.section;
    const action = m.action;
    try {
      if (section === 'itemTypes') {
        if (action === 'insert') await qry_admin_insert_item_type.run();
        else await qry_admin_update_item_type.run();
        await qry_admin_item_types.run();
      } else if (section === 'makes') {
        if (action === 'insert') await qry_admin_insert_make.run();
        else await qry_admin_update_make.run();
        await qry_admin_makes.run();
      } else if (section === 'models') {
        if (action === 'insert') await qry_admin_insert_model.run();
        else await qry_admin_update_model.run();
        await qry_admin_models.run();
      } else if (section === 'locations') {
        if (action === 'insert') await qry_admin_insert_location.run();
        else await qry_admin_update_location.run();
        await qry_admin_locations.run();
      } else if (section === 'users') {
        if (action === 'insert') {
          const tempPassword = Math.random().toString(36).slice(-4).toUpperCase() + Math.random().toString(36).slice(-4) + '!';
          await qry_admin_insert_user.run({ tempPassword: tempPassword });
          await qry_admin_users.run();
          await storeValue('tempPasswordDisplay', tempPassword);
          return;
        } else {
          await qry_admin_update_user.run();
          await qry_admin_users.run();
        }
      } else if (section === 'saleCustomers') {
        if (action === 'insert') await qry_admin_insert_sale_customer.run();
        else await qry_admin_update_sale_customer.run();
        await qry_admin_sale_customers.run();
      }
      showAlert('Saved ✓', 'success');
    } catch(err) {
      showAlert('Error: ' + err.message, 'error');
    }
  },
	handleTabChange: async () => {
  await Promise.all([
    qry_report_sales_gp.run(),
    qry_report_bestsellers.run(),
    qry_report_stock_value.run()
  ]);
},
  delete: async () => {
    const m = Custom_Admin.model;
    const section = m.section;
    try {
      if (section === 'itemTypes') { await qry_admin_delete_item_type.run(); await qry_admin_item_types.run(); }
      else if (section === 'makes') { await qry_admin_delete_make.run(); await qry_admin_makes.run(); }
      else if (section === 'models') { await qry_admin_delete_model.run(); await qry_admin_models.run(); }
      else if (section === 'locations') { await qry_admin_delete_location.run(); await qry_admin_locations.run(); }
      else if (section === 'users') { await qry_admin_delete_user.run(); await qry_admin_users.run(); }
      else if (section === 'saleCustomers') { await qry_admin_delete_sale_customer.run(); await qry_admin_sale_customers.run(); }
      showAlert('Deleted ✓', 'success');
    } catch(err) {
      showAlert('Error: ' + err.message, 'error');
    }
  },
  onResetPassword: async () => {
    try {
      const tempPassword = Math.random().toString(36).slice(-4).toUpperCase() + Math.random().toString(36).slice(-4) + '!';
      await qry_admin_reset_user_password.run({ tempPassword: tempPassword });
      await storeValue('tempPasswordDisplay', tempPassword);
    } catch (err) {
      showAlert('Error: ' + err.message, 'error');
    }
  },
  onClearTempPassword: async () => {
    await storeValue('tempPasswordDisplay', '');
  }
}