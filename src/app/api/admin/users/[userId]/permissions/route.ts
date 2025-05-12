import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Edge 런타임 제거
// export const dynamic = 'force-dynamic';
// export const runtime = 'edge';

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
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // 토큰 검증
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) {
      console.error('토큰 검증 실패:', authError);
      return NextResponse.json(
        { error: '인증 토큰이 유효하지 않습니다.' },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }
    if (!user) {
      console.error('사용자 정보 없음');
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
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
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }
    if (!profile?.is_admin) {
      console.error('관리자 권한 없음:', { userId: user.id });
      return NextResponse.json(
        { error: '관리자 권한이 없습니다.' },
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    const { permission, value } = await request.json();
    
    // maxspeed는 boolean이 아닌 number 타입이므로 별도 처리
    if (permission === 'maxspeed') {
      if (typeof value !== 'number' || value < 0) {
        console.error('잘못된 maxspeed 값:', value);
        return NextResponse.json(
          { error: 'maxspeed는 0 이상의 숫자여야 합니다.' },
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
          }
        );
      }
    } else if (!permission || typeof value !== 'boolean') {
      console.error('잘못된 요청 데이터:', { permission, value });
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // 실제 데이터베이스 스키마에 있는 컬럼만 허용
    const validPermissions = [
      'is_admin',
      'canautoclick',
      'canautoplay',
      'canchangespeed',
      'canmute',
      'maxspeed'
    ];
    
    if (!validPermissions.includes(permission)) {
      console.error('유효하지 않은 권한:', permission);
      return NextResponse.json(
        { error: `유효하지 않은 권한입니다. 허용된 권한: ${validPermissions.join(', ')}` },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // 권한 업데이트
    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update({ [permission]: value })
      .eq('id', params.userId)
      .select()
      .single();

    if (updateError) {
      console.error('권한 업데이트 실패:', {
        error: updateError,
        userId: params.userId,
        permission,
        value
      });
      return NextResponse.json(
        { error: `권한 업데이트에 실패했습니다: ${updateError.message}` },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    if (!updatedUser) {
      console.error('업데이트된 사용자 정보 없음:', params.userId);
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    return NextResponse.json(
      updatedUser,
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  } catch (error) {
    console.error('권한 업데이트 중 예외 발생:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
} 