import { test } from "node:test";
import assert from "node:assert/strict";
import { ApiError, readApiResponse } from "../src/services/api-response.ts";

test("preserves successful JSON and server validation messages", async () => {
  const payload = { success: true, data: { expiresIn: 300 } };
  assert.deepEqual(await readApiResponse(Response.json(payload)), payload);
  await assert.rejects(
    readApiResponse(Response.json({ message: "Incorrect code. 4 attempts left." }, { status: 401 })),
    (error: unknown) => error instanceof ApiError && error.response.status === 401 &&
      error.response.data.message === "Incorrect code. 4 attempts left."
  );
});

test("empty, HTML, truncated and null error bodies have safe status-aware errors", async () => {
  for (const body of ["", "<html>upstream failed</html>", '{"message":', "null", '{"message":42}']) {
    await assert.rejects(
      readApiResponse(new Response(body, { status: 502 })),
      (error: unknown) => error instanceof ApiError && error.response.status === 502 &&
        error.message === "The service is temporarily unavailable. Please try again shortly."
    );
  }
});

test("no-content succeeds but an empty or malformed 200 is not treated as success", async () => {
  for (const status of [204, 205]) {
    assert.equal(await readApiResponse(new Response(null, { status })), undefined);
  }
  for (const body of ["", " ", "<html>Vite fallback</html>", "null", "false", '{"data":']) {
    await assert.rejects(readApiResponse(new Response(body)), /server returned an invalid response/);
  }
});

test("an interrupted error response does not leak a stream exception", async () => {
  const stream = new ReadableStream({ start(controller) { controller.error(new Error("connection reset")); } });
  await assert.rejects(readApiResponse(new Response(stream, { status: 503 })), /service is temporarily unavailable/);
});
