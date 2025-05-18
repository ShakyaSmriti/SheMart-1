import React, { useEffect, useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const KhaltiSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { backendUrl, token, setCartItems } = useContext(ShopContext);
  const [paymentStatus, setPaymentStatus] = useState("processing"); // "processing", "success", "failed"
  
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get pidx from URL query parameters
        const searchParams = new URLSearchParams(location.search);
        const pidx = searchParams.get("pidx");
        
        if (!pidx) {
          setPaymentStatus("failed");
          toast.error("Invalid payment response");
          setTimeout(() => {
            navigate("/place-order");
          }, 5000);
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
            
            // Immediately update payment status to success
            setPaymentStatus("success");
            
            // Show success message
            toast.success("Payment successful! Your order has been placed.", {
              autoClose: 5000, // 5 seconds
              position: "top-center",
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: false
            });
            
            // Set cart items to empty
            setCartItems({});
            
            // Wait 5 seconds before redirecting
            setTimeout(() => {
              navigate("/orders");
            }, 5000);
          } else {
            setPaymentStatus("failed");
            toast.error(data.message || "Payment verification failed", {
              autoClose: 5000
            });
            setTimeout(() => {
              navigate("/place-order");
            }, 5000);
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
            setPaymentStatus("success");
            toast.success("Payment successful! Your order has been placed.", {
              autoClose: 5000
            });
            setCartItems({});
            setTimeout(() => {
              navigate("/orders");
            }, 5000);
          } else {
            setPaymentStatus("failed");
            toast.error(data.message || "Payment verification failed", {
              autoClose: 5000
            });
            setTimeout(() => {
              navigate("/place-order");
            }, 5000);
          }
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setPaymentStatus("failed");
        toast.error("An error occurred during payment verification", {
          autoClose: 5000
        });
        setTimeout(() => {
          navigate("/place-order");
        }, 5000);
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
            <p className="text-gray-600 mb-4">Your order has been placed successfully.</p>
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
