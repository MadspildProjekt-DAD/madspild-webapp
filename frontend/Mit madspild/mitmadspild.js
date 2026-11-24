const WASTE_STORAGE_KEY = "madspild-log";
const foodWaste = JSON.parse(localStorage.getItem(WASTE_STORAGE_KEY)) || [];
const moneyLostText = document.querySelector("#money-lost");

function getPrice(barcode) {
    const product = produktDatabase[barcode];
    return product ? product.pris : 0;
} // dobbelttjek at den kalder på stregkode fra log.//

let totalMoneyLost = 0;
foodWaste.forEach((entry) => {
    const price = getPrice(entry.barcode);
    totalMoneyLost += price * entry.amount / 100;
});

moneyLostText.textContent = totalMoneyLost.toLocaleString("da-DK", {
    style: "currency", 
    currency: "DKK",
    });



