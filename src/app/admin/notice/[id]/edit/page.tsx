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

export default function EditNotice() {
  const router = useRouter();
  const params = useParams();
  const noticeId = parseInt(params.id as string);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isImportant: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const notice = await noticeApi.getNotice(noticeId);
        setFormData({
          title: notice.title,
          content: notice.content,
          isImportant: notice.is_important,
        });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.content.trim()) {
      setError('내용을 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    try {
      await noticeApi.updateNotice(
        noticeId,
        formData.title.trim(),
        formData.content.trim(),
        formData.isImportant
      );
      router.push('/admin/notice');
    } catch (error: any) {
      console.error('공지사항 수정 실패:', error);
      let errorMessage = '공지사항 수정에 실패했습니다. 다시 시도해주세요.';
      
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">공지사항 수정</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            제목
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            내용
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={10}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isImportant"
            checked={formData.isImportant}
            onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            disabled={isSubmitting}
          />
          <label htmlFor="isImportant" className="ml-2 block text-sm text-gray-700">
            중요 공지사항으로 표시
          </label>
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
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? '수정 중...' : '수정하기'}
          </button>
        </div>
      </form>
    </div>
  );
} 