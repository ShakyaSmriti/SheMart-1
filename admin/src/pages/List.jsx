import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { FaRegEdit } from "react-icons/fa";
import { MdOutlineDelete } from "react-icons/md";
import { NavLink } from "react-router-dom";

const List = ({ token }) => {
  const [list, setList] = useState([]);

  // Fetch the list of products
  const fetchList = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/all`);

      console.log(response.data);
      if (response.data.success) {
        setList(response.data.products || []);
      } else {
        toast.error(response.data.message || "Failed to fetch products.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error(
        error?.message || "An error occurred while fetching the list."
      );
    }
  };

  // Remove a product
  const removeProduct = async (id) => {
    try {
      const authToken = token || localStorage.getItem("token"); // Use prop token or fallback to localStorage

      if (!authToken) {
        toast.error("Authentication token missing.");
        return;
      }

      // Optimistically update UI before making API call
      setList((prevList) => prevList.filter((item) => item._id !== id));

      const response = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        { headers: { token } } // Ensure correct header format
      );

      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || "Failed to remove product.");
        fetchList(); // Restore the list if deletion failed
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error(
        error?.message || "An error occurred while removing the product."
      );
      fetchList(); // Restore the list in case of an error
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <h3 className="font-700 text-lg mb-2">All Products List</h3>
      <div className="flex flex-col gap-2">
        {/* -----------List Table Title------------ */}
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr_1fr] items-center p-2 bg-gray-100 text-sm">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Stock</b>
          <b>Edit</b>
          <b>Delete</b>
        </div>

        {/* --------Product List------- */}
        {list.length > 0 ? (
          list.map((item) => (
            <div
              key={item._id}
              className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr_1fr] items-center gap-2 p-2 border-2 border-gray-200  text-sm"
            >
              {/* Conditionally render Image or Video based on available media */}
              {item.video?.length > 0 ? (
                <video
                  className="w-16 sm:w-12"
                  src={item.video[0]}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : item.image?.length > 0 ? (
                <img
                  className="w-16 sm:w-12"
                  src={item.image[0]}
                  alt={item.name}
                />
              ) : (
                <p>No media available</p>
              )}

              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>
                {currency}
                {item.price}
              </p>
              <p>{item.stock}</p>

              <p className="text-right md:text-center cursor-pointer text-lg">
                <NavLink to={`/update/${item._id}`}>
                  <FaRegEdit />
                </NavLink>
              </p>
              <p
                onClick={() => removeProduct(item._id)}
                className="text-right md:text-center cursor-pointer text-lg"
              >
                <MdOutlineDelete />
              </p>
            </div>
          ))
        ) : (
          <p>Loading or no products available...</p>
        )}
      </div>
    </>
  );
};

export default List;
