export type User = {
  id: string;
  email: string;
};

export function createUser(email: string): User {
  return { id: "user_1", email };
}
