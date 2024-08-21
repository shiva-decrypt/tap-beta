
import logErrors from "./logErrors.js";

export const catchAsync = function (fn) {
    /**
     * @fn function which is wrapped by the catchAsync function to use the DRY method.
     * pass down the request, response, and the next arguments into the inner function.
     */

    return async (req, res, next) => {
        try {
            const result = await fn(req, res, next);
            // Check if the result is a promise before proceeding
            if (result && typeof result.catch === "function") {
                await result; // Ensure any potential promise is resolved
            }
        } catch (err) {
            logErrors(err);
            console.log(err);
            return res.status(500).json("error occurred in server");
        }
    };
};

export const httpStatus = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    PARTIAL_CONTENT: 206,
    NOT_MODIFIED: 304,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INVALID_INPUT: 422,
    NOT_ACCEPTABLE: 406,
    INTERNAL_SERVER: 500,
    UNAUTHORIZATION: 401,
};


export const responseObject = function (success, error, options) {
    return { success, error, ...options };
};

export const levelMinPoints = [0, 500, 1000, 2000, 3000, 5000];

export const getNextRank = (points) => {
    // Find the current rank based on the user's points
    let currentRank = 0;
    for (let i = 0; i < levelMinPoints.length; i++) {
        if (points >= levelMinPoints[i]) {
            currentRank = i;
        }
    }

    // Calculate the next rank and points needed
    const nextRank = currentRank + 1;
    if (nextRank < levelMinPoints.length) {
        return {
            currentRank,
            nextRank,
            pointsForNextRank: levelMinPoints[nextRank] - points,
        };
    } else {
        // If the user is at the highest rank
        return {
            currentRank,
            nextRank: null,
            pointsForNextRank: null,
            message: "User has reached the highest rank.",
        };
    }
};

export const increaseClicker = [1, 1, 1, 1, 1, 1];
export const energyIncreasePoints = [100, 250, 500, 1000, 2500, 5000];




// Function to update levels to true up to the given level
export const updateMultitapArray = (level) => {
    let multitapArray = [false, false, false, false, false, false];
    for (let i = 0; i <= level; i++) {
        if (i >= 0 && i < multitapArray.length) {
            multitapArray[i] = true;
        }
    }

    return multitapArray;
};

export const getEnergyIncreaseForLevel = (currentEnergy, userCurrentlevel) => {
    const initialEnergy = 250;
    let totalEnergy = initialEnergy;

    for (let i = 0; i < energyIncreasePoints.length; i++) {
        totalEnergy += energyIncreasePoints[i];
        if (currentEnergy < totalEnergy) {

            if (i <= userCurrentlevel) {

                return {
                    sucess: true,
                    nextEnergy: totalEnergy,
                    energyIncrease: energyIncreasePoints[i],
                    level: i,
                    message: `Next energy increase is ${energyIncreasePoints[i]} for a total of ${totalEnergy} energy.`,
                };
            } else {

                return {
                    sucess: false,
                    nextEnergy: null,
                    energyIncrease: null,
                    message: "Max level reached. No further energy increases.",
                };
            }

        }
    }

    return {
        sucess: false,
        nextEnergy: null,
        energyIncrease: null,
        message: "Max level reached. No further energy increases.",
    };
};


export const getClickerIncreaseForLevel = (currentPoint, userCurrentlevel) => {
    const initialPoint = 1;
    let totalPoint = initialPoint;

    for (let i = 0; i < increaseClicker.length; i++) {
        totalPoint += increaseClicker[i];
        if (currentPoint < totalPoint) {
            if (i <= userCurrentlevel) {
                return {
                    sucess: true,
                    level: i,
                    totalPoint: totalPoint,
                    balanceToDeduct: energyIncreasePoints[i],
                    message: ``,
                }
            } else {
                return {
                    sucess: false,
                    nextEnergy: null,
                    energyIncrease: null,
                    message: "Max level reached. No further points increases.",
                };
            }
        }
    }

    return {
        sucess: false,
        nextEnergy: null,
        energyIncrease: null,
        message: "Max level reached. No further points increases.",
    };
};

console.log("l", getClickerIncreaseForLevel(1))