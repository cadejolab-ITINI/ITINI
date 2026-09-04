// On web, a denied permission must be changed in the browser even when Expo
// reports canAskAgain=true. Native OSes decide whether another prompt is allowed.
export function needsLocationSettings(permission: { status: string; canAskAgain: boolean }, platform: string) {
  return permission.status === 'denied' && (platform === 'web' || !permission.canAskAgain);
}
