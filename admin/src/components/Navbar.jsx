import React from "react";
import { assets } from "../assets/assets";

const Navbar = ({ setToken }) => {
  return (
    <div className="flex items-center py-2 px-[4%] justify-between sticky top-0 z-50 bg-white">
      <img className="w-[max(10%,80px)]" src={assets.logo} alt="Logo" />

      <button
        onClick={() => setToken("")} // Clear the token properly
        className="bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
