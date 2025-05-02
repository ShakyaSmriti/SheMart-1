import React, { Children, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";
import { useMemo } from "react";
import { use } from "react";

const Product = () => {
  const { productId } = useParams();
  // console.log("Product ID from useParams:", productId); // Log productId to debug
  const {
    products,
    token,
    currency,
    addToCart,
    cartItems,
    addToWishlist,
    wishlistItems,
    setWishlistItems,
    setCartData,
    backendUrl,
    getUserWishlist,
  } = useContext(ShopContext);

  const [productData, setProductData] = useState(false);
  const [media, setMedia] = useState("");
  const [size, setSize] = useState("");
  const [review, setReview] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(0);
  const [roundedUpRating, setRoundedUpRating] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // console.log(`wishlistItems`, wishlistItems);

  // Check if the product is in the wishlist

  useEffect(() => {
    if (Array.isArray(wishlistItems)) {
      const foundProduct = wishlistItems.find((item) => item._id === productId);

      setIsInWishlist(!!foundProduct); // Sets to true if foundProduct exists, otherwise false
    } else {
      setIsInWishlist(false); // If wishlistItems is not an array, set to false
    }
  }, [wishlistItems, productId]);

  console.log(`inside productId`, isInWishlist);

  const Icon = isInWishlist ? MdFavorite : MdFavoriteBorder;

  const fetchProductData = () => {
    const foundProduct = products.find((item) => item._id === productId);
    if (foundProduct) {
      setProductData(foundProduct);
      if (foundProduct.image?.length > 0) {
        setMedia(foundProduct.image[0]); // Set the first image
      } else if (foundProduct.video?.length > 0) {
        setMedia(foundProduct.video[0]); // Set the first video
      }
    } else {
      console.error("Product not found for productId:", productId);
    }
  };

  const handleAddReview = async (productId) => {
    if (!productId) {
      console.error("Product ID is undefined.");
      toast.error("Unable to add review. Product ID is missing.");
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/review/add/${productId}`, // Ensure productId is valid
        {
          productId,
          rating,
          description,
        },
        {
          headers: {
            token,
          },
        }
      );
      console.log("Review response:", response.data);

      // Update the review state with the new review
      setReview((prevReviews) => [
        ...prevReviews,
        { rating, description, user: token }, // Add the new review to the list
      ]);

      setRating(0); // Reset rating after submission
      setDescription(""); // Reset description after submission
      toast.success("Review added successfully!");
    } catch (error) {
      console.error("Error adding review:", error);
      toast.error(error.response?.data?.message || "Error adding review");
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) {
        console.error("Product ID is missing.");
        return;
      }

      try {
        const response = await axios.get(
          `${backendUrl}/api/review/list/${productId}`,
          {
            headers: {
              token,
            },
          }
        );
        setReview(response.data); // Assuming the API returns an array of reviews
        // console.log("Fetched reviews:", response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews(); // Call the function
  }, [productId, token]);

  useEffect(() => {
    const tempData = [];
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (item !== "type" && cartItems[items][item] > 0) {
          tempData.push({
            _id: items,
            size: item,
            quantity: cartItems[items][item],
            type: cartItems[items].type || "image", // Default to image if type is missing
          });
        }
      }
    }
    setCartData(tempData);
  }, [cartItems]);

  useEffect(() => {
    if (products.length > 0 && productId) {
      fetchProductData(productId);
    }
  }, [productId, products]);

  useEffect(() => {
    if (review.length > 0) {
      const averageRating =
        review.reduce((sum, item) => sum + item.rating, 0) / review.length;
      const roundedUpRating = Math.ceil(averageRating); // Round up the average rating
      setRoundedUpRating(roundedUpRating); // Set the rounded-up rating
    } else {
      console.log("No reviews available to calculate average rating.");
    }
  }, [review]);

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* Product Data */}
      <div className="flex gap-12 flex-col sm:flex-row">
        {/* Product Media */}
        <div className="flex-1 flex flex-col-reverse sm:flex-row gap-3">
          {/* Thumbnail List */}
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-auto sm:justify-start gap-2">
            {productData.image?.map((item, index) => (
              <img
                onClick={() => setMedia(item)}
                src={item.image}
                key={index}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
              />
            ))}
            {productData.video?.map((item, index) => (
              <img
                onClick={() => setMedia(item)}
                src={assets.videoThumbnail} // Replace with your custom thumbnail logic
                key={index}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
              />
            ))}
          </div>

          {/* Main Media */}
          <div className="w-full sm:w-[80%]">
            {productData.image?.length > 0 ? (
              <img
                className="w-full h-auto aspect-[1/1] object-contain"
                src={media}
                alt="Main Product"
              />
            ) : productData.video?.length > 0 ? (
              <video
                className="w-full aspect-[1/1] object-contain"
                src={media}
                autoPlay
                loop
                muted
              />
            ) : null}
          </div>
        </div>

        {/* ------ Product Info ------- */}
        <div className="flex-1">
          <div className="flex items-center gap-40 mt-2">
            <h1 className="font-medium text-2xl">{productData.name}</h1>
            <Icon
              className="cursor-pointer transition-colors duration-200"
              size={25}
              onClick={async () => {
                await addToWishlist(productId);
                await setWishlistItems((prev) => {
                  const updated = { ...prev };

                  const key = productId; // Ensure key is a string
                  if (wishlistItems[key]) {
                    delete updated[key]; // Remove from wishlist
                    // console.log(updated[key]);
                    console.log("Removed from wishlist:", key);
                  } else {
                    updated[key] = true; // Add to wishlist
                    console.log("Added to wishlist:", key);
                  }
                  return updated;
                });
              }}
            />
          </div>

          <div className="flex items-center gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <img
                key={i}
                src={
                  i < roundedUpRating ? assets.star_icon : assets.star_dull_icon
                }
                alt="Star"
                className="w-3.5"
              />
            ))}
            <p className="pl-2">({review.length})</p>
          </div>

          <p>
            {currency} {productData.price}
          </p>
          <p className="mt-5 text-gray-500 md:w-4/5">
            {productData.description}
          </p>
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.sizes?.map((item, index) => (
                <button
                  onClick={() => setSize(item)}
                  className={`border py-2 px-4 bg-gray-100 ${
                    item === size ? "border-orange-500" : ""
                  }`}
                  key={index}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              if (media?.endsWith(".mp4")) {
                addToCart(productData._id, size, "video");
              } else {
                addToCart(productData._id, size, "image");
              }
            }}
            className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
          >
            ADD TO CART
          </button>

          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original Product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* -----Description and review Section-------- */}
      <div className="mt-20">
        <div className="flex">
          {/* <b className="border px-5 py-3 text-sm">Description</b> */}
          <p className="border px-5 py-3 text-2xl ">Reviews </p>
        </div>

        <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-800">
          {/* Star Rating Input */}
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <img
                key={star}
                src={star <= rating ? assets.star_icon : assets.star_dull_icon}
                alt="Star"
                className="w-5 cursor-pointer"
                onClick={() => setRating(star)} // Set rating on click
                value={rating}
              />
            ))}
            <p className="pl-2">{rating} / 5</p>
          </div>

          <div className="flex gap-2 items-center">
            <textarea
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              className="w-full px-3 py-2 border rounded-lg border-gray-300"
              placeholder="Write a review..."
            />
            <button
              onClick={() => handleAddReview(productId)}
              className="bg-black text-white px-8 py-2 rounded-lg text-sm active:bg-gray-700"
            >
              Add Review
            </button>
          </div>

          <p className="py-2 border-b-2 border-gray-200">Users Reviews:</p>
          {/* {console.log("Fetched reviews:", review)} */}

          {/* Display fetched reviews */}
          {review && review.length > 0 ? (
            review.map((item, index) => (
              <div key={index} className="border-b py-4">
                <div className="flex items-center gap-2">
                  <p className="font-bold">
                    {item.user === token ? "You" : "Anonymous"}
                  </p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <img
                        key={i}
                        src={
                          i < item.rating
                            ? assets.star_icon
                            : assets.star_dull_icon
                        }
                        alt="Star"
                        className="w-4"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">
              No reviews yet. Be the first to review!
            </p>
          )}
        </div>
      </div>

      {/* ----------Display related products---------- */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
        currentProductId={productId} // Pass the current product ID here
      />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
