import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// 환경 변수가 설정되어 있으면 해당 값을 사용하고, 아니면 기본값 사용
const resendApiKey = process.env.RESEND_API_KEY || 'your_resend_api_key_here'; // 실제 사용 시 발급받은 API 키로 변경 필요
const contactEmail = process.env.CONTACT_EMAIL || 'starkmind.ai@gmail.com'; // 실제 사용 시 이메일 주소로 변경 필요

// API 키가 설정되어 있는지 확인
console.log('Resend API 설정 상태:', {
  keyConfigured: resendApiKey !== 'your_resend_api_key_here',
  contactEmail
});

const resend = new Resend(resendApiKey);

// 이메일 주소 유효성 검사 함수
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export async function POST(req: Request) {
  try {
    // 요청 데이터 파싱
    const { email, name, message } = await req.json();
    
    console.log('이메일 전송 시도:', { email, name, contactEmail });
    
    // 필수 데이터 검증
    if (!email || !name || !message) {
      return NextResponse.json({
        success: false,
        error: '이름, 이메일, 메시지는 필수 항목입니다.'
      }, { status: 400 });
    }
    
    // 이메일 형식 검증
    if (!isValidEmail(email)) {
      return NextResponse.json({
        success: false,
        error: '유효한 이메일 주소를 입력해주세요. (예: email@example.com)'
      }, { status: 400 });
    }

    // API 키가 기본값인 경우 오류 메시지 반환
    if (resendApiKey === 'your_resend_api_key_here') {
      console.error('API 키가 설정되지 않았습니다.');
      return NextResponse.json({ 
        success: false, 
        error: 'Resend API 키가 설정되지 않았습니다. .env.local 파일에 RESEND_API_KEY를 설정해주세요.' 
      }, { status: 500 });
    }
    
    // 테스트 모드: API 키가 없는 경우에도 "성공" 응답 반환 (개발/테스트 환경용)
    if (process.env.NODE_ENV === 'development' && resendApiKey === 'your_resend_api_key_here') {
      console.log('개발 모드: API 키 없이 메일 전송 시뮬레이션');
      return NextResponse.json({
        success: true,
        data: {
          id: 'test-email-id',
          from: 'onboarding@resend.dev',
          to: contactEmail,
          created_at: new Date().toISOString(),
          status: 'sent',
          message: '[개발 모드] 이메일 전송이 시뮬레이션되었습니다. 실제 이메일은 전송되지 않았습니다.'
        }
      });
    }
    
    try {
      // Resend를 사용하여 이메일 전송
      const data = await resend.emails.send({
        from: 'EduAI Labs <onboarding@resend.dev>', // 무료 Resend 계정의 기본 발신자 이메일
        to: contactEmail,
        subject: `새로운 문의: ${name}`,
        html: `<p><strong>이름:</strong> ${name}</p>
               <p><strong>이메일:</strong> ${email}</p>
               <p><strong>문의내용:</strong><br/>${message}</p>`,
        replyTo: email, // 회신 시 사용자 이메일로 바로 회신되도록 설정
      });

      console.log('이메일 전송 성공:', data);
      
      // Resend 응답에 오류가 있는지 확인
      if (data.error) {
        return NextResponse.json({ 
          success: false, 
          error: data.error.message || '이메일 전송 중 오류가 발생했습니다.',
          details: data.error
        }, { status: 500 });
      }
      
      return NextResponse.json({ success: true, data });
    } catch (resendError: any) {
      console.error('Resend API 호출 실패:', resendError);
      return NextResponse.json({ 
        success: false, 
        error: resendError?.message || 'Resend API 호출 중 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? resendError : undefined
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('이메일 전송 실패:', error);
    
    // 요청 본문 파싱 오류 처리
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return NextResponse.json({
        success: false,
        error: '잘못된 요청 형식입니다. 유효한 JSON을 전송해주세요.',
      }, { status: 400 });
    }
    
    // 더 자세한 오류 정보 반환
    return NextResponse.json({ 
      success: false, 
      error: error?.message || '알 수 없는 오류가 발생했습니다.',
      details: process.env.NODE_ENV === 'development' ? {
        name: error?.name,
        stack: error?.stack,
        cause: error?.cause
      } : undefined
    }, { status: 500 });
  }
} 