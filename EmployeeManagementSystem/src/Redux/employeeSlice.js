import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {db} from "../firebase"
import { collection,addDoc,updateDoc,deleteDoc,doc, getDocs } from 'firebase/firestore';



//feteching data from the firebase
 export const fetchEmployees = createAsyncThunk(
  "employeeDetails/fetchEmployees",
  async () => {
    const snapShot = await getDocs(collection(db, "employeeDetails"));
    return snapShot.docs.map((doc) => ({
      id: doc.id, 
      ...doc.data(), 
    }));
  } 
); 
// add a new employee 
export const addEmployee = createAsyncThunk(
  "employeeDetails/addEmployee",
  async (newEmployee) => {
    const docRef = await addDoc(collection(db, "employeeDetails"), newEmployee);
    return { id: docRef.id, employeeId:newEmployee.employeeId,...newEmployee }; 
  }
);
  export const editEmployee = createAsyncThunk("employeeDetails/editEmployee", async (updateEmployee) => {
    const { id, employeeId,...data } = updateEmployee;
    const docRef = doc(db, "employeeDetails", id);
    await updateDoc(docRef, data);
    return {...updateEmployee,employeeId};
  });
  export const deleteEmployee = createAsyncThunk  (
    "employeeDetails/deleteEmployee",
    async (id) => {
      const docRef = doc(db, "employeeDetails", id); 
      await deleteDoc(docRef);
      return id; 
    }
  );

const employeeSlice = createSlice({
    name: "employee",
    initialState:{
        employees:[],
        status:"idle",
        error: null,
        departmentWiseCount:{},
        totalDepartment :0,
        upcomingBirthday:[]


    },
    reducers: {},
    extraReducers:(builder)=>{
        builder
      // 🚀 Fetch employees: Pending state
        .addCase(fetchEmployees.pending,(state)=>{
            state.status ="loading"
        })
        .addCase(fetchEmployees.rejected,(state,action)=>{
            state.status ="failed"
            state.employees = action.error.message
        })
        // add 
        .addCase(addEmployee.fulfilled,(state,action)=>{
           state.employees.push(action.payload)
        })
        // edit
        .addCase(editEmployee.fulfilled, (state, action) => {
            const index = state.employees.findIndex((emp) => emp.id === action.payload.id);
            if (index !== -1) {
              state.employees[index] = action.payload;
            }
          })
          
          .addCase(deleteEmployee.fulfilled, (state, action) => {
            state.employees = state.employees.filter((emp) => emp.id !== action.payload);
          })

          // fetch employee sucesss state
          .addCase(fetchEmployees.fulfilled,(state,action)=>{
            state.status = "succeeded"
            state.employees = action.payload

            //count department.....
            const departmentCount = action.payload.reduce((acc,employee)=>{
              const department =( employee.department || "N/A").trim()
              acc[department]= (acc[department]|| 0)+1
              return acc
            },{})
            state.departmentWiseCount = departmentCount

            state.totalDepartment = Object.keys(departmentCount).length
            // console.log("Updated Departement Count ", state.departmentWiseCount);
            // console.log("Total Department Count",state.totalDepartment);

            const today = new Date()
            state.upcomingBirthday = action.payload.filter((employee)=>{
              if(!employee.dateOfBirth) return false;
  
              const [year,month,day] = employee.dateOfBirth.split("-").map(Number)
              const birthday = new Date(today.getFullYear(), month -1,day)
  
              const diffInDays = (birthday-today)/(1000*60*60*24);
  
              return diffInDays >= 0 && diffInDays <=7
            })
            .map((employee)=>({
              id: employee.id,
              fullName: employee.fullName,
              day: new Date(employee.dateOfBirth).getDate(),
              month: new Date(employee.dateOfBirth).toLocaleString('default',{month:"long"})
            }))
            
            console.log("Upcoming Birthday ", state.upcomingBirthday)
          })

          
    }
})
export default employeeSlice.reducer;