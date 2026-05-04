import 'dart:async';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:payn_mobile/core/localization/app_localizations_ext.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';
import 'package:payn_mobile/shared/services/analytics_service.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';
import 'package:payn_mobile/shared/services/link_handler_service.dart';

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
  'Kraken': ProviderBrand(
    mark: 'K',
    background: Color(0xFF5B5DE8),
    foreground: Colors.white,
  ),
  'Iuvo Group': ProviderBrand(
    mark: 'IV',
    background: Color(0xFF1266CC),
    foreground: Colors.white,
  ),
  'Trezor': ProviderBrand(
    mark: 'TZ',
    background: Color(0xFF0F172A),
    foreground: Colors.white,
  ),
  'Linxea': ProviderBrand(
    mark: 'LX',
    background: Color(0xFF0E7C66),
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
    this.heroTag,
  });

  final PaynOffer offer;
  final bool compact;
  final double? size;
  final Object? heroTag;

  @override
  Widget build(BuildContext context) {
    final brand = providerBrandFor(offer.providerName, offer.providerMark);
    final dimension = size ?? (compact ? 38.0 : 48.0);

    final badge = Container(
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

    if (heroTag == null) {
      return badge;
    }

    return Hero(
      tag: heroTag!,
      flightShuttleBuilder: (
        context,
        animation,
        flightDirection,
        fromContext,
        toContext,
      ) {
        return ScaleTransition(
          scale: animation.drive(Tween<double>(begin: 0.96, end: 1)),
          child: badge,
        );
      },
      child: badge,
    );
  }
}

Future<void> showProviderHandoffSheet(
  BuildContext context, {
  required PaynOffer offer,
}) async {
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

  if (trackedUri == null) {
    final l10n = context.l10n;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(l10n.providerLinkUnavailableSnackbar)),
    );
    return;
  }

  final result = await LinkHandlerService.open(trackedUri, context: context);
  if (!context.mounted || result.success) {
    return;
  }

  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(
        result.copiedToClipboard
            ? context.l10n.providerLinkCopied
            : (result.message ?? context.l10n.providerLinkUnavailableSnackbar),
      ),
    ),
  );
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
  return normalizedUri;
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
  bool _launching = true;
  String? _error;
  Timer? _autoCloseTimer;

  @override
  void initState() {
    super.initState();
    unawaited(_launchProvider());
  }

  @override
  void dispose() {
    _autoCloseTimer?.cancel();
    super.dispose();
  }

  Future<void> _launchProvider() async {
    _autoCloseTimer?.cancel();
    if (mounted) {
      setState(() {
        _launching = true;
        _error = null;
      });
    }

    final uri = widget.uri;
    if (uri == null) {
      if (!mounted) return;
      final msg = context.l10n.providerLinkUnavailable;
      setState(() {
        _launching = false;
        _error = msg;
      });
      return;
    }

    final result = await LinkHandlerService.open(uri, context: context);

    if (!mounted) return;

    if (result.success) {
      _autoCloseTimer = Timer(const Duration(milliseconds: 420), () {
        if (mounted) Navigator.of(context).pop();
      });
      return;
    }

    final l10n = context.l10n;
    setState(() {
      _launching = false;
      _error =
          result.copiedToClipboard
              ? l10n.providerLinkCopied
              : (result.message ?? l10n.providerLinkUnavailable);
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;

    return PopScope(
      canPop: true,
      child: Dialog.fullscreen(
        backgroundColor: Colors.transparent,
        child: Stack(
          children: <Widget>[
            Positioned.fill(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
                child: Container(color: Colors.black.withValues(alpha: 0.22)),
              ),
            ),
            Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 360),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 24),
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: PaynColors.surface,
                    borderRadius: BorderRadius.circular(28),
                    border: Border.all(color: PaynColors.outlineSubtle),
                    boxShadow: <BoxShadow>[
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.16),
                        blurRadius: 40,
                        offset: const Offset(0, 18),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Row(
                        children: <Widget>[
                          Stack(
                            alignment: Alignment.center,
                            children: <Widget>[
                              SizedBox(
                                width: 56,
                                height: 56,
                                child: CircularProgressIndicator(
                                  value: _launching ? null : 1,
                                  strokeWidth: 2.4,
                                  color: PaynColors.accent,
                                  backgroundColor: PaynColors.accentSurface,
                                ),
                              ),
                              Container(
                                width: 42,
                                height: 42,
                                decoration: BoxDecoration(
                                  color: PaynColors.text,
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                alignment: Alignment.center,
                                child: Text(
                                  widget.providerName.isNotEmpty
                                      ? widget.providerName[0].toUpperCase()
                                      : '?',
                                  style: theme.textTheme.labelLarge?.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Text(
                                  l10n.providerOpeningTitle(
                                    widget.providerName,
                                  ),
                                  style: theme.textTheme.titleLarge?.copyWith(
                                    fontSize: 22,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  l10n.providerLeavingDescription,
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    color: PaynColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 12,
                        ),
                        decoration: BoxDecoration(
                          color: PaynColors.surfaceDim,
                          borderRadius: BorderRadius.circular(18),
                        ),
                        child: Text(
                          _error ??
                              (_launching
                                  ? l10n.providerOpeningMessage
                                  : l10n.providerManualMessage),
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: PaynColors.text,
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),
                      Row(
                        children: <Widget>[
                          Expanded(
                            child: FilledButton(
                              onPressed:
                                  widget.uri == null ? null : _openManualLink,
                              child: Text(l10n.providerOpenButton),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => Navigator.of(context).pop(),
                              child: Text(l10n.providerBackButton),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _openManualLink() async {
    final uri = widget.uri;
    if (uri == null) return;
    final navigator = Navigator.of(context);
    final result = await LinkHandlerService.open(uri, context: context);
    if (result.success && mounted) {
      navigator.pop();
      return;
    }
    if (!mounted) return;
    setState(() {
      _launching = false;
      _error = result.message ?? _error;
    });
  }
}
