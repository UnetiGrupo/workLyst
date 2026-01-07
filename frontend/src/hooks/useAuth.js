import { useState } from "react";
import axios from "axios";

export function useAuth() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const register = async (userData) => {
    setLoading(true);
    try {
      await axios.post(API_URL + "/api/auth/register", userData);
      setSuccess(true);
    } catch (error) {
      setError(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    setLoading(true);
    try {
      await axios.post(API_URL + "/api/auth/login", userData);
      setSuccess(true);
    } catch (error) {
      setError(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    login,
    success,
    error,
    loading,
  };
}
