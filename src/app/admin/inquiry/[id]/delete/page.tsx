'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { inquiryApi } from '@/lib/api';

interface Inquiry {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export default function InquiryDelete() {
  const params = useParams();
  const router = useRouter();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        const data = await inquiryApi.getInquiry(Number(params.id));
        setInquiry(data);
      } catch (error) {
        console.error('문의 상세 조회 실패:', error);
        alert('문의 내용을 불러오는데 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInquiry();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('정말로 이 문의를 삭제하시겠습니까?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await inquiryApi.deleteInquiry(Number(params.id));
      router.push('/admin/inquiry');
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('문의 삭제에 실패했습니다. 다시 시도해주세요.');
      setIsDeleting(false);
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
      <h1 className="text-2xl font-bold mb-6">문의 삭제</h1>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">{inquiry.title}</h2>
        <p className="text-gray-600">{inquiry.content}</p>
        <p className="mt-2 text-sm text-gray-500">
          {new Date(inquiry.created_at).toLocaleString()}
        </p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-700">
          이 문의를 삭제하시겠습니까? 삭제된 문의는 복구할 수 없습니다.
        </p>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={isDeleting}
        >
          취소
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          disabled={isDeleting}
        >
          {isDeleting ? '삭제 중...' : '삭제하기'}
        </button>
      </div>
    </div>
  );
} 