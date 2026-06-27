// 보안 점검용 주석:
// 1. 프론트엔드에 API 키를 넣으면 개발자 도구에서 노출될 수 있으므로, Gemini API 호출은 Vercel Serverless Function에서 처리합니다.
// 2. Gemini API 호출을 처리하는 이 파일(/api/gemini-counseling.js)은 서버에서 실행되므로 API 키가 안전하게 은폐됩니다.
// 3. API 키가 설정되는 .env 파일은 GitHub에 올리지 않고 로컬에서만 사용합니다.
// 4. Vercel 배포 시에는 Project Settings의 Environment Variables에 GEMINI_API_KEY를 등록하여 사용합니다.
// 5. Gemini로 전송하는 데이터는 이름, 학번, 사진 경로, 비밀번호를 제외한 최소 정보(가명, 성적 요약, 학습 특성, 교사 고민)로 제한하여 개인정보를 철저히 보호합니다.

export default async function handler(req, res) {
  // 1. POST 요청만 허용
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // 2. 요청 body에서 데이터 추출
  const { studentAlias, gradeSummary, learningTraits, teacherConcern } = req.body || {};

  // 3. 필수 값 검증
  if (!studentAlias || !gradeSummary || !learningTraits || !teacherConcern) {
    return res.status(400).json({
      success: false,
      error: '필수 데이터(studentAlias, gradeSummary, learningTraits, teacherConcern)가 누락되었습니다.'
    });
  }

  // 4. API Key 확인
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: 'GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.'
    });
  }

  // 5. Gemini 시스템 지침 및 프롬프트 생성
  const systemInstruction = 
    `당신은 전문적이고 따뜻한 교육 상담사입니다. 교사가 학생의 상황을 깊이 이해하고 건설적인 상담을 나눌 수 있도록 조언합니다.
다음 원칙을 철저히 지키십시오:
1. 학생을 단정적으로 판단하거나 진단하지 마십시오.
2. "의지가 부족하다", "주의력 문제가 있다", "심리적 문제가 있다" 등 원인을 단정 짓는 표현은 절대 피하십시오.
3. 교사가 학생을 다각도로 이해하고 공감하며 대화할 수 있도록 돕는 구체적인 방향으로 제안하십시오.
4. AI의 제안은 참고용이며, 최종 판단은 교사가 상황을 고려하여 결정해야 함을 인지하고 조언을 작성하십시오.

답변은 반드시 다음 6가지 형식을 포함하여 한국어로 답변해 주세요:
1. 현재 상황 요약
2. 학생 데이터 기반 해석
3. 상담 접근 전략
4. 교사가 던질 수 있는 질문 3개
5. 피해야 할 말 또는 주의점
6. 다음 수업에서 해볼 수 있는 작은 지원`;

  const prompt = `
[대상 학생 정보]
- 가명: ${studentAlias}
- 성적 요약: ${gradeSummary}
- 학습 특성 요약: ${learningTraits}

[교사의 상담 고민]
- 내용: ${teacherConcern}

위 정보를 바탕으로 전문적인 상담 전략을 생성해 주세요.
`;

  try {
    // 6. Gemini REST API 호출 (gemini-2.5-pro 모델 사용)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemInstruction}\n\n${prompt}` }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error Response:', data);
      return res.status(response.status).json({
        success: false,
        error: data.error?.message || 'Gemini API 호출 중 문제가 발생했습니다.'
      });
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API로부터 올바른 텍스트 응답을 받지 못했습니다.'
      });
    }

    // 7. 성공 결과 반환
    return res.status(200).json({ success: true, result: resultText });
  } catch (error) {
    console.error('API Server Error:', error);
    return res.status(500).json({
      success: false,
      error: `서버 내부 오류가 발생했습니다: ${error.message}`
    });
  }
}
