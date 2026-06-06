import express = require("express");
import type { Request, Response, Router, NextFunction } from "express";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../config/db");

const router: Router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_change_me";

const createToken = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

router.post("/register/shipowner", async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, shipName, imoNumber, location } = req.body;

    if (!name || !email || !password || !shipName || !imoNumber) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields.",
      });
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert({
        name,
        email,
        password: hashedPassword,
        role: "SHIPOWNER",
        ship_name: shipName,
        imo_number: imoNumber,
        location: location || null,
      })
      .select("id, name, email, role, location, avatar, ship_name, imo_number")
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    const token = createToken(data);

    return res.status(201).json({
      success: true,
      message: "Shipowner registered successfully.",
      token,
      user: data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Registration failed.",
    });
  }
});

router.post("/register/inspector", async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields.",
      });
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert({
        name,
        email,
        password: hashedPassword,
        role: "INSPECTOR",
        location: location || null,
      })
      .select("id, name, email, role, location, avatar, ship_name, imo_number")
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    const token = createToken(data);

    return res.status(201).json({
      success: true,
      message: "Inspector registered successfully.",
      token,
      user: data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Registration failed.",
    });
  }
});

router.post("/login", async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `This account is not registered as ${role}.`,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      avatar: user.avatar,
      shipName: user.ship_name,
      imoNumber: user.imo_number,
    };

    const token = createToken(safeUser);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: safeUser,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Login failed.",
    });
  }
});

router.get("/me", authMiddleware, async (req: Request, res: Response): Promise<any> => {
  try {
    const userPayload = (req as any).user;

    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, role, location, avatar, ship_name, imo_number")
      .eq("id", userPayload.id)
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user.",
    });
  }
});

module.exports = router;