import React, { useState, useRef, useEffect, useCallback } from "react";
import { APP_ROUTES } from "../../router/Route.js";
import { CookiesProvider, useCookies } from "react-cookie";
import { Link, useNavigate } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
// components
import Header from "../Header";
//icons
import PersonIcon from "@mui/icons-material/Person";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventNoteIcon from "@mui/icons-material/EventNote";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BadgeIcon from "@mui/icons-material/Badge";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import Skeleton from "@mui/material/Skeleton";
import "./index.sass";
import { Dialog } from "@mui/material";
import axios from "axios";

const OWNER = {
  ADMIN: "Шохрух",
  INVESTOR: "Инвестор",
  PARTNER: "Партнер",
};

const Cars = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const role = localStorage.getItem("@role");
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [open, setOpen] = useState(false);
  const [isChangeCarModalOpen, setIsChangeCarModalOpen] = useState(false);
  const [rentalsDeshboard, setRentalsDashboard] = useState([]);
  const [sumDashboard, setSumDashboard] = useState([]);
  const [rent, setRent] = useState([]);
  const [changeCarObj, setChangeCarObj] = useState([]);
  const [cars, setCars] = useState([]);

  const fetchData = useCallback(async (url, setter) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("@token")}`,
        },
      });
      setter(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchData(
      `${APP_ROUTES.URL}/monitoring/rents/${currentYear}/${currentMonth}`,
      setRentalsDashboard
    );
    fetchData(
      `${APP_ROUTES.URL}/monitoring/sum/${currentYear}/${currentMonth}`,
      setSumDashboard
    );
    fetchData(`${APP_ROUTES.URL}/car`, setCars);
  }, [fetchData, currentYear, currentMonth]);

  const createCar = async (e) => {
    e.preventDefault();

    const formElements = e.currentTarget.elements;
    const data = {
      owner: formElements.owner.value,
      model: formElements.model.value,
      carNumber: formElements.carNumber.value,
      run: formElements.run.value,
    };

    try {
      const response = await axios.post(`${APP_ROUTES.URL}/car`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("@token")}`,
        },
      });
      refreshData();
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const getCarById = async (id) => {
    try {
      const response = await axios.get(`${APP_ROUTES.URL}/car/findOne/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("@token")}`,
        },
      });
      setChangeCarObj(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const changeCarShowInfo = async (id) => {
    getCarById(id);
    setIsChangeCarModalOpen(true);
  };

  const changeRent = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.patch(
        `${APP_ROUTES.URL}/car/findOne/${changeCarObj.id}`,
        changeCarObj,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("@token")}`,
          },
        }
      );
      refreshData();
      setIsChangeCarModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteCar = async (id) => {
    try {
      const response = await axios.delete(`${APP_ROUTES.URL}/car/findOne/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("@token")}`,
        },
      });
      refreshData();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleClose = () => setOpen(false);
  const handleCloseChangeCarModal = () => setIsChangeCarModalOpen(false);

  const renderTableRows = () => {
    return cars.map((item, index) => {
      return (
        <div className="tableTr" key={index}>
          <div className="tableTd">
            <p>{item.model}</p>
          </div>
          <div className="tableTd">
            <p>{item.carNumber}</p>
          </div>
          <div className="tableTd">
            <p>{item.run} км</p>
          </div>
          <div className="tableTd">
            <p>{OWNER[item.owner]}</p>
          </div>
          <div className="tableTd">
            <button
              className="changeBtn"
              onClick={() => changeCarShowInfo(item.id)}
            >
              <VisibilityIcon />
            </button>
            <button className="deleteBtn" onClick={() => deleteCar(item.id)}>
              <DeleteOutlineIcon />
            </button>
          </div>
        </div>
      );
    });
  };

  const renderGeneralInfo = () => {
    return rentalsDeshboard || sumDashboard ? (
      <>
        <div className="infoCol">
          <h3 className="orange">Кол. арендаторов за месяц</h3>
          <p>{rentalsDeshboard || "Данных нет"}</p>
        </div>
        <div className="infoCol">
          <h3 className="green">Месячный доход</h3>
          <p>
            {sumDashboard.income
              ? sumDashboard.income.toLocaleString("de-DE") + " uzs"
              : "Данных нет"}
          </p>
        </div>
        <div className="infoCol">
          <h3 className="red">Месячный расход</h3>
          <p>
            {sumDashboard.outcome
              ? sumDashboard.outcome.toLocaleString("de-DE") + " uzs"
              : "Данных нет"}
          </p>
        </div>
        <div className="infoCol">
          <h3 className="blue">Месячная касса</h3>
          <p>
            {sumDashboard.total
              ? sumDashboard.total.toLocaleString("de-DE") + " uzs"
              : "Данных нет"}
          </p>
        </div>
        <div className="infoCol">
          <h3 className="red">Долг наличными</h3>
          <p>
            {sumDashboard.cash_duty
              ? sumDashboard.cash_duty.toLocaleString("de-DE") + " uzs"
              : "Данных нет"}
          </p>
        </div>
        <div className="infoCol">
          <h3 className="orange">Долг по карте</h3>
          <p>
            {sumDashboard.card_duty
              ? sumDashboard.card_duty.toLocaleString("de-DE") + " uzs"
              : "Данных нет"}
          </p>
        </div>
      </>
    ) : (
      <>
        <div className="infoCol">
          <Skeleton variant="text" width={200} height={50} />
        </div>
        <div className="infoCol">
          <Skeleton variant="text" width={200} height={50} />
        </div>
      </>
    );
  };

  return (
    <>
      <Dialog
        maxWidth={"md"}
        open={open}
        onClose={handleClose}
        fullScreen={fullScreen}
      >
        <div className="exitModal">
          <div className="exitModalWarningIcon"></div>
          <form action="" onSubmit={(e) => createCar(e)}>
            <div className="leftCreateRentModal">
              <div className="modalItem">
                <label htmlFor="">Новый автомобиль *</label>
                <input name="model" type="text" placeholder="Модель авто" />
                <input name="carNumber" type="text" placeholder="Номер авто" />
              </div>
            </div>
            <div className="rightCreateRentModal">
              <div className="modalItem">
                <label htmlFor="">Информация об автомобиле *</label>
                <input
                  name="run"
                  type="number"
                  placeholder="Пробег авто (км)"
                />
                <select name="owner" id="">
                  <option value="" hidden>
                    Выбрать владельца
                  </option>
                  {Object.keys(OWNER).map((key, index) => (
                    <option key={index} value={key}>
                      {OWNER[key]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modalItem">
                <div className="actionsModal">
                  <button type="button" onClick={() => handleClose(false)}>
                    Отмена
                  </button>
                  <button>Добавить</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </Dialog>
      <Dialog
        maxWidth={"md"}
        open={isChangeCarModalOpen}
        onClose={handleCloseChangeCarModal}
        fullScreen={fullScreen}
      >
        <div className="exitModal">
          <div className="exitModalWarningIcon"></div>
          <form action="" onSubmit={(e) => changeRent(e)}>
            <div className="leftCreateRentModal">
              <div className="modalItem">
                <label htmlFor="">Изменить автомобиль *</label>
                <input
                  type="text"
                  placeholder="Модель авто"
                  value={changeCarObj.model}
                  onChange={(e) =>
                    setChangeCarObj({ ...changeCarObj, model: e.target.value })
                  }
                />
                <input
                  type="phone"
                  placeholder="Номер авто"
                  value={changeCarObj.carNumber}
                  onChange={(e) =>
                    setChangeCarObj({
                      ...changeCarObj,
                      carNumber: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="rightCreateRentModal">
              <div className="modalItem">
                <label htmlFor="">Информация об автомобиле *</label>
                <input
                  type="number"
                  placeholder="Пробег авто (км)"
                  value={changeCarObj.run}
                  onChange={(e) =>
                    setChangeCarObj({ ...changeCarObj, run: e.target.value })
                  }
                />
                <select
                  name=""
                  id=""
                  value={changeCarObj.owner}
                  onChange={(e) =>
                    setChangeCarObj({ ...changeCarObj, owner: e.target.value })
                  }
                >
                  <option value="" hidden>
                    Выбрать владельца
                  </option>
                  {Object.keys(OWNER).map((key, index) => (
                    <option key={index} value={key}>
                      {OWNER[key]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modalItem">
                <div className="actionsModal">
                  <button
                    type="button"
                    onClick={() => setIsChangeCarModalOpen(false)}
                  >
                    Отмена
                  </button>
                  <button type="submit">Изменить</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </Dialog>
      <Header />
      {role === "admin" ? (
        <section className="general">
          <div className="container">
            <div className="generalHeading">
              <h2>Общие показатели</h2>
              <button onClick={() => navigate("/dashboard")}>Все заказы</button>
            </div>
            <div className="generalInfo">{renderGeneralInfo()}</div>
          </div>
        </section>
      ) : (
        <section className="general">
          <div className="container">
            <div className="generalHeading" style={{ marginBottom: 0 }}>
              <h2>Заказы</h2>
              <button onClick={() => navigate("/dashboard")}>Все заказы</button>
            </div>
          </div>
        </section>
      )}
      <div className="table">
        <div className="container">
          <div className="tableHeading">
            <h2>Автомобили</h2>
            <button onClick={() => setOpen(true)}>+ Добавить</button>
          </div>
          <div className="tableBody">
            <div className="tableTh">
              <div className="tableThItem">
                <DirectionsCarIcon />
                <p>Модель авто</p>
              </div>
              <div className="tableThItem">
                <DirectionsCarIcon />
                <p>Номер авто</p>
              </div>
              <div className="tableThItem">
                <PriceChangeIcon />
                <p>Пробег</p>
              </div>
              <div className="tableThItem">
                <BadgeIcon />
                <p>Владелец авто</p>
              </div>
              <div className="tableThItem">
                <p>Действия</p>
              </div>
            </div>
            {renderTableRows()}
          </div>
        </div>
      </div>
    </>
  );
};

export default Cars;
