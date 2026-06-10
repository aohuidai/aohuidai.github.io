import assert from "node:assert/strict";
import { test } from "node:test";
import { SITE } from "../config.ts";

test("site disables dynamic OG generation to keep builds offline friendly", () => {
  assert.equal(SITE.dynamicOgImage, false);
  assert.equal(SITE.ogImage, "astropaper-og.jpg");
});
