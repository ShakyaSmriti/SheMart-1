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
    profilePicture: "", // base64 or File object
  });
  const [previewImage, setPreviewImage] = useState("");

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

        // Format the date of birth before setting it in formData
        const formattedDateOfBirth =
          response.data.user.dateOfBirth &&
          new Date(response.data.user.dateOfBirth).toISOString().split("T")[0];

        setFormData({
          ...response.data.user,
          dateOfBirth: formattedDateOfBirth || "",
        });
        setPreviewImage(response.data.user.profilePicture || "");
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

  useEffect(() => {
    if (user) {
      // Ensure dateOfBirth is always in YYYY-MM-DD format
      setFormData((prevData) => ({
        ...prevData,
        dateOfBirth:
          user.dateOfBirth &&
          new Date(user.dateOfBirth).toISOString().split("T")[0],
      }));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="text-center mt-20 text-gray-600 text-xl">
        Loading Profile...
      </div>
    );
  }

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...user });
    setPreviewImage(user?.profilePicture || "");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        profilePicture: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.gender) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found. Please log in.");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("dateOfBirth", formData.dateOfBirth);

      if (formData.profilePicture instanceof File) {
        formDataToSend.append("profilePicture", formData.profilePicture);
      }

      const response = await axios.put(
        `${backendUrl}/api/user/update`,
        formDataToSend,
        {
          headers: {
            token: token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        setUser(response.data.user);
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

  return (
    <div className="flex justify-center mt-16">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-4xl">
        <h2 className="text-4xl font-extrabold mb-10 text-center">
          My Profile
        </h2>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
          {/* Left: Profile Image */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={previewImage || "/default-profile.png"}
                alt="Profile"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/150"; // Fallback image
                }}
                className="w-40 h-40 object-cover rounded-full border-4 border-blue-500 shadow-md"
              />
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  📷
                </label>
              )}
            </div>
          </div>

          {/* Right: Profile Data */}
          <div className="flex-1 w-full">
            {/* View Mode */}
            {!isEditing && (
              <form className="grid grid-cols-1 gap-6">
                {[
                  { label: "Name", name: "name" },
                  { label: "Email", name: "email" },
                  { label: "Gender", name: "gender" },
                  { label: "Address", name: "address" },
                  { label: "Phone", name: "phone" },
                  { label: "Date of Birth", name: "dateOfBirth" },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col">
                    <label className="text-gray-700 font-semibold mb-1">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      name={field.name}
                      value={
                        field.name === "dateOfBirth"
                          ? new Date(user[field.name])
                              .toISOString()
                              .split("T")[0]
                          : user[field.name]
                      }
                      disabled
                      className="border p-2 rounded-lg bg-gray-100"
                    />
                  </div>
                ))}

                {/* Edit Button */}
                <button
                  onClick={handleEdit}
                  className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full mt-4"
                >
                  Edit Profile
                </button>
              </form>
            )}

            {/* Edit Mode */}
            {isEditing && (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                {[
                  { label: "Name", name: "name", type: "text", required: true },
                  {
                    label: "Email",
                    name: "email",
                    type: "email",
                    required: true,
                  },
                  {
                    label: "Gender",
                    name: "gender",
                    type: "select",
                    required: true,
                  },
                  { label: "Address", name: "address", type: "text" },
                  { label: "Phone", name: "phone", type: "text" },
                  { label: "Date of Birth", name: "dateOfBirth", type: "date" },
                ].map((field) => (
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
                    className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
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
