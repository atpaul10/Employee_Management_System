import React from "react";
import { useEffect, useState ,useMemo} from "react";
import {collection,onSnapshot,doc,updateDoc,getDoc,} from "firebase/firestore";
import { db } from "../../../firebase";
import { Table, TableBody, TextField, FormControl, TableCell, InputLabel, Select, MenuItem, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Typography, Box, TableSortLabel, TablePagination,} from "@mui/material";
import { toast } from "react-toastify";

const EmployeeLeaveRequest = () => {
  const [leaveRequest, setLeaveRequest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfigue, setSortConfigure] = useState({
    key: " ",
    direction: "asc",});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchLetter, setSearchLetter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("All");

  
  useEffect(() => {
    document.title = "Leave Requests";

    const usersCollection = collection(db, "users");

    // Listen for real-time updates on users collection
    const unsubscribeUsers = onSnapshot(usersCollection, async (usersSnapshot) => {
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      await Promise.all(
        usersData.map(async (user) => {
          const leaveCollection = collection(db, `users/${user.id}/leaveRequest`);
          
          // Real-time listener for each user's leave requests
          const unsubscribeLeaves = onSnapshot(leaveCollection, (leaveSnapshot) => {
            const leaveRequests = leaveSnapshot.docs.map((leaveDoc) => ({
              id: leaveDoc.id,
              ...leaveDoc.data(),
              employeeName: user.name,
              userId: user.id,
              remainingBalance: user.leaveBalance?.[leaveDoc.data().leaveType] || "N/A",
            }));

            // Update the state efficiently
            setLeaveRequest((prev) => {
              // Remove old requests from this user and add new ones
              return [...prev.filter((req) => req.userId !== user.id), ...leaveRequests];
            });
            setLoading(false);
          });

          return unsubscribeLeaves; 
        })
      );
    });
    return () => {
      unsubscribeUsers(); 
    };
  }, []);

  const handleUpdateStatus = async (  leaveId, userId, status, leaveType, leaveDays = 0) => {
    try {
      const leaveRef = doc(db, `users/${userId}/leaveRequest`, leaveId);
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      let updateData = { status };

      if (status === "Approved") {
        updateData.approvalDate = new Date().toISOString().split("T")[0]; // Added approval date
      }
      if (status === "Rejected" && userSnap.exists()) {
        updateData.rejectionDate = new Date().toISOString().split("T")[0]; // added the rejection date
        const userData = userSnap.data();
        const currentLeaveBalance = userData.leaveBalance || {};

        if (leaveType in currentLeaveBalance) {
          currentLeaveBalance[leaveType] += Number(leaveDays);
        } 

        await updateDoc(userRef, { leaveBalance: currentLeaveBalance });
      }
      await updateDoc(leaveRef, updateData);
      // Update local state
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
  const handelSort = (key) => {
    let direction = "asc";
    if (sortConfigue.key === key && sortConfigue.direction === "asc") {
      direction = "desc";
    }
    setSortConfigure({ key, direction });

    setLeaveRequest((prevRequests) => {
      return [...prevRequests].sort((a, b) => {
        if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
        if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
        return 0;
      });
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = useMemo(()=>{
    return leaveRequest
    .filter((leave)=>{
      const isStatusValid = statusFilter === "All" || leave.status === statusFilter
      const isLeaveTypeValid = leaveTypeFilter === "All" || leave.leaveType === leaveTypeFilter
      const isStartDateValid = startDateFilter ? new Date(leave.startDate) >= new Date(startDateFilter): true
      const isEndDateValid = endDateFilter ? new Date(leave.endDate) <= new Date(endDateFilter): true

      const isSearchValid = searchLetter === "" || leave.employeeName.toLowerCase().includes(searchLetter.toLowerCase()) ||
      leave.leaveType.toLowerCase().includes(searchLetter.toLowerCase())

      return(
        isStatusValid &&
        isLeaveTypeValid &&
        isStartDateValid &&
        isEndDateValid &&
        isSearchValid
      )
    }).slice(page * rowsPerPage, page* rowsPerPage + rowsPerPage)
  },[leaveRequest,statusFilter,leaveTypeFilter,startDateFilter,endDateFilter,searchLetter,page, rowsPerPage])

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Leave Request
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {/* pending levae request table */}
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Employee Name </strong>
                  </TableCell>
                  <TableCell>
                    <strong>Leave Type </strong>
                  </TableCell>
                  <TableCell>
                    <strong>Start Date </strong>
                  </TableCell>
                  <TableCell>
                    <strong>End Date </strong>
                  </TableCell>
                  <TableCell>
                    <strong>Leave Days </strong>
                  </TableCell>
                  <TableCell>
                    <strong>Reson </strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Action </strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaveRequest.filter((leave) => leave.status === "Pending")
                  .length > 0 ? (
                  leaveRequest
                    .filter((leave) => leave.status === "Pending")
                    .map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell>{leave.employeeName || "Unknown"}</TableCell>
                        <TableCell>{leave.leaveType}</TableCell>
                        <TableCell>{leave.startDate}</TableCell>
                        <TableCell>{leave.endDate}</TableCell>
                        <TableCell>{leave.leaveDays}</TableCell>
                        <TableCell>{leave.reason}</TableCell>
                        <TableCell>{leave.status}</TableCell>
                        <TableCell>
                          <Button
                            color="success"
                            variant="contained"
                            onClick={() =>
                              handleUpdateStatus(
                                leave.id,
                                leave.userId,
                                "Approved",
                                leave.leaveType,
                                leave.leaveDays ?? 0
                              )
                            }
                            sx={{ mr: 1 }}
                            size="small"
                          >
                            {" "}
                            Approved
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() =>
                              handleUpdateStatus(
                                leave.id,
                                leave.userId,
                                "Rejected",
                                leave.leaveType,
                                leave.leaveDays ?? 0
                              )
                            }
                            size="small"
                          >
                            {" "}
                            Rejected
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No Pending Leave Request{" "}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* leave request history  */}
          <Typography variant="h5" gutterBottom>
            Leave Request History
          </Typography>

          <Box display="flex" flexDirection="row" gap={2} mb={3}>
          <strong> Filter Table</strong>
            <TextField
              label="Search by Name or Leave Type"
              variant="outlined"
              size="small"
              value={searchLetter}
              onChange={(e) => setSearchLetter(e.target.value)}
            />
            <Box display="flex" gap={2} >
              <TextField
                type="date"
                label="Start Date"
                variant="outlined"
                size="small"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
              <TextField
                type="date"
                label="End Date"
                variant="outlined"
                size="small"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
            </Box>
            <FormControl variant="outlined" size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                
              </Select>
            </FormControl>
          </Box>
                {/* leave history table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfigue.key === "employeeName"}
                      direction={sortConfigue.direction}
                      onClick={() => handelSort("employeeName")}
                    >
                      <strong>Employee Name </strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfigue.key === "leaveType"}
                      direction={sortConfigue.direction}
                      onClick={() => handelSort("leaveType")}
                    >
                      <strong>Leave Type </strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfigue.key === "startDate"}
                      direction={sortConfigue.direction}
                      onClick={() => handelSort("startDate")}
                    >
                      <strong>Start Date </strong>
                    </TableSortLabel>
                  </TableCell>

                  <TableCell>
                    <TableSortLabel
                      active={sortConfigue.key === "endDate"}
                      direction={sortConfigue.direction}
                      onClick={() => handelSort("endDate")}
                    >
                      <strong>End Date </strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfigue.key === "leaveDays"}
                      direction={sortConfigue.direction}
                      onClick={() => handelSort("leaveDays")}
                    >
                      <strong>Leave Days </strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    {" "}
                    <strong>Reason </strong>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfigue.key === "status"}
                      direction={sortConfigue.direction}
                      onClick={() => handelSort("status")}
                    >
                      <strong>Status</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <strong>Approval Date</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Rejection Date</strong>
                  </TableCell>
                  <TableCell>
                    {" "}
                    <strong>Remaining Leave Balance</strong>
                  </TableCell>
                  <TableCell>
                    {" "}
                    <strong>Action </strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.filter((leave) => leave.status !== "Pending")
                  .length > 0 ? (
                  paginatedData
                    .filter((leave) => leave.status !== "Pending")
                    .map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell>{leave.employeeName || "Unknown"}</TableCell>
                        <TableCell>{leave.leaveType}</TableCell>
                        <TableCell>{leave.startDate}</TableCell>
                        <TableCell>{leave.endDate}</TableCell>
                        <TableCell>{leave.leaveDays ?? "-"}</TableCell>
                        <TableCell>{leave.reason}</TableCell>
                        <TableCell
                          sx={{
                            color:
                              leave.status === "Approved"
                                ? "Green"
                                : leave.status === "Rejected"
                                ? "red"
                                : "black",
                            fontWeight: "bold",
                          }}
                        >
                          {leave.status}
                        </TableCell>
                        <TableCell>{leave.approvalDate || "-"}</TableCell>
                        <TableCell>{leave.rejectionDate || "-"}</TableCell>
                        <TableCell>{leave.remainingBalance}</TableCell>
                        <TableCell>
                          {leave.status === "Approved" && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() =>
                                handleUpdateStatus(
                                  leave.id,
                                  leave.userId,
                                  "Rejected",
                                  leave.leaveType,
                                  leave.leaveDays ?? 0
                                )
                              }
                              size="small"
                            >
                              {" "}
                              Reject leave
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      No Leave History
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={leaveRequest.length}
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