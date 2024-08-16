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

export const energyIncreasePoints = [100, 250, 500, 1000, 2500, 5000];


export const increaseClicker = [1, 1, 1, 1, 1, 1];

export const getEnergyIncreaseForLevel = (level) => {
    if (level < 0 || level >= energyIncreasePoints.length) {
        return {
            energyIncrease: null,
            message: "Invalid level. Please provide a valid level within the range.",
        };
    }

    return {
        level,
        energyIncrease: energyIncreasePoints[level],
    };
};

export const getClickerIncreaseForLevel = (level) => {
    if (level < 0 || level >= energyIncreasePoints.length) {
        return {
            energyIncrease: null,
            message: "Invalid level. Please provide a valid level within the range.",
        };
    }

    return {
        
        level,
        BalanceToDeduct: energyIncreasePoints[level],

    };
};

console.log("l", getEnergyIncreaseForLevel(0))