'use client'

import { useState, useEffect } from "react"
import Image from "next/image";
import Link from "next/link";
import FeatureCard from "@/components/FeatureCard";
import Testimonials from "@/components/Testimonials";
import AuthModal from "@/components/AuthModal";
import ProblemSolver from "@/components/ProblemSolver";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { noticeApi, inquiryApi, reviewApi } from "@/lib/api";

// 공지사항과 문의사항 인터페이스 추가
interface Notice {
  id: number;
  title: string;
  content: string;
  is_important: boolean;
  created_at: string;
}

interface Inquiry {
  id: number;
  title: string;
  content: string;
  created_at: string;
  replied_at: string | null;
  reply: string | null;
}

// 임시 테스트 데이터 - 사용자 후기
interface Review {
  id: number;
  user_id: string;
  title: string;
  content: string;
  rating: number;
  region: string | null;
  organization: string | null;
  created_at: string;
  updated_at: string;
}

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
  }
];

const features = [
  {
    title: "자동 재생",
    description: "클릭 없이 강의가 자동으로 시작됩니다.",
    icon: "▶️"
  },
  {
    title: "자동 넘김",
    description: "강의 영상이 자동으로 다음으로 넘어갑니다.",
    icon: "⏭️"
  },
  {
    title: "퀴즈 자동 응답",
    description: "GPT가 정답을 추론해 자동으로 응답합니다.",
    icon: "🤖"
  },
  {
    title: "진도율 자동 업데이트",
    description: "학습 진도가 자동으로 기록됩니다.",
    icon: "📊"
  },
  {
    title: "다중 연수원 지원",
    description: "다양한 연수원 플랫폼을 지원합니다.",
    icon: "🌐"
  },
  {
    title: "안전한 사용",
    description: "개인정보 보호와 안전한 사용을 보장합니다.",
    icon: "🔒"
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

export default function Home() {
  const { user } = useAuth()
  const [notices, setNotices] = useState<Notice[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS)
  const [isLoadingNotices, setIsLoadingNotices] = useState(true)
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(true)
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)

  // 공지사항 및 문의사항 데이터 로드
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const data = await noticeApi.getNotices();
        setNotices(data);
      } catch (error) {
        console.error('공지사항 목록 조회 실패:', error);
      } finally {
        setIsLoadingNotices(false);
      }
    };

    fetchNotices();
  }, []);

  useEffect(() => {
    const fetchInquiries = async () => {
      if (user) {
        try {
          const data = await inquiryApi.getInquiries();
          setInquiries(data);
        } catch (error) {
          console.error('문의사항 목록 조회 실패:', error);
        } finally {
          setIsLoadingInquiries(false);
        }
      } else {
        setIsLoadingInquiries(false);
      }
    };

    fetchInquiries();
  }, [user]);

  // 사용자 후기 데이터 로드
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await reviewApi.getReviews(3);
        if (data?.length) {
          setReviews(data);
        }
      } catch (error) {
        console.error('사용자 후기 조회 실패:', error);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchReviews();
  }, []);

  const handleInstallClick = () => {
    // 크롬 익스텐션 스토어나 다운로드 페이지로 이동
    window.open('https://chrome.google.com/webstore/category/extensions', '_blank');
  }

  const handleLearnMoreClick = () => {
    // 자세히 보기 섹션으로 스크롤
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <main className="min-h-screen">
      {/* 히어로 섹션 */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1E3A8A] to-[#1E40AF] text-white">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)] [text-shadow:_2px_2px_4px_rgb(0_0_0_/_40%)] max-w-2xl mx-auto break-keep text-center">
              교사 연수,<br />
              더 이상 시간 낭비하지 마세요.
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white font-medium drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] [text-shadow:_1px_1px_2px_rgb(0_0_0_/_40%)]">
              자동재생, 자동넘김, 퀴즈 자동풀이까지 – 연수원마스터 하나면 충분합니다.
            </p>
            <div className="space-x-4">
              <button 
                onClick={handleInstallClick}
                className="bg-[#10B981] text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition shadow-lg text-lg">
                설치하러 가기
              </button>
              <button 
                onClick={handleLearnMoreClick}
                className="bg-white text-[#1E3A8A] px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition shadow-lg text-lg">
                자세히 보기
              </button>
              <button 
                onClick={() => document.getElementById('problem-solver')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#F59E0B] text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition shadow-lg text-lg">
                시험문제풀이
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 주요 기능 소개 */}
      <section id="features" className="py-20 bg-[#F3F4F6]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#374151]">주요 기능</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 공지사항 섹션 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-[#374151]">공지사항</h2>
            <Link href="/notice" className="text-[#1E3A8A] hover:text-[#1D4ED8] font-medium">
              더 보기
            </Link>
          </div>
          
          {isLoadingNotices ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E3A8A]"></div>
            </div>
          ) : notices.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {notices.slice(0, 5).map((notice) => (
                  <li key={notice.id} className="px-6 py-4 hover:bg-gray-50">
                    <Link href={`/notice/${notice.id}`} className="block">
                      <div className="flex items-center">
                        {notice.is_important && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2">
                            중요
                          </span>
                        )}
                        <h3 className="text-lg font-medium text-gray-900 flex-grow">{notice.title}</h3>
                        <span className="text-sm text-gray-500">
                          {new Date(notice.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-600">등록된 공지사항이 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* 사용자 후기 섹션 */}
      <section className="py-16 bg-[#F3F4F6]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-[#374151]">사용자 후기</h2>
            <Link href="/reviews" className="text-[#1E3A8A] hover:text-[#1D4ED8] font-medium">
              더 보기
            </Link>
          </div>
          
          {isLoadingReviews ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E3A8A]"></div>
            </div>
          ) : (
            <>
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
                      <p className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Link href="/reviews" className="bg-[#1E3A8A] text-white px-4 py-2 rounded-md hover:bg-[#1D4ED8] transition">
                  후기 작성하기
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 문의사항 섹션 */}
      <section className="py-16 bg-[#F9FAFB]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-[#374151]">문의사항</h2>
            <div>
              <Link href="/inquiry" className="text-[#1E3A8A] hover:text-[#1D4ED8] font-medium mr-4">
                더 보기
              </Link>
              <Link href="/inquiry/new" className="bg-[#1E3A8A] text-white px-4 py-2 rounded-md hover:bg-[#1D4ED8] transition">
                문의하기
              </Link>
            </div>
          </div>
          
          {isLoadingInquiries ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E3A8A]"></div>
            </div>
          ) : !user ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-600 mb-4">로그인 후 문의사항을 확인하실 수 있습니다.</p>
            </div>
          ) : inquiries.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {inquiries.slice(0, 5).map((inquiry) => (
                  <li key={inquiry.id} className="px-6 py-4 hover:bg-gray-50">
                    <Link href={`/inquiry/${inquiry.id}`} className="block">
                      <div className="flex items-center mb-1">
                        <h3 className="text-lg font-medium text-gray-900 flex-grow">{inquiry.title}</h3>
                        <span className="text-sm text-gray-500">
                          {new Date(inquiry.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {inquiry.reply ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            답변 완료
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            미답변
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-600 mb-4">등록된 문의사항이 없습니다.</p>
              <Link href="/inquiry/new" className="bg-[#1E3A8A] text-white px-4 py-2 rounded-md hover:bg-[#1D4ED8] transition">
                문의하기
              </Link>
            </div>
          )}
        </div>
      </section>
      {/* 연수원 시험 문제 풀이 섹션 */}
      <section id="problem-solver" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">연수원 시험 문제 풀이 도우미</h2>
          <p className="text-center text-gray-600 mb-8">교사 연수원 시험 문제를 AI가 분석하여 정답과 해설을 제공해드립니다.</p>
          <ProblemSolver />
        </div>
      </section>
    </main>
  );
}
