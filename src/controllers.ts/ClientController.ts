// import { buildError } from '@opsware/core-api/errors/buildError';
import { Request, Response } from 'express';
// import { get, ORGANIZATION } from '../lib/context';
import { bindMethods } from '../_utils/class';
import { transformClientResult } from '../_utils/client.utils';
import ClientService from '../services/ClientService';
// import { createClientOrderByClause } from '../utils/tables/sorters';

export class ClientController {
  constructor(
    private clientService: ClientService
  ) {
    bindMethods(this);
  }

  async findByPk(req: Request, res: Response) {
    const client = null
    // await this.clientService.findByPk(
    //   Number(req.params.clientId),
    // //   get(ORGANIZATION).id
    // null
    // );

    // if (!client) {
    //   throw buildError('client_not_found');
    // }

    res.json(transformClientResult(client));
  }
}
