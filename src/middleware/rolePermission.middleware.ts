import {
  FeaturesNameEnum,
  PermissionEnum,
} from "@/interfaces/functional/feature.interface";
import Feature from "@/models/feature.model";
import Permission from "@/models/permission.model";
import UserPermission from "@/models/userPermission.model";
import generalResponse from "@/utils/generalResponse";
import { RequestHandler } from "express";

const rolePermissionMiddleware = (
  feature: FeaturesNameEnum,
  permission: PermissionEnum
): RequestHandler => {
  return async (req, res, next) => {
    const result = await UserPermission.findOne({
      where: {
        loginUserId: req.user?.loginUserId,
        roleId: req.user?.roleId,
      },
      include: [
        {
          model: Permission,
          where: {
            permissionName: permission,
          },
          include: [
            {
              model: Feature,
              where: {
                name: feature,
              },
            },
          ],
        },
      ],
    });
    if (result) {
      next();
    } else {
      return generalResponse(
        req,
        res,
        [],
        "Access denied",
        "error",
        false,
        403
      );
    }
  };
};

export default rolePermissionMiddleware;
