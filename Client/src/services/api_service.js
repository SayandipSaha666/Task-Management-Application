
// ----------------------------- Monolith Architecture--------------------------------

import axios from "axios"
const API_BASE_URL = import.meta.env.VITE_API_URL || `http://localhost:${process.env.PORT}`;
export const callRegisterUserApi = async (data) => {
    const response = await axios.post(`${API_BASE_URL}/api/user/register`, data, {
        withCredentials: true
    })
    return response?.data
}
export const callLoginUserApi = async (data) => {
    const response = await axios.post(`${API_BASE_URL}/api/user/login`, data, {
        withCredentials: true
    })
    return response?.data
}
export const callUserAuthApi = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/user/auth`, {}, {
            withCredentials: true
        })
        return response?.data
    } catch (error) {
        return error?.response?.data || {
            success: false,
            message: "User not authenticated"
        }
    }
}
export const callLogoutUserApi = async () => {
    const response = await axios.post(`${API_BASE_URL}/api/user/logout`, {}, {
        withCredentials: true
    })
    return response?.data
}

export const addNewTaskAPI = async(formData) => {
    const response = await axios.post(`${API_BASE_URL}/api/task/add`,formData, {
        withCredentials: true
    });
    return response?.data
} 

export const getAllTaskAPI = async(id) => {
    const response = await axios.get(`${API_BASE_URL}/api/task/all/${id}`, {
        withCredentials: true
    })
    return response?.data // getting from controller/getAllTasks
}

export const deleteTaskAPI = async(id) => {
    const response = await axios.delete(`${API_BASE_URL}/api/task/delete/${id}`, {},{
        withCredentials: true
    })
    return response?.data
}

export const updateTaskAPI = async(formData) => {
    const response = await axios.put(`${API_BASE_URL}/api/task/update`, formData, {
        withCredentials: true
    })
    return response?.data
}



// ---------------------------- Microservice Architecture ----------------------------------------

/*
import axios from "axios";

// ─── Single source of truth for the API URL ────────────────────
// Change this ONE line when deploying to production
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// ─── User APIs ─────────────────────────────────────────────────
export const callRegisterUserApi = async (data) => {
  const response = await axios.post(`${API_BASE_URL}/api/user/register`, data, {
    withCredentials: true
  });
  return response?.data;
};

export const callLoginUserApi = async (data) => {
  const response = await axios.post(`${API_BASE_URL}/api/user/login`, data, {
    withCredentials: true
  });
  return response?.data;
};

export const callUserAuthApi = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/user/auth`, {}, {
      withCredentials: true
    });
    return response?.data;
  } catch (error) {
    return error?.response?.data || {
      success: false,
      message: "User not authenticated"
    };
  }
};

export const callLogoutUserApi = async () => {
  const response = await axios.post(`${API_BASE_URL}/api/user/logout`, {}, {
    withCredentials: true
  });
  return response?.data;
};

// ─── Task APIs ─────────────────────────────────────────────────
export const addNewTaskAPI = async (formData) => {
  const response = await axios.post(`${API_BASE_URL}/api/task/add`, formData, {
    withCredentials: true
  });
  return response?.data;
};

export const getAllTaskAPI = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/api/task/all/${id}`, {
    withCredentials: true
  });
  return response?.data;
};

export const deleteTaskAPI = async (id) => {
  // ⚠️ BUG FIX: axios.delete() takes URL and config — NOT URL, data, config
  // Old:  axios.delete(url, {}, { withCredentials: true })  ← {} is treated as config!
  // New:  axios.delete(url, { withCredentials: true })       ← correct
  const response = await axios.delete(`${API_BASE_URL}/api/task/delete/${id}`, {
    withCredentials: true
  });
  return response?.data;
};

export const updateTaskAPI = async (formData) => {
  const response = await axios.put(`${API_BASE_URL}/api/task/update`, formData, {
    withCredentials: true
  });
  return response?.data;
};

// ─── Notification APIs ──────────────────────────────────────
export const getNotificationsAPI = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/api/notification/${userId}`, {
    withCredentials: true
  });
  return response?.data;
};

export const markNotificationReadAPI = async (notificationId) => {
  const response = await axios.patch(
    `${API_BASE_URL}/api/notification/${notificationId}/read`,
    {},
    { withCredentials: true }
  );
  return response?.data;
};

export const markAllNotificationsReadAPI = async (userId) => {
  const response = await axios.patch(
    `${API_BASE_URL}/api/notification/${userId}/read-all`,
    {},
    { withCredentials: true }
  );
  return response?.data;
};
*/