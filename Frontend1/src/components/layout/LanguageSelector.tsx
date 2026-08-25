import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type AppLanguage } from '../../i18n/config';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = (i18n.language || 'uz') as AppLanguage;
  const currentOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: AppLanguage) => {
    i18n.changeLanguage(code);
    localStorage.setItem('dinora_admin_lang', code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="px-3 py-1.5 rounded-xl bg-white border border-dinora-border hover:border-dinora-gold shadow-sm hover:shadow transition-all flex items-center space-x-1.5 text-xs font-bold text-dinora-chocolate active:scale-95"
        title="Tilni tanlash (Язык)"
      >
        <Globe className="w-4 h-4 text-dinora-pink shrink-0" />
        <span>{currentOption.flag}</span>
        <span className="hidden sm:inline">{currentOption.name}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-dinora-gray transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-dinora-border py-1.5 z-50 overflow-hidden animate-fadeIn">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code as AppLanguage)}
                className={`w-full px-3.5 py-2 text-left text-xs font-bold flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-dinora-pink-light text-dinora-pink'
                    : 'text-dinora-chocolate hover:bg-dinora-bg'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-dinora-pink" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
