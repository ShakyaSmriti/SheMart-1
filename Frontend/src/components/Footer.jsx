import React from "react";
import { assets } from "../assets/assets";
import {
  FaInstagram,
  FaTiktok,
  FaFacebook,
  FaPinterest,
  FaSnapchat,
} from "react-icons/fa";

export default function Footer() {
  return (
    <div className="px-4 sm:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-14 my-10 mt-40 text-sm">
        {/* Brand and Links */}
        <div>
          <img src={assets.logo} className="mb-5 w-32" alt="SheMart Logo" />
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/about">About us</a>
            </li>
            <li>
              <a href="/orders">Delivery</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <p className="text-xl font-medium mb-5">Let's Hang</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>
              <a
                href="https://www.instagram.com/kyashasmituu/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <FaInstagram size={15} /> Instagram
              </a>
            </li>
            <li>
              <a
                href="https://www.tiktok.com/@smitushakya"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <FaTiktok size={15} /> TikTok
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/smriti.shakya.547"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <FaFacebook size={15} /> Facebook
              </a>
            </li>
            <li>
              <a
                href="https://www.pinterest.com/shakyasmriti368/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <FaPinterest size={15} /> Pinterest
              </a>
            </li>
            <li>
              <a
                href="https://web.snapchat.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <FaSnapchat size={15} /> Snapchat
              </a>
            </li>
          </ul>
        </div>

        {/* Location Map */}
        <div>
          <p className="text-xl font-medium mb-5">Find Us</p>
          <div className="w-full h-40 sm:h-48 rounded overflow-hidden">
            <iframe
              title="Our Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14131.338767309544!2d85.28172409659608!3d27.691503669158042!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1868199f2d47%3A0xf48b0ab8d867e77a!2sKuleshwor%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1736232932953!5m2!1sen!2snp"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div>
        <hr />
        <p className="py-5 text-sm text-center text-gray-800">
          &copy; {new Date().getFullYear()} SheMart. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
