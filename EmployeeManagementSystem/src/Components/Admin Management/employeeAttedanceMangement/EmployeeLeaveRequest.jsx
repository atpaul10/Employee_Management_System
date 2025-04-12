import React from "react";
import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { 
  Table, TableBody, TextField, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, CircularProgress, Typography, Box, TableSortLabel, TablePagination, 
  Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, CardActions, Grid 
} from "@mui/material";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const EmployeeLeaveRequest = () => {
  const [leaveRequest, setLeaveRequest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDateFilter, setOpenDateFilter] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [isFilterActive, setIsFilterActive] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString || dateString === "Invalid Date" || !dayjs(dateString).isValid()) {
      return "-";
    }
    return dayjs(dateString).format("DD-MM-YYYY");
  };

  useEffect(() => {
    document.title = "Leave Requests";
    const usersCollection = collection(db, "users");

    const unsubscribeUsers = onSnapshot(usersCollection, async (usersSnapshot) => {
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      await Promise.all(
        usersData.map(async (user) => {
          const leaveCollection = collection(db, `users/${user.id}/leaveRequest`);
          const unsubscribeLeaves = onSnapshot(leaveCollection, (leaveSnapshot) => {
            const leaveRequests = leaveSnapshot.docs.map((leaveDoc) => ({
              id: leaveDoc.id,
              ...leaveDoc.data(),
              employeeName: user.name,
              userId: user.id,
              remainingBalance: user.leaveBalance?.[leaveDoc.data().leaveType] || "N/A",
            }));
            setLeaveRequest((prev) => [
              ...prev.filter((req) => req.userId !== user.id),
              ...leaveRequests
            ]);
            setLoading(false);
          });
          return unsubscribeLeaves;
        })
      );
    });
    return () => unsubscribeUsers();
  }, []);

  const handleUpdateStatus = async (leaveId, userId, status, leaveType, leaveDays = 0) => {
    try {
      const leaveRef = doc(db, `users/${userId}/leaveRequest`, leaveId);
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      let updateData = { status };
      if (status === "Approved") {
        updateData.approvalDate = new Date().toISOString().split("T")[0];
      }
      if (status === "Rejected" && userSnap.exists()) {
        updateData.rejectionDate = new Date().toISOString().split("T")[0];
        const userData = userSnap.data();
        const currentLeaveBalance = userData.leaveBalance || {};
        if (leaveType in currentLeaveBalance) {
          currentLeaveBalance[leaveType] += Number(leaveDays);
        }
        await updateDoc(userRef, { leaveBalance: currentLeaveBalance });
      }
      await updateDoc(leaveRef, updateData);
      setLeaveRequest((prevRequests) =>
        prevRequests.map((leave) =>
          leave.id === leaveId ? { ...leave, ...updateData } : leave
        )
      );
      toast.success(`Leave Request ${status}`);
    } catch (error) {
      console.log("Error in updating leave status:", error);
      toast.error("Failed to update leave status");
    }
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const sortedHistory = useMemo(() => {
    const historyData = [...leaveRequest.filter(leave => leave.status !== "Pending")];
    if (sortConfig.key) {
      historyData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return historyData;
  }, [leaveRequest, sortConfig]);

  const filteredHistory = useMemo(() => {
    let filtered = sortedHistory;

    if (searchTerm) {
      filtered = filtered.filter(leave =>
        leave.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.leaveType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(leave.leaveDays)?.includes(searchTerm)
      );
    }

    if (isFilterActive && fromDate && toDate) {
      const from = dayjs(fromDate);
      const to = dayjs(toDate);
      filtered = filtered.filter(leave => {
        const leaveStart = dayjs(leave.startDate);
        const leaveEnd = dayjs(leave.endDate);
        return leaveStart.isSame(from, 'day') || leaveEnd.isSame(to, 'day') ||
               (leaveStart.isAfter(from) && leaveEnd.isBefore(to));
      });
    }
    return filtered;
  }, [sortedHistory, searchTerm, isFilterActive, fromDate, toDate]);

  const paginatedData = useMemo(() => {
    return filteredHistory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredHistory, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterToggle = () => {
    if (isFilterActive) {
      setFromDate(null);
      setToDate(null);
      setIsFilterActive(false);
    } else {
      setOpenDateFilter(true);
    }
  };

  const applyDateFilter = () => {
    if (fromDate && toDate) {
      setIsFilterActive(true);
      setOpenDateFilter(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Leave Request</Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {/* Current Leave Request Section with Cards */}
          <Box sx={{ mb: 4 }}>
            {leaveRequest.filter(leave => leave.status === "Pending").length > 0 ? (
              <Grid container spacing={2}>
                {leaveRequest
                  .filter(leave => leave.status === "Pending")
                  .map((leave) => (
                    <Grid item xs={12} sm={6} md={4} key={leave.id}>
                      <Card 
                        sx={{ 
                          minWidth: 275,
                          boxShadow: 3,
                          '&:hover': { boxShadow: 6 }
                        }}
                      >
                        <CardContent>
                          <Typography variant="h6" component="div" gutterBottom>
                            {leave.employeeName || "Unknown"}
                          </Typography>
                          <Typography color="text.secondary">
                            Type: {leave.leaveType}
                          </Typography>
                          <Typography color="text.secondary">
                            Dates: {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                          </Typography>
                          <Typography color="text.secondary">
                            Days: {leave.leaveDays}
                          </Typography>
                          <Typography color="text.secondary">
                            Reason: {leave.reason}
                          </Typography>
                          <Typography color="text.secondary">
                            Status: <span style={{ color: '#1976d2', fontWeight: 'bold' }}>{leave.status}</span>
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                          <Button
                            color="success"
                            variant="contained"
                            onClick={() => handleUpdateStatus(leave.id, leave.userId, "Approved", leave.leaveType, leave.leaveDays ?? 0)}
                            size="small"
                            sx={{ mr: 1, '&:hover': { bgcolor: '#388e3c' } }}
                          >
                            Approve
                          </Button>
                          <Button
                            color="error"
                            variant="contained"
                            onClick={() => handleUpdateStatus(leave.id, leave.userId, "Rejected", leave.leaveType, leave.leaveDays ?? 0)}
                            size="small"
                            sx={{ '&:hover': { bgcolor: '#d32f2f' } }}
                          >
                            Reject
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            ) : (
              <Typography align="center" variant="body1" color="text.secondary">
                No Pending Leave Requests
              </Typography>
            )}
          </Box>

          {/* Leave Request History Section (unchanged) */}
          <Typography variant="h5" gutterBottom>Leave Request History</Typography>
          <Box display="flex" flexDirection="row" gap={2} mb={3}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant="contained"
              color={isFilterActive ? "secondary" : "primary"}
              onClick={handleFilterToggle}
            >
              {isFilterActive ? "Reset Filter" : "Filter by Date"}
            </Button>
          </Box>

          <Dialog open={openDateFilter} onClose={() => setOpenDateFilter(false)}>
            <DialogTitle>Date Range Filter</DialogTitle>
            <DialogContent>
              <Box display="flex" flexDirection="column" gap={2} mt={2}>
                <TextField
                  type="date"
                  label="From Date"
                  value={fromDate || ""}
                  onChange={(e) => setFromDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  type="date"
                  label="To Date"
                  value={toDate || ""}
                  onChange={(e) => setToDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDateFilter(false)}>Cancel</Button>
              <Button onClick={applyDateFilter} disabled={!fromDate || !toDate}>Apply</Button>
            </DialogActions>
          </Dialog>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><TableSortLabel active={sortConfig.key === "employeeName"} direction={sortConfig.direction} onClick={() => handleSort("employeeName")}><strong>Employee Name</strong></TableSortLabel></TableCell>
                  <TableCell><TableSortLabel active={sortConfig.key === "leaveType"} direction={sortConfig.direction} onClick={() => handleSort("leaveType")}><strong>Leave Type</strong></TableSortLabel></TableCell>
                  <TableCell><TableSortLabel active={sortConfig.key === "startDate"} direction={sortConfig.direction} onClick={() => handleSort("startDate")}><strong>Start Date</strong></TableSortLabel></TableCell>
                  <TableCell><TableSortLabel active={sortConfig.key === "endDate"} direction={sortConfig.direction} onClick={() => handleSort("endDate")}><strong>End Date</strong></TableSortLabel></TableCell>
                  <TableCell><TableSortLabel active={sortConfig.key === "leaveDays"} direction={sortConfig.direction} onClick={() => handleSort("leaveDays")}><strong>Leave Days</strong></TableSortLabel></TableCell>
                  <TableCell><strong>Reason</strong></TableCell>
                  <TableCell><TableSortLabel active={sortConfig.key === "status"} direction={sortConfig.direction} onClick={() => handleSort("status")}><strong>Status</strong></TableSortLabel></TableCell>
                  <TableCell><strong>Approval Date</strong></TableCell>
                  <TableCell><strong>Rejection Date</strong></TableCell>
                  <TableCell><strong>Remaining Leave Balance</strong></TableCell>
                  <TableCell><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map(leave => (
                    <TableRow key={leave.id}>
                      <TableCell>{leave.employeeName || "Unknown"}</TableCell>
                      <TableCell>{leave.leaveType}</TableCell>
                      <TableCell>{formatDate(leave.startDate)}</TableCell>
                      <TableCell>{formatDate(leave.endDate)}</TableCell>
                      <TableCell>{leave.leaveDays ?? "-"}</TableCell>
                      <TableCell>{leave.reason}</TableCell>
                      <TableCell sx={{ color: leave.status === "Approved" ? "green" : "red", fontWeight: "bold" }}>{leave.status}</TableCell>
                      <TableCell>{formatDate(leave.approvalDate)}</TableCell>
                      <TableCell>{formatDate(leave.rejectionDate)}</TableCell>
                      <TableCell>{leave.remainingBalance}</TableCell>
                      <TableCell>
                        {leave.status === "Approved" ? (
                          <Button variant="contained" color="error" onClick={() =>
                            handleUpdateStatus(leave.id, leave.userId, "Rejected", leave.leaveType, leave.leaveDays ?? 0)
                          } size="small">Reject leave</Button>
                        ) : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} align="center">No Leave History</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredHistory.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Box>
  );
};

export default EmployeeLeaveRequest;