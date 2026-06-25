export default {
  onSavePlatform: async () => {
    const m = PlatformFeesWidget.model;
    if (m.is_edit) {
      await qry_platform_fee_update.run({
        platform_fee_id: m.platform_fee_id,
        platform: m.platform,
        fee_percentage: m.fee_percentage,
        effective_from: new Date().toISOString().split('T')[0],
        active: m.active
      });
    } else {
      await qry_platform_fee_insert.run({
        platform: m.platform,
        fee_percentage: m.fee_percentage
      });
    }
    await qry_platform_fees_get.run();
  },
  onDeletePlatform: async () => {
    const id = PlatformFeesWidget.model.delete_id;
    await qry_platform_fee_update.run({
      platform_fee_id: id,
      platform: '',
      fee_percentage: 0,
      effective_from: new Date().toISOString().split('T')[0],
      active: false
    });
    await qry_platform_fees_get.run();
  }
}