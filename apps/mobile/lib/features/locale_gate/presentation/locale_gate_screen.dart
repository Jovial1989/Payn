import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';
import 'package:payn_mobile/shared/services/analytics_service.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';
import 'package:payn_mobile/shared/widgets/analytics_view_tracker.dart';
import 'package:payn_mobile/shared/widgets/payn_mark.dart';

class LocaleGateScreen extends StatefulWidget {
  const LocaleGateScreen({super.key});

  @override
  State<LocaleGateScreen> createState() => _LocaleGateScreenState();
}

class _LocaleGateScreenState extends State<LocaleGateScreen> {
  PaynMarket? _selectedMarket;
  _AppLanguage? _selectedLanguage;

  bool get _ready => _selectedMarket != null && _selectedLanguage != null;

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
                    'Payn',
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
                'Choose your market\nand language',
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  letterSpacing: -0.6,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'Set your region and language to start with the right product experience.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: PaynColors.textSecondary,
                  height: 1.55,
                ),
              ),

              const SizedBox(height: 40),

              // Region selector
              _SelectorField(
                label: 'Region',
                hint: 'Select your country',
                value:
                    _selectedMarket == null
                        ? null
                        : _marketLabel(_selectedMarket!),
                onTap: () => _showMarketPicker(context),
              ),

              const SizedBox(height: 16),

              // Language selector
              _SelectorField(
                label: 'Language',
                hint: 'Select a language',
                value:
                    _selectedLanguage == null
                        ? null
                        : '${_selectedLanguage!.native} — ${_selectedLanguage!.label}',
                onTap: () => _showLanguagePicker(context),
              ),

              const Spacer(),

              // Helper text
              Text(
                'You can change this at any time from your profile.',
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
                  child: const Text('Continue'),
                ),
              ),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  void _showMarketPicker(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: PaynColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return _PickerSheet(
          title: 'Select your country',
          items:
              _supportedMarkets.map((entry) {
                return _PickerItem(
                  value: entry.market,
                  flag: entry.flag,
                  label: entry.label,
                  selected: _selectedMarket == entry.market,
                );
              }).toList(),
          onSelect: (value) {
            HapticFeedback.selectionClick();
            final market = value as PaynMarket;
            final controller = AppScope.of(context);
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
            Navigator.of(ctx).pop();
          },
        );
      },
    );
  }

  void _showLanguagePicker(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: PaynColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return _PickerSheet(
          title: 'Select a language',
          items:
              _languages.map((lang) {
                return _PickerItem(
                  value: lang,
                  flag: lang.flag,
                  label: '${lang.native} — ${lang.label}',
                  selected: _selectedLanguage == lang,
                );
              }).toList(),
          onSelect: (value) {
            HapticFeedback.selectionClick();
            final language = value as _AppLanguage;
            final controller = AppScope.of(context);
            unawaited(
              controller.analytics.track(
                AnalyticsEvents.languageSelected,
                properties: controller.analytics.buildDefaultProperties(
                  preferences: controller.preferences,
                  loggedIn: controller.isAuthenticated,
                  country:
                      _selectedMarket?.name ??
                      controller.preferences.market.name,
                  language: language.code,
                ),
              ),
            );
            setState(() => _selectedLanguage = language);
            Navigator.of(ctx).pop();
          },
        );
      },
    );
  }
}

// ─────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────

class _MarketEntry {
  const _MarketEntry({
    required this.market,
    required this.flag,
    required this.label,
  });
  final PaynMarket market;
  final String flag;
  final String label;
}

const _supportedMarkets = <_MarketEntry>[
  _MarketEntry(market: PaynMarket.de, flag: '🇩🇪', label: 'Germany'),
  _MarketEntry(market: PaynMarket.es, flag: '🇪🇸', label: 'Spain'),
  _MarketEntry(market: PaynMarket.it, flag: '🇮🇹', label: 'Italy'),
  _MarketEntry(market: PaynMarket.fr, flag: '🇫🇷', label: 'France'),
  _MarketEntry(market: PaynMarket.uk, flag: '🇬🇧', label: 'United Kingdom'),
  _MarketEntry(market: PaynMarket.nl, flag: '🇳🇱', label: 'Netherlands'),
  _MarketEntry(market: PaynMarket.pt, flag: '🇵🇹', label: 'Portugal'),
  _MarketEntry(market: PaynMarket.eu, flag: '🇪🇺', label: 'All Europe'),
  _MarketEntry(
    market: PaynMarket.international,
    flag: '🌍',
    label: 'International',
  ),
];

String _marketLabel(PaynMarket market) {
  return _supportedMarkets.firstWhere((e) => e.market == market).label;
}

class _AppLanguage {
  const _AppLanguage({
    required this.code,
    required this.label,
    required this.native,
    required this.flag,
  });
  final String code;
  final String label;
  final String native;
  final String flag;
}

const _languages = <_AppLanguage>[
  _AppLanguage(code: 'en', label: 'English', native: 'English', flag: '🇬🇧'),
  _AppLanguage(code: 'de', label: 'German', native: 'Deutsch', flag: '🇩🇪'),
  _AppLanguage(code: 'es', label: 'Spanish', native: 'Español', flag: '🇪🇸'),
  _AppLanguage(code: 'fr', label: 'French', native: 'Français', flag: '🇫🇷'),
  _AppLanguage(code: 'it', label: 'Italian', native: 'Italiano', flag: '🇮🇹'),
  _AppLanguage(
    code: 'pt',
    label: 'Portuguese',
    native: 'Português',
    flag: '🇵🇹',
  ),
];

// ─────────────────────────────────────────────────
// Shared picker sheet
// ─────────────────────────────────────────────────

class _PickerItem {
  const _PickerItem({
    required this.value,
    required this.flag,
    required this.label,
    required this.selected,
  });
  final Object value;
  final String flag;
  final String label;
  final bool selected;
}

class _PickerSheet extends StatelessWidget {
  const _PickerSheet({
    required this.title,
    required this.items,
    required this.onSelect,
  });
  final String title;
  final List<_PickerItem> items;
  final void Function(Object value) onSelect;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      minChildSize: 0.4,
      maxChildSize: 0.9,
      expand: false,
      builder: (context, scrollController) {
        return Column(
          children: <Widget>[
            const SizedBox(height: 12),
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: PaynColors.outline,
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text(title, style: theme.textTheme.titleLarge),
            ),
            const SizedBox(height: 8),
            Expanded(
              child: ListView.builder(
                controller: scrollController,
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
                itemCount: items.length,
                itemBuilder: (context, index) {
                  final item = items[index];
                  return _PickerRow(
                    item: item,
                    onTap: () => onSelect(item.value),
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }
}

class _PickerRow extends StatelessWidget {
  const _PickerRow({required this.item, required this.onTap});
  final _PickerItem item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
        margin: const EdgeInsets.only(bottom: 4),
        decoration: BoxDecoration(
          color: item.selected ? PaynColors.text : PaynColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: item.selected ? PaynColors.text : PaynColors.outline,
          ),
        ),
        child: Row(
          children: <Widget>[
            Text(item.flag, style: const TextStyle(fontSize: 20)),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                item.label,
                style: theme.textTheme.labelLarge?.copyWith(
                  color: item.selected ? PaynColors.surface : PaynColors.text,
                ),
              ),
            ),
            if (item.selected)
              const Icon(
                Icons.check_rounded,
                size: 18,
                color: PaynColors.surface,
              ),
          ],
        ),
      ),
    );
  }
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
  });
  final String label;
  final String hint;
  final String? value;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final hasValue = value != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          label.toUpperCase(),
          style: theme.textTheme.labelSmall?.copyWith(
            color: PaynColors.textTertiary,
            letterSpacing: 0.9,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Container(
            height: 54,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: PaynColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color:
                    hasValue
                        ? PaynColors.text.withValues(alpha: 0.15)
                        : PaynColors.outline,
              ),
              boxShadow: <BoxShadow>[
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.03),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: <Widget>[
                Expanded(
                  child: Text(
                    value ?? hint,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color:
                          hasValue ? PaynColors.text : PaynColors.textTertiary,
                      fontWeight: hasValue ? FontWeight.w500 : FontWeight.w400,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Icon(
                  Icons.keyboard_arrow_down_rounded,
                  size: 20,
                  color: PaynColors.textTertiary,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
