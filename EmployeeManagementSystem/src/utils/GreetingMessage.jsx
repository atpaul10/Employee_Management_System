import { getDoc, doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { Typography } from "@mui/material";
import React from "react";

const GreetingMessage = () => {
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = JSON.parse(localStorage.getItem("CurrentUser"));

      if (currentUser?.uid) {
        setUserName(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUserName(userDoc.data());
        }
      }
    };
    fetchUserData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const sunImage = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "/sun.png";
    } else if (hour < 18) {
      return "/afternoon.png";
    } else {
      return "/goodevening.png";
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <img src={sunImage()} alt="Sun Image" style={{ width: "50px", height: "40px" }} />
      <Typography variant="h6" fontWeight="bold">
        {getGreeting()}, {userName?.name || "Admin"}👋
      </Typography>
    </div>
  );
};

export default GreetingMessage;
