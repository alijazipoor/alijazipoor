
import React, { useState, useEffect } from 'react';
import { Customer, RepairStatus, DiagnosisResult, CallLog, AppSettings, AppLanguage, AppTheme } from './types';
import CustomerForm from './components/CustomerForm';
import Invoice from './components/Invoice';
import CustomerProfile from './components/CustomerProfile';
import Settings from './components/Settings';
import { diagnoseModemIssue } from './services/geminiService';

const App: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [view, setView] = useState<'list' | 'add' | 'edit' | 'profile' | 'settings'>('list');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeProfileCustomer, setActiveProfileCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({ 
    defaultReceiver: '', 
    defaultTechnician: '',
    language: AppLanguage.FA,
    theme: AppTheme.DARK
  });
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dismissedReminders, setDismissedReminders] = useState<string[]>([]);
  
  // Call Log State
  const [showLogModal, setShowLogModal] = useState<string | null>(null); // Customer ID
  const [newLog, setNewLog] = useState({ callerName: '', notes: '' });

  // General Diagnosis State
  const [showGeneralDiag, setShowGeneralDiag] = useState(false);
  const [genDiagInput, setGenDiagInput] = useState({ model: '', issue: '' });
  const [genDiagResult, setGenDiagResult] = useState<DiagnosisResult | null>(null);
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    // Initial data loading
    const saved = localStorage.getItem('net_bazaar_repairs');
    if (saved) {
      setCustomers(JSON.parse(saved));
    }
    const savedSettings = localStorage.getItem('net_bazaar_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(prev => ({ ...prev, ...parsed }));
    }

    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    const bootTimer = setTimeout(() => {
      const loader = document.getElementById('global-loader');
      if (loader) {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
      }
      setIsReady(true);
    }, 1500);

    return () => {
      clearTimeout(bootTimer);
      clearInterval(clockTimer);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('net_bazaar_repairs', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    document.documentElement.dir = settings.language === AppLanguage.FA ? 'rtl' : 'ltr';
    document.documentElement.lang = settings.language;
    document.body.className = settings.theme === AppTheme.WHITE_ORANGE 
      ? 'bg-white text-zinc-900' 
      : settings.theme === AppTheme.ORANGE_WHITE 
        ? 'bg-orange-600 text-white' 
        : 'bg-zinc-950 text-zinc-100';
  }, [settings.language, settings.theme]);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('net_bazaar_settings', JSON.stringify(newSettings));
    setView('list');
  };

  const handleSaveCustomer = (customer: Customer) => {
    if (view === 'edit') {
      setCustomers(customers.map(c => c.id === customer.id ? customer : c));
    } else {
      setCustomers([customer, ...customers]);
    }
    setView('list');
    setSelectedCustomer(null);
  };

  const handleStatusChange = (id: string, newStatus: RepairStatus) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('آیا از حذف این پرونده اطمینان دارید؟')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const handlePrint = (customer: Customer) => {
    setSelectedCustomer(customer);
    setTimeout(() => { window.print(); }, 100);
  };

  const handleDiagnose = async (customer: Customer) => {
    setLoadingAI(true);
    setDiagnosis(null);
    const result = await diagnoseModemIssue(customer.modemModel, customer.issue);
    setDiagnosis(result);
    setLoadingAI(false);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleAddLog = (customerId: string) => {
    if (!newLog.callerName || !newLog.notes) {
      alert(t('لطفاً تمامی فیلدها را پر کنید', 'Please fill all fields'));
      return;
    }
    
    const log: CallLog = {
      id: Math.random().toString(36).substr(2, 5),
      date: new Date().toLocaleString(settings.language === AppLanguage.FA ? 'fa-IR' : 'en-US'),
      callerName: newLog.callerName,
      notes: newLog.notes
    };

    setCustomers(prev => prev.map(c => 
      c.id === customerId ? { ...c, callLogs: [log, ...(c.callLogs || [])] } : c
    ));
    setNewLog({ callerName: '', notes: '' });
  };

  const closeLogModal = () => {
    setShowLogModal(null);
    setNewLog({ callerName: '', notes: '' });
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.modemModel.toLowerCase().includes(searchTerm.toLowerCase());

    const customerDate = c.createdAt.split('T')[0];
    const matchesStartDate = startDate ? customerDate >= startDate : true;
    const matchesEndDate = endDate ? customerDate <= endDate : true;

    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  const activeCustomerForLogs = customers.find(c => c.id === showLogModal);

  const todayISO = new Date().toISOString().split('T')[0];
  const activeReminders = customers.filter(c => {
    if (!c.reminderDateTime) return false;
    const reminderDatePart = c.reminderDateTime.split('T')[0];
    return reminderDatePart === todayISO && 
           c.status !== RepairStatus.DELIVERED && 
           !dismissedReminders.includes(c.id);
  });

  const openProfile = (customer: Customer) => {
    setActiveProfileCustomer(customer);
    setView('profile');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  const formatReminder = (isoString?: string) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    return date.toLocaleString(settings.language === AppLanguage.FA ? 'fa-IR' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const dismissReminder = (id: string) => {
    setDismissedReminders(prev => [...prev, id]);
  };

  const t = (fa: string, en: string) => settings.language === AppLanguage.FA ? fa : en;

  const isDark = settings.theme === AppTheme.DARK;
  const isWhiteOrange = settings.theme === AppTheme.WHITE_ORANGE;
  const isOrangeWhite = settings.theme === AppTheme.ORANGE_WHITE;

  const containerClass = `min-h-screen pb-20 animate-fade-in relative ${isDark ? 'bg-zinc-950 text-zinc-100' : isWhiteOrange ? 'bg-white text-zinc-900' : 'bg-orange-600 text-white'}`;
  const cardClass = `p-6 rounded-3xl shadow-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : isWhiteOrange ? 'bg-zinc-50 border-zinc-200' : 'bg-orange-500 border-orange-400'}`;
  const tableHeaderClass = `uppercase text-xs font-black tracking-widest border-b ${isDark ? 'bg-zinc-800/80 text-orange-500 border-zinc-700' : isWhiteOrange ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-orange-700 text-white border-orange-500'}`;

  if (!isReady) return null;

  return (
    <div className={containerClass}>
      <div className={`no-print sticky top-0 z-[60] w-full backdrop-blur-md border-b h-8 flex items-center justify-between px-6 text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-zinc-950/80 border-zinc-900 text-zinc-500' : isWhiteOrange ? 'bg-white/80 border-zinc-100 text-zinc-400' : 'bg-orange-700/80 border-orange-500 text-orange-100'}`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOrangeWhite ? 'bg-white' : 'bg-orange-500'}`}></span>
            {t('سیستم آنلاین', 'System Online')}
          </div>
          <div className={`h-3 w-px ${isDark ? 'bg-zinc-800' : isWhiteOrange ? 'bg-zinc-200' : 'bg-orange-500'}`}></div>
          <div>{currentTime.toLocaleDateString(settings.language === AppLanguage.FA ? 'fa-IR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div className={`flex items-center gap-2 ${isOrangeWhite ? 'text-white' : 'text-zinc-400'}`}>
          <svg className={`w-3 h-3 ${isOrangeWhite ? 'text-white' : 'text-orange-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="tabular-nums">
            {currentTime.toLocaleTimeString(settings.language === AppLanguage.FA ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      <div className={`no-print fixed top-12 ${settings.language === AppLanguage.FA ? 'left-6' : 'right-6'} z-[100] flex flex-col gap-4 max-w-sm w-full pointer-events-none`}>
        {activeReminders.map(c => (
          <div key={c.id} className={`pointer-events-auto border-2 rounded-2xl p-4 shadow-2xl backdrop-blur-lg flex gap-4 animate-fade-in transition-all hover:scale-[1.02] ${isDark ? 'bg-zinc-900/95 border-orange-500/50 text-zinc-100' : isWhiteOrange ? 'bg-white/95 border-orange-500/50' : 'bg-orange-500 border-white/50'}`}>
            <div className={`p-3 rounded-xl self-start ${isOrangeWhite || isDark ? 'bg-white/20 text-white' : 'bg-orange-600/20 text-orange-500'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className={`font-black text-sm ${isOrangeWhite || isDark ? 'text-white' : 'text-zinc-900'}`}>{t('یادآوری', 'Reminder')}: {c.name}</h4>
                  <p className={`font-bold text-[10px] mt-0.5 ${isOrangeWhite ? 'text-orange-100' : 'text-orange-500'}`}>{c.modemModel} - {c.serialNumber}</p>
                </div>
                <button onClick={() => dismissReminder(c.id)} className={`${isOrangeWhite || isDark ? 'text-white' : 'text-zinc-400'} hover:opacity-70 transition`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className={`text-[11px] mt-2 font-medium line-clamp-1 ${isOrangeWhite ? 'text-orange-50' : 'text-zinc-400'}`}>{t('ایراد', 'Issue')}: {c.issue}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => openProfile(c)} className={`flex-1 text-[10px] font-black py-1.5 rounded-lg transition shadow-md ${isOrangeWhite ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'}`}>
                  {t('مشاهده پرونده', 'View Case')}
                </button>
                <div className={`px-2 py-1.5 rounded-lg text-[9px] font-black uppercase ${isOrangeWhite ? 'bg-orange-700 text-orange-200' : 'bg-zinc-800 text-zinc-500'}`}>
                  {formatReminder(c.reminderDateTime)?.split(settings.language === AppLanguage.FA ? '،' : ',')[1]}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCustomer && <Invoice customer={selectedCustomer} />}

      <div className="no-print max-w-7xl mx-auto p-4 md:p-8">
        <header className={`flex flex-col md:flex-row justify-between items-center mb-10 gap-4 border-b pb-6 ${isDark ? 'border-zinc-900' : isWhiteOrange ? 'border-zinc-100' : 'border-orange-500'}`}>
          <div className={`flex items-center gap-5 border-r-4 pr-5 ${isOrangeWhite ? 'border-white' : 'border-orange-600'}`}>
            <div>
              <h1 className={`text-4xl font-black tracking-tighter ${isOrangeWhite || isDark ? 'text-white' : 'text-zinc-900'}`}>{t('نت بازار', 'Net Bazaar')}</h1>
              <p className={`font-bold text-sm ${isOrangeWhite ? 'text-orange-100' : 'text-orange-500'}`}>{t('سامانه هوشمند مدیریت تعمیرات مودم', 'Smart Modem Repair System')}</p>
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            {view === 'list' && (
              <>
                <button
                  onClick={() => setView('settings')}
                  className={`p-3 rounded-2xl transition-all shadow-lg ${isDark ? 'bg-zinc-800 text-zinc-400 hover:text-white' : isWhiteOrange ? 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200' : 'bg-orange-700 text-white hover:bg-orange-800'}`}
                  title={t('تنظیمات', 'Settings')}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => { setSelectedCustomer(null); setView('add'); }}
                  className={`flex items-center gap-2 px-8 py-3 rounded-2xl shadow-xl transition-all font-black ${isOrangeWhite ? 'bg-white text-orange-600 hover:bg-orange-50' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  {t('پذیرش دستگاه جدید', 'Accept New Device')}
                </button>
              </>
            )}
            {view !== 'list' && (
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all font-black ${isDark ? 'bg-zinc-800 text-white' : isWhiteOrange ? 'bg-zinc-100 text-zinc-900' : 'bg-orange-700 text-white'}`}
              >
                {t('بازگشت به لیست', 'Back to List')}
              </button>
            )}
          </div>
        </header>

        {view === 'list' ? (
          <div className="space-y-6">
            <div className={cardClass}>
              <div className={`flex items-center gap-4 group focus-within:border-orange-500/50 border-b pb-4 transition ${isDark ? 'border-zinc-800' : isWhiteOrange ? 'border-zinc-200' : 'border-orange-400'}`}>
                <svg className={`w-6 h-6 transition ${isOrangeWhite ? 'text-white' : 'text-zinc-600 group-focus-within:text-orange-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={t('جستجو در نام مشتری، شماره سریال، مدل یا موبایل...', 'Search in Name, Serial, Model or Mobile...')}
                  className={`w-full bg-transparent outline-none text-xl font-medium ${isOrangeWhite ? 'text-white placeholder-orange-300' : isDark ? 'text-white placeholder-zinc-700' : 'text-zinc-900 placeholder-zinc-400'}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 items-end md:items-center mt-4">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div className="space-y-1">
                    <label className={`text-[10px] font-black uppercase tracking-widest mr-2 ${isOrangeWhite ? 'text-orange-100' : 'text-zinc-500'}`}>{t('از تاریخ', 'From Date')}</label>
                    <input
                      type="date"
                      className={`w-full p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition border ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : isWhiteOrange ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-orange-700 border-orange-500 text-white'}`}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`text-[10px] font-black uppercase tracking-widest mr-2 ${isOrangeWhite ? 'text-orange-100' : 'text-zinc-500'}`}>{t('تا تاریخ', 'To Date')}</label>
                    <input
                      type="date"
                      className={`w-full p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition border ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : isWhiteOrange ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-orange-700 border-orange-500 text-white'}`}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                {(searchTerm || startDate || endDate) && (
                  <button 
                    onClick={clearFilters}
                    className={`text-xs font-black flex items-center gap-2 px-4 py-2 rounded-xl transition ${isOrangeWhite || isDark ? 'text-white hover:bg-white/10' : 'text-orange-500 hover:bg-orange-500/10'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    {t('پاکسازی فیلترها', 'Clear Filters')}
                  </button>
                )}
              </div>
            </div>

            <div className="bg-zinc-900 rounded-3xl shadow-2xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse min-w-[1000px]">
                  <thead className={tableHeaderClass}>
                    <tr>
                      <th className="px-6 py-6 whitespace-nowrap">{t('اطلاعات مشتری', 'Customer Info')}</th>
                      <th className="px-6 py-6 whitespace-nowrap">{t('مشخصات فنی', 'Technical Specs')}</th>
                      <th className="px-6 py-6 whitespace-nowrap">{t('یادآوری', 'Reminder')}</th>
                      <th className="px-6 py-6 whitespace-nowrap">{t('جزئیات تعمیرات', 'Repair Details')}</th>
                      <th className="px-6 py-6 whitespace-nowrap">{t('هزینه (تومان)', 'Cost (IRT)')}</th>
                      <th className="px-6 py-6 whitespace-nowrap">{t('وضعیت فعلی', 'Current Status')}</th>
                      <th className="px-6 py-6 whitespace-nowrap text-center">{t('عملیات', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-zinc-800' : isWhiteOrange ? 'divide-zinc-100' : 'divide-orange-400'}`}>
                    {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
                      <tr key={customer.id} className={`transition group cursor-default ${isDark ? 'hover:bg-zinc-800/40' : isWhiteOrange ? 'hover:bg-zinc-50' : 'hover:bg-orange-600'}`}>
                        <td className="px-6 py-5 cursor-pointer" onClick={() => openProfile(customer)}>
                          <div className={`font-black text-lg transition ${isOrangeWhite || isDark ? 'text-white' : 'text-zinc-900 hover:text-orange-500'}`}>{customer.name}</div>
                          <div className={`text-sm flex items-center gap-1 ${isOrangeWhite ? 'text-orange-100' : 'text-zinc-500'}`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            {customer.phone}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className={`font-bold ${isOrangeWhite || isDark ? 'text-white' : 'text-orange-500'}`}>{customer.modemModel}</div>
                          <div className={`text-xs font-mono tracking-tighter ${isOrangeWhite ? 'text-orange-200' : 'text-zinc-600'}`}>SN: {customer.serialNumber}</div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                           {customer.reminderDateTime ? formatReminder(customer.reminderDateTime) : '---'}
                        </td>
                        <td className="px-6 py-5">
                           {customer.furtherDetails || '---'}
                        </td>
                        <td className="px-6 py-5 font-black text-lg">
                           {customer.finalCost || '---'}
                        </td>
                        <td className="px-6 py-5">
                           <select
                            value={customer.status}
                            onChange={(e) => handleStatusChange(customer.id, e.target.value as RepairStatus)}
                            className="text-xs px-3 py-1.5 rounded-xl font-black bg-zinc-800 text-zinc-300"
                          >
                            {Object.values(RepairStatus).map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex gap-2 justify-center">
                            <button onClick={() => handlePrint(customer)} className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white" title={t('چاپ', 'Print')}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            </button>
                            <button onClick={() => setShowLogModal(customer.id)} className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-orange-500" title={t('پیگیری تماس', 'Call Log')}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            </button>
                            <button onClick={() => { setSelectedCustomer(customer); setView('edit'); }} className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-yellow-500">
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDelete(customer.id)} className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-500">
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : view === 'profile' ? (
          <CustomerProfile 
            customer={activeProfileCustomer!} 
            allRepairs={customers} 
            onEdit={(c) => { setSelectedCustomer(c); setView('edit'); }}
            onPrint={handlePrint}
            language={settings.language}
            theme={settings.theme}
          />
        ) : view === 'settings' ? (
          <Settings 
            initialSettings={settings}
            onSave={handleSaveSettings}
            onCancel={() => setView('list')}
          />
        ) : (
          <CustomerForm
            initialData={selectedCustomer || undefined}
            defaultReceiver={settings.defaultReceiver}
            defaultTechnician={settings.defaultTechnician}
            onSave={handleSaveCustomer}
            onCancel={() => { setView('list'); setSelectedCustomer(null); }}
            theme={settings.theme}
          />
        )}

        {/* Call Log Modal - Improved Z-Index and Logic */}
        {showLogModal && activeCustomerForLogs && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[200] animate-fade-in">
            <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
              <div className={`p-6 border-b flex justify-between items-center ${isDark ? 'border-zinc-800 bg-zinc-800/50' : 'border-zinc-100 bg-zinc-50'}`}>
                <div className="flex items-center gap-4">
                  <div className="bg-orange-600 p-2.5 rounded-xl text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1.01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <div>
                    <h2 className={`font-black text-xl ${isDark ? 'text-white' : 'text-zinc-900'}`}>{t('ثبت تماس:', 'Call Log:')} {activeCustomerForLogs.name}</h2>
                    <p className="text-orange-500 font-bold text-sm">{activeCustomerForLogs.phone}</p>
                  </div>
                </div>
                <button onClick={closeLogModal} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition">
                  <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-zinc-800/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input 
                      placeholder={t('نام پرسنل', 'Staff Name')}
                      className={`p-3 rounded-xl border outline-none focus:ring-2 focus:ring-orange-500 ${isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-900'}`}
                      value={newLog.callerName}
                      onChange={e => setNewLog({...newLog, callerName: e.target.value})}
                    />
                    <input 
                      placeholder={t('شرح تماس', 'Call Description')}
                      className={`p-3 rounded-xl border outline-none focus:ring-2 focus:ring-orange-500 ${isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-900'}`}
                      value={newLog.notes}
                      onChange={e => setNewLog({...newLog, notes: e.target.value})}
                    />
                  </div>
                  <button 
                    onClick={() => handleAddLog(activeCustomerForLogs.id)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-3 rounded-xl transition shadow-lg"
                  >
                    {t('ثبت پیگیری جدید', 'Add New Log')}
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{t('تاریخچه تماس‌ها', 'Call History')}</h3>
                  {(activeCustomerForLogs.callLogs || []).length > 0 ? (activeCustomerForLogs.callLogs || []).map(log => (
                    <div key={log.id} className={`p-4 rounded-xl border flex gap-4 ${isDark ? 'bg-zinc-800/20 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
                      <div className="text-orange-500 mt-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className={`font-black ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{log.callerName}</span>
                          <span className="text-[10px] text-zinc-500">{log.date}</span>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{log.notes}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-zinc-500 italic text-sm">{t('هنوز تماسی ثبت نشده است', 'No calls logged yet')}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className={`mt-24 pt-10 border-t text-center opacity-40 hover:opacity-100 transition duration-500 ${isOrangeWhite ? 'border-orange-500 text-white' : isDark ? 'border-zinc-900 text-zinc-400' : 'border-zinc-200 text-zinc-500'}`}>
          <p className="text-sm font-bold tracking-widest">{t('طراحی و توسعه اختصاصی برای سامانه هوشمند نت بازار', 'Exclusive Design & Development for Net Bazaar System')} &copy; {new Date().toLocaleDateString(settings.language === AppLanguage.FA ? 'fa-IR' : 'en-US')}</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
