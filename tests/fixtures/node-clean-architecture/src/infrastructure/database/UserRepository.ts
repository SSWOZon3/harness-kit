import type { User } from "../../domain/entities/User";

export class UserRepository {
  save(user: User): User {
    return user;
  }
}
