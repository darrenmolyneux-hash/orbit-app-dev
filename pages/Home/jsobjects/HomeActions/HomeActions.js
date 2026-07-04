export default {
  onSearchAssetRef: async () => {
    try {
      await qry_home_search_asset_ref.run({ query: HomeWidget.model.searchQuery + '%' });
      const asset = qry_home_search_asset_ref.data && qry_home_search_asset_ref.data[0];
      if (!asset) {
        await storeValue('searchErrorMessage', 'No asset found for that reference.');
        return;
      }
      await storeValue('searchErrorMessage', '');
      await LogSearch.run({ searchType: 'asset_ref', searchValue: HomeWidget.model.searchQuery });
      navigateTo('Asset_Page', { asset_id: asset.asset_id }, 'SAME_WINDOW');
    } catch (err) {
      await storeValue('searchErrorMessage', 'Search failed: ' + err.message);
    }
  },
  onSearchSerial: async () => {
    try {
      await qry_home_search_serial.run({ query: HomeWidget.model.searchQuery + '%' });
      const asset = qry_home_search_serial.data && qry_home_search_serial.data[0];
      if (!asset) {
        await storeValue('searchErrorMessage', 'No asset found for that serial number.');
        return;
      }
      await storeValue('searchErrorMessage', '');
      await LogSearch.run({ searchType: 'serial', searchValue: HomeWidget.model.searchQuery });
      navigateTo('Asset_Page', { asset_id: asset.asset_id }, 'SAME_WINDOW');
    } catch (err) {
      await storeValue('searchErrorMessage', 'Search failed: ' + err.message);
    }
  },
  onSearchCollection: async () => {
    try {
      await qry_home_search_collection.run({ query: HomeWidget.model.searchQuery });
      const collection = qry_home_search_collection.data && qry_home_search_collection.data[0];
      if (!collection) {
        await storeValue('searchErrorMessage', 'No collection found with that ID.');
        return;
      }
      await storeValue('searchErrorMessage', '');
      await LogSearch.run({ searchType: 'collection', searchValue: HomeWidget.model.searchQuery });
      navigateTo('Collection_Page', { collection_id: collection.collection_id }, 'SAME_WINDOW');
    } catch (err) {
      await storeValue('searchErrorMessage', 'Search failed: ' + err.message);
    }
  },
  onLoadMyActivity: async () => {
    let attempts = 0;
    while (!appsmith.store.userEmail && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      attempts++;
    }
    if (!appsmith.store.userEmail) return;
    await qry_home_my_activity.run({ userEmail: appsmith.store.userEmail });
  },
  onLoadRecentSearches: async () => {
    let attempts = 0;
    while (!appsmith.store.userEmail && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      attempts++;
    }
    if (!appsmith.store.userEmail) return;
    await qry_home_recent_searches.run({ userEmail: appsmith.store.userEmail });
  },
  onRerunRecentSearch: async (searchType, searchValue) => {
    await storeValue('searchQuery', searchValue);
    if (searchType === 'asset_ref') await HomeActions.onSearchAssetRef.run();
    if (searchType === 'serial') await HomeActions.onSearchSerial.run();
    if (searchType === 'collection') await HomeActions.onSearchCollection.run();
  },
  onGoCreateCustomer: () => {
    navigateTo('Create_Customer', {}, 'SAME_WINDOW');
  },
  onGoCreateJob: () => {
    navigateTo('Collection_Page', {}, 'SAME_WINDOW');
  },
  onGoNewSale: () => {
    navigateTo('New_Sale_Page', {}, 'SAME_WINDOW');
  },
  onSignOut: async () => {
    await storeValue('userEmail', '');
    await storeValue('userName', '');
    await storeValue('userRole', '');
    await storeValue('userId', '');
    await storeValue('userLastLogin', '');
    navigateTo('Login_Page', {}, 'SAME_WINDOW');
  }
}