#!/bin/bash
# Deploy to iPhone (24) bypassing Xcode "Preparing" state
# Usage: ./deploy_device.sh [--debug]
# Default: release (debug builds require flutter run and can't launch standalone)

set -e

DEVICE_UDID="00008140-001928400A40801C"
BUNDLE_ID="online.payn.paynMobile"
DEVICECTL="/Library/Developer/PrivateFrameworks/CoreDevice.framework/Versions/A/Resources/bin/devicectl"
MODE="release"
APP_PATH="build/ios/iphoneos/Runner.app"

if [[ "$1" == "--debug" ]]; then
  MODE="debug"
fi

echo "▶ Building ($MODE)..."
flutter build ios --$MODE

echo "▶ Installing on device..."
"$DEVICECTL" device install app \
  --device "$DEVICE_UDID" \
  "$APP_PATH" 2>&1 | grep -v "Failed to load provisioning"

echo "▶ Launching..."
"$DEVICECTL" device process launch \
  --device "$DEVICE_UDID" \
  "$BUNDLE_ID" 2>&1 | grep -v "Failed to load provisioning"

echo "✓ Done — Payn is running on iPhone (24)"
