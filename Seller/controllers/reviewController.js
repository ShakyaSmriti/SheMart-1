import reviewModel from "./../models/reviewModel.js";

// add review to a product
const addReview = async (req, res) => {
  try {
    const productId = req.params.productId;
    // console.log(productId);

    const data = {
      product_id: productId,
      user: req.user?.userId, // or req.user._id if using auth middleware
      rating: req.body.rating,
      description: req.body.description,
    };

    if (!data.rating) {
      return res.status(400).json({ message: "Rating is required" });
    }
    if (!data.description) {
      return res.status(400).json({ message: "Description is required" });
    }
    if (!data.product_id) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    if (!data.user) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const review = await reviewModel.create(data);
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get reviews for a product
const getReviews = async (req, res) => {
  try {
    const productId = req.params.productId;
    const reviews = await reviewModel.find({ product_id: productId });
    // console.log(`reviews`, reviews);

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { addReview, getReviews };
