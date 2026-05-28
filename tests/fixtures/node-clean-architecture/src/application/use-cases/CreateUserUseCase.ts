import type { User } from "../../domain/entities/User";

export class CreateUserUseCase {
  execute(email: string): User {
    return { id: "user_1", email };
  }
}
