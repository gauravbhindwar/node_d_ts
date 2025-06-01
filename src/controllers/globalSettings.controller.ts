import { MessageFormation } from '@/constants/messages.constants';
import GlobalSettingsRepo from '@/repository/globalSettings.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class GlobalSettingsController {
  private globalSettingsService = new GlobalSettingsRepo();
  private msg = new MessageFormation('Global Settings').message;

  public findAllGlobalSettings = catchAsync(async (req: Request, res: Response) => {
    const responseData = await this.globalSettingsService.getAllGlobalSettings();
    return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
  });

//   public getGlobalSettingsData = catchAsync(async (req: Request, res: Response) => {
//     const responseData = await this.globalSettingsService.getGlobalSettingsData();
//     return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
//   });

  public addGlobalSettings = catchAsync(async (req: Request, res: Response) => {
    const responseData = await this.globalSettingsService.createGlobalSettings({
      body: req.body,
    });
    return generalResponse(req, res, responseData, this.msg.create, 'success', true);
  });

//   public updateGlobalSettings = catchAsync(async (req: Request, res: Response) => {
//     const id = req.params.id;
//     const responseData = await this.globalSettingsService.updateGlobalSettings({
//       body: req.body,
//       id: +id,
//     });
//     return generalResponse(req, res, responseData, this.msg.update, 'success', true);
//   });

//   public deleteGlobalSettings = catchAsync(async (req: Request, res: Response) => {
//     const id = req.params.id;
//     const responseData = await this.globalSettingsService.deleteGlobalSettings(+id);
//     return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
//   });
}

export default GlobalSettingsController;
