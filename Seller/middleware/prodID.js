// write a middleware to get product id from the request body
const prodID = async (req, res, next) => {
  const { productID } = req.body;
  const { product } = await productModel.findById(productID);
  req.product = product;
  next();
};

export default prodID;
