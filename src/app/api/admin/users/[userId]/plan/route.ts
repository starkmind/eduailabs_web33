import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase 환경 변수 누락:', {
      url: !!supabaseUrl,
      key: !!supabaseServiceKey
    });
    return NextResponse.json(
      { error: '서버 설정 오류가 발생했습니다.' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('인증 헤더 누락 또는 형식 오류:', authHeader);
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // 토큰 검증
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) {
      console.error('토큰 검증 실패:', authError);
      return NextResponse.json(
        { error: '인증 토큰이 유효하지 않습니다.' },
        { status: 401 }
      );
    }
    if (!user) {
      console.error('사용자 정보 없음');
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('프로필 조회 실패:', profileError);
      return NextResponse.json(
        { error: '사용자 프로필을 조회할 수 없습니다.' },
        { status: 500 }
      );
    }
    if (!profile?.is_admin) {
      console.error('관리자 권한 없음:', { userId: user.id });
      return NextResponse.json(
        { error: '관리자 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const { plan } = await request.json();

    // 플랜 업데이트
    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update({ plan })
      .eq('id', params.userId)
      .select()
      .single();

    if (updateError) {
      console.error('플랜 업데이트 실패:', updateError);
      return NextResponse.json(
        { error: '플랜 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    if (!updatedUser) {
      console.error('업데이트된 사용자 정보 없음:', params.userId);
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('플랜 업데이트 중 예외 발생:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 