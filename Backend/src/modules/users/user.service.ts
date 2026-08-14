import { UserRepository } from './user.repository.js';
import { NotFoundError } from '../../utils/errors.js';
import { UserRole } from '@prisma/client';

export class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  async getUsers(filter?: { search?: string; role?: UserRole }) {
    return await this.repository.findAll(filter);
  }

  async getUserById(id: string) {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundError(`Foydalanuvchi topilmadi (ID: ${id})`);
    }
    return user;
  }

  async updateUserRole(id: string, role: UserRole) {
    await this.getUserById(id);
    return await this.repository.updateRole(id, role);
  }

  async deleteUser(id: string) {
    await this.getUserById(id);
    return await this.repository.deleteUser(id);
  }
}
