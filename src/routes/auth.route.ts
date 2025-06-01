// import XeroHelperObject from '@/helpers/xero.helper';
import AuthController from "controllers/auth.controller";
import { Router } from "express";
import { Routes } from "interfaces/general/routes.interface";
import authMiddleware from "middleware/auth.middleware";
import multer from "multer";
import {
  changePasswordSchema,
  loginSchema,
  otpResendSchema,
  otpVerificationSchema,
  resetForgotPasswordSchema,
  updateprofileSchema,
  userValidateSchema,
} from "validationSchema/auth.validation";
import validationMiddleware from "../middleware/middleware";

class AuthRoute implements Routes {
  public path = '/auth';
  public router = Router();
  public authController = new AuthController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/user-validate`,
      validationMiddleware(userValidateSchema, "query"),
      this.authController.userValidate
    ); // User Validate

    this.router.post(
      `${this.path}/login`,
      multer().none(),
      validationMiddleware(loginSchema, "body"),
      this.authController.login
    ); // Login

    this.router.post(
      `${this.path}/otp-verification`,
      multer().none(),
      validationMiddleware(otpVerificationSchema, "body"),
      this.authController.otpVerification
    ); // OTP Verification

    this.router.post(
      `${this.path}/forgot-password`,
      validationMiddleware(otpResendSchema, "body"),
      this.authController.resendOTP
    ); // Forgot Password

    this.router.post(
      `${this.path}/set-password`,
      validationMiddleware(resetForgotPasswordSchema, "body"),
      this.authController.resetPassword
    ); // Reset Password

    this.router.post(
      `${this.path}/change-password`,
      authMiddleware,
      validationMiddleware(changePasswordSchema, "body"),
      this.authController.changePassword
    ); // Change Password

    this.router.get(
      `${this.path}/getLoggedIn`,
      authMiddleware,
      this.authController.getLoggedIn
    ); // Get Logged In User Data

    this.router.put(
      `${this.path}/update_profile`,
      authMiddleware,
      validationMiddleware(updateprofileSchema, "body"),
      this.authController.updateProfile
    );

    this.router.post(
      `${this.path}/access_token`,
      this.authController.genereateAccessToken
    );

    this.router.post(
      `${this.path}/logout`,
      authMiddleware,
      this.authController.logout
    );
  }
}

export default AuthRoute;
