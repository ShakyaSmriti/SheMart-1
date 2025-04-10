import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Title from "../components/Title";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";

const WishList = () => {
  const {
    products,
    currency,
    token,
    addToCart,
    wishlistItems,
    setWishlistItems,
    backendUrl,
  } = useContext(ShopContext);

  const [wishlistData, setWishlistData] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({}); // 🆕 To store selected size for each product

  const getUserWishlist = async (token) => {
    try {
      if (!token) {
        throw new Error("No authentication token provided");
      }

      const response = await axios.get(`${backendUrl}/api/wishlist/get`, {
        headers: { token },
      });

      console.log("Wishlist Data from API:", response.data.wishList);

      if (response.data.success) {
        const wishlistArray = Array.isArray(response.data.wishList)
          ? response.data.wishList
          : Object.values(response.data.wishList);

        setWishlistItems(wishlistArray);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch wishlist data"
        );
      }
    } catch (error) {
      console.error(
        "Error fetching wishlist:",
        error.response?.data || error.message
      );
      toast.error(
        error.response?.data?.message || "Error fetching wishlist data"
      );
    }
  };

  useEffect(() => {
    if (token) {
      getUserWishlist(token);
    }
  }, [token]);

  useEffect(() => {
    if (!Array.isArray(wishlistItems) || !Array.isArray(products)) return;

    const data = wishlistItems
      .map((item) => {
        const product = products.find((product) => product._id === item._id);
        if (!product) return null;

        return {
          ...product,
          size: item.size,
        };
      })
      .filter(Boolean);

    setWishlistData(data);
  }, [wishlistItems, products]);

  const handleSizeSelect = (productId, size) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: size,
    }));
  };

  return (
    <div className="border-t pt-14 px-4 sm:px-8">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"WISHLIST"} />
      </div>

      <div>
        {wishlistData.map((productData) => {
          if (!productData) return null;

          const selectedSize = selectedSizes[productData._id] || "";

          return (
            <div
              key={productData._id}
              className="py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
            >
              <div className="flex items-start gap-6">
                {/* Show media */}
                {productData.video?.length > 0 ? (
                  <video
                    className="w-16 sm:w-20"
                    src={productData.video[0]}
                    autoPlay
                    loop
                    muted
                  />
                ) : productData.image?.length > 0 ? (
                  <img
                    className="w-16 sm:w-20"
                    src={productData.image[0]}
                    alt={productData.name}
                  />
                ) : (
                  <p>No media available</p>
                )}

                <div>
                  <p className="text-xs sm:text-lg font-medium">
                    {productData.name}
                  </p>

                  {/* 🆕 Sizes */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {productData.sizes?.map((size, idx) => (
                      <span
                        onClick={() => handleSizeSelect(productData._id, size)}
                        key={idx}
                        className={`cursor-pointer border px-3 py-1 rounded ${
                          selectedSize === size
                            ? "border-orange-500 bg-orange-100"
                            : "bg-gray-100"
                        }`}
                      >
                        {size}
                      </span>
                    ))}
                  </div>

                  <p className="py-2 text-sm">
                    {currency} {productData.price}
                  </p>
                </div>
              </div>

              {/* Add to Cart */}
              <div>
                <button
                  onClick={() => {
                    if (!selectedSize) {
                      toast.error("Please select a size first!");
                      return;
                    }
                    const mediaType =
                      productData.video?.length > 0 ? "video" : "image";
                    addToCart(productData._id, selectedSize, mediaType);
                  }}
                  className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishList;
