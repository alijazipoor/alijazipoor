
import React, { useState } from 'react';
import { Customer, RepairStatus, AppTheme } from '../types';

interface CustomerFormProps {
  onSave: (customer: Customer) => void;
  onCancel: () => void;
  initialData?: Customer;
  defaultReceiver?: string;
  defaultTechnician?: string;
  theme?: AppTheme;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ 
  onSave, 
  onCancel, 
  initialData, 
  defaultReceiver = '', 
  defaultTechnician = '',
  theme = AppTheme.DARK
}) => {
  const [formData, setFormData] = useState<Omit<Customer, 'id' | 'createdAt' | 'status' | 'callLogs'>>(
    initialData || {
      name: '',
      phone: '',
      modemModel: '',
      serialNumber: '',
      issue: '',
      accessories: '',
      estimatedCost: '',
      finalCost: '',
      furtherDetails: '',
      reminderDateTime: '',
      receiverName: defaultReceiver,
      technicianName: defaultTechnician,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer: Customer = {
      ...formData,
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      createdAt: initialData?.createdAt || new Date().toISOString(),
      status: initialData?.status || RepairStatus.PENDING,
      callLogs: initialData?.callLogs || [],
    };
    onSave(newCustomer);
  };

  const isDark = theme === AppTheme.DARK;
  const isWhiteOrange = theme === AppTheme.WHITE_ORANGE;
  const isOrangeWhite = theme === AppTheme.ORANGE_WHITE;

  const inputClass = `w-full p-2 border rounded-md outline-none transition-all ${
    isDark ? 'bg-zinc-800 border-zinc-700 text-white focus:ring-orange-500 placeholder-zinc-500' :
    isWhiteOrange ? 'bg-white border-zinc-200 text-zinc-900 focus:ring-orange-500 placeholder-zinc-400' :
    'bg-orange-700 border-orange-500 text-white focus:ring-white placeholder-orange-300'
  }`;
  
  const labelClass = `block text-sm font-medium mb-1 ${
    isOrangeWhite || isDark ? 'text-zinc-100' : 'text-zinc-600'
  }`;

  const containerClass = `p-6 rounded-xl shadow-2xl border animate-fade-in ${
    isDark ? 'bg-zinc-900 border-zinc-800' :
    isWhiteOrange ? 'bg-white border-zinc-100' :
    'bg-orange-600 border-orange-500'
  }`;

  return (
    <div className={containerClass}>
      <h2 className={`text-xl font-bold mb-6 border-b pb-3 ${
        isOrangeWhite || isDark ? 'text-white border-white/10' : 'text-orange-500 border-zinc-100'
      }`}>
        {initialData ? 'ویرایش اطلاعات دستگاه' : 'ثبت پذیرش جدید'}
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>نام و نام خانوادگی مشتری</label>
          <input
            required
            className={inputClass}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>شماره تماس</label>
          <input
            required
            className={inputClass}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>مدل مودم</label>
          <input
            required
            className={inputClass}
            value={formData.modemModel}
            onChange={(e) => setFormData({ ...formData, modemModel: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>شماره سریال (S/N)</label>
          <input
            required
            className={inputClass}
            value={formData.serialNumber}
            onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>تحویل گیرنده</label>
          <input
            required
            className={inputClass}
            value={formData.receiverName}
            onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
            placeholder="نام پرسنل پذیرش"
          />
        </div>
        <div>
          <label className={labelClass}>تعمیرکار مربوطه</label>
          <input
            className={inputClass}
            value={formData.technicianName}
            onChange={(e) => setFormData({ ...formData, technicianName: e.target.value })}
            placeholder="نام تعمیرکار"
          />
        </div>
        <div>
          <label className={labelClass}>هزینه تخمینی (تومان)</label>
          <input
            type="text"
            className={inputClass}
            value={formData.estimatedCost || ''}
            onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
            placeholder="مثلا: ۵۰۰,۰۰۰"
          />
        </div>
        <div>
          <label className={labelClass}>هزینه نهایی (تومان)</label>
          <input
            type="text"
            className={inputClass}
            value={formData.finalCost || ''}
            onChange={(e) => setFormData({ ...formData, finalCost: e.target.value })}
            placeholder="پس از اتمام تعمیر"
          />
        </div>
        <div>
          <label className={labelClass}>تاریخ و زمان یادآوری</label>
          <input
            type="datetime-local"
            className={inputClass}
            value={formData.reminderDateTime || ''}
            onChange={(e) => setFormData({ ...formData, reminderDateTime: e.target.value })}
          />
        </div>
        <div className="md:col-span-1">
          <label className={labelClass}>وسایل همراه</label>
          <input
            className={inputClass}
            value={formData.accessories}
            onChange={(e) => setFormData({ ...formData, accessories: e.target.value })}
            placeholder="مثلا: آداپتور، کابل"
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>توضیحات مشکل</label>
          <textarea
            required
            rows={2}
            className={inputClass}
            value={formData.issue}
            onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>جزئیات فنی تکمیلی / گزارش تعمیرکار</label>
          <textarea
            rows={3}
            className={inputClass}
            value={formData.furtherDetails || ''}
            onChange={(e) => setFormData({ ...formData, furtherDetails: e.target.value })}
            placeholder="قطعات تعویض شده، تنظیمات انجام شده و غیره..."
          />
        </div>
        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className={`px-6 py-2 rounded-md transition ${
              isOrangeWhite || isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            انصراف
          </button>
          <button
            type="submit"
            className={`px-6 py-2 rounded-md shadow-lg transition font-bold ${
              isOrangeWhite || isDark ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            ثبت نهایی
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
