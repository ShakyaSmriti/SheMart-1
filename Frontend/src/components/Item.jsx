// Fix the wishlist heart icon in the Item component
import React, { useContext, useEffect, useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { ShopContext } from '../context/ShopContext';

const Item = (props) => {
  const { wishlistItems, addToWishlist } = useContext(ShopContext);
  const [isInWishlist, setIsInWishlist] = useState(false);
  
  // Check if item is in wishlist whenever wishlistItems changes
  useEffect(() => {
    if (Array.isArray(wishlistItems)) {
      const found = wishlistItems.some(item => item._id === props.id);
      setIsInWishlist(found);
    }
  }, [wishlistItems, props.id]);

  return (
    <div className="relative">
      {/* Your existing item content */}
      
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          addToWishlist(props.id);
        }}
        className="absolute top-2 right-2 z-10"
      >
        {isInWishlist ? (
          <FaHeart className="text-red-500 text-xl" />
        ) : (
          <FaRegHeart className="text-gray-700 text-xl" />
        )}
      </button>
      
      {/* Rest of your component */}
    </div>
  );
};

export default Item;

