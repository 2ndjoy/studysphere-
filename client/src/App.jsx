import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Subjects from "./pages/Subjects";
import Assignments from "./pages/Assignments";
import Notes from "./pages/Notes";

function App() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/subjects"
            element={
              <ProtectedRoute>
                <Subjects />
              </ProtectedRoute>
            }
          />

          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <Assignments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;