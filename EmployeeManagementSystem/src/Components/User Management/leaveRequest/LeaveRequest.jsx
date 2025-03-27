import { useState, useEffect ,} from "react";
import React from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import {Button,MenuItem,TextField,Card,Dialog,DialogTitle,DialogContent,DialogActions,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Paper,CircularProgress,Typography,Box,}from "@mui/material";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import {fetchLeaveRequests,addLeaveRequest,updateLeaveBalance,} from "../../../Redux/leaveSlice";
import { collection, onSnapshot, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { calculateLeaveDays } from "../../../utils/CalculateLeavesDays";


const LeaveSchema = Yup.object().shape({
  leaveType: Yup.string().required("Leave Type is required"),
  startDate: Yup.date()      
  .required("Start Date is required"),
  endDate: Yup.date()
    .required("End Date is required")
    .test("is-after-date","End date must be after the start date",function(value){
      return dayjs(value).isAfter(dayjs(this.parent.startDate))
    }),
  reason: Yup.string().required("Reason is required"),
});
const LeaveRequest = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);


  const dispatch = useDispatch();
  const { leaveRequests, loading, leaveBalance } = useSelector(
    (state) => state.leave
  );

  useEffect(() => {
    document.title = "Leave Rquest"
    const storedUser = JSON.parse(localStorage.getItem("CurrentUser"));
    if (storedUser) {
      const userId = storedUser.uid;
      setCurrentUser(storedUser);

      dispatch(fetchLeaveRequests(storedUser.uid));

      const userRef = doc(db, `users/${userId}`);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          dispatch(updateLeaveBalance(docSnap.data().leaveBalance));
        }
      });

      const leaveCollection = collection(db, `users/${userId}/leaveRequest`);
      const unsubscribe = onSnapshot(leaveCollection, (querySnapshot) => {
        let leaveRequests = [];
        querySnapshot.forEach((doc) => {
          leaveRequests.push({ id: doc.id, ...doc.data() });
        });
        dispatch(fetchLeaveRequests.fulfilled(leaveRequests));
      });
      return () => unsubscribe();
    }
  }, [dispatch]);

  const handleSubmit = async (values, { resetForm }) => {
    if (!currentUser) {
      toast.error("You must Login ");
      return;
    }
    const leaveData = {
      leaveType: values.leaveType,
      startDate: values.startDate,
      endDate: values.endDate,
      reason: values.reason,
      status: "Pending",
    };
    dispatch(addLeaveRequest({ userId: currentUser.uid, leaveData }))
      .unwrap()
      .then(() => {
        toast.success("Leave Request Successfully");
        setPreviewOpen(false);
        resetForm();
        dispatch(fetchLeaveRequests(currentUser.uid));
      })
      .catch((error) => {
        console.log("error in adding the leave request  ", error);
        toast.error("Failed in Submit the Leave Request");
      });
  };

  const LeaveBalanceBox = ({ leaveBalance }) => {
    return (
      <Card
        sx={{
          width: "fit-content",
          padding: 2,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          backgroundColor: "#f0f0f0",
          border: "1px solid #ddd",
        }}
      >
        <AccountBalanceIcon sx={{ color: "#3f51b5" }} />
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            Leave Balance
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Casual: {leaveBalance?.Casual || 0} | Sick:{" "}
            {leaveBalance?.Sick || 0} | Earned: {leaveBalance?.Earned || 0}
          </Typography>
        </Box>
      </Card>
    );
  };
  const handlePreview = (values, { validateForm, setTouched }) => {
    validateForm().then((errors) => {
      setTouched(
        Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
        true
      );
  
      if (Object.keys(errors).length === 0) {
        setPreviewData(values);
        setPreviewOpen(true);
      }
    });
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <LeaveBalanceBox leaveBalance={leaveBalance} />
      </Box>
      <Formik
        initialValues={{
          leaveType: "",
          startDate: "",
          endDate: "",
          reason: "",
        }}
        validationSchema={LeaveSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          submitForm,
          validateForm,
          setTouched,
          setFieldValue
        }) => (
          <Form>
            <TextField
              select
              label="Leave Type"
              name="leaveType"
              value={values.leaveType}
              onChange={handleChange}
              error={touched.leaveType && Boolean(errors.leaveType)}
              helperText={touched.leaveType && errors.leaveType}
              fullWidth
              margin="normal"
            >
              <MenuItem value="Casual"> Casual</MenuItem>
              <MenuItem value="Sick"> Sick</MenuItem>
              <MenuItem value="Earned"> Earned</MenuItem>
            </TextField>

            <Box sx={{ minHeight: 24 }}>
             {values.leaveType && (
               <Typography variant="body2" color="textSecondary">
                    Available leave balance for {values.leaveType}: {leaveBalance[values.leaveType]} days
               </Typography>
              )}
            </Box>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{display: "flex",gap: 2 ,alignItems:"center"}}>
              <DatePicker
                label="Start Date"
                format="DD-MM-YYYY"
                value={values.startDate ? dayjs(values.startDate) : null}
                onChange={(date)=>{
                  setFieldValue("startDate",date ? dayjs(date).format("YYYY-MM-DD"):"")
                  setTouched((prev)=> ({...prev, startDate:true}))
                }}
                disablePast
                slotProps={{
                  textField : {
                    fullWidth: true,
                    margin: "normal",
                    error: touched.startDate && Boolean(errors.startDate),
                    helperText: touched.startDate ? errors.startDate : ""
                  }
                }}/>
            <DatePicker  
            label = "End Date"
            format = "DD-MM-YYYY"
            value={values.endDate  ? dayjs(values.endDate): null}
            onChange={(date)=>{
              setFieldValue("endDate",date ? dayjs(date).format("YYYY-MM-DD"):"")
              setTouched((prev)=> ({...prev, endDate:true}))
            }}
            disablePast
            slotProps={{
              textField :{
                fullWidth: true,
                margin: "normal",
                error: touched.endDate && Boolean(errors.endDate),
                helperText:touched.endDate ? errors.endDate: ""
              }
            }}/>
            </Box>
            </LocalizationProvider>

            {values.startDate && values.endDate && (
              <Typography variant="body2" color="textSecondary" margin="normal">
                Leave Duration:{" "}
                {calculateLeaveDays(values.startDate, values.endDate)} days
              </Typography>
            )}
            <TextField
              label="Reason For Leave"
              name="reason"
              value={values.reason}
              onChange={handleChange}
              error={touched.reason && Boolean(errors.reason)}
              helperText={touched.reason && errors.reason}
              fullWidth
              multiline
              rows={3}
              margin="normal"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handlePreview(values, { validateForm, setTouched });
              }}
            >
              {" "}
              Preview
            </Button>
            <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)}>
              <DialogTitle>Leave Request Preview</DialogTitle>
              <DialogContent>
                <p>
                  <strong>Leave Type </strong>
                  {previewData?.leaveType}
                </p>
                <p>
                  <strong>Start Date </strong>
                  {previewData?.startDate}
                </p>
                <p>
                  <strong>End Date </strong>
                  {previewData?.endDate}
                </p>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setPreviewOpen(false)}>Cancel</Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setPreviewOpen(false);
                    submitForm();
                  }}
                >
                  Submit
                </Button>
              </DialogActions>
            </Dialog>
          </Form>
        )}
      </Formik>
      <h3 className=" text-center font-bold">Leave History </h3>
      {loading ? (
        <CircularProgress />
      ) : (
        <LeaveHistoryTable leaveRequests={leaveRequests} />
      )}
    </>
  );
};
const LeaveHistoryTable = ({ leaveRequests }) => {
  const dispatch = useDispatch()
  const currentUser = JSON.parse(localStorage.getItem("CurrentUser"))

  const handleCancelLeave = async(leave)=>{
    if(!currentUser){
      toast.error("You Must login to Cancel the leave")
      return;
    }
    const confirmCancel = window.confirm("Are you sure to want to cancel this leave request")
    if(!confirmCancel)return

    const leaveDays = leave.leaveDays
    try {
      //  Firestore to remove the leave request
      const leaveDocRef = doc(db, `users/${currentUser.uid}/leaveRequest`, leave.id);
      await deleteDoc(leaveDocRef);

      // Restore leave balance
      const userDocRef = doc(db, `users/${currentUser.uid}`);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const updatedLeaveBalance = {
          ...userData.leaveBalance,
          [leave.leaveType]: (userData.leaveBalance[leave.leaveType] || 0) + leaveDays,
        };

        await updateDoc(userDocRef, { leaveBalance: updatedLeaveBalance });

        dispatch(updateLeaveBalance(updatedLeaveBalance));
        dispatch(fetchLeaveRequests(currentUser.uid));

        toast.success("Leave request canceled successfully.");
      }
    } catch (error) {
      console.error("Error canceling leave:", error);
      toast.error("Failed to cancel leave.");
    }
  };
  return (
    <TableContainer component={Paper} sx={{ marginTop: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell> <strong>Leave Type</strong> </TableCell>
            <TableCell><strong>Start Date</strong></TableCell>
            <TableCell><strong>End Date</strong></TableCell>
            <TableCell> <strong>Reason</strong></TableCell>
            <TableCell> <strong>Status</strong></TableCell>
            <TableCell> <strong>Action</strong> </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leaveRequests && leaveRequests.length > 0 ? (
            leaveRequests.map((leave) => (
              <TableRow key={leave.id}>
                <TableCell>{leave.leaveType}</TableCell>
                <TableCell>{leave.startDate}</TableCell>
                <TableCell>{leave.endDate}</TableCell>
                <TableCell>{leave.reason}</TableCell>
                <TableCell 
                    sx={{
                      color:leave.status === "Approved" ? "green":
                            leave.status === "Rejected" ? "red":"black",
                      fontWeight:"bold"      
                    }}>
                  {leave.status}
                  </TableCell>
                <TableCell>
                  {leave.status === "Pending" && (
                    <Button 
                    variant="contained"
                    color="secondary"
                    onClick={()=> handleCancelLeave(leave)}
                    size="small"
                    > Cancel 
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No Leave record found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default LeaveRequest;