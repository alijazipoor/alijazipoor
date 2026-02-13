
import React from 'react';
import { Customer } from '../types';

interface InvoiceProps {
  customer: Customer;
}

const Invoice: React.FC<InvoiceProps> = ({ customer }) => {
  const today = new Date().toLocaleDateString('fa-IR');

  return (
    <div className="print-only p-12 bg-white text-black border-4 border-double border-gray-400 rounded-none max-w-4xl mx-auto my-4 font-serif relative">
      <div className="flex justify-between items-center border-b-4 border-black pb-8 mb-10">
        <div className="flex items-center gap-6">
          <div className="text-right">
            <h1 className="text-4xl font-black mb-1">سامانه تعمیرات نت بازار</h1>
            <p className="text-xl font-bold tracking-widest">برگه پذیرش و رسید رسمی دستگاه</p>
          </div>
        </div>
        <div className="text-left">
          <p className="font-black text-xl mb-1">شماره فاکتور: {customer.id.toUpperCase().slice(0, 8)}</p>
          <p className="text-lg">تاریخ چاپ: {today}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-12 gap-y-8 text-2xl mb-16 text-right">
        <div className="flex border-b border-gray-300 pb-3"><span className="font-black w-48 ml-2">نام مشتری:</span> {customer.name}</div>
        <div className="flex border-b border-gray-300 pb-3"><span className="font-black w-48 ml-2">تلفن همراه:</span> {customer.phone}</div>
        <div className="flex border-b border-gray-300 pb-3"><span className="font-black w-48 ml-2">مدل و برند:</span> {customer.modemModel}</div>
        <div className="flex border-b border-gray-300 pb-3"><span className="font-black w-48 ml-2">شماره سریال:</span> {customer.serialNumber}</div>
        <div className="flex border-b border-gray-300 pb-3"><span className="font-black w-48 ml-2">پذیرشگر:</span> {customer.receiverName}</div>
        <div className="flex border-b border-gray-300 pb-3"><span className="font-black w-48 ml-2">تعمیرکار:</span> {customer.technicianName || 'ثبت در مراحل فنی'}</div>
        <div className="col-span-2 flex border-b border-gray-300 pb-3"><span className="font-black w-48 ml-2">وسایل همراه:</span> {customer.accessories || 'بدون لوازم جانبی'}</div>
        <div className="col-span-2 flex border-b border-gray-300 pb-3"><span className="font-black w-48 ml-2">ایراد اظهار شده:</span> {customer.issue}</div>
        
        {customer.furtherDetails && (
          <div className="col-span-2 flex border-b border-gray-300 pb-3 bg-gray-50 p-2">
            <span className="font-black w-48 ml-2">گزارش فنی:</span> 
            <span className="text-lg">{customer.furtherDetails}</span>
          </div>
        )}

        <div className="col-span-1 flex border-b border-gray-400 pb-3 mt-4">
          <span className="font-black w-48 ml-2">هزینه تخمینی:</span> 
          {customer.estimatedCost ? `${customer.estimatedCost} ت` : '---'}
        </div>
        <div className="col-span-1 flex border-b-2 border-black pb-4 bg-gray-100 p-4 font-black text-3xl mt-4">
          <span className="w-56 ml-2">هزینه نهایی:</span> 
          {customer.finalCost ? `${customer.finalCost} تومان` : 'طبق توافق نهایی'}
        </div>
      </div>

      <div className="p-6 border-2 border-gray-400 rounded-xl text-lg leading-relaxed mb-16 bg-gray-50 shadow-inner">
        <p className="font-black mb-4 text-xl underline">قوانین و ضوابط مرکز نت بازار:</p>
        <ul className="list-disc list-inside space-y-2 font-medium">
          <li>تحویل دستگاه صرفاً با ارائه این رسید امکان‌پذیر است.</li>
          <li>مهلت تست قطعات تعویضی و تعمیرات انجام شده حداکثر ۷۲ ساعت است.</li>
          <li>مسئولیت حفظ و پشتیبان‌گیری از داده‌ها و تنظیمات داخلی بر عهده مشتری است.</li>
          <li>دستگاه‌هایی که بیش از ۴۵ روز در انبار بمانند، شامل هزینه انبارداری شده و مرکز مسئولیتی در قبال آن‌ها نخواهد داشت.</li>
        </ul>
      </div>

      <div className="mt-28 flex justify-between px-20">
        <div className="text-center">
          <p className="mb-20 font-black text-xl">امضاء و تایید مشتری</p>
          <div className="border-t-2 border-black w-64"></div>
        </div>
        <div className="text-center">
          <p className="mb-20 font-black text-xl">مهر و امضاء نت بازار</p>
          <div className="border-t-2 border-black w-64"></div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
