import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import employeeReducer from "./employeeSlice"
import attendanceReducer from './attendanceSlice'
import leaveReducer from './leaveSlice'
import workLogsReducer from './workLogsSlice'
import themeReducer from './themeSlice'

const appReducers = combineReducers({
    employee: employeeReducer,
    attendance: attendanceReducer,
    leave: leaveReducer,
    workLogs: workLogsReducer,
    theme: themeReducer
})

const  rootReducers = (state,action)=>{
    if(action.type === "REST_STATE"){
        state = undefined
    }
    return appReducers(state,action)
}
const persistConfig = {
    key: 'root',
    storage
}
const persistedReducer = persistReducer(persistConfig, rootReducers)
// export const  store =  configureStore({
//     reducer:{
//         employee: employeeReducer,
//         attendance: attendanceReducer,
//         leave: leaveReducer,
//     },
// })
const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
})
const persistor = persistStore(store)
// export default store;

export { store, persistor }
