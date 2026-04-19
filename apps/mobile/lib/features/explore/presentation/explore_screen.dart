import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/core/utils/formatters.dart';
import 'package:payn_mobile/shared/models/analytics_models.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';
import 'package:payn_mobile/shared/services/analytics_service.dart';
import 'package:payn_mobile/shared/services/app_controller.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';
import 'package:payn_mobile/shared/widgets/analytics_view_tracker.dart';
import 'package:payn_mobile/shared/widgets/insight_card.dart';
import 'package:payn_mobile/shared/widgets/market_chart.dart';
import 'package:payn_mobile/shared/widgets/offer_card.dart';
import 'package:payn_mobile/shared/widgets/provider_badge.dart';
import 'package:payn_mobile/shared/widgets/section_card.dart';

enum _ExploreSort { bestMatch, lowestFee, fastest, recommended }

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  _ExploreSort _sort = _ExploreSort.bestMatch;
  bool _showSkeleton = false;

  void _pulseLoading() {
    if (!mounted) return;
    setState(() => _showSkeleton = true);
    Future<void>.delayed(const Duration(milliseconds: 220), () {
      if (mounted) {
        setState(() => _showSkeleton = false);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final controller = AppScope.of(context);
    final theme = Theme.of(context);
    final results = _sortResults(controller.exploreVisibleResults);
    final usingFallback = controller.isUsingExploreFallback;

    return SafeArea(
      bottom: false,
      child: CustomScrollView(
        physics: const BouncingScrollPhysics(
          parent: AlwaysScrollableScrollPhysics(),
        ),
        slivers: <Widget>[
          SliverToBoxAdapter(
            child: AnalyticsViewTracker(
              viewKey: 'discover-view',
              onTrack:
                  () => controller.analytics.track(
                    AnalyticsEvents.discoverViewed,
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
                  Expanded(
                    child: Text('Explore', style: theme.textTheme.titleLarge),
                  ),
                  _FilterButton(
                    count: controller.activeFilterCount,
                    onTap: () {
                      HapticFeedback.selectionClick();
                      _pulseLoading();
                      _openFilterSheet(context, controller);
                    },
                  ),
                ],
              ),
            ),
          ),

          SliverPersistentHeader(
            pinned: true,
            delegate: _StickyExploreControls(
              minExtent: 176,
              maxExtent: 176,
              child: Container(
                color: PaynColors.background.withValues(alpha: 0.96),
                padding: const EdgeInsets.only(top: 10, bottom: 12),
                child: Column(
                  children: <Widget>[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
                      child: SizedBox(
                        height: 48,
                        child: TextField(
                          onChanged: (value) {
                            _pulseLoading();
                            controller.updateExploreFilters(
                              controller.exploreFilters.copyWith(query: value),
                            );
                          },
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: PaynColors.text,
                          ),
                          decoration: InputDecoration(
                            hintText: 'Search providers or products',
                            prefixIcon: const Icon(Icons.search_rounded, size: 18),
                            contentPadding: const EdgeInsets.symmetric(vertical: 0),
                            suffixIcon:
                                controller.exploreFilters.query.isEmpty
                                    ? null
                                    : IconButton(
                                      onPressed: () {
                                        _pulseLoading();
                                        controller.updateExploreFilters(
                                          controller.exploreFilters.copyWith(query: ''),
                                        );
                                      },
                                      icon: const Icon(Icons.close_rounded, size: 16),
                                    ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 44,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        itemCount: PaynCategory.values.length + 1,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          if (index == 0) {
                            final selected =
                                controller.selectedExploreCategory == null;
                            return _ControlChip(
                              label: 'All ${controller.exploreResults.length}',
                              selected: selected,
                              onTap: () {
                                _pulseLoading();
                                controller.setExploreCategory(null);
                              },
                            );
                          }
                          final category = PaynCategory.values[index - 1];
                          final count = controller.categoryCounts[category] ?? 0;
                          return _ControlChip(
                            label: '${category.label} $count',
                            selected:
                                controller.selectedExploreCategory == category,
                            onTap: () {
                              _pulseLoading();
                              controller.setExploreCategory(category);
                            },
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      height: 40,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        itemCount: _ExploreSort.values.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          final option = _ExploreSort.values[index];
                          return _ControlChip(
                            label: _sortLabel(option),
                            selected: _sort == option,
                            onTap: () {
                              HapticFeedback.selectionClick();
                              _pulseLoading();
                              setState(() => _sort = option);
                            },
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // ── Info row ──
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 14, 20, 4),
              child: Row(
                children: <Widget>[
                  Text(
                    '${results.length} results',
                    style: theme.textTheme.labelMedium,
                  ),
                  const SizedBox(width: 6),
                  Container(
                    width: 3,
                    height: 3,
                    decoration: const BoxDecoration(
                      color: PaynColors.textTertiary,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    formatMarketLabel(controller.preferences.market),
                    style: theme.textTheme.labelMedium,
                  ),
                ],
              ),
            ),
          ),

          if (usingFallback)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: PaynColors.surfaceDim,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: PaynColors.outline),
                  ),
                  child: Row(
                    children: <Widget>[
                      const Icon(
                        Icons.tune_rounded,
                        size: 16,
                        color: PaynColors.textSecondary,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'No exact match. Showing strongest offers for ${formatMarketLabel(controller.preferences.market)}.',
                          style: theme.textTheme.bodyMedium,
                        ),
                      ),
                      TextButton(
                        onPressed: controller.clearExploreFilters,
                        child: const Text('Clear'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          if (controller.selectedExploreCategory == PaynCategory.investments)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 14, 20, 4),
                child: _InvestmentIntelligenceBlock(controller: controller),
              ),
            ),
          // ── Results ──
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
            sliver:
                _showSkeleton
                    ? SliverList.separated(
                      itemCount: 3,
                      separatorBuilder: (_, __) => const SizedBox(height: 16),
                      itemBuilder:
                          (context, index) => const _OfferCardSkeleton(),
                    )
                    : SliverList.separated(
                      itemCount: results.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 16),
                      itemBuilder: (context, index) {
                        final item = results[index];
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
                          showCategory:
                              controller.selectedExploreCategory == null,
                          rankLabel: '#${index + 1}',
                        );
                      },
                    ),
          ),

          SliverToBoxAdapter(
            child: SizedBox(
              height: 112 + MediaQuery.paddingOf(context).bottom,
            ),
          ),
        ],
      ),
    );
  }

  List<RankedOffer> _sortResults(List<RankedOffer> input) {
    final results = List<RankedOffer>.from(input);

    switch (_sort) {
      case _ExploreSort.lowestFee:
        results.sort((a, b) => _metricScore(a.offer) - _metricScore(b.offer));
        break;
      case _ExploreSort.fastest:
        results.sort((a, b) => _speedScore(a.offer) - _speedScore(b.offer));
        break;
      case _ExploreSort.recommended:
        results.sort(
          (a, b) =>
              _recommendationScore(b.offer).compareTo(
                _recommendationScore(a.offer),
              ),
        );
        break;
      case _ExploreSort.bestMatch:
        results.sort((a, b) => b.score.compareTo(a.score));
        break;
    }

    return results;
  }

  int _metricScore(PaynOffer offer) {
    if (offer.metrics.isEmpty) return 999999;
    final value = offer.metrics.first.value.replaceAll(RegExp(r'[^0-9.]'), '');
    return (double.tryParse(value) ?? 999999).round();
  }

  int _speedScore(PaynOffer offer) {
    final text = [
      offer.subtitle.toLowerCase(),
      ...offer.bestFor.map((item) => item.toLowerCase()),
    ].join(' ');
    if (text.contains('instant')) return 0;
    if (text.contains('same day')) return 1;
    if (text.contains('next day')) return 2;
    return 3;
  }

  double _recommendationScore(PaynOffer offer) {
    return offer.affiliatePriorityScore + (offer.bestFor.length * 0.2);
  }

  String _sortLabel(_ExploreSort option) {
    switch (option) {
      case _ExploreSort.bestMatch:
        return 'Best match';
      case _ExploreSort.lowestFee:
        return 'Lowest fee';
      case _ExploreSort.fastest:
        return 'Fastest';
      case _ExploreSort.recommended:
        return 'Recommended';
    }
  }

  Future<void> _openFilterSheet(
    BuildContext context,
    AppController controller,
  ) async {
    final current = controller.exploreFilters;
    var draft = current;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (context) {
        final theme = Theme.of(context);
        return StatefulBuilder(
          builder: (context, setState) {
            final isLoans =
                controller.selectedExploreCategory == PaynCategory.loans;
            final providerOptions = controller.providerOptions;
            final featureOptions = controller.featureOptions;
            final subtypeOptions = controller.subtypeOptions;

            return Padding(
              padding: EdgeInsets.fromLTRB(
                16,
                12,
                16,
                16 + MediaQuery.of(context).viewInsets.bottom,
              ),
              child: ListView(
                shrinkWrap: true,
                children: <Widget>[
                  Center(
                    child: Container(
                      width: 36,
                      height: 4,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(999),
                        color: PaynColors.outline,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text('Filters', style: theme.textTheme.titleLarge),
                  const SizedBox(height: 14),
                  DropdownButtonFormField<PaynMarket>(
                    initialValue: controller.preferences.market,
                    decoration: const InputDecoration(labelText: 'Market'),
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
                        controller.preferences.copyWith(market: value),
                      );
                    },
                  ),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    initialValue:
                        draft.provider.isEmpty ? null : draft.provider,
                    decoration: const InputDecoration(labelText: 'Provider'),
                    items:
                        providerOptions
                            .map(
                              (p) => DropdownMenuItem(value: p, child: Text(p)),
                            )
                            .toList(),
                    onChanged: (value) {
                      setState(
                        () => draft = draft.copyWith(provider: value ?? ''),
                      );
                    },
                  ),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    initialValue: draft.feature.isEmpty ? null : draft.feature,
                    decoration: const InputDecoration(labelText: 'Feature'),
                    items:
                        featureOptions
                            .map(
                              (f) => DropdownMenuItem(value: f, child: Text(f)),
                            )
                            .toList(),
                    onChanged: (value) {
                      setState(
                        () => draft = draft.copyWith(feature: value ?? ''),
                      );
                    },
                  ),
                  if (subtypeOptions.isNotEmpty) ...<Widget>[
                    const SizedBox(height: 10),
                    DropdownButtonFormField<String>(
                      initialValue:
                          draft.subtype.isEmpty ? null : draft.subtype,
                      decoration: const InputDecoration(labelText: 'Subtype'),
                      items:
                          subtypeOptions
                              .map(
                                (s) =>
                                    DropdownMenuItem(value: s, child: Text(s)),
                              )
                              .toList(),
                      onChanged: (value) {
                        setState(
                          () => draft = draft.copyWith(subtype: value ?? ''),
                        );
                      },
                    ),
                  ],
                  if (isLoans) ...<Widget>[
                    const SizedBox(height: 14),
                    Text(
                      'Amount ${formatCurrencyLabel(draft.amount, controller.preferences.market)}',
                      style: theme.textTheme.labelLarge,
                    ),
                    Slider(
                      value: draft.amount.toDouble(),
                      min: 1000,
                      max: 60000,
                      divisions: 59,
                      onChanged: (value) {
                        setState(
                          () => draft = draft.copyWith(amount: value.round()),
                        );
                      },
                    ),
                    Text(
                      'Term ${draft.term} months',
                      style: theme.textTheme.labelLarge,
                    ),
                    Slider(
                      value: draft.term.toDouble(),
                      min: 6,
                      max: 84,
                      divisions: 13,
                      onChanged: (value) {
                        setState(
                          () => draft = draft.copyWith(term: value.round()),
                        );
                      },
                    ),
                  ],
                  const SizedBox(height: 14),
                  Row(
                    children: <Widget>[
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {
                            controller.clearExploreFilters();
                            Navigator.of(context).pop();
                          },
                          child: const Text('Clear'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: FilledButton(
                          onPressed: () {
                            controller.updateExploreFilters(draft);
                            Navigator.of(context).pop();
                          },
                          child: const Text('Apply'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}

class _StickyExploreControls extends SliverPersistentHeaderDelegate {
  const _StickyExploreControls({
    required this.minExtent,
    required this.maxExtent,
    required this.child,
  });

  @override
  final double minExtent;

  @override
  final double maxExtent;

  final Widget child;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return child;
  }

  @override
  bool shouldRebuild(covariant _StickyExploreControls oldDelegate) {
    return oldDelegate.child != child;
  }
}

class _ControlChip extends StatelessWidget {
  const _ControlChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? PaynColors.accent : Colors.white,
      borderRadius: BorderRadius.circular(999),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(999),
            border: Border.all(
              color: selected ? Colors.transparent : PaynColors.outlineSubtle,
            ),
            boxShadow:
                selected
                    ? <BoxShadow>[
                      BoxShadow(
                        color: PaynColors.accent.withValues(alpha: 0.18),
                        blurRadius: 24,
                        offset: const Offset(0, 10),
                      ),
                    ]
                    : null,
          ),
          child: Text(
            label,
            style: Theme.of(context).textTheme.labelLarge?.copyWith(
              color: selected ? Colors.white : PaynColors.textSecondary,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }
}

class _OfferCardSkeleton extends StatelessWidget {
  const _OfferCardSkeleton();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(PaynRadius.card),
        border: Border.all(color: PaynColors.outlineSubtle),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              _SkeletonBox(width: 52, height: 52, radius: 16),
              SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    _SkeletonBox(width: 84, height: 12, radius: 999),
                    SizedBox(height: 10),
                    _SkeletonBox(width: 180, height: 18, radius: 999),
                    SizedBox(height: 8),
                    _SkeletonBox(width: 140, height: 14, radius: 999),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: 18),
          _SkeletonBox(width: double.infinity, height: 150, radius: 24),
          SizedBox(height: 18),
          Row(
            children: <Widget>[
              Expanded(child: _SkeletonBox(width: double.infinity, height: 46, radius: 999)),
              SizedBox(width: 10),
              Expanded(child: _SkeletonBox(width: double.infinity, height: 46, radius: 999)),
            ],
          ),
        ],
      ),
    );
  }
}

class _SkeletonBox extends StatelessWidget {
  const _SkeletonBox({
    required this.width,
    required this.height,
    required this.radius,
  });

  final double width;
  final double height;
  final double radius;

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0.35, end: 0.8),
      duration: const Duration(milliseconds: 900),
      curve: Curves.easeInOut,
      builder: (context, value, child) {
        return Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            color: PaynColors.surfaceDim.withValues(alpha: value),
            borderRadius: BorderRadius.circular(radius),
          ),
        );
      },
      onEnd: () {},
    );
  }
}

class _InvestmentIntelligenceBlock extends StatefulWidget {
  const _InvestmentIntelligenceBlock({required this.controller});

  final AppController controller;

  @override
  State<_InvestmentIntelligenceBlock> createState() =>
      _InvestmentIntelligenceBlockState();
}

class _InvestmentIntelligenceBlockState
    extends State<_InvestmentIntelligenceBlock> {
  MarketAsset _asset = MarketAsset.btc;
  ChartTimeRange _range = ChartTimeRange.month;
  late Future<MarketIntelligenceSnapshot> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<MarketIntelligenceSnapshot> _load() {
    return widget.controller.marketSnapshotFor(asset: _asset, range: _range);
  }

  void _refresh() {
    setState(() {
      _future = _load();
    });
  }

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      title: 'Market intelligence',
      subtitle:
          'Track live market context before moving into investment products.',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children:
                <MarketAsset>[
                      MarketAsset.btc,
                      MarketAsset.sp500,
                      MarketAsset.eurUsd,
                    ]
                    .map(
                      (asset) => ChoiceChip(
                        selected: _asset == asset,
                        label: Text(asset.label),
                        onSelected: (_) {
                          _asset = asset;
                          _refresh();
                        },
                      ),
                    )
                    .toList(),
          ),
          const SizedBox(height: 12),
          SegmentedButton<ChartTimeRange>(
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
              _range = selection.first;
              _refresh();
            },
          ),
          const SizedBox(height: 18),
          FutureBuilder<MarketIntelligenceSnapshot>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState != ConnectionState.done) {
                return Container(
                  height: 280,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF7F7F9),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: PaynColors.outline),
                  ),
                  child: const CircularProgressIndicator(strokeWidth: 2.2),
                );
              }

              final data = snapshot.data;
              if (data == null) {
                return Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF7F7F9),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: PaynColors.outline),
                  ),
                  child: Text(
                    'Market data is temporarily unavailable. Try another asset.',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                );
              }

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              data.asset.priceLabel,
                              style: Theme.of(context).textTheme.labelMedium,
                            ),
                            const SizedBox(height: 6),
                            Text(
                              data.currentValueLabel,
                              style: Theme.of(context).textTheme.headlineMedium
                                  ?.copyWith(fontSize: 24),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color:
                              data.changePercent >= 0
                                  ? PaynColors.positiveSurface
                                  : PaynColors.warningSurface,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          '${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toStringAsFixed(2)}%',
                          style: Theme.of(
                            context,
                          ).textTheme.labelLarge?.copyWith(
                            color:
                                data.changePercent >= 0
                                    ? PaynColors.positive
                                    : PaynColors.warning,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  MarketChart(
                    lines: <MarketChartLine>[
                      MarketChartLine(
                        label: data.asset.label,
                        points: data.points,
                        color: PaynColors.text,
                        showArea: true,
                      ),
                    ],
                    range: _range,
                    showLegend: false,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Trends',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    height: 94,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: data.trends.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 10),
                      itemBuilder: (context, index) {
                        final trend = data.trends[index];
                        return Container(
                          width: 136,
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF7F7F9),
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: PaynColors.outline),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Text(
                                trend.asset.label,
                                style: Theme.of(context).textTheme.labelLarge,
                              ),
                              const Spacer(),
                              Text(
                                trend.valueLabel,
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${trend.changePercent >= 0 ? '+' : ''}${trend.changePercent.toStringAsFixed(2)}%',
                                style: Theme.of(
                                  context,
                                ).textTheme.labelMedium?.copyWith(
                                  color:
                                      trend.changePercent >= 0
                                          ? PaynColors.positive
                                          : PaynColors.warning,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'AI insights',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 10),
                  ...data.insights.map(
                    (insight) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: InsightCard(
                        title: insight.title,
                        body: insight.body,
                        tone: insight.tone,
                        compact: true,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Recommended actions',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children:
                        data.recommendations
                            .map(
                              (item) => TonePill(
                                label: item,
                                backgroundColor: const Color(0xFFF7F7F9),
                                foregroundColor: PaynColors.textSecondary,
                              ),
                            )
                            .toList(),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}

class _FilterButton extends StatelessWidget {
  const _FilterButton({required this.count, required this.onTap});

  final int count;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final hasFilters = count > 0;

    return Material(
      color: hasFilters ? PaynColors.text : PaynColors.surfaceDim,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Icon(
                Icons.tune_rounded,
                size: 14,
                color:
                    hasFilters ? PaynColors.surface : PaynColors.textSecondary,
              ),
              const SizedBox(width: 4),
              Text(
                hasFilters ? 'Filters $count' : 'Filters',
                style: theme.textTheme.labelMedium?.copyWith(
                  color:
                      hasFilters
                          ? PaynColors.surface
                          : PaynColors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
