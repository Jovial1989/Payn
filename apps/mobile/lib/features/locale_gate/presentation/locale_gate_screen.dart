import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/localization/app_localizations_ext.dart';
import 'package:payn_mobile/core/localization/supported_languages.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';
import 'package:payn_mobile/shared/services/analytics_service.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';
import 'package:payn_mobile/shared/widgets/analytics_view_tracker.dart';
import 'package:payn_mobile/shared/widgets/payn_mark.dart';
import 'package:payn_mobile/shared/widgets/selection_bottom_sheet.dart';

class LocaleGateScreen extends StatefulWidget {
  const LocaleGateScreen({super.key});

  @override
  State<LocaleGateScreen> createState() => _LocaleGateScreenState();
}

class _LocaleGateScreenState extends State<LocaleGateScreen> {
  PaynMarket? _selectedMarket;
  _AppLanguage? _selectedLanguage;
  bool _initialized = false;

  bool get _ready => _selectedMarket != null && _selectedLanguage != null;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_initialized) {
      return;
    }

    final controller = AppScope.of(context);
    _selectedMarket = controller.preferences.market;
    _selectedLanguage = _languageForCode(controller.preferences.languageCode);
    _initialized = true;
  }

  Future<void> _handleContinue() async {
    if (!_ready) return;
    HapticFeedback.mediumImpact();
    final controller = AppScope.of(context);
    await controller.completeLocaleGate(
      market: _selectedMarket!,
      language: _selectedLanguage!.code,
    );
    if (!mounted) return;
    context.go('/home');
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;
    final selectedMarketValue = _selectedMarket?.localizedLabel(l10n);
    final selectedMarketFlag =
        _selectedMarket != null ? _flagForMarket(_selectedMarket!) : null;
    String? selectedLanguageValue;
    String? selectedLanguageFlag;
    final selectedLanguage = _selectedLanguage;
    if (selectedLanguage != null) {
      selectedLanguageValue =
          selectedLanguage.native.toLowerCase() ==
                  selectedLanguage.localizedLabel(l10n).toLowerCase()
              // Collapse "English — English" → "English" (P2.12 parity).
              ? selectedLanguage.native
              : '${selectedLanguage.native} — ${selectedLanguage.localizedLabel(l10n)}';
      selectedLanguageFlag =
          selectedLanguage.flag.isNotEmpty ? selectedLanguage.flag : null;
    }

    return Scaffold(
      backgroundColor: PaynColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              AnalyticsViewTracker(
                viewKey: 'locale-gate-view',
                onTrack: () {
                  final controller = AppScope.of(context);
                  return controller.analytics.track(
                    AnalyticsEvents.onboardingRegionModalViewed,
                    properties: controller.analytics.buildDefaultProperties(
                      preferences: controller.preferences,
                      loggedIn: controller.isAuthenticated,
                    ),
                  );
                },
              ),
              const SizedBox(height: 40),

              // Logo mark
              Row(
                children: <Widget>[
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: PaynColors.text,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    alignment: Alignment.center,
                    child: const PaynMark(size: 14, strokeWidth: 2.2),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    l10n.appTitle,
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 48),

              Text(
                l10n.localeGateTitle,
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  letterSpacing: -0.6,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                l10n.localeGateSubtitle,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: PaynColors.textSecondary,
                  height: 1.55,
                ),
              ),

              const SizedBox(height: 40),

              // Region selector
              _SelectorField(
                label: l10n.localeGateRegion,
                hint: l10n.localeGateSelectCountry,
                value: selectedMarketValue,
                leadingEmoji: selectedMarketFlag,
                onTap: () => _showMarketPicker(context),
              ),

              const SizedBox(height: 12),

              // Language selector
              _SelectorField(
                label: l10n.localeGateLanguage,
                hint: l10n.localeGateSelectLanguage,
                value: selectedLanguageValue,
                leadingEmoji: selectedLanguageFlag,
                onTap: () => _showLanguagePicker(context),
              ),

              const Spacer(),

              // Helper text
              Text(
                l10n.localeGateSettingsHint,
                textAlign: TextAlign.center,
                style: theme.textTheme.labelMedium?.copyWith(
                  color: PaynColors.textTertiary,
                ),
              ),

              const SizedBox(height: 12),

              // Continue button
              SizedBox(
                width: double.infinity,
                height: 54,
                child: FilledButton(
                  onPressed: _ready ? _handleContinue : null,
                  style: FilledButton.styleFrom(
                    backgroundColor: PaynColors.text,
                    disabledBackgroundColor: PaynColors.outline,
                    foregroundColor: PaynColors.surface,
                    disabledForegroundColor: PaynColors.textTertiary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    textStyle: theme.textTheme.labelLarge?.copyWith(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  child: Text(l10n.localeGateContinue),
                ),
              ),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  String _flagForMarket(PaynMarket market) {
    return _supportedMarkets
        .firstWhere(
          (e) => e.market == market,
          orElse: () => _MarketEntry(
            market: market,
            flag: '🇪🇺',
          ),
        )
        .flag;
  }

  void _showMarketPicker(BuildContext context) {
    final controller = AppScope.of(context);
    showPaynSelectionBottomSheet<PaynMarket>(
      context: context,
      title: context.l10n.localeGateSelectCountry,
      options:
          controller.availableMarkets.map((market) {
            return SelectionSheetOption<PaynMarket>(
              value: market,
              leading: _flagForMarket(market),
              label: market.localizedLabel(context.l10n),
              selected: _selectedMarket == market,
            );
          }).toList(),
      onSelected: (market) {
        HapticFeedback.selectionClick();
        unawaited(
          controller.analytics.track(
            AnalyticsEvents.regionSelected,
            properties: controller.analytics.buildDefaultProperties(
              preferences: controller.preferences,
              loggedIn: controller.isAuthenticated,
              country: market.name,
              language:
                  _selectedLanguage?.code ??
                  controller.preferences.languageCode,
            ),
          ),
        );
        setState(() => _selectedMarket = market);
      },
    );
  }

  void _showLanguagePicker(BuildContext context) {
    final controller = AppScope.of(context);
    showPaynSelectionBottomSheet<_AppLanguage>(
      context: context,
      title: context.l10n.localeGateSelectLanguage,
      options:
          controller.availableLanguages.map((item) {
            final language =
                _languageForCode(item.code) ??
                _AppLanguage(code: item.code, native: item.native, flag: '');
            return SelectionSheetOption<_AppLanguage>(
              value: language,
              leading: language.flag,
              label:
                  language.native.toLowerCase() ==
                          language.localizedLabel(context.l10n).toLowerCase()
                      // Collapse "English — English" → "English" (P2.12 parity).
                      ? language.native
                      : '${language.native} — ${language.localizedLabel(context.l10n)}',
              selected: _selectedLanguage?.code == language.code,
            );
          }).toList(),
      onSelected: (language) async {
        HapticFeedback.selectionClick();
        unawaited(
          controller.analytics.track(
            AnalyticsEvents.languageSelected,
            properties: controller.analytics.buildDefaultProperties(
              preferences: controller.preferences,
              loggedIn: controller.isAuthenticated,
              country:
                  _selectedMarket?.name ?? controller.preferences.market.name,
              language: language.code,
            ),
          ),
        );
        setState(() => _selectedLanguage = language);
        await controller.setLocale(language.code);
      },
    );
  }
}

// ─────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────

class _MarketEntry {
  const _MarketEntry({required this.market, required this.flag});
  final PaynMarket market;
  final String flag;
}

const _supportedMarkets = <_MarketEntry>[
  _MarketEntry(market: PaynMarket.de, flag: '🇩🇪'),
  _MarketEntry(market: PaynMarket.es, flag: '🇪🇸'),
  _MarketEntry(market: PaynMarket.it, flag: '🇮🇹'),
  _MarketEntry(market: PaynMarket.fr, flag: '🇫🇷'),
  _MarketEntry(market: PaynMarket.uk, flag: '🇬🇧'),
  _MarketEntry(market: PaynMarket.nl, flag: '🇳🇱'),
  _MarketEntry(market: PaynMarket.pt, flag: '🇵🇹'),
  _MarketEntry(market: PaynMarket.eu, flag: '🇪🇺'),
];

class _AppLanguage {
  const _AppLanguage({
    required this.code,
    required this.native,
    required this.flag,
  });
  final String code;
  final String native;
  final String flag;

  String localizedLabel(dynamic l10n) {
    switch (code) {
      case 'de':
        return l10n.localeGerman;
      case 'es':
        return l10n.localeSpanish;
      case 'fr':
        return l10n.localeFrench;
      case 'it':
        return l10n.localeItalian;
      case 'pt':
        return l10n.localePortuguese;
      case 'en':
      default:
        return l10n.localeEnglish;
    }
  }
}

final List<_AppLanguage> _languages = supportedLanguageOptions
    .map(
      (language) => _AppLanguage(
        code: language.code,
        native: language.native,
        flag: language.flag ?? '',
      ),
    )
    .toList(growable: false);

_AppLanguage? _languageForCode(String code) {
  final normalized = normalizeSupportedLanguageCode(code);
  return _languages
      .where((language) => language.code == normalized)
      .firstOrNull;
}

// ─────────────────────────────────────────────────
// Selector field widget
// ─────────────────────────────────────────────────

class _SelectorField extends StatelessWidget {
  const _SelectorField({
    required this.label,
    required this.hint,
    required this.value,
    required this.onTap,
    this.leadingEmoji,
  });
  final String label;
  final String hint;
  final String? value;
  final String? leadingEmoji;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final hasValue = value != null;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        splashColor: PaynColors.accent.withValues(alpha: 0.05),
        highlightColor: PaynColors.accent.withValues(alpha: 0.03),
        child: Ink(
          decoration: BoxDecoration(
            color: PaynColors.surface,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: hasValue ? PaynColors.outline : PaynColors.outlineSubtle,
              width: 1,
            ),
            boxShadow: const <BoxShadow>[
              BoxShadow(
                color: Color(0x06000000),
                blurRadius: 8,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              children: <Widget>[
                // Flag bubble when a value is selected
                if (hasValue && leadingEmoji != null) ...<Widget>[
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: PaynColors.surfaceRaised,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      leadingEmoji!,
                      style: const TextStyle(fontSize: 18, height: 1),
                    ),
                  ),
                  const SizedBox(width: 12),
                ],
                // Label + hint/value stacked
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      Text(
                        label,
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: hasValue
                              ? PaynColors.textTertiary
                              : PaynColors.textTertiary,
                          letterSpacing: 0.2,
                          fontWeight: FontWeight.w500,
                          fontSize: 11,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        value ?? hint,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: hasValue
                              ? PaynColors.text
                              : PaynColors.textTertiary,
                          fontWeight:
                              hasValue ? FontWeight.w500 : FontWeight.w400,
                        ),
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Icon(
                  Icons.unfold_more_rounded,
                  size: 18,
                  color: PaynColors.textTertiary,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
