import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import Leaderboard from "../models/leaderboard.js";

dotenv.config();

export const createOrder = async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
    };

    const order = await instance.orders.create(options);

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating order", error });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      name,
    } = req.body;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }


    let data = await Leaderboard.findOne();
    if (!data) data = new Leaderboard();

    const paidAmount = parseInt(amount) || 0;
    const userName = name || "Anonymous";

    data.totalCount += 1;
    data.totalAmount += paidAmount;

    let users = data.users || [];

   
    if (users.length < 3) {
      users.push({ name: userName, amount: paidAmount });
    } else {
      const minUser = users.reduce(
        (min, u) => (u.amount < min.amount ? u : min),
        users[0]
      );
      if (paidAmount > minUser.amount) {
        users = users.filter((u) => u.name !== minUser.name);
        users.push({ name: userName, amount: paidAmount });
      }
    }

    users.sort((a, b) => b.amount - a.amount);
    data.users = users.slice(0, 3);
    await data.save();

    res.json({
      success: true,
   
      totalCount: data.totalCount,
      totalAmount: data.totalAmount,
      topUsers: data.users,
    });
  } catch (error) { 
    res.status(500).json({ message: "Error verifying payment", error });
  }
};


export const getCount = async (req, res) => {
  try {
    const data = await Leaderboard.findOne();
    res.json({
      totalCount: data?.totalCount || 0,
      totalAmount: data?.totalAmount || 0,
      topUsers: data?.users || [],
    });
  } catch (error) {
    console.error("Error reading data:", error);
    res.status(500).json({ message: "Error reading data", error });
  }
};
