import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ImportWallet.scss";
import { keyPairFromMnemonic } from "@vinayakkalra/filecoin-wallet-pkg";
import { WORKING_NET } from "../../Variables";
import { useDispatch, useSelector } from "react-redux";
import { saveAddress } from "../../Redux/actions/index";
import { saveData, encryptData } from "../commanFunctions";

function ImportWallet() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mnmonic, setMnmonic] = useState("");

  const [password, setPassword] = useState(
    useSelector((state) => state.savePasswordReducer)
  );

  const genrateAddress = () => {
    const generatedKeypair = keyPairFromMnemonic(WORKING_NET, 0, mnmonic);
    console.log(generatedKeypair);
    dispatch(saveAddress(generatedKeypair.address));
    saveData("address", generatedKeypair.address);
    let encrypt = encryptData(password, generatedKeypair);
    saveData("fek", encrypt);
    navigate("/wallet");
  };

  const readFile = async (e) => {
    e.preventDefault();
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      setMnmonic(text);
      console.log(text);
    };
    reader.readAsText(e.target.files[0]);
  };

  const handleImportWallet = () => {
    const arr = mnmonic.split(" ");
    if (arr.length === 12 || arr.length === 24) {
      genrateAddress();
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
    <div className="import-wallet-page">
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
          <div className="heading">Import External Wallet</div>
          <div className="sub-heading">
            Enter your mnemonic key (12 Words or 24 Words) to import a wallet
            from another provider.
          </div>
          <form>
            <div>
              <label htmlFor="import">Enter your code here</label>
              <br />
              <textarea
                placeholder="Enter your mnemonic...."
                className="items"
                tabIndex={0}
                value={mnmonic}
                onChange={(e) => setMnmonic(e.target.value)}
                type="text"
                htmlFor="import"
              />
            </div>
            {/* <div className='or'>OR</div>
                        <div className='input-import'>
                            <input onChange={(e) => readFile(e)} type="file" name="inputfile"
                                id="inputfile" />
                            <br />
                        </div> */}

            <div className="btn">
              <button
                className="items"
                tabIndex={1}
                type="button"
                onClick={() => handleImportWallet()}
              >
                Import
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ImportWallet;
