'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { reviewApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

type Review = {
  id: number;
  user_id: string;
  title: string;
  content: string;
  rating: number;
  region: string | null;
  organization: string | null;
  created_at: string;
  updated_at: string;
};

// 임시 테스트 데이터
const MOCK_REVIEWS: Review[] = [
  {
    id: 1,
    user_id: 'user1',
    title: '연수 시간을 획기적으로 단축!',
    content: '연수원마스터 덕분에 연수 시간을 크게 단축할 수 있었습니다. 특히 자동 재생과 퀴즈 자동 응답 기능이 매우 유용했습니다.',
    rating: 5,
    organization: '서울시립초등학교',
    region: '서울',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    user_id: 'user2',
    title: '사용하기 쉽고 직관적인 UI',
    content: '교사 연수에 필요한 모든 기능이 한 곳에 모여있어 편리합니다. 사용법도 간단하고 직관적입니다.',
    rating: 4,
    organization: '부산중앙중학교',
    region: '부산',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    user_id: 'user3',
    title: '연수 시간 절반으로 단축',
    content: '연수 시간을 절반으로 줄일 수 있었습니다. 다른 교사분들께도 추천드립니다.',
    rating: 5,
    organization: null,
    region: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    user_id: 'user4',
    title: '자동 재생 기능이 최고',
    content: '자동 재생 기능이 특히 좋았습니다. 연수를 들으면서 다른 일을 할 수 있어서 시간을 효율적으로 사용할 수 있었습니다.',
    rating: 5,
    organization: '대구중앙고등학교',
    region: '대구',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    user_id: 'user5',
    title: '퀴즈 자동 응답 정확도 놀라워요',
    content: '퀴즈 자동 응답 기능이 정확도가 높아서 놀랐습니다. 연수 진행이 매우 수월해졌습니다.',
    rating: 4,
    organization: '인천광역시교육청',
    region: '인천',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 6,
    user_id: 'user6',
    title: '모든 연수원에서 사용 가능',
    content: '다양한 연수원을 지원해서 좋습니다. 어떤 연수원이든 문제없이 사용할 수 있었습니다.',
    rating: 5,
    organization: null,
    region: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// 별점 렌더링 컴포넌트
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

export default function Reviews() {
  const { user } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: 5,
    region: '',
    organization: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const data = await reviewApi.getReviews();
        
        setReviews(data?.length ? data : MOCK_REVIEWS);
        if (!data?.length) setUseMockData(true);
      } catch (error: any) {
        console.error('Error fetching reviews:', error);
        setError(error.message || '알 수 없는 오류가 발생했습니다.');
        // 오류 발생 시 임시 데이터 사용
        setUseMockData(true);
        setReviews(MOCK_REVIEWS);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    if (!formData.title.trim()) {
      setSubmitError('제목을 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.content.trim()) {
      setSubmitError('내용을 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    try {
      const data = await reviewApi.createReview(
        formData.title.trim(),
        formData.content.trim(),
        formData.rating,
        formData.region.trim() || null,
        formData.organization.trim() || null
      );

      setReviews([data, ...reviews]);
      setFormData({
        title: '',
        content: '',
        rating: 5,
        region: '',
        organization: ''
      });
      setShowWriteForm(false);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      setSubmitError(error.message || '후기 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 후기 삭제 기능
  const handleDeleteReview = async (id: number) => {
    if (!confirm('정말로 이 후기를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await reviewApi.deleteReview(id);
      // 삭제 후 목록에서 제거
      setReviews(reviews.filter(r => r.id !== id));
    } catch (error: any) {
      console.error('후기 삭제 실패:', error);
      alert(error.message || '후기 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 mt-20">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#374151]">사용자 후기</h1>
        <div>
          {user ? (
            <button
              onClick={() => setShowWriteForm(!showWriteForm)}
              className="bg-[#1E3A8A] text-white px-4 py-2 rounded-md hover:bg-[#1D4ED8] transition"
            >
              {showWriteForm ? '닫기' : '후기 작성하기'}
            </button>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="bg-[#1E3A8A] text-white px-4 py-2 rounded-md hover:bg-[#1D4ED8] transition"
            >
              로그인하고 후기 작성하기
            </button>
          )}
        </div>
      </div>

      {useMockData && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-700">* 현재 테스트 데이터를 표시하고 있습니다.</p>
        </div>
      )}

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {showWriteForm && user && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">후기 작성</h2>
          {submitError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{submitError}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                제목
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="후기 제목을 입력해주세요"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                내용
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="연수원마스터를 사용한 경험을 공유해주세요."
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                평점
              </label>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="p-1 focus:outline-none"
                    disabled={isSubmitting}
                  >
                    <svg
                      className={`w-8 h-8 ${
                        star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">{formData.rating}/5</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                  소속 학교/기관
                </label>
                <input
                  type="text"
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="예: 서울시립초등학교"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                  지역
                </label>
                <input
                  type="text"
                  id="region"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="예: 서울"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-[#1E3A8A] text-white px-4 py-2 rounded-md hover:bg-[#1D4ED8] transition disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? '제출 중...' : '후기 작성하기'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{review.title}</h3>
              <StarRating rating={review.rating} />
            </div>
            <p className="text-gray-800 mb-4">{review.content}</p>
            <div className="flex items-center justify-between">
              <div>
                {review.organization ? (
                  <p className="text-sm font-semibold text-[#1E3A8A]">
                    {review.organization} {review.region && `(${review.region})`}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">-</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
                {user && user.id === review.user_id && (
                  <button 
                    onClick={() => handleDeleteReview(review.id)}
                    className="ml-2 text-red-500 hover:text-red-700"
                    title="삭제"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-block px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
} 