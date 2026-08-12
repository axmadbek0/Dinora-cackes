import { CustomCakeRepository } from './custom-cake.repository.js';
import { CreateCustomCakeDTO, UpdateCustomCakeStatusDTO } from './custom-cake.schema.js';
import { NotFoundError } from '../../utils/errors.js';
import { CustomCakeStatus } from '@prisma/client';
import { assertDateAvailable } from '../../utils/availability.validator.js';

export class CustomCakeService {
  private repository: CustomCakeRepository;

  constructor() {
    this.repository = new CustomCakeRepository();
  }

  async createRequest(data: any) {
    await assertDateAvailable(data.deliveryDate);
    const user = await this.repository.upsertUser(
      data.telegramId,
      data.phone,
      data.firstName,
      data.lastName,
      data.username
    );

    return this.repository.create(user.id, data);
  }

  async getRequestById(id: string) {
    const request = await this.repository.findById(id);
    if (!request) {
      throw new NotFoundError(`Custom cake request with ID "${id}" not found`);
    }
    return request;
  }

  async getRequests(filter: { telegramId?: number; status?: CustomCakeStatus }) {
    return this.repository.findAll(filter);
  }

  async updateStatus(id: string, data: UpdateCustomCakeStatusDTO) {
    await this.getRequestById(id); // Ensure exists
    return this.repository.updateStatus(id, data);
  }
}
