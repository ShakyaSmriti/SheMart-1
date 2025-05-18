import React, { useEffect, useState, useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const Profile = () => {
  const { backendUrl, user: globalUser, setUser: setGlobalUser } =
    useContext(ShopContext);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    address: "",
    phone: "",
    dateOfBirth: "",
  });

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found. Please log in.");
        return;
      }

      console.log("Fetching profile with token:", token);

      const response = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: {
          token: token, // Changed from Authorization: Bearer ${token}
        },
      });

      console.log("Profile response:", response.data);

      if (response.data.success) {
        const fetchedUser = response.data.user;
        const formattedDateOfBirth = fetchedUser.dateOfBirth
          ? new Date(fetchedUser.dateOfBirth).toISOString().split("T")[0]
          : "";

        const updatedUser = {
          ...fetchedUser,
          dateOfBirth: formattedDateOfBirth,
        };

        setUser(updatedUser);
        setFormData(updatedUser);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch profile data"
      );
    }
  };

  useEffect(() => {
    if (globalUser) {
      const formattedDateOfBirth = globalUser.dateOfBirth
        ? new Date(globalUser.dateOfBirth).toISOString().split("T")[0]
        : "";
      const updatedUser = {
        ...globalUser,
        dateOfBirth: formattedDateOfBirth,
      };
      setUser(updatedUser);
      setFormData(updatedUser);
    } else {
      fetchProfile();
    }
  }, [globalUser]);

  const generateInitials = (name) => {
    if (!name) return "User";
    return name
      .split(" ")
      .map((part) => part[0].toUpperCase())
      .join("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.gender) {
      toast.error("Please fill in all required fields.");
      return false;
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    if (!isValidEmail) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found. Please log in.");
        return;
      }

      const updatedData = { ...formData };

      if (updatedData.dateOfBirth) {
        updatedData.dateOfBirth = new Date(updatedData.dateOfBirth).toISOString(); // ISO format
      }

      const response = await axios.put(
        `${backendUrl}/api/user/update`,
        updatedData,
        {
          headers: {
            token: token, // Changed from Authorization: Bearer ${token}
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Profile updated successfully!");

        const formattedDateOfBirth = response.data.user.dateOfBirth
          ? new Date(response.data.user.dateOfBirth).toISOString().split("T")[0]
          : "";

        const updatedUser = {
          ...response.data.user,
          dateOfBirth: formattedDateOfBirth,
        };

        setUser(updatedUser);
        setFormData(updatedUser);
        setIsEditing(false);

        // Update global context
        if (setGlobalUser) {
          setGlobalUser(updatedUser);
        }
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "An error occurred while updating"
      );
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData(user);
      setIsEditing(false);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const fields = [
    { label: "Name", name: "name", type: "text", required: true },
    { label: "Email", name: "email", type: "email", required: true },
    { label: "Gender", name: "gender", type: "select", required: true },
    { label: "Address", name: "address", type: "text" },
    { label: "Phone", name: "phone", type: "text" },
    { label: "Date of Birth", name: "dateOfBirth", type: "date" },
  ];

  if (!user) {
    return (
      <div className="animate-pulse flex justify-center mt-20">
        <div className="w-64 h-64 bg-gray-300 rounded-full"></div>
        <div className="flex flex-col gap-4 mt-4">
          <div className="h-6 w-48 bg-gray-300 rounded"></div>
          <div className="h-6 w-48 bg-gray-300 rounded"></div>
          <div className="h-6 w-48 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-16">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-4xl">
        <h2 className="text-4xl font-extrabold mb-10 text-center">
          My Profile
        </h2>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
          {/* Left: Profile Initials */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-40 h-40 rounded-full bg-black flex items-center justify-center text-white text-5xl font-bold">
                {generateInitials(user.name)}
              </div>
            </div>
          </div>

          {/* Right: Profile Data */}
          <div className="flex-1 w-full">
            {!isEditing ? (
              <form className="grid grid-cols-1 gap-6">
                {fields.map((field) => (
                  <div key={field.name} className="flex flex-col">
                    <label className="text-gray-700 font-semibold mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type === "select" ? "text" : field.type}
                      name={field.name}
                      value={user[field.name] || ""}
                      disabled
                      className="border p-2 rounded-lg bg-gray-100"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleEdit}
                  aria-label="Edit Profile"
                  className="bg-black text-white px-6 py-2 rounded-full"
                >
                  Edit Profile
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                {fields.map((field) => (
                  <div key={field.name} className="flex flex-col">
                    <label className="text-gray-700 font-semibold mb-1">
                      {field.label}
                    </label>
                    {field.type === "select" ? (
                      <select
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className="border p-2 rounded-lg bg-gray-100"
                        required={field.required}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        className="border p-2 rounded-lg bg-gray-100"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}

                <div className="flex justify-end gap-4">
                  <button
                    type="submit"
                    aria-label="Save Changes"
                    className="bg-black text-white px-6 py-2 rounded-full"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    aria-label="Cancel Edit"
                    className="bg-black text-white px-6 py-2 rounded-full"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
