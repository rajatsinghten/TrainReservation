const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getAllStationCodesForMatchingCities } = require("../utils/railwayStations");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "buddyontrain-secret", {
    expiresIn: "30d",
  });
};

// Register a new user
const registerUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      name,
      age,
      profession,
      bio,
      travelStatus,
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      name,
      age,
      profession,
      bio,      travelStatus: travelStatus || {
        boardingStation: "",
        boardingStationName: "",
        destinationStation: "",
        destinationStationName: "",
        travelDate: null,
        trainNumber: "",
        trainName: "",
        preferredClass: "",
        isActive: false,
      },
      online: true,
      lastSeen: new Date(),
    });

    if (user) {
      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        token,
        userId: user._id,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid user data",
      });
    }
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Update online status
      user.online = true;
      user.lastSeen = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.json({
        success: true,
        token,
        userId: user._id,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Logout user
const logoutUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Update user online status and last seen
    const user = await User.findById(userId);

    if (user) {
      user.online = false;
      user.lastSeen = new Date();
      await user.save();

      res.json({
        success: true,
        message: "Logged out successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    console.error("Error in logoutUser:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    // Check if req.user exists and has an id
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const user = await User.findById(req.user.id).select("-password");

    if (user) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          age: user.age,
          profession: user.profession,
          bio: user.bio,
          travelStatus: user.travelStatus,
          online: user.online,
          lastSeen: user.lastSeen,
          friends: user.friends || [],
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    // Check if req.user exists and has an id
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { name, age, profession, bio, travelStatus, profileCompleted } =
      req.body;

    // Validate required fields
    if (!name || !age || !profession || !bio) {
      return res.status(400).json({
        success: false,
        message: "All profile fields are required",
      });
    }

    // Find user and update profile
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = name;
      user.age = age;
      user.profession = profession;
      user.bio = bio;

      // Handle travelStatus if provided (now as an object)
      if (travelStatus) {
        user.travelStatus = travelStatus;
      }

      user.profileCompleted = profileCompleted || true;

      await user.save();

      res.json({
        success: true,
        message: "Profile updated successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update travel status
const updateTravelStatus = async (req, res) => {
  try {
    // Check if req.user exists and has an id
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const {
      boardingStation,
      boardingStationName,
      destinationStation,
      destinationStationName,
      travelDate,
      trainNumber,
      trainName,
      preferredClass,
      isActive,
    } = req.body;    // Validate travel status data if the user is listing themselves (isActive = true)
    if (isActive === true) {
      const errors = [];
      
      if (!boardingStation) {
        errors.push("Boarding station is required");
      }
      
      if (!destinationStation) {
        errors.push("Destination station is required");
      }
      
      if (!travelDate) {
        errors.push("Travel date is required");
      }
      
      if (!trainNumber) {
        errors.push("Train number is required");
      }
      
      if (!preferredClass) {
        errors.push("Preferred class is required");
      }
      
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors,
        });
      }
    }

    // Find user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update travel status
    // Check if we're setting it to inactive/empty (unlisting)
    if (
      isActive === false &&
      boardingStation === "" &&
      destinationStation === "" &&
      travelDate === null
    ) {      // Complete reset of travel status
      user.travelStatus = {
        boardingStation: "",
        boardingStationName: "",
        destinationStation: "",
        destinationStationName: "",
        travelDate: null,
        trainNumber: "",
        trainName: "",
        preferredClass: "",
        isActive: false,
      };
    } else {
      // Process the date to ensure it's stored consistently
      let processedDate = travelDate;

      if (travelDate) {
        try {
          // If it's a string date, convert to proper Date object
          if (typeof travelDate === "string") {
            // Handle ISO format dates (YYYY-MM-DDTHH:mm:ss.sssZ)
            if (travelDate.includes("T") || travelDate.includes("Z")) {
              processedDate = new Date(travelDate);
            } else {
              processedDate = new Date(travelDate);

              // If invalid date, try parsing from DD-MM-YYYY format
              if (isNaN(processedDate.getTime())) {
                const dateParts = travelDate.split("-");
                if (dateParts.length === 3) {
                  processedDate = new Date(
                    `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
                  );
                }
              }
            }
          }
        } catch (error) {
          console.error("Error processing date:", error);
          // Keep original date if processing fails
          processedDate = travelDate;
        }
      }      // Normal update preserving existing values when not provided
      user.travelStatus = {
        boardingStation:
          boardingStation !== undefined
            ? boardingStation.trim()
            : user.travelStatus.boardingStation,
        boardingStationName:
          boardingStationName !== undefined
            ? boardingStationName.trim()
            : user.travelStatus.boardingStationName || "",
        destinationStation:
          destinationStation !== undefined
            ? destinationStation.trim()
            : user.travelStatus.destinationStation,
        destinationStationName:
          destinationStationName !== undefined
            ? destinationStationName.trim()
            : user.travelStatus.destinationStationName || "",
        travelDate:
          processedDate !== undefined
            ? processedDate
            : user.travelStatus.travelDate,
        trainNumber:
          trainNumber !== undefined
            ? trainNumber
            : user.travelStatus.trainNumber,
        trainName:
          trainName !== undefined
            ? trainName
            : user.travelStatus.trainName || "",
        preferredClass:
          preferredClass !== undefined
            ? preferredClass
            : user.travelStatus.preferredClass,
        isActive:
          isActive !== undefined ? isActive : user.travelStatus.isActive,
      };
    }

    await user.save();

    res.json({
      success: true,
      message: "Travel status updated successfully",
      travelStatus: user.travelStatus,
    });
  } catch (error) {
    console.error("Error in updateTravelStatus:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Find travel buddies with matching travel status
const findTravelBuddies = async (req, res) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: from, to, and date are required",
      });
    }

    // Try parsing the date input
    let parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      // Try DD-MM-YYYY
      const parts = date.split("-");
      if (parts.length === 3 && parts[0].length !== 4) {
        parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    }

    if (isNaN(parsedDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD or DD-MM-YYYY.",
      });
    }

    // Build the start and end of day
    const startOfDay = new Date(parsedDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(parsedDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Get all station codes for the cities that match 'from' and 'to' stations
    const fromStationCodes = getAllStationCodesForMatchingCities(from);
    const toStationCodes = getAllStationCodesForMatchingCities(to);

    // Create regex patterns for all station codes in the respective cities
    const fromRegexPattern = fromStationCodes.map(code => `^${code}$`).join('|');
    const toRegexPattern = toStationCodes.map(code => `^${code}$`).join('|');
    
    const fromRegex = new RegExp(fromRegexPattern, "i");
    const toRegex = new RegExp(toRegexPattern, "i");

    // Prepare query
    const query = {
      "travelStatus.isActive": true,
      "travelStatus.boardingStation": fromRegex,
      "travelStatus.destinationStation": toRegex,
      "travelStatus.travelDate": { $gte: startOfDay, $lte: endOfDay },
    };

    if (req.user?.id) {
      query._id = { $ne: req.user.id };
    }

    const currentUser = req.user
      ? await User.findById(req.user.id).select("friends")
      : null;

    const users = await User.find(query).select(
      "name username profession bio travelStatus friends"
    );

    const result = users.map((user) => {
      const isFriend =
        currentUser?.friends?.some(
          (fId) => fId.toString() === user._id.toString()
        ) || false;

      // Determine if this is an exact station match or city match
      const isExactFromMatch = user.travelStatus.boardingStation.toLowerCase() === from.toLowerCase();
      const isExactToMatch = user.travelStatus.destinationStation.toLowerCase() === to.toLowerCase();
      const matchType = (isExactFromMatch && isExactToMatch) ? 'exact' : 'city';      return {
        _id: user._id,
        username: user.username,
        name: user.name,
        profession: user.profession,
        bio: user.bio,
        isFriend,        matchType, // 'exact' for same station, 'city' for same city
        travelDetails: {
          boardingStation: user.travelStatus.boardingStation,
          boardingStationName: user.travelStatus.boardingStationName || "",
          destinationStation: user.travelStatus.destinationStation,
          destinationStationName: user.travelStatus.destinationStationName || "",
          trainNumber: user.travelStatus.trainNumber,
          trainName: user.travelStatus.trainName || "",
          preferredClass: user.travelStatus.preferredClass,
          travelDate: user.travelStatus.travelDate,
        },
      };
    });

    // Sort results to show exact matches first, then city matches
    result.sort((a, b) => {
      if (a.matchType === 'exact' && b.matchType === 'city') return -1;
      if (a.matchType === 'city' && b.matchType === 'exact') return 1;
      return 0;
    });

    res.json({ 
      success: true, 
      count: result.length, 
      data: result,
      searchInfo: {
        fromStations: fromStationCodes,
        toStations: toStationCodes,
        exactMatches: result.filter(r => r.matchType === 'exact').length,
        cityMatches: result.filter(r => r.matchType === 'city').length,
      }
    });
  } catch (error) {
    console.error("Error in findTravelBuddies:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find user by ID and exclude password
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get user's friends with details
const getUserFriends = async (req, res) => {
  try {
    // Check if req.user exists and has an id
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const userId = req.user.id;

    // Find the user and get their friends array
    const user = await User.findById(userId).select("friends");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.friends || user.friends.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Fetch details for each friend
    const friends = await User.find({
      _id: { $in: user.friends },
    }).select("-password");

    // Return friends with relevant fields
    const friendsData = friends.map((friend) => ({
      _id: friend._id,
      username: friend.username,
      name: friend.name,
      profession: friend.profession,
      online: friend.online,
      lastSeen: friend.lastSeen,
    }));

    res.json({
      success: true,
      data: friendsData,
    });
  } catch (error) {
    console.error("Error in getUserFriends:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateProfile,
  updateTravelStatus,
  findTravelBuddies,
  getUserById,
  getUserFriends,
};
