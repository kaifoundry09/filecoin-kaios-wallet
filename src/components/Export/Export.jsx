import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Export.scss";
import { decryptData } from "../commanFunctions";
import { FaRegCopy } from "react-icons/fa";
import { BsArrowLeft } from "react-icons/bs";

function Export() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

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
  document.activeElement.addEventListener("keyup", handleKeydown);

  const [data, setData] = useState({});
  const [isFind, setIsFind] = useState(false);
  const handleExportKey = () => {
    let data = JSON.parse(localStorage.getItem("fek"));
    let importData = JSON.parse(localStorage.getItem("feik"));
    let address = JSON.parse(localStorage.getItem("address"));
    const activeIndex = localStorage.getItem("feai");
    let encryptedData = address.length > activeIndex ?  data[activeIndex] : importData[activeIndex - address.length];
    try {
      const PlainData = decryptData(password, `"${encryptedData}"`);
      setData(PlainData);
      setIsFind(true);
    } catch (error) {
      alert("Your password is Invalid");
    }
  };

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

  return (
    <div className="export-page">
      {!isFind && (
        <div className="inner-container">
          <div className="form">
            <div className="heading">
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
                <BsArrowLeft />
              </button>
              <span className="export-heading">Export Keys</span>
            </div>
            <p className="normal-text">
              *Export private key and public key <br /> through the your
              password
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
                  onClick={() => handleExportKey()}
                >
                  Export
                </button>
                {/* <button className='items' tabIndex={2} type='button' >Export</button> */}
              </div>
            </form>
          </div>
        </div>
      )}
      {isFind && (
        <div className="inner-container mt-32">
          <div className="form">
            <div className="heading">
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
              </button>{" "}
              <span className="export-heading">Export Keys</span>
            </div>
            <p className="normal-text">
              *Export private key and public key through the your password
            </p>
            <div className="content">
              <label>Address : </label>
              <br />
              <div className="key">
                {data && data._address}{" "}
                <FaRegCopy
                  className="items"
                  tabIndex={1}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      navigator.clipboard
                        .writeText(data._address)
                        .then(function (x) {
                          alert("Copied to clipboard");
                        });
                    }
                  }}
                  onClick={() => {
                    navigator.clipboard
                      .writeText(data._address)
                      .then(function (x) {
                        alert("Copied to clipboard");
                      });
                  }}
                />
              </div>
              <label>Private Key : </label>
              <br />
              <div className="key">
                {data && data._privateKey}{" "}
                <FaRegCopy
                  className="items"
                  tabIndex={2}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      navigator.clipboard
                        .writeText(data._privateKey)
                        .then(function (x) {
                          alert("Copied to clipboard");
                        });
                    }
                  }}
                  onClick={() => {
                    navigator.clipboard
                      .writeText(data._privateKey)
                      .then(function (x) {
                        alert("Copied to clipboard");
                      });
                  }}
                />
              </div>
              <label>Public Key : </label>
              <br />
              <div className="key">
                {data && data._publicKey}{" "}
                <FaRegCopy
                  className="items"
                  tabIndex={3}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      navigator.clipboard
                        .writeText(data._publicKey)
                        .then(function (x) {
                          alert("Copied to clipboard");
                        });
                    }
                  }}
                  onClick={() => {
                    navigator.clipboard
                      .writeText(data._publicKey)
                      .then(function (x) {
                        alert("Copied to clipboard");
                      });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Export;
