'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Profile {
  name: string
  email: string
  created_at: string
  plan: '무료' | '라이트' | '프로' | null
  is_admin: boolean
  canautoclick: boolean
  canautoplay: boolean
  canchangespeed: boolean
  canmute: boolean
  maxspeed: number
}

export default function MyPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        if (!user) return

        // 관리자 권한 확인
        const { data: adminData } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        
        setIsAdmin(adminData?.is_admin || false);

        // 프로필 데이터 조회
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        // 프로필이 없는 경우 기본 정보로 생성
        if (profileError?.code === 'PGRST116') { // 데이터가 없는 경우
          // upsert를 사용하여 프로필 생성 또는 업데이트
          const { data: newProfile, error: upsertError } = await supabase
            .from('profiles')
            .upsert([
              {
                id: user.id,
                name: user.user_metadata?.name || '이름 없음',
                email: user.email,
                plan: '라이트',
                is_admin: false,
                canautoclick: true,
                canautoplay: false,
                canchangespeed: false,
                canmute: true,
                maxspeed: 1.0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ])
            .select()
            .single()

          if (upsertError) {
            console.error('Error upserting profile:', upsertError.message)
            // 에러 발생 시 기본 정보로 표시
            setProfile({
              name: user.user_metadata?.name || '이름 없음',
              email: user.email || '',
              created_at: new Date(user.created_at).toLocaleDateString('ko-KR'),
              plan: '라이트',
              is_admin: false,
              canautoclick: true,
              canautoplay: false,
              canchangespeed: false,
              canmute: true,
              maxspeed: 1.0
            })
          } else if (newProfile) {
            setProfile({
              name: newProfile.name,
              email: newProfile.email,
              created_at: new Date(newProfile.created_at).toLocaleDateString('ko-KR'),
              plan: newProfile.plan,
              is_admin: newProfile.is_admin,
              canautoclick: newProfile.canautoclick,
              canautoplay: newProfile.canautoplay,
              canchangespeed: newProfile.canchangespeed,
              canmute: newProfile.canmute,
              maxspeed: newProfile.maxspeed
            })
          }
        } else if (profileError) {
          console.error('Error fetching profile:', profileError.message)
          // 에러 발생 시 기본 정보로 표시
          setProfile({
            name: user.user_metadata?.name || '이름 없음',
            email: user.email || '',
            created_at: new Date(user.created_at).toLocaleDateString('ko-KR'),
            plan: '라이트',
            is_admin: false,
            canautoclick: true,
            canautoplay: false,
            canchangespeed: false,
            canmute: true,
            maxspeed: 1.0
          })
        } else {
          setProfile({
            name: profileData.name,
            email: profileData.email,
            created_at: new Date(profileData.created_at).toLocaleDateString('ko-KR'),
            plan: profileData.plan,
            is_admin: profileData.is_admin,
            canautoclick: profileData.canautoclick,
            canautoplay: profileData.canautoplay,
            canchangespeed: profileData.canchangespeed,
            canmute: profileData.canmute,
            maxspeed: profileData.maxspeed
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        // 에러 발생 시 기본 정보라도 표시
        if (user) {
          setProfile({
            name: user.user_metadata?.name || '이름 없음',
            email: user.email || '',
            created_at: new Date(user.created_at).toLocaleDateString('ko-KR'),
            plan: '라이트',
            is_admin: false,
            canautoclick: true,
            canautoplay: false,
            canchangespeed: false,
            canmute: true,
            maxspeed: 1.0
          })
        }
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  if (!user) return null
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#1E3A8A]">마이페이지</h1>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              profile?.plan === '프로' 
                ? 'bg-purple-100 text-purple-700'
                : profile?.plan === '라이트'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {profile?.plan || '무료'}
            </span>
            {profile?.is_admin && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                관리자
              </span>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[#374151] mb-6">기본 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500">이름</label>
                  <p className="text-lg text-[#374151] font-medium">{profile?.name}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500">이메일</label>
                  <p className="text-lg text-[#374151] font-medium">{profile?.email}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500">가입일</label>
                  <p className="text-lg text-[#374151] font-medium">{profile?.created_at}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[#374151] mb-6">사용 가능한 기능</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      profile?.canautoclick ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <svg className={`w-6 h-6 ${profile?.canautoclick ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-[#374151]">자동 클릭</p>
                      <p className="text-sm text-gray-500">자동으로 클릭 수행</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      profile?.canautoplay ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <svg className={`w-6 h-6 ${profile?.canautoplay ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-[#374151]">자동 재생</p>
                      <p className="text-sm text-gray-500">자동으로 콘텐츠 재생</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      profile?.canchangespeed ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <svg className={`w-6 h-6 ${profile?.canchangespeed ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-[#374151]">속도 조절</p>
                      <p className="text-sm text-gray-500">재생 속도 조절 가능</p>
                      {profile?.canchangespeed && (
                        <p className="text-sm text-green-600 font-medium">최대 {profile.maxspeed}x</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      profile?.canmute ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <svg className={`w-6 h-6 ${profile?.canmute ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-[#374151]">음소거</p>
                      <p className="text-sm text-gray-500">소리 끄기 기능</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => supabase.auth.signOut()}
                className="px-6 py-3 bg-gray-100 text-[#374151] font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 