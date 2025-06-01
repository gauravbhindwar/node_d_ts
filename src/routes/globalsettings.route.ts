import GlobalSettingsController from '@/controllers/globalSettings.controller';
import validationMiddleware from '@/middleware/middleware';
import { GlobalSettingsSchema } from '@/validationSchema/globalsetting.validation';
import { Router } from 'express';
import { Routes } from 'interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';


class GlobalSettingsRoute implements Routes {
  public path = '/global-settings';
  public router = Router();
  public globalSettingsController = new GlobalSettingsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}`,
      authMiddleware,
      this.globalSettingsController.findAllGlobalSettings,
    );
     // Get all Global Settings

    this.router.post(
      `${this.path}`,
      authMiddleware,
      validationMiddleware(GlobalSettingsSchema, 'body'),
      this.globalSettingsController.addGlobalSettings,
    ); // Create Global Settings

    // this.router.put(
    //   `${this.path}/:id`,
    //   authMiddleware,
    //   validationMiddleware(updateGlobalSettingsSchema, 'body'),
    //   this.globalSettingsController.updateGlobalSettings,
    // ); 
    // Update Global Settings

    // this.router.delete(
    //   `${this.path}/:id`,
    //   authMiddleware,
    //   this.globalSettingsController.deleteGlobalSettings,
    // ); 
    // Delete Global Settings
  }
}

export default GlobalSettingsRoute;
