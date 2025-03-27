import React from "react";
import PropTypes from "prop-types";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";

const LeaveRequestCard = ({ leaveRequests }) => {
  const statusColor = {
    Approved: "green",
    Rejected: "red",
    Pending: "orange"
  };
  return (
    <>
      <Typography variant="h5" gutterBottom>
        Recent Leave Requests
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Leave Type</strong></TableCell>
              <TableCell><strong>Start Date</strong></TableCell>
              <TableCell><strong>End Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaveRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.leaveType}</TableCell>
                <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
                <TableCell sx={{ color: statusColor[request.status] }}>
                  {request.status}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
LeaveRequestCard.propTypes = {
  leaveRequests: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      leaveType: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default LeaveRequestCard;
