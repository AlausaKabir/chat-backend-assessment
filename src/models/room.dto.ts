export interface CreateRoomDto {
  name: string;
  isPrivate: boolean;
}

export interface JoinRoomDto {
  roomId: number;
  inviteCode?: string;
}
