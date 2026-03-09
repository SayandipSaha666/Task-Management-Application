import { GlobalContext } from '../../context/Store.jsx';
import { callLogoutUserApi } from "../../services/api_service.js";
import { LogOut } from "lucide-react";
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const { setUser } = useContext(GlobalContext);
  const navigate = useNavigate();

  async function handleLogout() {
    const response = await callLogoutUserApi();

    if (response?.success) {
      setUser(null);
      navigate("/auth");
    }
  }

  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto h-16">
        <div className="flex h-16 items-center w-full justify-between">
          <div className="w-auto">
            <h1>Task Manager</h1>
          </div>
          <div className="flex gap-4">
            <Link className="text-black text-xl font-bold" to={"/tasks/list"}>
              Tasks
            </Link>
            <Link
              className="text-black text-xl font-bold"
              to={"/tasks/scrum-board"}
            >
              Scrum Board
            </Link>
          </div>
          <div>
            <LogOut
              onClick={handleLogout}
              color="#000"
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;