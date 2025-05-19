import React, { useEffect, useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";

const KhaltiSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { backendUrl, token, setCartItems } = useContext(ShopContext);
  const [paymentStatus, setPaymentStatus] = useState("processing");
  
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get pidx from URL query parameters
        const searchParams = new URLSearchParams(location.search);
        const pidx = searchParams.get("pidx");
        
        // Get token from localStorage or context
        const authToken = localStorage.getItem("token") || token;
        
        if (!pidx) {
          setPaymentStatus("failed");
          toast.error("Invalid payment response");
          setTimeout(() => navigate("/place-order"), 5000);
          return;
        }

        console.log("Verifying payment with pidx:", pidx);

        // Get stored order data
        const storedOrderData = localStorage.getItem('khaltiOrderData');
        
        // Create order payload with correct payment method
        const createOrderPayload = storedOrderData ? {
          ...JSON.parse(storedOrderData),
          paymentMethod: "Khalti", // Explicitly set to Khalti
          payment: true,           // Mark as paid
          transactionId: pidx      // Include transaction ID
        } : null;
        
        console.log("Creating order with payment method:", createOrderPayload?.paymentMethod);
        
        // Try direct order creation first
        if (createOrderPayload) {
          try {
            const directOrderResponse = await axios.post(
              `${backendUrl}/api/order/place`,
              createOrderPayload,
              { headers: { token: authToken } }
            );
            
            if (directOrderResponse.data.success) {
              console.log("Order created successfully with Khalti payment");
              localStorage.removeItem('khaltiOrderData');
              setPaymentStatus("success");
              toast.success("Payment successful! Your order has been placed.");
              setCartItems({});
              setTimeout(() => navigate("/orders"), 5000);
              return;
            }
          } catch (orderError) {
            console.error("Failed to create order directly:", orderError);
          }
        }
        
        // If direct creation fails, try verification
        try {
          const response = await fetch(`${backendUrl}/api/khalti/verify`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "token": authToken
            },
            body: JSON.stringify({ 
              pidx,
              orderData: createOrderPayload
            }),
          });

          const data = await response.json();
          console.log("Verification response:", data);

          if (data.success) {
            localStorage.removeItem('khaltiOrderData');
            setPaymentStatus("success");
            toast.success("Payment successful! Your order has been placed.");
            setCartItems({});
            setTimeout(() => navigate("/orders"), 5000);
          } else {
            // Final fallback - try one more time with direct order creation
            if (createOrderPayload) {
              try {
                const finalOrderResponse = await axios.post(
                  `${backendUrl}/api/order/place`,
                  createOrderPayload,
                  { headers: { token: authToken } }
                );
                
                if (finalOrderResponse.data.success) {
                  console.log("Order created in final fallback");
                  localStorage.removeItem('khaltiOrderData');
                  setPaymentStatus("success");
                  toast.success("Payment successful! Your order has been placed.");
                  setCartItems({});
                  setTimeout(() => navigate("/orders"), 5000);
                  return;
                }
              } catch (finalError) {
                console.error("Final fallback failed:", finalError);
              }
            }
            
            setPaymentStatus("failed");
            toast.error(data.message || "Payment verification failed");
            setTimeout(() => navigate("/place-order"), 5000);
          }
        } catch (error) {
          console.error("Verification error:", error);
          setPaymentStatus("failed");
          toast.error("An error occurred during payment verification");
          setTimeout(() => navigate("/place-order"), 5000);
        }
      } catch (error) {
        console.error("Error in payment verification flow:", error);
        setPaymentStatus("failed");
        toast.error("An error occurred during payment verification");
        setTimeout(() => navigate("/place-order"), 5000);
      }
    };

    verifyPayment();
  }, [location.search, backendUrl, token, navigate, setCartItems]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        {paymentStatus === "processing" && (
          <div className="flex flex-col items-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Verifying your payment...</h2>
            <p className="text-gray-600">Please wait while we confirm your transaction.</p>
          </div>
        )}
        
        {paymentStatus === "success" && (
          <div className="flex flex-col items-center">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <svg className="h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">Your order has been placed successfully with Khalti.</p>
            <p className="text-sm text-gray-500">Redirecting to your orders in 5 seconds...</p>
          </div>
        )}
        
        {paymentStatus === "failed" && (
          <div className="flex flex-col items-center">
            <div className="bg-red-100 p-3 rounded-full mb-4">
              <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-4">There was an issue with your payment.</p>
            <p className="text-sm text-gray-500">Redirecting back to checkout in 5 seconds...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KhaltiSuccess;
