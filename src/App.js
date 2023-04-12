import "./App.css";
// import react,{useEffect} from 'react';
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home/Home.jsx";
import NewUser from "./components/NewUser/NewUser.jsx";
import CreatePassword from "./components/CreatePassword/CreatePassword.jsx";
import ShowMnmonic from "./components/ShowMnmonic/ShowMnmonic.jsx";
import VerificationMnmonic from "./components/VerificationMnmonic/verificationMnmonic.jsx";
import ImportWallet from "./components/ImportWallet/ImportWallet.jsx";
// import Login from './components/Login/Login.jsx';

import Wallet from "./components/Wallet/Wallet.jsx";
import Send from "./components/Send/Send.jsx";
import Recieve from "./components/Recieve/Recieve.jsx";
import Setting from "./components/Setting/Setting.jsx";
import Export from "./components/Export/Export.jsx";
import Details from "./components/Details/Details.jsx";
import Transaction from "./components/Transaction/Transaction";
import QRShare from "./components/QRShare/QRShare";
import MultiWalletScreen from "./components/MultiWalletScreen/MultiWalletScreen";
// import files to dist
// const logo192 = require('../public/logo192.png')
function App() {
  // window.addEventListener("keydown", function (event) {
  //   if (event.defaultPrevented) {
  //     return; // Do nothing if the event was already processed
  //   }

  //   switch (event.key) {
  //     case "Down":
  //       window.event.keyCode =13
  //       break;
  //     case "ArrowDown":
  //       window.event.keyCode = 9;
  //       break;
  //     case "Up":
  //       window.event.keyCode = 9;
  //       break;
  //     case "ArrowUp":
  //       alert("Up")
  //       break;

  //     default:
  //       return; // Quit when this doesn't handle the key event.
  //   }

  //   // Cancel the default action to avoid it being handled twice
  //   event.preventDefault();
  // }, true);

  return (
    <div className="App">
      <Routes>
        <Route exact path="/*" element={<Home />} />
        <Route exact path="/new-user/*" element={<NewUser />} />
        <Route exact path="/create-password/*" element={<CreatePassword />} />
        <Route
          exact
          path="/create-password/:importStatus/*"
          element={<CreatePassword />}
        />
        <Route exact path="/mnmonic/*" element={<ShowMnmonic />} />
        <Route exact path="/verification/*" element={<VerificationMnmonic />} />
        <Route exact path="/import-wallet/*" element={<ImportWallet />} />
        <Route exact path="/wallet/*" element={<Wallet />} />
        <Route exact path="/send/*" element={<Send />} />
        <Route exact path="/recieve/*" element={<Recieve />} />
        <Route exact path="/setting/*" element={<Setting />} />
        <Route exact path="/export/*" element={<Export />} />
        <Route exact path="/transactions/*" element={<Transaction />} />
        <Route exact path="/details/:messageid" element={<Details />} />
        <Route exact path="/qrcode/:address" element={<QRShare />} />
        <Route exact path="/all-wallet" element={<MultiWalletScreen />} />
      </Routes>
    </div>
  );
}

export default App;
