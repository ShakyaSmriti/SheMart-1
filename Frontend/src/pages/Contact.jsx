import React from "react";
import Title from "./../components/Title";
import { assets } from "../assets/assets";

const Contact = () => {
  return (
    <div>
      {/* Title Section */}
      <div className="text-center text-2xl pt-10 border-t">
        <Title text1={"CONTACT"} text2={"US"} />
      </div>

      {/* Contact Content Section */}
      <div className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-28">
        {/* Contact Image */}
        <img
          className="w-full md:max-w-[480px] h-auto"
          src={assets.contact_img}
          alt="Contact us image"
        />

        {/* Contact Information */}
        <div className="flex flex-col justify-center items-start gap-4 max-w-[350px] self-center">
          <p className="font-semibold text-xl text-gray-600">Our Store</p>
          <p className="text-gray-500">
            <br /> kuleshwor
          </p>
          <p>
            Tel: 9865439201 <br /> Email: shakyasmriti368@gmail.com
          </p>

          <p>Kathmandu</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
