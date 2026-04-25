import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';
import 'package:payn_mobile/shared/services/analytics_service.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';
import 'package:url_launcher/url_launcher.dart';

class ProviderBrand {
  const ProviderBrand({
    required this.mark,
    required this.background,
    required this.foreground,
  });

  final String mark;
  final Color background;
  final Color foreground;
}

const Map<String, ProviderBrand> _providerBrands = <String, ProviderBrand>{
  'Revolut': ProviderBrand(
    mark: 'R',
    background: Color(0xFF191C1F),
    foreground: Colors.white,
  ),
  'Wise': ProviderBrand(
    mark: 'W',
    background: Color(0xFF9FE870),
    foreground: Color(0xFF163300),
  ),
  'N26': ProviderBrand(
    mark: 'N',
    background: Color(0xFF36A18B),
    foreground: Colors.white,
  ),
  'Klarna': ProviderBrand(
    mark: 'K',
    background: Color(0xFFFFB3C7),
    foreground: Color(0xFF17120F),
  ),
  'bunq': ProviderBrand(
    mark: 'b',
    background: Color(0xFF00B7A8),
    foreground: Colors.white,
  ),
  'Curve': ProviderBrand(
    mark: 'C',
    background: Color(0xFF12123B),
    foreground: Colors.white,
  ),
  'Santander': ProviderBrand(
    mark: 'S',
    background: Color(0xFFEC0000),
    foreground: Colors.white,
  ),
  'ING': ProviderBrand(
    mark: 'ING',
    background: Color(0xFFFF6200),
    foreground: Colors.white,
  ),
  'Allianz': ProviderBrand(
    mark: 'AZ',
    background: Color(0xFF003781),
    foreground: Colors.white,
  ),
  'AXA': ProviderBrand(
    mark: 'AXA',
    background: Color(0xFF0C1C8C),
    foreground: Colors.white,
  ),
  'SafetyWing': ProviderBrand(
    mark: 'SW',
    background: Color(0xFF1D4ED8),
    foreground: Colors.white,
  ),
  'Trade Republic': ProviderBrand(
    mark: 'TR',
    background: Color(0xFF101010),
    foreground: Colors.white,
  ),
  'Scalable Capital': ProviderBrand(
    mark: 'SC',
    background: Color(0xFF1D3B6A),
    foreground: Colors.white,
  ),
  'eToro': ProviderBrand(
    mark: 'ET',
    background: Color(0xFF6CC24A),
    foreground: Color(0xFF0B1307),
  ),
};

const ProviderBrand _fallbackBrand = ProviderBrand(
  mark: '?',
  background: Color(0xFF6B7280),
  foreground: Colors.white,
);

ProviderBrand providerBrandFor(String providerName, String fallbackMark) {
  final brand = _providerBrands[providerName];
  if (brand != null) {
    return brand;
  }

  return ProviderBrand(
    mark: fallbackMark,
    background: _fallbackBrand.background,
    foreground: _fallbackBrand.foreground,
  );
}

class ProviderBadge extends StatelessWidget {
  const ProviderBadge({
    super.key,
    required this.offer,
    this.compact = false,
    this.size,
  });

  final PaynOffer offer;
  final bool compact;
  final double? size;

  @override
  Widget build(BuildContext context) {
    final brand = providerBrandFor(offer.providerName, offer.providerMark);
    final dimension = size ?? (compact ? 38.0 : 48.0);

    return Container(
      width: dimension,
      height: dimension,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(compact ? 14 : 16),
        color: const Color(0xFFF4F6F4),
        border: Border.all(color: PaynColors.outlineSubtle),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: Colors.black.withValues(alpha: compact ? 0.05 : 0.06),
            blurRadius: compact ? 10 : 16,
            offset: Offset(0, compact ? 4 : 8),
          ),
        ],
      ),
      alignment: Alignment.center,
      child: Container(
        width: dimension - 8,
        height: dimension - 8,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(compact ? 12 : 14),
          color: brand.background,
        ),
        alignment: Alignment.center,
        child: Text(
          brand.mark,
          style: Theme.of(context).textTheme.labelLarge?.copyWith(
            color: brand.foreground,
            fontWeight: FontWeight.w800,
            fontSize: compact ? 12 : 14,
          ),
        ),
      ),
    );
  }
}

Future<void> showProviderHandoffSheet(
  BuildContext context, {
  required PaynOffer offer,
}) {
  final controller = AppScope.of(context);
  final trackedUri = _buildTrackedProviderUri(
    offer: offer,
    marketName: controller.preferences.market.name,
  );

  HapticFeedback.mediumImpact();
  unawaited(
    controller.analytics.track(
      AnalyticsEvents.providerClicked,
      properties: controller.analytics.buildDefaultProperties(
        preferences: controller.preferences,
        loggedIn: controller.isAuthenticated,
        category: offer.category,
        offerId: offer.id,
        provider: offer.providerName,
      ),
    ),
  );
  return showDialog<void>(
    context: context,
    barrierDismissible: false,
    builder:
        (dialogContext) => _ProviderRedirectOverlay(
          providerName: offer.providerName,
          uri: trackedUri,
        ),
  );
}

class ExternalRedirectResult {
  const ExternalRedirectResult({
    required this.success,
    required this.uri,
    this.error,
  });

  final bool success;
  final Uri? uri;
  final String? error;
}

Uri? _buildTrackedProviderUri({
  required PaynOffer offer,
  required String marketName,
}) {
  final rawUrl =
      offer.affiliateLink.trim().isNotEmpty
          ? offer.affiliateLink
          : offer.providerWebsiteUrl;
  final uri = Uri.tryParse(rawUrl);

  if (uri == null || !(uri.scheme == 'https' || uri.scheme == 'http')) {
    return null;
  }

  final normalizedUri =
      uri.scheme == 'http' ? uri.replace(scheme: 'https') : uri;

  return normalizedUri.replace(
    queryParameters: <String, String>{
      ...normalizedUri.queryParameters,
      'utm_source': 'payn_app',
      'utm_medium': 'mobile_handoff',
      'utm_campaign': offer.category.name,
      'aff_offer_id': offer.id,
      'aff_provider': offer.providerName,
      'aff_market': marketName,
    },
  );
}

Future<ExternalRedirectResult> handleExternalRedirect(Uri? rawUri) async {
  if (rawUri == null) {
    return const ExternalRedirectResult(
      success: false,
      uri: null,
      error: 'We could not validate this provider link.',
    );
  }

  final uri = rawUri.scheme == 'http' ? rawUri.replace(scheme: 'https') : rawUri;
  if (uri.scheme != 'https') {
    return ExternalRedirectResult(
      success: false,
      uri: uri,
      error: 'Only secure https partner links can be opened from Payn.',
    );
  }

  final canOpen = await canLaunchUrl(uri);
  if (!canOpen) {
    return ExternalRedirectResult(
      success: false,
      uri: uri,
      error: 'This provider link could not be opened automatically.',
    );
  }

  final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
  if (!launched) {
    return ExternalRedirectResult(
      success: false,
      uri: uri,
      error: 'Automatic redirect failed. You can retry or open it manually.',
    );
  }

  return ExternalRedirectResult(success: true, uri: uri);
}

class _ProviderRedirectOverlay extends StatefulWidget {
  const _ProviderRedirectOverlay({
    required this.providerName,
    required this.uri,
  });

  final String providerName;
  final Uri? uri;

  @override
  State<_ProviderRedirectOverlay> createState() =>
      _ProviderRedirectOverlayState();
}

class _ProviderRedirectOverlayState extends State<_ProviderRedirectOverlay> {
  bool _showFallback = false;
  bool _launching = true;
  String? _error;
  bool _copied = false;
  Timer? _fallbackTimer;

  @override
  void initState() {
    super.initState();
    unawaited(_launchProvider());
  }

  @override
  void dispose() {
    _fallbackTimer?.cancel();
    super.dispose();
  }

  Future<void> _launchProvider() async {
    _fallbackTimer?.cancel();
      if (mounted) {
        setState(() {
          _launching = true;
          _showFallback = false;
          _error = null;
          _copied = false;
        });
      }

    _fallbackTimer = Timer(const Duration(seconds: 3), () {
      if (mounted && _launching) {
        setState(() {
          _showFallback = true;
          _error = 'The provider page is taking longer than expected.';
        });
      }
    });

    await Future<void>.delayed(const Duration(milliseconds: 1500));

    final result = await handleExternalRedirect(widget.uri);

    if (!mounted) {
      return;
    }

    if (result.success) {
      _fallbackTimer?.cancel();
      Navigator.of(context).pop();
      return;
    }

    final uri = result.uri;
    if (uri == null) {
      if (!mounted) return;
      setState(() {
        _launching = false;
        _showFallback = true;
        _error = result.error ?? 'We could not validate this provider link.';
      });
      return;
    }

    setState(() {
      _launching = false;
      _showFallback = true;
      _error =
          result.error ?? 'Automatic redirect failed. You can retry or open it manually.';
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return PopScope(
      canPop: !_launching,
      child: Dialog.fullscreen(
        backgroundColor: PaynColors.background,
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(24, 28, 24, 28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: PaynColors.text,
                    borderRadius: BorderRadius.circular(22),
                  ),
                  child: const Icon(
                    Icons.lock_outline_rounded,
                    color: Colors.white,
                    size: 28,
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'Opening ${widget.providerName}...',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontSize: 26,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Securely redirecting you to the provider.',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: PaynColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: PaynColors.surface,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: PaynColors.outlineSubtle),
                  ),
                  child: Row(
                    children: <Widget>[
                      SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.4,
                          color: PaynColors.accent,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Text(
                          _showFallback
                              ? (_error ??
                                  'Use the backup link below to continue.')
                              : 'Opening partner page...',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: PaynColors.text,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                if (_showFallback) ...<Widget>[
                  const SizedBox(height: 22),
                  FilledButton(
                    onPressed: _launching ? null : () => unawaited(_launchProvider()),
                    child: const Text('Retry redirect'),
                  ),
                  const SizedBox(height: 10),
                  OutlinedButton(
                    onPressed: widget.uri == null ? null : _openManualLink,
                    child: const Text('Open in browser'),
                  ),
                  const SizedBox(height: 10),
                  OutlinedButton(
                    onPressed: widget.uri == null ? null : _copyLink,
                    child: Text(_copied ? 'Link copied' : 'Copy link'),
                  ),
                  const SizedBox(height: 10),
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text('Back to Payn'),
                  ),
                ],
                const Spacer(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _openManualLink() async {
    final navigator = Navigator.of(context);
    final result = await handleExternalRedirect(widget.uri);
    if (result.success && mounted) {
      navigator.pop();
      return;
    }
    if (!mounted) return;
    setState(() {
      _showFallback = true;
      _launching = false;
      _error = result.error ?? _error;
    });
  }

  Future<void> _copyLink() async {
    final uri = widget.uri;
    if (uri == null) return;
    await Clipboard.setData(ClipboardData(text: uri.toString()));
    if (!mounted) return;
    setState(() => _copied = true);
  }
}
