import "./index.css";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Footer from "./components/footer/footer";
import Header from "./components/header/Header";



function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />

        
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
