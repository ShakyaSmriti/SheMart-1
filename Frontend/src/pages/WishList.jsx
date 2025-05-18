import React, { useContext, useEffect, useState } from "react";
import Title from "../components/Title";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { Link } from "react-router-dom";

const WishList = () => {
  const {
    products,
    currency,
    token,
    addToCart,
    wishlistItems,
    getUserWishlist,
    addToWishlist,
  } = useContext(ShopContext);

  const [selectedSizes, setSelectedSizes] = useState({});
  const [wishlistData, setWishlistData] = useState([]);

  // Fetch user wishlist when component mounts or token changes
  useEffect(() => {
    if (token) {
      getUserWishlist(token);
    }
  }, [token]);

  // Prepare wishlist data with product details
  useEffect(() => {
    if (!Array.isArray(wishlistItems) || !Array.isArray(products)) return;

    const data = wishlistItems
      .map((item) => {
        const product = products.find((p) => p._id === item._id);
        if (!product) return null;
        return {
          ...product,
          size: item.size || "",
        };
      })
      .filter(Boolean);

    setWishlistData(data);
  }, [wishlistItems, products]);

  // Handle size selection for each product
  const handleSizeSelect = (productId, size) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: size,
    }));
  };

  // Handle removing item from wishlist
  const handleRemoveFromWishlist = async (productId) => {
    const result = await addToWishlist(productId); // This toggles off

    if (!result?.success) {
      toast.error("Failed to remove from wishlist", {
        autoClose: 4000,
      });
    } else {
      toast.success, {autoClose: 1500,
      };
    }
  };

  return (
    <div className="border-t pt-14 px-4 sm:px-8">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"WISHLIST"} />
      </div>

      {wishlistData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 text-center">
        <MdFavoriteBorder size={48} className="mb-4 text-gray-300" />
        <p className="text-lg font-medium">Your wishlist is empty.</p>
        <p className="text-sm mt-2">Add items to your wishlist to save them for later!</p>
      
        <Link to="/collection" className="mt-4 px-4 py-2 bg-black text-white text-sm hover:bg-gray-800 rounded">Browse Products</Link>
      </div>
      ) : (
        <div>
          {wishlistData.map((productData) => {
            if (!productData) return null;

            const selectedSize = selectedSizes[productData._id] || "";

            return (
              <div
                key={productData._id}
                className="py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_2fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
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

                    {/* Sizes */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {productData.sizes?.map((size, idx) => (
                        <span
                          onClick={() =>
                            handleSizeSelect(productData._id, size)
                          }
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

      
<div
  onClick={() => handleRemoveFromWishlist(productData._id)}
  className="cursor-pointer text-red-500 hover:text-red-700 transition-colors duration-200"
  title="Remove from wishlist"
>
  <MdFavorite size={24} />
</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishList;