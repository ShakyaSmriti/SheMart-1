import React from "react";
import { assets } from "../assets/assets";

export default function OurPolicy() {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-8 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700 px-4 sm:px-10">
      {/* Each policy item gets equal width and spacing */}
      <div className="flex-1 px-4">
        <img src={assets.exchange_icon} className="w-12 m-auto mb-5" alt="" />
        <p className="font-semibold">Exchange Policy</p>
        <p className="text-gray-500">
          Exchange is only available for size issues. No other exchanges allowed.
        </p>
      </div>

      <div className="flex-1 px-4">
        <img src={assets.quality_icon} className="w-12 m-auto mb-5" alt="" />
        <p className="font-semibold">Limited Return Policy</p>
        <p className="text-gray-500">
          Returns are accepted only today and tomorrow. However, if we made a mistake like sending the wrong size or damaged item, returns will be accepted.
        </p>
      </div>

      <div className="flex-1 px-4">
        <img src={assets.support_img} className="w-12 m-auto mb-5" alt="" />
        <p className="font-semibold">Best Customer Support</p>
        <p className="text-gray-500">We provide 24/7 customer support</p>
      </div>
    </div>
  );
}
