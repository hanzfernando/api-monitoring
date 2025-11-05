import { Request, Response } from "express";
import { config } from "../config/environment";
import jwt from "jsonwebtoken";

export const generateAuthToken = (id: string, res: Response): string => {
  const token = jwt.sign({ id }, config.jwt.secret, { expiresIn: "7d" });

  console.log("Setting auth cookie with token:", token);
  res.cookie(config.cookie, token, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    sameSite: config.env !== "development" ? "none" : "strict",
    secure: config.env !== "development",
    path: "/",
  });

  return token;
}