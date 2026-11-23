const express = require('express');
const axios = require('axios');

//js

const session = require('express-session');
const path = require('path');


const app = express();

// ---------- NEW: configuration for login ----------
app.use(express.json());
app.use(session({
    secret: 'madspild-hemmelighed',
    resave: false,
    saveUninitialized: false
}));

// Displays the pages in the frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Test user (hereinafter: database)
const brugere = [
    { brugernavn: 'Cassiopeia', adgangskode: '1234' },
    { brugernavn: 'Gruppe1',   adgangskode: 'AAU2026' },
    { brugernavn: 'Sofie' ,  adgangskode: '5678' }
];
// -----------------------------------------------------

//test af serveren
app.get("/test", (req, res) => {
    res.send("serveren virker!!");
});

app.get("/api/products/:barcode", async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");

    const { barcode } = req.params;
    if (!/^\d{8,14}$/.test(barcode)) {
        return res.status(400).json({ error: "Stregkoden skal bestå af 8-14 cifre." });
    }

    try {
        const response = await axios.get(
            `https://world.openfoodfacts.org/api/v3/product/${encodeURIComponent(barcode)}.json`,
            {
                params: { fields: "product_name,brands" },
                headers: {
                    "User-Agent": "MadspildWebApp/1.0"
                }
            }
        );

        const product = response.data.product;
        if (response.data.status !== "success" || !product?.product_name) {
            return res.status(404).json({ error: "Varen blev ikke fundet." });
        }

        return res.json({
            productName: product.product_name,
            brands: product.brands || ""
        });
    } catch (error) {
        console.error("Open Food Facts-opslag fejlede:", error.message);
        return res.status(502).json({ error: "Open Food Facts kunne ikke kontaktes." });
    }
});

// ---------- NUEVO: Log ind / Log ud ----------
app.post("/api/login", (req, res) => {
    const { brugernavn, adgangskode } = req.body;
    const bruger = brugere.find(
        b => b.brugernavn === brugernavn && b.adgangskode === adgangskode
    );
    if (!bruger) {
        return res.status(401).json({ fejl: "Forkert brugernavn eller adgangskode" });
    }
    req.session.bruger = bruger.brugernavn;
    res.json({ bruger: bruger.brugernavn });
});

app.post("/api/logout", (req, res) => {
    req.session.destroy(() => res.json({ ok: true }));
});

app.get("/api/me", (req, res) => {
    res.json({ bruger: req.session.bruger || null });
});
// --------------------------------------------

app.listen(3000, () => {
    console.log("Serveren kører på port 3000");
});

