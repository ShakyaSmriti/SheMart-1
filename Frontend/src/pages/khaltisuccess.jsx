import React, { useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const KhaltiSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { backendUrl, token, setCartItems } = useContext(ShopContext);
  
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get pidx from URL query parameters
        const searchParams = new URLSearchParams(location.search);
        const pidx = searchParams.get("pidx");
        
        if (!pidx) {
          toast.error("Invalid payment response");
          navigate("/place-order");
          return;
        }

        console.log("Verifying payment with pidx:", pidx);

        // Try POST request first
        try {
          // Get stored order data as fallback
          const storedOrderData = localStorage.getItem('khaltiOrderData');
          
          const response = await fetch(`${backendUrl}/api/khalti/verify`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "token": token
            },
            body: JSON.stringify({ 
              pidx,
              // Include order data as fallback if session fails
              orderData: storedOrderData ? JSON.parse(storedOrderData) : undefined
            }),
          });

          const data = await response.json();
          console.log("Verification response:", data);

          if (data.success) {
            // Clear stored order data
            localStorage.removeItem('khaltiOrderData');
            
            toast.success("Payment successful! Your order has been placed.");
            setCartItems({});
            navigate("/orders");
          } else {
            toast.error(data.message || "Payment verification failed");
            navigate("/place-order");
          }
        } catch (postError) {
          console.error("POST request failed, trying GET:", postError);
          
          // If POST fails, try GET as fallback
          const response = await fetch(`${backendUrl}/api/khalti/verify?pidx=${pidx}`, {
            method: "GET",
            headers: { 
              "token": token
            }
          });

          const data = await response.json();
          console.log("GET Verification response:", data);

          if (data.success) {
            toast.success("Payment successful! Your order has been placed.");
            setCartItems({});
            navigate("/orders");
          } else {
            toast.error(data.message || "Payment verification failed");
            navigate("/place-order");
          }
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        toast.error("An error occurred during payment verification");
        navigate("/place-order");
      }
    };

    verifyPayment();
  }, [location.search, backendUrl, token, navigate, setCartItems]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-700">Verifying your payment...</p>
        </div>
      </div>
    </div>
  );
};

export default KhaltiSuccess;
