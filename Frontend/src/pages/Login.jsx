import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Ensure gender is selected for "Sign Up" state
    if (currentState === "Sign Up" && !gender) {
      return toast.error("Please select a gender.");
    }

    // Ensure passwords match
    if (currentState === "Sign Up" && password !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    try {
      if (currentState === "Sign Up") {
        console.log("Registering user with:", {
          name,
          email,
          password,
          confirmPassword,
          gender,
        });

        // Send the request to register the user
        const response = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          email,
          password,
          confirmPassword,
          gender,
        });

        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token); // Save token for Sign Up
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
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token); // Save token for Login
          toast.success("Logged in successfully!");
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error(
        "Error during authentication:",
        error.response?.data || error.message
      );
      toast.error(
        error.response?.data?.message || "An unexpected error occurred."
      );
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/"); // Redirect after successful login or registration
    }
  }, [token]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      {/* Title Section */}
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {/* Conditional Inputs */}
      {currentState === "Login" ? null : (
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full px-3 py-2 border border-gray-800"
          type="text"
          placeholder="Name"
          required
        />
      )}

      <input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        className="w-full px-3 py-2 border border-gray-800"
        type="email"
        placeholder="Email"
        required
      />
      <input
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        className="w-full px-3 py-2 border border-gray-800"
        type="password"
        placeholder="Password"
        required
      />

      {currentState !== "Login" && (
        <>
          <input
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
            className="w-full px-3 py-2 border border-gray-800"
            type="password"
            placeholder="Confirm Password"
            required
          />

          <div className="flex flex-col gap-2 mt-2 w-full px-3 py-2 border border-gray-800">
            <label className="text-gray-700 font-medium">Select Gender:</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={gender === "Male"}
                  onChange={(e) => setGender(e.target.value)}
                  className="mr-2"
                />
                Male
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={gender === "Female"}
                  onChange={(e) => setGender(e.target.value)}
                  className="mr-2"
                />
                Female
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="Other"
                  checked={gender === "Other"}
                  onChange={(e) => setGender(e.target.value)}
                  className="mr-2"
                />
                Other
              </label>
            </div>
          </div>
        </>
      )}

      {/* Footer Section */}
      <div className="w-full flex justify-between  text-sm mt-1">
        {currentState === "Login" ? (
          <>
            <p className="cursor-pointer">Forgot your password?</p>

            <p
              onClick={() => setCurrentState("Sign Up")}
              className="cursor-pointer"
            >
              Create account
            </p>
          </>
        ) : (
          <p
            onClick={() => setCurrentState("Login")}
            className="cursor-pointer ml-auto "
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
