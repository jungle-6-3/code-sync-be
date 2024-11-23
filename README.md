# code-sync-be

code-sync be 레파지토리입니다.

## 프로젝트 전체에 대한 설명

[Code Sync](https://github.com/jungle-6-3)

## 파일구조

```
├── src
│   ├── auth
│   │   └── ...
│   ├── conversation-datas
│   │   └── ...
│   ├── conversations
│   │       └── ...
│   ├── users
│   │   └── ...
│   ├── conversation-events
│   │   └── ...
│   ├── rooms
│   │   └── ...
│   ├── open-ai
│   │   └── ....
│   ├── yjs
│   │   └── ...
│   ├── utils
│   │   └── ...
│   ├── app.module.ts
│   └── main.ts
└── test
```

### 폴더 및 domain 설명

- auth: 로그인 정책
- conversation-datas, conversations: 코드 리뷰 기록 관련 DB 
- users: 유저 관련 DB 
- conversation-events: 코드 리뷰 관련 WebSocket 이벤트
- rooms: 코드 리뷰 대화 방 상태 관리
- open-ai: 음성 채팅 요약 관련 OpenAI API 관리
- yjs: 서버 동시 편집 참여 관련 API 관리


## 사용하고 있는 라이브러리

- [socket.io](https://socket.io/)
- [y-js](https://github.com/yjs/yjs)
- [openai](https://github.com/openai/openai-node)
