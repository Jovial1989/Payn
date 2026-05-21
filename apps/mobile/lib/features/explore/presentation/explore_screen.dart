import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/localization/app_localizations_ext.dart';
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
import 'package:payn_mobile/shared/widgets/offer_row.dart';
import 'package:payn_mobile/shared/widgets/payn_motion.dart';
import 'package:payn_mobile/shared/widgets/payn_shell.dart';
import 'package:payn_mobile/shared/widgets/skeleton_card.dart';
import 'package:payn_mobile/shared/widgets/section_card.dart';

enum _ExploreSort { bestMatch, lowestFee, fastest, recommended }

class _NumberRange {
  const _NumberRange({this.min, this.max});

  final double? min;
  final double? max;
}

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
    final l10n = context.l10n;
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
          // ── Intent header ──
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Container(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 18),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: <Color>[Color(0xFFFFFFFF), Color(0xFFF4FAF7)],
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
                // Compact Explore header — was "LIVE RANKING / What do you
                // need? / 117 ranked offers in All Europe" + a row of
                // current-filter-value chips (EUR25K · 60 mo · All
                // Europe · All) that looked random because they always
                // showed defaults. Now: small eyebrow, larger count,
                // single Filters CTA. Filter values are only surfaced
                // INSIDE the filter sheet itself.
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: <Widget>[
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: <Widget>[
                          Text(
                            l10n.exploreLiveRanking.toUpperCase(),
                            style: theme.textTheme.labelMedium?.copyWith(
                              color: PaynColors.accent,
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1.4,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            l10n.exploreRankedOffersInMarket(
                              results.length,
                              controller.preferences.market.localizedLabel(
                                l10n,
                              ),
                            ),
                            style: theme.textTheme.titleLarge?.copyWith(
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                              letterSpacing: -0.3,
                              color: PaynColors.text,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
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
          ),

          SliverPersistentHeader(
            pinned: true,
            delegate: _StickyExploreControls(
              minExtent: 198,
              maxExtent: 198,
              child: Container(
                color: PaynColors.background.withValues(alpha: 0.96),
                padding: const EdgeInsets.only(top: 10, bottom: 12),
                child: Column(
                  children: <Widget>[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
                      child: Container(
                        decoration: BoxDecoration(
                          color: PaynColors.surface,
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: PaynColors.outlineSubtle),
                          boxShadow: <BoxShadow>[
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.04),
                              blurRadius: 24,
                              offset: const Offset(0, 10),
                            ),
                          ],
                        ),
                        child: SizedBox(
                          height: 54,
                          child: TextField(
                            onChanged: (value) {
                              _pulseLoading();
                              controller.updateExploreFilters(
                                controller.exploreFilters.copyWith(
                                  query: value,
                                ),
                              );
                            },
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: PaynColors.text,
                            ),
                            decoration: InputDecoration(
                              hintText: l10n.exploreSearchPlaceholder,
                              prefixIcon: const Icon(
                                Icons.search_rounded,
                                size: 18,
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                vertical: 0,
                              ),
                              suffixIcon:
                                  controller.exploreFilters.query.isEmpty
                                      ? null
                                      : IconButton(
                                        onPressed: () {
                                          _pulseLoading();
                                          controller.updateExploreFilters(
                                            controller.exploreFilters.copyWith(
                                              query: '',
                                            ),
                                          );
                                        },
                                        icon: const Icon(
                                          Icons.close_rounded,
                                          size: 16,
                                        ),
                                      ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 56,
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
                              label: l10n.exploreAll,
                              detail: '${controller.exploreResults.length}',
                              selected: selected,
                              onTap: () {
                                _pulseLoading();
                                controller.setExploreCategory(null);
                              },
                            );
                          }
                          final category = PaynCategory.values[index - 1];
                          final count =
                              controller.categoryCounts[category] ?? 0;
                          return _ControlChip(
                            label: category.localizedLabel(l10n),
                            detail: '$count',
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
                      height: 42,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        itemCount: _ExploreSort.values.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          final option = _ExploreSort.values[index];
                          return _SortChip(
                            label: _sortLabel(option, l10n),
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

          const SliverToBoxAdapter(child: SizedBox(height: 6)),

          if (controller.hasCatalogError)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                child: _CatalogErrorBanner(
                  loading: controller.catalogLoading,
                  onRetry: controller.refreshCatalog,
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
                          l10n.exploreNoExactMatch(
                            controller.preferences.market.localizedLabel(l10n),
                          ),
                          style: theme.textTheme.bodyMedium,
                        ),
                      ),
                      TextButton(
                        onPressed: controller.clearExploreFilters,
                        child: Text(l10n.commonClear),
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
          // ── Empty state ──
          if (!_showSkeleton && results.isEmpty)
            SliverFillRemaining(
              hasScrollBody: false,
              child: Padding(
                padding: EdgeInsets.fromLTRB(
                  20,
                  24,
                  20,
                  PaynShell.contentBottomInset(context),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: PaynColors.surfaceDim,
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: const Icon(
                        Icons.search_off_rounded,
                        size: 26,
                        color: PaynColors.textTertiary,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      l10n.exploreNoOffersTitle,
                      style: theme.textTheme.titleLarge?.copyWith(fontSize: 18),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      l10n.exploreNoOffersDescription,
                      style: theme.textTheme.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 20),
                    FilledButton(
                      onPressed: controller.clearExploreFilters,
                      style: FilledButton.styleFrom(
                        minimumSize: const Size(180, 48),
                      ),
                      child: Text(l10n.exploreClearFilters),
                    ),
                  ],
                ),
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
                          (context, index) => const OfferCardSkeleton(),
                    )
                    : SliverList.separated(
                      itemCount: results.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final item = results[index];
                        // Compact OfferRow — save / compare / provider-handoff
                        // moves into the detail surface. Each row stays a
                        // single tap target (~108pt) so 5-6 fit per
                        // viewport instead of the previous one-card-per-
                        // screen takeover.
                        return OfferRow(
                          offer: item.offer,
                          onTap: () => context.push('/offer/${item.offer.id}'),
                          rankLabel: '#${index + 1}',
                          motionIndex: index,
                        );
                      },
                    ),
          ),

          SliverToBoxAdapter(
            child: SizedBox(height: PaynShell.contentBottomInset(context)),
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
          (a, b) => _recommendationScore(
            b.offer,
          ).compareTo(_recommendationScore(a.offer)),
        );
        break;
      case _ExploreSort.bestMatch:
        results.sort((a, b) => b.score.compareTo(a.score));
        break;
    }

    return results;
  }

  int _metricScore(PaynOffer offer) {
    final feeMetric = _metricValue(offer, const <String>[
      'Fee',
      'Fees',
      'Annual fee',
      'Monthly fee',
      'Spread',
      'FX markup',
      'Conversion fee',
    ]);
    return (_metricRange(feeMetric).min ?? 999999).round();
  }

  int _speedScore(PaynOffer offer) {
    switch (offer.attributes.speed) {
      case 'instant':
        return 0;
      case 'same_day':
        return 1;
      case 'next_day':
        return 2;
    }

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
    final partnerBoost = offer.attributes.isPartner ? 2 : 0;
    final updatedAt = DateTime.tryParse(offer.updatedAt);
    final freshness =
        updatedAt == null
            ? 0
            : (updatedAt.millisecondsSinceEpoch / 1000000000000);
    return partnerBoost + freshness + offer.affiliatePriorityScore;
  }

  String? _metricValue(PaynOffer offer, List<String> labels) {
    for (final metric in offer.metrics) {
      if (labels.contains(metric.label)) {
        return metric.value;
      }
    }
    return null;
  }

  _NumberRange _metricRange(String? value) {
    if (value == null || value.isEmpty) {
      return const _NumberRange();
    }
    final numbers =
        RegExp(r'(\d+(?:[.,]\d+)?)')
            .allMatches(value)
            .map(
              (match) => double.tryParse(match.group(1)!.replaceAll(',', '')),
            )
            .whereType<double>()
            .toList();
    if (numbers.isEmpty) {
      return const _NumberRange();
    }
    return _NumberRange(min: numbers.first, max: numbers.last);
  }

  String _sortLabel(_ExploreSort option, dynamic l10n) {
    switch (option) {
      case _ExploreSort.bestMatch:
        return l10n.exploreSortBestMatch;
      case _ExploreSort.lowestFee:
        return l10n.exploreSortLowestFee;
      case _ExploreSort.fastest:
        return l10n.exploreSortFastest;
      case _ExploreSort.recommended:
        return l10n.exploreSortRecommended;
    }
  }

  Future<void> _openFilterSheet(
    BuildContext context,
    AppController controller,
  ) async {
    final current = controller.exploreFilters;
    var draft = current;
    final reduceMotion = PaynMotion.reduce(context);

    await showModalBottomSheet<void>(
      context: context,
      useRootNavigator: true,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black.withValues(alpha: 0.24),
      clipBehavior: Clip.none,
      sheetAnimationStyle: AnimationStyle(
        duration: reduceMotion ? Duration.zero : PaynMotion.sheet,
        reverseDuration: reduceMotion ? Duration.zero : PaynMotion.medium,
        curve: PaynMotion.ease,
        reverseCurve: Curves.easeInCubic,
      ),
      builder: (context) {
        final theme = Theme.of(context);
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.72,
          minChildSize: 0.42,
          maxChildSize: 0.92,
          snap: true,
          snapSizes: const <double>[0.42, 0.72, 0.92],
          builder: (context, scrollController) {
            return DecoratedBox(
              decoration: const BoxDecoration(
                color: PaynColors.surface,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                boxShadow: <BoxShadow>[
                  BoxShadow(
                    color: Color(0x1F000000),
                    blurRadius: 28,
                    offset: Offset(0, -8),
                  ),
                ],
              ),
              child: StatefulBuilder(
                builder: (context, setState) {
                  final l10n = context.l10n;
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
                      controller: scrollController,
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
                        Text(
                          l10n.exploreFiltersTitle,
                          style: theme.textTheme.titleLarge,
                        ),
                        const SizedBox(height: 14),
                        DropdownButtonFormField<PaynMarket>(
                          initialValue: controller.preferences.market,
                          decoration: InputDecoration(
                            labelText: l10n.exploreMarketLabel,
                          ),
                          items:
                              PaynMarket.values
                                  .map(
                                    (market) => DropdownMenuItem<PaynMarket>(
                                      value: market,
                                      child: Text(market.localizedLabel(l10n)),
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
                          decoration: InputDecoration(
                            labelText: l10n.exploreProviderLabel,
                          ),
                          items:
                              providerOptions
                                  .map(
                                    (p) => DropdownMenuItem(
                                      value: p,
                                      child: Text(p),
                                    ),
                                  )
                                  .toList(),
                          onChanged: (value) {
                            setState(
                              () =>
                                  draft = draft.copyWith(provider: value ?? ''),
                            );
                          },
                        ),
                        const SizedBox(height: 10),
                        DropdownButtonFormField<String>(
                          initialValue:
                              draft.feature.isEmpty ? null : draft.feature,
                          decoration: InputDecoration(
                            labelText: l10n.exploreFeatureLabel,
                          ),
                          items:
                              featureOptions
                                  .map(
                                    (f) => DropdownMenuItem(
                                      value: f,
                                      child: Text(f),
                                    ),
                                  )
                                  .toList(),
                          onChanged: (value) {
                            setState(
                              () =>
                                  draft = draft.copyWith(feature: value ?? ''),
                            );
                          },
                        ),
                        if (subtypeOptions.isNotEmpty) ...<Widget>[
                          const SizedBox(height: 10),
                          DropdownButtonFormField<String>(
                            initialValue:
                                draft.subtype.isEmpty ? null : draft.subtype,
                            decoration: InputDecoration(
                              labelText: l10n.exploreSubtypeLabel,
                            ),
                            items:
                                subtypeOptions
                                    .map(
                                      (s) => DropdownMenuItem(
                                        value: s,
                                        child: Text(s),
                                      ),
                                    )
                                    .toList(),
                            onChanged: (value) {
                              setState(
                                () =>
                                    draft = draft.copyWith(
                                      subtype: value ?? '',
                                    ),
                              );
                            },
                          ),
                        ],
                        if (isLoans) ...<Widget>[
                          const SizedBox(height: 14),
                          Text(
                            l10n.exploreAmountLabel(
                              formatCurrencyLabel(
                                draft.amount,
                                controller.preferences.market,
                              ),
                            ),
                            style: theme.textTheme.labelLarge,
                          ),
                          Slider(
                            value: draft.amount.toDouble(),
                            min: 1000,
                            max: 60000,
                            divisions: 59,
                            onChanged: (value) {
                              setState(
                                () =>
                                    draft = draft.copyWith(
                                      amount: value.round(),
                                    ),
                              );
                            },
                          ),
                          Text(
                            l10n.exploreTermLabel(draft.term),
                            style: theme.textTheme.labelLarge,
                          ),
                          Slider(
                            value: draft.term.toDouble(),
                            min: 6,
                            max: 84,
                            divisions: 13,
                            onChanged: (value) {
                              setState(
                                () =>
                                    draft = draft.copyWith(term: value.round()),
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
                                child: Text(l10n.commonClear),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: FilledButton(
                                onPressed: () {
                                  controller.updateExploreFilters(draft);
                                  Navigator.of(context).pop();
                                },
                                child: Text(l10n.exploreApply),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            );
          },
        );
      },
    );
  }
}

class _CatalogErrorBanner extends StatelessWidget {
  const _CatalogErrorBanner({required this.loading, required this.onRetry});

  final bool loading;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: PaynColors.surfaceDim,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: PaynColors.outline),
      ),
      child: Row(
        children: <Widget>[
          const Icon(
            Icons.cloud_off_rounded,
            size: 18,
            color: PaynColors.textSecondary,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              l10n.catalogSyncError,
              style: theme.textTheme.bodyMedium,
            ),
          ),
          TextButton(
            onPressed: loading ? null : onRetry,
            child: Text(
              loading ? l10n.providerOpeningMessage : l10n.commonRetry,
            ),
          ),
        ],
      ),
    );
  }
}

// _IntentSummaryBar removed — it lived in the Explore header to surface
// the current filter values (amount / term / country / category) but
// for guest users it just printed the defaults (EUR25K · 60mo · All
// Europe · All), reading as random noise. Filter values are now
// surfaced only inside the filter sheet where they actually edit.

// _CompareFooter removed alongside the OfferCard → OfferRow swap. The
// row no longer carries a per-card compare toggle; the compare flow
// will live inside the detail screen + a dedicated compare bottom-sheet
// in the next pass.

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
    required this.detail,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final String detail;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          constraints: const BoxConstraints(minWidth: 84),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: selected ? PaynColors.accent : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: selected ? Colors.transparent : PaynColors.outlineSubtle,
            ),
            boxShadow:
                selected
                    ? <BoxShadow>[
                      BoxShadow(
                        color: PaynColors.accent.withValues(alpha: 0.22),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ]
                    : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Flexible(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: selected ? Colors.white : PaynColors.text,
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color:
                      selected
                          ? Colors.white.withValues(alpha: 0.22)
                          : PaynColors.surfaceDim,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  detail,
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: selected ? Colors.white : PaynColors.textTertiary,
                    fontWeight: FontWeight.w700,
                    fontSize: 10,
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

class _SortChip extends StatelessWidget {
  const _SortChip({
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

    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(999),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          curve: Curves.easeOutCubic,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: selected ? PaynColors.accent : PaynColors.surface,
            borderRadius: BorderRadius.circular(999),
            border: Border.all(
              color: selected ? Colors.transparent : PaynColors.outlineSubtle,
            ),
            boxShadow:
                selected
                    ? <BoxShadow>[
                      BoxShadow(
                        color: PaynColors.accent.withValues(alpha: 0.18),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      ),
                    ]
                    : null,
          ),
          child: Text(
            label,
            style: theme.textTheme.labelLarge?.copyWith(
              color: selected ? Colors.white : PaynColors.textSecondary,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
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
      color: hasFilters ? PaynColors.accent : PaynColors.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side:
            hasFilters
                ? BorderSide.none
                : const BorderSide(color: PaynColors.outlineSubtle),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Icon(
                Icons.tune_rounded,
                size: 16,
                color:
                    hasFilters ? PaynColors.surface : PaynColors.textSecondary,
              ),
              const SizedBox(width: 6),
              Text(
                hasFilters
                    ? '${context.l10n.exploreFiltersTitle} $count'
                    : context.l10n.exploreFiltersTitle,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.labelMedium?.copyWith(
                  color:
                      hasFilters
                          ? PaynColors.surface
                          : PaynColors.textSecondary,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      ),
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
      title: context.l10n.exploreMarketIntelligenceTitle,
      subtitle: context.l10n.exploreMarketIntelligenceSubtitle,
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
                        label: Text(asset.localizedLabel(context.l10n)),
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
                    context.l10n.exploreMarketDataUnavailable,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                );
              }

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: <Widget>[
                      ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 220),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              data.asset.localizedPriceLabel(context.l10n),
                              style: Theme.of(context).textTheme.labelMedium,
                            ),
                            const SizedBox(height: 6),
                            Text(
                              data.currentValueLabel,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
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
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
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
                        label: data.asset.localizedLabel(context.l10n),
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
                    context.l10n.exploreMarketTrendsTitle,
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
                                trend.asset.localizedLabel(context.l10n),
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
                    context.l10n.exploreMarketInsightsTitle,
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
                    context.l10n.exploreMarketRecommendationsTitle,
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
