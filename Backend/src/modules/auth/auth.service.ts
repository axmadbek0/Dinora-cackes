import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database.js';
import { env, isTelegramAdmin } from '../../config/env.js';

export class AuthService {
  public async login(usernameInput?: string, passwordInput?: string) {
    const cleanUsername = usernameInput?.trim().toLowerCase();
    const cleanPassword = passwordInput?.trim();

    if (!cleanUsername || !cleanPassword) {
      throw new Error('Login va parol kiritilishi shart!');
    }

    // Master Strong Password Check
    const STRONG_MASTER_PASSWORD = 'Dinora#2026!MasterPass';

    // Try finding admin user in database safely
    let adminUser: any = null;
    try {
      adminUser = await prisma.user.findFirst({
        where: {
          role: 'ADMIN',
          username: { equals: cleanUsername, mode: 'insensitive' },
        },
      });
    } catch (dbErr) {
      // safe fallback if DB connecting
    }

    const isAllowedAdminUser = ['dinorashirinliklari', 'admin', 'dinora'].includes(cleanUsername);
    const isAllowedPassword = cleanPassword === STRONG_MASTER_PASSWORD;

    if (!adminUser && isAllowedAdminUser && isAllowedPassword) {
      try {
        const hashedPassword = await bcrypt.hash(cleanPassword, 12);
        adminUser = await prisma.user.create({
          data: {
            telegramId: BigInt(999888777),
            firstName: 'Dinora',
            lastName: 'Shirinliklari',
            username: cleanUsername,
            role: 'ADMIN',
          },
        });
      } catch (createErr) {
        adminUser = {
          id: 'admin-dinora-1',
          telegramId: '999888777',
          firstName: 'Dinora',
          lastName: 'Shirinliklari',
          username: cleanUsername,
          role: 'ADMIN',
        };
      }
    }

    if (!adminUser && (!isAllowedAdminUser || !isAllowedPassword)) {
      throw new Error('Login yoki parol noto\'g\'ri!');
    }

    // Signed Secure JWT Token with expiration
    const token = jwt.sign(
      {
        id: adminUser?.id || 'admin-dinora-1',
        telegramId: adminUser?.telegramId ? String(adminUser.telegramId) : '999888777',
        username: adminUser?.username || 'Dinorashirinliklari',
        role: 'ADMIN',
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    return {
      user: {
        id: adminUser?.id || 'admin-dinora-1',
        telegramId: adminUser?.telegramId ? String(adminUser.telegramId) : '999888777',
        firstName: adminUser?.firstName || 'Dinora',
        lastName: adminUser?.lastName || 'Shirinliklari',
        username: adminUser?.username || 'Dinorashirinliklari',
        role: 'ADMIN',
      },
      token,
    };
  }

  public async telegramLogin(initData: string) {
    if (!initData) {
      throw new Error('Telegram initData ma`lumoti yetkazilmadi');
    }

    let parsedTgUser: any = null;
    try {
      if (initData.includes('user=')) {
        const params = new URLSearchParams(initData);
        const userJson = params.get('user');
        if (userJson) {
          parsedTgUser = JSON.parse(decodeURIComponent(userJson));
        }
      } else if (initData.startsWith('{')) {
        parsedTgUser = JSON.parse(initData);
      }
    } catch (err) {
      console.warn('Could not parse user from initData:', err);
    }

    const tgId = parsedTgUser?.id ? String(parsedTgUser.id) : undefined;
    const isAuthorized = tgId ? isTelegramAdmin(tgId) : (env.NODE_ENV === 'development');

    if (!isAuthorized) {
      throw new Error('⛔ Sizda administrator huquqi mavjud emas! Ushbu panel faqat tasdiqlangan adminlar uchun.');
    }

    const adminUser = {
      id: `admin-${tgId || env.ADMIN_ID1 || '1'}`,
      telegramId: String(tgId || env.ADMIN_ID1 || '998812534'),
      firstName: parsedTgUser?.first_name || 'Dinora',
      lastName: parsedTgUser?.last_name || 'Admin',
      username: parsedTgUser?.username || 'Dinorashirinliklari',
      role: 'ADMIN',
    };

    const token = jwt.sign(
      {
        id: adminUser.id,
        telegramId: adminUser.telegramId,
        username: adminUser.username,
        role: 'ADMIN',
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    return {
      user: adminUser,
      token,
    };
  }

  public async getMe(userHeaderToken?: string) {
    if (!userHeaderToken) {
      throw new Error('Token topilmadi');
    }
    const token = userHeaderToken.replace('Bearer ', '').trim();
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as any;
      return {
        id: decoded.id,
        telegramId: decoded.telegramId,
        username: decoded.username,
        role: decoded.role || 'ADMIN',
      };
    } catch (err) {
      throw new Error('Yaroqsiz token!');
    }
  }
}
