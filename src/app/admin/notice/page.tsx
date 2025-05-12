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

export default function AdminNoticeList() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const data = await noticeApi.getNotices();
        setNotices(data);
      } catch (error) {
        console.error('공지사항 목록 조회 실패:', error);
        alert('공지사항 목록을 불러오는데 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">공지사항 관리</h1>
        <Link
          href="/admin/notice/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          새 공지사항 작성
        </Link>
      </div>

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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {notices.map((notice) => (
              <tr key={notice.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/admin/notice/${notice.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
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
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/notice/${notice.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    수정
                  </Link>
                  <Link
                    href={`/admin/notice/${notice.id}/delete`}
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
    </div>
  );
} 