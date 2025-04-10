import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "Rs.";
  const delivery_fee = 10;
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4001";

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [wishlistItems, setWishlistItems] = useState({});
  const [cartData, setCartData] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const navigate = useNavigate();

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

    // Call API to add item to cart
    if (token) {
      if (!backendUrl) {
        console.error("Backend URL is not defined");
        return;
      }

      try {
        const response = await axios.post(
          `${backendUrl}/api/cart/add`,
          { itemId, size },
          { headers: { token } }
        );

        // Show success message from backend
        toast.success(response.data.message);
      } catch (error) {
        console.error("Error adding to cart:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to add item to cart.";
        toast.error(errorMessage);
      }
    }
  };

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

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);

    //adding update api
    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/update",
          { itemId, size, quantity },
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

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

  const getProductsData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
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

  const getUserCart = async (token) => {
    // console.log(token);
    try {
      if (!token) {
        throw new Error("No authentication token provided");
      }

      const response = await axios.post(
        `${backendUrl}/api/cart/get`, // Ensure proper URL formatting
        {},
        {
          headers: { token }, // Use Authorization header
        }
      );

      console.log(response.data.cartData); // Log the cart data

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

    let wishlistData = wishlistItems ? structuredClone(wishlistItems) : {};

    if (!wishlistData[productId]) {
      wishlistData[productId] = {
        type: productData.video ? "video" : "image",
        addedAt: new Date().toISOString(), // Optional metadata
      };
    }

    setWishlistItems(wishlistData);

    if (!backendUrl) {
      console.error("Backend URL is not defined");
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/wishlist/add`,
        { productId },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);

        // Toggle wishlist items
        setWishlistItems((prev) => {
          const updatedWishlist = { ...prev };
          if (updatedWishlist[productId]) {
            delete updatedWishlist[productId];
          } else {
            updatedWishlist[productId] = {
              type: productData.video ? "video" : "image",
              addedAt: new Date().toISOString(),
            };
          }
          return updatedWishlist;
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error(error.response?.data?.message || "Failed to add to wishlist");
    }
  };

  const getUserWishlist = async (token) => {
    try {
      if (!token) {
        throw new Error("No authentication token provided");
      }

      const response = await axios.get(`${backendUrl}/api/wishlist/get`, {
        headers: { token },
      });

      if (response.data.success) {
        setWishlistItems(response.data.wishlistData);
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

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken && !token) {
      setToken(savedToken);
      getUserCart(savedToken); // already in your code
      getUserWishlist(savedToken); // ADD THIS line
    }
  }, []);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setCartData,
    setShowSearch,
    cartItems,
    cartData,
    setCartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    wishlistItems,
    setWishlistItems,
    setToken,
    token,
    addToWishlist,
    getUserWishlist,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
