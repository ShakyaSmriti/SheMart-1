import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../App";
import { MdOutlineDelete } from "react-icons/md";

const User = ({ token }) => {
  const [users, setUsers] = useState([]);

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/user/list`, {
        headers: { token },
      });
      if (response.data.success) {
        setUsers(response.data.users || []);
      } else {
        toast.error(response.data.message || "Failed to fetch users.");
      }
    } catch (error) {
      toast.error(
        error?.message || "An error occurred while fetching the users."
      );
    }
  };

  const removeUser = async (id) => {
    try {
      const authToken = token || localStorage.getItem("token"); // Use prop token or fallback to localStorage

      if (!authToken) {
        toast.error("Authentication token missing.");
        return;
      }

      // Optimistically update UI before making API call
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));

      const response = await axios.post(
        `${backendUrl}/api/user/remove`,
        { id },
        { headers: { token } }
      );

      // Check if the deletion was successful
      if (response.data.success) {
        toast.success(response.data.message || "User deleted successfully!");
        // Update the user list after deletion
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
      } else {
        toast.error(response.data.message || "Failed to remove user.");
      }
    } catch (error) {
      toast.error(
        error?.message || "An error occurred while removing the user."
      );
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, [token]);

  return (
    <div>
      <h3 className="font-700 text-lg">Users</h3>
      <div className="flex flex-col gap-2">
        <div className="hidden md:grid grid-cols-[1fr_2fr_2fr_1fr_1fr] items-center p-2 bg-gray-100 text-sm">
          <b>Name</b>
          <b>Id</b>
          <b>Email</b>
          <b>Gender</b>
          <b>Delete</b>
        </div>

        {users.length > 0 ? (
          users.map((user, index) => (
            <div
              key={index}
              className="grid md:grid-cols-[1fr_2fr_2fr_1fr_1fr] gap-3 border-2 border-gray-200 p-4 md:p-2.5 text-xs sm:text-sm text-gray-500"
            >
              <p>{user.name}</p>
              <p>{user._id}</p>
              <p>{user.email}</p>
              <p>{user.gender}</p>
              <p>
                <MdOutlineDelete
                  className="cursor-pointer"
                  size={20}
                  onClick={() => {
                    removeUser(user._id); // Call removeUser when delete icon is clicked
                  }}
                />
              </p>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">No users found</div>
        )}
      </div>
    </div>
  );
};

export default User;
