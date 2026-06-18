import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

/// Opens provider URLs from an explicit user action while preserving the
/// original affiliate/tracking URL.
///
/// Usage:
///   final result = await LinkHandlerService.openInApp(uri, messages: messages);
///   if (!result.success) { /* show error */ }
abstract final class LinkHandlerService {
  /// Opens [uri] in the in-app browser where the platform supports it.
  static Future<LinkResult> openInApp(
    Uri uri, {
    required LinkHandlerMessages messages,
  }) async {
    return _open(uri, messages: messages, mode: LaunchMode.inAppBrowserView);
  }

  /// Fallback for cases where the in-app browser cannot be opened.
  static Future<LinkResult> openExternal(
    Uri uri, {
    required LinkHandlerMessages messages,
  }) async {
    return _open(uri, messages: messages, mode: LaunchMode.externalApplication);
  }

  static Future<LinkResult> _open(
    Uri uri, {
    required LinkHandlerMessages messages,
    required LaunchMode mode,
  }) async {
    if (uri.scheme != 'https' && uri.scheme != 'http') {
      return LinkResult._err(uri: uri, message: messages.linkUnavailable);
    }

    // Verify the device can resolve the URL before trying to open it.
    final canOpen = await canLaunchUrl(uri);
    if (!canOpen) {
      return LinkResult._err(
        uri: uri,
        message: messages.linkUnavailableSnackbar,
      );
    }

    try {
      final opened = await launchUrl(uri, mode: mode);
      if (opened) {
        return LinkResult._ok(
          uri: uri,
          usedFallback: mode == LaunchMode.externalApplication,
        );
      }
    } catch (_) {}

    // ── Last resort: clipboard ────────────────────────────────────────────
    await Clipboard.setData(ClipboardData(text: uri.toString()));
    return LinkResult._err(
      uri: uri,
      message: messages.linkCopied,
      copiedToClipboard: true,
    );
  }
}

class LinkHandlerMessages {
  const LinkHandlerMessages({
    required this.linkUnavailable,
    required this.linkUnavailableSnackbar,
    required this.linkCopied,
  });

  final String linkUnavailable;
  final String linkUnavailableSnackbar;
  final String linkCopied;
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
  }) : success = false,
       usedFallback = false;

  /// MOB.14 — Public error factory for callers that catch a
  /// platform-channel exception above the service layer and need to
  /// synthesize a LinkResult to drive their UI. Internally identical
  /// to `_err`; only exposed publicly so trust-modal-style consumers
  /// can keep their error-path single-source-of-truth.
  factory LinkResult.error({required Uri uri, required String message}) =>
      LinkResult._err(uri: uri, message: message);

  final bool success;
  final Uri uri;
  final String? message;

  /// True when a non-primary fallback path was used.
  final bool usedFallback;

  /// True when the URL was copied to clipboard as a last resort.
  final bool copiedToClipboard;
}
