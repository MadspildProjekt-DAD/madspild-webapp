const express = require('express');
const axios = require('axios');

const app = express();

//test af serveren
app.get("/", (req, res) => {
    res.send("serveren virker!!");
});

//hent produktdata fra openfoodfacts API
app.get("/data", async (req, res) => {
    try{
        const response = await axios.get(
            "https://world.openfoodfacts.org/api/v0/product/7622210449283.json",
            {
                headers: {
                    "User-Agent": "Halla"
                }
            }
        );
        res.json({
            navn: response.data.product.product_name,
            mærke: response.data.product.brands,
            ingredienser: response.data.product.ingredients_text,
            billede: response.data.product.image_url
        });
    } catch (error) {
        console.error("Fejl:",error.message);
        res.status(500).json({
            fejl: error.message
        })
    }
});

app.listen(3000, () => {
    console.log("Serveren kører på port 3000");
});

