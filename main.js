const endpoint = 'https://free.currencyconverterapi.com/api/v5/';

let exchangeRate;

const currencyConverting = document.querySelector('select#currency-converting');
const currencyConverted = document.querySelector('select#currency-converted');
const inputField = document.querySelector('input#amount');
const displayField = document.querySelector('#converted-amount');

const initialCurrenciesIndex = {
    USD: 141,
    GBP: 46
}

const sortFunction = (a, b) => {
    const nameA = a.id.toUpperCase(); // ignore upper and lowercase
    const nameB = b.id.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
        return -1;
    }
    if (nameA > nameB) {
        return 1;
    }
    // names must be equal
    return 0;
};

const generateCurrenciesArray = (currencies) => Object.keys(currencies.results)
    .map(key => currencies.results[key])
    .sort(sortFunction);

const generateCurrencyOption = ({ currencyName, currencySymbol, id }) => `<option value="${id}" data-symbol="${currencySymbol}">${id} - ${currencyName}</option>`;

const initializeDropdowns = (options) => {
    currencyConverting.innerHTML = options;
    currencyConverted.innerHTML = options;
    currencyConverting.selectedIndex = initialCurrenciesIndex.USD;
    currencyConverted.selectedIndex = initialCurrenciesIndex.GBP;
}

const generateCurrencyOptionsHtml = (currencies) => currencies.reduce((generatedHtml, currency) => {
    return `${generatedHtml} ${generateCurrencyOption(currency)} `;
}, '');

const getCurrencyConversionString = () => `${currencyConverting.value}_${currencyConverted.value}`;


const onPageLoad = () => {

    fetch(`${endpoint}currencies`)
        .then(res => res.json())
        .then(res => {
            const currenciesArray = generateCurrenciesArray(res);
            saveCurrenciesArrayToIdb(currenciesArray);
            return currenciesArray;
        })
        .then(res => generateCurrencyOptionsHtml(res))
        .then(initializeDropdowns)
        .catch(err => {
            getCurrenciesFromIdb('allCurrencies')
                .then(res => {
                    if (typeof res === 'undefined') return;
                    return generateCurrencyOptionsHtml(res);
                })
                .then(initializeDropdowns)
        });

}

const convert = () => {
    let amount = parseInt(inputField.value);
    const val = amount * exchangeRate;
    updateDisplayField(val);
    console.log('converting');
}

const  updateDisplayField = (val) => {
    if (val.toString() === 'NaN') {
        displayField.classList.add('d-none');
        return;
    }
    let currencySymbol = currencyConverted.selectedOptions[0].dataset.symbol;
    if (currencySymbol === 'undefined') currencySymbol = currencyConverted.selectedOptions[0].value;
    const convertedAmount = val.toFixed(2) == 0 ? val.toFixed(5) : val.toFixed(2);
    displayField.innerHTML = currencySymbol + convertedAmount;
    displayField.classList.remove('d-none');
}



const updateExchangeRate = () => {
    const currencyConversionString = getCurrencyConversionString();
    fetch(`${endpoint}convert?q=${currencyConversionString}&compact=y`)
        .then(res => res.json())
        .then(res => {
            exchangeRate = res[currencyConversionString].val
            addCurrencyConversionRateToIdb(currencyConversionString, exchangeRate);
            convert()
        })
        .catch(err => {
            console.log('Update exch rate - ', err)
            getCurrenciesFromIdb(currencyConversionString)
                .then(val => {
                    if (typeof val === 'undefined') return updateDisplayField(NaN);
                    exchangeRate = val;
                    return convert();
                });
        });

    console.log('updating exchange rate', currencyConversionString);
}


inputField.addEventListener('keyup', updateExchangeRate);
currencyConverting.addEventListener('change', updateExchangeRate);
currencyConverted.addEventListener('change', updateExchangeRate);

document.onreadystatechange = () => {
    const currencyConversionString = 'USD_GBP';
    if (document.readyState = 'complete') {
        onPageLoad();
        fetch(`${endpoint}convert?q=${currencyConversionString}&compact=y`)
            .then(res => res.json())
            .then(res => exchangeRate = res[currencyConversionString].val)
            .catch(err => {
                console.log("oops, couldn't load exchange rate, Defaulting to idb", err);
            });

    }
} 