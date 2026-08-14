import { Request, Response } from 'express';
import { UserService } from './user.service.js';
import { UserRole } from '@prisma/client';

export class UserController {
  private service: UserService;

  constructor() {
    this.service = new UserService();
  }

  public getUsers = async (req: Request, res: Response) => {
    const { search, role } = req.query;
    const users = await this.service.getUsers({
      search: search as string | undefined,
      role: role as UserRole | undefined,
    });
    return res.json({ success: true, data: users });
  };

  public getUserById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this.service.getUserById(id);
    return res.json({ success: true, data: user });
  };

  public updateUserRole = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;
    if (!role || !['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role xato (USER yoki ADMIN bo\'lishi shart)' });
    }

    const updated = await this.service.updateUserRole(id, role as UserRole);
    return res.json({
      success: true,
      message: `Foydalanuvchi huquqi (${role}) ga o'zgardi!`,
      data: updated,
    });
  };

  public deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.service.deleteUser(id);
    return res.json({ success: true, message: 'Foydalanuvchi tizimdan o\'chirildi!' });
  };
}
