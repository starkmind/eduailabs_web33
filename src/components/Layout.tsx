'use client';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* 네비게이션 바 */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#1E3A8A]">
            연수원마스터
          </Link>
          <div className="flex items-center space-x-8">
            {user ? (
              <>
                <Link href="/reviews" className="text-base font-medium text-[#1E3A8A] hover:text-[#2563eb] transition-colors">
                  사용후기
                </Link>
                <Link href="/notice" className="text-base font-medium text-[#1E3A8A] hover:text-[#2563eb] transition-colors">
                  공지사항
                </Link>
                <Link href="/inquiry" className="text-base font-medium text-[#1E3A8A] hover:text-[#2563eb] transition-colors">
                  문의사항
                </Link>
                <Link href="/mypage" className="text-base font-medium text-[#1E3A8A] hover:text-[#2563eb] transition-colors">
                  마이페이지
                </Link>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="text-base font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/reviews" className="text-base font-medium text-[#1E3A8A] hover:text-[#2563eb] transition-colors">
                  사용후기
                </Link>
                <Link href="/notice" className="text-base font-medium text-[#1E3A8A] hover:text-[#2563eb] transition-colors">
                  공지사항
                </Link>
                <Link href="/inquiry" className="text-base font-medium text-[#1E3A8A] hover:text-[#2563eb] transition-colors">
                  문의사항
                </Link>
                <Link href="/login" className="text-base font-medium text-[#1E3A8A] hover:text-[#2563eb] transition-colors">
                  로그인
                </Link>
                <Link href="/signup" className="ml-2 bg-[#34d399] text-white font-semibold px-6 py-2 rounded-md text-base hover:bg-[#059669] transition-colors shadow-md">
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
} 