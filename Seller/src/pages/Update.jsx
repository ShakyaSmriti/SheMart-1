import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const Update = ({ token, product }) => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);

  const { id } = useParams();

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price);
      setStock(product.stock);
      setCategory(product.category);
      setSubCategory(product.subCategory || "Tops");
      setBestseller(product.bestseller);
      setSizes(product.sizes || []);
      if (product.image) setImage(product.image);
      if (product.video) {
        setVideo(product.video);
        setVideoUrl(product.video);
      }
    }
  }, [product]);

  useEffect(() => {
    if (video) {
      const url = URL.createObjectURL(video);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [video]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      if (image && image !== product?.image) formData.append("image", image);
      if (video && video !== product?.video) formData.append("video", video);

      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("stock", stock);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify([...sizes]));

      const response = await axios.put(
        `${backendUrl}/api/product/update/${id}`,
        formData,
        { headers: { token } }
      );

      response.data.success
        ? toast.success(response.data.message)
        : toast.error(response.data.message);
      // Reset form fields
      setImage(null);
      setVideo(null);
      setVideoUrl(null); // Reset video URL
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setCategory("");
      setSubCategory("");
      setBestseller(false);
      setSizes([]);

      navigate("/list"); // Use navigate instead of Navigate
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full gap-3">
      <h2 className="text-lg font">Update Product</h2>

      {/* Image Upload */}
      <div>
        <h3 className="mb-2">Upload Image</h3>
        <label htmlFor="image">
          <img
            className="w-20"
            src={
              image instanceof File
                ? URL.createObjectURL(image)
                : image || assets.upload_area
            }
            alt="Upload"
          />
          <input
            onChange={(e) => setImage(e.target.files[0])}
            type="file"
            id="image"
            hidden
          />
        </label>
      </div>

      {/* Video Upload */}
      <div>
        <p className="mb-2">Upload Video</p>
        <label htmlFor="video">
          {videoUrl ? (
            <video className="w-20" src={videoUrl} controls />
          ) : (
            <img className="w-20" src={assets.upload_area} alt="Upload Icon" />
          )}
        </label>
        <input
          onChange={(e) => setVideo(e.target.files[0])}
          type="file"
          id="video"
          accept="video/*"
          hidden
        />
      </div>

      {/* Product Name */}
      <div className="w-full">
        <p className="mb-2">Product Name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
        />
      </div>

      {/* Product Description */}
      <div className="w-full">
        <p className="mb-2">Product Description</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className="w-full max-w-[500px] px-3 py-2"
        />
      </div>

      {/* Category, Subcategory & Price */}
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">Product Category</p>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className="w-full px-3 py-2"
          >
            <option value="">Select Category</option>
            <option value="Clothing">Clothing</option>
            <option value="Footwear">Footwear</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Sub Category</p>
          <select
            onChange={(e) => setSubCategory(e.target.value)}
            value={subCategory}
            className="w-full px-3 py-2"
          >
            <option value="Tops">Tops</option>
            <option value="Pants">Pants</option>
            <option value="Dress">Dress</option>
            <option value="Stiletto">Stiletto</option>
            <option value="Kitten">Kitten</option>
            <option value="Platform">Platform</option>
            <option value="Studs">Studs</option>
            <option value="Hoops">Hoops</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Product Price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full sm:w-[120px] px-3 py-2"
            type="number"
          />
        </div>

        <div>
          <p className="mb-2">Product Stock</p>
          <input
            onChange={(e) => setStock(e.target.value)}
            value={stock}
            className="w-full sm:w-[120px] px-3 py-2"
            type="number"
          />
        </div>
      </div>

      {/* Product Sizes */}
      <div>
        <p className="mb-2">Product Sizes</p>
        <div className="flex gap-3">
          {["S", "M", "L", "XL", "XXL"].map((size) => (
            <div
              key={size}
              onClick={() => {
                setSizes((prev) => {
                  // Check if the size is already selected
                  const exists = prev.includes(size);

                  if (exists) {
                    // Remove the size if already selected
                    return prev.filter((item) => item !== size);
                  } else {
                    // Add the size if it's not selected
                    return [...prev, size];
                  }
                });

                // Call the API to update the size count in the database
                size;
              }}
            >
              <p
                className={`${
                  sizes.includes(size) ? "bg-pink-100" : "bg-slate-200"
                } px-3 py-1 cursor-pointer`}
              >
                {size}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bestseller Checkbox */}
      <div className="flex gap-2 mt-2">
        <input
          onChange={() => setBestseller((prev) => !prev)}
          checked={bestseller}
          type="checkbox"
          id="bestseller"
        />
        <label className="cursor-pointer" htmlFor="bestseller">
          Add to Bestseller
        </label>
      </div>

      {/* Submit Button */}
      <button type="submit" className="w-28 py-3 mt-4 bg-black text-white">
        UPDATE
      </button>
    </form>
  );
};

export default Update;
