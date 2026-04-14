import "./Navigation.css";
import { useNavigate, useLocation} from "react-router-dom";
import axios from "axios";
import { IoIosNotifications } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { BiLogOutCircle } from "react-icons/bi";
import { useEffect, useState } from "react";

function Navigation() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location=useLocation();
  let user_data=location.state;

  const logout = () => {
    axios
      .get("http://localhost:8080/logout", { withCredentials: true })
      .then((res) => {
        alert(res.data);
        navigate("/");
      });
  };

  // lock background scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  return (
    <>
      <div className="mt-2 mx-4">
        <nav className="navigation">
          <h1 className="logo">Kitty Party</h1>

          <div className="hamburger" onClick={() => setOpen(!open)}>
            <span />
            <span />
            <span />
          </div>
        </nav>

        {/* overlay */}
        {open && <div className="overlay" onClick={() => setOpen(false)} />}

        {/* dropdown menu */}
        <div className= {`mt-2 dropdown ${open ? "open" : ""}`}>
          <ul>
            <li onClick={() => navigate("/lobby")}>Home</li>
            
            <li onClick={()=>navigate('/notification')}>
              Notifications
              <IoIosNotifications className="icon" />
            </li>

            <li onClick={() => navigate("/profile")}>
              View Profile
              <CgProfile className="icon" />
            </li>

            <li onClick={logout}>
              Logout
              <BiLogOutCircle className="icon" />
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default Navigation;
