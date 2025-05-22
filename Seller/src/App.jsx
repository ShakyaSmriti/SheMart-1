import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Order from "./pages/Order";
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import User from "./pages/User";
import Update from "./pages/Update";
import Seller from "./pages/Seller";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = "Rs. ";

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : ""
  );

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  return (
    <div>
      <div className="bg-gray-50 min-h-screen">
        <ToastContainer />
        {token === "" ? (
          <Login setToken={setToken} />
        ) : (
          <>
            <Navbar setToken={setToken} />
            <hr className="border-gray-300" />
            <div className="flex w-full">
              <Sidebar />

              <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <div className="text-center text-2xl font-bold">
                        Welcome to Seller Panel
                      </div>
                    }
                  />
                  <Route path="/add" element={<Add token={token} />} />
                  <Route path="/list" element={<List token={token} />} />
                  <Route path="/orders" element={<Order token={token} />} />
                  <Route path="/users" element={<User token={token} />} />
                  <Route path="/seller" element={<Seller token={token} />} />
                  <Route
                    path="/update/:id"
                    element={<Update token={token} />}
                  />
                </Routes>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
