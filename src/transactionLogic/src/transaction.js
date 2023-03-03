const cbor = require("ipld-dag-cbor").util;
const {
  getDigest,
  getCoinTypeFromPath,
  addressAsBytes,
  bytesToAddress,
  tryToPrivateKeyBuffer,
} = require("./utils");
const { ProtocolIndicator } = require("./constants");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const secp256k1 = require("secp256k1");
const BN = require("bn.js");

// start of Util Functions
function serializeBigNum(gasprice) {
  if (gasprice == "0") {
    return Buffer.from("");
  }
  const gaspriceBigInt = new BN(gasprice, 10);
  const gaspriceBuffer = gaspriceBigInt.toArrayLike(
    Buffer,
    "be",
    gaspriceBigInt.byteLength()
  );
  return Buffer.concat([Buffer.from("00", "hex"), gaspriceBuffer]);
}

function transactionSerializeRaw(message) {
  if (!("to" in message) || typeof message.to !== "string") {
    throw new Error("'to' is a required field and has to be a 'string'");
  }
  if (!("from" in message) || typeof message.from !== "string") {
    throw new Error("'from' is a required field and has to be a 'string'");
  }
  if (!("nonce" in message) || typeof message.nonce !== "number") {
    throw new Error("'nonce' is a required field and has to be a 'number'");
  }
  if (
    !("value" in message) ||
    typeof message.value !== "string" ||
    message.value === "" ||
    message.value.includes("-")
  ) {
    throw new Error(
      "'value' is a required field and has to be a 'string' but not empty or negative"
    );
  }
  if (!("gasfeecap" in message) || typeof message.gasfeecap !== "string") {
    throw new Error("'gasfeecap' is a required field and has to be a 'string'");
  }
  if (!("gaspremium" in message) || typeof message.gaspremium !== "string") {
    throw new Error(
      "'gaspremium' is a required field and has to be a 'string'"
    );
  }
  if (!("gaslimit" in message) || typeof message.gaslimit !== "number") {
    throw new Error("'gaslimit' is a required field and has to be a 'number'");
  }
  if (!("method" in message) || typeof message.method !== "number") {
    throw new Error("'method' is a required field and has to be a 'number'");
  }
  if (!("params" in message) || typeof message.params !== "string") {
    throw new Error("'params' is a required field and has to be a 'string'");
  }

  const to = addressAsBytes(message.to);
  const from = addressAsBytes(message.from);

  const value = serializeBigNum(message.value);
  const gasfeecap = serializeBigNum(message.gasfeecap);
  const gaspremium = serializeBigNum(message.gaspremium);

  const message_to_encode = [
    0,
    to,
    from,
    message.nonce,
    value,
    message.gaslimit,
    gasfeecap,
    gaspremium,
    message.method,
    Buffer.from(message.params, "base64"),
  ];

  return cbor.serialize(message_to_encode);
}

function transactionSignRaw(unsignedMessage, privateKey) {
  if (typeof unsignedMessage === "object") {
    unsignedMessage = transactionSerializeRaw(unsignedMessage);
  }
  if (typeof unsignedMessage === "string") {
    unsignedMessage = Buffer.from(unsignedMessage, "hex");
  }

  // verify format and convert to buffer if needed
  privateKey = tryToPrivateKeyBuffer(privateKey);

  const messageDigest = getDigest(unsignedMessage);
  console.log("messageDigest", messageDigest);
  console.log("privateKey", privateKey);
  // const signature = ecdsaSign({},messageDigest, privateKey);
  // const signature = ec.sign(messageDigest, privateKey, { canonical: false })
  // console.log('signature', signature)

  // using secp256k1
  const secpsignature = secp256k1.ecdsaSign(messageDigest, privateKey);

  const signtx = Buffer.concat([
    Buffer.from(secpsignature.signature),
    Buffer.from([secpsignature.recid]),
  ]);

  console.log("signtx", signtx);

  return signtx;

  // console.log('secpsignature', signtx.toString('base64'))

  // using elliptic
  // const ecSig = ec.sign(messageDigest, privateKey, { canonical: false })

  // const signature = Buffer.concat([
  //     ecSig.r.toArrayLike(Buffer, 'be', 32),
  //     ecSig.s.toArrayLike(Buffer, 'be', 32)
  // ])
  // let recid = ecSig.recoveryParam
  // if (ecSig.s.cmp(ec.nh) === 1) {
  //     ecSig.s = ec.n.sub(ecSig.s)
  //     recid ^= 1
  // }
  // const signatureLowS = Buffer.concat([
  //     ecSig.r.toArrayLike(Buffer, 'be', 32),
  //     ecSig.s.toArrayLike(Buffer, 'be', 32)
  // ])

  // const ellipticsignature = Buffer.concat([
  //     Buffer.from(signature),
  //     Buffer.from([recid]),
  // ])
  // console.log('ellipticsignature', ellipticsignature.toString('base64'))
  // return ellipticsignature;
}

function transactionSign(unsignedMessage, privateKey) {
  if (typeof unsignedMessage !== "object") {
    throw new Error(
      "'message' need to be an object. Cannot be under CBOR format."
    );
  }
  const signature = transactionSignRaw(unsignedMessage, privateKey);

  const signedMessage = {};

  signedMessage.message = unsignedMessage;

  // TODO: support BLS scheme
  signedMessage.signature = {
    data: signature.toString("base64"),
    type: ProtocolIndicator.SECP256K1,
  };

  return signedMessage;
}

function transactionSignLotus(unsignedMessage, privateKey) {
  const signedMessage = transactionSign(unsignedMessage, privateKey);

  return JSON.stringify({
    Message: {
      From: signedMessage.message.from,
      GasLimit: signedMessage.message.gaslimit,
      GasFeeCap: signedMessage.message.gasfeecap,
      GasPremium: signedMessage.message.gaspremium,
      Method: signedMessage.message.method,
      Nonce: signedMessage.message.nonce,
      Params: unsignedMessage.params,
      To: signedMessage.message.to,
      Value: signedMessage.message.value,
    },
    Signature: {
      Data: signedMessage.signature.data,
      Type: signedMessage.signature.type,
    },
  });
}

function messageToSigner(message) {
  return {
    to: message.To,
    from: message.From,
    nonce: message.Nonce,
    value: message.Value.toString(),
    gaslimit: Number(message.GasLimit.toString()),
    gasfeecap: message.GasFeeCap.toString(),
    gaspremium: message.GasPremium.toString(),
    method: message.Method,
    params: message.Params,
  };
}

async function signMessage(message, privkey) {
  // check if the address is available
  // We will check if the encrypted private key is available in localstorage n the below commented line
  // if (this.addresses.length === 0) await this.initAddresses();

  // check if the private keys are available for the from address
  // if (!this.privKeys[message.From]){
  //   throw new Error('From address not found');
  // }
  console.log("i am in sign message", { message, privkey });

  const signedTx = transactionSignLotus(messageToSigner(message), privkey);

  console.log("signedTx", JSON.parse(signedTx));
  return JSON.parse(signedTx);
}

export { signMessage };
