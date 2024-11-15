import { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';

export function testPromt(
  text: string,
): ChatCompletionCreateParamsNonStreaming {
  return {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          '너는 openai에 대해 설명해주는 비서야. 주어진 text를 보고 할 수 있는 일에 대해 말해줘.',
      },
      { role: 'user', content: text },
    ],
  };
}

export function beauifyPrompt(
  text: string,
): ChatCompletionCreateParamsNonStreaming {
  return {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: [
          {
            type: 'text',
            text: '당신은 문맥을 보고 코딩 용어나 변수명을 잘 파악하는 비서입니다. 다음은 PR 리뷰를 하면서 생성된 음성에서 텍스트로 변환된 내용입니다. 아래 규칙에 따라서 변환해주세요.\n1. \'message\' 항목에 해당되는 부분만 수정해 주세요.\n2. 문제가 있는 message만 결과에 포함되게 해주세요.\n3. 변환된 텍스트에서 기술적인 용어가 문맥에 맞게 정확하게 표기되도록 주의해 주세요. 특히,  프로그래밍 관련 외래어와 기술 용어가 부정확하게 변환된 부분을 찾아서 올바르게 수정해 주세요.\n4. 결과를 표시할 때, 오직 date, message, email만 포함시켜 주세요.\n5. 오직 결과만 출력해주세요.\n\n아래는 입력의 예시입니다.\n[{"date":"2024-11-08T05:34:22.863Z","message":"피알 좀 날려줄래?","name":"user5","email":"user5@github.com"}]\n아래는 출력의 예시입니다.\n[{"date":"2024-11-08T05:34:22.863Z","message":"PR 좀 날려줄래?","email":"user5@github.com"}]',
          },
        ],
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: '[{"date":"2024-11-08T05:34:22.863Z","message":"안녕 코드 리뷰 시작할게","name":"user5","email":"user5@github.com"},{"date":"2024-11-08T05:34:31.779Z","message":"예 알겠습니다","name":"user7","email":"user7@github.com"},{"date":"2024-11-08T05:34:43.574Z","message":"여기 리조트는 어떻게 해서 나왔니?","name":"user5","email":"user5@github.com"},{"date":"2024-11-08T05:35:12.980Z","message":"음 그냥 플롯해서 나왔어요","name":"user7","email":"user7@github.com"},{"date":"2024-11-08T05:35:41.374Z","message":"뭔가 여기 코드는 좀 더 디벨하면 좋을 것 같은데","name":"user5","email":"user5@github.com"},{"date":"2024-11-08T05:35:56.690Z","message":"구체적으로 어떻게 디벨하면 되나요?","name":"user7","email":"user7@github.com"},{"date":"2024-11-08T05:36:17.568Z","message":"한 번 스테이터스 디자인 패턴을 써봐","name":"user5","email":"user5@github.com"},{"date":"2024-11-08T05:36:28.439Z","message":"관련 링크는 여기 있어","name":"user5","email":"user5@github.com"},{"date":"2024-11-08T05:36:34.672Z","message":"옙 감사합니다","name":"user7","email":"user7@github.com"}]',
          },
        ],
      },
      {
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: '[{"date":"2024-11-08T05:34:43.574Z","message":"여기 result는 어떻게 해서 나왔니?","email":"user5@github.com"},{"date":"2024-11-08T05:35:12.980Z","message":"음 그냥 flot해서 나왔어요","email":"user7@github.com"},{"date":"2024-11-08T05:35:41.374Z","message":"뭔가 여기 코드는 좀 더 develop하면 좋을 것 같은데","email":"user5@github.com"},{"date":"2024-11-08T05:35:56.690Z","message":"구체적으로 어떻게 develop하면 되나요?","email":"user7@github.com"},{"date":"2024-11-08T05:36:17.568Z","message":"한 번 status design pattern을 써봐","email":"user5@github.com"}]',
          },
        ],
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: text,
          },
        ],
      },
    ],
    temperature: 1,
    max_tokens: 4096,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    response_format: {
      type: 'text',
    },
  };
}

export function summaryPromt(
  text: string,
): ChatCompletionCreateParamsNonStreaming {
  return {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: [
          {
            type: 'text',
            text: '당신은 코드 리뷰를 할 때 나누는 대화에 대해 잘 아는 비서입니다. 아래는 코드 리뷰를 하면서 오간 음성에서 텍스트로 변환된 내용입니다. 두 사람이 pr 리뷰를 하는데 어떤 대화를 나눴는지 아래와 같은 markdown 형식으로 써주세요.\n1. **{대화 주제}**: {대화 주제에 대한 셜명}\n\n**전체 요약**\n{전체 내용에 대한 요약}\n또한, 요약 시 아래 규칙을 지켜주세요.\n1. \'대화 주제\'는 주로 리뷰어가 지적한 사항 위주로 요약해주세요.\n2. \'대화 주제에 대한 셜명\'은 리뷰어가 지적한 사항에 대한 설명과 해결책 위주로 설명해주세요.\n3. 코드 리뷰와 관련 없는 주제는 위 규칙을 따를 필요가 없어요.\n4. \'전체 내용에 대한 요약\'에는 전체 내용을 한 문장으로 요약해주세요.\n5. markdown 형식으로 오직 결과만 출력해주세요.\n\n아래는 들어오는 데이터의 예시에요.\\n[{"date":"2024-11-08T05:34:22.863Z","message":"여기 코드가 문제 있어 보여.","name":"user5","email":"user5@github.com"}]',
          },
        ],
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: text,
          },
        ],
      },
    ],
    temperature: 1,
    max_tokens: 2048,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    response_format: {
      type: 'text',
    },
  };
}
