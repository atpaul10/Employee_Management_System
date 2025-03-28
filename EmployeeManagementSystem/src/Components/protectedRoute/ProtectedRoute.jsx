import { Navigate } from "react-router";
import React from "react";
const  ProtectedRoute = ({children ,role}) => {
    const currentUser = JSON.parse(localStorage.getItem("CurrentUser"));

    if(!currentUser){
        return <Navigate to="/Login"  />
    }
   if(currentUser.role !== role){
        return <Navigate to ="/Unauthorized" />
    }
  return children
}
export default ProtectedRoute