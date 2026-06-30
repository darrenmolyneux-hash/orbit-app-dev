input.onchange = function() {
  const idx = Number(input.dataset.idx);
  appsmith.updateModel({ priceUpdate: { idx: idx, value: Number(input.value) } });
  appsmith.triggerEvent('onPriceChange');
};