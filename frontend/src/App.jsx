import { Routes, Route, Navigate } from "react-router-dom";
import Protected from "./components/Protected.jsx";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Palmistry from "./pages/Palmistry.jsx";
import Tarot from "./pages/Tarot.jsx";
import TarotDeck from "./pages/TarotDeck.jsx";
import Combine from "./pages/Combine.jsx";
import History from "./pages/History.jsx";
import ReadingDetail from "./pages/ReadingDetail.jsx";
import Chat from "./pages/Chat.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />
      <Route
        path="/palmistry"
        element={
          <Protected>
            <Palmistry />
          </Protected>
        }
      />
      <Route
        path="/tarot"
        element={
          <Protected>
            <Tarot />
          </Protected>
        }
      />
      <Route
        path="/tarot/deck"
        element={
          <Protected>
            <TarotDeck />
          </Protected>
        }
      />
      <Route
        path="/combine"
        element={
          <Protected>
            <Combine />
          </Protected>
        }
      />
      <Route
        path="/history"
        element={
          <Protected>
            <History />
          </Protected>
        }
      />
      <Route
        path="/reading/:id"
        element={
          <Protected>
            <ReadingDetail />
          </Protected>
        }
      />
      <Route
        path="/chat/:readingId"
        element={
          <Protected>
            <Chat />
          </Protected>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
