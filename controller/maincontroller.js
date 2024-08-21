import User from "../models/User.js";
import { catchAsync, getClickerIncreaseForLevel, getEnergyIncreaseForLevel, getNextRank, httpStatus, responseObject, updateMultitapArray } from "../utils/helper.js";

const login = catchAsync(async (req, res) => {
    const {
        id,
        first_name,
        last_name,
        username,
    } = req.userPayload;
    const { reffralId } = req.body;

    if (!id) {
        const err = responseObject(false, true, {
            message: "empty address",
        });
        return res.status(httpStatus.BAD_REQUEST).json(err);
    }
    let user = await User.findOne({ id: id });
    const now = Date.now();
    const refillRate = 1;
    if (!user) {
        user = new User({
            id: id,
            username: username || first_name,
            first_name,
            last_name,
            lastEnergyUpdate: now,
            referralCode: id,
        });
        if (reffralId) {
            const referrer = await User.findById(reffralId);
            if (referrer) {
                if (!referrer.invitedFriends.includes(user._id)) {
                    user.referredBy = referrer._id;
                    user.points = 250
                    referrer.invitedFriends.push(user._id);
                    referrer.points = (referrer.points || 0) + 250;
                    await referrer.save();
                } else {

                    const err = responseObject(false, true, {
                        message: "User already referred",
                    });
                    return res.status(httpStatus.BAD_REQUEST).json(err);

                }
            }
        }
        await user.save();
        const response = responseObject(true, false, {
            message: "Registration successful",
            user
        });
        return res.status(httpStatus.OK).json(response);
    }
    else {
        const elapsedTime = Math.floor((now - user.lastEnergyUpdate) / 1000);
        const energyToAdd = Math.floor(elapsedTime * refillRate);
        user.energy = Math.min(user.energy + energyToAdd, user.energyCapacity);
        user.lastEnergyUpdate = now;
        await user.save();
        const response = responseObject(true, false, {
            message: "Login successful",
            user
        });
        return res.status(httpStatus.OK).json(response);
    }
})

const UpgradeUserEnergy = catchAsync(async (req, res) => {
    const {
        id,
    } = req.userPayload;
    const user = await User.findOne({ id: id });

    if (!user) {
        const err = responseObject(false, true, {
            message: "user not found",
        });
        return res.status(httpStatus.NOT_FOUND).json(err);
    }

    const upcomingUpgradeEnergy = getEnergyIncreaseForLevel(user.energyCapacity , user.levelIndex);

    if (upcomingUpgradeEnergy.energyIncrease === null) {
        const err = responseObject(false, true, {
            message: "energy alredy upgraded",
        });
        return res.status(httpStatus.BAD_REQUEST).json(err);
    }
    if (user.points < upcomingUpgradeEnergy.energyIncrease) {
        const err = responseObject(false, true, {
            message: "insufficient balance",
        });
        return res.status(httpStatus.BAD_REQUEST).json(err);
    }
    user.energyCapacity = upcomingUpgradeEnergy.nextEnergy;
    user.points -= upcomingUpgradeEnergy.energyIncrease;
    user.energyLimitArray = updateMultitapArray(upcomingUpgradeEnergy.level)
    await user.save()

    const response = responseObject(true, false, {
        data: user,
        message: "upgarded succesfully",
    });
    return res.status(httpStatus.OK).json(response);
})

const UpgradeUserMultiply = catchAsync(async (req, res) => {
    const {
        id,
    } = req.userPayload;
    const user = await User.findOne({ id: id });

    if (!user) {
        const err = responseObject(false, true, {
            message: "user not found",
        });
        return res.status(httpStatus.NOT_FOUND).json(err);
    }

    const upcomingUpgradeEnergy = getClickerIncreaseForLevel(user.multitap, user.levelIndex);

    if (upcomingUpgradeEnergy.energyIncrease === null) {
        const err = responseObject(false, true, {
            message: "energy already upgraded",
        });
        return res.status(httpStatus.BAD_REQUEST).json(err);
    }
    if (user.points <= upcomingUpgradeEnergy.balanceToDeduct) {
        const err = responseObject(false, true, {
            message: "insufficient balance",
        });
        return res.status(httpStatus.BAD_REQUEST).json(err);
    }
    user.multitap += 1;
    user.points -= upcomingUpgradeEnergy.balanceToDeduct;
    user.multitapArray = updateMultitapArray(upcomingUpgradeEnergy.level)
    console.log("user pints", user.points)
    await user.save()

    const response = responseObject(true, false, {
        data: user,
        message: "upgarded succesfully",
    });
    return res.status(httpStatus.OK).json(response);



})

const getInvitedFriends = catchAsync(async (req, res) => {
    const {
        id,
    } = req.userPayload;
    try {
        const user = await User.findOne({ id: id }).populate('invitedFriends');
        if (!user) {
            const err = responseObject(false, true, {
                message: "User not found",
            });
            return res.status(httpStatus.NOT_FOUND).json(err);
        }
        const response = responseObject(true, false, {
            invitedFriends: user.invitedFriends
        });
        return res.status(httpStatus.OK).json(response);
    } catch (error) {
        console.log("er", error)
        const err = responseObject(false, true, {
            message: "Internal server error",
        });
        return res.status(httpStatus.INTERNAL_SERVER).json(err);

    }
});

const useFullTank = catchAsync(async (req, res) => {
    const {
        id,
    } = req.userPayload;
    const user = await User.findOne({ id: id });

    if (!user) {
        const err = responseObject(false, true, {
            message: "user not found",
        });
        return res.status(httpStatus.NOT_FOUND).json(err);
    }
    const currentTimestamp = Date.now();
    const previousUsedTimestamp = user.boostTimestamp;
    const twelveHoursInMillis = 12 * 60 * 60 * 1000;

    // Check if 12 hours have passed
    if (currentTimestamp - previousUsedTimestamp >= twelveHoursInMillis) {
        user.energy = user.energyCapacity;
        user.boostTimestamp = currentTimestamp; // Update the timestamp
        await user.save(); // Save the updated user document

        const successResponse = responseObject(true, false, {
            data: user,
            message: "Energy refilled.",
        });
        return res.status(httpStatus.OK).json(successResponse);
    } else {
        const timeRemaining = twelveHoursInMillis - (currentTimestamp - previousUsedTimestamp);
        const err = responseObject(false, true, {
            message: `Error: 12 hours have not passed yet. Please wait ${Math.ceil(timeRemaining / (60 * 1000))} more minutes.`,
        });
        return res.status(httpStatus.BAD_REQUEST).json(err);
    }
})

const useMultiplier = catchAsync(async (req, res) => {
    const {
        id,
    } = req.userPayload;
    const user = await User.findOne({ id: id });

    if (!user) {
        const err = responseObject(false, true, {
            message: "user not found",
        });
        return res.status(httpStatus.NOT_FOUND).json(err);
    }
    const currentTimestamp = Date.now();
    const previousUsedTimestamp = user.multiplyTimestamp;
    const twelveHoursInMillis = 12 * 60 * 60 * 1000;

    if (currentTimestamp - previousUsedTimestamp >= twelveHoursInMillis) {
        user.multiplyTimestamp = Date.now();
        await user.save();
        const successResponse = responseObject(true, false, {
            data: user,
            message: "Multiplier started",
        });
        return res.status(httpStatus.OK).json(successResponse);
    } else {
        const timeRemaining = twelveHoursInMillis - (currentTimestamp - previousUsedTimestamp);
        const err = responseObject(false, true, {
            message: `Error: 12 hours have not passed yet. Please wait ${Math.ceil(timeRemaining / (60 * 1000))} more minutes.`,
        });
        return res.status(httpStatus.BAD_REQUEST).json(err);
    }
})

const getLeaderBoard = catchAsync(async (req, res) => {
    try {
        // Get the user ID from the request (assuming it's in the request object)
        const {
            id,
        } = req.userPayload;
        // Fetch the top 10 users sorted by points
        const topUsers = await User.find({})
            .sort({ points: -1 })
            .limit(10)
            .select('username points');

        // Find the specific user
        const user = await User.findOne({ id: id }).select('username points');

        // Calculate the rank of the user
        const totalUsers = await User.countDocuments({});
        const rank = user ? await User.countDocuments({ points: { $gt: user.points } }) + 1 : null;
        const response = responseObject(true, false, {
            topUsers,
            userRank: rank,
            user: user ? { username: user.username, points: user.points } : null,
            totalUsers
        });
        return res.status(httpStatus.OK).json(response);

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        const err = responseObject(false, true, {
            message: "Internal server error",
        });
        return res.status(httpStatus.INTERNAL_SERVER).json(err);
    }
})

const clickUpdate = catchAsync(async (req, res) => {
    const { id } = req.userPayload;
    const { clicks } = req.body;
    if (clicks > 2100) {
        const err = responseObject(false, true, {
            message: "bots are not allowed",
        });
        return res.status(httpStatus.BAD_REQUEST).json(err);
    }
    if (!id) {
        const err = responseObject(false, true, {
            message: "empty params",
        });
        return res.status(httpStatus.BAD_REQUEST).json(err);
    }
    const user = await User.findOne({ id: id });

    if (!user) {
        const err = responseObject(false, true, {
            message: "user not found",
        });
        return res.status(httpStatus.NOT_FOUND).json(err);
    }
    const coins = clicks * user.multitap;
    const now = Date.now();
    const refillRate = 1;
    const elapsedTime = Math.floor((now - user.lastEnergyUpdate) / 1000);
    const energyToAdd = Math.floor(elapsedTime * refillRate);
    user.energy = Math.min(user.energy + energyToAdd, user.energyCapacity);
    user.lastEnergyUpdate = now;

    if (user.energy < coins) {
        await user.save()
        const err = responseObject(false, true, {
            message: "insufficient rechargePoint",
        });
        return res.status(httpStatus.BAD_REQUEST).json(err);
    }
    user.energy -= coins;
    user.points += coins;
    const predictedRank = getNextRank(user.points)
    if (user.levelIndex < predictedRank.currentRank) {
        user.levelIndex = predictedRank.currentRank
    }
    await user.save();
    const response = responseObject(true, false, {
        data: coins,
        user: user,
        message: "updated succesfully",
    });
    return res.status(httpStatus.OK).json(response);
})

const completTask = catchAsync(async (req, res) => {
    const {
        id,
    } = req.userPayload;
    const { taskName } = req.body;

    try {
        const user = await User.findOne({ id: id });
        if (!user) {
            const err = responseObject(false, true, {
                message: "User not found",
            });
            return res.status(httpStatus.NOT_FOUND).json(err);
        }

        let rewardPoints = 0;
        let taskCompleted = false;

        switch (taskName) {
            case 'follow_on_x':
                if (!user.isFollowed) {
                    rewardPoints = 250;
                    user.isFollowed = true;
                    taskCompleted = true;
                }
                break;
            case 'join_tg_group':
                if (!user.joinTgChannel) {
                    rewardPoints = 250;
                    user.joinTgChannel = true;
                    taskCompleted = true;
                }
                break;
            case 'subscribe_youtube':
                if (!user.subscribeYouTube) {
                    rewardPoints = 250;
                    user.subscribeYouTube = true;
                    taskCompleted = true;
                }
                break;
            case 'like_retweet':
                if (!user.likeRetweet) {
                    rewardPoints = 250;
                    user.likeRetweet = true;
                    taskCompleted = true;
                }
                break;
            default:
                const err = responseObject(false, true, {
                    message: 'Invalid task type',
                });
                return res.status(httpStatus.BAD_REQUEST).json(err);

        }
        if (taskCompleted) {
            user.points += rewardPoints;
            user.completedTasks.push(taskName);
            const predictedRank = getNextRank(user.points)
            if (user.levelIndex < predictedRank.currentRank) {
                user.levelIndex = predictedRank.currentRank
            }
            await user.save();
            const response = responseObject(true, false, {
                rewardPoints,
                user
            });
            return res.status(httpStatus.OK).json(response);

        } else {
            const err = responseObject(false, true, {
                message: 'Task already completed',
            });
            return res.status(httpStatus.BAD_REQUEST).json(err);
        }
    } catch (error) {
        console.error('Error completing task:', error);
        const err = responseObject(false, true, {
            message: 'Internal server error',
        });
        return res.status(httpStatus.INTERNAL_SERVER).json(err);

    }
});

const completeRefferalTask = catchAsync(async () => {
    const {
        id,
    } = req.userPayload;
    const { taskName } = req.body;
    const user = await User.findOne({ id: id });

    if (!user) {
        const err = responseObject(false, true, {
            message: "User not found",
        });
        return res.status(httpStatus.NOT_FOUND).json(err);
    }

    let totalPoints = user.points || 0;

    // Define referral tasks and points
    const invitedFriends = [
        { count: 3, points: 250, taskName: "invite3Friends" },
        { count: 10, points: 600, taskName: "invite10Friends" },
        { count: 15, points: 900, taskName: "invite15Friends" }
    ];

    // Find the task based on taskName
    const task = invitedFriends.find(task => task.taskName === taskName);

    if (task) {
        // Check if the user meets the required count for the task
        if (user.invitedFriends.length >= task.count) {
            if (user.referralTasks[taskName]) {
                const err = responseObject(false, true, {
                    message: 'Reward already redeemed',
                });
                return res.status(httpStatus.BAD_REQUEST).json(err);
            }
            totalPoints += task.points;

            user.points = totalPoints;
            user.referralTasks[taskName] = true
            const predictedRank = getNextRank(user.points)
            if (user.levelIndex < predictedRank.currentRank) {
                user.levelIndex = predictedRank.currentRank
            }
            // Save updated user data
            await user.save();

            const response = responseObject(true, false, {
                message: `Points added for completing ${taskName}`, points: totalPoints,
                user
            });
            return res.status(httpStatus.OK).json(response);

        } else {
            const err = responseObject(false, true, {
                message: 'Not enough referrals to complete this task'
            });
            return res.status(httpStatus.BAD_REQUEST).json(err);
        }
    } else {
        const err = responseObject(false, true, {
            message: 'Invalid task name'
        });
        return res.status(httpStatus.BAD_REQUEST).json(err);
    }
})

const mainController = {
    login,
    clickUpdate,
    useFullTank,
    useMultiplier,
    getInvitedFriends,
    UpgradeUserEnergy,
    UpgradeUserMultiply,
    getLeaderBoard,
    completTask,
    completeRefferalTask
}

export default mainController