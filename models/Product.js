const mongoose = require("mongoose");

const blockchainLogSchema = new mongoose.Schema({

    stage: {
        type: String
    },

    updatedBy: {
        type: String
    },

    location: {
        type: String
    },

    timestamp: {
        type: Date,
        default: Date.now
    },

    previousHash: {
        type: String
    },

    currentHash: {
        type: String
    }

});



const productSchema = new mongoose.Schema({

    productId: {
        type: String,
        unique: true
    },

    productName: {
        type: String,
        required: true
    },

    farmerName: {
        type: String,
        required: true
    },

    origin: {
        type: String,
        required: true
    },
    createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
},

    manufacturingDate: {
        type: String
    },

    expiryDate: {
        type: String
    },

    currentStage: {
        type: String,
        default: "Farmer"
    },

    qrCode: {
        type: String
    },

    blockchainLogs: [blockchainLogSchema]

}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);