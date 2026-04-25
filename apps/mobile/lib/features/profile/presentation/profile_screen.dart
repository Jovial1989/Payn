import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/constants/marketplace_constants.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/core/utils/formatters.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';
import 'package:payn_mobile/shared/services/analytics_service.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';
import 'package:payn_mobile/shared/widgets/analytics_view_tracker.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = AppScope.of(context);
    final theme = Theme.of(context);
    final preferences = controller.preferences;

    return SafeArea(
      bottom: false,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
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
          // ── Page title ──
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Text('Profile', style: theme.textTheme.headlineMedium),
          ),
          // ── Account ──
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: PaynColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: PaynColors.outline),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Row(
                  children: <Widget>[
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color:
                            controller.isAuthenticated
                                ? PaynColors.text
                                : PaynColors.surfaceDim,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      alignment: Alignment.center,
                      child: Icon(
                        controller.isAuthenticated
                            ? Icons.person_rounded
                            : Icons.person_outline_rounded,
                        color:
                            controller.isAuthenticated
                                ? PaynColors.surface
                                : PaynColors.textSecondary,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Text(
                            controller.isAuthenticated
                                ? controller.session.email ?? 'Signed in'
                                : 'Guest mode',
                            style: theme.textTheme.titleMedium,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            controller.isAuthenticated
                                ? formatMarketLabel(preferences.market)
                                : 'Browse freely, save locally, or log in to sync your shortlist.',
                            style: theme.textTheme.labelMedium,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                if (controller.isAuthenticated)
                  OutlinedButton(
                    onPressed: controller.signOut,
                    child: const Text('Sign out'),
                  )
                else
                  Row(
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
                          style: FilledButton.styleFrom(
                            minimumSize: const Size(0, 40),
                          ),
                          child: const Text('Log in'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => context.push('/auth?mode=signUp'),
                          style: OutlinedButton.styleFrom(
                            minimumSize: const Size(0, 40),
                          ),
                          child: const Text('Create account'),
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // ── Market ──
          _SettingsSection(
            title: 'Preferences',
            child: DropdownButtonFormField<PaynMarket>(
              initialValue: preferences.market,
              decoration: const InputDecoration(labelText: 'Home market'),
              items:
                  PaynMarket.values
                      .map(
                        (market) => DropdownMenuItem<PaynMarket>(
                          value: market,
                          child: Text(formatMarketLabel(market)),
                        ),
                      )
                      .toList(),
              onChanged: (value) {
                if (value == null) return;
                controller.updatePreferences(
                  preferences.copyWith(market: value),
                );
              },
            ),
          ),
          const SizedBox(height: 12),

          // ── Interests ──
          _SettingsSection(
            title: 'Interests',
            child: Wrap(
              spacing: 6,
              runSpacing: 6,
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
                      visualDensity: VisualDensity.compact,
                    );
                  }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}

class _SettingsSection extends StatelessWidget {
  const _SettingsSection({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: PaynColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: PaynColors.outline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            title,
            style: theme.textTheme.labelLarge?.copyWith(
              color: PaynColors.textSecondary,
            ),
          ),
          const SizedBox(height: 10),
          child,
        ],
      ),
    );
  }
}
