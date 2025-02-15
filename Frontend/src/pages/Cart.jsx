import React, { useContext, useEffect, useState } from "react";
import { assets } from "./../assets/assets";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate } =
    useContext(ShopContext);

  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];

      for (const productId in cartItems) {
        for (const size in cartItems[productId]) {
          if (cartItems[productId][size] > 0) {
            tempData.push({
              _id: productId,
              size,
              quantity: cartItems[productId][size],
            });
          }
        }
      }

      setCartData(tempData);
    }
  }, [cartItems, products]);

  const handleCheckout = () => {
    if (cartData.length === 0) {
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
        {cartData.map((item, index) => {
          const productData = products.find(
            (product) => product._id === item._id
          );
          if (!productData) {
            console.warn(`Product with ID ${item._id} not found`);
            return null; // Skip rendering this item
          }

          return (
            <div
              className="py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
              key={`${item._id}-${item.size}`} // Unique key per product and size
            >
              <div className="flex items-start gap-6">
                {/* Ensure only ONE product image/video is displayed */}
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
                      {item.size}
                    </p>
                  </div>
                </div>
              </div>

              {/* Only update quantity, no new elements */}
              <input
                onChange={(e) => {
                  const newValue = Number(e.target.value);
                  if (newValue > 0) {
                    updateQuantity(item._id, item.size, newValue);
                  }
                }}
                className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
                type="number"
                min={1}
                value={item.quantity} // Use value instead of defaultValue
              />

              <img
                onClick={() => updateQuantity(item._id, item.size, 0)}
                className="w-4 mr-4 sm:w-5 cursor-pointer"
                src={assets.bin_icon}
                alt="Remove"
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          <CartTotal />
          <div className="w-full text-end">
            <button
              onClick={handleCheckout}
              disabled={cartData.length === 0}
              className={`bg-black text-white text-sm my-8 px-8 py-3 ${
                cartData.length === 0 ? "opacity-50 cursor-not-allowed" : ""
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
