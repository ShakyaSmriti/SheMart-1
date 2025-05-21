import React from "react";
import Title from "./../components/Title";
import { assets } from "../assets/assets";
import { FaCheckCircle, FaShoppingCart, FaHeadset } from "react-icons/fa"; // icons import

const About = () => {
  return (
    <div>
      {/* ABOUT US TITLE */}
      <div className="text-2xl text-center pt-8 border-t">
        <Title text1={"ABOUT"} text2={"US"} />
      </div>

      {/* ABOUT SECTION */}
      <div className="my-10 flex flex-col md:flex-row gap-16">
        <img
          className="w-full md:max-w-[350px]  shadow-md"
          src={assets.about_img}
          alt="About"
        />

        <div className="flex flex-col justify-center gap-4 md:w-2/4 text-gray-500">
          <p className="text-lg leading-relaxed">
            We are a dedicated team of innovators committed to crafting
            exceptional products that positively influence our customers' lives.
            Our passion for quality and design drives us to constantly explore
            new ideas and push the boundaries of what's possible. We believe in
            the power of creativity, and every product we offer is a reflection
            of our commitment to excellence.
          </p>
          <p className="text-lg leading-relaxed">
            Since our founding, we've built a carefully curated collection of
            top-tier products that cater to a wide range of tastes and
            preferences. From the latest fashion trends to cutting-edge
            technology, and from beauty essentials to home décor, we strive to
            offer something for everyone. All of our products are sourced from
            trusted brands, ensuring you receive the best quality.
          </p>
          
          <b className="text-gray-800 text-xl">Our Mission</b>
          <p className="text-lg leading-relaxed">
            At SheMart, our mission is to empower you with an unparalleled
            shopping experience. We believe that shopping should be convenient,
            enjoyable, and stress-free. From browsing our vast selection to
            receiving your order at your doorstep, we're here to make sure you
            always have the confidence to make the best choices.
          </p>
        </div>
      </div>

      {/* WHY CHOOSE US TITLE */}
      <div className="text-2xl py-8">
        <Title text1={"WHY"} text2={"CHOOSE US"} />
      </div>

      {/* WHY CHOOSE US SECTION */}
      <div className="flex flex-col md:flex-row text-sm mb-20 gap-5">
        {/* Quality Assurance */}
        <div className="border px-10 md:px-16 py-10 flex flex-col gap-5 rounded-lg shadow-sm items-center text-center">
          <FaCheckCircle size={40} className="text-green-800" />
          <b className="text-lg text-gray-800">Quality Assurance</b>
          <p className="text-gray-600 text-base leading-relaxed">
            We meticulously select and vet each product to ensure it meets our
            stringent quality standards.
          </p>
        </div>

        {/* Convenience */}
        <div className="border px-10 md:px-16 py-10 flex flex-col gap-5 rounded-lg shadow-sm items-center text-center">
          <FaShoppingCart size={40} className="text-blue-500" />
          <b className="text-lg text-gray-800">Convenience</b>
          <p className="text-gray-600 text-base leading-relaxed">
            With our user-friendly interface and hassle-free ordering process,
            shopping has never been easier or more accessible.
          </p>
        </div>

        {/* Exceptional Customer Service */}
        <div className="border px-10 md:px-16 py-10 flex flex-col gap-5 rounded-lg shadow-sm items-center text-center">
          <FaHeadset size={40} className="text-purple-500" />
          <b className="text-lg text-gray-800">Exceptional Customer Service</b>
          <p className="text-gray-600 text-base leading-relaxed">
            Our team of dedicated professionals is always ready to assist you,
            ensuring that your satisfaction remains our top priority.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
