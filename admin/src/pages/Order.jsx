import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const Order = ({ token }) => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    if (!token) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/order/list`,
        {},
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        toast.error(response.data.message || "Failed to fetch orders.");
      }
    } catch (error) {
      toast.error(
        error?.message || "An error occurred while fetching the orders."
      );
    }
  };

  const statusHandler = async (event, orderId) => {
    if (!token) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status: event.target.value },
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchAllOrders();
      } else {
        toast.error(response.data.message || "Failed to update status.");
      }
    } catch (error) {
      toast.error(
        error?.message || "An error occurred while updating the status."
      );
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div>
      <h3 className="font-700 text-lg">Orders</h3>

      <div>
        {orders.map((order) => (
          <div
            key={order._id}
            className="grid sm:grid-cols-[0.5fr_9fr_0.5fr] gap-3 border-2 border-gray-200 p-4 md:p-6 my-3 md:my-2 text-xs sm:text-sm text-gray-500"
          >
            {/* Preview media */}
            {order.items.length > 0 &&
              (order.items[0].video?.length > 0 ? (
                <video
                  className="w-20 sm:w-20"
                  src={order.items[0].video[0]}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : order.items[0].image?.length > 0 ? (
                <img
                  className="w-20 sm:w-20"
                  src={order.items[0].image[0]}
                  alt={order.items[0].name}
                />
              ) : (
                <p>No media available</p>
              ))}

            <div className="grid lg:grid-cols-[4fr_4fr_3fr_2fr_3fr] items-start gap-8">
              {/* Order Items */}
              <div>
                {order.items.map((item, index) => (
                  <div key={index}>
                    <p>
                      <span className="font-semibold">Product: </span>
                      {item.name}
                    </p>
                    <p>
                      <span className="font-semibold">Size: </span>
                      {item.size}
                    </p>
                    <p>
                      <span className="font-semibold">Quantity: </span>
                      {item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              {/* Customer Details */}
              <div>
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  {order.address.firstName + " " + order.address.lastName}
                </p>
                <p>
                  <span className="font-semibold">Address:</span>{" "}
                  {order.address.address}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  {order.address.phone}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {order.address.email}
                </p>
              </div>

              {/* Order Details */}
              <div>
                <p>
                  <span className="font-semibold">Method:</span>{" "}
                  {order.paymentMethod}
                </p>
                <p>
                  <span className="font-semibold">Payment:</span>{" "}
                  {order.payment ? "Paid" : "Pending"}
                </p>
                <p>
                  <span className="font-semibold">Date:</span>{" "}
                  {new Date(order.date).toLocaleString()}
                </p>
              </div>

              {/* Amount */}
              <p>
                <span className="font-semibold">{currency}</span> {order.amount}
              </p>

              {/* Order Status Dropdown */}
              <select
                onChange={(event) => statusHandler(event, order._id)}
                value={order.status}
                className="border rounded-md p-1 text-sm w-full font-semibold"
              >
                <option value="OrderPlaced">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Order;
