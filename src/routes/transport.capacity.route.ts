import TransportCapacityController from "@/controllers/transport.capacity.controller";
import {
  FeaturesNameEnum,
  PermissionEnum,
} from "@/interfaces/functional/feature.interface";
import { Routes } from "@/interfaces/general/routes.interface";
import authMiddleware from "@/middleware/auth.middleware";
import validationMiddleware from "@/middleware/middleware";
import rolePermissionMiddleware from "@/middleware/rolePermission.middleware";
import { paramsIdSchema } from "@/validationSchema/common.validation";
import {
  TransportCapacityCreateSchema,
  TransportCapacityUpdateSchema,
} from "@/validationSchema/transport.capacity.validation";
import { Router } from "express";

class TransportCapacityRoute implements Routes {
  public path = "/transport-capacity";
  public router = Router();
  public TransportCapacityController = new TransportCapacityController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.TransportSummary,
        PermissionEnum.View
      ),
      this.TransportCapacityController.getAllTransportCapacity
    ); // Get All Transport Capacity (Private)

    this.router.get(
      `${this.path}/get--data`,
      authMiddleware,
      this.TransportCapacityController.getTransportCapacityData
    ); // Get Transport Capacity Data (Public)

    this.router.get(
      `${this.path}/get-transport-capacity-data`,
      authMiddleware,
      this.TransportCapacityController.getTransportCapacityData
    ); // Get Transport Capacity Data (Public)

    this.router.get(
      `${this.path}/:id`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.TransportSummary,
        PermissionEnum.View
      ),
      validationMiddleware(paramsIdSchema, "params"),
      this.TransportCapacityController.getTransportCapacityById
    ); // Get Transport Capacity By Id

    this.router.post(
      `${this.path}`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.TransportSummary,
        PermissionEnum.Create
      ),
      validationMiddleware(TransportCapacityCreateSchema, "body"),
      this.TransportCapacityController.addTransportCapacity
    ); // Add Transport Capacity

    this.router.put(
      `${this.path}/:id`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.TransportSummary,
        PermissionEnum.Update
      ),
      validationMiddleware(paramsIdSchema, "params"),
      validationMiddleware(TransportCapacityUpdateSchema, "body"),
      this.TransportCapacityController.updateTransportCapacity
    ); // Update Transport Capacity

    this.router.delete(
      `${this.path}/:id`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.TransportSummary,
        PermissionEnum.Delete
      ),
      validationMiddleware(paramsIdSchema, "params"),
      this.TransportCapacityController.deleteTransportCapacity
    ); // Delete Transport Capacity
  }
}

export default TransportCapacityRoute;
