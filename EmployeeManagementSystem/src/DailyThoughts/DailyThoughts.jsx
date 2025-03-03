import { useState, useEffect } from "react";
import axios from "axios";
import { Snackbar, Alert, } from "@mui/material";

const DailyThoughts = () => {
  const [thought, setThought] = useState("");
  const [author, setAuthor] = useState("");
  const [open, setOpen] = useState(false);

  const fetchThoughts = async () => {
    try {
      // const response = await axios.get("https://quotes-api-self.vercel.app/quote")
      const response = await axios.get(
        "https://randominspirationalquotes.onrender.com"
      );
      // const response = await axios.get("https://api.realinspire.live/v1/quotes/random")

      setThought(response.data.quote);
      setAuthor(response.data.author);
      setOpen(true);
      //   setThought(response.data[0].content)
      //  setAuthor(response.data[0].author)

      console.log("Data from the api", response);
    } catch (error) {
      console.log("Failed in fetching the Api of Daily Thoughts", error);
    }
  };
  useEffect(() => {
    // fetchThoughts();
  }, []);

  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{top:"70px !important"}}>

        <Alert 
          onClose={() => setOpen(false)}
          sx={{ width: "100%" }}
          icon ={false}>

          "{thought}" — {author}
        </Alert>
      </Snackbar>
    </>
  );
};
export default DailyThoughts;
