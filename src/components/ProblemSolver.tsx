'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';

const ProblemSolver = () => {
  const [inputText, setInputText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setImage(acceptedFiles[0]);
    }
  });

  // 클립보드에서 이미지 붙여넣기 처리
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          setImage(file);
          break;
        }
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

      let prompt = `당신은 교사 연수 시험 문제를 대신 풀어주는 AI 도우미입니다.
다음 문항은 연수 강의 내용에 기반한 객관식 문제입니다.

당신의 역할은 다음과 같습니다:
1. 문제와 보기 내용을 정확히 이해하고,
2. 정답을 선택한 뒤,
3. 왜 그 보기가 정답인지 간단히 설명해 주세요.

형식은 다음과 같이 출력해주세요:

---
### 문제
{문제 내용}

### 정답
**{번호 또는 보기 텍스트}**

### 해설
{간단명료한 해설. 2~3문장 이내. 교사 기준으로 이해하기 쉽게.}
---

다음은 문제입니다:

${inputText}`;
      
      if (image) {
        const imageData = await readFileAsBase64(image);
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: imageData,
              mimeType: image.type
            }
          }
        ]);
        const response = await result.response;
        setSolution(response.text());
      } else {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        setSolution(response.text());
      }
    } catch (error) {
      console.error('Error:', error);
      setSolution('문제를 해결하는 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
      setInputText('');
      setImage(null);
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">시험 문제 풀이</h2>
      
      <div className="mb-6">
        <textarea
          className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={6}
          placeholder="문제를 텍스트로 입력하거나, 클립보드에서 이미지를 붙여넣으세요 (Ctrl+V)"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onPaste={handlePaste}
        />
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">
          {isDragActive
            ? '이미지를 여기에 놓으세요'
            : '이미지를 드래그하거나 클릭하여 업로드하세요'}
        </p>
        {image && (
          <p className="mt-2 text-sm text-gray-500">
            선택된 파일: {image.name}
          </p>
        )}
      </div>

      <button
        className="w-full mt-6 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
        onClick={handleSubmit}
        disabled={loading || (!inputText && !image)}
      >
        {loading ? '해결 중...' : '문제 풀기'}
      </button>

      {solution && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">해설</h3>
          <div className="prose [&_strong]:text-red-600 [&_strong]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2">
            <ReactMarkdown>{solution}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemSolver; 