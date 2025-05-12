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
  reply?: string;
  replied_at?: string;
  reply_date?: string | null;
  user_id: string;
}

export default function AdminInquiryList() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unanswered'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // 관리자 권한 확인
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (!profile?.is_admin) {
          setError('관리자만 접근할 수 있습니다.');
          setIsLoading(false);
          return;
        }

        const data = await inquiryApi.getInquiries();
        setInquiries(data);
      } catch (error) {
        console.error('문의 목록 조회 실패:', error);
        setError('문의 목록을 불러오는데 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInquiries();
  }, [user]);

  const filteredInquiries = inquiries.filter((inquiry) => {
    if (filter === 'unanswered') {
      return !inquiry.reply;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">로그인 후 이용 가능합니다.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">문의 관리</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('unanswered')}
            className={`px-4 py-2 rounded-md ${
              filter === 'unanswered'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            미답변
          </button>
        </div>
      </div>

      {filteredInquiries.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  답변일
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInquiries.map((inquiry) => (
                <tr key={inquiry.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/inquiry/${inquiry.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {inquiry.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(inquiry.created_at).toLocaleString()}
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
                    {inquiry.reply_date
                      ? new Date(inquiry.reply_date).toLocaleString()
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {inquiry.reply ? (
                      <Link
                        href={`/admin/inquiry/${inquiry.id}/reply`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        수정
                      </Link>
                    ) : (
                      <Link
                        href={`/admin/inquiry/${inquiry.id}/reply`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        답변
                      </Link>
                    )}
                    <Link
                      href={`/admin/inquiry/${inquiry.id}/delete`}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">등록된 문의사항이 없습니다.</p>
        </div>
      )}
    </div>
  );
} 