import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:payn_mobile/core/localization/app_localizations_ext.dart';
import 'package:payn_mobile/core/constants/marketplace_constants.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/constants/known_provider_logos.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';
import 'package:payn_mobile/shared/services/analytics_service.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';
import 'package:payn_mobile/shared/services/link_handler_service.dart';
import 'package:payn_mobile/shared/widgets/payn_motion.dart';

// Where to fetch provider PNGs from — matches the web origin so we
// reuse the same /logos/{slug}.png assets the web Atlas serves.
const String _kLogoOrigin = 'https://www.payn.online';

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

// Palette for deterministic colour assignment when a provider has no
// curated brand mapping AND no bundled logo. Picked from the design
// system's neutral-but-distinctive range so 30+ unknown providers in
// the same list don't all blur into grey. Each colour is paired with a
// foreground that meets ≥4.5:1 contrast against it.
const List<ProviderBrand> _fallbackPalette = <ProviderBrand>[
  ProviderBrand(mark: '', background: Color(0xFF0F8A4B), foreground: Colors.white),       // emerald
  ProviderBrand(mark: '', background: Color(0xFF1D3B6A), foreground: Colors.white),       // deep navy
  ProviderBrand(mark: '', background: Color(0xFFB45309), foreground: Colors.white),       // amber-700
  ProviderBrand(mark: '', background: Color(0xFF7C2D92), foreground: Colors.white),       // plum
  ProviderBrand(mark: '', background: Color(0xFF1F5F8B), foreground: Colors.white),       // sky
  ProviderBrand(mark: '', background: Color(0xFF374151), foreground: Colors.white),       // graphite
  ProviderBrand(mark: '', background: Color(0xFFC2410C), foreground: Colors.white),       // burnt orange
  ProviderBrand(mark: '', background: Color(0xFF0E7C66), foreground: Colors.white),       // teal
  ProviderBrand(mark: '', background: Color(0xFF4F46E5), foreground: Colors.white),       // indigo
  ProviderBrand(mark: '', background: Color(0xFF991B1B), foreground: Colors.white),       // dark red
  ProviderBrand(mark: '', background: Color(0xFF075985), foreground: Colors.white),       // cobalt
  ProviderBrand(mark: '', background: Color(0xFF65A30D), foreground: Colors.white),       // moss
];

// Deterministic hash → palette index. Same provider name always maps to
// the same colour across app launches and devices, so the user sees a
// stable visual identity even when no logo asset is available.
int _stableHash(String input) {
  var hash = 0;
  for (final code in input.codeUnits) {
    hash = (hash * 31 + code) & 0x7fffffff;
  }
  return hash;
}

ProviderBrand providerBrandFor(String providerName, String fallbackMark) {
  final brand = _providerBrands[providerName];
  if (brand != null) {
    return brand;
  }

  // Pick a stable colour from the fallback palette. Looks like an
  // intentional brand chip instead of "missing asset grey". The mark
  // (1-3 letters) still comes from the offer's providerMark field.
  final paletteEntry = _fallbackPalette[
      _stableHash(providerName) % _fallbackPalette.length];
  return ProviderBrand(
    mark: fallbackMark,
    background: paletteEntry.background,
    foreground: paletteEntry.foreground,
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
    final innerRadius = compact ? 12.0 : 14.0;
    final logoUrl = providerLogoUrl(offer.providerName, origin: _kLogoOrigin);

    // Letter chip used as a placeholder while the PNG loads and as the
    // fallback when no logo is bundled for this provider.
    final letterChip = Container(
      width: dimension - 8,
      height: dimension - 8,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(innerRadius),
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
    );

    Widget innerContent;
    if (logoUrl == null) {
      innerContent = letterChip;
    } else {
      innerContent = ClipRRect(
        borderRadius: BorderRadius.circular(innerRadius),
        child: Container(
          width: dimension - 8,
          height: dimension - 8,
          color: Colors.white,
          child: Padding(
            padding: EdgeInsets.all(compact ? 4 : 5),
            child: Image.network(
              logoUrl,
              fit: BoxFit.contain,
              filterQuality: FilterQuality.medium,
              errorBuilder: (_, __, ___) => letterChip,
              loadingBuilder: (context, child, progress) {
                if (progress == null) return child;
                return letterChip;
              },
            ),
          ),
        ),
      );
    }

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
      child: innerContent,
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
    market: controller.preferences.market,
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

  if (!context.mounted) return;
  final reduceMotion = PaynMotion.reduce(context);
  await showModalBottomSheet<void>(
    context: context,
    useRootNavigator: true,
    isScrollControlled: true,
    useSafeArea: true,
    backgroundColor: Colors.transparent,
    barrierColor: Colors.black.withValues(alpha: 0.24),
    clipBehavior: Clip.none,
    sheetAnimationStyle: AnimationStyle(
      duration: reduceMotion ? Duration.zero : PaynMotion.sheet,
      reverseDuration: reduceMotion ? Duration.zero : PaynMotion.medium,
      curve: PaynMotion.ease,
      reverseCurve: Curves.easeInCubic,
    ),
    builder:
        (_) => _ProviderHandoffSheet(
          providerName: offer.providerName,
          uri: trackedUri,
        ),
  );
}

Uri? _buildTrackedProviderUri({
  required PaynOffer offer,
  required PaynMarket market,
}) {
  final marketCode = marketDefinitions[market]?.marketCode.toUpperCase();
  final rawUrl =
      marketCode != null &&
              offer.providerUrls[marketCode]?.trim().isNotEmpty == true
          ? offer.providerUrls[marketCode]!
          : offer.affiliateLink.trim().isNotEmpty
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

class _ProviderHandoffSheet extends StatefulWidget {
  const _ProviderHandoffSheet({required this.providerName, required this.uri});

  final String providerName;
  final Uri? uri;

  @override
  State<_ProviderHandoffSheet> createState() => _ProviderHandoffSheetState();
}

class _ProviderHandoffSheetState extends State<_ProviderHandoffSheet> {
  // MOB.14 — Was a "menu" sheet with a manual "Open" button. Now a
  // trust-transition: as soon as the sheet appears, a 1.5s emerald
  // ring spins under a lock icon while the copy reads "Securely
  // connecting you to <provider>…". After the dwell the redirect
  // auto-fires. We never ask the user to click again — they already
  // committed when they tapped the offer's CTA. The intermediate
  // beat is purely for trust, not a confirmation gate.
  bool _launching = true;
  bool _showBrowserFallback = false;
  String? _error;
  Timer? _autoLaunchTimer;

  static const Duration _trustDelay = Duration(milliseconds: 1500);

  @override
  void initState() {
    super.initState();
    _scheduleAutoLaunch();
  }

  @override
  void dispose() {
    _autoLaunchTimer?.cancel();
    super.dispose();
  }

  void _scheduleAutoLaunch() {
    _autoLaunchTimer?.cancel();
    _autoLaunchTimer = Timer(_trustDelay, () {
      if (mounted) _launchProvider(externalFallback: false);
    });
  }

  Future<void> _launchProvider({required bool externalFallback}) async {
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
        _showBrowserFallback = false;
      });
      return;
    }

    // Snapshot copy strings up-front so we never touch BuildContext
    // across the async gap of launchUrl. The lint here is about iOS
    // backgrounding the widget tree mid-call — having the strings
    // already in hand sidesteps that whole class of bug.
    final messages = LinkHandlerMessages(
      linkUnavailable: context.l10n.providerLinkUnavailable,
      linkUnavailableSnackbar: context.l10n.providerLinkUnavailableSnackbar,
      linkCopied: context.l10n.providerLinkCopied,
    );
    final fallbackMessage = context.l10n.providerLinkUnavailable;

    // Belt and suspenders. `LinkHandlerService` already catches
    // exceptions internally and returns a `LinkResult.err`, but a
    // higher-level try/catch protects against any platform-channel
    // crash (e.g. url_launcher missing on a stripped build) so the
    // UI always gets a usable LinkResult instead of an unhandled
    // exception that would leave the trust modal stuck.
    LinkResult result;
    try {
      result = externalFallback
          ? await LinkHandlerService.openExternal(uri, messages: messages)
          : await LinkHandlerService.openInApp(uri, messages: messages);
    } catch (e) {
      result = LinkResult.error(uri: uri, message: fallbackMessage);
    }

    if (!mounted) return;

    if (result.success) {
      Navigator.of(context).pop();
      return;
    }

    final l10n = context.l10n;
    setState(() {
      _launching = false;
      _showBrowserFallback = !externalFallback;
      _error = result.copiedToClipboard
          ? l10n.providerLinkCopied
          : (result.message ?? l10n.providerLinkUnavailable);
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;

    final bottomPadding = MediaQuery.paddingOf(context).bottom + 24;

    return DecoratedBox(
      decoration: const BoxDecoration(
        color: PaynColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: Color(0x1F000000),
            blurRadius: 28,
            offset: Offset(0, -8),
          ),
        ],
      ),
      child: Padding(
        padding: EdgeInsets.fromLTRB(20, 12, 20, bottomPadding),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Center(
              child: Container(
                width: 44,
                height: 5,
                decoration: BoxDecoration(
                  color: PaynColors.outline,
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
            ),
            const SizedBox(height: 18),
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
                        l10n.providerOpeningTitle(widget.providerName),
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
            // MOB.14 — Trust message. While the auto-launch timer is
            // running we show a calm "Securely connecting…" line + the
            // padlock glyph; if the launch fails we flip to the
            // recovery copy + a retry / external-browser fallback.
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
              decoration: BoxDecoration(
                color: _error == null
                    ? PaynColors.accentSurface
                    : PaynColors.surfaceDim,
                borderRadius: BorderRadius.circular(18),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Icon(
                    _error == null
                        ? Icons.lock_rounded
                        : Icons.error_outline_rounded,
                    size: 18,
                    color: _error == null
                        ? PaynColors.accent
                        : PaynColors.text,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      _error ??
                          (_launching
                              ? l10n.providerOpeningMessage
                              : l10n.providerDisclosure),
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: _error == null
                            ? PaynColors.accentStrong
                            : PaynColors.text,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),
            // MOB.14 — Button row reshapes by state:
            //   • Launching (initial trust wait): single full-width
            //     "Cancel" outlined button. We are NOT asking the user
            //     to re-confirm — they tapped the offer's CTA, that's
            //     the commit. Cancel is an escape hatch.
            //   • Errored: retry FilledButton + Cancel outlined.
            //     Browser-fallback link appears below if the in-app
            //     view failed.
            if (_error == null)
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () {
                    _autoLaunchTimer?.cancel();
                    Navigator.of(context).pop();
                  },
                  child: Text(l10n.providerBackButton),
                ),
              )
            else
              Row(
                children: <Widget>[
                  Expanded(
                    child: FilledButton(
                      onPressed: widget.uri == null
                          ? null
                          : () => _launchProvider(externalFallback: false),
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
            if (_showBrowserFallback) ...<Widget>[
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: _launching || widget.uri == null
                      ? null
                      : () => _launchProvider(externalFallback: true),
                  child: Text(l10n.providerFallbackBrowserButton),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
