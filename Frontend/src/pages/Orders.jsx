import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);

  const loadOrderData = async () => {
    try {
      if (!token) return;

      const response = await axios.get(`${backendUrl}/api/order/userorders`, {
        headers: { token },
      });

      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.forEach((order) => {
          order.items.forEach((item) => {
            allOrdersItem.push({
              ...item,
              status: order.status,
              payment: order.payment,
              paymentMethod: order.paymentMethod,
              date: order.date,
            });
          });
        });

        setOrderData(allOrdersItem.reverse());
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      <div>
        {orderData.length === 0 ? (
          <p className="text-center text-gray-500 mt-5">No orders found.</p>
        ) : (
          [...orderData] // Create a shallow copy to avoid mutating the original data
            .sort((a, b) => new Date(a.date) - new Date(b.date)) // Sort in descending order (latest first)
            .map((item, index) => (
              <div
                key={index}
                className="py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="flex items-center gap-6 text-sm">
                  {/* Ensure only ONE product image/video is displayed */}
                  {item.video?.length > 0 ? (
                    <video
                      className="w-16 sm:w-20"
                      src={item.video[0]}
                      autoPlay
                      loop
                      muted
                    />
                  ) : item.image?.length > 0 ? (
                    <img
                      className="w-16 sm:w-20"
                      src={item.image[0]}
                      alt={item.name}
                    />
                  ) : (
                    <p>No media available</p>
                  )}

                  <div>
                    <p className="sm:text-base font-medium">{item.name}</p>

                    <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                      <p className="text-lg">
                        {currency}
                        {item.price}
                      </p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Size: {item.size}</p>
                    </div>

                    <p className="mt-1">
                      Date:{" "}
                      <span className="text-gray-400">
                        {new Date(item.date).toDateString()}
                      </span>
                    </p>

                    <p className="mt-1">
                      Payment:{" "}
                      <span className="text-gray-400">
                        {item.paymentMethod}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="md:w-1/2 flex justify-between">
                  <div className="flex items-center gap-2">
                    <p
                      className={`min-w-2 h-2 rounded-full ${
                        item.status === "Delivered"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    ></p>
                    <p className="text-sm md:text-base">{item.status}</p>
                  </div>

                  <button
                    onClick={loadOrderData}
                    className="border px-4 py-2 text-sm font-medium rounded-sm"
                  >
                    Track Order
                  </button>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Orders;
