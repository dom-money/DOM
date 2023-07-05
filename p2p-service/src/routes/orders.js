const express = require("express");
const axios = require("axios");
const ordersRouter = express.Router();
const actionsRouter = require("./actions");
const { ethers } = require("ethers");
const { QRPay } = require('vietnam-qr-pay');
const {
  getOrdersByUserAddress,
  getOrderById,
  createOrder,
  updateOrderPrice,
} = require("../database");
const {
  jwtVerify,
  decodeProtectedHeader,
  createRemoteJWKSet,
} = require("jose");

const getTransactionAmount = async (parsedPix) => {
  if (parsedPix.type === "STATIC") {
    return parsedPix.transactionAmount;
  }

  if (parsedPix.type === "DYNAMIC") {
    try {
      const { jwsString } = await parsedPix.fetchPayload({
        url: parsedPix.url,
      });
      const jwtHeader = decodeProtectedHeader(jwsString);
      const jwks = createRemoteJWKSet(new URL(jwtHeader.jku));
      const verifiedJwt = await jwtVerify(jwsString, jwks, {
        algorithms: [jwtHeader.alg],
      });

      return verifiedJwt.payload.valor.original;
    } catch (error) {
      console.error("Error while getting transaction amount:", error);
      throw error;
    }
  }
};

ordersRouter.post("/", async (req, res) => {
  try {
    const qrData = req.body?.qr_data;

    if (!qrData)
      return res.status(400).json({ message: "qr_data is required" });

    const userPublicKey = req.user.wallets[0].public_key;

    const publicKeyWithPrefix = "0x" + userPublicKey;
    const userAddress = ethers.computeAddress(publicKeyWithPrefix);

    const parsedQrData = new QRPay(qrData);
    console.log(parsedQrData);

    if (!parsedQrData.isValid || parsedQrData.provider.name !== 'VIETQR') {
      return res.status(400).json({ message: "Invalid qr_data" });
    }

    const merchant = parsedQrData.consumer.bankNumber;
    const amount = parseInt(parsedQrData.amount, 10);

    // Getting order amount in usdt
    const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=vnd");
    const rate = response.data.tether.vnd;

    // Calculate the amount in USDT
    const usdtAmount = amount / rate;

    const priceValidUntil = new Date(Date.now() + 15000).toISOString();

    const orderFromDB = await createOrder(
      userAddress,
      merchant,
      amount,
      usdtAmount,
      priceValidUntil,
      qrData
    );

    res.status(201).json({ order: orderFromDB });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

ordersRouter.get("/", async (req, res) => {
  const userPublicKey = req.user.wallets[0].public_key;

  const publicKeyWithPrefix = "0x" + userPublicKey;
  const userAddress = ethers.computeAddress(publicKeyWithPrefix);
  const orders = await getOrdersByUserAddress(userAddress);

  if (!orders) {
    return res.json({ orders: [] });
  }

  res.json({ orders });
});

ordersRouter.get("/:orderId", async (req, res) => {
  const userPublicKey = req.user.wallets[0].public_key;
  const publicKeyWithPrefix = "0x" + userPublicKey;
  const userAddress = ethers.computeAddress(publicKeyWithPrefix);

  const orderId = parseInt(req.params.orderId, 10);
  if (isNaN(orderId)) {
    return res.status(400).json({ message: "Invalid order ID" });
  }

  let order = await getOrderById(orderId);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order?.user_address !== userAddress) {
    return res.status(403).json({ message: "You cannot access this order" });
  }

  // If the price is not valid, fetching a new price
  if (
    new Date(order.price_valid_until) < new Date() &&
    order.status === "created"
  ) {
    const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=vnd");
    const rate = response.data.tether.vnd;

    // Calculate the amount in USDT
    const usdtAmount = order.amount / rate;
    const priceValidUntil = new Date(Date.now() + 15000).toISOString();

    // Update order with new price and validity
    order = await updateOrderPrice(orderId, usdtAmount, priceValidUntil);
  }

  res.json({ order });
});

ordersRouter.use(
  "/:orderId/actions",
  async (req, res, next) => {
    const userPublicKey = req.user.wallets[0].public_key;
    const publicKeyWithPrefix = "0x" + userPublicKey;
    const userAddress = ethers.computeAddress(publicKeyWithPrefix);

    const orderId = parseInt(req.params.orderId, 10);
    if (isNaN(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await getOrderById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order?.user_address !== userAddress) {
      return res.status(403).json({ message: "You cannot access this order" });
    }

    req.order = order;
    next();
  },
  actionsRouter
);

module.exports = ordersRouter;
