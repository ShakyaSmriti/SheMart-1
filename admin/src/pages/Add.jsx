import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null); // State for video URL
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("Tops");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!name || !description || !price || !category) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const formData = new FormData();
      if (image) formData.append("image", image);
      if (video) formData.append("video", video);

      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));

      const response = await axios.post(
        `${backendUrl}/api/product/add`,
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Reset form fields
        setImage(null);
        setVideo(null);
        setVideoUrl(null); // Reset video URL
        setName("");
        setDescription("");
        setPrice("");
        setCategory("");
        setSubCategory("");
        setBestseller(false);
        setSizes([]);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log("Error adding product:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Effect to create video URL when video changes
  useEffect(() => {
    if (video) {
      const url = URL.createObjectURL(video);
      setVideoUrl(url);

      // Cleanup function to revoke the object URL
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [video]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full items-start gap-3"
    >
      <h2 className="text-lg font">Add Product</h2>
      <div>
        <h3 className="font-700 text-lg mb-2">Upload Image</h3>
        <div>
          <label htmlFor="image">
            <img
              className="w-20"
              src={!image ? assets.upload_area : URL.createObjectURL(image)}
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
      </div>

      <div>
        <p className="mb-2">Upload Videos</p>
        <div>
          <label htmlFor="video">
            {videoUrl ? (
              <video className="w-20" src={videoUrl} />
            ) : (
              <img
                className="w-20"
                src={assets.upload_area}
                alt="Upload Icon"
              />
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
      </div>

      <div className="w-full">
        <p className="mb-2">Product Name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          placeholder="Type here"
          required
        />
      </div>

      <div className="w-full">
        <p className="mb-2">Product Description</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className="w-full max-w-[500px] px-3 py-2"
          placeholder="Write content here"
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">Product Category</p>
          <select
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2"
            required
          >
            <option value="">Select Category</option>
            <option value="Clothing">Clothing</option>
            <option value="Footwear">Footwear</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Sub category</p>
          <select
            onChange={(e) => setSubCategory(e.target.value)}
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
            placeholder="25"
            required
          />
        </div>

        <div>
          <p className="mb-2">Product Stock</p>
          <input
            onChange={(e) => setStock(e.target.value)}
            value={stock}
            className="w-full sm:w-[120px] px-3 py-2"
            type="number"
            placeholder="5"
            required
          />
        </div>
      </div>

      <div>
        <p className="mb-2">Product Sizes</p>
        <div className="flex gap-3">
          {["S", "M", "L", "XL", "XXL"].map((size) => (
            <div
              key={size}
              onClick={() =>
                setSizes((prev) =>
                  prev.includes(size)
                    ? prev.filter((item) => item !== size)
                    : [...prev, size]
                )
              }
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

      <div className="flex gap-2 mt-2">
        <input
          onChange={() => setBestseller((prev) => !prev)}
          checked={bestseller}
          type="checkbox"
          id="bestseller"
        />
        <label className="cursor-pointer" htmlFor="bestseller">
          Add to bestseller
        </label>
      </div>

      <button type="submit" className="w-28 py-3 mt-4 bg-black text-white">
        ADD
      </button>
    </form>
  );
};

export default Add;
