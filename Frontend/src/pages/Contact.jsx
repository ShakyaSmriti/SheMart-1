import React, { useState } from "react";
import Title from "./../components/Title";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !email || !message) {
      toast.error("All fields are required!");
      return;
    }

    toast.success("Message sent successfully!");
    setName("");
    setEmail("");
    setMessage("");

    // Scroll to top to show toast clearly
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="pt-10 px-4 md:px-20">
      {/* Title Section */}
      <div className="text-center text-3xl mb-10">
        <Title text1="CONTACT" text2="US" />
      </div>

      {/* Contact Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      
        <div className="w-full">
          <img
            src={assets.contact_img}
            alt="Contact"
            className="w-full h-auto rounded-2xl shadow-lg object-cover"
          />
        </div>

        {/* Right side: Contact Info + Form */}
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Get In Touch</h2>
            <p className="text-gray-600 mb-4">
              We'd love to hear from you! Whether you have a question or just
              want to say hi.
            </p>
          </div>

          {/* Info */}
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-semibold">Address:</span> Kuleshwor,
              Kathmandu
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Phone:</span> +977 9865439201
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Email:</span>{" "}
              shakyasmriti368@gmail.com
            </p>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
            <textarea
              placeholder="Your Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              rows="5"
              required
            ></textarea>
            <button
              type="submit"
              className="bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition duration-300"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* Extra spacing at bottom */}
      <div className="h-20"></div>
    </div>
  );
};

export default Contact;
