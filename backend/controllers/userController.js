const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "trainreservation-secret-key-123", {
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
    } = req.body;

    // Check if user already exists
    const userExists = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
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
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
      },
    });

    if (user) {
      // Generate token
      const token = generateToken(user.id);

      res.status(201).json({
        success: true,
        token,
        userId: user.id,
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
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Generate token
      const token = generateToken(user.id);

      res.json({
        success: true,
        token,
        userId: user.id,
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
  res.json({
    success: true,
    message: "Logged out successfully",
  });
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { password, ...userWithoutPassword } = req.user;

    res.json({
      success: true,
      user: userWithoutPassword,
    });
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
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { name, age, profession, bio } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        age: age ? parseInt(age) : undefined,
        profession,
        bio,
        profileCompleted: true,
      },
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
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
};
