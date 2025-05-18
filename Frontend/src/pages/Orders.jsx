import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";

const Orders = () => {
  const { backendUrl, token, currency, cancelOrder } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrderData = async () => {
    try {
      setLoading(true);
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
              orderId: order._id,
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
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    // Confirm with the user before cancelling
    if (window.confirm("Are you sure you want to cancel this order?")) {
      const result = await cancelOrder(orderId);
      if (result.success) {
        // Reload the orders to reflect the change
        loadOrderData();
      }
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  // Function to check if an order can be cancelled
  const canCancelOrder = (status) => {
    // Orders can be cancelled if they're not delivered or already cancelled
    return status !== "Delivered" && status !== "Cancelled";
  };

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"ORDERS"} />
      </div>

      <div className="flex flex-col gap-5">
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Loading your orders...</p>
          </div>
        ) : orderData.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">You haven't placed any orders yet</p>
          </div>
        ) : (
          orderData.map((item, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row justify-between border p-5 rounded-sm"
            >
              <div className="flex flex-col md:flex-row md:w-1/2 gap-5">
                {item.image ? (
                  <img
                    className="w-full md:w-32 h-32 object-cover"
                    src={item.image[0]}
                    alt={item.name}
                  />
                ) : item.video ? (
                  <video
                    className="w-full md:w-32 h-32 object-cover"
                    src={item.video}
                    controls
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

              <div className="md:w-1/2 flex flex-col md:flex-row justify-between items-center mt-4 md:mt-0">
                <div className="flex items-center gap-2">
                  <p
                    className={`min-w-2 h-2 rounded-full ${
                      item.status === "Delivered"
                        ? "bg-green-500"
                        : item.status === "Cancelled"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  ></p>
                  <p className="text-sm md:text-base">{item.status}</p>
                </div>

                <div className="flex gap-2 mt-3 md:mt-0">
                  <button
                    onClick={loadOrderData}
                    className="border px-2 py-0 text-[10px] md:text-xs font-medium rounded-sm leading-tight h-10.5"
                  >
                    Track Order
                  </button>
                  
                  {canCancelOrder(item.status) && (
                    <button
                      onClick={() => handleCancelOrder(item.orderId)}
                      className="border border-red-500 text-red-500 px-2 py-0 text-[10px] md:text-xs font-medium rounded-sm hover:bg-red-50 leading-tight h-10"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
