import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../router/Route.js";
import axios from "axios";

import Logo from "../../images/logo.svg";
import SearchIcon from "@mui/icons-material/Search";

const Header = (props) => {
  const navigate = useNavigate();

  const search = (e) => {
    const value = e.target.value;

    if (value.length > 2) {
      axios
        .get(APP_ROUTES.URL + `/rent/search/${value}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("@token")}`,
          },
        })
        .then((res) => {
          props.setRent(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      props.refreshData();
    }
  };
  return (
    <header>
      <div className="container">
        {/* <img src={Logo} alt="Logo" /> */}
        <div></div>

        <div className="searchAndMonitoring">
          {window.location.pathname === "/dashboard" && (
            <div className="search">
              <SearchIcon />
              <input
                type="text"
                placeholder="Поиск арендатора"
                onChange={(e) => search(e)}
              />
            </div>
          )}

          <div className="monitoringBtn">
            {window.location.pathname === "/monitoring" ? (
              <button
                onClick={() => {
                  navigate("/dashboard");
                }}
              >
                Главная
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate("/monitoring");
                }}
              >
                Мониторинг
              </button>
            )}
            <button
              style={{ marginLeft: "10px", background: "#e65046" }}
              onClick={() => {
                localStorage.removeItem("@token");
                localStorage.removeItem("@role");
                navigate("/login");
              }}
            >
              Выход
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
