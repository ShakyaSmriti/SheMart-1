import React from "react";

export default function NewsletterBox() {
  return (
    <div className="text-center">
      <p className="text-2xl fonnt-medium text-gray-800">Message to a Owner</p>
      <form className="w-full sm:w-1/2 flex items-center gap-3 m-auto my-6 border pl-3">
        <input
          className="w-full sm:flex-1 outline-none "
          type="text"
          placeholder="Enter your message"
        ></input>
        <button
          type="submit"
          className="bg-black text-white text-xs px-10 py-4"
        >
          SEND
        </button>
      </form>
    </div>
  );
}
