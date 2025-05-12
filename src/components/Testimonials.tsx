'use client'

import { useEffect, useState } from 'react'
import type { Database } from '@/types/supabase'
import Link from 'next/link'
import { testimonialApi } from '@/lib/api'

type Testimonial = Database['public']['Tables']['testimonials']['Row']

// 임시 테스트 데이터
const MOCK_TESTIMONIALS = [
  {
    id: '1',
    created_at: new Date().toISOString(),
    user_id: 'user1',
    content: '연수원마스터 덕분에 연수 시간을 크게 단축할 수 있었습니다. 특히 자동 재생과 퀴즈 자동 응답 기능이 매우 유용했습니다.',
    school: '서울시립초등학교',
    region: '서울',
    is_anonymous: false
  },
  {
    id: '2',
    created_at: new Date().toISOString(),
    user_id: 'user2',
    content: '교사 연수에 필요한 모든 기능이 한 곳에 모여있어 편리합니다. 사용법도 간단하고 직관적입니다.',
    school: '부산중앙중학교',
    region: '부산',
    is_anonymous: false
  },
  {
    id: '3',
    created_at: new Date().toISOString(),
    user_id: 'user3',
    content: '연수 시간을 절반으로 줄일 수 있었습니다. 다른 교사분들께도 추천드립니다.',
    school: null,
    region: null,
    is_anonymous: true
  }
]

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useMockData, setUseMockData] = useState(false)

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const data = await testimonialApi.getTestimonials(6);
        
        if (data?.length) {
          setTestimonials(data);
        } else {
          setUseMockData(true);
          setTestimonials(MOCK_TESTIMONIALS);
        }
      } catch (error: any) {
        console.error('Error fetching testimonials:', error);
        setError(error.message || '알 수 없는 오류가 발생했습니다.');
        // 오류 발생 시 임시 데이터 사용
        setUseMockData(true);
        setTestimonials(MOCK_TESTIMONIALS);
      } finally {
        setLoading(false);
      }
    }

    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#374151]">사용자 후기</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981]"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#374151]">사용자 후기</h2>
        {useMockData && (
          <p className="text-center text-sm text-gray-500 mb-8">
            * 현재 테스트 데이터를 표시하고 있습니다.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-[#F3F4F6] p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <p className="text-[#374151] mb-4">{testimonial.content}</p>
              <div className="flex items-center justify-between">
                <div>
                  {testimonial.is_anonymous ? (
                    <p className="text-sm text-gray-500">익명</p>
                  ) : (
                    <p className="text-sm font-semibold text-[#1E3A8A]">
                      {testimonial.school} {testimonial.region && `(${testimonial.region})`}
                    </p>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(testimonial.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/reviews" className="bg-[#1E3A8A] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1D4ED8] transition-colors shadow-md inline-block">
            더 많은 후기 보기
          </Link>
        </div>
      </div>
    </section>
  )
} 