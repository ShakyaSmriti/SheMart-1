import axios from "axios";
import { useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ShopContext } from "../context/ShopContext";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(""); // Track email error
  const [loading, setLoading] = useState(false); // Track API loading state
  const { backendUrl } = useContext(ShopContext);

  const validateForm = () => {
    let valid = true;
    if (!email.trim()) {
      setEmailError("Email is required.");
      valid = false;
    } else {
      setEmailError("");
    }
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Stop if validation fails
    }

    setLoading(true); // Start loading before API call

    try {
      const response = await axios.post(
        `${backendUrl}/api/user/forget-password`,
        { email }
      );

      if (response.data.success) {
        toast.success("Password reset email sent!");
        setEmail(""); // Clear input after success
      } else {
        toast.error("User not found. Please try again.");
      }
    } catch (error) {
      console.error("Forget Password Error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false); // Stop loading after API call
    }
  };

  return (
    <div className="flex items-center justify-center min-h-96 bg-white">
      <div className="w-96 p-6 border rounded-lg shadow-md">
        <h3 className="text-2xl prata-regular text-center mb-4">
          Forget Password —
        </h3>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex flex-col">
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-1 ${
                emailError
                  ? "border-red-500 ring-red-500"
                  : "border-gray-800 focus:ring-gray-600"
              }`}
              required
              disabled={loading}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white p-3 rounded-md hover:bg-gray-800 transition mt-2"
            disabled={loading}
          >
            {loading ? "Loading..." : "Send Email"}
          </button>
        </form>

        <div className="flex justify-between text-sm text-gray-800 mt-4">
          <NavLink to="/login">
            <p className="cursor-pointer ml-auto">Return to Login!</p>
          </NavLink>
        </div>
      </div>
    </div>
  );
}
