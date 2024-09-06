import React from "react";
import { Link, useNavigate } from "react-router-dom";

import Logo from "../../images/logo.svg";
import SearchIcon from "@mui/icons-material/Search";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header>
      <div className="container">
        <img src={Logo} alt="Logo" />

        <div className="searchAndMonitoring">
          {window.location.pathname === "/dashboard" && (
            <div className="search">
              <SearchIcon />
              <input type="text" placeholder="Поиск арендатора" />
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
