'use client';

import { useState, useEffect } from 'react';
import { inquiryApi, noticeApi, adminApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  is_admin: boolean;
  plan: string;
  created_at: string;
}

interface DashboardStats {
  totalInquiries: number;
  unansweredInquiries: number;
  totalNotices: number;
  totalUsers: number;
  adminUsers: number;
  planStats: {
    free: number;
    light: number;
    pro: number;
  };
  recentInquiries: Array<{
    id: number;
    title: string;
    created_at: string;
    reply?: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [inquiries, notices, users] = await Promise.all([
          inquiryApi.getInquiries(),
          noticeApi.getNotices(),
          adminApi.getUsers(),
        ]);

        const unansweredInquiries = inquiries.filter(
          (inquiry) => !inquiry.reply
        ).length;

        const recentInquiries = inquiries
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);

        const adminUsers = users.filter(user => user.is_admin).length;

        // 플랜별 사용자 수 계산
        const planStats = {
          free: users.filter(user => !user.plan || user.plan === '무료').length,
          light: users.filter(user => user.plan === '라이트').length,
          pro: users.filter(user => user.plan === '프로').length,
        };

        setStats({
          totalInquiries: inquiries.length,
          unansweredInquiries,
          totalNotices: notices.length,
          totalUsers: users.length,
          adminUsers,
          planStats,
          recentInquiries,
        });
      } catch (error) {
        console.error('대시보드 데이터 조회 실패:', error);
        alert('데이터를 불러오는데 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">전체 문의</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {stats?.totalInquiries}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">미답변 문의</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {stats?.unansweredInquiries}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">전체 공지사항</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {stats?.totalNotices}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">전체 사용자</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {stats?.totalUsers}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">관리자 수</h3>
          <p className="mt-2 text-3xl font-bold text-purple-600">
            {stats?.adminUsers}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">플랜별 사용자 현황</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">무료 플랜</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {stats?.planStats.free}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">라이트 플랜</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {stats?.planStats.light}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">프로 플랜</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {stats?.planStats.pro}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">최근 문의</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats?.recentInquiries.map((inquiry) => (
                <tr key={inquiry.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={`/inquiry/${inquiry.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {inquiry.title}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(inquiry.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {inquiry.reply ? (
                      <span className="px-2 py-1 text-xs font-bold text-green-600 bg-green-100 rounded">
                        답변 완료
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-bold text-red-600 bg-red-100 rounded">
                        미답변
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 