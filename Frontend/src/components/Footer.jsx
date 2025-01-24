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
    <div>
      <div className="flex flex-col sm:grid grid-cols-[1.5fr_1.5fr_1.5fr_1.5fr] gap-14 my-10 mt-40 text-sm">
        <div>
          <img src={assets.logo} className="mb-5 w-32" alt="" />
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

        <div>
          <p className="text-xl font-medium mb-5">Let's Hang</p>
          <ul className="flex flex-col gap-1 text-gray-600">
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

        <div>
          <p className="text-xl font-medium mb-5">Need Help?</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>Buy a Gift Card</li>
            <li>A Help Center</li>
            <li>Delivery & Returns</li>
            <li>SIze Guide</li>
            <li>FAQs</li>
          </ul>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">Find Us</p>
          <iframe
            title="Our Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14131.338767309544!2d85.28172409659608!3d27.691503669158042!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1868199f2d47%3A0xf48b0ab8d867e77a!2sKuleshwor%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1736232932953!5m2!1sen!2snp"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>

      <div>
        <hr />
        <p className="py-5 text-sm text-center">
          &copy; 2024 SheMart. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
