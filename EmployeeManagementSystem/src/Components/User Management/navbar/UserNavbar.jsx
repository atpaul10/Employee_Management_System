import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkInOut } from "../../../Redux/attendanceSlice";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";


const UserNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // const officeLocation = { lat: 22.30108644912575, lng: 73.13965197117078 };
  // const officeLocation = { lat: 22.33494, lng: 73.14214 };  // house location for testing

  const officeLocation = [
    {id:1, name:"Head Office",lat:22.3018644912575, lng:73.13965197117078},
    {id:2, name:"Branch Ofiice", lat:22.33494, lng: 73.14214},
    {id:3, name:"DCA",lat:22.312173465331593,lng: 73.18559329723857}
  ]
  const allowedRadius = 400;

  const [currentUser, setCurrentUser] = useState(null);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const storedUser = localStorage.getItem("CurrentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    const interval = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getDistance = (lat1, log1, lat2, log2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (log2 - log1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000
  };

  const { hasCheckedIn, hasCheckedOut } = useSelector(
    (state) => state.attendance
  );
  const handleCheckInOut = (type) => {
    if (!currentUser) {
      console.log("No user is logged");
      return;
    }

    navigator.geolocation.getCurrentPosition(
        (postion)=>{
          const{latitude,longitude}= postion.coords
          console.log(postion);
          
          let iswithOffice = false
          let officename = ""

          for(const office of officeLocation){
            const distance = getDistance(latitude,longitude,office.lat,office.lng);
            if(distance <= allowedRadius){
              iswithOffice = true;
              officename = office.name
              break;
            }
          }
            if(iswithOffice){
             dispatch(checkInOut({ type, currentUser }));
              toast.success(`${type} successfull at ${officename}`)
            }else{
              toast.error(`You must be in the ${allowedRadius} meters of an office to ${type}`)
            }
        },
        (error)=>{
          console.log("Geoloaction error",error)
          toast.error("Failed to get your Location.Please enable the location service")
        }
    )
  };
  const isCheckOutDisable = !hasCheckedOut || hasCheckedOut;

  const handleLogout = () => {
    localStorage.removeItem("CurrentUser");
    setCurrentUser(null);
    navigate("/login");
  };

  return (
    <header className="bg-[#40513B] text-[#EDF1D6] fixed top-0 left-60 right-0 z-10 h-16 ">
      <div className="flex justify-between items-center h-full px-4">
        {/* Search Input */}
        <div className="flex items-center space-x-2"> </div>

        {/* Date, Time, and Icons */}
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-4">
            <span>{date.toLocaleDateString()}</span>
            <span>{date.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center space-x-4"> </div>

          <div>
            {!hasCheckedIn ? (
              <button
                className="px-4 py-2 bg-[#EDF1D6] text-black rounded hover:bg-[#9DC08B] transition"
                onClick={() => handleCheckInOut("check-in")}
              >
                Clock-In
              </button>
            ) : (
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-300 transition"
                onClick={() => handleCheckInOut("check-out")}
                // disabled = {isCheckOutDisable}
              >
                Clock-Out
              </button>
            )}
          </div>
          {currentUser && (
            <button
              className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600 transition"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
export default UserNavbar;