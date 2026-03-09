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

        console.log(data, "verifyUserCookie");

        if (data?.userInfo) {
            setUser(data?.userInfo);
        }

        return data?.success
            ? navigate(
                location.pathname === "/auth" || location.pathname === "/"
                ? "/tasks/list"
                : `${location.pathname}`
            )
            : navigate("/auth");
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