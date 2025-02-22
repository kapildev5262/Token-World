import "./index.css";
import "./App.css";
import { WalletProvider } from "./components/wallet/WalletContext";
import ERC20 from "./pages/ERC20/ERC20";
import ERC721 from "./pages/ERC721/ERC721";
import Distribution from "./pages/Distribution/distribution";

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
          <Route path="/erc20/" element={<ERC20 />} />
          <Route path="/erc721/" element={<ERC721 />} />
          <Route path="/distribution/" element={<Distribution />} />
        </Routes>
        <Footer />
      </WalletProvider>
    </BrowserRouter>
  );
}

export default App;
