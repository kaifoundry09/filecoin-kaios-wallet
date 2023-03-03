import React, { useEffect } from "react";
import "./NewUser.scss";
import { BsCloudDownloadFill } from "react-icons/bs";
import { AiOutlinePlus } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

function NewUser() {
  const navigate = useNavigate();
  localStorage.setItem("completed", false);

  function nav(move) {
    const currentIndex = document.activeElement.tabIndex;
    const next = currentIndex + move;
    const items = document.querySelectorAll(".items");
    const targetElement = items[next];
    targetElement.focus();
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
  return (
    <div className="new-user-page">
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
      <div className="heading">New to Walnut Wallet?</div>
      <div className="inner-container">
        <div className="create-wallet">
          <div className="sub-heading">Yes, Let's get set up!</div>
          <p className="sub-p">
            This will create a new wallet and Secret Recovery Phrase
          </p>
          <div className="btn">
            <button
              className="items"
              tabIndex={0}
              onClick={() => navigate("/create-password/:false")}
            >
              <AiOutlinePlus /> Create Wallet
            </button>
          </div>
        </div>
        <div className="import-wallet">
          <div className="sub-heading">
            No, I already have a Secret Recovery Phrase
          </div>
          <p className="sub-p">
            Import your existing wallet using a secret Recovery Phrase
          </p>
          <div className="btn">
            <button
              className="items"
              tabIndex={1}
              onClick={() => navigate("/create-password/:true")}
            >
              <BsCloudDownloadFill /> Import Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewUser;
