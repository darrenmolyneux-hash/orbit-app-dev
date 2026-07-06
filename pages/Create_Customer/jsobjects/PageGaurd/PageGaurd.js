appsmith.onReady(function() {
  appsmith.triggerEvent('onCheckAuth');
  render(appsmith.model);
});