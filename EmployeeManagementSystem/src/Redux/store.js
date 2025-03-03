import { configureStore } from "@reduxjs/toolkit";
import employeeReducer from "./employeeSlice"
import attendanceReducer from './attendanceSlice'
import leaveReducer from './leaveSlice'

export const  store =  configureStore({
    reducer:{
        employee: employeeReducer,
        attendance: attendanceReducer,
        leave: leaveReducer,
    },
})

export default store;
