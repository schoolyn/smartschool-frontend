import { describe, it, expect, beforeEach } from "vitest";
import type { InternalAxiosRequestConfig } from "axios";
import apiClient from "./api-client";

const refuse = (config: InternalAxiosRequestConfig) =>
  Promise.reject({
    config,
    isAxiosError: true,
    response: {
      status: 403,
      statusText: "Forbidden",
      headers: {},
      config,
      data: { Status: "failure", Error: { message: "You don't have permission to create resources", name: "AuthorizationError", code: "EX-00303" } },
    },
  });

describe("api-client 403 handling", () => {
  beforeEach(() => {
    Object.defineProperty(window, "location", { value: { href: "/start" }, writable: true });
  });

  it("sends a refused page load (GET) to the access-denied page", async () => {
    await expect(apiClient.get("/something", { adapter: refuse })).rejects.toBeTruthy();
    expect(window.location.href).toBe("/not-access");
  });

  it("keeps a refused action (POST) on the current page and rejects with the server's message", async () => {
    await expect(apiClient.post("/something", {}, { adapter: refuse })).rejects.toMatchObject({
      response: { Error: { message: "You don't have permission to create resources" } },
    });
    expect(window.location.href).toBe("/start");
  });
});
