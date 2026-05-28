import { describe, expect, it } from "vitest";
import { createUser } from "../src/index";

describe("createUser", () => {
  it("creates a user", () => {
    expect(createUser("a@example.com").email).toBe("a@example.com");
  });
});
