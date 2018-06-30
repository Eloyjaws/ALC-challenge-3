const dbPromise = idb.open('currency-converter-db', 1, (upgradeDb) => {
    const keyValStore = upgradeDb.createObjectStore('currencyMappings');
});


self.addCurrencyConversionRateToIdb = (key, value) =>{

    dbPromise.then((db) => {
        const tx = db.transaction('currencyMappings', 'readwrite');
        const keyValStore = tx.objectStore('currencyMappings');
        keyValStore.put(value, key);
        return tx.complete;
    })
}

self.getCurrenciesFromIdb = (key) => {
    return dbPromise.then((db) => {
        if (!db) return;
        const tx = db.transaction('currencyMappings');
        const keyValStore = tx.objectStore('currencyMappings');
        return keyValStore.get(key);
    })
    .catch(err => console.log('Error getting CurrencyArray from idb'));
}

self.saveCurrenciesArrayToIdb = (currenciesArray) => {
    return dbPromise.then((db) => {
        const tx = db.transaction('currencyMappings', 'readwrite');
        const keyValStore = tx.objectStore('currencyMappings');
        keyValStore.put(currenciesArray, 'allCurrencies')
    }).catch(err => console.log('Error adding currenciesArray to idb'));
}
