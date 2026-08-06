import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import PalmReading from "./pages/PalmReading";
import TarotReading from "./pages/TarotReading";
import CombinedReading from "./pages/CombinedReading";
import About from "./pages/About";

import "./App.css";

function App() {
  return (
    <>
      <Navbar />

      <main className="main-container">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/palm-reading"
            element={<PalmReading />}
          />

          <Route
            path="/tarot-reading"
            element={<TarotReading />}
          />

          <Route
            path="/combined-reading"
            element={<CombinedReading />}
          />

          <Route
            path="/about"
            element={<About />}
          />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;