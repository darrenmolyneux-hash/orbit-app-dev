export default {
  onViewCustomer: () => {
    const id = Custom2.model.customerId;
    navigateTo('Customer_Detail_Page', { customer_id: id }, 'SAME_WINDOW');
  }
}