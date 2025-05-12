'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { noticeApi } from '@/lib/api';

interface Notice {
  id: number;
  title: string;
  content: string;
  is_important: boolean;
  created_at: string;
}

export default function DeleteNotice() {
  const router = useRouter();
  const params = useParams();
  const noticeId = parseInt(params.id as string);
  
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleDelete = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await noticeApi.deleteNotice(noticeId);
      router.push('/admin/notice');
    } catch (error: any) {
      console.error('공지사항 삭제 실패:', error);
      let errorMessage = '공지사항 삭제에 실패했습니다. 다시 시도해주세요.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        if (error.message) {
          errorMessage = error.message;
        } else if (error.error_description) {
          errorMessage = error.error_description;
        } else if (Object.keys(error).length === 0) {
          errorMessage = '서버 연결 오류가 발생했습니다. 관리자 권한을 확인하거나 다시 시도해주세요.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <h1 className="text-2xl font-bold mb-6">공지사항 삭제</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">{notice.title}</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <span>작성일: {new Date(notice.created_at).toLocaleDateString()}</span>
          {notice.is_important && (
            <span className="px-2 py-1 text-xs font-bold text-red-600 bg-red-100 rounded">
              중요
            </span>
          )}
        </div>
        <p className="whitespace-pre-wrap">{notice.content}</p>
      </div>

      <div className="bg-red-50 p-6 rounded-lg border border-red-200 mb-6">
        <p className="text-red-700 font-medium mb-2">정말로 이 공지사항을 삭제하시겠습니까?</p>
        <p className="text-red-600 text-sm">이 작업은 되돌릴 수 없습니다.</p>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={isSubmitting}
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? '삭제 중...' : '삭제하기'}
        </button>
      </div>
    </div>
  );
} 