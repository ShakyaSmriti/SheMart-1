import React, { useEffect, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { useLocation, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";

const Khalti = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { amount, purpose, orderData } = location.state || {};
  const { backendUrl, token } = useContext(ShopContext);
  
  useEffect(() => {
    const initiatePayment = async () => {
      if (!amount || !purpose || !orderData) {
        toast.error("Missing payment information");
        navigate("/place-order");
        return;
      }

      try {
        const paisa = parseInt(amount) * 100; // Convert to paisa
        const purchase_order_id = uuidv4();
        
        const payload = {
          return_url: `${window.location.origin}/khaltiSuccess`,
          website_url: window.location.origin,
          amount: paisa,
          purchase_order_id: purchase_order_id,
          purchase_order_name: purpose,
          customer_info: {
            name: orderData?.address?.firstName + " " + orderData?.address?.lastName,
            email: orderData?.address?.email,
            phone: orderData?.address?.phone,
          },
          orderData: orderData
        };

        console.log("Sending payment request to backend:", payload);

        // Store orderData in localStorage as a fallback
        localStorage.setItem('khaltiOrderData', JSON.stringify(orderData));

        const response = await fetch(`${backendUrl}/api/khalti/initiate`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "token": token
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log("Backend response:", data);

        if (data.payment_url) {
          // Redirect to Khalti payment page
          window.location.href = data.payment_url;
        } else {
          toast.error("Failed to initiate payment");
          navigate("/place-order");
        }
      } catch (error) {
        console.error("Error initiating payment:", error);
        toast.error("An error occurred while initiating payment");
        navigate("/place-order");
      }
    };

    initiatePayment();
  }, [amount, purpose, orderData, backendUrl, token, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Initiating payment with Khalti...</p>
      </div>
    </div>
  );
};

export default Khalti;
