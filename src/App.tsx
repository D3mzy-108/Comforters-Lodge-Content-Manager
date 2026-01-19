import { Route, Routes } from "react-router-dom";
import "./App.css";
import ComfortersLodgeAdmin from "./screens/Dashboard";

function App() {
  return (
    <div className="w-full">
      <Routes>
        <Route path="/" element={<ComfortersLodgeAdmin />} />
      </Routes>
    </div>
  );
}

export default App;
