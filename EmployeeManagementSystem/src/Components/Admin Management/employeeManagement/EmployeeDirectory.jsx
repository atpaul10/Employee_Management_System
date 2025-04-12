import React from "react";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { deleteEmployee, editEmployee, fetchEmployees } from "../../../Redux/employeeSlice";
import { toast } from "react-toastify";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Box, Typography, Button, Modal, Pagination, Stack,Slide, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions }from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

const Transiton = React.forwardRef(function Transiton(props, ref){
  return <Slide direction="up" ref={ref}{...props}/>
})

const EmployeeDirectory = () => {
  const employees = useSelector((state) => state.employee.employees || []);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [originalEmployee, setOrginalEmployee]= useState(null)
  const [viewEmployee, setViewEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const rowPerPage = 5;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
   const [employeeToDelete, setEmployeeToDelete] = useState(null);

  useEffect(() => {
    document.title = "Employee Directory";
    dispatch(fetchEmployees()).then((response) => {
      console.log("Fetched Employees:", response.payload);
    });
  }, [dispatch]);

  const handleDeleteClick = (id)=>{
    console.log("Deleting the emp with Firestore document ID:", id);
    setEmployeeToDelete(id)
    setDeleteDialogOpen(true)
  }
  const handleDeleteConfirm = () => {
    console.log("Deleting the emp with Firestore document ID:", employeeToDelete);
    if(employeeToDelete){
      dispatch(deleteEmployee(employeeToDelete))
        .unwrap()
        .then(() => {
          console.log("Employee deleted successfully");
          toast.success("Employee deleted successfully")
        })
        .catch((error) => {
          console.error("Error deleting employee:", error);
        }).finally(()=>{
          setDeleteDialogOpen(false)
          setEmployeeToDelete(null)
        })
    };
    }
  const handleDeleteCancel = ()=>{
    setDeleteDialogOpen(false)
    setEmployeeToDelete(null)
  }
  const handleEdit = (employee) => {
    setCurrentEmployee({...employee});
    setOrginalEmployee({...employee})
    setIsEditing(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    dispatch(editEmployee(currentEmployee))
      .unwrap()
      .then(() => {
        toast.success("Employee Update Successfully");
        setIsEditing(false);
      })
      .catch((error) => {
        console.error("Error updating employee:", error);
      });
  };

  const handleView = (employee) => {
    setViewEmployee(employee);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };


  const filteredEmployees = employees.filter((employee) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return(
      employee.employeeId?.toString().toLowerCase().includes(query) ||
      employee.fullName?.toLowerCase().includes(query) ||
      employee.email?.toLowerCase().includes(query) ||
      employee.department?.toLowerCase().includes(query) ||
      employee.bloodGroup?.toLowerCase().includes(query) || 
      employee.jobTitle?.toLowerCase().includes(query) 
    )
  });

  const calculateExperience = (dateOfJoining) => {
    const today = new Date();
    const joiningDate = new Date(dateOfJoining);
    const years = today.getFullYear() - joiningDate.getFullYear();
    const months = today.getMonth() - joiningDate.getMonth();
    return `${years} Years ${months < 0 ? 12 + months : months} Months`;
  };

  const paginatedEmployees = filteredEmployees.slice((page - 1) * rowPerPage, page * rowPerPage);

  const hasChanges = ()=>{
    if (!currentEmployee || !originalEmployee) return false;
    return (
      currentEmployee.fullName !== originalEmployee.fullName ||
      currentEmployee.address !== originalEmployee.address ||
      currentEmployee.phone !== originalEmployee.phone ||
      currentEmployee.email !== originalEmployee.email ||
      currentEmployee.dateOfJoining !== originalEmployee.dateOfJoining ||
      currentEmployee.dateOfBirth !== originalEmployee.dateOfBirth ||
      currentEmployee.jobTitle !== originalEmployee.jobTitle
    );
  }

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    maxHeight: '90vh',
    overflowY: 'auto'
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Employee Directory
      </Typography>

      <Box sx={{ mb: 5, display: 'flex', gap: 2 }}>
        <TextField
          label="Search"
          variant="standard"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 400 }}
        />
      </Box>

      {paginatedEmployees.length === 0 ? (
        <Typography color="text.secondary">
          No Employee Matches for the Search criteria
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.dark' }}>
                {[
                  "Employee ID", "Full Name", "Address", "Phone", "Email",
                  "Date of Joining", "Date of Birth", "Job Title", "Department",
                  "Experience", "Blood Group", "Emergency Contact", "Action"
                ].map((header) => (
                  <TableCell key={header} sx={{ color: 'white' }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedEmployees.map((employee) => (
                <TableRow key={employee.id} hover>
                  <TableCell>{employee.employeeId}</TableCell>
                  <TableCell>{employee.fullName}</TableCell>
                  <TableCell>{employee.address}</TableCell>
                  <TableCell>{employee.phone}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{formatDate(employee.dateOfJoining)}</TableCell>
                  <TableCell>{formatDate(employee.dateOfBirth)}</TableCell>
                  <TableCell>{employee.jobTitle}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{calculateExperience(employee.dateOfJoining)}</TableCell>
                  <TableCell>{employee.bloodGroup}</TableCell>
                  <TableCell>{`${employee.emergencyName} (${employee.emergencyNumber})`}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleView(employee)} color="primary">
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton onClick={() => handleEdit(employee)} color="success">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(employee.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Stack spacing={2}>
          <Pagination
            count={Math.ceil(filteredEmployees.length / rowPerPage)}
            page={page}
            onChange={handleChangePage}
            color="primary"
          />
        </Stack>
      </Box>

      <Modal open={isEditing} onClose={() => setIsEditing(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            Edit Employee
          </Typography>
          <form onSubmit={handleUpdate}>
            {[
              { label: "Full Name", field: "fullName", type: "text" },
              { label: "Address", field: "address", type: "text" },
              { label: "Phone Number", field: "phone", type: "text" },
              { label: "Email", field: "email", type: "email" },
              { label: "Date Of Joining", field: "dateOfJoining", type: "date" },
              { label: "Date Of Birth", field: "dateOfBirth", type: "date" },
              { label: "Job Title", field: "jobTitle", type: "text" },
            ].map(({ label, field, type }) => (
              <TextField
                key={field}
                label={label}
                type={type}
                value={currentEmployee?.[field] || ""}
                onChange={(e) =>
                  setCurrentEmployee({
                    ...currentEmployee,
                    [field]: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
                variant="outlined"
              />
            ))}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => setIsEditing(false)} variant="outlined">
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary" disabled={!hasChanges()}>
                Update
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      <Modal open={!!viewEmployee} onClose={() => setViewEmployee(null)}>
        <Box sx={{ ...modalStyle, width: 500 }}>
          <Typography variant="h6" gutterBottom>
            Employee Detail
          </Typography>
          {viewEmployee && (
            <Box>
              {[
                ["Employee ID", viewEmployee.employeeId],
                ["Full Name", viewEmployee.fullName],
                ["Address", viewEmployee.address],
                ["Phone", viewEmployee.phone],
                ["Email", viewEmployee.email],
                ["Job Title", viewEmployee.jobTitle],
                ["Date of Joining",formatDate(viewEmployee.dateOfJoining)],
                ["Date of Birth", formatDate(viewEmployee.dateOfBirth)],
                ["Department", viewEmployee.department],
                ["Blood Group", viewEmployee.bloodGroup],
                ["Emergency Contact", `${viewEmployee.emergencyName} ${viewEmployee.emergencyNumber}`],
              ].map(([label, value]) => (
                <Typography key={label} sx={{ mb: 1 }}>
                  <strong>{label}: </strong> {value}
                </Typography>
              ))}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={() => setViewEmployee(null)} variant="outlined">
                  Close
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Modal> 
      <Dialog open = {deleteDialogOpen} TransitionComponent={Transiton} keepMounted onClose={handleDeleteCancel} aria-describedby="alert-dialog-slide-description">
        <DialogTitle>{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id = "alert-dialog-slide-decription">
              Are you sure want to delete this employee?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>

      </Dialog>
    </Box>
  );
};

export default EmployeeDirectory;