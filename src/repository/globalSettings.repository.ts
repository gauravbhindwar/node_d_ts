import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import GlobalSettings from "@/models/globalsettings.model";
import { parse } from "@/utils/common.util";
import BaseRepository from "./base.repository";

export default class GlobalSettingsRepo extends BaseRepository<GlobalSettings> {
  constructor() {
    super(GlobalSettings.name);
  }

  private msg = new MessageFormation("Global Settings").message;

  public async getAllGlobalSettings() {
    const isExist = await GlobalSettings.findOne({});
    if (!isExist) {
      throw new HttpException(404, this.msg.notFound);
    }
    return parse(isExist);
  }

  // async getGlobalSettingsById(id: number) {
  //   const data = await GlobalSettings.findOne({ where: { id: id, deletedAt: null } });
  //   if (!data) {
  //     throw new HttpException(404, this.msg.notFound);
  //   }
  //   return parse(data);
  // }

  async createGlobalSettings({ body }) {
    const isExist = await GlobalSettings.findOne({});
    if (isExist) {
      await GlobalSettings.update(body, {
        where: { id: isExist.id },
      });
      return { ...body, id: isExist.id };
    }
    const data = await GlobalSettings.create({ ...body });
    return parse(data);
  }

  // async updateGlobalSettings({ body, id }: { body: GlobalSettingsAttributes; id: number }) {
  //   const isExist = await GlobalSettings.findOne({ where: { id: id, deletedAt: null } });
  //   if (!isExist) {
  //     throw new HttpException(404, this.msg.notFound);
  //   }
  //   await GlobalSettings.update({ ...body }, { where: { id: id, deletedAt: null } });
  //   return this.getGlobalSettingsById(id);
  // }

  // async deleteGlobalSettings(id: number) {
  //   const data = await GlobalSettings.destroy({ where: { id: id, deletedAt: null } });
  //   if (!data) {
  //     throw new HttpException(404, this.msg.notFound);
  //   }
  //   return parse(data);
  // }
}
