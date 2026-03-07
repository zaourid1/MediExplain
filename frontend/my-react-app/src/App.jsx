import { useState } from "react";
import "./App.css";
import Dashboard from "./components/Dashboard";
import Landing from "./components/Landing";

function App() {
  return (
    <div>
      <Dashboard></Dashboard>
      <div className="pt-100"></div>
      <Landing></Landing>
    </div>
  );
}

export default App;
