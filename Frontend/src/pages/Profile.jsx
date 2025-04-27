import React, { useEffect, useState, useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const Profile = () => {
  const { backendUrl } = useContext(ShopContext);
  const [user, setUser] = useState(null);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found. Please log in.");
        return;
      }

      const response = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: {
          token: token,
        },
      });

      if (response.data.success) {
        setUser(response.data.user);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch profile data"
      );
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!user) {
    return <div className="text-center mt-10">Loading Profile...</div>;
  }

  return (
    <div className="flex flex-col items-center mt-12 gap-6">
      <h2 className="text-3xl font-bold">My Profile</h2>
      <div className="flex flex-col gap-4 bg-gray-100 p-8 rounded-lg shadow-md w-80">
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Gender:</strong> {user.gender}
        </p>
      </div>
    </div>
  );
};

export default Profile;
