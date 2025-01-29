import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/sql", // Replace with your backend URL
});

export const uploadFiles = async (formData: FormData) => {
  return api.post("/upload", formData);
};

export const executeQueries = async () => {
  return api.get("/analyze");
};
