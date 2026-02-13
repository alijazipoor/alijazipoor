
import React, { useState } from 'react';
import { AppSettings, AppLanguage, AppTheme } from '../types';

interface SettingsProps {
  initialSettings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onCancel: () => void;
}

const Settings: React.FC<SettingsProps> = ({ initialSettings, onSave, onCancel }) => {
  const [settings, setSettings] = useState(initialSettings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
  };

  const isDark = settings.theme === AppTheme.DARK;
  const isWhiteOrange = settings.theme === AppTheme.WHITE_ORANGE;
  const isOrangeWhite = settings.theme === AppTheme.ORANGE_WHITE;

  const inputClass = `w-full p-3 border rounded-xl outline-none transition-all ${
    isDark ? 'bg-zinc-800 border-zinc-700 text-white focus:ring-orange-500' : 
    isWhiteOrange ? 'bg-white border-zinc-200 text-zinc-900 focus:ring-orange-500' : 
    'bg-orange-700 border-orange-500 text-white focus:ring-white'
  }`;
  
  const labelClass = `block text-sm font-black mb-2 ${isOrangeWhite || isDark ? 'text-zinc-300' : 'text-zinc-500'}`;
  const sectionClass = `p-6 rounded-2xl border ${isDark ? 'bg-zinc-800/30 border-zinc-800' : isWhiteOrange ? 'bg-zinc-50 border-zinc-200' : 'bg-orange-500 border-orange-400'}`;

  const t = (fa: string, en: string) => settings.language === AppLanguage.FA ? fa : en;

  return (
    <div className={`p-10 rounded-3xl shadow-2xl border animate-fade-in max-w-2xl mx-auto ${isDark ? 'bg-zinc-900 border-zinc-800' : isWhiteOrange ? 'bg-white border-zinc-100' : 'bg-orange-600 border-orange-500'}`}>
      <div className={`flex items-center gap-4 mb-10 border-b pb-6 ${isDark ? 'border-zinc-800' : isWhiteOrange ? 'border-zinc-100' : 'border-orange-500'}`}>
        <div className={`p-3 rounded-2xl shadow-lg ${isOrangeWhite || isDark ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'}`}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
        </div>
        <div>
          <h2 className={`text-3xl font-black ${isOrangeWhite || isDark ? 'text-white' : 'text-zinc-900'}`}>{t('تنظیمات سامانه', 'System Settings')}</h2>
          <p className={`font-bold text-sm ${isOrangeWhite ? 'text-orange-100' : 'text-orange-500'}`}>{t('مدیریت مقادیر پیش‌فرض و ظاهر برنامه', 'Manage defaults and app appearance')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Defaults Section */}
        <div className={sectionClass}>
          <h3 className={`text-lg font-black mb-4 ${isOrangeWhite || isDark ? 'text-white' : 'text-zinc-800'}`}>{t('مقادیر پیش‌فرض پذیرش', 'Form Defaults')}</h3>
          <div className="space-y-6">
            <div>
              <label className={labelClass}>{t('نام پیش‌فرض پذیرشگر', 'Default Receiver Name')}</label>
              <input
                className={inputClass}
                placeholder={t('مثلا: حسینی', 'e.g. Smith')}
                value={settings.defaultReceiver}
                onChange={(e) => setSettings({ ...settings, defaultReceiver: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>{t('نام پیش‌فرض تعمیرکار', 'Default Technician Name')}</label>
              <input
                className={inputClass}
                placeholder={t('مثلا: مهندس کرمی', 'e.g. Engineer Karami')}
                value={settings.defaultTechnician}
                onChange={(e) => setSettings({ ...settings, defaultTechnician: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Localization & Appearance */}
        <div className={sectionClass}>
          <h3 className={`text-lg font-black mb-4 ${isOrangeWhite || isDark ? 'text-white' : 'text-zinc-800'}`}>{t('زبان و ظاهر', 'Language & Theme')}</h3>
          <div className="space-y-6">
            <div>
              <label className={labelClass}>{t('زبان برنامه', 'App Language')}</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, language: AppLanguage.FA })}
                  className={`flex-1 p-3 rounded-xl font-black transition ${settings.language === AppLanguage.FA ? 'bg-orange-600 text-white shadow-lg' : isOrangeWhite || isDark ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                >
                  فارسی (RTL)
                </button>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, language: AppLanguage.EN })}
                  className={`flex-1 p-3 rounded-xl font-black transition ${settings.language === AppLanguage.EN ? 'bg-orange-600 text-white shadow-lg' : isOrangeWhite || isDark ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                >
                  English (LTR)
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>{t('تم رنگی برنامه', 'App Theme')}</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, theme: AppTheme.DARK })}
                  className={`p-3 rounded-xl font-bold border-2 transition ${settings.theme === AppTheme.DARK ? 'border-orange-500 bg-zinc-900 text-white' : 'border-zinc-700 bg-zinc-800 text-zinc-400'}`}
                >
                  {t('تیره (اصلی)', 'Dark')}
                </button>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, theme: AppTheme.WHITE_ORANGE })}
                  className={`p-3 rounded-xl font-bold border-2 transition ${settings.theme === AppTheme.WHITE_ORANGE ? 'border-orange-500 bg-white text-zinc-900' : 'border-zinc-200 bg-white text-zinc-500'}`}
                >
                  {t('سفید نارنجی', 'White-Orange')}
                </button>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, theme: AppTheme.ORANGE_WHITE })}
                  className={`p-3 rounded-xl font-bold border-2 transition ${settings.theme === AppTheme.ORANGE_WHITE ? 'border-white bg-orange-600 text-white' : 'border-orange-500 bg-orange-600 text-orange-100'}`}
                >
                  {t('نارنجی سفید', 'Orange-White')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-10">
          <button
            type="button"
            onClick={onCancel}
            className={`px-8 py-3 rounded-2xl transition font-bold ${isOrangeWhite || isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
          >
            {t('انصراف', 'Cancel')}
          </button>
          <button
            type="submit"
            className={`px-8 py-3 rounded-2xl shadow-xl transition font-black ${isOrangeWhite || isDark ? 'bg-white text-orange-600 hover:bg-orange-50' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
          >
            {t('ذخیره تنظیمات', 'Save Settings')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
