import axios from "axios";

// ================= BASE URL =================
const BASE_URL = "https://localhost:7180/api/";

// ================= AXIOS INSTANCE =================
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ================= COMMON HEADER BUILDER =================
const getHeaders = (isAuth) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (isAuth) {
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

// ================= GET REQUEST =================
export const getRequest = async (endpoint, payload = null, isAuth = false) => {
  try {
    const response = await axiosInstance.get(endpoint, {
      params: payload,
      headers: getHeaders(isAuth),
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ================= POST REQUEST =================
export const postRequest = async (endpoint, payload = {}, isAuth = false) => {
  try {
    const response = await axiosInstance.post(endpoint, payload, {
      headers: getHeaders(isAuth),
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ================= PUT REQUEST =================
export const putRequest = async (endpoint, payload = {}, isAuth = false) => {
  try {
    const response = await axiosInstance.put(endpoint, payload, {
      headers: getHeaders(isAuth),
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ================= DELETE REQUEST =================
export const deleteRequest = async (endpoint, payload = {}, isAuth = false) => {
  try {
    const response = await axiosInstance.delete(endpoint, {
      data: payload,
      headers: getHeaders(isAuth),
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};