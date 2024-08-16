import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import databaseConnection from './database/db.js';
import botRoute from "./routes/bot.routes.js"

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/bot", botRoute)

const PORT = process.env.PORT || 4003;
databaseConnection(() => {
    app.listen(PORT, () => {
        // tgBotService()
        console.log(`server listening on port ${PORT}`);
    });
});