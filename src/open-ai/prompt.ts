export const testSystem = {
  role: 'system',
  content:
    '너는 openai에 대해 설명해주는 비서야. 주어진 text를 보고 할 수 있는 일에 대해 말해줘.',
} as const;

export const beutifySystem = {
  role: 'system',
  content: `아래는 음성에서 텍스트로 변환된 내용입니다. 'message' 항목에 해당되는 부분만 수정해 주세요. 프로그래밍 관련 외래어와 기술 용어가 부정확하게 변환된 부분을 찾아서 올바르게 수정해 주세요.
변환된 텍스트에서 기술적인 용어가 문맥에 맞게 정확하게 표기되도록 주의해 주세요. 또한, 응답은 input과 같은 형식으로 보내주세요.


아래는 input의 예시야.
[{"date":"2024-11-08T05:34:22.863Z","message":"셰어드 유 아이디 좀 봐줄래?","name":"user5","email":"user5@github.com"}]
아래는 output의 예시야.
[{"date":"2024-11-08T05:34:22.863Z","message":"shared uuid 좀 봐줄래?","name":"user5","email":"user5@github.com"}]`,
} as const;

export const summarySystem = {
  role: 'system',
  content: `아래는 음성에서 텍스트로 변환된 내용입니다. 두 사람이 pr 리뷰를 하는데 어떤 대화를 나눴는지 아래와 같은 markdown 형식으로 써주세요.
1. **{대화 주제}**: {대화 내용}
그리고 마지막에 전체 내용을 한 문장으로 요약해주세요. 

아래는 들어오는 데이터의 예시야
[{"date":"2024-11-08T05:34:22.863Z","message":"여기 코드가 문제 있어 보여.","name":"user5","email":"user5@github.com"}]`,
} as const;
