const express = require("express");
const router = express.Router();

const bannedList = [
  "tobacco",
  "alcohol",
  "nicotine",
  "gutkha",
  "cigarette",
  "drug",
  "weed",
  "vape"
];

// ✅ YOUR OWN API
router.post("/check", (req, res) => {
  const { productName } = req.body;

  const isBanned = bannedList.some(item =>
    productName.toLowerCase().includes(item)
  );

  if (isBanned) {
    return res.json({
      success: true,
      banned: true,
      message: "Product is restricted"
    });
  }

  res.json({
    success: true,
    banned: false,
    message: "Product is allowed"
  });
});

module.exports = router;