'use client';

import { useState, useEffect } from 'react';
import { adminApi, planApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  created_at: string;
  canautoclick: boolean;
  canautoplay: boolean;
  canchangespeed: boolean;
  canmute: boolean;
  maxspeed: number;
  plan: string;
}

interface Plan {
  id: string;
  name: string;
  description?: string;
}

interface PlanFeatures {
  canautoclick: boolean;
  canautoplay: boolean;
  canchangespeed: boolean;
  canmute: boolean;
  maxspeed: number;
}

export default function AdminUserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [planFeatures, setPlanFeatures] = useState<PlanFeatures | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [usersData, plansData] = await Promise.all([
          adminApi.getUsers(),
          planApi.getPlans()
        ]);
        setUsers(usersData);
        setPlans(plansData);
      } catch (error) {
        alert('데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    try {
      if (currentIsAdmin) {
        await adminApi.revokeAdmin(userId);
      } else {
        await adminApi.grantAdmin(userId);
      }

      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_admin: !currentIsAdmin }
          : user
      ));
    } catch (error) {
      console.error('관리자 권한 변경 실패:', error);
      alert('관리자 권한 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleTogglePermission = async (userId: string, permission: keyof User, currentValue: boolean) => {
    try {
      await adminApi.updateUserPermission(userId, permission, !currentValue);
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, [permission]: !currentValue }
          : user
      ));
    } catch (error) {
      console.error('권한 변경 실패:', error);
      alert('권한 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleUpdateMaxSpeed = async (userId: string, newSpeed: number) => {
    try {
      await adminApi.updateUserMaxSpeed(userId, newSpeed);
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, maxspeed: newSpeed }
          : user
      ));
    } catch (error) {
      console.error('최대 속도 변경 실패:', error);
      alert('최대 속도 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleUpdatePlan = async (userId: string, newPlan: string) => {
    try {
      const plan = plans.find(p => p.name === newPlan);
      if (!plan) return;
      let features: PlanFeatures = {
        canautoclick: false,
        canautoplay: false,
        canchangespeed: false,
        canmute: true,
        maxspeed: 1.0
      };
      try {
        features = await planApi.getPlanFeatures(plan.id);
      } catch (e) {}
      // 플랜 업데이트
      await adminApi.updateUserPlan(userId, newPlan);
      // 플랜에 따른 기능 업데이트
      await Promise.all([
        adminApi.updateUserPermission(userId, 'canautoclick', features.canautoclick),
        adminApi.updateUserPermission(userId, 'canautoplay', features.canautoplay),
        adminApi.updateUserPermission(userId, 'canchangespeed', features.canchangespeed),
        adminApi.updateUserPermission(userId, 'canmute', features.canmute),
        adminApi.updateUserMaxSpeed(userId, features.maxspeed)
      ]);
      // UI 업데이트
      setUsers(users.map(user =>
        user.id === userId
          ? {
              ...user,
              plan: newPlan,
              canautoclick: features.canautoclick,
              canautoplay: features.canautoplay,
              canchangespeed: features.canchangespeed,
              canmute: features.canmute,
              maxspeed: features.maxspeed
            }
          : user
      ));
      alert(`${newPlan} 플랜이 적용되었습니다.`);
    } catch (error) {
      console.error('플랜 변경 실패:', error);
      alert('플랜 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleEditPlanTemplate = async (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPlanModal(true);
    try {
      const features = await planApi.getPlanFeatures(plan.id);
      setPlanFeatures(features);
    } catch (e) {
      setPlanFeatures({
        canautoclick: false,
        canautoplay: false,
        canchangespeed: false,
        canmute: true,
        maxspeed: 1.0
      });
    }
  };

  const handleSavePlanTemplate = async () => {
    if (!selectedPlan || !planFeatures) return;
    setSaving(true);
    try {
      await planApi.upsertPlanFeatures(selectedPlan.id, planFeatures);
      setShowPlanModal(false);
      alert('플랜 설정이 저장되었습니다.');
    } catch (error) {
      alert('플랜 설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">사용자 관리</h1>
        <div className="space-x-2">
          {plans.map(plan => (
            <button
              key={plan.id}
              onClick={() => handleEditPlanTemplate(plan)}
              className={`px-4 py-2 rounded-md ${plan.name === '무료' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : plan.name === '라이트' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
            >
              {plan.name} 플랜 설정
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이메일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                플랜
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                권한
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                기능 설정
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.plan}
                    onChange={(e) => handleUpdatePlan(user.id, e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {plans.map(plan => (
                      <option key={plan.id} value={plan.name}>{plan.name}</option>
                    ))}
                  </select>
                  <div className="mt-1 text-xs text-gray-500">
                    {user.plan === '무료' && '기본 기능만 사용 가능'}
                    {user.plan === '라이트' && '자동 클릭 기능 사용 가능'}
                    {user.plan === '프로' && '모든 기능 사용 가능'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.is_admin ? (
                    <span className="px-2 py-1 text-xs font-bold text-indigo-600 bg-indigo-100 rounded">
                      관리자
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-bold text-gray-600 bg-gray-100 rounded">
                      일반 사용자
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">자동 클릭</label>
                      <input
                        type="checkbox"
                        checked={user.canautoclick}
                        onChange={() => handleTogglePermission(user.id, 'canautoclick', user.canautoclick)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">자동 재생</label>
                      <input
                        type="checkbox"
                        checked={user.canautoplay}
                        onChange={() => handleTogglePermission(user.id, 'canautoplay', user.canautoplay)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">속도 조절</label>
                      <input
                        type="checkbox"
                        checked={user.canchangespeed}
                        onChange={() => handleTogglePermission(user.id, 'canchangespeed', user.canchangespeed)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">음소거</label>
                      <input
                        type="checkbox"
                        checked={user.canmute}
                        onChange={() => handleTogglePermission(user.id, 'canmute', user.canmute)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">최대 속도</label>
                      <input
                        type="number"
                        value={user.maxspeed}
                        onChange={(e) => handleUpdateMaxSpeed(user.id, parseFloat(e.target.value))}
                        min="0.5"
                        max="3"
                        step="0.1"
                        className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                    className={`px-3 py-1 rounded-md ${
                      user.is_admin
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {user.is_admin ? '권한 회수' : '권한 부여'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPlanModal && selectedPlan && planFeatures && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">플랜 설정: {selectedPlan.name}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">자동 클릭</label>
                <input
                  type="checkbox"
                  checked={planFeatures.canautoclick}
                  onChange={e => setPlanFeatures({ ...planFeatures, canautoclick: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">자동 재생</label>
                <input
                  type="checkbox"
                  checked={planFeatures.canautoplay}
                  onChange={e => setPlanFeatures({ ...planFeatures, canautoplay: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">속도 조절</label>
                <input
                  type="checkbox"
                  checked={planFeatures.canchangespeed}
                  onChange={e => setPlanFeatures({ ...planFeatures, canchangespeed: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">음소거</label>
                <input
                  type="checkbox"
                  checked={planFeatures.canmute}
                  onChange={e => setPlanFeatures({ ...planFeatures, canmute: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">최대 속도</label>
                <input
                  type="number"
                  value={planFeatures.maxspeed}
                  onChange={e => setPlanFeatures({ ...planFeatures, maxspeed: parseFloat(e.target.value) })}
                  min="0.5"
                  max="3"
                  step="0.1"
                  className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowPlanModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                disabled={saving}
              >
                취소
              </button>
              <button
                onClick={handleSavePlanTemplate}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                disabled={saving}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 