import { sendPasswordResetEmail } from "firebase/auth";
import React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth } from "../../firebase";
import forgotPasswordImage from "../../assets/forgotPasswordImage.png";

function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    document.title = "Forgot Password";
  });

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Passowrd reset email sent!  Check Your Inbox");
      navigate("/login");
    } catch (error) {
      console.log("Error in sending the email", email);
      toast.error("Error" + error.message);
    }
    setLoading(false);
  };
  return (
    <>
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Form */}
        <div className="flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-center text-indigo-900 mb-6">
              Forgot Password
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email format",
                    },
                  })}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-indigo-900 text-white rounded-lg focus:outline-none hover:bg-indigo-800"
              >
                {loading ? "Sending..." : "Submit"}
              </button>
            </form>

            {/* Back to Login */}
            <p className="text-sm text-indigo-600 text-center mt-4">
              <span className="text-indigo-950">Remember your password? </span>
              <span
                onClick={() => navigate("/login")}
                className="cursor-pointer hover:underline"
              >
                Login
              </span>
            </p>
          </div>
        </div>

        {/* Right Side: Image */}
        <div className="bg-indigo-500 flex items-center justify-center">
          <img
            src={forgotPasswordImage}
            alt="Forgot Password"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </>
  );
}
export default ForgotPassword;
