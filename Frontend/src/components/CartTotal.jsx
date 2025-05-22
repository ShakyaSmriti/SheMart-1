import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";

const CartTotal = () => {
  const { getCartAmount, currency, delivery_fee } = useContext(ShopContext);

  return (
    <div className="flex flex-col gap-3 text-gray-800">
      <h2 className="text-xl font-medium mb-1">Order Summary</h2>
      <div className="flex justify-between">
        <p>Subtotal</p>
        <p>
          {currency}
          {getCartAmount()}
        </p>
      </div>
      <div className="flex justify-between">
        <p>Shipping Fee</p>
        <p>
          {currency}
          {delivery_fee}
        </p>
      </div>
      <hr />
      <div className="flex justify-between font-medium">
        <p>Total</p>
        <p>
          {currency}
          {getCartAmount() + delivery_fee}
        </p>
      </div>
    </div>
  );
};

export default CartTotal;
