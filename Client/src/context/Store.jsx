import { createContext, useEffect, useState } from "react";
import {useNavigate} from "react-router-dom";
import { useLocation } from "react-router-dom";
import { callUserAuthApi } from "../services/api_service";
import { useForm } from "react-hook-form";

export const GlobalContext = createContext(null)

const GlobalState = ({children}) => {
    const [user,setUser] = useState(null);
    const [loading,setLoading] = useState(false);
    const [currentEditedId,setCurrentEditedId] = useState(null)

    const [taskList,setTaskList] = useState([])
    const navigate = useNavigate();
    const location = useLocation();

    const taskFormData = useForm({
        defaultValues: {
            title: '',
            description: '',
            status: '',
            priority: ''
        }
    })

    useEffect(() => {
        const verifyUserCookie = async () => {
        const data = await callUserAuthApi();

        if (data?.userInfo) {
            setUser(data?.userInfo);
        }

        // Don't redirect if user is on the homepage "/"
        if (location.pathname === "/") return;

        if (data?.success) {
            // Logged in user on /auth → send to tasks
            if (location.pathname === "/auth") {
                navigate("/tasks/list");
            }
            // Otherwise stay on current page
        } else {
            // Not logged in and trying to access protected route → send to auth
            if (location.pathname !== "/auth") {
                navigate("/auth");
            }
        }
        };

        verifyUserCookie();
    }, [navigate, location.pathname]);
    // console.log(taskList);
    return (
        <GlobalContext.Provider value={{setUser, user, taskFormData, taskList, setTaskList, loading, setLoading, currentEditedId, setCurrentEditedId}}>
            {children}
        </GlobalContext.Provider>
    )
}
export default GlobalState;