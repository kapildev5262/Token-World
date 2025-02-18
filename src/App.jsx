import "./index.css";
import "./App.css";
import { WalletProvider } from "./components/wallet/WalletContext";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Footer from "./components/footer/footer";
import Header from "./components/header/Header";

function App() {
  return (
    <BrowserRouter>
      <WalletProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
        <Footer />
      </WalletProvider>
    </BrowserRouter>
  );
}

export default App;
