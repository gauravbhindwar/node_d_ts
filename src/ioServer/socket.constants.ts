export enum socketEvents {
	CONNECTION = 'connection',
	DISCONNECT = 'disconnect',
	JOIN_ROOM = 'join-room',
	READ_MESSAGE = 'readMessage',
	SEND_MESSAGE = 'send-message',
	JOIN_QUIZ_ASSIGNMENT_EXAM = 'join-quiz-assignment-exam',
	SUBMIT_ANSWER = 'submit-answer',
	USER_ACTIVE = 'user-active',
	USER_INACTIVE = 'user-inactive',
	LEAVE_QUIZ_ASSIGNMENT_EXAM = 'leave-quiz-assignment-exam',
}

export enum events {
	CONNECT = 'connect',
	ADMIN_CHANNEL = 'admin-channel',
	GET_CHAT_MESSAGE_FOR_ROOM = 'getChatMessageForRoom',
	GET_CHAT_MESSAGE_FOR_ADMIN_ROOM = 'getChatMessageForAdminRoom',
	QUIZ_ASSIGNMENT_EXAM = 'quiz-assignment-exam',
	SUBMIT_ANSWER = 'submit-answer',
}


