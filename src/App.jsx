import "./App.css";
import Header from "./components/Header";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import DnD from "./pages/DnD";
import Gurps from "./pages/Gurps";
import CoC from "./pages/CoC";
import React from "react";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
          <Routes>
            <Route path="/" element={<DnD />} />
            <Route path="/dnd" element={<DnD />} />
            <Route path="/gurps" element={<Gurps />} />
            <Route path="/coc" element={<CoC />} />
          </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
