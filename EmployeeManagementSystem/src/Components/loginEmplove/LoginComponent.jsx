import { useEffect } from "react";
import React from "react";
import loginImage from "../../assets/loginImage.png";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import OptraLogo from '../../../public/OptraLogo2.png'


//* Login Component using React Hook Form
const LoginComponent = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    document.title = "Login";
  });

  const auth = getAuth();
  const db = getFirestore();

  const onSubmit = async ({ email, password, role }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
  
      if (userDoc.exists()) {
        const userData = userDoc.data();

      if (!userData.leaveBalance) {
        const initialLeaveBalances = {
          Casual: 10,
          Sick: 10,
          Earned: 10,
        };

        await updateDoc(userDocRef, {
          leaveBalance: initialLeaveBalances,
        });
      }
  
        if (role !== userData.role) {
          toast.error("You are not Authorized .");
          return;
        }
        // Store current user data locally
        const currentUser = { ...userData, uid: user.uid };
        localStorage.setItem("CurrentUser", JSON.stringify(currentUser));
  
        // Navigate to specific dashboard based on role
        if (userData.role === "Admin") {
          navigate("/admindashboard");
        } else if (userData.role === "User") {
          navigate("/userdashboard");
        } else {
          toast.error("Invalid role selected");
        }
        setTimeout(()=>toast.success("Login Successful"),1000)
        // toast.success("Login Successful");
      } else {
        toast.error("User data not found ");
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Invalid Email or Password");
    }
  };
  

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Side: Login Form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center text-indigo-950 mb-6 ">
            Login
          </h2>
          <div className="flex justify-center mb-6">
            <img 
            src={OptraLogo}
            alt="Optra Logo"
            className="h-12"
            />
          

          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              {/* name  */}
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
                placeholder="Name"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            {/* Email Field */}
            <div>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email format",
                  },
                })}
                placeholder="Email"
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
            {/* Password Field */}
            <div>
              <input
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters long",
                  },
                })}
                placeholder="Password"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

             {/* Forgot Password  */}
            <div className="flex justify-between items-center text-sm">
              <a
                onClick={() => navigate("/forgotPassword")}
                className="text-indigo-600 hover:underline cursor-pointer"
              >
                Forgot Password?
              </a>
            </div>
            <div>
              <select
                {...register("role", { required: "Role is required" })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  errors.role ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Your Role</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-900 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 mt-4"
            >
              Login to your account
            </button>
          </form>
          <p className="text-sm text-gray-600 text-center mt-4">
            Do not have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-indigo-950 cursor-pointer hover:underline"
            >
              Register here
            </span>
          </p>
        </div>
      </div>

      {/* // Right Side: Image */}
      <div className="bg-indigo-500 flex items-center justify-center">
        <img
          src={loginImage} // Image Source
          alt="Image"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};
export default LoginComponent;
