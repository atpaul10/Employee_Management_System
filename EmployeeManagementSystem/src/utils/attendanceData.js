
const today = new Date();
today.setHours(0, 0, 0, 0);

const attendanceTimeTrend = attendanceRecords
  .filter((record) => {
    const checkInDate = record.checkIn ? new Date(record.checkIn.toDate()) : null;
    const checkOutDate = record.checkOut ? new Date(record.checkOut.toDate()) : null;

    return (
      (checkInDate && checkInDate >= today) ||
      (checkOutDate && checkOutDate >= today)
    );
  })
  .map((record) => [
    record.checkIn
      ? {
        time: formatTime(record.checkIn),
        timeValue: getTimeValue(record.checkIn),
        type: "Check-In",
      }
      : null,
    record.checkOut
      ? {
        time: formatTime(record.checkOut),
        timeValue: getTimeValue(record.checkOut),
        type: "Check-Out",
      }
      : null,
  ])
  .flat()
  .filter(Boolean);

const checkInCount = {}
const checkOutCount = {}
attendanceTimeTrend.forEach((item) => {
  if (item.type === "Check-In") {
    checkInCount[item.time] = (checkInCount[item.time] || 0) + 1
  } else if (item.type === "Check-Out") {
    checkOutCount[item.time] = (checkOutCount[item.time] || 0) + 1
  }
})
const sortedTimeLabels = [...new Set(Object.keys(checkInCount).concat(Object.keys(checkOutCount)))].sort(
  (a, b) => new Date(a) - new Date(b));

c

function formatTime(time) {
  if (time instanceof Timestamp) {
    time = time.toDate();
  }
  return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getTimeValue(time) {
  if (time instanceof Timestamp) {
    time = time.toDate();
  }
  return time.getTime();
}