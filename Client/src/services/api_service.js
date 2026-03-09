import axios from "axios"
export const callRegisterUserApi = async (data) => {
    const response = await axios.post("http://localhost:5000/api/user/register", data, {
        withCredentials: true
    })
    return response?.data
}
export const callLoginUserApi = async (data) => {
    const response = await axios.post("http://localhost:5000/api/user/login", data, {
        withCredentials: true
    })
    return response?.data
}
export const callUserAuthApi = async () => {
    try {
        const response = await axios.post("http://localhost:5000/api/user/auth", {}, {
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
    const response = await axios.post("http://localhost:5000/api/user/logout", {}, {
        withCredentials: true
    })
    return response?.data
}

export const addNewTaskAPI = async(formData) => {
    const response = await axios.post("http://localhost:5000/api/task/add",formData, {
        withCredentials: true
    });
    return response?.data
} 

export const getAllTaskAPI = async(id) => {
    const response = await axios.get(`http://localhost:5000/api/task/all/${id}`, {
        withCredentials: true
    })
    return response?.data // getting from controller/getAllTasks
}

export const deleteTaskAPI = async(id) => {
    const response = await axios.delete(`http://localhost:5000/api/task/delete/${id}`, {},{
        withCredentials: true
    })
    return response?.data
}

export const updateTaskAPI = async(formData) => {
    const response = await axios.put("http://localhost:5000/api/task/update", formData, {
        withCredentials: true
    })
    return response?.data
}