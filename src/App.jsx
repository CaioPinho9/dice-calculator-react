import "./App.css";
import Header from "./components/Header";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import DnD from "./pages/DnD";
import Gurps from "./pages/Gurps";
import CoC from "./pages/CoC";
import Home from "./pages/Home";
import React from "react";
import Vampire from "./pages/Vampire";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dnd/*" element={<DnD />} />
            <Route path="/gurps/*" element={<Gurps />} />
            <Route path="/coc/*" element={<CoC />} />
            <Route path="/vampire/*" element={<Vampire />} />
          </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
