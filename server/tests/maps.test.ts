import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCoordinates, resolveGoogleMapsUrl } from "../src/utils/url-resolver";

test("Maps links use the property pin rather than the viewport and support shared query URLs", async () => {
  assert.deepEqual(parseCoordinates("https://www.google.com/maps/place/plot/@13,78,15z/data=!3d12.97!4d77.64"), { latitude: 12.97, longitude: 77.64 });
  assert.deepEqual(await resolveGoogleMapsUrl("https://www.google.com/maps/search/?api=1&query=12%2C77"), { latitude: 12, longitude: 77 });
  assert.equal(parseCoordinates("https://maps.google.com/?q=999,77"), null);
  assert.equal(parseCoordinates("https://maps.google.com/?q=%invalid"), null);
  await assert.rejects(resolveGoogleMapsUrl("https://not-google.example/?q=12,77"), /Only Google Maps/);
  await assert.rejects(resolveGoogleMapsUrl("file://www.google.com/maps/@12,77"), /Only Google Maps/);
  await assert.rejects(resolveGoogleMapsUrl("https://www.google.com:8443/maps/@12,77"), /Only Google Maps/);
});
