'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  reply_date: string | null;
  reply: string | null;
  user_id: string;
}

interface InquiryDetailProps {
  id: number;
}

export default function InquiryDetail({ id }: InquiryDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchInquiry = async () => {
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
        
        setIsAdmin(profile?.is_admin || false);

        const data = await inquiryApi.getInquiry(id);
        setInquiry(data);
      } catch (error: any) {
        console.error('문의사항 조회 실패:', error);
        setError(
          error?.message || 
          '문의사항을 불러오는데 실패했습니다. 다시 시도해주세요.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchInquiry();
    }
  }, [id, user]);

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
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">로그인 후 이용 가능합니다.</p>
        </div>
        <Link href="/login" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          로그인하기
        </Link>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-20">
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">문의사항을 찾을 수 없습니다.</p>
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

  // 현재 사용자가 작성한 문의사항인지 또는 관리자인지 확인
  const isOwner = user.id === inquiry.user_id;
  if (!isOwner && !isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-20">
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">본인이 작성한 문의사항만 확인할 수 있습니다.</p>
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
    <div className="max-w-4xl mx-auto p-6 mt-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">문의사항</h1>
        <div className="flex items-center space-x-3">
          {/* 답변 상태 뱃지 */}
          {inquiry.reply ? (
            <span className="px-2 py-1 text-xs font-bold text-green-600 bg-green-100 rounded">답변 완료</span>
          ) : (
            <span className="px-2 py-1 text-xs font-bold text-red-600 bg-red-100 rounded">미답변</span>
          )}
          <Link
            href="/inquiry"
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            목록
          </Link>
          {!inquiry.replied_at && (
            <Link
              href={`/inquiry/${inquiry.id}/edit`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              수정
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold mb-2">{inquiry.title}</h2>
          <p className="text-sm text-gray-500">
            작성일: {new Date(inquiry.created_at).toLocaleString()}
          </p>
        </div>
        <div className="p-6">
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{inquiry.content}</p>
          </div>
        </div>
      </div>

      {inquiry.reply && (
        <div className="bg-gray-50 rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b bg-gray-100">
            <h3 className="text-lg font-bold mb-2">답변</h3>
            {inquiry.reply_date && (
              <p className="text-sm text-gray-500">
                답변일: {new Date(inquiry.reply_date).toLocaleString()}
              </p>
            )}
          </div>
          <div className="p-6">
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{inquiry.reply}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 