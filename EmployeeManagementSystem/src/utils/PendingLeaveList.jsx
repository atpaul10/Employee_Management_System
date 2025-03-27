import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Chip, } from "@mui/material";
import EventNoteIcon from "@mui/icons-material/EventNote"; 
import DateRangeIcon from "@mui/icons-material/DateRange"; 
import NotesIcon from "@mui/icons-material/Notes"; 
import { useNavigate } from "react-router-dom";

const PendingLeaveRequest = ({ pendingLeaves }) => {

    const navigate = useNavigate()
    
    const handleNavigate = ()=>{
        navigate("/leave-request-management")
    }
  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
        Pending Leave Requests
      </Typography>

      {pendingLeaves.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          No pending leave requests.  
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: "8px", background: "#f9f9f9" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: "#e0e0e0" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Leave Type</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Start Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>End Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingLeaves.map((leave) => (
                <TableRow 
                key={leave.id} 
                onClick = {handleNavigate}
                sx={{
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#b5d1f5" }, 
                }}>
                  <TableCell>
                    <EventNoteIcon color="primary" sx={{ verticalAlign: "middle", marginRight: 1 }} />
                    {leave.leaveType}
                  </TableCell>
                  <TableCell>
                    <DateRangeIcon color="action" sx={{ verticalAlign: "middle", marginRight: 1 }} />
                    {leave.startDate}
                  </TableCell>
                  <TableCell>
                    <DateRangeIcon color="action" sx={{ verticalAlign: "middle", marginRight: 1 }} />
                    {leave.endDate}
                  </TableCell>
                  <TableCell>
                    <NotesIcon color="secondary" sx={{ verticalAlign: "middle", marginRight: 1 }} />
                    {leave.reason}
                  </TableCell>
                  <TableCell>
                    
                    <Chip
                      label={leave.status}
                      sx={{
                        backgroundColor: leave.status === "Pending" ? "#060080" : "#4caf50",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};
export default PendingLeaveRequest;