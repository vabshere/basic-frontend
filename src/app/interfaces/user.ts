export interface LocalUser {
  name: string;
  age: number;
  profilePic?: string;
}

export interface NewUser extends LocalUser {
  password: string;
  confirmPass: string;
}
