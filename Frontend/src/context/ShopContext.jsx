import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Create a context for the shop
export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  // Initialize variables and states
  const currency = "Rs."; // Currency symbol
  const delivery_fee = 100; // Delivery fee
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4001"; // Backend URL

  const [search, setSearch] = useState(""); // Search term
  const [showSearch, setShowSearch] = useState(false); // Boolean to toggle search visibility
  const [cartItems, setCartItems] = useState({}); // Cart items
  const [wishlistItems, setWishlistItems] = useState({}); // Wishlist items
  const [cartData, setCartData] = useState({}); // Cart data
  const [products, setProducts] = useState([]); // List of products
  const [token, setToken] = useState(""); // User authentication token
  const [user, setUser] = useState(null); // User data
  const navigate = useNavigate();

  // Add an item to the cart
  const addToCart = async (itemId, size) => {
    if (!token) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    if (!size) {
      toast.error("Select Product Size");
      return;
    }

    const productData = products.find((product) => product._id === itemId);
    if (!productData) {
      toast.error("Product not found");
      return;
    }

    let cartData = cartItems ? structuredClone(cartItems) : {};

    if (!cartData[itemId]) {
      cartData[itemId] = {};
    }

    cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;

    if (!cartData[itemId].type) {
      cartData[itemId].type = productData.video ? "video" : "image";
    }

    setCartItems(cartData);

    try {
      const response = await axios.post(
        `${backendUrl}/api/cart/add`,
        { itemId, size },
        { headers: { token } }
      );
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error adding to cart:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to add item to cart.";
      toast.error(errorMessage);
    }
  };

  // Get the total count of items in the cart
  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {}
      }
    }
    return totalCount;
  };

  // Update the quantity of an item in the cart
  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);

    try {
      await axios.post(
        `${backendUrl}/api/cart/update`,
        { itemId, size, quantity },
        { headers: { token } }
      );
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Get the total amount of items in the cart
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) {}
      }
    }
    return totalAmount;
  };

  // Fetch the list of products from the backend
  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Fetch the user's cart data from the backend
  const getUserCart = async (token) => {
    try {
      if (!token) throw new Error("No authentication token provided");

      const response = await axios.post(
        `${backendUrl}/api/cart/get`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        setCartItems(response.data.cartData);
      } else {
        throw new Error(response.data.message || "Failed to fetch cart data");
      }
    } catch (error) {
      console.error(
        "Error fetching cart:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.message || "Error fetching cart data");
    }
  };

  // Add an item to the wishlist
  const addToWishlist = async (productId) => {
    if (!token) {
      toast.error("Please login to add items to wishlist");
      navigate("/login");
      return;
    }

    const productData = products.find((product) => product._id === productId);
    if (!productData) {
      toast.error("Product not found");
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/wishlist/add`,
        { productId },
        { headers: { token } }
      );

      console.log(`data`, response.data);
      // setWishlistItems(response.data.wishList);

      if (response.data.success) {
        toast.success(response.data.message, {
          autoClose: 500, // closes after 2 seconds
          onClose: () => {
            window.location.reload();
          },
        });
      } else {
        toast.error(response.data.message, {
          autoClose: 500,
        });
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error(error.response?.data?.message || "Failed to add to wishlist");
    }
  };

  // Fetch the user's wishlist data from the backend
  const getUserWishlist = async (token) => {
    try {
      if (!token) {
        throw new Error("No authentication token provided");
      }

      const response = await axios.get(`${backendUrl}/api/wishlist/get`, {
        headers: { token },
      });

      // console.log(response.data);

      if (response.data.success) {
        setWishlistItems(response.data.wishList);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch wishlist data"
        );
      }
    } catch (error) {
      console.error(
        "Error fetching wishlist:",
        error.response?.data || error.message
      );
      toast.error(
        error.response?.data?.message || "Error fetching wishlist data"
      );
    }
  };

  // Fetch the user's profile data from the backend
  const getUserData = async (token) => {
    try {
      if (!token) throw new Error("No authentication token provided");

      const response = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: { token },
      });

      if (response.data.success) {
        setUser(response.data.user);
      } else {
        throw new Error(response.data.message || "Failed to fetch user data");
      }
    } catch (error) {
      console.error(
        "Error fetching user data:",
        error.response?.data || error.message
      );
      toast.error(
        error.response?.data?.message || "Error fetching user profile"
      );
    }
  };

  // Fetch the user's wishlist data when the token changes
  useEffect(() => {
    if (token) {
      getUserWishlist(token);
    } else {
      // Optional: Handle case where token is not available
      console.warn("No authentication token available.");
    }
  }, [token]);

  // Initialize data from local storage if token exists
  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken && !token) {
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      getUserCart(token);
      getUserWishlist(token);
      getUserData(token);
    }
  }, [token]);

  // Context value to provide throughout the app
  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    cartData,
    setCartData,
    setCartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    wishlistItems,
    setWishlistItems,
    token,
    setToken,
    user,
    setUser,
    addToWishlist,
    getUserWishlist,
  };

  // Provide context value to child components
  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
