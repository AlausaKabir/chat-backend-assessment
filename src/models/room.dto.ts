export interface CreateRoomDto {
  name: string;
  isPrivate?: boolean;
}

export interface JoinRoomDto {
  inviteCode: string;
}
