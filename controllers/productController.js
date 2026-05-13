const Product = require("../models/Product");
const QRCode = require("qrcode");
const generateHash = require("../utils/hash");

// ================= CREATE PRODUCT =================
exports.createProduct = async (req, res) => {
    try {
        const {
            productName,
            farmerName,
            origin,
            manufacturingDate,
            expiryDate
        } = req.body;

        const productId = "PROD-" + Date.now();

        // FIRST BLOCK (GENESIS BLOCK)
        const firstBlock = {
            stage: "Farmer Created",
            updatedBy: farmerName,
            location: origin,
            timestamp: new Date(),
            previousHash: "0"
        };

        firstBlock.currentHash = generateHash(firstBlock);

        // QR CODE
        const qrData = `https://krishichain-frontend.vercel.app/product/${productId}`;
        const qrCode = await QRCode.toDataURL(qrData);

        const product = await Product.create({
            productId,
            productName,
            farmerName,
            origin,
            manufacturingDate,
            expiryDate,
            createdBy: req.user.id,
            currentStage: "Farmer Created",
            qrCode,
            blockchainLogs: [firstBlock]
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });

    } catch (error) {
        console.error("CREATE PRODUCT ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ================= GET SINGLE PRODUCT =================
exports.getProduct = async (req, res) => {
    try {
        console.log("REQ PARAM ID:", req.params.id);
        console.log("USER:", req.user);

        const product = await Product.findOne({
            productId: req.params.id.trim()
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // 🔐 SAFE CHECK (IMPORTANT FIX)
        if (
            req.user &&
            req.user.role === "farmer" &&
            product.createdBy.toString() !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: "Not allowed"
            });
        }

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        console.error("GET PRODUCT ERROR:", error); // 🔥 THIS WILL SHOW REAL ERROR
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ================= GET ALL PRODUCTS =================
exports.getAllProducts = async (req, res) => {
    try {
        let products;

        if (req.user.role === "farmer") {
            // Farmer sees only own products
            products = await Product.find({
                createdBy: req.user.id
            }).sort({ createdAt: -1 });

        } else {
            // Others see ALL products
            products = await Product.find()
                .sort({ createdAt: -1 });
        }

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {
        console.error("GET ALL PRODUCTS ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ================= UPDATE STAGE =================
exports.updateStage = async (req, res) => {
    try {
        const { productId, stage, updatedBy, location } = req.body;

        if (!productId || !stage) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const product = await Product.findOne({ productId });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // 🔐 Farmer cannot update
        if (req.user.role === "farmer") {
            return res.status(403).json({
                success: false,
                message: "Farmer cannot update stage"
            });
        }

        const previousBlock =
            product.blockchainLogs[
                product.blockchainLogs.length - 1
            ];

        const newBlock = {
            stage,
            updatedBy: updatedBy || req.user.name,
            location: location || "Updated via system",
            timestamp: new Date(),
            previousHash: previousBlock.currentHash
        };

        newBlock.currentHash = generateHash(newBlock);

        product.currentStage = stage;
        product.blockchainLogs.push(newBlock);

        await product.save();

        res.status(200).json({
            success: true,
            message: "Stage updated successfully",
            product
        });

    } catch (error) {
        console.error("UPDATE STAGE ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};