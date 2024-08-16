import crypto from "crypto";
import { httpStatus } from "./helper.js";
const TELEGRAM_BOT_TOKEN = "7348203341:AAGEFNyEWz2l4dsJEbE3wwuygV-_9PV7baQ";

const validate = (data) => {
    // Data received from Telegram login widget
    const initData = new URLSearchParams(data);
    const hash = initData.get("hash");
    let dataToCheck = [];

    // Sort the data and prepare the data string to be hashed
    initData.sort();
    initData.forEach((val, key) => {
        if (key !== "hash") {
            dataToCheck.push(`${key}=${val}`);
        }
    });

    // Generate the secret key using the bot token
    const secret = crypto
        .createHmac("sha256", "WebAppData")
        .update(TELEGRAM_BOT_TOKEN)
        .digest();

    // Generate the hash using the data string and secret key
    const _hash = crypto
        .createHmac("sha256", secret)
        .update(dataToCheck.join("\n"))
        .digest("hex");

    console.log("hash", hash === _hash)

    // Return true if the generated hash matches the provided hash
    return _hash === hash;
};

const getTgdata = (data) => {
    const params = new URLSearchParams(data);
    const userEncoded = params.get("user");
    const chatInstance = params.get("chat_instance");
    const chatType = params.get("chat_type");
    const userDecoded = decodeURIComponent(userEncoded);
    const user = JSON.parse(userDecoded);
    return {
        ...user,
        chatType: chatType,
        instance: chatInstance,
    };
};

export const verifyTgUser = function (req, res, next) {
    const { tgData } = req.body;
    if (!tgData) {
        const sendObject = {
            error: true,
            message: "empty param",
            status: httpStatus.INVALID_INPUT,
        };
        return res.status(httpStatus.INVALID_INPUT).json(sendObject);
    }
    const validateData = validate(tgData);
    if (!validateData) {
        const sendObject = {
            error: true,
            message: "Unauthorized",
            status: httpStatus.UNAUTHORIZATION,
        };
        return res.status(httpStatus.UNAUTHORIZATION).json(sendObject);
    }
    const payload = getTgdata(tgData);
    req.userPayload = payload;
    next();
};
