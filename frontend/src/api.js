import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.29.170:5000",
});

export default api;

// example usage (remove or comment out in production)
// api.post("/api/auth/login", { username, password })
//   .then(res => console.log(res.data))
//   .catch(err => console.error(err));
