import React from "react";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { Box, Typography, Paper, Tooltip, Chip, CircularProgress,} from "@mui/material";
import dayjs from "dayjs";

const HolidayCalendar = ({
  countryCode = "IN",
  year = dayjs().year(),
  onDateChange,
}) => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [holidayList, setHolidayList] = useState([]);

  const API_KEY = "jEuwLxGrmybHB9s6mvxuVvwWH3nBDkrn";

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await axios.get(
          `https://calendarific.com/api/v2/holidays?&api_key=${API_KEY}&country=${countryCode}&year=${year}`
        );
        const holiday = response.data.response.holidays;
        console.log("Fetched Holidays:", holiday);
        setHolidayList(holiday);
      } catch (error) {
        console.log("Error fetching Holidays:", error);
      }
    };
    // fetchHolidays();
  }, [countryCode, year]);

  const holidayDates = useMemo(() => {
    const dates = holidayList.reduce((acc, holiday) => {
      const dateStr = dayjs(holiday.date.iso).format("YYYY-MM-DD");
      acc[dateStr] = {
        name: holiday.name,
        types: holiday.type,
      };
      return acc;
    }, {});
    console.log("Holidays Dates Map:", dates);
    return dates;
  }, [holidayList]);

  const renderDay = (dayProps) => {
    const dayjsDate = dayjs(dayProps.day)
    const dayString = dayjsDate.format("YYYY-MM-DD");
    const holidayInfo = holidayDates[dayString];
    const isHoliday = !!holidayInfo;
    const holidayName = holidayInfo?.name || "";
    const holidayTypes = holidayInfo?.types || [];
    const today = dayjs()

    let backgroundColor = undefined;
    let hoverColor = undefined;

    if (isHoliday) {
      // console.table(`Holiday detected: ${dayString} - ${holidayName}`);
      if(dayjsDate.isSame(today,'day')|| dayjsDate.isAfter(today,"day")){
        if(holidayTypes.includes("National holiday")){
          backgroundColor = "#f44336";
          hoverColor = "#d32f2f";
        }else if(holidayTypes.includes("Optional holiday")){
          backgroundColor = "#FFD700  ";
          hoverColor = "#ffc107";
        }
      }
    }

    return (
      <Tooltip title={isHoliday ? `${holidayName}` : ""} arrow>
        <PickersDay
          {...dayProps}
          sx={{
            bgcolor: backgroundColor,
            // color: isHoliday ? "black" : undefined,
            // fontWeight: isHoliday ? "bold" : undefined,
            "&:hover": {
              bgcolor: hoverColor,
            },
          }}
        />
      </Tooltip>
    );
  };

  const handleDateChange = (newValue) => {
    setSelectedDate(newValue);
    if (onDateChange) {
      const dayString = newValue.format("YYYY-MM-DD");
      const holidayInfo = holidayDates[dayString];
      const isHoliday = !!holidayInfo;
      onDateChange(newValue, isHoliday, holidayInfo?.types || []);
    }
  };
  const selectedDayString = selectedDate.format("YYYY-MM-DD");
  const selectedHolidayInfo = holidayDates[selectedDayString];
  const isSelectedHoliday = !!selectedHolidayInfo;
  const selectedHolidayName = selectedHolidayInfo?.name || "";

  const today = dayjs();
  const nextHolidays = useMemo(() => {
    const futureHoliday = Object.entries(holidayDates)
      .filter(([date]) => dayjs(date).isAfter(today))
      .sort(([dateA], [dateB]) => dayjs(dateA).diff(dayjs(dateB)));

    let nextNational = null;
    let nextOptional = null;

    for (const [date, info] of futureHoliday) {
      if (info.types.includes("National holiday") && !nextNational) {
        nextNational = {
          date,
          name: info.name,
          daysUntil: dayjs(date).diff(today, "day"),
        };
      } else if (info.types.includes("Optional holiday") && !nextOptional) {
        nextOptional = {
          date,
          name: info.name,
          daysUntil: dayjs(date).diff(today, "day"),
        };
      }
      if (nextNational && nextOptional) break;
    }
    return { nextNational, nextOptional };
  }, [holidayDates]);

  const getProgressValue = (daysUntil) => {
    const maxDays = 30;
    const cappedDays = Math.min(daysUntil, maxDays);
    return (1 - cappedDays / maxDays) * 100;
  };
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 3,
        borderRadius: 2,
        maxWidth:{xs:"100%",md:300},
        width:"100%",

      }}
    >
      <Typography variant="h5" gutterBottom sx={{ color: "primary.main" }}>
        Calendar {year}
      </Typography>

      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <Chip
          label="National Holiday"
          sx={{ bgcolor: "#f44336", color: "white" }}
        />
        <Chip
          label="Optional Holiday"
          sx={{ bgcolor: "#d0d629", color: "black" }}
        />
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: 1,
          bgcolor: "background.paper",
          borderRadius: 2,
          width: "100%",
          maxWidth: {xs:"100%",md: 250},
          maxHeight: 350
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            value={selectedDate}
            onChange={handleDateChange}
            slots={{
              day: renderDay,
            }}
            sx={{width:"100%",height:"auto"}}
          />
        </LocalizationProvider>
        <Box sx={{ textAlign: "center" }}>
          {isSelectedHoliday && (
            <Typography variant="body1" sx={{ mt: 2, color: "text.primary" }}>
              Today : {selectedHolidayName}
            </Typography>
          )}
        </Box>
      </Paper>
      <Box sx={{ mt: 2, display: "flex", gap: 4 }}>
        {nextHolidays.nextNational && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <CircularProgress
                variant="determinate"
                value={getProgressValue(nextHolidays.nextNational.daysUntil)}
                size={50}
                thickness={4}
                sx={{ color: "#f44336" }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: "absolute",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.primary"
                >
                  {nextHolidays.nextNational.daysUntil} Days
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2">
              Next Holiday: {nextHolidays.nextNational.name}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HolidayCalendar;
