import { describe, expect, it } from "vitest";
import { CreateUserUseCase } from "../src/application/use-cases/CreateUserUseCase";

describe("CreateUserUseCase", () => {
  it("creates a user", () => {
    expect(new CreateUserUseCase().execute("a@example.com").email).toBe("a@example.com");
  });
});
