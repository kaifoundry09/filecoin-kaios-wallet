import React, { useEffect } from "react";
import "./Setting.scss";
import { BsArrowLeft } from "react-icons/bs";
import { IoMdLogOut } from "react-icons/io";
import { FaMoneyCheckAlt } from "react-icons/fa";
import { TbDatabaseExport } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

function Setting() {
  const navigate = useNavigate();

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
    <div className="s">
      <div className="setting-page">
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
          </button>{" "}
          Settings
        </div>
        <div className="content">
          <div className="option">
            <button
              className="items"
              tabIndex={1}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  navigate("/transactions");
                }
              }}
              onClick={() => navigate("/transactions")}
            >
              <FaMoneyCheckAlt /> Transactions{" "}
            </button>
          </div>
          <div className="option">
            <button
              className="items"
              tabIndex={2}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  navigate("/export");
                }
              }}
              onClick={() => navigate("/export")}
            >
              <TbDatabaseExport /> Export
            </button>
          </div>
          <div className="option">
            <button
              className="items"
              tabIndex={3}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  localStorage.clear();
                  navigate("/");
                }
              }}
              onClick={() => localStorage.clear() + navigate("/")}
            >
              <IoMdLogOut /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Setting;
