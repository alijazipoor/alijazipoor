
import React from 'react';
import { Customer, AppLanguage, AppTheme } from '../types';

interface CustomerProfileProps {
  customer: Customer;
  allRepairs: Customer[];
  onEdit: (customer: Customer) => void;
  onPrint: (customer: Customer) => void;
  language: AppLanguage;
  theme: AppTheme;
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({ 
  customer, 
  allRepairs, 
  onEdit, 
  onPrint, 
  language, 
  theme 
}) => {
  const history = allRepairs.filter(r => 
    r.name.trim().toLowerCase() === customer.name.trim().toLowerCase() && 
    r.phone.trim() === customer.phone.trim()
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalVisits = history.length;
  
  const totalSpent = history.reduce((acc, curr) => {
    const cost = parseInt(curr.finalCost?.replace(/[,،]/g, '') || '0');
    return acc + (isNaN(cost) ? 0 : cost);
  }, 0);

  const isDark = theme === AppTheme.DARK;
  const isOrangeWhite = theme === AppTheme.ORANGE_WHITE;

  const t = (fa: string, en: string) => language === AppLanguage.FA ? fa : en;

  return (
    <div className="animate-fade-in space-y-8">
      <div className={`${isDark ? 'bg-zinc-900 border-zinc-800' : isOrangeWhite ? 'bg-orange-500 border-orange-400' : 'bg-zinc-50 border-zinc-200'} p-8 rounded-3xl border shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6`}>
        <div className="flex items-center gap-6">
          <div className={`${isOrangeWhite || isDark ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'} w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black shadow-xl`}>
            {customer.name.charAt(0)}
          </div>
          <div>
            <h2 className={`text-3xl font-black ${isOrangeWhite || isDark ? 'text-white' : 'text-zinc-900'}`}>{customer.name}</h2>
            <div className="flex gap-4 mt-2">
              <span className={`${isOrangeWhite || isDark ? 'text-orange-100' : 'text-zinc-500'} font-bold flex items-center gap-1`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {customer.phone}
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className={`${isDark ? 'bg-zinc-800/50 border-zinc-700' : isOrangeWhite ? 'bg-white/10 border-white/20' : 'bg-white border-zinc-200'} p-4 rounded-2xl border text-center min-w-[120px]`}>
            <div className={`${isOrangeWhite || isDark ? 'text-orange-100' : 'text-zinc-500'} text-xs font-bold uppercase mb-1`}>{t('تعداد مراجعه', 'Total Visits')}</div>
            <div className={`${isOrangeWhite || isDark ? 'text-white' : 'text-orange-500'} text-2xl font-black`}>{totalVisits}</div>
          </div>
          <div className={`${isDark ? 'bg-zinc-800/50 border-zinc-700' : isOrangeWhite ? 'bg-white/10 border-white/20' : 'bg-white border-zinc-200'} p-4 rounded-2xl border text-center min-w-[120px]`}>
            <div className={`${isOrangeWhite || isDark ? 'text-orange-100' : 'text-zinc-500'} text-xs font-bold uppercase mb-1`}>{t('مجموع هزینه', 'Total Cost')}</div>
            <div className={`${isOrangeWhite || isDark ? 'text-white' : 'text-emerald-400'} text-2xl font-black`}>{totalSpent.toLocaleString(language === AppLanguage.FA ? 'fa-IR' : 'en-US')}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className={`text-2xl font-black flex items-center gap-3 ${isOrangeWhite || isDark ? 'text-white' : 'text-zinc-900'}`}>
            <span className={`w-10 h-1 rounded-full ${isOrangeWhite || isDark ? 'bg-white' : 'bg-orange-600'}`}></span>
            {t('تاریخچه خدمات و تعمیرات', 'Service & Repair History')}
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {history.map((record) => (
              <div key={record.id} className={`${isDark ? 'bg-zinc-900 border-zinc-800' : isOrangeWhite ? 'bg-orange-500 border-orange-400' : 'bg-white border-zinc-200'} rounded-3xl p-6 border shadow-lg relative group transition hover:border-orange-500/50`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className={`${isOrangeWhite || isDark ? 'text-white' : 'text-orange-500'} font-black text-xl`}>{record.modemModel}</div>
                    <div className={`${isOrangeWhite ? 'text-orange-200' : 'text-zinc-500'} text-xs font-mono`}>SN: {record.serialNumber}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onPrint(record)} className={`p-2 rounded-lg ${isDark || isOrangeWhite ? 'bg-white/10 text-white' : 'bg-zinc-100 text-zinc-500'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg></button>
                    <button onClick={() => onEdit(record)} className={`p-2 rounded-lg ${isDark || isOrangeWhite ? 'bg-white/10 text-white' : 'bg-zinc-100 text-zinc-500'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                  </div>
                </div>
                <div className={`grid grid-cols-2 gap-4 text-sm ${isDark || isOrangeWhite ? 'text-zinc-300' : 'text-zinc-600'}`}>
                   <div><span className="font-bold">{t('ایراد:', 'Issue:')}</span> {record.issue}</div>
                   <div><span className="font-bold">{t('هزینه نهایی:', 'Cost:')}</span> {record.finalCost || record.estimatedCost || '---'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className={`text-2xl font-black flex items-center gap-3 ${isOrangeWhite || isDark ? 'text-white' : 'text-zinc-900'}`}>
            <span className={`w-10 h-1 rounded-full ${isOrangeWhite || isDark ? 'bg-white' : 'bg-orange-600'}`}></span>
            {t('تاریخچه تماس‌ها', 'Call Logs')}
          </h3>
          <div className="space-y-4">
            {(customer.callLogs || []).length > 0 ? (customer.callLogs || []).map(log => (
              <div key={log.id} className={`${isDark ? 'bg-zinc-800/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} p-4 rounded-2xl border`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-black ${isDark || isOrangeWhite ? 'text-white' : 'text-zinc-900'}`}>{log.callerName}</span>
                  <span className="text-[10px] text-zinc-500">{log.date}</span>
                </div>
                <p className={`text-xs ${isDark || isOrangeWhite ? 'text-zinc-400' : 'text-zinc-600'}`}>{log.notes}</p>
              </div>
            )) : (
              <div className="text-center py-10 opacity-50 italic">{t('بدون تماس ثبت شده', 'No logs found')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
