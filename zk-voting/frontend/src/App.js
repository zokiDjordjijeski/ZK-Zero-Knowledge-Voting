// App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminResults from "./AdminResults";
import VotingPage from "./VotingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VotingPage />} />
        <Route path="/admin/results" element={<AdminResults />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
