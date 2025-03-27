import React, { Suspense } from "react";
import ProtectedRoute from "./Components/protectedRoute/ProtectedRoute";
import routes from "./routeList/routes";
import {BrowserRouter as Router,Route,Navigate,Routes,} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { CircularProgress } from "@mui/material";

function App() {
  return (
    <Router>
      <ToastContainer position="top-right"/>
      <Suspense fallback={<div><CircularProgress style={{alignItems:"center"}}/></div>}>
      <Routes>
        <Route path="/" element={<Navigate to= "/login"/>}/>
        {routes.map((route,index)=>{
          const{path,element,role}= route;
          const routeElement = role?(
            <ProtectedRoute role={role}>{element}</ProtectedRoute>
          ):(
            element
          )
          return <Route key={index} path={path} element={routeElement}/>
        })}
      </Routes>
      </Suspense>
    </Router>
  );
}
export default App;