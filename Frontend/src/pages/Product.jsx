import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";

const Product = () => {
  const { productId } = useParams();
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
  const [review, setReview] = useState([]);
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(0);
  const [roundedUpRating, setRoundedUpRating] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isImageChanging, setIsImageChanging] = useState(false);
  const [viewAngle, setViewAngle] = useState("front");
  const [zoomLevel, setZoomLevel] = useState(1);

  // Check if product is in wishlist
  useEffect(() => {
    if (Array.isArray(wishlistItems)) {
      const foundProduct = wishlistItems.find((item) => item._id === productId);
      setIsInWishlist(!!foundProduct);
    } else {
      setIsInWishlist(false);
    }
  }, [wishlistItems, productId]);

  const Icon = isInWishlist ? MdFavorite : MdFavoriteBorder;

  const fetchProductData = () => {
    const foundProduct = products.find((item) => item._id === productId);
    if (foundProduct) {
      setProductData(foundProduct);
      if (foundProduct.image?.length > 0) {
        setMedia(foundProduct.image[0]);
      } else if (foundProduct.video?.length > 0) {
        setMedia(foundProduct.video[0]);
      }
    }
  };

  useEffect(() => {
    if (products.length > 0 && productId) {
      fetchProductData(productId);
    }
  }, [productId, products]);

  // Calculate average rating
  useEffect(() => {
    if (review.length > 0) {
      const avgRating =
        review.reduce((acc, r) => acc + r.rating, 0) / review.length;
      setRoundedUpRating(Math.ceil(avgRating));
    } else {
      setRoundedUpRating(0);
    }
  }, [review]);

  // Fetch existing reviews
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/review/list/${productId}`);
        if (res.data.success) {
          setReview(res.data.data || []);
        }
      } catch (error) {
        console.error("Failed to load reviews", error);
      }
    };
    if (productId) loadReviews();
  }, [productId, backendUrl]);

  // Handle adding a new review
  const handleAddReview = async (productId, rating, description) => {
    if (!rating || !description.trim()) {
      toast.warn("Please select a rating and write a review.");
      return;
    }
    try {
      const res = await axios.post(
        `${backendUrl}/api/review/add/${productId}`,
        {
          rating,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 200) {
        setReview([res.data, ...review]); // res.data is the review object
        setDescription("");
        setRating(0);
        toast.success("Review submitted!");
      } else {
        toast.error("Failed to submit review");
      }
      
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  // Image transform style based on view angle
  const getImageTransformStyle = () => {
    if (viewAngle === "side") {
      return {
        transform: `translateX(-8%) scale(${zoomLevel}) perspective(1000px) rotateY(25deg)`,
        transition: "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      };
    } else if (viewAngle === "back") {
      return {
        transform: `translateX(8%) scale(${zoomLevel}) perspective(1000px) rotateY(-25deg)`,
        transition: "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      };
    } else {
      return {
        transform: `scale(${zoomLevel})`,
        transition: "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      };
    }
  };

  const handleViewChange = (angle, zoom = 1) => {
    if (angle === viewAngle && zoom === zoomLevel) return;
    setIsImageChanging(true);
    setTimeout(() => {
      setViewAngle(angle);
      setZoomLevel(zoom);
      setTimeout(() => setIsImageChanging(false), 100);
    }, 150);
  };

  const getProductViews = () => {
    const baseMedia = productData.image?.[0] || productData.video?.[0];
    if (!baseMedia) return [];
    const views = [
      {
        id: "front",
        src: baseMedia,
        label: "Front View",
        type: baseMedia.endsWith(".mp4") ? "video" : "image",
      },
      {
        id: "side",
        src: baseMedia,
        label: "Side View",
        type: baseMedia.endsWith(".mp4") ? "video" : "image",
        zoomLevel: 4,
      },
      {
        id: "back",
        src: baseMedia,
        label: "Back View",
        type: baseMedia.endsWith(".mp4") ? "video" : "image",
        zoomLevel: 2,
      },
    ];
    if (productData.image && productData.image.length > 1) {
      productData.image.slice(1, 3).forEach((img, idx) => {
        views[idx + 1].src = img;
      });
    }
    if (productData.video && productData.video.length > 0) {
      views.push({
        id: "video",
        src: productData.video[0],
        label: "Video",
        type: "video",
        zoomLevel: 4,
        description: "Product video",
      });
    }
    return views;
  };

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* Product Data */}
      <div className="flex gap-12 flex-col sm:flex-row">
        {/* Product Media */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Main Media */}
          <div className="w-full overflow-hidden relative">
            <div
              className={`w-full flex justify-center items-center h-96 transition-opacity duration-300 ${
                isImageChanging ? "opacity-70" : "opacity-100"
              }`}
            >
              {media?.endsWith(".mp4") || media?.includes(".mp4") ? (
                <video
                  className="w-full h-full object-contain"
                  src={media}
                  autoPlay
                  loop
                  muted
                />
              ) : (
                <div className="w-full h-full flex justify-center items-center overflow-hidden">
                  <img
                    style={getImageTransformStyle()}
                    src={media}
                    alt="Main Product"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
          {/* Thumbnail List */}
          <div className="flex justify-center gap-4 overflow-x-auto">
            {getProductViews().map((view, index) => (
              <div
                key={index}
                className={`cursor-pointer transition-all duration-300 ${
                  viewAngle === view.id ? "border-1" : ""
                }`}
                onClick={() => handleViewChange(view.id, view.zoomLevel)}
              >
                {view.type === "video" ? (
                  <video
                    src={view.src}
                    className="w-24 h-30 object-cover"
                    muted
                  />
                ) : (
                  <div className="relative w-24 h-30 overflow-hidden">
                    <img
                      src={view.src}
                      alt={view.label}
                      className="w-full h-full object-cover hover:opacity-90"
                      style={
                        view.id === "front"
                          ? {}
                          : view.id === "side"
                          ? { transform: "perspective(500px) rotateY(15deg)" }
                          : { transform: "perspective(500px) rotateY(-15deg)" }
                      }
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Product Info */}
        <div className="flex-1">
          <div className="flex items-center gap-40 mt-2">
            <h1 className="font-medium text-2xl">{productData.name}</h1>
            <Icon
              className="cursor-pointer transition-colors duration-200"
              size={25}
              onClick={async () => {
                const wasInWishlist = isInWishlist;
                setIsInWishlist(!wasInWishlist);
                try {
                  const result = await addToWishlist(productId);
                  if (!result?.success) setIsInWishlist(wasInWishlist);
                } catch (error) {
                  setIsInWishlist(wasInWishlist);
                }
              }}
            />
          </div>
          <div className="flex items-center gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <img
                key={i}
                src={i < roundedUpRating ? assets.star_icon : assets.star_dull_icon}
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
      {/* Review Section */}
      <div className="mt-20">
        <div className="flex">
          <p className="border px-5 py-3 text-2xl">Reviews</p>
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
                onClick={() => setRating(star)}
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
              onClick={() => handleAddReview(productId, rating, description)}
              className="bg-black text-white px-8 py-2 rounded-lg text-sm active:bg-gray-700"
            >
              Add Review
            </button>
          </div>
          <p className="py-2 border-b-2 border-gray-200">Users Reviews:</p>
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
                        src={i < item.rating ? assets.star_icon : assets.star_dull_icon}
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
      {/* Related Products */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
        currentProductId={productId}
      />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;