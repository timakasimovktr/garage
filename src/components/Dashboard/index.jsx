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
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import axios from "axios";

const STATUS = {
  PLEDGE: "Дал залог",
  PENDING: "В процессе",
  PAID: "Оплачено",
  DUTY: "Долг",
};

const PAYMENT_TYPE = {
  CASH: "Наличные",
  CARD: "Карта",
};

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const role = localStorage.getItem("@role");
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [open, setOpen] = useState(false);
  const [isChangeRentModalOpen, setIsChangeRentModalOpen] = useState(false);
  const [rentalsDeshboard, setRentalsDashboard] = useState([]);
  const [sumDashboard, setSumDashboard] = useState([]);
  const [rent, setRent] = useState([]);
  const [changeRentObj, setChangeRentObj] = useState([]);
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
    fetchData(`${APP_ROUTES.URL}/rent`, setRent);
    fetchData(`${APP_ROUTES.URL}/car`, setCars);
  }, [fetchData, currentYear, currentMonth]);

  const createRent = async (e) => {
    e.preventDefault();

    const formElements = e.currentTarget.elements;
    const data = {
      status: formElements.status.value,
      paymentType: formElements.paymentType.value,
      incomePersentage: [
        +formElements.incomePerson.value,
        +formElements.incomeInvestor.value,
        +formElements.incomePartner.value,
      ],
      name: formElements.name.value,
      phoneNumber: formElements.phone.value,
      startDate: new Date(formElements.startDate.value).toISOString(),
      endDate: new Date(formElements.endDate.value).toISOString(),
      guarantee: formElements.pledge.value,
      amount: +formElements.amount.value,
      carId: +formElements.carId.value,
    };

    if (
      data.incomePersentage[0] +
        data.incomePersentage[1] +
        data.incomePersentage[2] !==
      100
    ) {
      alert("Сумма процентов должна быть равна 100%");
      return;
    }

    try {
      const response = await axios.post(`${APP_ROUTES.URL}/rent`, data, {
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

  const getRentById = async (id) => {
    try {
      const response = await axios.get(`${APP_ROUTES.URL}/rent/byId/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("@token")}`,
        },
      });
      setChangeRentObj(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const changeRentShowInfo = async (id) => {
    setIsChangeRentModalOpen(true);
    getRentById(id);
  };

  const changeRent = async (e) => {
    e.preventDefault();

    const updatedRentObj = { ...changeRentObj };
    delete updatedRentObj.adminIncome;
    delete updatedRentObj.investorIncome;
    delete updatedRentObj.partnerIncome;

    if (
      updatedRentObj.incomePersentage[0] +
        updatedRentObj.incomePersentage[1] +
        updatedRentObj.incomePersentage[2] !==
      100
    ) {
      alert("Сумма процентов должна быть равна 100%");
      return;
    }

    try {
      const response = await axios.patch(
        `${APP_ROUTES.URL}/rent/byId/${updatedRentObj.id}`,
        updatedRentObj,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("@token")}`,
          },
        }
      );
      refreshData();
      setIsChangeRentModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteRent = async (id) => {
    try {
      const response = await axios.delete(`${APP_ROUTES.URL}/rent/byId/${id}`, {
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
  const handleCloseChangeRentModal = () => setIsChangeRentModalOpen(false);

  const renderTableRows = () => {
    return rent.map((item, index) => {
      const car = cars.find((car) => car.id === item?.carId) || {};

      return (
        <div className="tableTr" key={index}>
          <div className="tableTd">
            <p>{item?.name}</p>
          </div>
          <div className="tableTd">
            <p>{`${car.model || ""} ${car.carNumber || ""}`}</p>
          </div>
          <div className="tableTd">
            <p>{item?.amount.toLocaleString("de-DE")} uzs</p>
          </div>
          <div className="tableTd">
            <p>
              {(
                (item?.amount / 100) *
                item?.incomePersentage[1]
              ).toLocaleString("de-DE")}{" "}
              uzs
            </p>
          </div>
          <div className="tableTd">
            <p>{PAYMENT_TYPE[item?.paymentType] || ""}</p>
          </div>
          <div className="tableTd">
            <p>
              {new Date(item.startDate).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="tableTd">
            <p>
              {new Date(item.endDate).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="tableTd">
            <div className={`status ${item.status}`}>{STATUS[item.status]}</div>
          </div>
          <div className="tableTd">
            <button
              className="changeBtn"
              onClick={() => changeRentShowInfo(item.id)}
            >
              <VisibilityIcon />
            </button>
            <button className="deleteBtn" onClick={() => deleteRent(item.id)}>
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
          <form action="" onSubmit={(e) => createRent(e)}>
            <div className="leftCreateRentModal">
              <div className="modalItem">
                <label htmlFor="">Новый арендатор *</label>
                <input required name="name" type="text" placeholder="Ф.И.О" />
                <input
                  required
                  name="phone"
                  type="phone"
                  placeholder="Номер телефона"
                />
              </div>

              <div className="modalItem">
                <label htmlFor="">Машина *</label>
                <select required name="carId" id="">
                  <option value="" hidden>
                    Выбрать машину
                  </option>
                  {cars.map((car) => (
                    <option key={car.id} value={car.id}>
                      {`${car.model} ${car.carNumber}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modalItem">
                <label htmlFor="">Распределение дохода *</label>
                <input
                  required
                  name="incomePerson"
                  type="number"
                  placeholder="Шохруху (%)"
                />
                <input
                  required
                  name="incomeInvestor"
                  type="number"
                  placeholder="Инвестору (%)"
                />
                <input
                  required
                  name="incomePartner"
                  type="number"
                  placeholder="Партнеру (%)"
                />
              </div>
            </div>
            <div className="rightCreateRentModal">
              <div className="modalItem">
                <label htmlFor="">Дата аренды *</label>
                <input required name="startDate" type="date" />
                <input required name="endDate" type="date" />
              </div>

              <div className="modalItem">
                <label htmlFor="">Оплата *</label>
                <input
                  required
                  name="amount"
                  type="number"
                  placeholder="Общая сумма (сум)"
                />
                <select required name="paymentType" id="">
                  <option value="" hidden>
                    Выберите тип оплаты
                  </option>
                  {Object.keys(PAYMENT_TYPE).map((key) => (
                    <option key={key} value={key}>
                      {PAYMENT_TYPE[key]}
                    </option>
                  ))}
                </select>
                <input required name="pledge" type="" placeholder="Залог" />
              </div>

              <div className="modalItem">
                <label htmlFor="">Статус заявки *</label>
                <select required name="status" id="">
                  <option value="" hidden>
                    Выберите статус заявки
                  </option>
                  {Object.keys(STATUS).map((key) => (
                    <option key={key} value={key}>
                      {STATUS[key]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modalItem">
                <div className="actionsModal">
                  <button type="button" onClick={() => handleClose(false)}>
                    Отмена
                  </button>
                  <button type="submit">Добавить</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </Dialog>
      <Dialog
        maxWidth={"md"}
        open={isChangeRentModalOpen}
        onClose={handleCloseChangeRentModal}
        fullScreen={fullScreen}
      >
        <div className="exitModal">
          <div className="exitModalWarningIcon"></div>
          <form action="" onSubmit={(e) => changeRent(e)}>
            <div className="leftCreateRentModal">
              <div className="modalItem">
                <label htmlFor="">Изменить арендатора *</label>
                <input
                  required
                  type="text"
                  placeholder="Ф.И.О"
                  value={changeRentObj.name}
                  onChange={(e) =>
                    setChangeRentObj({ ...changeRentObj, name: e.target.value })
                  }
                />
                <input
                  required
                  type="phone"
                  placeholder="Номер телефона"
                  value={changeRentObj.phoneNumber}
                  onChange={(e) =>
                    setChangeRentObj({
                      ...changeRentObj,
                      phoneNumber: e.target.value,
                    })
                  }
                />
              </div>

              <div className="modalItem">
                <label htmlFor="">Машина *</label>
                <select
                  required
                  name=""
                  id=""
                  value={changeRentObj.carId}
                  onChange={(e) =>
                    setChangeRentObj({
                      ...changeRentObj,
                      carId: e.target.value,
                    })
                  }
                >
                  <option value="" hidden>
                    Выбрать машину
                  </option>
                  {cars.map((car) => (
                    <option key={car.id} value={car.id}>
                      {`${car.model} ${car.carNumber}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modalItem">
                <label htmlFor="">Распределение дохода *</label>
                <input
                  required
                  type="number"
                  placeholder="Шохруху (%)"
                  value={changeRentObj?.incomePersentage?.[0] || ""}
                  onChange={(e) =>
                    setChangeRentObj({
                      ...changeRentObj,
                      incomePersentage: [
                        +e.target.value,
                        changeRentObj.incomePersentage[1],
                        changeRentObj.incomePersentage[2],
                      ],
                    })
                  }
                />
                <input
                  required
                  type="number"
                  placeholder="Инвестору (%)"
                  value={changeRentObj?.incomePersentage?.[1] || ""}
                  onChange={(e) =>
                    setChangeRentObj({
                      ...changeRentObj,
                      incomePersentage: [
                        changeRentObj.incomePersentage[0],
                        +e.target.value,
                        changeRentObj.incomePersentage[2],
                      ],
                    })
                  }
                />
                <input
                  required
                  type="number"
                  placeholder="Партнеру (%)"
                  value={changeRentObj?.incomePersentage?.[2] || ""}
                  onChange={(e) =>
                    setChangeRentObj({
                      ...changeRentObj,
                      incomePersentage: [
                        changeRentObj.incomePersentage[0],
                        changeRentObj.incomePersentage[1],
                        +e.target.value,
                      ],
                    })
                  }
                />
              </div>
            </div>
            <div className="rightCreateRentModal">
              <div className="modalItem">
                <label htmlFor="">Дата аренды *</label>
                <input
                  required
                  type="date"
                  value={
                    changeRentObj.startDate
                      ? new Date(changeRentObj.startDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setChangeRentObj({
                      ...changeRentObj,
                      startDate: new Date(e.target.value).toISOString(),
                    })
                  }
                />
                <input
                  required
                  type="date"
                  value={
                    changeRentObj.endDate
                      ? new Date(changeRentObj.endDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setChangeRentObj({
                      ...changeRentObj,
                      endDate: new Date(e.target.value).toISOString(),
                    })
                  }
                />
              </div>

              <div className="modalItem">
                <label htmlFor="">Оплата *</label>
                <input
                  required
                  type="number"
                  placeholder="Общая сумма (сум)"
                  value={changeRentObj.amount}
                  onChange={(e) =>
                    setChangeRentObj({
                      ...changeRentObj,
                      amount: +e.target.value,
                    })
                  }
                />
                <select
                  required
                  name=""
                  id=""
                  value={changeRentObj.paymentType}
                  onChange={(e) =>
                    setChangeRentObj({
                      ...changeRentObj,
                      paymentType: e.target.value,
                    })
                  }
                >
                  <option value="" hidden>
                    Выберите тип оплаты
                  </option>
                  {Object.keys(PAYMENT_TYPE).map((key) => (
                    <option key={key} value={key}>
                      {PAYMENT_TYPE[key]}
                    </option>
                  ))}
                </select>
                <input
                  required
                  type=""
                  placeholder="Залог"
                  value={changeRentObj.guarantee}
                  onChange={(e) =>
                    setChangeRentObj({
                      ...changeRentObj,
                      guarantee: e.target.value,
                    })
                  }
                />
              </div>

              <div className="modalItem">
                <label htmlFor="">Статус заявки *</label>
                <select
                  required
                  name=""
                  id=""
                  value={changeRentObj.status}
                  onChange={(e) =>
                    setChangeRentObj({
                      ...changeRentObj,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="" hidden>
                    Выберите статус заявки
                  </option>
                  {Object.keys(STATUS).map((key) => (
                    <option key={key} value={key}>
                      {STATUS[key]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modalItem">
                <div className="actionsModal">
                  <button
                    type="button"
                    onClick={() => handleCloseChangeRentModal(false)}
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
      <Header setRent={setRent} refreshData={refreshData}/>
      {role === "admin" ? (
        <section className="general">
          <div className="container">
            <div className="generalHeading">
              <h2>Общие показатели</h2>
              <button onClick={() => navigate("/cars")}>Все автомобили</button>
            </div>
            <div className="generalInfo">{renderGeneralInfo()}</div>
          </div>
        </section>
      ) : (
        <section className="general">
          <div className="container">
            <div className="generalHeading" style={{ marginBottom: 0 }}>
              <h2>Автомобили</h2>
              <button onClick={() => navigate("/cars")}>Все автомобили</button>
            </div>
          </div>
        </section>
      )}
      <div className="table">
        <div className="container">
          <div className="tableHeading">
            <h2>Арендатор</h2>
            <button onClick={() => setOpen(true)}>+ Добавить</button>
          </div>
          <div className="tableBody">
            <div className="tableTh">
              <div className="tableThItem">
                <PersonIcon />
                <p>Ф.И.О</p>
              </div>
              <div className="tableThItem">
                <DirectionsCarIcon />
                <p>Машина</p>
              </div>
              <div className="tableThItem">
                <PriceChangeIcon />
                <p>Общая сумма</p>
              </div>
              <div className="tableThItem">
                <BadgeIcon />
                <p>Прибыль инвестора</p>
              </div>
              <div className="tableThItem">
                <CreditCardIcon />
                <p>Способ Оплаты</p>
              </div>
              <div className="tableThItem">
                <CalendarMonthIcon />
                <p>Дата аренды</p>
              </div>
              <div className="tableThItem">
                <EventNoteIcon />
                <p>Дата сдачи</p>
              </div>
              <div className="tableThItem">
                <AssessmentOutlinedIcon />
                <p>Статус</p>
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

export default Dashboard;
