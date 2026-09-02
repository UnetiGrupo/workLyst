import { useState } from "react";
import axios from "axios";

export function useTaskStatus() {
  const [statuses, setStatuses] = useState();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const APP_API_KEY = process.env.NEXT_PUBLIC_APP_API_KEY;

  const getHeaders = () => {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "x-app-api-key": APP_API_KEY,
    };
  };

  const getStatuses = async () => {
    try {
      const response = await axios.get(`${API_URL}/task-statuses`, {
        headers: getHeaders(),
      });
      setStatuses(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return {
    statuses,
    getStatuses,
  };
}
