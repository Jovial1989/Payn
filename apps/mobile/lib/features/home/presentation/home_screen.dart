import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/core/utils/formatters.dart';
import 'package:payn_mobile/shared/models/analytics_models.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';
import 'package:payn_mobile/shared/services/analytics_service.dart';
import 'package:payn_mobile/shared/services/app_controller.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';
import 'package:payn_mobile/shared/widgets/analytics_view_tracker.dart';
import 'package:payn_mobile/shared/widgets/offer_card.dart';
import 'package:payn_mobile/shared/widgets/market_chart.dart';
import 'package:payn_mobile/shared/widgets/payn_mark.dart';
import 'package:payn_mobile/shared/widgets/provider_badge.dart';
import 'package:payn_mobile/shared/widgets/section_card.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = AppScope.of(context);
    final theme = Theme.of(context);
    final picks = controller.homeRecommendations;
    final recent = controller.recentOffers;

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
              child: Row(
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
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text('Payn', style: theme.textTheme.titleLarge),
                        const SizedBox(height: 3),
                        Text(
                          'Top financial options for ${formatMarketLabel(controller.preferences.market)}',
                          style: theme.textTheme.labelMedium?.copyWith(
                            color: PaynColors.textTertiary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  Material(
                    color: PaynColors.surfaceDim,
                    borderRadius: BorderRadius.circular(10),
                    child: InkWell(
                      onTap: () => context.go('/profile'),
                      borderRadius: BorderRadius.circular(10),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 8,
                        ),
                        child: Text(
                          formatMarketLabel(controller.preferences.market),
                          style: theme.textTheme.labelMedium?.copyWith(
                            color: PaynColors.textSecondary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Stats ──
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
              child: Row(
                children: <Widget>[
                  _Stat(
                    value: '${controller.marketOfferCount}',
                    label: 'Products',
                  ),
                  const SizedBox(width: 10),
                  _Stat(value: '${controller.savedCount}', label: 'Saved'),
                  const SizedBox(width: 10),
                  _Stat(
                    value: '${controller.activeProviderCount}',
                    label: 'Providers',
                  ),
                ],
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 28, 20, 0),
              child: _ActivitySection(controller: controller),
            ),
          ),

          // ── Categories ──
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 28, 20, 0),
              child: Text('Categories', style: theme.textTheme.titleLarge),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
            sliver: SliverGrid(
              delegate: SliverChildBuilderDelegate((context, index) {
                final cat = PaynCategory.values[index];
                final count = controller.categoryCounts[cat] ?? 0;
                return _CategoryTile(
                  category: cat,
                  count: count,
                  onTap: () {
                    controller.setExploreCategory(cat);
                    context.go('/explore');
                  },
                );
              }, childCount: PaynCategory.values.length),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 10,
                crossAxisSpacing: 10,
                childAspectRatio: 2.2,
              ),
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
                        'Top offers',
                        style: theme.textTheme.titleLarge,
                      ),
                    ),
                    GestureDetector(
                      onTap: () => context.go('/explore'),
                      child: Text(
                        'See all',
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
                  );
                },
              ),
            ),
          ],

          // ── Market signals ──
          if (controller.trendSignals.isNotEmpty) ...<Widget>[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 28, 20, 0),
                child: Text(
                  'Market signals',
                  style: theme.textTheme.titleLarge,
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: SizedBox(
                height: 116,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                  itemCount: controller.trendSignals.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 10),
                  itemBuilder: (context, index) {
                    final s = controller.trendSignals[index];
                    return _SignalChip(signal: s);
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
                  'Recently viewed',
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

          const SliverPadding(padding: EdgeInsets.only(bottom: 80)),
        ],
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

    return SectionCard(
      title: 'Your financial activity',
      subtitle: 'Track views, shortlist momentum, and clicks over time.',
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
                  label: 'Total views',
                  value: '${snapshot.totalViews}',
                  detail:
                      '${snapshot.changePercent >= 0 ? '+' : ''}${snapshot.changePercent.toStringAsFixed(0)}%',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _ActivityMetricCard(
                  label: 'Click-through rate',
                  value: '${snapshot.clickThroughRate.toStringAsFixed(1)}%',
                  detail: 'Offer handoff',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _ActivityMetricCard(
                  label: 'Saved offers',
                  value: '${snapshot.savedOffers}',
                  detail: 'Shortlist ready',
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          MarketChart(
            range: _range,
            lines: <MarketChartLine>[
              MarketChartLine(
                label: 'Views',
                points: snapshot.views,
                color: PaynColors.text,
                showArea: true,
              ),
              MarketChartLine(
                label: 'Clicks',
                points: snapshot.clicks,
                color: PaynColors.accent,
              ),
              MarketChartLine(
                label: 'Saved',
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

class _Stat extends StatelessWidget {
  const _Stat({required this.value, required this.label});
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: PaynColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: PaynColors.outlineSubtle),
          boxShadow: <BoxShadow>[
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(value, style: t.textTheme.titleLarge),
            const SizedBox(height: 2),
            Text(label, style: t.textTheme.labelMedium),
          ],
        ),
      ),
    );
  }
}

class _CategoryTile extends StatelessWidget {
  const _CategoryTile({
    required this.category,
    required this.count,
    required this.onTap,
  });
  final PaynCategory category;
  final int count;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: PaynColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: PaynColors.outlineSubtle),
          boxShadow: <BoxShadow>[
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: <Widget>[
            Icon(_icon(category), size: 18, color: PaynColors.textSecondary),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  category.label,
                  style: t.textTheme.labelLarge,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text('$count offers', style: t.textTheme.labelMedium),
              ],
            ),
          ],
        ),
      ),
    );
  }

  static IconData _icon(PaynCategory c) {
    switch (c) {
      case PaynCategory.loans:
        return Icons.account_balance_outlined;
      case PaynCategory.cards:
        return Icons.credit_card_outlined;
      case PaynCategory.transfers:
        return Icons.swap_horiz_rounded;
      case PaynCategory.exchange:
        return Icons.currency_exchange_rounded;
      case PaynCategory.insurance:
        return Icons.shield_outlined;
      case PaynCategory.investments:
        return Icons.show_chart_rounded;
    }
  }
}

class _SignalChip extends StatelessWidget {
  const _SignalChip({required this.signal});
  final TrendSignal signal;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    return Container(
      width: 180,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: PaynColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: PaynColors.outlineSubtle),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Text(
            signal.label,
            style: t.textTheme.labelMedium,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 6),
          Text(
            signal.value,
            style: t.textTheme.titleMedium,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Text(
            signal.detail,
            style: t.textTheme.labelMedium,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
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
                    '${offer.providerName} · ${offer.category.label}',
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
