import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const List = ({ token }) => {
  const [list, setList] = useState([]);

  // Fetch the list of products
  const fetchList = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);

      // Only update the state if the response is valid
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Remove a product
  const removeProduct = async (id) => {
    try {
      // Ensure token is available in the headers
      const token = localStorage.getItem("token"); // Get token from localStorage, if needed

      // Optimistically update the state
      setList((prevList) => prevList.filter((item) => item._id !== id));

      const response = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        { headers: { token } } // Pass token in the Authorization header
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // No need to call fetchList() here since we already updated the state
      } else {
        toast.error(response.data.message); // Show error message from the server
        // If the deletion failed, you might want to re-fetch the list to restore the removed item
        fetchList();
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.message || "An error occurred while removing the product"
      ); // Display error message
      // If there's an error, you might want to re-fetch the list to restore the removed item
      fetchList();
    }
  };

  useEffect(() => {
    fetchList(); // Call fetchList on initial render
  }, []);

  return (
    <>
      <p className="mb-2">All Products List</p>
      <div className="flex flex-col gap-2">
        {/* -----------List Table Title------------ */}
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 bg-gray-100 text-sm">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className="text-center">Action</b>
        </div>

        {/* --------Product List------- */}
        {Array.isArray(list) && list.length > 0 ? (
          list.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
            >
              {/* Conditionally render Image or Video based on available media */}
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 object-cover"
                />
              ) : item.video ? (
                <video src={item.video} className="w-12 h-12 object-cover" />
              ) : (
                <p>No media available</p> // In case no image or video is available
              )}

              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>
                {currency}
                {item.price}
              </p>
              <p
                onClick={() => removeProduct(item._id)}
                className="text-right md:text-center cursor-pointer text-lg"
              >
                X
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
