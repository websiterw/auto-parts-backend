const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ level: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.createProduct = async (req, res) => {
  // Admin only: create product
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};