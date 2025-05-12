'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { noticeApi } from '@/lib/api';

interface Notice {
  id: number;
  title: string;
  content: string;
  is_important: boolean;
  created_at: string;
}

export default function NoticeList() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const data = await noticeApi.getNotices();
        setNotices(data);
      } catch (error: any) {
        console.error('공지사항 목록 조회 실패:', error);
        setError(
          error?.message || 
          '공지사항 목록을 불러오는데 실패했습니다. 다시 시도해주세요.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">공지사항</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {notices.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  중요도
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성일
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notices.map((notice) => (
                <tr key={notice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/notice/${notice.id}`}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      {notice.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {notice.is_important ? (
                      <span className="px-2 py-1 text-xs font-bold text-red-600 bg-red-100 rounded">
                        중요
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-bold text-gray-600 bg-gray-100 rounded">
                        일반
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(notice.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">등록된 공지사항이 없습니다.</p>
        </div>
      )}
    </div>
  );
} 