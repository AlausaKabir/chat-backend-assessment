import type { Request, Response } from "express";
import * as AuthService from "../services/auth.service.js";
import { ResponseUtil } from "../utils/response.util.js";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await AuthService.register(req.body);
    res.status(201).json(ResponseUtil.created("User registered successfully", user));
  } catch (error: any) {
    res.status(400).json(ResponseUtil.badRequest("Registration failed", error.message));
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.login(req.body);
    res.status(200).json(ResponseUtil.success("Login successful", result));
  } catch (error: any) {
    res.status(401).json(ResponseUtil.unauthorized(error.message));
  }
};
