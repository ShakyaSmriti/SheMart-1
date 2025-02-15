import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, cartItems, setCartData } =
    useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [media, setMedia] = useState(""); // Updated to handle both image and video
  const [size, setSize] = useState("");

  const fetchProductData = () => {
    const foundProduct = products.find((item) => item._id === productId);

    if (foundProduct) {
      setProductData(foundProduct);

      // Check for image or video and set the appropriate media
      if (foundProduct.image && foundProduct.image.length > 0) {
        setMedia(foundProduct.image[0]); // Set the first image
      } else if (foundProduct.video && foundProduct.video.length > 0) {
        setMedia(foundProduct.video[0]); // Set the first video
      }
    } else {
      console.error("Product not found for productId:", productId);
    }
  };

  useEffect(() => {
    const tempData = [];
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (item !== "type" && cartItems[items][item] > 0) {
          tempData.push({
            _id: items,
            size: item,
            quantity: cartItems[items][item],
            type: cartItems[items].type || "image", // Default to image if type is missing
          });
        }
      }
    }
    setCartData(tempData);
  }, [cartItems]);

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* Product Data */}
      <div className="flex gap-12 flex-col sm:flex-row">
        {/* Product Media */}
        <div className="flex-1 flex flex-col-reverse sm:flex-row gap-3">
          {/* Thumbnail List */}
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-auto sm:justify-start gap-2">
            {productData.image &&
              productData.image.length > 0 &&
              productData.image.map((item, index) => (
                <img
                  onClick={() => setMedia(item)}
                  src={item.image}
                  key={index}
                  className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer "
                />
              ))}
            {productData.video &&
              productData.video.length > 0 &&
              productData.video.map((item, index) => (
                <img
                  onClick={() => setMedia(item)}
                  src={assets.videoThumbnail} // Replace with your custom thumbnail logic
                  key={index}
                  className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                />
              ))}
          </div>

          {/* Main Media */}
          <div className="w-full sm:w-[80%]">
            {productData.image && productData.image.length > 0 ? (
              <img
                className="w-full h-auto aspect-[1/1] object-contain"
                src={media}
                alt="Main Product"
              />
            ) : productData.video && productData.video.length > 0 ? (
              <video
                className="w-full aspect-[1/1] object-contain"
                src={media}
                autoPlay
                loop
                muted
              />
            ) : null}
          </div>
        </div>

        {/* ------ Product Info ------- */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <div className="flex items-center gap-1 mt-2">
            <img src={assets.star_icon} alt="Star" className="w-3.5" />
            <img src={assets.star_icon} alt="Star" className="w-3.5" />
            <img src={assets.star_icon} alt="Star" className="w-3.5" />
            <img src={assets.star_icon} alt="Star" className="w-3.5" />
            <img src={assets.star_dull_icon} alt="Star" className="w-3.5" />
            <p className="pl-2">(123)</p>
          </div>
          <p>
            {currency} {productData.price}
          </p>
          <p className="mt-5 text-gray-500 md:w-4/5">
            {productData.description}
          </p>
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.sizes.map((item, index) => (
                <button
                  onClick={() => setSize(item)}
                  className={`border py-2 px-4 bg-gray-100 ${
                    item === size ? "border-orange-500" : ""
                  }`}
                  key={index}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              if (media.endsWith(".mp4")) {
                addToCart(productData._id, size, "video");
              } else {
                addToCart(productData._id, size, "image");
              }
            }}
            className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
          >
            ADD TO CART
          </button>

          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original Product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* -----Description and review Section-------- */}
      <div className="mt-20">
        <div className="flex">
          <b className="border px-5 py-3 text-sm">Description</b>
          <p className="border px-5 py-3 text-sm">Reviews (123)</p>
        </div>

        <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
          <p>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Facilis
            veniam earum vel magnam cum pariatur consequatur repellat quidem
            recusandae, eaque commodi. Necessitatibus cupiditate culpa quis.
            Tempora ab aut quis earum!
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Amet,
            ratione dolorum officiis molestiae nihil natus necessitatibus
            quisquam quo sint porro hic soluta iure itaque unde tenetur
            obcaecati quod eum quas.
          </p>
        </div>
      </div>

      {/* ----------Display related products---------- */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
        currentProductId={productId} // Pass the current product ID here
      />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
