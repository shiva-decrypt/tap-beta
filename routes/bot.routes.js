import express from "express";
import { verifyTgUser } from "../utils/verifyLogin.js";
import mainController from "../controller/maincontroller.js";
const router = express.Router();
router.post("/webapp-login", verifyTgUser, mainController.login)
router.post("/users/invited-friends", verifyTgUser, mainController.getInvitedFriends)
router.post("/claim-task-reward", verifyTgUser, mainController.completTask)
router.post("/claim-refral-reward", verifyTgUser, mainController.completeRefferalTask)
router.post("/add-clicks", verifyTgUser,mainController.clickUpdate)
router.post("/leaderboard",verifyTgUser,mainController.getLeaderBoard)
router.post("/upgrade-energylimit",verifyTgUser,mainController.UpgradeUserEnergy)
router.post("/upgrade-clicker", verifyTgUser, mainController.UpgradeUserMultiply)
router.put("/update-user", verifyTgUser)

export default router;
