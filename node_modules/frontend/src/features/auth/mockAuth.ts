import { type Role } from "../../lib/roleConfig";

export function mockLogin(role: Role): { token: string; role: Role } {
  return {
    token: `mock-token-${role.toLowerCase()}`,
    role,
  };
}