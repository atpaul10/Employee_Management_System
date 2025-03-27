import GreetingMessage from "../../../utils/GreetingMessage";
import DailyThoughts from "../../DailyThoughts/DailyThoughts";
import { useSelector,useDispatch } from "react-redux";
import { fetchLeaveRequests,updateLeaveBalance, } from "../../../Redux/leaveSlice";
import { useEffect, useState } from "react";
import { Box, Card, CardContent, CircularProgress, Typography,Grid2,} from "@mui/material";
import React from "react";
import { db } from "../../../firebase";
import { getDoc,doc } from "firebase/firestore";
import LeaveRequestCard from "./LeaveRequestCard";

const UserDashboard = () => {

const dispatch = useDispatch()
const[ userId , setUserId]= useState(null)
const leaveBalance = useSelector((state)=>state.leave.leaveBalance)
const loading = useSelector((state)=> state.leave.loading)
const leaveRequest = useSelector((state)=>state.leave.leaveRequests)

useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem("CurrentUser"))
  if(storedUser && storedUser.uid){
    setUserId(storedUser.uid)
    dispatch(fetchLeaveRequests(storedUser.uid))

    const userRef = doc(db,`users/${storedUser.uid}`)
    getDoc(userRef).then((docSnap)=>{
      if(docSnap.exists()){
          dispatch(updateLeaveBalance(docSnap.data().leaveBalance))
      }
    })
  }
  document.title = "Dashboard"
}, [dispatch])

const lastThreeLeaveRequest = [...leaveRequest]
.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
.slice(0,3)

  return (
    <>
      <GreetingMessage/>
      <DailyThoughts/>
        <Card sx={{ width: 300, ml: 3, p: 2, backgroundColor: "#fff", borderRadius: "12px", boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, textAlign: "center" }}>
            Leave Balance
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 80 }}>
              <CircularProgress style={{color:"#40513B"}} size={30} thickness={5}/>
            </Box>
          ) : userId ? (
            <Grid2 container spacing={2} justifyContent="center">
              {/* Casual Leave */}
              <Grid2 item>
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <CircularProgress variant="determinate" value={leaveBalance.Casual * 10} size={50} thickness={5} sx={{ color: "#4caf50" }} />
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {leaveBalance.Casual}
                    </Typography>
                  </Box>
                </Box>
                <Typography sx={{ mt: 1, textAlign: "center", fontSize: "12px", fontWeight: "bold" }}>Casual</Typography>
              </Grid2>

              {/* Sick Leave */}
              <Grid2 item>
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <CircularProgress variant="determinate" value={leaveBalance.Sick * 10} size={50} thickness={5} sx={{ color: "#ff9800" }} />
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {leaveBalance.Sick}
                    </Typography>
                  </Box>
                </Box>
                <Typography sx={{ mt: 1, textAlign: "center", fontSize: "12px", fontWeight: "bold" }}>Sick</Typography>
              </Grid2>

              {/* Earned Leave */}
              <Grid2 item>
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <CircularProgress variant="determinate" value={leaveBalance.Earned * 10} size={50} thickness={5} sx={{ color: "#3f51b5" }} />
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {leaveBalance.Earned}
                    </Typography>
                  </Box>
                </Box>
                <Typography sx={{ mt: 1, textAlign: "center", fontSize: "12px", fontWeight: "bold" }}>Earned</Typography>
              </Grid2>
            </Grid2>
          ) : (
            <Typography color="error" textAlign="center">
              User not logged in
            </Typography>
          )}
        </CardContent>
      </Card>

      <Box sx={{padding:5}}>
      {loading ? (
        <CircularProgress style={{color:"#40513B"}} size={30} thickness={5} />
      ) : lastThreeLeaveRequest.length > 0 ? (
        <LeaveRequestCard leaveRequests={lastThreeLeaveRequest} />
      ) : (
        <Typography>No recent leave requests found.</Typography>
      )}
      </Box>
    </>
  );
};
export default UserDashboard; 