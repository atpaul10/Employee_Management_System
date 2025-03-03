import dayjs from "dayjs";

 export const calculateLeaveDays = (startDate , endDate) =>{
    if(!startDate || !endDate) return 0
    
    let currentDate = dayjs(startDate)
    const end = dayjs(endDate)
    let count = 0

    while (currentDate.isBefore(end) || currentDate.isSame(end,"day")) {
        const dayOfWeek = currentDate.day()

        if(dayOfWeek !== 0 && dayOfWeek !==6){
          count++
        }
        currentDate = currentDate.add(1,"day")
    }
    return count
  }