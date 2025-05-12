'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { inquiryApi } from '@/lib/api';

interface Inquiry {
  id: number;
  title: string;
  content: string;
  created_at: string;
  reply?: string;
}

export default function InquiryReply() {
  const params = useParams();
  const router = useRouter();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [reply, setReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        const data = await inquiryApi.getInquiry(Number(params.id));
        setInquiry(data);
        setReply(data.reply || '');
      } catch (error) {
        console.error('문의 상세 조회 실패:', error);
        alert('문의 내용을 불러오는데 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInquiry();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!reply.trim()) {
        throw new Error('답변 내용을 입력해주세요.');
      }
      await inquiryApi.replyInquiry(Number(params.id), reply.trim());
      router.push('/admin/inquiry');
    } catch (error: any) {
      console.error('답변 작성 실패:', error);
      let errorMessage = '답변 작성에 실패했습니다. 다시 시도해주세요.';
      
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
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">문의를 찾을 수 없습니다</h1>
          <p className="mt-2 text-gray-600">존재하지 않는 문의이거나 삭제된 문의입니다.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            ← 이전 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">문의 답변 작성</h1>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">{inquiry.title}</h2>
        <p className="text-gray-600">{inquiry.content}</p>
        <p className="mt-2 text-sm text-gray-500">
          {new Date(inquiry.created_at).toLocaleString()}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="reply" className="block text-sm font-medium text-gray-700">
            답변 내용
          </label>
          <textarea
            id="reply"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={6}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
            disabled={isSubmitting}
          />
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
            {isSubmitting ? '답변 작성 중...' : '답변 작성'}
          </button>
        </div>
      </form>
    </div>
  );
} 