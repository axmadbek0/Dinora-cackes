import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public login = async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const result = await this.authService.login(username, password);
      return res.json({
        success: true,
        message: 'Muvaffaqiyatli kirildi!',
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Kirishda xatolik yuz berdi',
      });
    }
  };

  public telegramLogin = async (req: Request, res: Response) => {
    try {
      const { initData } = req.body;
      const result = await this.authService.telegramLogin(initData);
      return res.json({
        success: true,
        message: 'Telegram orqali muvaffaqiyatli kirildi!',
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Telegram kirishda xatolik yuz berdi',
      });
    }
  };

  public me = async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      const user = await this.authService.getMe(authHeader);
      return res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        message: 'Avtorizatsiyadan o`tilmagan',
      });
    }
  };
}
