import { useSelector, useDispatch } from "react-redux";
import {Box,CircularProgress,Paper,TableContainer,Typography,Table,TableHead,  TableRow,  TableCell,  TableBody,  Chip,  TextField,  Button, Dialog, DialogTitle, DialogContent, DialogActions,} from "@mui/material";
import dayjs from "dayjs";
import { fetchCurrentEmployeeWorkLogs,updateLog } from "../../../Redux/workLogsSlice";
import { useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore";
import { toast } from "react-toastify";

const ViewWorkLogs = () => {
  const dispatch = useDispatch();
  const { currentEmployeeWorkLogs, loading,updating } = useSelector((state) => state.workLogs);
  const currentUser = JSON.parse(localStorage.getItem("CurrentUser"))       
  const [open, setOpen] = useState(false)
  const [currentEdit, setCurrentEdit] = useState(null)
  const [editedTask,setEditedTask]= useState({})

  useEffect(() => {
    document.title=("View Work-Logs")

    if (currentUser) {
      dispatch(fetchCurrentEmployeeWorkLogs());
    }
  }, [dispatch,]);    
    const formatDate = (date) => {
      try {
        if (date instanceof Timestamp) {
          return dayjs(date.toDate()).format("YYYY-MM-DD");
        }
        return dayjs(date).format("YYYY-MM-DD");
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
            const handleEditClick =  (logId,taskIndex,task) =>{
              setCurrentEdit({logId,taskIndex})
              setEditedTask({...task})
              setOpen(true)
            }
            const handleSaveEdit = () =>{
              if(currentEdit){
                dispatch(updateLog({
                  logId:currentEdit.logId,
                  taskIndex: currentEdit.taskIndex,
                  updatedTask: editedTask
                }))
                .unwrap().then(()=>{
                  setOpen(false)
                  setCurrentEdit(null)
                  setEditedTask({})
                  dispatch(fetchCurrentEmployeeWorkLogs())
                  toast.success("Work-Log Updated")
                }).catch((error)=>{
                  console.log("Update Failed",error)
                })
              }
            }
            if (loading && !currentEmployeeWorkLogs.length) {
              return <CircularProgress />;
            }
  return (
    <Box sx={{ mt: 4, p: 3 }}>
      <Typography variant="h6">Your Work-Logs</Typography>
      {currentEmployeeWorkLogs.length === 0 ? (
        <Typography>No Work-Logs Found...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="work logs table">
            <TableHead sx={{backgroundColor: "#14452F",}}>
              <TableRow>
                <TableCell sx={{color:"white", fontWeight:"bold"}}>Date</TableCell>
                <TableCell sx={{color:"white", fontWeight:"bold"}}>Tasks</TableCell>
                <TableCell sx={{color:"white", fontWeight:"bold"}}>Decriptions</TableCell>
                <TableCell sx={{color:"white", fontWeight:"bold"}}>Duration</TableCell>
                <TableCell sx={{color:"white", fontWeight:"bold"}}>Status</TableCell>
                <TableCell sx={{color:"white", fontWeight:"bold"}}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentEmployeeWorkLogs.map((log) => {
                const tasks = Array.isArray(log.tasks) ? log.tasks : [];
                return tasks.length > 0 ? (
                  tasks.map((task, index) => (
                    <TableRow key={`${log.id}-${index}`}>
                      <TableCell>
                        {index === 0 ? formatDate(log.date) : ""}
                      </TableCell>
                      <TableCell>{task.task || "N/A"}</TableCell>
                      <TableCell>{task.description || "N/A"}</TableCell>
                      <TableCell>{task.duration || "N/A"}</TableCell>
                      <TableCell>
                        <Chip
                          label={task.status || "Unknown"}
                          color={getStatusColor(task.status)}
                          size="small" />
                      </TableCell>
                      <TableCell>
                        <Button
                         variant="outlined"
                         onClick={()=> handleEditClick(log.id, index,task)}
                         disabled ={updating}
                         sx={{borderColor:"#14452F", color:"#14452F"}}
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
      )}
      <Dialog open={open} onClose={()=>setOpen(false)}>
        <DialogTitle>Edit Work Logs </DialogTitle>
        <DialogContent>
          <TextField 
          label="Task"
          fullWidth
          margin="dense"
          value={editedTask.task || ""}
          onChange={(e)=>setEditedTask({...editedTask,task:e.target.value})} 
          />

          <TextField
          label="Desciption"
          margin="dense"
          fullWidth
          multiline
          rows={4}
          value={editedTask.description || ""}
          onChange={(e)=>setEditedTask({...editedTask,description:e.target.value})}
          />

          <TextField
          label="Duration"
          margin="dense"
          value={editedTask.duration || ""}
          onChange={(e)=>setEditedTask({...editedTask,duration:e.target.value})}
          />
          <TextField
            select
            label="Status"
            margin="dense"
            value={editedTask.status || ""}
            onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
            SelectProps={{
              native: true,
            }}>
             <option value="Pending">Pending</option>
             <option value="In Progress">In Progress</option>
             <option value="Completed">Completed</option>
            </TextField>
        </DialogContent>

        <DialogActions>
          <Button onClick={()=>setOpen(false)}> Cancle</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary" disabled={updating}>
          {updating ? <CircularProgress  /> : "Save"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default ViewWorkLogs;