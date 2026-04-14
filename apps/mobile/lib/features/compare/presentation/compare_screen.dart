import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/services/analytics_service.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';
import 'package:payn_mobile/shared/widgets/analytics_view_tracker.dart';
import 'package:payn_mobile/shared/widgets/provider_badge.dart';

class CompareScreen extends StatelessWidget {
  const CompareScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = AppScope.of(context);
    final theme = Theme.of(context);
    final offers = controller.compareOffers;
    final compareViewTracker = AnalyticsViewTracker(
      viewKey: 'compare-view',
      onTrack:
          () => controller.analytics.track(
            AnalyticsEvents.compareViewed,
            properties: controller.analytics.buildDefaultProperties(
              preferences: controller.preferences,
              loggedIn: controller.isAuthenticated,
              extra: <String, dynamic>{'compare_count': offers.length},
            ),
          ),
    );

    if (offers.length < 2) {
      return Scaffold(
        appBar: AppBar(title: const Text('Compare')),
        body: Stack(
          children: <Widget>[
            compareViewTracker,
            Center(
              child: Padding(
                padding: const EdgeInsets.all(40),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    const Icon(
                      Icons.compare_arrows_rounded,
                      size: 48,
                      color: PaynColors.textTertiary,
                    ),
                    const SizedBox(height: 14),
                    Text(
                      'Select at least 2 offers',
                      style: theme.textTheme.titleMedium,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Use the Saved tab to choose offers for comparison.',
                      style: theme.textTheme.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: () => context.go('/saved'),
                      child: const Text('Go to Saved'),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    }

    final rankedOffers =
        offers.map(controller.rankedOfferFor).toList()
          ..sort((a, b) => b.score.compareTo(a.score));
    final best = rankedOffers.first;
    final metricLabels =
        offers.expand((o) => o.metrics.map((m) => m.label)).toSet().toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Compare')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 40),
        physics: const BouncingScrollPhysics(),
        children: <Widget>[
          compareViewTracker,
          // ── Winner card ──
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: PaynColors.positiveSurface,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: <Widget>[
                ProviderBadge(offer: best.offer),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        'Best option',
                        style: theme.textTheme.labelMedium?.copyWith(
                          color: PaynColors.positive,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        best.offer.title,
                        style: theme.textTheme.titleMedium,
                      ),
                      Text(
                        best.offer.providerName,
                        style: theme.textTheme.labelMedium,
                      ),
                    ],
                  ),
                ),
                FilledButton(
                  onPressed:
                      () =>
                          showProviderHandoffSheet(context, offer: best.offer),
                  style: FilledButton.styleFrom(
                    minimumSize: const Size(0, 36),
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                  ),
                  child: const Text('Apply'),
                ),
              ],
            ),
          ),

          // ── Comparison table ──
          const SizedBox(height: 14),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: IntrinsicWidth(
              child: Column(
                children: <Widget>[
                  _Row(
                    label: 'Provider',
                    values: offers.map((o) => o.providerName).toList(),
                    highlightValue: best.offer.providerName,
                  ),
                  _Row(
                    label: 'Best for',
                    values:
                        offers
                            .map((o) => o.bestFor.take(2).join(' · '))
                            .toList(),
                  ),
                  ...metricLabels.map((label) {
                    return _Row(
                      label: label,
                      values:
                          offers.map((o) {
                            final m = o.metrics.where((m) => m.label == label);
                            return m.isEmpty ? '—' : m.first.value;
                          }).toList(),
                    );
                  }),
                  _Row(
                    label: 'Tradeoff',
                    values: offers.map(controller.tradeoffFor).toList(),
                  ),
                ],
              ),
            ),
          ),

          // ── Manage ──
          const SizedBox(height: 14),
          Text('Selected', style: theme.textTheme.labelLarge),
          const SizedBox(height: 6),
          ...offers.map(
            (offer) => Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Container(
                decoration: BoxDecoration(
                  color: PaynColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: PaynColors.outline),
                ),
                child: ListTile(
                  dense: true,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  onTap: () => context.push('/offer/${offer.id}'),
                  leading: ProviderBadge(offer: offer, compact: true),
                  title: Text(
                    offer.title,
                    style: theme.textTheme.labelLarge,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  subtitle: Text(
                    offer.providerName,
                    style: theme.textTheme.labelMedium,
                  ),
                  trailing: IconButton(
                    onPressed: () => controller.toggleCompare(offer.id),
                    icon: const Icon(Icons.close_rounded, size: 18),
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

class _Row extends StatelessWidget {
  const _Row({required this.label, required this.values, this.highlightValue});

  final String label;
  final List<String> values;
  final String? highlightValue;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Container(
            width: 96,
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: PaynColors.surfaceDim,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              label,
              style: theme.textTheme.labelMedium?.copyWith(
                color: PaynColors.textSecondary,
              ),
            ),
          ),
          const SizedBox(width: 4),
          ...values.map((value) {
            final highlighted =
                highlightValue != null && value == highlightValue;
            return Container(
              width: 152,
              margin: const EdgeInsets.only(right: 4),
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color:
                    highlighted
                        ? PaynColors.positiveSurface
                        : PaynColors.surface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: PaynColors.outline),
              ),
              child: Text(
                value,
                style:
                    highlighted
                        ? theme.textTheme.bodyMedium?.copyWith(
                          color: PaynColors.positive,
                          fontWeight: FontWeight.w600,
                        )
                        : theme.textTheme.bodyMedium?.copyWith(
                          color: PaynColors.text,
                        ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
