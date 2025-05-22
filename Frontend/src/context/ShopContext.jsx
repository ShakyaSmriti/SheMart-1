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
  const [wishlistItems, setWishlistItems] = useState([]); // Wishlist items
  const [cartData, setCartData] = useState({}); // Cart data
  const [products, setProducts] = useState([]); // List of products
  const [token, setToken] = useState(localStorage.getItem("token") || ""); // User authentication token
  const [user, setUser] = useState(null); // User data
  const navigate = useNavigate();

  // Add this function to your ShopContext
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { token: token } : {};
  };

  // Then use it in all your API calls
  const fetchData = async (endpoint) => {
    try {
      const response = await axios.get(`${backendUrl}${endpoint}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      return null;
    }
  };

  // Add an item to the cart
  const addToCart = async (itemId, size, quantity = 1) => {
    // Check if user is logged in
    if (!token) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    // Ensure a size is selected
    if (!size) {
      toast.error("Select Product Size");
      return;
    }

    // Find the product by ID from local state
    const productData = products.find((product) => product._id === itemId);
    if (!productData) {
      toast.error("Product not found");
      return;
    }

    // Prepare local cartData
    let cartData = cartItems ? structuredClone(cartItems) : {};
    if (!cartData[itemId]) cartData[itemId] = {};

    // Update quantity locally
    cartData[itemId][size] = (cartData[itemId][size] || 0) + quantity;

    // Optionally track media type (image/video)
    if (!cartData[itemId].type) {
      cartData[itemId].type = productData.video ? "video" : "image";
    }

    // Update cart state optimistically
    setCartItems(cartData);
    console.log("Updated cart items:", cartData);

    // API call to update cart in backend
    try {
      if (!backendUrl) {
        console.error("Backend URL is not defined");
        return;
      }

      const response = await axios.post(
        `${backendUrl}/api/cart/add`,
        { itemId, size, quantity },
        { headers: { token } }
      );

      toast.success(response.data.message || "Item added to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to add item to cart.";
      toast.error(errorMessage);
    }
  };

  // Get the total count of items in the cart
  const getCartCount = () => {
    let count = 0;
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        if (size !== "type" && cartItems[itemId][size] > 0) {
          count += cartItems[itemId][size];
        }
      }
    }
    return count;
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

      // Show toast message when item is removed (quantity set to 0)
      if (quantity === 0) {
        toast.success("Product removed from cart", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // function to handleremove stock from cart
  const handleRemove = async (productId, size, quantity) => {
    // Restore quantity back to stock in backend
    try {
      await axios.post(
        `${backendUrl}/api/cart/restore-stock`,
        {
          productId,
          quantity,
        },
        {
          headers: { token },
        }
      );
      // toast.success("Stock restored successfully");
    } catch (err) {
      console.error("Stock restore failed:", err);
      toast.error("Failed to restore stock");
    }

    // Then update local & DB cart
    updateQuantity(productId, size, 0);
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
      const response = await axios.get(`${backendUrl}/api/product/all`);
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
        console.log("Cart data from server:", response.data.cartData);
        setCartItems(response.data.cartData || {});
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
    toast.error("Please login to add items to wishlist", {
      position: "top-right",
      autoClose: 3000,
    });
    navigate("/login");
    return { success: false };
  }

  const isInWishlist = wishlistItems.some(item => item._id === productId);

  // Find the full product data from catalog
  const productToAdd = products.find(p => p._id === productId);
  if (!productToAdd) {
    toast.error("Product not found", { autoClose: 3000 });
    return { success: false };
  }

  try {
    // Optimistic UI update
    if (isInWishlist) {
      setWishlistItems(prev => prev.filter(item => item._id !== productId));
    } else {
      // Add full product to wishlist
      setWishlistItems(prev => [...prev, productToAdd]);
    }

    // API Call
    const response = await axios.post(
      `${backendUrl}/api/wishlist/add`,
      { productId },
      { headers: { token } }
    );

    if (response.data.success) {
      toast.success(response.data.message, {
        position: "top-right",
        autoClose: 2000,
      });

      return response.data;
    } else {
      // Revert on failure
      if (isInWishlist) {
        setWishlistItems(prev => [...prev, productToAdd]);
      } else {
        setWishlistItems(prev => prev.filter(item => item._id !== productId));
      }

      toast.error(response.data.message || "Failed to update wishlist", {
        position: "top-right",
        autoClose: 3000,
      });

      return response.data;
    }
  } catch (error) {
    // Revert on error
    if (isInWishlist) {
      setWishlistItems(prev => [...prev, productToAdd]);
    } else {
      setWishlistItems(prev => prev.filter(item => item._id !== productId));
    }

    console.error("Error updating wishlist:", error);
    toast.error(error.response?.data?.message || "Failed to update wishlist", {
      position: "top-right",
      autoClose: 3000,
    });

    return { success: false, message: "Network or server error" };
  }
};

  // Fetch the user's wishlist data from the backend
  const getUserWishlist = async (token) => {
  try {
    if (!token) throw new Error("No authentication token provided");

    const response = await axios.get(`${backendUrl}/api/wishlist/get`, {
      headers: { token },
    });

    if (response.data.success) {
      const wishList = Array.isArray(response.data.wishList)
        ? response.data.wishList
        : [];

      setWishlistItems(wishList);
    } else {
      throw new Error(response.data.message || "Failed to fetch wishlist data");
    }
  } catch (error) {
    console.error("Error fetching wishlist:", error.response?.data || error.message);
    toast.error(error.response?.data?.message || "Error fetching wishlist data");
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

  // function manage stock levels
  const manageStock = async (productId, newQuantity, prevQuantity = 0) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/product/manage-stock`,
        { productId, newQuantity, prevQuantity },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error managing stock:", error);
      toast.error(error.response?.data?.message || "Failed to manage stock");
    }
  };

  // Initialize data when component mounts
  useEffect(() => {
    getProductsData();
    
    // Get token from localStorage
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Fetch user data when token changes
  useEffect(() => {
    if (token) {
      getUserCart(token);
      getUserWishlist(token);
      getUserData(token);
    }
  }, [token]);

  // Cancel an order
  const cancelOrder = async (orderId) => {
    if (!token) {
      toast.error("Please login to cancel orders", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/login");
      return { success: false };
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/order/cancel`,
        { orderId },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return { success: true };
      } else {
        toast.error(response.data.message || "Failed to cancel order", {
          position: "top-right",
          autoClose: 4000,
        });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(error.response?.data?.message || "Failed to cancel order", {
        position: "top-right",
        autoClose: 3000,
      });
      return { success: false, message: "Network or server error" };
    }
  };

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
    cancelOrder,
    handleRemove,
    manageStock,
    // Don't include getUserCart in the context value if it's causing issues
  };

  // Provide context value to child components
  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
