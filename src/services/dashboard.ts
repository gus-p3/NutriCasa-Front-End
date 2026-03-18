import axios from "axios";

export const getDashboard = async () => {

  const email = localStorage.getItem("email");

  const res = await axios.get("/api/dashboard", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    params: {
      email: email
    }
  });

  return res.data;
};