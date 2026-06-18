import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/constants/marketplace_constants.dart';
import 'package:payn_mobile/core/localization/app_localizations_ext.dart';
import 'package:payn_mobile/core/localization/supported_languages.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';
import 'package:payn_mobile/shared/services/analytics_service.dart';
import 'package:payn_mobile/shared/services/app_controller.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';
import 'package:payn_mobile/shared/widgets/analytics_view_tracker.dart';
import 'package:payn_mobile/shared/widgets/payn_shell.dart';
import 'package:payn_mobile/shared/widgets/selection_bottom_sheet.dart';
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
                  value: _languageLabel(
                    normalizeSupportedLanguageCode(preferences.languageCode),
                    l10n,
                  ),
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
                    return _InterestChip(
                      label: localizedInterestLabel(entry.key, context.l10n),
                      selected: selected,
                      onTap: () {
                        final next = List<String>.from(preferences.interests);
                        if (selected) {
                          next.remove(entry.key);
                        } else {
                          next.add(entry.key);
                        }
                        controller.updatePreferences(
                          preferences.copyWith(interests: next),
                        );
                        unawaited(
                          controller.analytics.track(
                            AnalyticsEvents.interestsUpdated,
                            properties: controller.analytics.buildDefaultProperties(
                              preferences: preferences,
                              loggedIn: controller.isAuthenticated,
                              extra: <String, dynamic>{
                                'interest': entry.key,
                                'action': selected ? 'removed' : 'added',
                                'total_interests': next.length,
                              },
                            ),
                          ),
                        );
                      },
                    );
                  }).toList(),
            ),
          ),
          const SizedBox(height: 16),
          SectionCard(
            title: 'How it works',
            child: Column(
              children: const [
                _HowItWorksStep(
                  number: '1',
                  title: 'We collect offers',
                  body:
                      'Our team sources loans, cards, transfers, and exchange products from regulated European providers.',
                ),
                Padding(
                  padding: EdgeInsets.symmetric(vertical: 8),
                  child: Divider(height: 1, color: PaynColors.outlineSubtle),
                ),
                _HowItWorksStep(
                  number: '2',
                  title: 'We rank them for you',
                  body:
                      'Offers are scored by cost, product fit, and provider quality. Your market and preferences adjust the ranking.',
                ),
                Padding(
                  padding: EdgeInsets.symmetric(vertical: 8),
                  child: Divider(height: 1, color: PaynColors.outlineSubtle),
                ),
                _HowItWorksStep(
                  number: '3',
                  title: 'You compare for free',
                  body:
                      'Payn is free to use. We earn commission when you apply through us — always disclosed, never affects ranking order.',
                ),
              ],
            ),
          ),
          // P2.13 — The previous "Security" SectionCard rendered two
          // explanatory _InfoRow widgets (external handoff, local
          // preferences) that were marketing copy, not user controls.
          // Per the audit those belong in /about, not Profile. Profile
          // now flows directly from interests → account actions with
          // no info-cards in between, so each row on screen is an
          // action the user can take.
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
                            style: FilledButton.styleFrom(
                              backgroundColor: PaynColors.accent,
                              foregroundColor: Colors.white,
                            ),
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
    AppController controller,
  ) async {
    final preferences = controller.preferences;
    await showPaynSelectionBottomSheet<PaynMarket>(
      context: context,
      title: context.l10n.profileChooseRegion,
      options:
          controller.availableMarkets
              .map(
                (market) => SelectionSheetOption<PaynMarket>(
                  value: market,
                  label: market.localizedLabel(context.l10n),
                  selected: preferences.market == market,
                ),
              )
              .toList(),
      onSelected: (market) async {
        await controller.setMarket(market);
        unawaited(
          controller.analytics.track(
            AnalyticsEvents.profileUpdated,
            properties: controller.analytics.buildDefaultProperties(
              preferences: controller.preferences,
              loggedIn: controller.isAuthenticated,
              extra: <String, dynamic>{
                'field': 'country',
                'value': market.name,
              },
            ),
          ),
        );
      },
    );
  }

  Future<void> _showLanguageSheet(
    BuildContext context,
    AppController controller,
  ) async {
    final preferences = controller.preferences;
    await showPaynSelectionBottomSheet<String>(
      context: context,
      title: context.l10n.profileChooseLanguage,
      options:
          controller.availableLanguages
              .map(
                (language) => SelectionSheetOption<String>(
                  value: language.code,
                  label: _languageLabel(language.code, context.l10n),
                  selected:
                      normalizeSupportedLanguageCode(
                        preferences.languageCode,
                      ) ==
                      language.code,
                ),
              )
              .toList(),
      onSelected: (code) async {
        await controller.setLocale(code);
        unawaited(
          controller.analytics.track(
            AnalyticsEvents.profileUpdated,
            properties: controller.analytics.buildDefaultProperties(
              preferences: controller.preferences,
              loggedIn: controller.isAuthenticated,
              language: code,
              extra: <String, dynamic>{
                'field': 'language',
                'value': code,
              },
            ),
          ),
        );
      },
    );
  }

  String _languageLabel(String code, dynamic l10n) {
    final match =
        supportedLanguageOptions
            .where((language) => language.code == code)
            .firstOrNull;
    if (match == null) return code.toUpperCase();
    // P2.12 — When the language's native name matches its localized
    // label (e.g. English user reading "English" — localized = "English",
    // native = "English"), we used to render "English - English" which
    // reads like a duplication bug. Collapse to a single label in that
    // case. Cross-language users still see e.g. "English - Anglais".
    final native = match.native;
    final localized = match.localizedLabel(l10n);
    if (native.toLowerCase() == localized.toLowerCase()) return native;
    return '$native - $localized';
  }
}

class _ProfileHero extends StatelessWidget {
  const _ProfileHero({required this.controller});

  // MOB.3 — Was `final dynamic controller;`. Dart resolves extension
  // methods at compile time from the receiver's static type, so a
  // call like `controller.preferences.market.localizedLabel(l10n)`
  // through a dynamic `controller` returns `dynamic` for `.market`,
  // and the extension `PaynMarketL10n.localizedLabel` never binds —
  // we got a NoSuchMethodError at runtime instead. Typing the field
  // strictly fixes the dispatch (and gives us autocomplete + compile
  // checks back).
  final AppController controller;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [PaynColors.surfaceDark, PaynColors.surfaceElevatedDark],
        ),
        borderRadius: BorderRadius.circular(PaynRadius.panel),
      ),
      child: Row(
        children: <Widget>[
          // P3.1 — Guest avatar used to render the brand mark (PaynMark)
          // inside an empty surface-dim square, which read like a blank
          // placeholder rather than a profile slot. Guests now see a
          // person-outline icon so the visual language matches the
          // authenticated state (filled person), with the surface-dim
          // background and a dashed border signalling "sign in to fill
          // this in".
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(18),
            ),
            alignment: Alignment.center,
            child: controller.isAuthenticated
                ? const Icon(
                    Icons.person_rounded,
                    color: Colors.white,
                    size: 24,
                  )
                : Icon(
                    Icons.person_outline_rounded,
                    color: Colors.white.withValues(alpha: 0.6),
                    size: 26,
                  ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  controller.isAuthenticated
                      ? (controller.session.email ??
                          context.l10n.profileSignedIn)
                      : context.l10n.profileGuestMode,
                  style: theme.textTheme.titleLarge?.copyWith(
                    color: PaynColors.textInverse,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  controller.isAuthenticated
                      ? context.l10n.profileMarketSummary(
                        controller.preferences.market.localizedLabel(
                          context.l10n,
                        ),
                      )
                      : context.l10n.profileGuestSummary,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: Colors.white.withValues(alpha: 0.6),
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

    return Semantics(
      button: true,
      label: '$label, $value',
      child: TextButton(
        onPressed: onTap,
        style: TextButton.styleFrom(
          backgroundColor: PaynColors.surfaceRaised,
          foregroundColor: PaynColors.text,
          disabledForegroundColor: PaynColors.textTertiary,
          padding: EdgeInsets.zero,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          minimumSize: const Size(double.infinity, 66),
          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          alignment: Alignment.centerLeft,
        ),
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

// P2.13 — `_InfoRow` deleted along with the Security SectionCard it
// only supported. Profile no longer renders marketing copy; if we
// later add an /about screen we can resurrect this widget there.

class _HowItWorksStep extends StatelessWidget {
  const _HowItWorksStep({
    required this.number,
    required this.title,
    required this.body,
  });

  final String number;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: const BoxDecoration(
            color: PaynColors.accent,
            shape: BoxShape.circle,
          ),
          alignment: Alignment.center,
          child: Text(
            number,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w700,
              fontSize: 13,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: theme.textTheme.labelLarge),
              const SizedBox(height: 3),
              Text(
                body,
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

/// P2.2 — Interests chip with a much stronger selected vs unselected
/// visual delta than the stock FilterChip:
///
///   * unselected: white surface, subtle outline, secondary text — reads
///     as a neutral option.
///   * selected: emerald fill, white text, ✓ leading icon, soft glow —
///     reads as a confirmed tag.
///
/// The 180 ms tween makes the toggle feel tactile.
class _InterestChip extends StatelessWidget {
  const _InterestChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Semantics(
      button: true,
      selected: selected,
      label: label,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        curve: Curves.easeOut,
        decoration: BoxDecoration(
          color: selected ? PaynColors.accent : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? PaynColors.accent : PaynColors.outlineSubtle,
            width: 1,
          ),
          boxShadow: selected
              ? <BoxShadow>[
                  BoxShadow(
                    color: PaynColors.accent.withValues(alpha: 0.22),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : const <BoxShadow>[],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(20),
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 14,
                vertical: 8,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  AnimatedSize(
                    duration: const Duration(milliseconds: 180),
                    curve: Curves.easeOut,
                    child: selected
                        ? const Padding(
                            padding: EdgeInsets.only(right: 6),
                            child: Icon(
                              Icons.check_rounded,
                              size: 16,
                              color: Colors.white,
                            ),
                          )
                        : const SizedBox.shrink(),
                  ),
                  Text(
                    label,
                    style: theme.textTheme.labelLarge?.copyWith(
                      color: selected
                          ? Colors.white
                          : PaynColors.textSecondary,
                      fontWeight: selected
                          ? FontWeight.w700
                          : FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
