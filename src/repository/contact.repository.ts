import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { createHistoryRecord, customHistoryCreateMessage, customHistoryDeleteMessage, customHistoryUpdateMesage } from "@/helpers/history.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import {
  ContactAttributes,
  IContactCreate,
} from "@/interfaces/model/contact.interface";
import { moduleName, statusEnum, tableEnum } from "@/interfaces/model/history.interface";
import Client from "@/models/client.model";
import Contact from "@/models/contact.model";
import LoginUser from "@/models/loginUser.model";
import Role from "@/models/role.model";
import User from "@/models/user.model";
import UserClient from "@/models/userClient.model";
import { createRandomHash, parse } from "@/utils/common.util";
import { Op } from "sequelize";
import slugify from "slugify";
import BaseRepository from "./base.repository";

export default class ContactRepo extends BaseRepository<Contact> {
  constructor() {
    super(Contact.name);
  }

  private msg = new MessageFormation("Contact").message;

async getAllContacts(query: IQueryParameters) {
  try {
    const { page = 1, limit = 10, clientId, sortBy, sort = "asc", search } = query;

    // Ensure `page` and `limit` are valid numbers
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 10);

    // Default sorting column
    const sortedColumn = sortBy && ["name", "email", "createdAt"].includes(sortBy) ? sortBy : "name";
    const sortOrder = ["asc", "desc"].includes(sort.toLowerCase()) ? sort.toLowerCase() : "asc";

    const whereClause: any = {
      deletedAt: null,
      ...(clientId && { clientId }),
    };
    
    // Optimize search query by using `Op.iLike` on multiple fields at once
    if (search?.trim()) {
      whereClause[Op.or] = ["name", "email"].map((field) => ({
        [field]: { [Op.iLike]: `%${search.toLowerCase()}%` },
      }));
    }
    console.log("whereClause------------------------------------->", whereClause, search);

    const data = await this.getAllData({
      where: whereClause,
      include: [
        {
          model: Client,
          attributes: ["id"],
          include: [{ model: LoginUser, attributes: ["name"] }],
        },
        {
          model: User,
          attributes: ["id"],
          include: [{ model: LoginUser, attributes: ["name"] }],
        },
      ],
      offset: (pageNumber - 1) * limitNumber,
      limit: limitNumber,
      order: [[sortedColumn, sortOrder]],
    });
    console.log("daa", data);
    // Ensure parsing is safe
    const parsedData = parse(data);
    
    return {
      data: parsedData?.rows || [],
      count: parsedData?.count || 0,
      currentPage: pageNumber,
      limit: limitNumber,
      lastPage: Math.ceil((parsedData?.count || 0) / limitNumber),
    };
  } catch (error) {
    console.error("Error in getAllContacts:", error);
    throw new Error("Failed to fetch contacts.");
  }
}


  // Old getContactData API
  async getContactData(query: IQueryParameters) {
  	const { clientId } = query;
  	let data = await this.getAllData({
  		where: {
  			deletedAt: null,
  			...(clientId ? { clientId: clientId } : {}),
  		},
  		include: [
  			{ model: Client, attributes: ['id'], include: [{ model: LoginUser, attributes: ['name'] }] },
  			{ model: User, attributes: ['id'], include: [{ model: LoginUser, attributes: ['name'] }] },
  		],
  		attributes: ['id', 'name'],
  		order: [['name', 'asc']],
  	});
  	data = parse(data);
  	const responseObj = {
  		data: data?.rows,
  		count: data?.count,
  	};
  	return responseObj;
  }

  async getManagerData(query: IQueryParameters) {
    const { clientId } = query;
    const role = await Role.findOne({
      where: {
        name: "manager",
      },
      attributes: ["id", "name"],
    }).then((roleData) => parse(roleData));

    let data = await UserClient.findAll({
      include: [
        {
          model: User,
          as: "userData",
          include: [
            {
              model: LoginUser,
              as: "loginUserData",
              attributes: ["id", "name", "email"],
            },
          ],
          attributes: ["id", "loginUserId"],
        },
        { model: Client },
      ],
      where: {
        clientId: clientId,
        roleId: role?.id,
      },
    });

    data = parse(data)
      .filter((el) => el?.userData)
      .map((el) => {
        return {
          ...el?.userData?.loginUserData,
          client: {
            id: el?.clientId,
            loginUserData: { name: el?.clientData?.clientName },
          },
        };
      });
    const responseObj = {
      data: data,
      count: data.length,
    };
    return responseObj;
  }

  async getContactById(id: number) {
    let data = await Contact.findOne({
      where: { id: id, deletedAt: null },
    });
    if (!data) {
      throw new HttpException(404, this.msg.notFound);
    }
    data = parse(data);
    return data;
  }

  async getContactBySlugService(slug: string) {
    let data = await Contact.findOne({
      where: { slug: slug, deletedAt: null },
    });
    if (!data) {
      throw new HttpException(404, this.msg.notFound);
    }
    data = parse(data);
    return data;
  }

  async addContact({ body, user }: { body: IContactCreate; user: User }) {
    const isExistContact = await Contact.findOne({
      where: {
        email: body.email,
      },
    });

    if (body?.email && isExistContact) {
      throw new HttpException(200, this.msg.exist, {}, true);
    }

    const slugifyContact = body.name + createRandomHash(5);
    const slug = slugify(slugifyContact, { lower: true, replacement: "-" });

    let data = await Contact.create({ ...body, slug, createdBy: user.id });
    data = parse(data);
    data = await this.getContactById(data.id);

    await createHistoryRecord({
      tableName: tableEnum.CONTACT,
      moduleName: moduleName.CONTRACTS,
      userId: user?.id,
      custom_message: await customHistoryCreateMessage(user, tableEnum.CONTACT, data),
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(data),
      activity: statusEnum.CREATE,
    });

    return data;
  }

  async updateContact({
    body,
    user,
    id,
  }: {
    body: ContactAttributes;
    user: User;
    id: number;
  }) {
    const isDataFound = await Contact.findOne({
      where: { id: id, deletedAt: null },
    });

    if (!isDataFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    const slugifyContact = body.name + createRandomHash(5);
    const slug = slugify(slugifyContact, { lower: true, replacement: "-" });

    await Contact.update(
      { ...body, slug, updatedBy: user.id },
      { where: { id: id, deletedAt: null } }
    );
    const updatedData = await this.getContactById(id);

    await createHistoryRecord({
      tableName: tableEnum.CONTACT,
      moduleName: moduleName.CONTRACTS,
      userId: user?.id,
      custom_message: await customHistoryUpdateMesage(
        body,
        isDataFound,
        user,
        updatedData,
        tableEnum.EMPLOYEE_FILE
      ),
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(updatedData),
      activity: statusEnum.UPDATE,
    });

    return updatedData;
  }

  async deleteContact(id: number, user: User) {
    const isDataFound = await Contact.findOne({
      where: { id: id, deletedAt: null },
    });
    if (!isDataFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    const data = await Contact.destroy({ where: { id: id } });
    await createHistoryRecord({
      tableName: tableEnum.CONTACT,
      moduleName: moduleName.CONTRACTS,
      userId: user?.id,
      custom_message: await customHistoryDeleteMessage(user, tableEnum.CONTACT, isDataFound),
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(data),
      activity: statusEnum.DELETE,
    });
    return data;
  }
}
