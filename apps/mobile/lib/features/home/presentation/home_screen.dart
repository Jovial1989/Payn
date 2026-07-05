import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/localization/app_localizations_ext.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/models/payn_job.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';
import 'package:payn_mobile/shared/services/analytics_service.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';
import 'package:payn_mobile/shared/widgets/analytics_view_tracker.dart';
import 'package:payn_mobile/shared/widgets/payn_mark.dart';
import 'package:payn_mobile/shared/widgets/payn_shell.dart';
import 'package:payn_mobile/shared/widgets/provider_badge.dart';
import 'package:payn_mobile/shared/widgets/selection_bottom_sheet.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = AppScope.of(context);
    final theme = Theme.of(context);
    final l10n = context.l10n;
    final recent = controller.recentOffers;
    final categoryCounts = controller.categoryCounts;

    return Scaffold(
      backgroundColor: PaynColors.background,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/chat'),
        backgroundColor: PaynColors.text,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.auto_awesome_rounded, size: 18),
        label: const Text(
          'Ask AI',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
        ),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(PaynRadius.button),
        ),
      ),
      body: SafeArea(
      bottom: false,
      child: CustomScrollView(
        physics: const BouncingScrollPhysics(
          parent: AlwaysScrollableScrollPhysics(),
        ),
        slivers: <Widget>[
          SliverToBoxAdapter(
            child: AnalyticsViewTracker(
              viewKey: 'dashboard-view',
              onTrack:
                  () => controller.analytics.track(
                    AnalyticsEvents.dashboardViewed,
                    properties: controller.analytics.buildDefaultProperties(
                      preferences: controller.preferences,
                      loggedIn: controller.isAuthenticated,
                    ),
                  ),
            ),
          ),
          // ── Header ──
          SliverToBoxAdapter(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Color(0xFF0D1812), Color(0xFF13181A)],
                ),
              ),
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Row(
                    children: <Widget>[
                      Container(
                        width: 42,
                        height: 42,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.15),
                          ),
                          boxShadow: <BoxShadow>[
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.18),
                              blurRadius: 18,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        alignment: Alignment.center,
                        child: const PaynMark(size: 15, strokeWidth: 2.2),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          l10n.appTitle,
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      // P0.9 — Region selector. Used to nav to /profile
                      // on tap, which was misleading (this is a
                      // scope-control, not a settings shortcut).
                      // Now opens an inline market picker. Visuals
                      // upgraded: globe icon, slightly larger chip,
                      // emerald-tinted background so it reads as the
                      // primary scope chip — the user can immediately
                      // see "this is where I pick which country I'm
                      // shopping in".
                      _MarketSelectorChip(),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // ── Intent hero ──
          // SIMP — Payn now leads with the question, not a catalogue.
          // The 12-category taxonomy is replaced by 7 plain-language
          // jobs; tapping one scopes the results list.
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 28, 20, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    'WHAT’S ON THE MARKET TODAY',
                    style: theme.textTheme.labelMedium?.copyWith(
                      color: PaynColors.accentStrong,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.5,
                      fontSize: 11,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Stop overpaying.\nStart comparing.',
                    style: theme.textTheme.displaySmall?.copyWith(
                      fontSize: 33,
                      height: 1.06,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.8,
                      color: PaynColors.text,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'See what banks, cards and apps really offer across '
                    '${controller.preferences.market.localizedLabel(l10n)} '
                    'today — and keep the few worth it. Free, no sign-up.',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: PaynColors.textSecondary,
                      height: 1.45,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Jobs launcher ──
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 18, 20, 0),
            sliver: SliverList.separated(
              itemCount: kPrimaryJobs.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final job = kPrimaryJobs[index];
                return _JobCard(
                  job: job,
                  count: job.categories.fold<int>(
                    0,
                    (sum, c) => sum + (categoryCounts[c] ?? 0),
                  ),
                  onTap: () {
                    controller.setExploreCategory(job.primaryCategory);
                    context.go('/explore');
                  },
                );
              },
            ),
          ),

          // ── Secondary jobs ──
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: <Widget>[
                  for (final job in kSecondaryJobs)
                    _SecondaryJobChip(
                      job: job,
                      onTap: () {
                        controller.setExploreCategory(job.primaryCategory);
                        context.go('/explore');
                      },
                    ),
                ],
              ),
            ),
          ),

          // ── Recently viewed ──
          // MOB.12 — Capped at 3 items. The "Continue where you left
          // off" pattern is high-signal but it doesn't need to scroll
          // through all 8 recently-viewed offers on the home — that's
          // what /saved is for.
          if (recent.isNotEmpty) ...<Widget>[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 28, 20, 0),
                child: Text(
                  l10n.homeContinueTitle,
                  style: theme.textTheme.titleLarge,
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
              sliver: SliverList.builder(
                itemCount: recent.length.clamp(0, 3),
                itemBuilder: (context, index) {
                  final offer = recent[index];
                  return _RecentItem(
                    offer: offer,
                    onTap: () => context.push('/offer/${offer.id}'),
                  );
                },
              ),
            ),
          ],

          // ── Trust / disclosure ──
          // SIMP — One quiet line replaces the progressive-disclosure
          // dump (metrics, trust logos, category pills, suggestions).
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 30, 20, 0),
              child: Text(
                'We compare 350+ products across Europe. Free to use — '
                'we may earn a commission from some links.',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: PaynColors.textTertiary,
                  height: 1.45,
                ),
              ),
            ),
          ),

          SliverPadding(
            padding: EdgeInsets.only(
              bottom: PaynShell.contentBottomInset(context),
            ),
          ),
        ],
      ),
    ),
    );
  }
}

/// SIMP — Job launcher card. Full-width tappable row (icon · title ·
/// subtitle · chevron) that reads as "what do you want to do" and
/// routes into the scoped results list. Replaces the 12-category
/// taxonomy as the primary entry point.
class _JobCard extends StatelessWidget {
  const _JobCard({required this.job, required this.onTap, this.count = 0});

  final PaynJob job;
  final VoidCallback onTap;
  final int count;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(PaynRadius.card),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(PaynRadius.card),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          decoration: BoxDecoration(
            color: PaynColors.surface,
            borderRadius: BorderRadius.circular(PaynRadius.card),
            border: Border.all(color: PaynColors.outlineSubtle),
          ),
          child: Row(
            children: <Widget>[
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: PaynColors.accentSurface,
                  borderRadius: BorderRadius.circular(14),
                ),
                alignment: Alignment.center,
                child: Icon(
                  job.icon,
                  size: 22,
                  color: PaynColors.accentStrong,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      job.title,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: PaynColors.text,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      job.subtitle,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: PaynColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              if (count > 0) ...<Widget>[
                Text(
                  '$count',
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: PaynColors.textTertiary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(width: 10),
              ],
              const Icon(
                Icons.arrow_forward_ios_rounded,
                size: 14,
                color: PaynColors.textTertiary,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// SIMP — Quiet secondary-job chip (Insurance / For business).
class _SecondaryJobChip extends StatelessWidget {
  const _SecondaryJobChip({required this.job, required this.onTap});

  final PaynJob job;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(999),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
          decoration: BoxDecoration(
            color: PaynColors.surface,
            borderRadius: BorderRadius.circular(999),
            border: Border.all(color: PaynColors.outlineSubtle),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Icon(job.icon, size: 16, color: PaynColors.textSecondary),
              const SizedBox(width: 8),
              Text(
                job.title,
                style: theme.textTheme.labelLarge?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: PaynColors.text,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RecentItem extends StatelessWidget {
  const _RecentItem({required this.offer, required this.onTap});
  final PaynOffer offer;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final l10n = context.l10n;
    return InkWell(
      borderRadius: BorderRadius.circular(10),
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: <Widget>[
            ProviderBadge(offer: offer, compact: true),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    offer.title,
                    style: t.textTheme.labelLarge,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    '${offer.providerName} · ${offer.category.localizedLabel(l10n)}',
                    style: t.textTheme.labelMedium,
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.chevron_right_rounded,
              size: 18,
              color: PaynColors.textTertiary,
            ),
          ],
        ),
      ),
    );
  }
}

/// P0.9 — The region chip in the home top-bar. Tapping it now opens an
/// inline market picker instead of navigating to /profile (the old
/// behaviour was misleading — a scope-control shouldn't redirect users
/// out of the screen they're on). Visuals: globe icon + market label +
/// chevron, tinted emerald background so it reads as the primary
/// app-wide scope chip rather than just another button.
class _MarketSelectorChip extends StatelessWidget {
  const _MarketSelectorChip();

  @override
  Widget build(BuildContext context) {
    final controller = AppScope.of(context);
    final theme = Theme.of(context);
    final l10n = context.l10n;
    final marketLabel = controller.preferences.market.localizedLabel(l10n);

    return Material(
      color: Colors.white.withValues(alpha: 0.10),
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () => _openPicker(context),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.18),
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Icon(
                Icons.public_rounded,
                size: 16,
                color: Colors.white.withValues(alpha: 0.7),
              ),
              const SizedBox(width: 6),
              Text(
                marketLabel,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.labelMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(width: 2),
              Icon(
                Icons.keyboard_arrow_down_rounded,
                size: 14,
                color: Colors.white.withValues(alpha: 0.7),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _openPicker(BuildContext context) async {
    final controller = AppScope.of(context);
    final l10n = context.l10n;
    final current = controller.preferences.market;

    await showPaynSelectionBottomSheet<PaynMarket>(
      context: context,
      title: l10n.localeGateSelectCountry,
      options: controller.availableMarkets
          .map(
            (market) => SelectionSheetOption<PaynMarket>(
              value: market,
              leading: _flagFor(market),
              label: market.localizedLabel(l10n),
              selected: market == current,
            ),
          )
          .toList(),
      onSelected: (market) async {
        await controller.setMarket(market);
      },
    );
  }

  String _flagFor(PaynMarket market) {
    switch (market) {
      case PaynMarket.eu:
        return '🇪🇺';
      case PaynMarket.de:
        return '🇩🇪';
      case PaynMarket.es:
        return '🇪🇸';
      case PaynMarket.fr:
        return '🇫🇷';
      case PaynMarket.it:
        return '🇮🇹';
      case PaynMarket.uk:
        return '🇬🇧';
      case PaynMarket.nl:
        return '🇳🇱';
      case PaynMarket.pt:
        return '🇵🇹';
    }
  }
}

