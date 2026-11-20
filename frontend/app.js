const addProductDialog = document.querySelector("#add-product-dialog");
const addProductForm = document.querySelector("#add-product-form");
const barcodeInput = document.querySelector("#barcode");
const productNameInput = document.querySelector("#product-name");
const expiryDateInput = document.querySelector("#product-expiry");
const lookupButton = document.querySelector("#lookup-product");
const scannerButton = document.querySelector("#scan-barcode");
const barcodeVideo = document.querySelector("#barcode-video");
const lookupStatus = document.querySelector("#product-lookup-status");
const backendUrl = "http://localhost:3000";
const productLists = {
    fridge: document.querySelector("#fridge-products"),
    freezer: document.querySelector("#freezer-products"),
    pantry: document.querySelector("#pantry-products"),
};
let scannerControls;
let scannerActive = false;

function getDaysUntilExpiry(expiryDate) {
    const [year, month, day] = expiryDate.split("-").map(Number);
    const expiry = Date.UTC(year, month - 1, day);
    const now = new Date();
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

    return Math.round((expiry - today) / 86400000);
}

function stopBarcodeScanner() {
    scannerActive = false;
    if (scannerControls) {
        scannerControls.stop();
        scannerControls = undefined;
    }

    barcodeVideo.pause();
    barcodeVideo.srcObject = null;
    barcodeVideo.hidden = true;
    scannerButton.disabled = false;
    scannerButton.textContent = "Scan med kamera";
}

async function lookupProduct() {
    const barcode = barcodeInput.value.trim();

    if (!/^\d{8,14}$/.test(barcode)) {
        lookupStatus.textContent = "Indtast en stregkode med 8-14 cifre.";
        barcodeInput.focus();
        return;
    }

    lookupButton.disabled = true;
    lookupStatus.textContent = "Søger efter varen...";

    try {
        const response = await fetch(
            `${backendUrl}/api/products/${encodeURIComponent(barcode)}`
        );
        const data = await response.json();

        if (response.status === 404) {
            lookupStatus.textContent = "Varen blev ikke fundet. Du kan skrive navnet manuelt.";
            return;
        }

        if (!response.ok) {
            throw new Error(data.error || `Serveren svarede med status ${response.status}.`);
        }

        productNameInput.value = data.productName;
        lookupStatus.textContent = data.brands
            ? `Fundet: ${data.productName} (${data.brands})`
            : `Fundet: ${data.productName}`;
    } catch (error) {
        console.error("Kunne ikke slå varen op via backend.", error);
        lookupStatus.textContent = "Opslaget fejlede. Tjek, at backend-serveren kører, eller skriv varenavnet manuelt.";
    } finally {
        lookupButton.disabled = false;
    }
}
async function startBarcodeScanner() {
    if (!navigator.mediaDevices?.getUserMedia) {
        lookupStatus.textContent = "Browseren giver ikke adgang til kameraet. Åbn siden via localhost eller HTTPS, eller indtast stregkoden manuelt.";
        return;
    }

    if (!window.ZXingBrowser?.BrowserMultiFormatReader) {
        lookupStatus.textContent = "Scanneren kunne ikke indlæses. Tjek internetforbindelsen, eller indtast stregkoden manuelt.";
        return;
    }

    scannerActive = true;
    scannerButton.disabled = true;
    barcodeVideo.hidden = false;
    lookupStatus.textContent = "Starter kameraet...";

    try {
        const codeReader = new window.ZXingBrowser.BrowserMultiFormatReader();
        const controls = await codeReader.decodeFromConstraints(
            {
                video: { facingMode: { ideal: "environment" } },
                audio: false,
            },
            barcodeVideo,
            (result, error, activeControls) => {
                if (activeControls && scannerActive) {
                    scannerControls = activeControls;
                }

                if (!result || !scannerActive) {
                    return;
                }

                barcodeInput.value = result.getText();
                stopBarcodeScanner();
                lookupProduct();
            }
        );

        if (scannerActive) {
            scannerControls = controls;
            scannerButton.disabled = false;
            scannerButton.textContent = "Stop scanning";
            lookupStatus.textContent = "Hold stregkoden foran kameraet.";
        } else {
            controls.stop();
        }
    } catch (error) {
        console.error("Kunne ikke starte kameraet.", error);
        stopBarcodeScanner();
        lookupStatus.textContent = "Kameraet kunne ikke startes. Giv browseren kameratilladelse, eller indtast stregkoden manuelt.";
    }
}

lookupButton.addEventListener("click", lookupProduct);
barcodeInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        lookupProduct();
    }
});
scannerButton.addEventListener("click", () => {
    if (scannerActive) {
        stopBarcodeScanner();
        lookupStatus.textContent = "Scanning stoppet.";
        return;
    }

    startBarcodeScanner();
});
addProductDialog.addEventListener("close", stopBarcodeScanner);

document.querySelectorAll(".add-product").forEach((button) => {
    button.addEventListener("click", () => {
        addProductForm.reset();
        lookupStatus.textContent = "";
        stopBarcodeScanner();
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
    row.insertCell().textContent = productNameInput.value.trim();
    for (let cellIndex = 1; cellIndex < 6; cellIndex += 1) {
        row.insertCell();
    }

    // "Åbnet" knap funktion (celle 2)
    const openedCheckbox = document.createElement("input");
    openedCheckbox.type = "checkbox";
    row.cells[2].appendChild(openedCheckbox);

    openedCheckbox.addEventListener("change", () => {
        row.dataset.opened = openedCheckbox.checked;
        console.log("Åbnet:", row.dataset.opened);
    });

    // "Spist" knap funktion (celle 3)
    const eatenCheckbox = document.createElement("input");
    eatenCheckbox.type = "checkbox";
    row.cells[3].appendChild(eatenCheckbox);

    eatenCheckbox.addEventListener("change", () => {
        row.dataset.eaten = eatenCheckbox.checked;
        console.log("Spist:", row.dataset.eaten);
    });

    // "Smidt Ud" knap funktion (celle 4)
    const thrownOutCheckbox = document.createElement("input");
thrownOutCheckbox.type = "checkbox";
row.cells[4].appendChild(thrownOutCheckbox);

thrownOutCheckbox.addEventListener("change", () => {
    row.dataset.thrownOut = thrownOutCheckbox.checked;
});

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


js
// ---------- New: Log ind / Log ud ----------
const authKnap = document.getElementById('auth-knap');

if (authKnap) { //It only runs on pages that have the button
  const velkomst = document.getElementById('velkomst');
  const loginBoks = document.getElementById('login-boks');
  const loginSend = document.getElementById('login-send');
  const loginFejl = document.getElementById('login-fejl');
  let loggetInd = false;

  // Change the button depending on whether or not there is a user.
  function opdaterKnap(bruger) {
    loggetInd = !!bruger;
    authKnap.textContent = loggetInd ? 'Log ud' : 'Log ind';
    velkomst.textContent = loggetInd ? 'Hej, ' + bruger : '';
    loginBoks.hidden = true;
  }

  //Upon opening the page: ask the server whether a session exists
  fetch('/api/me')
    .then(svar => svar.json())
    .then(data => opdaterKnap(data.bruger));

  // Clic in the button at the top
  authKnap.addEventListener('click', async () => {
    if (loggetInd) {
      await fetch('/api/logout', { method: 'POST' });
      opdaterKnap(null);
    } else {
      loginBoks.hidden = !loginBoks.hidden; // muestra/oculta el formulario
    }
  });

  // Clic in "Log ind" 
  loginSend.addEventListener('click', async () => {
    const svar = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brugernavn: document.getElementById('brugernavn').value,
        adgangskode: document.getElementById('adgangskode').value
      })
    });
    const data = await svar.json();
    if (svar.ok) {
      loginFejl.textContent = '';
      opdaterKnap(data.bruger);
    } else {
      loginFejl.textContent = data.fejl;
    }
  });
}
// ---------- END NEW ------