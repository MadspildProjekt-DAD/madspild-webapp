const addProductDialog = document.querySelector("#add-product-dialog");
const addProductForm = document.querySelector("#add-product-form");
const productLists = {
    fridge: document.querySelector("#fridge-products"),
    freezer: document.querySelector("#freezer-products"),
    pantry: document.querySelector("#pantry-products"),
};

document.querySelectorAll(".add-product").forEach((button) => {
    button.addEventListener("click", () => {
        addProductForm.reset();
        addProductDialog.showModal();
    });
});

addProductForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const storage = new FormData(addProductForm).get("storage");
    const productList = productLists[storage];

    if (!productList) {
        return;
    }

    const row = productList.insertRow();
    for (let cellIndex = 0; cellIndex < 6; cellIndex += 1) {
        row.insertCell();
    }

    addProductDialog.close();
});

document.querySelectorAll(".remove-product").forEach((button) => {
    button.addEventListener("click", () => {
        const productList = button.closest("section").querySelector("tbody");

        if (productList.rows.length > 0) {
            productList.deleteRow(productList.rows.length - 1);
        }
    });
}); 