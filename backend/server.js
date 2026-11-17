const express = require('express');
const axios = require('axios');

const app = express();

//test af serveren
app.get("/", (req, res) => {
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

app.listen(3000, () => {
    console.log("Serveren kører på port 3000");
});

