import axios from "axios";
import { useState, useContext, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ShopContext } from "../context/ShopContext"; 

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false); // Track API loading state
  const { backendUrl } = useContext(ShopContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading before API call
    console.log("Email submitted:", email);

    try {
      const response = await axios.post(
        `${backendUrl}/api/user/forget-password`,
        { email }
      );
      console.log("Response:", response.data);

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
    <>
      <div className="flex items-center justify-center min-h-96 bg-white ">
        <div className="w-96 p-6 border rounded-lg shadow-md">
          <h3 className="text-2xl prata-regular text-center mb-4">
            Forget Password —
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-800 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-600"
              required
              disabled={loading} // Disable input during API call
            />
            <button
              type="submit"
              className="w-full bg-black text-white p-3 rounded-md hover:bg-gray-800 transition"
              disabled={loading} // Disable button during API call
            >
              {loading ? "Loading..." : "Send Email"}
            </button>
          </form>

          <div className="flex justify-between text-sm text-gray-800 mt-4">
            <NavLink to="/login">
              <p className="cursor-pointer ml-auto ">Return to Login!</p>
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
}
