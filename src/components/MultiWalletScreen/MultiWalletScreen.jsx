import React, { useEffect, useState } from "react";
import "./MultiWalletScreen.scss";
import { BsArrowLeft } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { AiOutlinePlus } from "react-icons/ai";
import { HiOutlineDownload } from "react-icons/hi";
import { BiSelectMultiple } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import {
  saveData,
  encryptData,
  decryptData,
  decryptPassword,
} from "../commanFunctions";
import { WORKING_NET } from "../../Variables";
import { saveAddress, savePassword } from "../../Redux/actions/index";
import {
  keyPairFromMnemonic,
  keyPairFromPrivateKey,
} from "@vinayakkalra/filecoin-wallet-pkg";
import API from "../../APIs/API";
import BigNumber from "bignumber.js";

function MultiWalletScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const acIndex = Number(localStorage.getItem("fei")) + 1;
  const mnmonic = localStorage.getItem("fem");
  const activeIndex = localStorage.getItem("feai");
  const [isPassword, setIsPassword] = useState(false);
  const [password, setPassword] = useState(
    useSelector((state) => state.savePasswordReducer)
  );
  const address = JSON.parse(localStorage.getItem("address"));
  const importAddress = JSON.parse(localStorage.getItem("import")) || [];
  const importFek = JSON.parse(localStorage.getItem("feik")) || [];
  const filecoinEncryptedKey = JSON.parse(localStorage.getItem("fek"));

  //   Generate New Wallet address
  const genrateAddress = () => {
    try {
      const generatedKeypair = keyPairFromMnemonic(
        WORKING_NET,
        acIndex,
        decryptData(password, mnmonic)
      );
      console.log(generatedKeypair);
      dispatch(saveAddress(generatedKeypair.address));
      address.push(generatedKeypair.address);
      saveData("address", address);
      let encrypt = encryptData(password, generatedKeypair);
      filecoinEncryptedKey.push(encrypt);
      dispatch(savePassword(password));
      saveData("fek", filecoinEncryptedKey);
      saveData("fei", acIndex);
      saveData("feai", acIndex);
      navigate("/wallet");
    } catch (err) {
      setPassword("");
      alert("*Please enter vaild password.");
    }
  };

  const [isImportWallet, setIsImportWallet] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  // Fetch All Wallet
  const [allBalance, setAllBalance] = useState([]);
  const fetchAllWalletBalance = async () => {
    let arrayOfAddress = [address, importAddress];
    arrayOfAddress = arrayOfAddress.flat();
    const response = await API.post(`/api/v1/multibalance`, {
      data: arrayOfAddress,
    });
    setAllBalance(response.data.balance);
  };

  useEffect(() => {
    fetchAllWalletBalance();
  }, []);

  function nav(move) {
    try {
      const currentIndex = document.activeElement.tabIndex;
      const next = currentIndex + move;
      const items = document.querySelectorAll(".items");
      const targetElement = items[next];
      targetElement.focus();
    } catch (e) {
      console.log("Home Error:", e);
    }
  }

  function handleKeydown(e) {
    e.stopImmediatePropagation();
    switch (e.key) {
      case "ArrowUp":
        nav(-1);
        break;
      case "ArrowDown":
        nav(1);
        break;
      case "ArrowRight":
        nav(1);
        break;
      case "ArrowLeft":
        nav(-1);
        break;
    }
  }

  useEffect(() => {
    document.body.addEventListener("keydown", handleKeydown);
    return () => document.body.removeEventListener("keydown", handleKeydown);
  }, []);

  // Handle Import Wallet from Private Key
  const handleImportWallet = () => {
    if (privateKey.length) {
      try {
        const generatedKeypair = keyPairFromPrivateKey(WORKING_NET, privateKey);
        console.log(generatedKeypair);
        dispatch(saveAddress(generatedKeypair.address));
        importAddress.push(generatedKeypair.address);
        saveData("import", importAddress);
        let encrypt = encryptData(password, generatedKeypair);
        importFek.push(encrypt);
        dispatch(savePassword(password));
        saveData("feik", importFek);
        saveData("feai", address.length + importAddress.length - 1);
        navigate("/wallet");
      } catch (error) {
        setPassword("");
        alert(error);
      }
    } else {
      alert("*Please enter your private key.");
    }
  };

  const [type, setType] = useState("");
  // Handle check password
  const checkPassword = (type) => {
    if (password.length && type == "new_wallet") {
      setIsPassword(false);
      genrateAddress();
    } else if (password.length && type == "import") {
      try {
        let data = decryptData(password, mnmonic);
        setIsImportWallet(true);
        setIsPassword(false);
      } catch (error) {
        alert("*Please enter vaild password.");
      }
    } else {
      setType(type);
      setIsPassword(true);
    }
  };

  return (
    <div id="multi-wallet">
      {!isImportWallet && !isPassword && (
        <div className="container">
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              className="items"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  navigate(-1);
                }
              }}
              onClick={() => navigate(-1)}
            >
              <BsArrowLeft className="larr" />
            </button>
            <h4>My Accounts</h4>
          </div>
          <button
            onClick={() => checkPassword("new_wallet")}
            type="button"
            className="items btn"
            tabIndex={1}
          >
            <AiOutlinePlus /> Create Account
          </button>
          <button
            onClick={() => checkPassword("import")}
            type="button"
            className="items btn"
            tabIndex={2}
          >
            <HiOutlineDownload /> Import Account
          </button>

          <div className="wallet-container">
            {address.map((element, index) => {
              return (
                <div key={index} className="wallet">
                  <div className="heading">Account {index + 1}</div>
                  <div className="address">{element}</div>
                  <div className="value">
                    Value :{" "}
                    {(
                      Number(allBalance[index]?.result) / new BigNumber(1e18)
                    ).toFixed(2)}{" "}
                    FIL
                  </div>
                  <button
                    onClick={() =>
                      index == activeIndex
                        ? ""
                        : localStorage.setItem("feai", index) +
                          navigate("/wallet")
                    }
                    type="button"
                    className={
                      index == activeIndex ? "items btn opacity-5" : "items btn"
                    }
                    tabIndex={index + 3}
                  >
                    <BiSelectMultiple />{" "}
                    {index == activeIndex ? "Selected" : "Select"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="wallet-container">
            {importAddress.map((element, index) => {
              return (
                <div key={index} className="wallet">
                  <div className="heading">
                    Account {index + address.length + 1} <span>Import</span>
                  </div>
                  <div className="address">{element}</div>
                  <div className="value">
                    Value :{" "}
                    {(
                      Number(allBalance[address.length + index]?.result) /
                      new BigNumber(1e18)
                    ).toFixed(2)}{" "}
                    FIL
                  </div>
                  <button
                    onClick={() =>
                      index + address.length == activeIndex
                        ? ""
                        : localStorage.setItem("feai", index + address.length) +
                          navigate("/wallet")
                    }
                    type="button"
                    className={
                      index + address.length == activeIndex
                        ? "items btn opacity-5"
                        : "items btn"
                    }
                    tabIndex={index + address.length + 3}
                  >
                    <BiSelectMultiple />{" "}
                    {index + address.length == activeIndex
                      ? "Selected"
                      : "Select"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isPassword && (
        <div className="inner-container">
          <div className="form">
            <div className="heading">
              <button
                className="items"
                tabIndex={0}
                onClick={() => setIsPassword(false)}
              >
                <BsArrowLeft />
              </button>
              <span className="export-heading">Enter your password</span>
            </div>
            <p className="normal-text" style={{ textAlign: "center" }}>
              *Please enter your <br /> password for create or <br /> import
              wallet.
            </p>
            <form>
              <div>
                <input
                  className="items"
                  tabIndex={1}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  htmlFor="password"
                  placeholder="Enter your password.."
                />
              </div>
              <div className="btn">
                <button
                  className="items"
                  tabIndex={2}
                  type="button"
                  onClick={() => checkPassword(type)}
                >
                  Enter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isImportWallet && !isPassword && (
        <div className="inner-container">
          <div className="form">
            <div className="heading">
              <button
                className="items"
                tabIndex={0}
                onClick={() => setIsImportWallet(false)}
              >
                <BsArrowLeft />
              </button>
              <span className="export-heading">Import Wallet</span>
            </div>
            <p className="normal-text" style={{ textAlign: "center" }}>
              *Imported accounts will <br />
              not be associated with <br /> your originally created <br /> Kai
              foundry account
            </p>
            <form>
              <div>
                <input
                  className="items"
                  tabIndex={1}
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  type="text"
                  htmlFor="privatekey"
                  placeholder="Enter your private key.."
                />
              </div>
              <div className="btn">
                <button
                  className="items"
                  tabIndex={2}
                  type="button"
                  onClick={() => handleImportWallet()}
                >
                  Import Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiWalletScreen;
