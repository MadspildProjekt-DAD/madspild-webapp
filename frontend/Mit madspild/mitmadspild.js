const WASTE_STORAGE_KEY = "madspild-log";
const foodWaste = JSON.parse(localStorage.getItem(WASTE_STORAGE_KEY)) || [];
console.log(foodWaste);