import https from "https";
import http from "http";
import type { IncomingMessage } from "http";
import { URL } from "url";
import { ApiError } from "./api-error";

const GOOGLE_MAPS_HOSTS = new Set([
  "google.com",
  "google.co.in",
  "maps.google.com",
  "www.google.com",
  "maps.google.co.in",
  "www.google.co.in",
  "goo.gl",
  "maps.app.goo.gl",
]);

export function parseCoordinates(
  url: string
): { latitude: number; longitude: number } | null {
  try { url = decodeURIComponent(url); } catch { return null; }
  const patterns: RegExp[] = [
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /[?&](?:query|q|ll|cbll)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /\/place\/(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        return { latitude: lat, longitude: lng };
      }
    }
  }

  return null;
}

function isGoogleMapsUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.toLowerCase();
    return ["https:", "http:"].includes(parsed.protocol) && !parsed.username && !parsed.password && !parsed.port && GOOGLE_MAPS_HOSTS.has(host);
  } catch {
    return false;
  }
}

async function followRedirects(
  urlStr: string,
  maxRedirects = 6
): Promise<string> {
  let currentUrl = urlStr;

  for (let i = 0; i < maxRedirects; i++) {
    if (!isGoogleMapsUrl(currentUrl)) throw ApiError.badRequest("The link redirected outside Google Maps.");
    let parsed: URL;
    try {
      parsed = new URL(currentUrl);
    } catch {
      break;
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      break;
    }

    const client = parsed.protocol === "https:" ? https : http;

    const response = await new Promise<IncomingMessage>((resolve, reject) => {
      const req = client.get(
        currentUrl,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; PinProof/1.0)",
          },
        },
        (res) => {
          req.destroy();
          resolve(res);
        }
      );
      req.on("error", reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error("Request timeout following redirect"));
      });
    });

    const { statusCode, headers } = response;
    if (statusCode !== undefined && statusCode >= 300 && statusCode < 400 && headers.location) {
      currentUrl = new URL(headers.location, currentUrl).toString();
    } else {
      break;
    }
  }

  return currentUrl;
}

export async function resolveGoogleMapsUrl(
  url: string
): Promise<{ latitude: number; longitude: number }> {
  if (!isGoogleMapsUrl(url)) {
    throw ApiError.badRequest(
      "Invalid URL. Only Google Maps links are supported."
    );
  }

  const direct = parseCoordinates(url);
  if (direct) return direct;

  let resolvedUrl: string;
  try {
    resolvedUrl = await followRedirects(url);
  } catch {
    throw ApiError.badRequest(
      "Unable to resolve Google Maps link. Verify the URL is publicly accessible."
    );
  }

  const fromRedirect = parseCoordinates(resolvedUrl);
  if (!fromRedirect) {
    throw ApiError.badRequest(
      "Could not extract coordinates from the provided Google Maps link."
    );
  }

  return fromRedirect;
}
