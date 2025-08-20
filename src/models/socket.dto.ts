export interface CreateMessageDto {
  content: string;
  roomId: number;
}

export interface JoinRoomSocketDto {
  roomId: number;
  token: string;
}

export interface SendMessageSocketDto {
  roomId: number;
  content: string;
}

export interface TypingDto {
  roomId: number;
  isTyping: boolean;
}
