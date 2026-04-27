import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/constants/marketplace_constants.dart';
import 'package:payn_mobile/core/localization/app_localizations_ext.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';
import 'package:payn_mobile/shared/services/analytics_service.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';
import 'package:payn_mobile/shared/widgets/analytics_view_tracker.dart';
import 'package:payn_mobile/shared/widgets/payn_mark.dart';
import 'package:payn_mobile/shared/widgets/payn_shell.dart';
import 'package:payn_mobile/shared/widgets/section_card.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = AppScope.of(context);
    final theme = Theme.of(context);
    final l10n = context.l10n;
    final preferences = controller.preferences;

    return SafeArea(
      bottom: false,
      child: ListView(
        padding: EdgeInsets.fromLTRB(
          20,
          16,
          20,
          PaynShell.contentBottomInset(context),
        ),
        physics: const BouncingScrollPhysics(),
        children: <Widget>[
          AnalyticsViewTracker(
            viewKey: 'settings-view',
            onTrack:
                () => controller.analytics.track(
                  AnalyticsEvents.settingsViewed,
                  properties: controller.analytics.buildDefaultProperties(
                    preferences: controller.preferences,
                    loggedIn: controller.isAuthenticated,
                  ),
                ),
          ),
          Text(l10n.profileTitle, style: theme.textTheme.headlineMedium),
          const SizedBox(height: 6),
          Text(
            l10n.profileSubtitle,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: PaynColors.textSecondary,
            ),
          ),
          const SizedBox(height: 18),
          _ProfileHero(controller: controller),
          const SizedBox(height: 16),
          SectionCard(
            title: l10n.profilePreferencesTitle,
            subtitle: l10n.profilePreferencesSubtitle,
            child: Column(
              children: <Widget>[
                _SettingRow(
                  label: l10n.profileRegion,
                  value: preferences.market.localizedLabel(l10n),
                  icon: Icons.public_rounded,
                  onTap: () => _showMarketSheet(context, controller),
                ),
                const SizedBox(height: 12),
                _SettingRow(
                  label: l10n.profileLanguage,
                  value: _languageLabel(preferences.languageCode),
                  icon: Icons.translate_rounded,
                  onTap: () => _showLanguageSheet(context, controller),
                ),
                const SizedBox(height: 12),
                _SettingRow(
                  label: l10n.profileSavedOffers,
                  value: l10n.profileSavedCount(controller.savedCount),
                  icon: Icons.bookmark_rounded,
                  onTap: () => context.go('/saved'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          SectionCard(
            title: l10n.profileInterestsTitle,
            subtitle: l10n.profileInterestsSubtitle,
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children:
                  interestLabels.entries.map((entry) {
                    final selected = preferences.interests.contains(entry.key);
                    return FilterChip(
                      selected: selected,
                      label: Text(entry.value),
                      onSelected: (_) {
                        final next = List<String>.from(preferences.interests);
                        if (selected) {
                          next.remove(entry.key);
                        } else {
                          next.add(entry.key);
                        }
                        controller.updatePreferences(
                          preferences.copyWith(interests: next),
                        );
                      },
                      selectedColor: PaynColors.accentSurfaceStrong,
                      checkmarkColor: PaynColors.accent,
                      side: const BorderSide(color: PaynColors.outlineSubtle),
                      visualDensity: VisualDensity.compact,
                    );
                  }).toList(),
            ),
          ),
          const SizedBox(height: 16),
          SectionCard(
            title: l10n.profileSecurityTitle,
            subtitle: l10n.profileSecuritySubtitle,
            child: Column(
              children: <Widget>[
                _InfoRow(
                  icon: Icons.open_in_new_rounded,
                  title: l10n.profileExternalHandoff,
                  description: l10n.profileExternalHandoffDescription,
                ),
                const SizedBox(height: 12),
                _InfoRow(
                  icon: Icons.lock_outline_rounded,
                  title: l10n.profileLocalPreferences,
                  description: l10n.profileLocalPreferencesDescription,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          SectionCard(
            title: l10n.profileAccountTitle,
            child:
                controller.isAuthenticated
                    ? FilledButton.tonalIcon(
                      onPressed: controller.signOut,
                      icon: const Icon(Icons.logout_rounded, size: 18),
                      label: Text(l10n.profileSignOut),
                    )
                    : Row(
                      children: <Widget>[
                        Expanded(
                          child: FilledButton(
                            onPressed: () {
                              unawaited(
                                controller.analytics.track(
                                  AnalyticsEvents.signInClicked,
                                  properties: controller.analytics
                                      .buildDefaultProperties(
                                        preferences: controller.preferences,
                                        loggedIn: controller.isAuthenticated,
                                      ),
                                ),
                              );
                              context.push('/auth?mode=signIn');
                            },
                            child: Text(l10n.profileLogIn),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => context.push('/auth?mode=signUp'),
                            child: Text(l10n.profileCreateAccount),
                          ),
                        ),
                      ],
                    ),
          ),
        ],
      ),
    );
  }

  Future<void> _showMarketSheet(
    BuildContext context,
    dynamic controller,
  ) async {
    final preferences = controller.preferences;
    await showModalBottomSheet<void>(
      context: context,
      useSafeArea: true,
      builder:
          (sheetContext) => _SelectionSheet<PaynMarket>(
            title: context.l10n.profileChooseRegion,
            options:
                PaynMarket.values
                    .map(
                      (market) => _SelectionOption<PaynMarket>(
                        value: market,
                        label: market.localizedLabel(context.l10n),
                        selected: preferences.market == market,
                      ),
                    )
                    .toList(),
            onSelected: (market) {
              controller.updatePreferences(
                preferences.copyWith(market: market),
              );
              Navigator.of(sheetContext).pop();
            },
          ),
    );
  }

  Future<void> _showLanguageSheet(
    BuildContext context,
    dynamic controller,
  ) async {
    final preferences = controller.preferences;
    await showModalBottomSheet<void>(
      context: context,
      useSafeArea: true,
      builder:
          (sheetContext) => _SelectionSheet<String>(
            title: context.l10n.profileChooseLanguage,
            options:
                _languages
                    .map(
                      (language) => _SelectionOption<String>(
                        value: language.code,
                        label: '${language.native} - ${language.label}',
                        selected: preferences.languageCode == language.code,
                      ),
                    )
                    .toList(),
            onSelected: (code) {
              controller.updatePreferences(
                preferences.copyWith(languageCode: code),
              );
              Navigator.of(sheetContext).pop();
            },
          ),
    );
  }

  String _languageLabel(String code) {
    final match =
        _languages.where((language) => language.code == code).firstOrNull;
    if (match == null) return code.toUpperCase();
    return '${match.native} - ${match.label}';
  }
}

class _ProfileHero extends StatelessWidget {
  const _ProfileHero({required this.controller});

  final dynamic controller;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: <Color>[Color(0xFFFFFFFF), Color(0xFFF7FBF8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(PaynRadius.panel),
        border: Border.all(color: PaynColors.outlineSubtle),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Row(
        children: <Widget>[
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              color:
                  controller.isAuthenticated
                      ? PaynColors.text
                      : PaynColors.surfaceDim,
              borderRadius: BorderRadius.circular(18),
            ),
            alignment: Alignment.center,
            child:
                controller.isAuthenticated
                    ? const Icon(
                      Icons.person_rounded,
                      color: Colors.white,
                      size: 24,
                    )
                    : const PaynMark(size: 18, strokeWidth: 2.4),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  controller.isAuthenticated
                      ? (controller.session.email ?? context.l10n.profileSignedIn)
                      : context.l10n.profileGuestMode,
                  style: theme.textTheme.titleLarge,
                ),
                const SizedBox(height: 4),
                Text(
                  controller.isAuthenticated
                      ? context.l10n.profileMarketSummary(
                        controller.preferences.market.localizedLabel(context.l10n),
                      )
                      : context.l10n.profileGuestSummary,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: PaynColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SettingRow extends StatelessWidget {
  const _SettingRow({
    required this.label,
    required this.value,
    required this.icon,
    required this.onTap,
  });

  final String label;
  final String value;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Material(
      color: PaynColors.surfaceRaised,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
          child: Row(
            children: <Widget>[
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: PaynColors.accentSurface,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, size: 18, color: PaynColors.accent),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(label, style: theme.textTheme.labelLarge),
                    const SizedBox(height: 2),
                    Text(
                      value,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: PaynColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.chevron_right_rounded,
                color: PaynColors.textTertiary,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.title,
    required this.description,
  });

  final IconData icon;
  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: PaynColors.surfaceDim,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Icon(icon, size: 18, color: PaynColors.textSecondary),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(title, style: theme.textTheme.labelLarge),
              const SizedBox(height: 4),
              Text(
                description,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: PaynColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _SelectionSheet<T> extends StatelessWidget {
  const _SelectionSheet({
    required this.title,
    required this.options,
    required this.onSelected,
  });

  final String title;
  final List<_SelectionOption<T>> options;
  final ValueChanged<T> onSelected;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(title, style: theme.textTheme.titleLarge),
          const SizedBox(height: 14),
          ...options.map(
            (option) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Material(
                color:
                    option.selected
                        ? PaynColors.accentSurface
                        : PaynColors.surfaceRaised,
                borderRadius: BorderRadius.circular(18),
                child: InkWell(
                  onTap: () => onSelected(option.value),
                  borderRadius: BorderRadius.circular(18),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 14,
                    ),
                    child: Row(
                      children: <Widget>[
                        Expanded(
                          child: Text(
                            option.label,
                            style: theme.textTheme.labelLarge,
                          ),
                        ),
                        if (option.selected)
                          const Icon(
                            Icons.check_rounded,
                            color: PaynColors.accent,
                          ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SelectionOption<T> {
  const _SelectionOption({
    required this.value,
    required this.label,
    required this.selected,
  });

  final T value;
  final String label;
  final bool selected;
}

class _LanguageOption {
  const _LanguageOption(this.code, this.label, this.native);

  final String code;
  final String label;
  final String native;
}

const List<_LanguageOption> _languages = <_LanguageOption>[
  _LanguageOption('en', 'English', 'English'),
  _LanguageOption('de', 'German', 'Deutsch'),
  _LanguageOption('es', 'Spanish', 'Espanol'),
  _LanguageOption('fr', 'French', 'Francais'),
  _LanguageOption('it', 'Italian', 'Italiano'),
  _LanguageOption('pt', 'Portuguese', 'Portugues'),
];
