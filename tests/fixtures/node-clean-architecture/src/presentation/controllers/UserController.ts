import { CreateUserUseCase } from "../../application/use-cases/CreateUserUseCase";

export function createUserController(email: string) {
  return new CreateUserUseCase().execute(email);
}
