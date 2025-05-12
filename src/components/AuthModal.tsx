'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import GoogleLoginButton from './GoogleLoginButton'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'login' | 'signup'
}

export default function AuthModal({ isOpen, onClose, mode }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    console.log('로그인/회원가입 시도:', mode, email)

    try {
      if (mode === 'signup') {
        // 1. 회원가입
        console.log('회원가입 시도:', { email, name })
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        })
        if (signUpError) {
          console.error('회원가입 오류:', signUpError)
          throw signUpError
        }

        console.log('회원가입 성공:', authData)

        // 2. 프로필 생성
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: authData.user.id,
                name,
                email,
                created_at: new Date().toISOString(),
              },
            ])
          if (profileError) {
            console.error('프로필 생성 오류:', profileError)
            throw profileError
          }
          console.log('프로필 생성 성공')
        }

        alert('가입 확인 이메일을 확인해주세요.')
      } else {
        console.log('로그인 시도:', { email })
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          console.error('로그인 오류:', error)
          throw error
        }
        console.log('로그인 성공:', data)
      }
      onClose()
    } catch (error: any) {
      console.error('인증 오류:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold mb-8 text-center text-[#1E3A8A]">
          {mode === 'login' ? '로그인' : '회원가입'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-2">
                이름
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] transition-colors"
                required
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-[#374151] mb-2">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-[#374151] mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] transition-colors"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg font-semibold text-white shadow-md transition-colors bg-[#34d399] hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '처리중...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          <div className="mt-6">
            <GoogleLoginButton />
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 text-sm text-[#374151] hover:text-[#1E3A8A] transition-colors w-full text-center font-medium"
        >
          닫기
        </button>
      </div>
    </div>
  )
} 