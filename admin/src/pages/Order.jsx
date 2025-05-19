import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { MdOutlineDelete } from "react-icons/md";

const Order = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");

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
        // Sort orders by date (newest first)
        const allOrders = response.data.orders || [];
        const sortedOrders = [...allOrders].sort((a, b) => b.date - a.date);
        setOrders(sortedOrders);
        applyFilter(sortedOrders, statusFilter);
      } else {
        toast.error(response.data.message || "Failed to fetch orders.");
      }
    } catch (error) {
      toast.error(
        error?.message || "An error occurred while fetching the orders."
      );
    }
  };

  // Apply filter based on selected status
  const applyFilter = (ordersList, status) => {
    if (status === "All") {
      setFilteredOrders(ordersList);
    } else {
      setFilteredOrders(ordersList.filter(order => order.status === status));
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const status = e.target.value;
    setStatusFilter(status);
    applyFilter(orders, status);
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

  // Handle order deletion
  const handleDeleteOrder = async (orderId) => {
    // Confirm before deleting
    if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      return;
    }
    
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/delete`,
        { orderId },
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        toast.success("Order deleted successfully");
        // Update the orders list after deletion
        setOrders(orders.filter(order => order._id !== orderId));
        setFilteredOrders(filteredOrders.filter(order => order._id !== orderId));
      } else {
        toast.error(response.data.message || "Failed to delete order");
      }
    } catch (error) {
      toast.error(
        error?.message || "An error occurred while deleting the order."
      );
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-700 text-lg">Orders</h3>
        
        {/* Status filter dropdown */}
        <div className="flex items-center">
          <label htmlFor="statusFilter" className="mr-2 text-sm">Filter by status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={handleFilterChange}
            className="border rounded-md p-1 text-sm"
          >
            <option value="All">All Orders</option>
            <option value="Order Placed">Order Placed</option>
            <option value="Packing">Packing</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for delivery">Out for delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div>
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No orders found with the selected filter.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order._id}
              className={`grid sm:grid-cols-[0.5fr_9fr_0.5fr] gap-3 border-2 ${
                order.status === "Cancelled" ? "border-red-200 bg-red-50" : "border-gray-200"
              } p-4 md:p-6 my-3 md:my-2 text-xs sm:text-sm text-gray-500`}
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

              <div className="grid lg:grid-cols-[4fr_4fr_3fr_2fr_3fr_1fr] items-start gap-8">
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
                  className={`border rounded-md p-1 text-sm w-full font-semibold ${
                    order.status === "Cancelled" ? "bg-red-50 text-red-600" : ""
                  }`}
                  disabled={order.status === "Cancelled"} // Disable dropdown if order is cancelled
                >
                  {/* Only show Cancelled option if the order is already cancelled */}
                  {order.status === "Cancelled" ? (
                    <option value="Cancelled">Cancelled</option>
                  ) : (
                    <>
                      <option value="Order Placed">Order Placed</option>
                      <option value="Packing">Packing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for delivery">Out for delivery</option>
                      <option value="Delivered">Delivered</option>
                    </>
                  )}
                </select>

                {/* Delete Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => handleDeleteOrder(order._id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Delete Order"
                  >
                    <MdOutlineDelete size={20} />
                  </button>
                </div>

                {/* Show cancellation notice if order is cancelled */}
                {order.status === "Cancelled" && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded lg:col-span-6">
                    <p className="font-semibold">Order cancelled by customer</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Order;
