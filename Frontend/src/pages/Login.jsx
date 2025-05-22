import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  // Input states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");

  // Error states
  const [errors, setErrors] = useState({});

  const validateFields = () => {
    const newErrors = {};

    if (!email) newErrors.email = "Email is required.";
    if (!password) newErrors.password = "Password is required.";

    if (currentState === "Sign Up") {
      if (!name) newErrors.name = "Name is required.";
      if (!confirmPassword)
        newErrors.confirmPassword = "Please confirm your password.";
      if (password && confirmPassword && password !== confirmPassword)
        newErrors.confirmPassword = "Passwords do not match.";
      if (!gender) newErrors.gender = "Please select a gender.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!validateFields()) return;

    try {
      if (currentState === "Sign Up") {
        const response = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          email,
          password,
          confirmPassword,
          gender,
        });

        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          toast.success("Account created successfully!");
        } else {
          toast.error(response.data.message);
        }
      } else { 
        const response = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password,
        });

        if (response.data.success) {
          // Store token in localStorage
          localStorage.setItem("token", response.data.token);
          
          // Verify token was stored correctly
          const storedToken = localStorage.getItem("token");
          console.log("Token stored successfully:", storedToken ? "Yes" : "No");
          
          setToken(response.data.token);
          toast.success("Login successful!");
          navigate("/");
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    }
  };

  useEffect(() => {
    if (token) navigate("/");
  }, [token]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      {/* Title */}
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {/* Name Field (Sign Up Only) */}
      {currentState !== "Login" && (
        <div className="w-full">
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            className={`w-full px-3 py-2 border ${
              errors.name ? "border-red-500" : "border-gray-800"
            }`}
            type="text"
            placeholder="Name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>
      )}

      {/* Email */}
      <div className="w-full">
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          className={`w-full px-3 py-2 border ${
            errors.email ? "border-red-500" : "border-gray-800"
          }`}
          type="email"
          placeholder="Email"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="w-full">
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          className={`w-full px-3 py-2 border ${
            errors.password ? "border-red-500" : "border-gray-800"
          }`}
          type="password"
          placeholder="Password"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password (Sign Up Only) */}
      {currentState !== "Login" && (
        <div className="w-full">
          <input
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
            className={`w-full px-3 py-2 border ${
              errors.confirmPassword ? "border-red-500" : "border-gray-800"
            }`}
            type="password"
            placeholder="Confirm Password"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>
      )}

      {/* Gender (Sign Up Only) */}
      {currentState !== "Login" && (
        <div
          className={`flex flex-col gap-2 mt-2 w-full px-3 py-2 border ${
            errors.gender ? "border-red-500" : "border-gray-800"
          }`}
        >
          <label className="text-gray-700 font-medium">Select Gender:</label>
          <div className="flex gap-4">
            {["Male", "Female", "Other"].map((g) => (
              <label key={g} className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={gender === g}
                  onChange={(e) => setGender(e.target.value)}
                  className="mr-2"
                />
                {g}
              </label>
            ))}
          </div>
          {errors.gender && (
            <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
          )}
        </div>
      )}

      {/* Footer Section */}
      <div className="w-full flex justify-between text-sm mt-1">
        {currentState === "Login" ? (
          <>
            <NavLink to="/forget-password">
              <p className="cursor-pointer">Forgot your password?</p>
            </NavLink>
            <p
              onClick={() => {
                setCurrentState("Sign Up");
                setErrors({});
              }}
              className="cursor-pointer"
            >
              Create account
            </p>
          </>
        ) : (
          <p
            onClick={() => {
              setCurrentState("Login");
              setErrors({});
            }}
            className="cursor-pointer ml-auto"
          >
            Login Here
          </p>
        )}
      </div>

      <button className="bg-black text-white font-light px-8 py-2 mt-4">
        {currentState === "Login" ? "Sign In" : "Sign Up"}
      </button>
    </form>
  );
};

export default Login;
