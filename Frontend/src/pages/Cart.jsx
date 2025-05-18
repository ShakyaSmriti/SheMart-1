import React, { useContext, useEffect, useState } from "react";
import { assets } from "./../assets/assets";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    updateQuantity,
    navigate,
    handleRemove,
    token
  } = useContext(ShopContext);

  // Debug logs to help identify issues
  useEffect(() => {
    console.log("Cart Items:", cartItems);
    console.log("Products:", products);
  }, [cartItems, products]);

  // Check if cart is empty
  const isCartEmpty = !cartItems || Object.keys(cartItems).length === 0 || 
    !Object.values(cartItems).some(item => 
      Object.entries(item).some(([key, value]) => key !== "type" && value > 0)
    );

  // Render cart items
  const renderCartItems = () => {
    if (!products || products.length === 0) {
      return <p>Loading products...</p>;
    }

    if (isCartEmpty) {
      return <p className="py-8 text-center">Your cart is empty</p>;
    }

    return Object.keys(cartItems).map(productId => {
      const productData = products.find(p => p._id === productId);
      
      if (!productData) {
        console.warn(`Product with ID ${productId} not found`);
        return null;
      }

      return Object.keys(cartItems[productId]).map(size => {
        if (size === "type" || cartItems[productId][size] <= 0) {
          return null;
        }

        const quantity = cartItems[productId][size];

        return (
          <div
            className="py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
            key={`${productId}-${size}`}
          >
            <div className="flex items-start gap-6">
              {/* Product image/video */}
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
                <div className="flex items-center gap-5 mt-2">
                  <p>
                    {currency}
                    {productData.price}
                  </p>
                  <p className="pz-2 sm:px-3 sm:py-1 border bg-slate-50">
                    {size}
                  </p>
                </div>
              </div>
            </div>

            {/* Quantity input */}
            <input
              onChange={(e) => {
                const newValue = Number(e.target.value);
                if (newValue > 0) {
                  updateQuantity(productId, size, newValue);
                }
              }}
              className="border text-center max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
              value={quantity}
              type="number"
              min="1"
            />

            {/* Remove button */}
            <img
              onClick={() => handleRemove(productId, size, quantity)}
              className="w-4 mr-4 sm:w-5 cursor-pointer"
              src={assets.bin_icon}
              alt="Remove"
            />
          </div>
        );
      }).filter(Boolean); // Filter out null values
    }).filter(Boolean); // Filter out null values
  };

  const handleCheckout = () => {
    if (isCartEmpty) {
      alert(
        "Your cart is empty. Please add products before proceeding to checkout."
      );
      return;
    }
    navigate("/place-order");
  };

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      <div>
        {renderCartItems()}
      </div>

      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          <CartTotal />
          <div className="w-full text-end">
            <button
              onClick={handleCheckout}
              disabled={isCartEmpty}
              className={`bg-black text-white text-sm my-8 px-8 py-3 ${
                isCartEmpty ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
