export default {
  logChange: (field, oldVal, newVal) => {
    return InsertAssetAuditLog.run({
      fieldName: field,
      oldValue: oldVal,
      newValue: newVal
    });
  }
}
