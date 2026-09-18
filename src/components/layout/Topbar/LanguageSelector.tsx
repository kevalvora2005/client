import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import { profileApi } from '../../../features/profile/api/profileApi';

interface LanguageOption {
  code: string;
  label: string;
  nativeName: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી' },
];

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const { isAuthenticated, updateUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => i18n.language?.startsWith(l.code)) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);

    if (isAuthenticated) {
      const locale = code === 'gu' ? 'gu-IN' : code === 'hi' ? 'hi-IN' : 'en-IN';
      try {
        await profileApi.updateProfile({ preferredLanguage: code, locale });
        updateUser({ preferredLanguage: code, locale });
      } catch (err) {
        console.error('Failed to update language preference in database', err);
      }
    }
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="btn btn-light bg-white border border-light-subtle rounded-3 d-flex align-items-center gap-2 px-2 py-1"
        style={{ fontSize: '0.85rem', height: '36px' }}
        aria-label="Select Language"
        title="Select Language"
      >
        <Globe size={16} className="text-secondary" />
        <span className="fw-medium text-dark">{currentLang.nativeName}</span>
        <ChevronDown size={14} className="text-secondary" />
      </button>

      {isOpen && (
        <div
          className="position-absolute end-0 bg-white border border-light-subtle rounded-3 shadow-lg py-1 mt-1"
          style={{ minWidth: '150px', zIndex: 1060 }}
        >
          {LANGUAGES.map((lang) => {
            const isSelected = currentLang.code === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`dropdown-item d-flex align-items-center justify-content-between px-3 py-2 text-start w-100 border-0 bg-transparent ${
                  isSelected ? 'fw-bold text-primary' : 'text-dark'
                }`}
                style={{ fontSize: '0.85rem', cursor: 'pointer' }}
              >
                <div>
                  <span>{lang.nativeName}</span>
                  <span className="text-muted ms-1" style={{ fontSize: '0.75rem' }}>
                    ({lang.label})
                  </span>
                </div>
                {isSelected && <Check size={14} className="text-primary ms-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
