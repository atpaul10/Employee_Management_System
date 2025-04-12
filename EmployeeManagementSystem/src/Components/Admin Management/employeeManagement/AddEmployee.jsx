import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import useGenerateId from "./Hooks/useGenerateId";
import { addEmployee } from "../../../Redux/employeeSlice";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

const AddEmployee = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      fullName: "",
      address: "",
      phone: "",
      email: "",
      jobTitle: "",
      department: "",
      bloodGroup: "",
      dateOfJoining: "",
      dateOfBirth: "",
      emergencyName: "",
      emergencyNumber: "",
    },
  });

  useEffect(() => {
    document.title = "Add Employee";
  }, []);

  const dispatch = useDispatch();
  const generateId = useGenerateId();

  const onSubmit = async (data) => {
    try {
      const uniqueId = generateId(data.department);
      const employeeData = { ...data, employeeId: uniqueId };
      await dispatch(addEmployee(employeeData)).unwrap();
      toast.success("Employee Detail Added Successfully");
      reset(); // This will reset all fields to their defaultValues
    } catch (error) {
      console.log("Error in adding data", error);
      toast.error("Failure");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Add Employee
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Full Name and Address */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                {...register("fullName", { required: "Full Name is required" })}
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Address"
                {...register("address", { required: "Address is required" })}
                error={!!errors.address}
                helperText={errors.address?.message}
                variant="outlined"
              />
            </Grid>

            {/* Phone and Email */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                {...register("phone", {
                  required: "Phone is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Enter a valid 10-digit phone number",
                  },
                })}
                error={!!errors.phone}
                helperText={errors.phone?.message}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Enter a valid email address",
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                variant="outlined"
              />
            </Grid>

            {/* Job Title and Department */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Job Title"
                {...register("jobTitle", { required: "Job Title is required" })}
                error={!!errors.jobTitle}
                helperText={errors.jobTitle?.message}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined" error={!!errors.department}>
                <InputLabel>Department</InputLabel>
                <Controller
                  name="department"
                  control={control}
                  rules={{ required: "Department is required" }}
                  render={({ field }) => (
                    <Select {...field} label="Department">
                      <MenuItem value="" disabled>
                        Select Department
                      </MenuItem>
                      <MenuItem value="HR">HR</MenuItem>
                      <MenuItem value="Marketing">Marketing</MenuItem>
                      <MenuItem value="IT">IT</MenuItem>
                      <MenuItem value="Finance">Finance</MenuItem>
                    </Select>
                  )}
                />
                {errors.department && (
                  <Typography color="error" variant="caption">
                    {errors.department.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Blood Group and Date of Joining */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Blood Group"
                {...register("bloodGroup", { required: "Blood Group is required" })}
                error={!!errors.bloodGroup}
                helperText={errors.bloodGroup?.message}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Joining"
                type="date"
                InputLabelProps={{ shrink: true }}
                {...register("dateOfJoining", { required: "Date of Joining is required" })}
                error={!!errors.dateOfJoining}
                helperText={errors.dateOfJoining?.message}
                variant="outlined"
              />
            </Grid>

            {/* Date of Birth */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
                {...register("dateOfBirth", { required: "Date of Birth is required" })}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth?.message}
                variant="outlined"
              />
            </Grid>

            {/* Emergency Contact */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Emergency Contact
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    {...register("emergencyName", { required: "Emergency Name is required" })}
                    error={!!errors.emergencyName}
                    helperText={errors.emergencyName?.message}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    {...register("emergencyNumber", {
                      required: "Emergency Phone Number is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Enter a valid 10-digit phone number",
                      },
                    })}
                    error={!!errors.emergencyNumber}
                    helperText={errors.emergencyNumber?.message}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ py: 1.5 }}
              >
                Add Employee
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Container>
  );
};

export default AddEmployee;