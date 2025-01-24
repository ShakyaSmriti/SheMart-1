import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

export default function ProductItem({
  id,
  name,
  price,
  image = [],
  video = [],
}) {
  const { currency } = useContext(ShopContext);

  // Extract the first video and image URLs, with fallbacks
  const videoSrc = Array.isArray(video) && video.length > 0 ? video[0] : null;
  const imageSrc =
    Array.isArray(image) && image.length > 0
      ? image[0]
      : "default-placeholder-image.jpg";

  return (
    <Link className="text-gray-70 cursor-pointer" to={`/product/${id}`}>
      <div className="overflow-hidden">
        {videoSrc ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="product-media" // Ensure video maintains aspect ratio
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            // Consistent aspect ratio for images
            src={imageSrc}
            alt={name || "Product"}
            className="product-media"
          />
        )}
      </div>
      <p className="pt-3 pb-1 text-sm">{name}</p>
      <p className="text-sm font-medium">
        {currency}
        {price}
      </p>
    </Link>
  );
}
