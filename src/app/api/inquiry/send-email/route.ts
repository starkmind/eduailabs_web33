import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || 'your_resend_api_key_here';
const inquiryEmail = process.env.INQUIRY_EMAIL || 'starkmind.ai@gmail.com';

const resend = new Resend(resendApiKey);

function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export async function POST(req: Request) {
  try {
    const { email, name, message } = await req.json();

    if (!email || !name || !message) {
      return NextResponse.json({
        success: false,
        error: '이름, 이메일, 문의내용은 필수 항목입니다.'
      }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({
        success: false,
        error: '유효한 이메일 주소를 입력해주세요.'
      }, { status: 400 });
    }

    if (resendApiKey === 'your_resend_api_key_here') {
      return NextResponse.json({
        success: false,
        error: 'Resend API 키가 설정되지 않았습니다.'
      }, { status: 500 });
    }

    const data = await resend.emails.send({
      from: 'EduAI Labs <onboarding@resend.dev>',
      to: inquiryEmail,
      subject: `새로운 문의사항: ${name}`,
      html: `<p><strong>이름:</strong> ${name}</p><p><strong>이메일:</strong> ${email}</p><p><strong>문의내용:</strong><br/>${message}</p>`,
      replyTo: email,
    });

    if (data.error) {
      return NextResponse.json({
        success: false,
        error: data.error.message || '이메일 전송 중 오류가 발생했습니다.',
        details: data.error
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || '알 수 없는 오류가 발생했습니다.'
    }, { status: 500 });
  }
} 