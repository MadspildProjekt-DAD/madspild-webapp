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

const reasonLabels = {
    "too-old": "Overskredet udløbsdato",
    "dont-like": "Kunne ikke lide maden",
    "spoiled": "Maden blev dårlig",
    "other": "Anden årsag",
};

const reasonCounts = {
    "too-old": 0,
    "dont-like": 0,
    "spoiled": 0,
    "other": 0
};

foodWaste.forEach((entry) => {
    if (entry.reason in reasonCounts) {
        reasonCounts[entry.reason] += 1;
    }
});

const chartCanvas = document.querySelector("#waste-chart");

new Chart(chartCanvas, {
    type: "pie",
    data: {
        labels: Object.values(reasonLabels),
        datasets: [{
            data: Object.values(reasonCounts),
            borderWidth: 2,
            borderColor: "rgb(180, 203, 166)",
            backgroundColor: [
                "rgb(184, 45, 78)",
                "rgb(53, 127, 177)",
                "rgb(162, 129, 45)",
                "rgb(88, 94, 48)"
                ]
        }],

    },
    options: {
        aspectRatio: 1.9,
        plugins: {
            legend: {
                position: "right",
                maxWidth: 300,
                labels: {
                    font: { size: 15 }, color: "rgb(0,0,0)" },
                },
            },
        },
});

