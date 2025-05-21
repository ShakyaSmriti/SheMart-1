import React, { useContext, useEffect, useState } from "react";
import { assets, products } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import { Heart } from "lucide-react";

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [bestSeller, setBestSeller] = useState(false);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relevant");

  // BestSeller
  const toggleBestsellerCategory = (e) => {
    setBestSeller((prev) => !prev);
  };

  // Type-> winter ,bottom, top
  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setSubCategory((prev) => [...prev, e.target.value]);
    }
  };

  const applyFilterCategory = () => {
    let productsCopy = products.slice();

    // Apply search filter if applicable
    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply subcategory and bestseller filters
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        subCategory.includes(item.subCategory)
      );
    }

    // Apply bestseller filter
    if (bestSeller) {
      productsCopy = productsCopy.filter(
        (item) => item.bestseller === bestSeller
      );
    }

    // Update the filtered products
    setFilterProducts(productsCopy);
  };

  const sortProduct = (sortType) => {
    let fpCopy = filterProducts.slice();

    switch (sortType) {
      case "low-high":
        setFilterProducts(fpCopy.sort((a, b) => a.price - b.price));
        break;

      case "high-low":
        setFilterProducts(fpCopy.sort((a, b) => b.price - a.price));
        break;

      default:
        applyFilterCategory();
        break;
    }
  };

  useEffect(() => {
    setFilterProducts(products);
  }, [products]);

  useEffect(() => {
    // console.log("filter applied");
    applyFilterCategory();
  }, [bestSeller, subCategory, search, showSearch, products]);

  useEffect(() => {
    sortProduct(sortType);
  }, [sortType]);

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-1 scroll-smooth">
      {/* Filter Options */}
      <div className="min-w-60">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="my-2 text-xl flex items-center cursor-pointer gap-2"
        >
          FILTERS
          <img
            className={`h-3 sm:hidden ${showFilter ? "rotate-90" : ""}`}
            src={assets.dropdown_icon}
            alt=""
          />
        </p>
        {/* Category filter */}
        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${
            showFilter ? " " : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">BESTSELLER</p>
          <div className=" flex flex-col gap-2 text-sm font-light text-gray-700">
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"bestseller"}
                onChange={toggleBestsellerCategory}
              />
              Bestseller
            </p>
          </div>
        </div>

        {/* SubCategory Filter */}
        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${
            showFilter ? " " : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">Clothing</p>
          <div className=" flex flex-col gap-2 text-sm font-light text-gray-700">
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Tops"}
                onChange={toggleSubCategory}
              />
              Tops
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Pants"}
                onChange={toggleSubCategory}
              />
              Pants
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Dress"}
                onChange={toggleSubCategory}
              />
              Dress
            </p>
          </div>
        </div>

        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${
            showFilter ? " " : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">Footwear</p>
          <div className=" flex flex-col gap-2 text-sm font-light text-gray-700">
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Stiletto"}
                onChange={toggleSubCategory}
              />
              Stiletto
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Kitten"}
                onChange={toggleSubCategory}
              />
              Kitten Heels
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Platform"}
                onChange={toggleSubCategory}
              />
              Platform Heels
            </p>
          </div>
        </div>

        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${
            showFilter ? " " : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">Accessories</p>
          <div className=" flex flex-col gap-2 text-sm font-light text-gray-700">
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Studs"}
                onChange={toggleSubCategory}
              />
              Studs Earrings
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Hoops"}
                onChange={toggleSubCategory}
              />
              Hoops Earrings
            </p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1">
        <div className="flex justify-between text-base sm:text-2xl mb-4">
          <Title text1={"All"} text2={"COLLECTIONS"} />
          {/* Product Sort */}
          <select
            onChange={(e) => setSortType(e.target.value)}
            className="border-2 border-gray-300 text-sm px-2"
          >
            <option value="relevant">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

        {/* Map Products */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
          {filterProducts.map((item, index) => (
            <div key={index} className="relative">
              <ProductItem
                name={item.name}
                id={item._id}
                price={item.price}
                image={item.image}
                video={item.video}
              />
              {/* Heart Icon Positioned at the Top Right */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
