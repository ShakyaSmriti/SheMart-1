import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../App";
import { MdOutlineDelete } from "react-icons/md";

const Seller = ({ token }) => {
  const [sellers, setSellers] = useState([]);

  const fetchAllSellers = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/seller/all`, {
        headers: { token },
      });
      if (response.data.success) {
        setSellers(response.data.sellers);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
      toast.error(error.response?.data?.message || "Failed to fetch sellers");
    }
  };

  const handleDeleteSeller = async (sellerId) => {};

  useEffect(() => {
    fetchAllSellers();
  }, [token]);

  return (
    <div>
      <h3 className="font-700 text-lg">Sellers</h3>

      <div className="flex flex-col gap-2">
        <div className="hidden md:grid grid-cols-[1fr_2fr_2fr_1fr_1fr] items-center p-2 bg-gray-100 text-sm">
          <b>Name</b>
          <b>Id</b>
          <b>Email</b>
          <b>Gender</b>
          <b>Delete</b>
        </div>

        {sellers.length > 0 ? (
          sellers.map((seller, index) => (
            <div
              key={index}
              className="grid md:grid-cols-[1fr_2fr_2fr_1fr_1fr] gap-3 border-2 border-gray-200 p-4 md:p-2.5 text-xs sm:text-sm text-gray-500"
            >
              <p>{seller.name}</p>
              <p>{seller._id}</p>
              <p>{seller.email}</p>
              <p>{seller.gender}</p>
              <p>
                <MdOutlineDelete
                  size={20}
                  onClick={() => handleDeleteSeller(seller._id)}
                />
              </p>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">No sellers found</div>
        )}
      </div>
    </div>
  );
};

export default Seller;
