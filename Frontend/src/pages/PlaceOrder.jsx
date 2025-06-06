import React, { useContext, useState, useEffect } from "react";
import Title from "./../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import axios from "axios";

const PlaceOrder = () => {
  const [method, setMethod] = useState("");
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
    user, // Access user from context if available
    manageStock, // Make sure manageStock is included in the context
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    phone: "",
  });

  // Auto-fill form with user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // If user is already in context, use that data
        if (user) {
          setFormData({
            firstName: user.name?.split(' ')[0] || "",
            lastName: user.name?.split(' ')[1] || "",
            email: user.email || "",
            address: user.address || "",
            phone: user.phone || "",
          });
          return;
        }
        
        // Otherwise fetch user data from API
        if (token) {
          const response = await axios.get(`${backendUrl}/api/user/profile`, {
            headers: { token }
          });
          
          if (response.data.success) {
            const userData = response.data.user;
            setFormData({
              firstName: userData.name?.split(' ')[0] || "",
              lastName: userData.name?.split(' ')[1] || "",
              email: userData.email || "",
              address: userData.address || "",
              phone: userData.phone || "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    fetchUserData();
  }, []);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!method) {
      toast.error("Please select a payment method.");
      return;
    }

    if (Object.keys(cartItems).length === 0) {
      toast.error("Your cart is empty. Please add items to your cart.");
      return;
    }

    try {
      let orderItems = [];
      // Process cart items and update stock
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(
              products.find((product) => product._id === items)
            );
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
              
              // Update stock for each item when order is placed
              if (typeof manageStock === "function") {
                await manageStock(items, cartItems[items][item]);
              }
            }
          }
        }
      }

      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
      };

      switch (method) {
        case "khalti":
          // Redirect to Khalti payment page with order data
          const amount = getCartAmount() + delivery_fee;
          navigate("/khalti", { 
            state: { 
              amount: amount,
              purpose: "SheMart",
              orderData: orderData
            } 
          });
          break;
        
        case "cod":
          const response = await axios.post(
            backendUrl + "/api/order/place",
            orderData,
            { headers: { token } }
          );
          toast.success(response.data.message);
          setCartItems({});

          if (response.data.success) {
            setCartItems({});
            navigate("/orders");
          } else {
            toast.error(response.data.message);
          }
          break;

        default:
          toast.error("Selected payment method is not supported yet.");
          break;
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(error.message);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t"
    >
      {/* ------------Left Side--------- */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>

        <div className="flex gap-3">
          <input
            onChange={onChangeHandler}
            name="firstName"
            value={formData.firstName}
            className="border border-gray rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="First name"
            required
          />
          <input
            onChange={onChangeHandler}
            name="lastName"
            value={formData.lastName}
            className="border border-gray rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Last name"
            required
          />
        </div>
        <input
          onChange={onChangeHandler}
          name="email"
          value={formData.email}
          className="border border-gray rounded py-1.5 px-3.5 w-full"
          type="email"
          placeholder="Email address"
          required
        />
        <input
          onChange={onChangeHandler}
          name="address"
          value={formData.address}
          className="border border-gray rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="Address"
          required
        />
        <input
          onChange={onChangeHandler}
          name="phone"
          value={formData.phone}
          className="border border-gray rounded py-1.5 px-3.5 w-full"
          type="number"
          placeholder="Phone"
          required
        />
      </div>

      {/* ----------Right Side-------- */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>

        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />

          <div className="flex gap-3 flex-col lg:flex-row">
            {/* Khalti Option */}
            <div
              onClick={() => setMethod("khalti")}
              className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${
                method === "khalti" ? "border-green-400" : "border-gray-300"
              }`}
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "khalti" ? "bg-green-400" : ""
                }`}
              ></p>
              <img
                className="h-10 w-10 mx-4"
                src={assets.khalti_logo}
                alt="Khalti"
              />
            </div>

            {/* COD Option */}
            <div
              onClick={() => setMethod("cod")}
              className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${
                method === "cod" ? "border-green-400" : "border-gray-300"
              }`}
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "cod" ? "bg-green-400" : ""
                }`}
              ></p>
              <p className="text-gray-500 text-sm font-medium mx-4">
                CASH ON DELIVERY
              </p>
            </div>
          </div>

          {/* Display Selected Payment Method */}
          <p className="mt-4 text-gray-600 text-sm">
            Selected Payment Method:{" "}
            <span className="font-medium text-black">
              {method ? method.toUpperCase() : "None"}
            </span>
          </p>

          <div className="w-full text-end mt-8">
            <button
              type="submit"
              className="bg-black text-white px-16 py-3 text-sm"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
