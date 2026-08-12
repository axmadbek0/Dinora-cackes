import React, { createContext, useContext, useEffect, useState } from 'react';
import type { TelegramWebAppUser } from '../types';

interface TelegramContextType {
  isTelegram: boolean;
  tg: any;
  user: TelegramWebAppUser | null;
  platform: string;
  colorScheme: 'light' | 'dark';
  expandApp: () => void;
  closeApp: () => void;
}

const TelegramContext = createContext<TelegramContextType>({
  isTelegram: false,
  tg: null,
  user: null,
  platform: 'browser',
  colorScheme: 'light',
  expandApp: () => {},
  closeApp: () => {},
});

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTelegram, setIsTelegram] = useState(false);
  const [tg, setTg] = useState<any>(null);
  const [user, setUser] = useState<TelegramWebAppUser | null>(null);
  const [platform, setPlatform] = useState<string>('browser');
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    try {
      const webApp = (window as any)?.Telegram?.WebApp;
      if (webApp && (webApp.initData || webApp.initDataUnsafe?.user)) {
        setIsTelegram(true);
        setTg(webApp);
        setPlatform(webApp.platform || 'telegram');
        setColorScheme(webApp.colorScheme || 'light');
        
        webApp?.ready?.();
        webApp?.expand?.();

        try {
          webApp?.setHeaderColor?.('#FAF6F0');
          webApp?.setBackgroundColor?.('#FAF6F0');
        } catch (e) {
          // Ignore header color error on unsupported versions
        }

        if (webApp.initDataUnsafe?.user) {
          setUser(webApp.initDataUnsafe.user);
        }
      } else {
        setIsTelegram(false);
        setPlatform('browser');
      }
    } catch (err) {
      console.warn('Telegram WebApp SDK not active on standard browser localhost');
      setIsTelegram(false);
    }
  }, []);

  const expandApp = () => {
    try {
      if (tg?.expand) tg.expand();
    } catch (e) {}
  };

  const closeApp = () => {
    try {
      if (tg?.close) tg.close();
    } catch (e) {}
  };

  return (
    <TelegramContext.Provider
      value={{
        isTelegram,
        tg,
        user,
        platform,
        colorScheme,
        expandApp,
        closeApp,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => useContext(TelegramContext);
