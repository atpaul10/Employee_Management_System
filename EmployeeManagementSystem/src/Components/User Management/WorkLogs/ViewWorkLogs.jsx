import { useSelector, useDispatch } from "react-redux";
import {  Box,  CircularProgress,  Paper,  TableContainer,  Typography,  Table,  TableHead,  TableRow,  TableCell,  TableBody,  Chip,  TextField,  Button,  Dialog,  DialogTitle,  DialogContent,  DialogActions,Pagination, TablePagination,} from "@mui/material";
import dayjs from "dayjs";
import {
  fetchCurrentEmployeeWorkLogs,
  updateLog,
} from "../../../Redux/workLogsSlice";
import { useEffect, useMemo, useState } from "react";
import {  Timestamp } from "firebase/firestore";
import { toast } from "react-toastify";

const ViewWorkLogs = () => {
  const dispatch = useDispatch();
  const { currentEmployeeWorkLogs, loading, updating } = useSelector(
    (state) => state.workLogs
  );
  const currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
  const [open, setOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [editedTask, setEditedTask] = useState({});
  const [originalTask, setOriginalTask] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    document.title = "View Work-Logs";

    if (currentUser) {
      dispatch(fetchCurrentEmployeeWorkLogs());
    }
  }, [dispatch]);
  const formatDate = (date) => {
    try {
      if (date instanceof Timestamp) {
        return dayjs(date.toDate()).format("DD-MM-YYYY");
      }
      return dayjs(date).format("DD-MM-YYYY");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "success";
      case "Pending":
        return "warning";
      case "In Progress":
        return "info";
      default:
        return "default";
    }
  };
  const filterWorkLogs = useMemo(() => {
    if (!searchTerm) return currentEmployeeWorkLogs;

    return currentEmployeeWorkLogs
    .map((log) => ({
      ...log,
      tasks: Array.isArray(log.tasks) ? log.tasks : [],
    }))
    .filter((log) =>
      log.tasks.some(
        (task) =>
          task.task?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          formatDate(log.date).includes(searchTerm)
      )
    );
  }, [currentEmployeeWorkLogs, searchTerm]);

  const pagenatedWorkLog = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filterWorkLogs.slice(startIndex, startIndex + rowsPerPage);
  }, [filterWorkLogs, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowPerChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleEditClick = (logId, taskIndex, task) => {
    setCurrentEdit({ logId, taskIndex });
    setEditedTask({ ...task });
    setOriginalTask({...task})
    setOpen(true);
  };
  const handleSaveEdit = () => {
    if (currentEdit) {
      dispatch(
        updateLog({
          logId: currentEdit.logId,
          taskIndex: currentEdit.taskIndex,
          updatedTask: editedTask,
        })
      )
        .unwrap()
        .then(() => {
          setOpen(false);
          setCurrentEdit(null);
          setEditedTask({});
          dispatch(fetchCurrentEmployeeWorkLogs());
          toast.success("Work-Log Updated");
        })
        .catch((error) => {
          console.log("Update Failed", error);
        });
    }
  };
  const hasChanges = useMemo(() => {
    return (
      JSON.stringify(editedTask) !== JSON.stringify(originalTask) &&
      Object.keys(editedTask).length > 0
    );
  }, [editedTask, originalTask]);
  if (loading && !currentEmployeeWorkLogs.length) {
    return <CircularProgress />;
  }
  return (
    <Box sx={{ mt: 4, p: 3 }}>
      <Typography variant="h6">Your Work-Logs</Typography>

      <TextField
        label = "Search by Date Or Task"
        margin="normal"
        value={searchTerm}
        onChange={(e)=>{
          setSearchTerm(e.target.value)
          setPage(0)
        }}
        variant="standard"
      />
      {currentEmployeeWorkLogs.length === 0 ? (
              <Typography>No Work-Logs Found...</Typography>
            ) : filterWorkLogs.length === 0 && searchTerm ? (
              <Typography sx={{ mt: 2, color: "text.secondary" }}>
                No work logs found matching "{searchTerm}"
              </Typography>
            ) : (
              <>
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} aria-label="work logs table">
                    <TableHead sx={{ backgroundColor: "#14452F" }}>
                      <TableRow>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Date</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Tasks</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Descriptions</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Duration</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pagenatedWorkLog.map((log) => {
                        const tasks = Array.isArray(log.tasks) ? log.tasks : [];
                        return tasks.length > 0 ? (
                          tasks.map((task, index) => (
                            <TableRow key={`${log.id}-${index}`}>
                              <TableCell>{index === 0 ? formatDate(log.date) : ""}</TableCell>
                              <TableCell>{task.task || "N/A"}</TableCell>
                              <TableCell>{task.description || "N/A"}</TableCell>
                              <TableCell>{task.duration || "N/A"}</TableCell>
                              <TableCell>
                                <Chip
                                  label={task.status || "Unknown"}
                                  color={getStatusColor(task.status)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outlined"
                                  onClick={() => handleEditClick(log.id, index, task)}
                                  disabled={updating}
                                  sx={{ borderColor: "#14452F", color: "#14452F" }}
                                >
                                  Edit
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow key={log.id}>
                            <TableCell>{formatDate(log.date)}</TableCell>
                            <TableCell colSpan={5}>No tasks available</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filterWorkLogs.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowPerChange}
                />
              </>
            )}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Work Logs </DialogTitle>
        <DialogContent>
          <TextField
            label="Task"
            fullWidth
            margin="dense"
            value={editedTask.task || ""}
            onChange={(e) =>
              setEditedTask({ ...editedTask, task: e.target.value })
            }
          />

          <TextField
            label="Desciption"
            margin="dense"
            fullWidth
            multiline
            rows={4}
            value={editedTask.description || ""}
            onChange={(e) =>
              setEditedTask({ ...editedTask, description: e.target.value })
            }
          />

          <TextField
            label="Duration"
            margin="dense"
            value={editedTask.duration || ""}
            onChange={(e) =>
              setEditedTask({ ...editedTask, duration: e.target.value })
            }
          />
          <TextField
            select
            label="Status"
            margin="dense"
            value={editedTask.status || ""}
            onChange={(e) =>
              setEditedTask({ ...editedTask, status: e.target.value })
            }
            SelectProps={{
              native: true,
            }}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </TextField>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}> Cancel</Button>
          {hasChanges && (
            <Button
              onClick={handleSaveEdit}
              variant="contained"
              color="primary"
              disabled = { !hasChanges || updating}
            >
                {updating ? <CircularProgress/> : "Save"}
            </Button>
          )}
         
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default ViewWorkLogs;
