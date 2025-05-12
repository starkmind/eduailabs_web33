'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { paymentApi } from '@/lib/api';

export default function NewPayment() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'card',
    payment_details: {
      card_number: '',
      expiry_date: '',
      cvv: '',
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await paymentApi.createPayment(
        Number(formData.amount),
        formData.payment_method,
        formData.payment_details
      );
      router.push('/payment/success');
    } catch (error) {
      console.error('결제 생성 실패:', error);
      alert('결제 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">결제하기</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            결제 금액
          </label>
          <input
            type="number"
            id="amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
            min="0"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700">
            결제 수단
          </label>
          <select
            id="payment_method"
            value={formData.payment_method}
            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
            disabled={isSubmitting}
          >
            <option value="card">신용카드</option>
            <option value="bank">계좌이체</option>
          </select>
        </div>
        {formData.payment_method === 'card' && (
          <>
            <div>
              <label htmlFor="card_number" className="block text-sm font-medium text-gray-700">
                카드 번호
              </label>
              <input
                type="text"
                id="card_number"
                value={formData.payment_details.card_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payment_details: { ...formData.payment_details, card_number: e.target.value },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700">
                  유효기간
                </label>
                <input
                  type="text"
                  id="expiry_date"
                  value={formData.payment_details.expiry_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payment_details: { ...formData.payment_details, expiry_date: e.target.value },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                  CVV
                </label>
                <input
                  type="text"
                  id="cvv"
                  value={formData.payment_details.cvv}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payment_details: { ...formData.payment_details, cvv: e.target.value },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? '결제 중...' : '결제하기'}
          </button>
        </div>
      </form>
    </div>
  );
} 