'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { inquiryApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Inquiry {
  id: number;
  title: string;
  content: string;
  created_at: string;
  replied_at: string | null;
  reply: string | null;
  reply_date: string | null;
}

export default function InquiryList() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

          let query = supabase
            .from('inquiries')
            .select('*')
            .order('created_at', { ascending: false });

          if (!profile?.is_admin) {
            query = query.eq('user_id', user.id);
          }

          const { data, error } = await query;
          
          if (error) {
            console.error('문의 목록 조회 실패:', error);
            throw new Error(error.message || '문의 목록 조회에 실패했습니다.');
          }
          setInquiries(data);
        } catch (error: any) {
          console.error('문의사항 목록 조회 실패:', error);
          setError(
            error?.message || 
            '문의사항 목록을 불러오는데 실패했습니다. 다시 시도해주세요.'
          );
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchInquiries();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-20">
        <h1 className="text-2xl font-bold mb-8">문의사항</h1>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">로그인 후 문의사항을 확인하실 수 있습니다.</p>
          <Link href="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">문의사항</h1>
        <Link href="/inquiry/new" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">
          문의하기
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {inquiries.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  답변일
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/inquiry/${inquiry.id}`}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      {inquiry.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {inquiry.reply ? (
                      <span className="px-2 py-1 text-xs font-bold text-green-600 bg-green-100 rounded">
                        답변 완료
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-bold text-red-600 bg-red-100 rounded">
                        미답변
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {inquiry.reply ? (
                      inquiry.reply_date ? new Date(inquiry.reply_date).toLocaleString() : '-'
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">등록된 문의사항이 없습니다.</p>
          <Link href="/inquiry/new" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">
            문의하기
          </Link>
        </div>
      )}
    </div>
  );
} 