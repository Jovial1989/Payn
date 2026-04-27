import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/localization/app_localizations_ext.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/models/analytics_models.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';
import 'package:payn_mobile/shared/services/analytics_service.dart';
import 'package:payn_mobile/shared/services/app_controller.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';
import 'package:payn_mobile/shared/widgets/analytics_view_tracker.dart';
import 'package:payn_mobile/shared/widgets/offer_card.dart';
import 'package:payn_mobile/shared/widgets/market_chart.dart';
import 'package:payn_mobile/shared/widgets/payn_mark.dart';
import 'package:payn_mobile/shared/widgets/payn_shell.dart';
import 'package:payn_mobile/shared/widgets/provider_badge.dart';
import 'package:payn_mobile/shared/widgets/section_card.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = AppScope.of(context);
    final theme = Theme.of(context);
    final l10n = context.l10n;
    final picks = controller.homeRecommendations;
    final recent = controller.recentOffers;
    final trending = controller.trendingOffers.take(3).toList();
    final categoryCounts = controller.categoryCounts;

    return SafeArea(
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
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Row(
                    children: <Widget>[
                      Container(
                        width: 42,
                        height: 42,
                        decoration: BoxDecoration(
                          color: PaynColors.text,
                          borderRadius: BorderRadius.circular(14),
                          boxShadow: <BoxShadow>[
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.12),
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
                          ),
                        ),
                      ),
                      Material(
                        color: PaynColors.surface,
                        borderRadius: BorderRadius.circular(14),
                        child: InkWell(
                          onTap: () => context.go('/profile'),
                          borderRadius: BorderRadius.circular(14),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 9,
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: <Widget>[
                                Text(
                                  controller.preferences.market.localizedLabel(l10n),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: theme.textTheme.labelMedium?.copyWith(
                                    color: PaynColors.textSecondary,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(width: 2),
                                const Icon(
                                  Icons.keyboard_arrow_down_rounded,
                                  size: 14,
                                  color: PaynColors.textTertiary,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  _DashboardHero(controller: controller),
                ],
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: const _TrustBar(),
            ),
          ),

          SliverToBoxAdapter(
            child: SizedBox(
              height: 58,
              child: ListView.separated(
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 0),
                scrollDirection: Axis.horizontal,
                itemBuilder: (context, index) {
                  final category = PaynCategory.values[index];
                  return _CategoryPill(
                    label: category.localizedLabel(l10n),
                    count: categoryCounts[category] ?? 0,
                    onTap: () => context.go('/explore'),
                  );
                },
                separatorBuilder: (_, __) => const SizedBox(width: 10),
                itemCount: PaynCategory.values.length,
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 22, 20, 0),
              child: _ActivitySection(controller: controller),
            ),
          ),

          // ── Top picks ──
          if (picks.isNotEmpty) ...<Widget>[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 28, 20, 0),
                child: Row(
                  children: <Widget>[
                    Expanded(
                      child: Text(
                        l10n.homeTopPicksTitle,
                        style: theme.textTheme.titleLarge,
                      ),
                    ),
                    GestureDetector(
                      onTap: () => context.go('/explore'),
                      child: Text(
                        l10n.homeSeeAll,
                        style: theme.textTheme.labelLarge?.copyWith(
                          color: PaynColors.accent,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
              sliver: SliverList.separated(
                itemCount: picks.length,
                separatorBuilder: (_, __) => const SizedBox(height: 14),
                itemBuilder: (context, index) {
                  final item = picks[index];
                  return OfferCard(
                    offer: item.offer,
                    reasons: item.reasons,
                    tradeoff: item.tradeoff,
                    saved: controller.isSaved(item.offer.id),
                    onTap: () => context.push('/offer/${item.offer.id}'),
                    onSave: () => controller.toggleSaved(item.offer.id),
                    onProviderTap:
                        () => showProviderHandoffSheet(
                          context,
                          offer: item.offer,
                        ),
                    rankLabel: '#${index + 1}',
                    showCategory: true,
                    motionIndex: index,
                  );
                },
              ),
            ),
          ],

          if (trending.isNotEmpty) ...<Widget>[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 28, 20, 0),
                child: Text(
                  l10n.homeSmartSuggestions,
                  style: theme.textTheme.titleLarge,
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: SizedBox(
                height: 188,
                child: ListView.separated(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                  scrollDirection: Axis.horizontal,
                  itemCount: trending.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 12),
                  itemBuilder: (context, index) {
                    final item = trending[index];
                    return _SuggestionCard(
                      offer: item.offer,
                      onTap: () => context.push('/offer/${item.offer.id}'),
                    );
                  },
                ),
              ),
            ),
          ],

          // ── Recently viewed ──
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
                itemCount: recent.length,
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

          SliverPadding(
            padding: EdgeInsets.only(
              bottom: PaynShell.contentBottomInset(context),
            ),
          ),
        ],
      ),
    );
  }
}

class _TrustBar extends StatelessWidget {
  const _TrustBar();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: PaynColors.surfaceRaised,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: PaynColors.outlineSubtle),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Wrap(
        spacing: 10,
        runSpacing: 8,
        crossAxisAlignment: WrapCrossAlignment.center,
        alignment: WrapAlignment.spaceBetween,
        children: <Widget>[
          Text(
            l10n.compareTitle,
            style: theme.textTheme.labelMedium?.copyWith(
              color: PaynColors.textTertiary,
            ),
          ),
          const Wrap(
            spacing: 6,
            runSpacing: 6,
            children: <Widget>[
              _TrustLogo(label: 'Revolut'),
              _TrustLogo(label: 'Wise'),
              _TrustLogo(label: 'Klarna'),
            ],
          ),
          Text(
            '${50}+ ${l10n.homeProviders.toLowerCase()}',
            style: theme.textTheme.labelMedium?.copyWith(
              color: PaynColors.accent,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _DashboardHero extends StatelessWidget {
  const _DashboardHero({required this.controller});

  final AppController controller;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;

    return Container(
      padding: const EdgeInsets.fromLTRB(20, 22, 20, 20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: <Color>[Color(0xFF171C1C), Color(0xFF0A0E0A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(PaynRadius.panel),
        border: Border.all(color: Colors.white10),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.16),
            blurRadius: 32,
            offset: const Offset(0, 18),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            l10n.homeHeroTitle,
            style: theme.textTheme.headlineLarge?.copyWith(
              fontSize: 36,
              color: PaynColors.textInverse,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            l10n.exploreRankedOffersInMarket(
              controller.homeRecommendations.length,
              controller.preferences.market.localizedLabel(l10n),
            ),
            style: theme.textTheme.bodyLarge?.copyWith(
              color: PaynColors.textInverse.withValues(alpha: 0.72),
            ),
          ),
          const SizedBox(height: 18),
          Row(
            children: <Widget>[
              Expanded(
                child: _HeroMetric(
                  label: l10n.homeSaved,
                  value: '${controller.savedCount}',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _HeroMetric(
                  label: l10n.homeCompared,
                  value: '${controller.compareCount}',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _HeroMetric(
                  label: l10n.homeProviders,
                  value: '${controller.activeProviderCount}+',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HeroMetric extends StatelessWidget {
  const _HeroMetric({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            label,
            style: theme.textTheme.labelMedium?.copyWith(
              color: PaynColors.textInverse.withValues(alpha: 0.58),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: theme.textTheme.titleLarge?.copyWith(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: PaynColors.textInverse,
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoryPill extends StatelessWidget {
  const _CategoryPill({
    required this.label,
    required this.count,
    required this.onTap,
  });

  final String label;
  final int count;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Material(
      color: PaynColors.surface,
      borderRadius: BorderRadius.circular(999),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(999),
            border: Border.all(color: PaynColors.outlineSubtle),
            boxShadow: <BoxShadow>[
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 14,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Text(
                label,
                style: theme.textTheme.labelLarge?.copyWith(
                  color: PaynColors.textSecondary,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: PaynColors.surfaceDim,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  '$count',
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: PaynColors.text,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SuggestionCard extends StatelessWidget {
  const _SuggestionCard({required this.offer, required this.onTap});

  final PaynOffer offer;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;
    final primaryMetric = offer.metrics.isNotEmpty ? offer.metrics.first : null;

    return SizedBox(
      width: 244,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(26),
          child: Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: PaynColors.surface,
              borderRadius: BorderRadius.circular(26),
              border: Border.all(color: PaynColors.outlineSubtle),
              boxShadow: <BoxShadow>[
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 18,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                ProviderBadge(offer: offer, compact: true),
                const Spacer(),
                Text(
                  offer.providerName,
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: PaynColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  primaryMetric?.value ?? offer.title,
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontSize: 24,
                    height: 1,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  primaryMetric?.label ?? offer.category.localizedLabel(l10n),
                  style: theme.textTheme.labelMedium,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _TrustLogo extends StatelessWidget {
  const _TrustLogo({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final colors = switch (label) {
      'Revolut' => (const Color(0xFF191C1F), Colors.white),
      'Wise' => (const Color(0xFF9FE870), const Color(0xFF163300)),
      'Klarna' => (const Color(0xFFFFB3C7), const Color(0xFF17120F)),
      _ => (PaynColors.surfaceDim, PaynColors.text),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: colors.$1,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
          color: colors.$2,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────
// Private widgets — tight, zero waste
// ─────────────────────────────────────────────────

class _ActivitySection extends StatefulWidget {
  const _ActivitySection({required this.controller});

  final AppController controller;

  @override
  State<_ActivitySection> createState() => _ActivitySectionState();
}

class _ActivitySectionState extends State<_ActivitySection> {
  ChartTimeRange _range = ChartTimeRange.week;

  @override
  Widget build(BuildContext context) {
    final snapshot = widget.controller.activitySnapshotFor(_range);
    final l10n = context.l10n;

    return SectionCard(
      title: l10n.homeActivityTitle,
      subtitle: l10n.homeActivitySubtitle,
      trailing: SegmentedButton<ChartTimeRange>(
        segments:
            ChartTimeRange.values
                .map(
                  (range) => ButtonSegment<ChartTimeRange>(
                    value: range,
                    label: Text(range.shortLabel),
                  ),
                )
                .toList(),
        selected: <ChartTimeRange>{_range},
        showSelectedIcon: false,
        onSelectionChanged: (selection) {
          setState(() => _range = selection.first);
        },
      ),
      child: Column(
        children: <Widget>[
          Row(
            children: <Widget>[
              Expanded(
                child: _ActivityMetricCard(
                  label: l10n.homeActivityTotalViews,
                  value: '${snapshot.totalViews}',
                  detail:
                      '${snapshot.changePercent >= 0 ? '+' : ''}${snapshot.changePercent.toStringAsFixed(0)}%',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _ActivityMetricCard(
                  label: l10n.homeActivityCtr,
                  value: '${snapshot.clickThroughRate.toStringAsFixed(1)}%',
                  detail: l10n.homeActivityOfferHandoff,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _ActivityMetricCard(
                  label: l10n.homeActivitySavedOffers,
                  value: '${snapshot.savedOffers}',
                  detail: l10n.homeActivityShortlistReady,
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          MarketChart(
            range: _range,
            lines: <MarketChartLine>[
              MarketChartLine(
                label: l10n.chartViews,
                points: snapshot.views,
                color: PaynColors.text,
                showArea: true,
              ),
              MarketChartLine(
                label: l10n.chartClicks,
                points: snapshot.clicks,
                color: PaynColors.accent,
              ),
              MarketChartLine(
                label: l10n.homeSaved,
                points: snapshot.saves,
                color: PaynColors.positive,
              ),
            ],
          ),
          const SizedBox(height: 14),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFF7F8FA),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: PaynColors.outlineSubtle),
            ),
            child: Row(
              children: <Widget>[
                Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    color: PaynColors.accentSurface,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.insights_rounded,
                    size: 18,
                    color: PaynColors.accent,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    snapshot.insight,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: PaynColors.textSecondary,
                    ),
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

class _ActivityMetricCard extends StatelessWidget {
  const _ActivityMetricCard({
    required this.label,
    required this.value,
    required this.detail,
  });

  final String label;
  final String value;
  final String detail;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF7F8FA),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: PaynColors.outlineSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(label, style: theme.textTheme.labelMedium),
          const SizedBox(height: 10),
          Text(value, style: theme.textTheme.titleLarge),
          const SizedBox(height: 4),
          Text(
            detail,
            style: theme.textTheme.labelMedium?.copyWith(
              color: PaynColors.textTertiary,
            ),
          ),
        ],
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
