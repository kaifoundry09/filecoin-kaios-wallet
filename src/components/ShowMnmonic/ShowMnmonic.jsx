import React, { useState, useEffect } from "react";
import "./ShowMnmonic.scss";
import { AiOutlineDownload } from "react-icons/ai";
import { GoPrimitiveDot } from "react-icons/go";
import { FaRegCopy } from "react-icons/fa";
import { BiLeftArrowAlt } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { generateMnemonic } from "@vinayakkalra/filecoin-wallet-pkg";
import { saveMnmonic } from "../../Redux/actions";
import { useDispatch } from "react-redux";

function ShowMnmonic() {
  const [readInstruction, setReadInstruction] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const mnmonicArr = ["episode", "pen", "food", "apple", "red", "tree", "junction", "wrap", "function", "beer", "yellow", "older"]
  const [mnmonic, setMnmonic] = useState(generateMnemonic());
  const [mnmonicArr, setMnmonicArr] = useState(mnmonic.split(" "));

  const saveRedux = () => {
    dispatch(saveMnmonic(mnmonicArr));
  };

  const handleDownloadMnmonic = () => {
    const txt = mnmonicArr.join(" ");

    const element = document.createElement("a");
    const file = new Blob([txt], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "mnmonic.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
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
    <div className="show-mnmonic-page">
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

      {!readInstruction && (
        <div className="inner-container">
          <div className="inst">
            <div className="heading-inst">Secret Recovery Phrase</div>
            <div className="pera-inst">
              <GoPrimitiveDot />
              <span>
                Your Secret Recovery Phrase makes it easy to back up and restore
                your account.
              </span>
            </div>
            <div className="warning-inst">
              <span>WARNING:</span> Never disclose your Secret Recovery Phrase.
              Anyone with this phrase can take your Filecoin forever. Please
              store it at a safe location.
            </div>
            <div className="btn">
              <button
                className="items"
                tabIndex={0}
                onClick={() => setReadInstruction(true) + saveRedux()}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {readInstruction && (
        <div className="inner-container">
          <div className="per-heading">
            <div
              onClick={() => setReadInstruction(false)}
              className=" back-icon"
            >
              <BiLeftArrowAlt />
            </div>
            <div className="back-icon">Your Seed Phrase</div>
            <div
              onClick={() => {
                navigator.clipboard.writeText(mnmonic).then(function (x) {
                  alert("Copied to clipboard");
                });
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  navigator.clipboard.writeText(mnmonic).then(function (x) {
                    alert("Copied to clipboard");
                  });
                }
              }}
              className="back-icon items"
              tabIndex={0}
            >
              <FaRegCopy />
            </div>
            {/* <div onClick={() => handleDownloadMnmonic()} className='heading-download'>
                        Download <AiOutlineDownload />
                    </div> */}
          </div>
          <ul>
            {mnmonicArr.length &&
              mnmonicArr.map((item, index) => {
                return <li key={index}>{index + 1 + `. ` + item}</li>;
              })}
          </ul>
          <div className="btn">
            <button
              className="items"
              tabIndex={1}
              onClick={() => navigate("/verification")}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShowMnmonic;
