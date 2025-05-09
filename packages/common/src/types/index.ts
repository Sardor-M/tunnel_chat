export type User = {
  id: string;
  username: string;
  password?: string;
  lastLogin?: Date;
  email?: string;
  createdAt?: Date;
};

export type Message = {
  id: string;
  content: string;
  senderId: string;
  roomId: string;
  createdAt: Date;
};

export type Room = {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};
