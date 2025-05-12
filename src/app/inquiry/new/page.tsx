'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { inquiryApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function NewInquiry() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 로그인하지 않은 경우 로그인 페이지로 리디렉션
    if (user === null) {
      router.push('/login');
    }
  }, [user, router]);

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
      await inquiryApi.createInquiry(
        formData.title.trim(),
        formData.content.trim()
      );

      // 문의 등록 후 이메일 발송
      if (user) {
        await fetch('/api/inquiry/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: user.user_metadata?.name || user.email || '익명',
            email: user.email,
            message: `제목: ${formData.title}\n내용: ${formData.content}`,
          }),
        });
      }

      router.push('/inquiry');
    } catch (error: any) {
      console.error('문의사항 작성 실패:', error);
      let errorMessage = '문의사항 작성에 실패했습니다. 다시 시도해주세요.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        if (error.message) {
          errorMessage = error.message;
        } else if (error.error_description) {
          errorMessage = error.error_description;
        } else if (Object.keys(error).length === 0) {
          errorMessage = '서버 연결 오류가 발생했습니다. 다시 시도해주세요.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로그인하지 않은 경우 로딩 표시
  if (user === undefined) {
    return (
      <div className="flex justify-center items-center h-64 mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">문의하기</h1>
        <Link
          href="/inquiry"
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          취소
        </Link>
      </div>

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
            placeholder="문의 내용을 상세히 적어주시면 빠른 답변에 도움이 됩니다."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? '제출 중...' : '문의하기'}
          </button>
        </div>
      </form>
    </div>
  );
} 