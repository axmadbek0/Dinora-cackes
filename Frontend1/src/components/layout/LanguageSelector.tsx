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
    localStorage.setItem('dinora_lang', code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-10 sm:h-11 px-3 sm:px-3.5 rounded-xl bg-white border border-[#2B1810]/15 hover:border-[#CBB279] shadow-sm hover:shadow active:scale-95 transition-all duration-150 flex items-center space-x-2 text-xs sm:text-sm font-semibold text-[#2B1810] cursor-pointer select-none"
        title="Tilni tanlash (Язык)"
      >
        <Globe className="w-4 h-4 text-[#D65B78] shrink-0" />
        <span className="text-sm leading-none">{currentOption.flag}</span>
        <span className="hidden sm:inline">{currentOption.name}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#6B5B52] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-[#2B1810]/15 py-1.5 z-50 overflow-hidden animate-fadeIn">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code as AppLanguage)}
                className={`w-full px-3.5 py-2 text-left text-xs font-bold flex items-center justify-between active:scale-[0.98] transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-[#F8E7EA] text-[#D65B78]'
                    : 'text-[#2B1810] hover:bg-[#FAF6F0]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#D65B78]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
