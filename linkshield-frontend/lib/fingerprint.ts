import FingerprintJS from '@fingerprintjs/fingerprintjs';
 
export async function getVisitorId(): Promise<string> {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  return result.visitorId;
} 