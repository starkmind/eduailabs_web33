'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { noticeApi } from '@/lib/api';

interface Notice {
  id: number;
  title: string;
  content: string;
  is_important: boolean;
  created_at: string;
}

export default function NoticeDetail() {
  const router = useRouter();
  const params = useParams();
  const noticeId = parseInt(params.id as string);
  
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const data = await noticeApi.getNotice(noticeId);
        setNotice(data);
      } catch (error: any) {
        console.error('공지사항 조회 실패:', error);
        setError(
          error?.message || 
          '공지사항을 불러오는데 실패했습니다. 다시 시도해주세요.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (noticeId) {
      fetchNotice();
    }
  }, [noticeId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">공지사항을 찾을 수 없습니다.</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          뒤로 가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">공지사항 상세</h1>
        <div className="flex space-x-3">
          <Link
            href="/admin/notice"
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            목록
          </Link>
          <Link
            href={`/admin/notice/${notice.id}/edit`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            수정
          </Link>
          <Link
            href={`/admin/notice/${notice.id}/delete`}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            삭제
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold mb-2 flex items-center">
            {notice.title}
            {notice.is_important && (
              <span className="ml-2 px-2 py-1 text-xs font-bold text-red-600 bg-red-100 rounded">
                중요
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-500">
            작성일: {new Date(notice.created_at).toLocaleString()}
          </p>
        </div>
        <div className="p-6">
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{notice.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 