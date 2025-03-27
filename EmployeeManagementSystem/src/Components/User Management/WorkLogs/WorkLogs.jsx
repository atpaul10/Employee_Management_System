import { useState, useEffect } from "react";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import { Box, TextField, Button, MenuItem, Typography, Grid, IconButton, } from "@mui/material";
import {  DatePicker, TimePicker,LocalizationProvider,} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useSelector, useDispatch } from "react-redux";
import { db } from "../../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { fetchEmployees } from "../../../Redux/employeeSlice";
import { Add, Remove } from "@mui/icons-material";

const taskSchema = Yup.object({
  task: Yup.string().required("Task is required"),
  description: Yup.string().required("Description is required"),
  status: Yup.string().required("Status is required."),
  startTime: Yup.date().required("Time is required").typeError("Invalid Time"),
  endTime: Yup.date()
    .required("Time is required")
    .typeError("Invalid Time")
    .min(Yup.ref("startTime"), "End time must be after start time"),
});
const validationSchema = Yup.object({
  date: Yup.date().required("Date is requrired").typeError("Invalid Date"),
  tasks: Yup.array().of(taskSchema),
});

const WorkLogs = () => {
  const dispatch = useDispatch();
  const [duration, setDuration] = useState("");
  const [matchedEmployee, setMatchedEmployee] = useState(null);

  const allEmployees = useSelector((state) => state.employee.employees);
  // console.log("All Employees:", allEmployees); 

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("CurrentUser"));

    if (currentUser && allEmployees.length) {
      const matched = allEmployees.find(
        (emp) => emp.fullName.trim() === currentUser?.name.trim()
      );

      if (matched && matchedEmployee?.id !== matched.id) {
        console.log("Employee Found", matched);
        setMatchedEmployee(matched);
      } else if (!matched) {
        console.log("Employee Not Found");
      }
    }
  }, [allEmployees]);             
  useEffect(() => {
    dispatch(fetchEmployees());
    document.title=("Work-Logs")
  }, []);

  const calculateWorkHours = (startTime, endTime) => {
    if (startTime && endTime) {
      const diff = (new Date(endTime) - new Date(startTime)) / (1000 * 60);
      const hours = Math.floor(diff / 60);
      const mintues = diff % 60;
      setDuration(`${hours}h ${mintues}m`);
      return `${hours}h ${mintues}m`;
    }
    return ""; 
  };

  const handleSubmit = async (values, { resetForm }) => {
    const currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
    if (!matchedEmployee) {
      console.log("No Employee Found ");
      return;
    }
    try {
      const date = dayjs(values.date).format("YYYY-MM-DD")
      const workLogRef = doc(db, "users", currentUser.uid, "workLogs",date);

      const taskArray = values.tasks.map((task)=>({
        employeeId: matchedEmployee.employeeId,
        fullName: matchedEmployee.fullName,
        department:matchedEmployee.department,
        task: task.task,
        description: task.description,
        startTime: task.startTime ? task.startTime.toDate() : null,  
        endTime: task.endTime ? task.endTime.toDate():null,
        duration: calculateWorkHours(task.startTime,task.endTime),
        status: task.status
      }))
      const docSnap = await getDoc(workLogRef);
      if(docSnap.exists()){
        const exisitingData = docSnap.data()
        const updatedTask = [...(exisitingData.tasks || []),...taskArray]
        await setDoc(workLogRef,{tasks: updatedTask,date:values.date.toDate()},{merge:true});
      }else{
        await setDoc(workLogRef,{tasks:taskArray,date:values.date.toDate() })
      }
      
      console.log("Work_Log Added Sucessfully ");
      toast.success("Work Log Added");
      resetForm({
        values: {
          date: dayjs(),
          tasks: [
            {
              task: "",
              description: "",
              startTime: null,
              endTime: null,
              status: "",
            },
          ],
        },
      });
      setDuration("");
    } catch (error) {
      console.log("Error in Adding the work log", error);
      toast.error("Failed in Adding the Work-logs");
    }
  };
  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Formik
          initialValues={{
            date: dayjs(),
            tasks: [
              {
                task: "",
                description: "",
                startTime: null,
                endTime: null,
                status: "",
              },
            ],
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}>
          {({  values,  setFieldValue,  errors,  touched,  handleChange, handleBlur,}) => (
            <Form>
              <Box sx={{ margin: "0 auto", p: 3 }}>
               <Grid item xs={2}>
                <Typography variant="h5">
                   Add Work-Logs 
                </Typography>
               </Grid>
                <Grid container spacing={2} mb={3} mt={2}>
                  {/* Employee ID   */}
                  <Grid item xs={3}>
                    <TextField
                      label="Employee ID "
                      value={matchedEmployee?.employeeId || ""}
                      slotProps={{
                        input: { readOnly: true },
                      }}
                      sx={{
                        backgroundColor: "#f5f5f5",
                      }}
                    />
                  </Grid>

                  {/* fullName */}
                  <Grid item xs={3}>
                    <TextField
                      label="Full-Name"
                      value={matchedEmployee?.fullName || ""}
                      slotProps={{
                        input: { readOnly: true },
                      }}
                      sx={{
                        backgroundColor: "#f5f5f5",
                      }}
                    />
                  </Grid>

                  {/* department */}
                  <Grid item xs={3}>
                    <TextField
                      label="Department"
                      value={matchedEmployee?.department || ""}
                      slotProps={{
                        input: { readOnly: true },
                      }}
                      sx={{
                        backgroundColor: "#f5f5f5",
                      }}
                    />
                  </Grid>

                  {/* date */}
                  <Grid item xs={3}>
                    <DatePicker
                      value={values.date}
                      onChange={(value) => setFieldValue("date", value)}
                      label="Today Date"
                      slotProps={{
                        textField: {
                          error: touched.date && !!errors.date,
                          helperText: touched.date && errors.date,
                          slotProps: {
                            input: { readOnly: true },
                          },
                        },
                      }}
                      disablePast
                      disableFuture
                      disableOpenPicker
                      sx={{ backgroundColor: "#f5f5f5" }}
                    />
                  </Grid>
                </Grid>

                <FieldArray name="tasks">
                  {({ push, remove }) => (
                    <>
                      {values.tasks.map((task, index) => (
                        <Grid container spacing={2} key={index} mt={2}>
                          {/* Task  */}
                          <Grid item xs={5}>
                            <TextField
                              name={`tasks[${index}].task`}
                              label="Task"
                              fullWidth
                              value={task.task}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={ touched.tasks?.[index]?.task && !! errors.tasks?.[index]?.task}
                              helperText={ touched.tasks?.[index]?.task &&  errors.tasks?.[index]?.task}
                            />
                          </Grid>

                          {/* description  */}
                          <Grid container spacing={2} mt={2} m={0}>
                            <Grid item xs={12}>
                              <TextField
                                name={`tasks[${index}].description`}
                                value={task.description || ""}
                                label="Description"
                                fullWidth
                                multiline
                                rows={4}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={ touched.tasks?.[index]?.description && !! errors.tasks?.[index]?.description}
                                helperText={ touched.tasks?.[index]?.description && errors.tasks?.[index]?.description  }
                              />
                            </Grid>
                          </Grid>

                          <Grid container spacing={2} mt={2}  m={0}>
                            {/* start time  */}
                            <Grid item xs={2}>
                              <TimePicker
                                value={task.startTime || null}
                                onChange={(value) =>
                                  setFieldValue(`tasks[${index}].startTime`,value)
                                }
                                label="Start-Time"
                                slotProps={{
                                  textField: {
                                    error: touched.tasks?.[index]?.startTime && !!errors.tasks?.[index]?.startTime,
                                    helperText: touched.tasks?.[index]?.startTime && errors.tasks?.[index]?.startTime,
                                  },
                                }}
                              />
                            </Grid>
                            {/* end time  */}
                            <Grid item xs={2}>
                              <TimePicker
                                value={task.endTime || null}
                                onChange={(value) =>
                                  setFieldValue(`tasks[${index}].endTime`,value)
                                }
                                label="End-Time"
                                slotProps={{
                                  textField: {
                                    error: touched.tasks?.[index]?.endTime && !!errors.tasks?.[index]?.endTime,
                                    helperText:touched.tasks?.[index]?.endTime && errors.tasks?.[index]?.endTime,
                                  },
                                }}/>
                            </Grid>
                            {/* duration  */}
                            <Grid item xs={2}>
                              <TextField
                                label="Duration"
                                value={ calculateWorkHours( task.startTime, task.endTime) || ""}
                                slotProps={{
                                  input: { readOnly: true },
                                }}
                                sx={{ backgroundColor: "#f5f5f5" }}
                              />
                            </Grid>
                          </Grid>

                          {/* Status and submit  */}
                          <Grid container spacing={2} mt={2} m={0}>
                            <Grid item xs={2}>
                              <TextField
                                select
                                name={`tasks[${index}].status`}
                                label="Status"
                                fullWidth
                                value={task.status}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.tasks?.[index]?.status && !!errors.tasks?.[index]?.status}
                                helperText={ touched.tasks?.[index]?.status && errors.tasks?.[index]?.status }
                              >
                                <MenuItem value="" disabled>
                                  Select Status
                                </MenuItem>
                                <MenuItem value="Pending">Pending</MenuItem>
                                <MenuItem value="In Progress">
                                  In Progress
                                </MenuItem>
                                <MenuItem value="Completed">Completed</MenuItem>
                              </TextField>
                            </Grid>
                            {/* remove button  */}
                            <Grid item xs={2}>
                              {index > 0 && (
                                <IconButton
                                  onClick={() => remove(index)}
                                  color="error">
                                  <Remove />
                                </IconButton>
                              )}
                            </Grid>
                          </Grid>
                        </Grid>
                      ))}
                      <Button
                        onClick={() =>
                          push({
                            task: "",
                            description: "",
                            startTime: null,
                            endTime: null,
                            status: "",
                          })
                        }
                        startIcon={<Add />}
                        sx={{ mt: 2 }} >
                        Add Task
                      </Button>
                    </>
                  )}
                </FieldArray>
                <Grid item xs={3} mt={3}>
                  <Button type="submit" variant="contained" color="primary">
                    Submit Work Logs
                  </Button>
                </Grid>
              </Box>
            </Form>
          )}
        </Formik>
      </LocalizationProvider>
    </>
  );
};
export default WorkLogs;