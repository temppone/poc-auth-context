import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return <div>Dashboard {user?.email}</div>;
};

export default Dashboard;
