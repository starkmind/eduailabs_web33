import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL과 Anon Key가 설정되지 않았습니다.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// 인증 관련 함수들
export const auth = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },
  
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },
  
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },
  
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },
  
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  }
};

// 문의 관련 API
export const inquiryApi = {
  // 문의 목록 조회
  getInquiries: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    // 관리자 권한 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    // 관리자가 아닌 경우 자신의 문의사항만 조회
    if (!profile?.is_admin) {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('문의 목록 조회 실패:', error);
      throw error;
    }
    return data;
  },

  // 문의 상세 조회
  getInquiry: async (id: number) => {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('문의 상세 조회 실패:', error);
      throw error;
    }
    return data;
  },

  // 문의 작성
  createInquiry: async (title: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .insert([{ 
          title, 
          content,
          created_at: new Date().toISOString(),
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();
      
      if (error) {
        console.error('문의 작성 실패:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('문의 작성 중 예외 발생:', error);
      throw error;
    }
  },

  // 문의 답변 작성
  replyInquiry: async (id: number, reply: string) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error('인증 오류: ' + authError.message);
    if (!user) throw new Error('로그인이 필요합니다.');

    // 관리자 권한 확인
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('프로필 조회 오류:', profileError);
      throw new Error('프로필 정보를 조회할 수 없습니다: ' + profileError.message);
    }
    
    if (!profile) {
      throw new Error('사용자 프로필이 존재하지 않습니다. 관리자에게 문의하세요.');
    }
    
    if (!profile.is_admin) {
      throw new Error('관리자 권한이 없습니다.');
    }

    const { data, error } = await supabase
      .from('inquiries')
      .update({
        reply,
        reply_date: new Date().toISOString(),
        status: 'answered'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('답변 작성 실패:', error);
      throw new Error(error.message || '답변 작성에 실패했습니다.');
    }

    return data;
  },

  // 문의 삭제
  deleteInquiry: async (id: number) => {
    const { error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('문의 삭제 실패:', error);
      throw error;
    }
  },

  // 문의 수정
  updateInquiry: async (id: number, title: string, content: string) => {
    const { data, error } = await supabase
      .from('inquiries')
      .update({ title, content })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('문의 수정 실패:', error);
      throw error;
    }
    return data;
  },
};

// 공지사항 관련 API
export const noticeApi = {
  // 공지사항 목록 조회
  getNotices: async () => {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // 공지사항 상세 조회
  getNotice: async (id: number) => {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // 공지사항 작성
  createNotice: async (title: string, content: string, isImportant: boolean) => {
    try {
      // 0. 입력값 검증
      if (!title || !title.trim()) {
        throw new Error('제목을 입력해주세요.');
      }
      
      if (!content || !content.trim()) {
        throw new Error('내용을 입력해주세요.');
      }
      
      // 1. 사용자 인증 확인
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error('인증 오류: ' + authError.message);
      if (!user) throw new Error('로그인이 필요합니다.');

      // 2. 관리자 권한 확인 - 더 명확한 에러 메시지 추가
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('프로필 조회 오류:', profileError);
        throw new Error('프로필 정보를 조회할 수 없습니다: ' + profileError.message);
      }
      
      if (!profile) {
        throw new Error('사용자 프로필이 존재하지 않습니다. 관리자에게 문의하세요.');
      }
      
      if (!profile.is_admin) {
        throw new Error('관리자 권한이 없습니다. 관리자만 공지사항을 작성할 수 있습니다.');
      }

      // 3. 공지사항 작성 - 에러 처리 개선
      const { data, error: insertError } = await supabase
        .from('notices')
        .insert([{ 
          title, 
          content, 
          is_important: isImportant,
          created_at: new Date().toISOString(),
          user_id: user.id
        }])
        .select()
        .single();
      
      if (insertError) {
        console.error('공지사항 작성 실패:', insertError);
        // RLS 정책 관련 오류일 가능성이 높음
        if (insertError.code === '42501') {
          throw new Error('권한이 없습니다. 관리자만 공지사항을 작성할 수 있습니다.');
        } else {
          throw new Error(`공지사항 작성 오류: ${insertError.message || JSON.stringify(insertError)}`);
        }
      }

      if (!data) {
        throw new Error('공지사항이 생성되지 않았습니다.');
      }

      return data;
    } catch (error) {
      console.error('공지사항 작성 중 에러 발생:', error);
      // 에러가 문자열인 경우 Error 객체로 변환
      if (typeof error === 'string') {
        throw new Error(error);
      }
      // 빈 객체인 경우 기본 에러 메시지 제공
      if (error && Object.keys(error).length === 0) {
        throw new Error('알 수 없는 오류가 발생했습니다. 관리자 권한을 확인하거나 다시 시도해주세요.');
      }
      throw error;
    }
  },

  // 공지사항 수정
  updateNotice: async (id: number, title: string, content: string, isImportant: boolean) => {
    try {
      // 1. 입력값 검증
      if (!title || !title.trim()) {
        throw new Error('제목을 입력해주세요.');
      }
      
      if (!content || !content.trim()) {
        throw new Error('내용을 입력해주세요.');
      }
      
      // 2. 사용자 인증 확인
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error('인증 오류: ' + authError.message);
      if (!user) throw new Error('로그인이 필요합니다.');

      // 3. 관리자 권한 확인
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('프로필 조회 오류:', profileError);
        throw new Error('프로필 정보를 조회할 수 없습니다: ' + profileError.message);
      }
      
      if (!profile) {
        throw new Error('사용자 프로필이 존재하지 않습니다. 관리자에게 문의하세요.');
      }
      
      if (!profile.is_admin) {
        throw new Error('관리자 권한이 없습니다. 관리자만 공지사항을 수정할 수 있습니다.');
      }

      // 4. 공지사항 수정
      const { data, error: updateError } = await supabase
        .from('notices')
        .update({ 
          title, 
          content, 
          is_important: isImportant 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (updateError) {
        console.error('공지사항 수정 실패:', updateError);
        if (updateError.code === '42501') {
          throw new Error('권한이 없습니다. 관리자만 공지사항을 수정할 수 있습니다.');
        } else {
          throw new Error(`공지사항 수정 오류: ${updateError.message || JSON.stringify(updateError)}`);
        }
      }

      if (!data) {
        throw new Error('공지사항이 수정되지 않았습니다.');
      }

      return data;
    } catch (error) {
      console.error('공지사항 수정 중 에러 발생:', error);
      if (typeof error === 'string') {
        throw new Error(error);
      }
      if (error && Object.keys(error).length === 0) {
        throw new Error('알 수 없는 오류가 발생했습니다. 관리자 권한을 확인하거나 다시 시도해주세요.');
      }
      throw error;
    }
  },

  // 공지사항 삭제
  deleteNotice: async (id: number) => {
    try {
      // 1. 사용자 인증 확인
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error('인증 오류: ' + authError.message);
      if (!user) throw new Error('로그인이 필요합니다.');

      // 2. 관리자 권한 확인
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('프로필 조회 오류:', profileError);
        throw new Error('프로필 정보를 조회할 수 없습니다: ' + profileError.message);
      }
      
      if (!profile) {
        throw new Error('사용자 프로필이 존재하지 않습니다. 관리자에게 문의하세요.');
      }
      
      if (!profile.is_admin) {
        throw new Error('관리자 권한이 없습니다. 관리자만 공지사항을 삭제할 수 있습니다.');
      }

      // 3. 공지사항 삭제
      const { error: deleteError } = await supabase
        .from('notices')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error('공지사항 삭제 실패:', deleteError);
        if (deleteError.code === '42501') {
          throw new Error('권한이 없습니다. 관리자만 공지사항을 삭제할 수 있습니다.');
        } else {
          throw new Error(`공지사항 삭제 오류: ${deleteError.message || JSON.stringify(deleteError)}`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('공지사항 삭제 중 에러 발생:', error);
      if (typeof error === 'string') {
        throw new Error(error);
      }
      if (error && Object.keys(error).length === 0) {
        throw new Error('알 수 없는 오류가 발생했습니다. 관리자 권한을 확인하거나 다시 시도해주세요.');
      }
      throw error;
    }
  },
};

// 결제 관련 API
export const paymentApi = {
  // 결제 생성
  createPayment: async (amount: number, paymentMethod: string, paymentDetails: any) => {
    const { data, error } = await supabase
      .from('payments')
      .insert([{ 
        amount, 
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        status: 'pending'
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// 계정 관련 API
export const accountApi = {
  // 회원 탈퇴
  deleteAccount: async (password: string) => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', (await supabase.auth.getUser()).data.user?.id);
    
    if (deleteError) throw deleteError;
  },
};

// 관리자 관련 API
export const adminApi = {
  // 관리자 권한 확인
  checkAdmin: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    return profile?.is_admin || false;
  },

  // 디버깅용: 현재 사용자 정보 및 관리자 상태 확인
  debugCurrentUser: async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        return { error: '사용자 정보 조회 실패: ' + userError.message };
      }
      
      if (!user) {
        return { error: '로그인되지 않음' };
      }
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        return { 
          user: { id: user.id, email: user.email },
          error: '프로필 조회 실패: ' + profileError.message 
        };
      }
      
      return { 
        user: { id: user.id, email: user.email },
        profile,
        isAdmin: !!profile?.is_admin
      };
    } catch (error) {
      console.error('디버깅 정보 조회 실패:', error);
      return { error: '디버깅 정보 조회 중 오류 발생' };
    }
  },

  // 사용자 목록 조회
  getUsers: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // 관리자 권한 부여
  grantAdmin: async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', userId);

    if (error) throw error;
  },

  // 관리자 권한 회수
  revokeAdmin: async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: false })
      .eq('id', userId);

    if (error) throw error;
  },

  updateUserPermission: async (userId: string, permission: string, value: boolean | number) => {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error('로그인이 필요합니다.');
      }

      // 유효한 권한 목록
      const validPermissions = [
        'is_admin',
        'canautoclick',
        'canautoplay',
        'canchangespeed',
        'canmute',
        'maxspeed'
      ];

      if (!validPermissions.includes(permission)) {
        throw new Error(`유효하지 않은 권한입니다. 허용된 권한: ${validPermissions.join(', ')}`);
      }

      // maxspeed는 number 타입이어야 함
      if (permission === 'maxspeed' && typeof value !== 'number') {
        throw new Error('maxspeed는 숫자 값이어야 합니다.');
      }
      // maxspeed가 아닌 경우 boolean 타입이어야 함
      else if (permission !== 'maxspeed' && typeof value !== 'boolean') {
        throw new Error('권한 값은 boolean이어야 합니다.');
      }

      const response = await fetch(`/api/admin/users/${userId}/permissions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: JSON.stringify({ permission, value })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '권한 업데이트에 실패했습니다.');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('권한 업데이트 중 오류 발생:', error);
      throw error;
    }
  },

  updateUserMaxSpeed: async (userId: string, maxSpeed: number) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error('인증 오류: ' + authError.message);
      if (!user) throw new Error('로그인이 필요합니다.');

      // 관리자 권한 확인
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('프로필 조회 오류:', profileError);
        throw new Error('프로필 정보를 조회할 수 없습니다: ' + profileError.message);
      }
      
      if (!profile) {
        throw new Error('사용자 프로필이 존재하지 않습니다. 관리자에게 문의하세요.');
      }
      
      if (!profile.is_admin) {
        throw new Error('관리자 권한이 없습니다.');
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error('세션 오류: ' + sessionError.message);
      if (!session?.access_token) throw new Error('인증 토큰이 없습니다.');

      const response = await fetch(`/api/admin/users/${userId}/max-speed`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ maxSpeed }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '최대 속도 업데이트에 실패했습니다.');
      }

      return response.json();
    } catch (error) {
      console.error('최대 속도 업데이트 중 오류 발생:', error);
      throw error;
    }
  },

  updateUserPlan: async (userId: string, plan: string) => {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error('로그인이 필요합니다.');
      }

      const response = await fetch(`/api/admin/users/${userId}/plan`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: JSON.stringify({ plan })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '플랜 업데이트에 실패했습니다.');
      }

      return response.json();
    } catch (error) {
      console.error('플랜 업데이트 중 오류 발생:', error);
      throw error;
    }
  },
};

// 사용자 후기 관련 API
export const reviewApi = {
  // 후기 목록 조회
  getReviews: async (limit?: number) => {
    try {
      let query = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('후기 목록 조회 실패:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('후기 목록 조회 중 오류 발생:', error);
      throw error;
    }
  },

  // 후기 작성
  createReview: async (title: string, content: string, rating: number, region: string | null, organization: string | null) => {
    try {
      // 1. 사용자 인증 확인
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error('인증 오류: ' + authError.message);
      if (!user) throw new Error('로그인이 필요합니다.');

      // 2. 입력값 검증
      if (!title.trim()) {
        throw new Error('제목을 입력해주세요.');
      }

      if (!content.trim()) {
        throw new Error('내용을 입력해주세요.');
      }

      if (rating < 1 || rating > 5) {
        throw new Error('평점은 1~5 사이의 값으로 입력해주세요.');
      }

      // 3. 후기 작성
      const { data, error: insertError } = await supabase
        .from('reviews')
        .insert([{ 
          title: title.trim(),
          content: content.trim(), 
          rating,
          region: region?.trim() || null,
          organization: organization?.trim() || null,
          user_id: user.id
        }])
        .select()
        .single();
      
      if (insertError) {
        console.error('후기 작성 실패:', insertError);
        throw new Error(`후기 작성 오류: ${insertError.message || JSON.stringify(insertError)}`);
      }

      if (!data) {
        throw new Error('후기가 생성되지 않았습니다.');
      }

      return data;
    } catch (error) {
      console.error('후기 작성 중 에러 발생:', error);
      if (typeof error === 'string') {
        throw new Error(error);
      }
      if (error && Object.keys(error).length === 0) {
        throw new Error('알 수 없는 오류가 발생했습니다. 다시 시도해주세요.');
      }
      throw error;
    }
  },

  // 특정 사용자의 후기 조회
  getUserReviews: async (userId: string) => {
    try {
      // 1. 사용자 인증 확인
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error('인증 오류: ' + authError.message);
      if (!user) throw new Error('로그인이 필요합니다.');

      // 2. 후기 조회
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('사용자 후기 조회 실패:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('사용자 후기 조회 중 오류 발생:', error);
      throw error;
    }
  },

  // 후기 상세 조회
  getReview: async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('후기 상세 조회 실패:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('후기 상세 조회 중 오류 발생:', error);
      throw error;
    }
  },

  // 후기 수정
  updateReview: async (id: number, title: string, content: string, rating: number, region: string | null, organization: string | null) => {
    try {
      // 1. 사용자 인증 확인
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error('인증 오류: ' + authError.message);
      if (!user) throw new Error('로그인이 필요합니다.');

      // 2. 후기 소유자 확인
      const { data: review, error: fetchError } = await supabase
        .from('reviews')
        .select('user_id')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error('후기 조회 실패:', fetchError);
        throw fetchError;
      }

      if (!review) {
        throw new Error('해당 후기를 찾을 수 없습니다.');
      }

      if (review.user_id !== user.id) {
        throw new Error('자신이 작성한 후기만 수정할 수 있습니다.');
      }

      // 3. 입력값 검증
      if (!title.trim()) {
        throw new Error('제목을 입력해주세요.');
      }

      if (!content.trim()) {
        throw new Error('내용을 입력해주세요.');
      }

      if (rating < 1 || rating > 5) {
        throw new Error('평점은 1~5 사이의 값으로 입력해주세요.');
      }

      // 4. 후기 수정
      const { data, error: updateError } = await supabase
        .from('reviews')
        .update({ 
          title: title.trim(),
          content: content.trim(),
          rating,
          region: region?.trim() || null,
          organization: organization?.trim() || null
        })
        .eq('id', id)
        .select()
        .single();
      
      if (updateError) {
        console.error('후기 수정 실패:', updateError);
        throw updateError;
      }
      
      return data;
    } catch (error) {
      console.error('후기 수정 중 오류 발생:', error);
      throw error;
    }
  },

  // 후기 삭제
  deleteReview: async (id: number) => {
    try {
      // 1. 사용자 인증 확인
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error('인증 오류: ' + authError.message);
      if (!user) throw new Error('로그인이 필요합니다.');

      // 2. 후기의 소유자 확인
      const { data: review, error: fetchError } = await supabase
        .from('reviews')
        .select('user_id')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error('후기 조회 실패:', fetchError);
        throw fetchError;
      }

      if (!review) {
        throw new Error('해당 후기를 찾을 수 없습니다.');
      }

      // 관리자 여부 확인
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      const isAdmin = profile?.is_admin || false;

      // 3. 본인 후기이거나 관리자인 경우에만 삭제 허용
      if (review.user_id !== user.id && !isAdmin) {
        throw new Error('자신의 후기만 삭제할 수 있습니다.');
      }

      // 4. 후기 삭제
      const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error('후기 삭제 실패:', deleteError);
        throw deleteError;
      }
      
      return true;
    } catch (error) {
      console.error('후기 삭제 중 오류 발생:', error);
      throw error;
    }
  }
};

// 플랜 및 플랜별 기능 관련 API
export const planApi = {
  // 플랜 목록 조회
  getPlans: async () => {
    const { data, error } = await supabase.from('plans').select('id, name, description');
    if (error) throw error;
    return data;
  },

  // 플랜별 기능 조회
  getPlanFeatures: async (planId: string) => {
    const { data, error } = await supabase
      .from('plan_features')
      .select('canautoclick, canautoplay, canchangespeed, canmute, maxspeed')
      .eq('plan_id', planId)
      .single();
    if (error) throw error;
    return data;
  },

  // 플랜별 기능 저장/업데이트
  upsertPlanFeatures: async (planId: string, features: any) => {
    const { data, error } = await supabase
      .from('plan_features')
      .upsert([{ plan_id: planId, ...features }], { onConflict: 'plan_id' });
    if (error) throw error;
    return data;
  }
}; 