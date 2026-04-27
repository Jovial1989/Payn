import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

/// Opens provider URLs in SFSafariViewController (iOS) or Chrome Custom Tab
/// (Android), keeping the user inside the Payn session rather than leaving
/// to the system browser.
///
/// Usage:
///   final result = await LinkHandlerService.open(uri, context: context);
///   if (!result.success) { /* show error */ }
///
/// iOS tint colour note:
///   SFSafariViewController bar/control tint colours are not exposed by the
///   current url_launcher API. To apply PaynColors.background / accent as
///   the bar tints, add flutter_custom_tabs (https://pub.dev/packages/
///   flutter_custom_tabs) and use CustomTabsLaunchParams.safariViewControllerOptions.
abstract final class LinkHandlerService {

  /// Opens [uri] in an in-app browser and returns the result.
  ///
  /// Strategy (in order):
  ///   1. In-app browser view (SFSafariViewController / Chrome Custom Tab)
  ///   2. System browser fallback
  ///   3. Clipboard copy as last resort
  static Future<LinkResult> open(
    Uri uri, {
    required BuildContext context,
  }) async {
    // Upgrade http → https; reject anything else.
    final secureUri =
        uri.scheme == 'http' ? uri.replace(scheme: 'https') : uri;

    if (secureUri.scheme != 'https') {
      return LinkResult._err(
        uri: secureUri,
        message: 'Only secure provider links can be opened from Payn.',
      );
    }

    // Verify the device can resolve the URL before trying to open it.
    final canOpen = await canLaunchUrl(secureUri);
    if (!canOpen) {
      return LinkResult._err(
        uri: secureUri,
        message: 'This provider link could not be verified. Please try again.',
      );
    }

    // ── Primary: in-app browser ───────────────────────────────────────────
    // LaunchMode.inAppBrowserView maps to:
    //   iOS  → SFSafariViewController  (Apple-approved, "Done" button included,
    //                                   full JS + cookies, no popup-blocker risk)
    //   Android → Chrome Custom Tab    (shares cookies/session with Chrome)
    try {
      final launched = await launchUrl(
        secureUri,
        mode: LaunchMode.inAppBrowserView,
        browserConfiguration: const BrowserConfiguration(showTitle: true),
      );
      if (launched) return LinkResult._ok(uri: secureUri);
    } catch (_) {
      // In-app view unavailable (e.g. simulator without Safari) — fall through.
    }

    // ── Fallback: system browser ──────────────────────────────────────────
    try {
      final external = await launchUrl(
        secureUri,
        mode: LaunchMode.externalApplication,
      );
      if (external) return LinkResult._ok(uri: secureUri, usedFallback: true);
    } catch (_) {}

    // ── Last resort: clipboard ────────────────────────────────────────────
    await Clipboard.setData(ClipboardData(text: secureUri.toString()));
    return LinkResult._err(
      uri: secureUri,
      message: 'Could not open automatically. '
          'The link has been copied to your clipboard.',
      copiedToClipboard: true,
    );
  }
}

// ── Result type ───────────────────────────────────────────────────────────────

class LinkResult {
  const LinkResult._ok({required this.uri, this.usedFallback = false})
      : success = true,
        message = null,
        copiedToClipboard = false;

  const LinkResult._err({
    required this.uri,
    required this.message,
    this.copiedToClipboard = false,
  })  : success = false,
        usedFallback = false;

  final bool success;
  final Uri uri;
  final String? message;

  /// True when the system browser was used instead of the in-app view.
  final bool usedFallback;

  /// True when the URL was copied to clipboard as a last resort.
  final bool copiedToClipboard;
}
