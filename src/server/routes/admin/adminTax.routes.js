const express = require("express");
const router = express.Router();
const verifyToken = require("../../middlewares/verifyToken");
const roleCheck = require("../../middlewares/roleCheck");

const {
  createTax,
  getAllTaxes,
  getSingleTax,
  updateTax,
  deleteTax,
  toggleTaxStatus
} = require("../../conrollers/admin/adminTax.controller");

router.post("/", verifyToken, roleCheck("admin"), createTax);
router.get("/", verifyToken, roleCheck("admin"), getAllTaxes);
router.get("/:id", verifyToken, roleCheck("admin"), getSingleTax);
router.put("/:id", verifyToken, roleCheck("admin"), updateTax);
router.delete("/:id", verifyToken, roleCheck("admin"), deleteTax);
router.patch("/toggle/:id", verifyToken, roleCheck("admin"), toggleTaxStatus);

module.exports = router;