const WASTE_STORAGE_KEY = "madspild-log";
const foodWaste = JSON.parse(localStorage.getItem(WASTE_STORAGE_KEY)) || [];
const moneyLostText = document.querySelector("#money-lost");

function getPrice(barcode) {
    const product = produktDatabase[barcode];
    return product ? product.pris : 0;
}

function formatKr(number) {
    return number.toLocaleString("da-DK", { style: "currency", currency: "DKK" });
}

let totalMoneyLost = 0;
foodWaste.forEach((entry) => {
    const price = getPrice(entry.barcode);
    totalMoneyLost += price * entry.amount / 100;
});

moneyLostText.textContent = formatKr(totalMoneyLost);

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
            hoverBackgroundColor: [
                "#4cac3e",
                "#fc8d19",
                "#a10d09",
                "#0a305d"
                ],
            hoverBorderColor: ["#ffffff"],
            hoverBorderWidth: 2,
            hoverOffset: 8,
            borderWidth: 2,
            borderColor: "rgb(233, 241, 227)",
            backgroundColor: [
                "#4cac3e",
                "#fc8d19",
                "#a10d09",
                "#0a305d"
                ],
        }],

    },
    options: {
        aspectRatio: 1.7,
        layout: {
            padding: 8,
        },
        plugins: {
            legend: {
                position: "right",
                maxWidth: 300,
                labels: {
                    font: { size: 15 },
                    color: "rgb(0,0,0)"
                },
            },
            tooltip: {
                displayColors: false,
                bodyAlign: "center",
                bodyFont: { size: 12 },
                callbacks: {
                    label: function (context) {
                        const value = context.raw || 0;
                        return `Har ${value} gange ført til madspild`;
                    }
                }
            }
        },
    },
});


const moneyPerReasonList = document.querySelector("#money-per-reason");

const reasonMoney = {
    "too-old": 0,
    "dont-like": 0,
    "spoiled": 0,
    "other": 0,
};

foodWaste.forEach((entry) => {
    if (entry.reason in reasonMoney) {
        reasonMoney[entry.reason] += getPrice(entry.barcode) * entry.amount / 100;
    }
});

Object.keys(reasonMoney).sort((a, b) => reasonMoney[b] - reasonMoney[a]).forEach((reason) => {
    const amount = formatKr(reasonMoney[reason]);

    const listItem = document.createElement("li");
    listItem.textContent = `${reasonLabels[reason]}: ${amount}`;
    moneyPerReasonList.appendChild(listItem);
});