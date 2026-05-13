const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const role = require("../middleware/role");

const {
    createProduct,
    getAllProducts,
    getProduct,
    updateStage
} = require("../controllers/productController");


// PUBLIC ROUTES
router.get(
    "/",
    auth,
    getAllProducts
);

router.get("/:id", getProduct);


// PROTECTED ROUTES

router.post(
    "/create",
    auth,
    role("farmer"),
    createProduct
);

router.put(
    "/update-stage",
    auth,
    role(
        "warehouse",
        "retailer",
        "distributor"
    ),
    updateStage
);

module.exports = router;