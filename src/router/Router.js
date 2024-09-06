import React from "react";
import {
  Route,
  Routes,
  BrowserRouter,
  Navigate,
  useLocation,
} from "react-router-dom";
import { APP_ROUTES } from "./Route.js";
// import Course from "../components/Course/Course";
import JoySignInSideTemplate from "../components/JoySignInSideTemplate.tsx";
import Dashboard from "../components/Dashboard";
import Cars from "../components/Cars";
import Monitoring from "../components/Monitoring";
// import Tests from "../components/Tests/Tests";
// import Messages from "../components/Messages/Messages";
// import Mentor from "../components/Curator/Mentor.tsx";

function RequireAuth({ children }) {
  const token = localStorage.getItem("@token");
  const isTokenAvailable = token != null && token !== "";

  let location = useLocation();

  if (!isTokenAvailable) {
    return <Navigate to="/" state={{ from: location }} replace />;
  } else {
    return children;
  }
}

function Router() {
  const role = localStorage.getItem("@role");
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={APP_ROUTES.LOGIN} />} />
        <Route path={APP_ROUTES.LOGIN} element={<JoySignInSideTemplate />} />

        <Route
          path={APP_ROUTES.DASHBORAD}
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path={APP_ROUTES.CARS}
          element={
            <RequireAuth>
              <Cars />
            </RequireAuth>
          }
        />
        <Route
          path={APP_ROUTES.MONITORING}
          element={
            <RequireAuth>
              <Monitoring />
            </RequireAuth>
          }
        />
        {/* <Route
          path={APP_ROUTES.COURSE}
          element={
            <RequireAuth>
              <Course />
            </RequireAuth>
          }
        />
        <Route
          path={APP_ROUTES.TESTS}
          element={
            <RequireAuth>
              <Tests />
            </RequireAuth>
          }
        />
        <Route
          path={APP_ROUTES.MESSAGES}
          element={
            <RequireAuth>
              <Messages />
            </RequireAuth>
          }
        />
        <Route
          path={APP_ROUTES.CHAT}
          element={
            <RequireAuth>
              <Messages />
            </RequireAuth>
          }
        /> */}
        {/* <Route
          path={APP_ROUTES.FINANCE}
          element={
            <RequireAuth>
              <Tests />
            </RequireAuth>
          }
        /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
