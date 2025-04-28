import React, { useEffect, useState, useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const Profile = () => {
  const { backendUrl } = useContext(ShopContext);
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

  // Fetch user profile data
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found. Please log in.");
        return;
      }

      const response = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: { token },
      });

      if (response.data.success) {
        const fetchedUser = response.data.user;

        // Format the date of birth before setting it in formData
        const formattedDateOfBirth =
          fetchedUser.dateOfBirth &&
          new Date(fetchedUser.dateOfBirth).toISOString().split("T")[0];

        setUser(fetchedUser);
        setFormData({
          ...fetchedUser,
          dateOfBirth: formattedDateOfBirth || "",
        });
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

  // Generate initials from the user's name
  const generateInitials = (name) => {
    if (!name) return "User";
    const nameParts = name.split(" ");
    return nameParts.map((part) => part[0].toUpperCase()).join("");
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Validate form data
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

  // Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Convert dateOfBirth to a Date object before sending
    if (formData.dateOfBirth) {
      formData.dateOfBirth = new Date(formData.dateOfBirth);
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found. Please log in.");
        return;
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      const response = await axios.put(
        `${backendUrl}/api/user/update`,
        formDataToSend,
        {
          headers: {
            token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        setUser(response.data.user);
        setFormData(response.data.user); // Update formData with the new data
        setIsEditing(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "An error occurred"
      );
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...user });
  };

  // Handle edit mode toggle
  const handleEdit = () => setIsEditing(true);

  // Field configuration for dynamic rendering
  const fields = [
    { label: "Name", name: "name", type: "text", required: true },
    { label: "Email", name: "email", type: "email", required: true },
    { label: "Gender", name: "gender", type: "select", required: true },
    { label: "Address", name: "address", type: "text" },
    { label: "Phone", name: "phone", type: "text" },
    { label: "Date of Birth", name: "dateOfBirth", type: "date" },
  ];

  // Loading state
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
              {/* Show initials if no profile picture */}
              <div className="w-40 h-40 rounded-full bg-black flex items-center justify-center text-white text-5xl font-bold">
                {generateInitials(user.name)}
              </div>
            </div>
          </div>

          {/* Right: Profile Data */}
          <div className="flex-1 w-full">
            {/* View Mode */}
            {!isEditing && (
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

                {/* Edit Button */}
                <button
                  onClick={handleEdit}
                  aria-label="Edit Profile"
                  className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full"
                >
                  Edit Profile
                </button>
              </form>
            )}

            {/* Edit Mode */}
            {isEditing && (
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

                {/* Buttons */}
                <div className="flex justify-end gap-4">
                  <button
                    type="submit"
                    aria-label="Save Changes"
                    className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    aria-label="Cancel Edit"
                    className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full"
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
