import React, { useEffect, useState } from "react";
import "./Home.scss";
// import './src/App.css'
import { useNavigate } from "react-router-dom";
import { WORKING_NET, TEST_NET_TYPE } from "../../Variables";
import {
  WALLABY_WALLET,
  MAIN_NET_WALLET,
  CALIBERATION_WALLET,
} from "../stringVariables";

function Home() {
  // function move(){
  //   navigator.spatialNavigationEnabled = true;
  // }
  // move()

  const [walletType, setWalletType] = useState("");
  useEffect(() => {
    if (WORKING_NET === "f" || WORKING_NET === "F") {
      setWalletType(MAIN_NET_WALLET);
    } else if (WORKING_NET === "t" || WORKING_NET === "T") {
      if (TEST_NET_TYPE === "WALLABY") {
        setWalletType(WALLABY_WALLET);
      } else {
        setWalletType(CALIBERATION_WALLET);
      }
    }
  }, []);

  const navigate = useNavigate();

  const addressStore = window.localStorage.getItem("address");
  const fek = localStorage.getItem("fek");
  useEffect(() => {
    if (!fek || !addressStore) {
      localStorage.clear();
      navigate("/");
    } else {
      navigate("/wallet");
    }
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

  useEffect(() => {
    document.body.addEventListener("keydown", handleKeydown);
    return () => document.body.removeEventListener("keydown", handleKeydown);
  }, []);

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

  return (
    <div className="home-card-wrapper">
      {/* <div className="wrapper">
        <div><span className="dot"></span></div>
        <div><span className="dot"></span></div>
        <div><span className="dot"></span></div>
        <div><span className="dot"></span></div>
        <div><span className="dot"></span></div>
        <div><span className="dot"></span></div>
        <div><span className="dot"></span></div>
        <div><span className="dot"></span></div>
        <div><span className="dot"></span></div>
        <div><span className="dot"></span></div>
        <div><span className="dot"></span></div>
        <div><span className="dot"></span></div>
        <div><span className="dot"></span></div>
        <div><span className="dot"></span></div>
        <div><span className="dot"></span></div>
      </div> */}
      <div className="home-card-container">
        <div className="home-card-container-heading">
          Welcome to <br />
          <span>Walnut</span> Wallet
        </div>
        <div className="home-card-container-p">
          {walletType}, send and recieve filecoin using this application.
        </div>
        {/* <div className="home-card-container-heading">Started to Discover New <span>Currency</span></div> */}
        {/* <div className="home-card-container-p" >Best trading platform and more reliable financial transactions</div> */}
        <div className="home-btn">
          <button
            className="items"
            tabIndex={0}
            onKeyPress={(e) => e.key === " " && navigate("/new-user")}
            onClick={() => navigate("/new-user/*")}
          >
            {" "}
            Get Started
          </button>
        </div>
        {/* <div className="home-btn items" tabIndex={0} ><button onKeyPress={handleKeyPress} onClick={()=>navigate('/new-user/*')}> Get Started</button></div> */}
      </div>
    </div>
  );
}

export default Home;
