import React, { useState, useEffect } from "react";
import "./Login.scss";

import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user_passcode");
    if (!user) {
      navigate("/");
    }
  }, []);

  const handleLoginBtn = () => {
    const getPassword = localStorage.getItem("user_passcode");
    if (getPassword == password) {
      navigate("/wallet");
    } else {
      alert("Please Enter Vaild Password");
    }
  };
  function nav(move) {
    const currentIndex = document.activeElement.tabIndex;
    const next = currentIndex + move;
    const items = document.querySelectorAll(".items");
    const targetElement = items[next];
    targetElement.focus();
  }

  function handleKeydown(e) {
    console.log(e.key);
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
  document.activeElement.addEventListener("keydown", handleKeydown);
  return (
    <div className="create-pasword-page">
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
      <div className="inner-container">
        <div className="form">
          <div className="heading">Welcome back!</div>
          <p
            style={{
              fontSize: "0.7rem",
              textAlign: "center",
              marginTop: "5px",
            }}
          >
            The decentralized web wallet
          </p>
          <form>
            <div>
              <label htmlFor="password">Password</label>
              <br />
              <input
                className="items"
                tabIndex={0}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                htmlFor="password"
              />
            </div>

            <div className="btn">
              <button
                className="items"
                tabIndex={1}
                type="button"
                onClick={() => handleLoginBtn()}
              >
                Unlock
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
