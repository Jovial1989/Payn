import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/localization/app_localizations_ext.dart';
import 'package:payn_mobile/l10n/app_localizations.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/core/utils/formatters.dart';
import 'package:payn_mobile/shared/models/analytics_models.dart';
import 'package:payn_mobile/shared/models/payn_job.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';
import 'package:payn_mobile/shared/services/analytics_service.dart';
import 'package:payn_mobile/shared/services/app_controller.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';
import 'package:payn_mobile/shared/services/quick_filters.dart';
import 'package:payn_mobile/shared/widgets/analytics_view_tracker.dart';
import 'package:payn_mobile/shared/widgets/market_chart.dart';
import 'package:payn_mobile/shared/widgets/offer_row.dart';
import 'package:payn_mobile/shared/widgets/payn_motion.dart';
import 'package:payn_mobile/shared/widgets/payn_shell.dart';
import 'package:payn_mobile/shared/widgets/skeleton_card.dart';

enum _ExploreSort { bestMatch, lowestFee, fastest, recommended }

// SIMP — Show only 3 sorts in the row. "Top picks" (recommended)
// duplicated "Best match" and muddied which one is the default (P1.3).
// It stays in the enum for back-compat but is no longer surfaced.
const List<_ExploreSort> _kVisibleSorts = <_ExploreSort>[
  _ExploreSort.bestMatch,
  _ExploreSort.lowestFee,
  _ExploreSort.fastest,
];

// Order of Explore category pills — mirrors web's 9 OUTCOME_BUCKETS
// (Cards / Saving / Sending money / Bank accounts / Investing /
// Borrowing / For business / Family / Insurance). Labels post-TASK-302
// (PR-V3-02); the underlying enum values stay stable.
//
// Mobile collapses the same categories web's bucket UI collapses:
//   • debit / travel / cashback   → folded into Cards
//   • remittance                  → folded into Sending money
//   • exchange                    → folded into Sending money
//   • neobanks / wallets          → folded into Bank accounts
//   • trading                     → folded into Investing
//   • crypto                      → kept as its own enum value but
//                                    not shown as a pill (web bundles
//                                    it under Investing too)
//   • bnpl                        → folded into Borrowing
//   • payroll / tax / expense     → folded into For business
//   • budgeting                   → folded into Family
//
// The mapping happens at parse time in _categoryFromName so the API's
// 21 granular categories all land on one of these 9 enum members.
const List<PaynCategory> _exploreBucketOrder = <PaynCategory>[
  PaynCategory.cards,
  PaynCategory.savings,
  PaynCategory.transfers,
  PaynCategory.banking,
  PaynCategory.investments,
  PaynCategory.loans,
  PaynCategory.business,
  PaynCategory.kids,
  PaynCategory.insurance,
];

// TASK-302 (PR-V3-02). The pill labels here are the user-visible
// bucket names on the Explore tab. They now defer to the locale-
// resolved category label everywhere — the previous hardcoded English
// overrides ("Savings & Deposits", "Loans & BNPL", "Family & Kids")
// duplicated the ARB strings *and* broke localisation. The single
// case we still override is `cards`, because the underlying enum is
// "Credit Cards" which is narrower than the bucket we render.
String _bucketLabel(PaynCategory category, AppLocalizations l10n) {
  // Cards bucket folds debit / credit / travel / cashback — keep the
  // shorter "Cards" pill rather than the enum's narrower "Credit Cards".
  if (category == PaynCategory.cards) return l10n.categoryCards;
  return category.localizedLabel(l10n);
}

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
  Timer? _searchDebounce;

  // P0.2 — Category pill row scroll controller. The horizontal
  // ListView previously had no controller; on cold open Flutter
  // sometimes restored a stale offset (e.g. after rebuilds from the
  // StatefulShellRoute preserving state), leaving the first "All N"
  // pill scrolled past the left edge. Attaching a controller +
  // jumping to 0 on first frame guarantees the leftmost pill is
  // fully visible whenever Explore mounts.
  final ScrollController _categoryScrollController = ScrollController();

  // MOB.2 — Outer scroll controller for the main CustomScrollView. We
  // need it to reset the vertical scroll position to 0 every time the
  // user switches category (e.g. scrolled deep into Cards, then taps
  // Loans — the new bucket must open from the top, not from the
  // previous offset). Without this, Flutter preserves the existing
  // offset on rebuild because the CustomScrollView's identity stays
  // the same.
  final ScrollController _resultsScrollController = ScrollController();

  // Tracks the last category we saw; when it changes we schedule a
  // scroll-to-top in the next post-frame callback. Storing this in
  // widget state (rather than reading from controller.preferences in
  // every build) lets us detect the *transition* — first build sets
  // the baseline; subsequent builds compare against it.
  PaynCategory? _lastTrackedCategory;
  bool _isFirstCategoryRead = true;

  bool _searchVisible = false;
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || !_categoryScrollController.hasClients) return;
      _categoryScrollController.jumpTo(0);
    });
  }

  @override
  void dispose() {
    _searchDebounce?.cancel();
    _categoryScrollController.dispose();
    _resultsScrollController.dispose();
    _searchController.dispose();
    _searchFocusNode.dispose();
    super.dispose();
  }

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

    // MOB.2 — Detect category change and reset vertical scroll. We
    // compare the current category against the one we tracked on the
    // previous build; if it changed, schedule a jumpTo(0) in the next
    // frame so the new bucket opens from the top instead of inheriting
    // the previous offset. The `_isFirstCategoryRead` guard prevents
    // an unnecessary scroll on the very first build when there's no
    // offset to reset.
    final currentCategory = controller.selectedExploreCategory;
    if (_isFirstCategoryRead) {
      _isFirstCategoryRead = false;
      _lastTrackedCategory = currentCategory;
    } else if (_lastTrackedCategory != currentCategory) {
      _lastTrackedCategory = currentCategory;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted || !_resultsScrollController.hasClients) return;
        // jumpTo (not animateTo) — the cascade entrance animation on
        // OfferRow already gives the new list a "fresh paint" feel,
        // adding a 300ms scroll-up animation on top would feel laggy.
        _resultsScrollController.jumpTo(0);
      });
    }

    return SafeArea(
      bottom: false,
      child: CustomScrollView(
        controller: _resultsScrollController,
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
            child: Container(
                padding: EdgeInsets.fromLTRB(
                  20,
                  _searchVisible ? 14 : 18,
                  20,
                  _searchVisible ? 14 : 16,
                ),
                decoration: const BoxDecoration(
                  color: PaynColors.surface,
                ),
                child: _searchVisible
                    ? Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: <Widget>[
                              Icon(
                                Icons.search_rounded,
                                size: 18,
                                color: PaynColors.textSecondary,
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: TextField(
                                  controller: _searchController,
                                  focusNode: _searchFocusNode,
                                  style: theme.textTheme.bodyLarge?.copyWith(
                                    color: PaynColors.text,
                                    fontWeight: FontWeight.w600,
                                    letterSpacing: -0.2,
                                    fontSize: 17,
                                  ),
                                  onChanged: (String value) {
                                    _pulseLoading();
                                    controller.updateExploreFilters(
                                      controller.exploreFilters.copyWith(
                                        query: value,
                                      ),
                                    );
                                    if (value.isNotEmpty) {
                                      _searchDebounce?.cancel();
                                      _searchDebounce = Timer(
                                        const Duration(milliseconds: 600),
                                        () {
                                          final activeCategory =
                                              controller.selectedExploreCategory;
                                          unawaited(
                                            controller.analytics.track(
                                              AnalyticsEvents.searchUsed,
                                              properties: controller.analytics
                                                  .buildDefaultProperties(
                                                preferences: controller.preferences,
                                                loggedIn: controller.isAuthenticated,
                                                category: activeCategory,
                                                extra: <String, dynamic>{
                                                  'query_length': value.length,
                                                },
                                              ),
                                            ),
                                          );
                                        },
                                      );
                                    }
                                  },
                                  decoration: InputDecoration(
                                    hintText: l10n.exploreSearchPlaceholder,
                                    hintStyle: TextStyle(
                                      color: PaynColors.textTertiary,
                                    ),
                                    filled: true,
                                    fillColor: Colors.transparent,
                                    border: InputBorder.none,
                                    enabledBorder: InputBorder.none,
                                    focusedBorder: InputBorder.none,
                                    isDense: true,
                                    contentPadding: EdgeInsets.zero,
                                    suffixIcon: controller.exploreFilters.query.isEmpty
                                        ? null
                                        : GestureDetector(
                                            onTap: () {
                                              _searchController.clear();
                                              _pulseLoading();
                                              controller.updateExploreFilters(
                                                controller.exploreFilters.copyWith(
                                                  query: '',
                                                ),
                                              );
                                            },
                                            child: const Icon(
                                              Icons.close_rounded,
                                              size: 15,
                                              color: PaynColors.textSecondary,
                                            ),
                                          ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 14),
                              GestureDetector(
                                onTap: () {
                                  HapticFeedback.selectionClick();
                                  setState(() => _searchVisible = false);
                                  _searchController.clear();
                                  _searchFocusNode.unfocus();
                                  _pulseLoading();
                                  controller.updateExploreFilters(
                                    controller.exploreFilters.copyWith(query: ''),
                                  );
                                },
                                child: Text(
                                  'Cancel',
                                  style: theme.textTheme.labelLarge?.copyWith(
                                    color: PaynColors.accent,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 15,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          if (controller.activeFilterCount > 0 &&
                              (controller.exploreCategoryTotal - results.length) >
                                  0) ...<Widget>[
                            const SizedBox(height: 8),
                            Row(
                              children: <Widget>[
                                Flexible(
                                  child: Text(
                                    '${results.length} of ${controller.exploreCategoryTotal} · ${controller.exploreCategoryTotal - results.length} filtered',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: theme.textTheme.labelMedium?.copyWith(
                                      color: PaynColors.textSecondary,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                InkWell(
                                  onTap: () {
                                    HapticFeedback.selectionClick();
                                    controller.clearExploreFilters();
                                  },
                                  borderRadius: BorderRadius.circular(999),
                                  child: Padding(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 2,
                                    ),
                                    child: Text(
                                      'Reset',
                                      style: theme.textTheme.labelMedium?.copyWith(
                                        color: PaynColors.accent,
                                        fontWeight: FontWeight.w700,
                                        decoration: TextDecoration.underline,
                                        decorationColor: PaynColors.accent,
                                        decorationThickness: 1.4,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ],
                      )
                    : _ExploreHeader(
                        visibleCount: results.length,
                        scopeLabel: controller.selectedExploreCategory != null
                            ? _bucketLabel(
                                controller.selectedExploreCategory!,
                                l10n,
                              )
                            : null,
                        totalInCategory: controller.exploreCategoryTotal,
                        marketLabel:
                            controller.preferences.market.localizedLabel(l10n),
                        hasFilters: controller.activeFilterCount > 0 ||
                            controller.exploreFilters.subtype.isNotEmpty ||
                            controller.exploreFilters.quickFilter.isNotEmpty ||
                            controller.exploreFilters.query.isNotEmpty,
                        onReset: () {
                          HapticFeedback.selectionClick();
                          controller.clearExploreFilters();
                        },
                        onMarketTap: () => _openMarketSheet(context, controller),
                        searchActive: false,
                        onSearchTap: () {
                          HapticFeedback.selectionClick();
                          setState(() => _searchVisible = true);
                          WidgetsBinding.instance.addPostFrameCallback((_) {
                            if (mounted) _searchFocusNode.requestFocus();
                          });
                        },
                        filterButton: _FilterButton(
                          count: controller.activeFilterCount,
                          onTap: () {
                            HapticFeedback.selectionClick();
                            _pulseLoading();
                            _openFilterSheet(context, controller);
                          },
                        ),
                      ),
              ),
          ),

          SliverPersistentHeader(
            pinned: true,
            delegate: _StickyExploreControls(
              minExtent: 132,
              maxExtent: 132,
              child: Container(
                decoration: const BoxDecoration(
                  color: PaynColors.surface,
                  border: Border(
                    bottom: BorderSide(color: PaynColors.outlineSubtle),
                  ),
                ),
                padding: const EdgeInsets.only(top: 8, bottom: 14),
                child: Column(
                  children: <Widget>[
                    // P0.2 — Category pill row with attached scroll
                    // controller (jumps to offset 0 on mount, see
                    // initState) and edge-fade masks so the user always
                    // sees the leftmost pill on first paint AND gets a
                    // visual cue ("more →") that the row scrolls.
                    SizedBox(
                      height: 56,
                      child: ShaderMask(
                        shaderCallback: (Rect bounds) {
                          return const LinearGradient(
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                            colors: <Color>[
                              Colors.transparent,
                              Colors.black,
                              Colors.black,
                              Colors.transparent,
                            ],
                            stops: <double>[0.0, 0.04, 0.96, 1.0],
                          ).createShader(bounds);
                        },
                        blendMode: BlendMode.dstIn,
                        child: ListView.separated(
                          controller: _categoryScrollController,
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          itemCount: _exploreBucketOrder.length + 1,
                          separatorBuilder: (_, __) => const SizedBox(width: 8),
                          itemBuilder: (context, index) {
                            if (index == 0) {
                              final selected =
                                  controller.selectedExploreCategory == null;
                              return _ControlChip(
                                label: l10n.exploreAll,
                                detail: '${controller.exploreResults.length}',
                                selected: selected,
                                icon: Icons.grid_view_rounded,
                                onTap: () {
                                  _pulseLoading();
                                  controller.setExploreCategory(null);
                                },
                              );
                            }
                            // Iterate by web-aligned bucket order, not
                            // raw PaynCategory.values. Labels are
                            // remapped to match the web Atlas grid
                            // ("Cards" not "Credit Cards", "Borrowing"
                            // not "Loans", "Family" not "Kids'
                            // accounts") per TASK-302 (PR-V3-02).
                            final category = _exploreBucketOrder[index - 1];
                            final count =
                                controller.categoryCounts[category] ?? 0;
                            return _ControlChip(
                              label: _bucketLabel(category, l10n),
                              detail: '$count',
                              icon: category.tabIcon,
                              selected:
                                  controller.selectedExploreCategory ==
                                  category,
                              onTap: () {
                                _pulseLoading();
                                controller.setExploreCategory(category);
                                unawaited(
                                  controller.analytics.track(
                                    AnalyticsEvents.filterApplied,
                                    properties: controller.analytics
                                        .buildDefaultProperties(
                                      preferences: controller.preferences,
                                      loggedIn: controller.isAuthenticated,
                                      category: category,
                                      extra: <String, dynamic>{
                                        'filter_type': 'category',
                                        'filter_value': category.name,
                                      },
                                    ),
                                  ),
                                );
                              },
                            );
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    // P0.8 — Sort chip row was clipping "Recommended" to
                    // "Recom…" on phone widths. Same fade-mask treatment
                    // as the category pill row above + the last chip
                    // now reads "Top picks" (8 chars vs 11) so the full
                    // word fits on iPhone SE / 13 mini without scroll.
                    SizedBox(
                      height: 42,
                      child: ShaderMask(
                        shaderCallback: (Rect bounds) {
                          return const LinearGradient(
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                            colors: <Color>[
                              Colors.transparent,
                              Colors.black,
                              Colors.black,
                              Colors.transparent,
                            ],
                            stops: <double>[0.0, 0.04, 0.96, 1.0],
                          ).createShader(bounds);
                        },
                        blendMode: BlendMode.dstIn,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          itemCount: _kVisibleSorts.length,
                          separatorBuilder: (_, __) => const SizedBox(width: 8),
                          itemBuilder: (context, index) {
                            final option = _kVisibleSorts[index];
                            return _SortChip(
                              label: _sortLabel(option, l10n),
                              selected: _sort == option,
                              onTap: () {
                                HapticFeedback.selectionClick();
                                _pulseLoading();
                                setState(() => _sort = option);
                                unawaited(
                                  controller.analytics.track(
                                    AnalyticsEvents.sortChanged,
                                    properties: controller.analytics
                                        .buildDefaultProperties(
                                      preferences: controller.preferences,
                                      loggedIn: controller.isAuthenticated,
                                      extra: <String, dynamic>{
                                        'sort_by': option.name,
                                      },
                                    ),
                                  ),
                                );
                              },
                            );
                          },
                        ),
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
          // Second sticky header — keeps the deep-filter affordances
          // (insurance subtype chips + per-category dimension pills)
          // visible as the user scrolls through the offer list. Without
          // this, refining "Lowest fee" after scrolling past 4 offers
          // means scrolling back up to reach the chips. Matches the web
          // sticky-filter-row pattern.
          if (_stickyFilterExtent(controller) > 0)
            SliverPersistentHeader(
              pinned: true,
              delegate: _StickyDeepFilters(
                extent: _stickyFilterExtent(controller),
                controller: controller,
              ),
            ),
          // ── Empty state ──
          // P1.7 — Don't flash the empty state while the catalog is
          // still loading; defer to the skeleton above.
          if (!_showSkeleton &&
              !controller.catalogLoading &&
              results.isEmpty)
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
            // P1.7 — Skeleton fires for both the transient _showSkeleton
            // pulse (category/filter switches) AND for the initial
            // catalog load while results haven't materialised yet.
            // First-time visitors used to see a blank surface for the
            // ~700ms catalog round-trip; now they get visual progress.
            sliver:
                _showSkeleton ||
                        (controller.catalogLoading && results.isEmpty)
                    ? SliverList.separated(
                      itemCount: controller.catalogLoading ? 6 : 3,
                      separatorBuilder: (_, __) => const SizedBox(height: 16),
                      itemBuilder:
                          (context, index) => const OfferCardSkeleton(),
                    )
                    : SliverList.separated(
                      itemCount: results.length,
                      separatorBuilder: (_, __) {
                        return const SizedBox(height: 10);
                      },
                      itemBuilder: (context, index) {
                        final item = results[index];
                        // Compact OfferRow — save / compare / provider-handoff
                        // moves into the detail surface. Each row stays a
                        // single tap target (~108pt) so 5-6 fit per
                        // viewport instead of the previous one-card-per-
                        // screen takeover.
                        // P2.5 — ValueKey on offer.id forces a fresh
                        // _OfferRowState (and therefore a fresh entrance
                        // animation) when the user swaps category /
                        // sort. Without the key, Flutter reuses State
                        // by position so the cascade only plays on the
                        // very first paint of Explore.
                        final row = OfferRow(
                          key: ValueKey<String>('row-${item.offer.id}'),
                          offer: item.offer,
                          onTap: () => context.push('/offer/${item.offer.id}'),
                          rankLabel: '#${index + 1}',
                          // P1.8 — Pass ranking reasons through to
                          // OfferRow only for the #1 spot. The row
                          // itself short-circuits the pill rendering
                          // for ranks 2+.
                          rankReasons: index == 0 ? item.reasons : null,
                          motionIndex: index,
                        );
                        // P2.4 — Rank #1 gets a hero treatment. The
                        // emerald gradient band + tinted card frame
                        // makes the top match scannable in <1s and
                        // earns its position at the top of the list.
                        if (index == 0) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 6),
                            child: _TopMatchHero(child: row),
                          );
                        }
                        return row;
                      },
                    ),
          ),

          SliverToBoxAdapter(
            // MOB.10 — The Compare-bar overlay is gone (no floating /
            // docked ribbon anymore), so a fixed bottom inset matching
            // the bare nav height is enough — nothing floats above it
            // that the list needs to clear.
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
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.82,
          minChildSize: 0.5,
          maxChildSize: 0.96,
          snap: true,
          snapSizes: const <double>[0.5, 0.82, 0.96],
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
              child: _FilterPanel(
                controller: controller,
                scrollController: scrollController,
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _openMarketSheet(
    BuildContext context,
    AppController controller,
  ) async {
    HapticFeedback.selectionClick();
    final reduceMotion = PaynMotion.reduce(context);
    await showModalBottomSheet<void>(
      context: context,
      useRootNavigator: true,
      isScrollControlled: false,
      backgroundColor: PaynColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      sheetAnimationStyle: AnimationStyle(
        duration: reduceMotion ? Duration.zero : PaynMotion.sheet,
        reverseDuration: reduceMotion ? Duration.zero : PaynMotion.medium,
        curve: PaynMotion.ease,
      ),
      builder: (sheetContext) => _MarketPickerSheet(controller: controller),
    );
  }
}

// Comprehensive filter panel that mirrors web's filter pill row. Every
// dimension web exposes (market · sort · per-category quick filters ·
// subtype for insurance · provider · loans amount/term) is a clearly
// labelled chip group inside the sheet — no nested dropdowns, no hidden
// "more" surface. The previous sheet stacked three opaque DropdownButtons
// which read as a Material form rather than a marketplace filter panel.
class _FilterPanel extends StatefulWidget {
  const _FilterPanel({
    required this.controller,
    required this.scrollController,
  });

  final AppController controller;
  final ScrollController scrollController;

  @override
  State<_FilterPanel> createState() => _FilterPanelState();
}

class _FilterPanelState extends State<_FilterPanel> {
  late ExploreFilters _draft;
  late PaynMarket _market;

  @override
  void initState() {
    super.initState();
    _draft = widget.controller.exploreFilters;
    _market = widget.controller.preferences.market;
  }

  void _set(ExploreFilters next) => setState(() => _draft = next);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;
    final category = widget.controller.selectedExploreCategory;
    final quickOptions =
        category == null ? const <QuickFilterOption>[] : (kQuickFilters[category] ?? const <QuickFilterOption>[]);

    final providers = widget.controller.providerOptions;
    final subtypes = widget.controller.subtypeOptions;
    final isLoans = category == PaynCategory.loans;

    return Padding(
      padding: EdgeInsets.fromLTRB(
        16,
        12,
        16,
        16 + MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Column(
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
          const SizedBox(height: 14),
          Row(
            children: <Widget>[
              Expanded(
                child: Text(
                  l10n.exploreFiltersTitle,
                  style: theme.textTheme.titleLarge,
                ),
              ),
              TextButton(
                onPressed: () {
                  widget.controller.clearExploreFilters();
                  setState(() {
                    _draft = const ExploreFilters();
                  });
                },
                child: Text(l10n.commonClear),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Expanded(
            child: ListView(
              controller: widget.scrollController,
              padding: EdgeInsets.zero,
              children: <Widget>[
                _FilterGroup(
                  label: l10n.exploreMarketLabel,
                  children: <Widget>[
                    for (final m in PaynMarket.values)
                      _PillChip(
                        label: m.localizedLabel(l10n),
                        selected: _market == m,
                        onTap: () => setState(() => _market = m),
                      ),
                  ],
                ),
                if (subtypes.isNotEmpty)
                  _FilterGroup(
                    label: l10n.exploreSubtypeLabel,
                    children: <Widget>[
                      for (final s in subtypes)
                        _PillChip(
                          label: s[0].toUpperCase() + s.substring(1),
                          selected: _draft.subtype == s,
                          onTap: () => _set(
                            _draft.copyWith(
                              subtype: _draft.subtype == s ? '' : s,
                            ),
                          ),
                        ),
                    ],
                  ),
                if (quickOptions.isNotEmpty)
                  ..._buildQuickFilterGroups(category!, quickOptions),
                if (isLoans)
                  _LoanRangeSliders(
                    draft: _draft,
                    market: _market,
                    onChange: _set,
                  ),
                if (providers.length > 1)
                  _FilterGroup(
                    label: l10n.exploreProviderLabel,
                    children: <Widget>[
                      _PillChip(
                        label: 'All',
                        selected: _draft.provider.isEmpty,
                        onTap: () => _set(_draft.copyWith(provider: '')),
                      ),
                      for (final p in providers.take(40))
                        _PillChip(
                          label: p,
                          selected: _draft.provider == p,
                          onTap: () => _set(
                            _draft.copyWith(
                              provider: _draft.provider == p ? '' : p,
                            ),
                          ),
                        ),
                    ],
                  ),
                const SizedBox(height: 8),
              ],
            ),
          ),
          Row(
            children: <Widget>[
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Cancel'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: FilledButton(
                  onPressed: () {
                    widget.controller.updateExploreFilters(_draft);
                    if (_market != widget.controller.preferences.market) {
                      widget.controller.updatePreferences(
                        widget.controller.preferences.copyWith(market: _market),
                      );
                      unawaited(
                        widget.controller.analytics.track(
                          AnalyticsEvents.countryChanged,
                          properties: widget.controller.analytics
                              .buildDefaultProperties(
                            preferences: widget.controller.preferences,
                            loggedIn: widget.controller.isAuthenticated,
                            country: _market.name,
                            extra: <String, dynamic>{
                              'country': _market.name,
                            },
                          ),
                        ),
                      );
                    }
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
  }

  // Group quick filter options by their "dimension" (the prefix before
  // the colon in the id — e.g. "loans:apr-under-5" → "apr"). That way
  // Loans renders three sub-groups (APR / Amount / Term) instead of one
  // wall of nine chips, matching web's per-dimension FilterSheet layout.
  List<Widget> _buildQuickFilterGroups(
    PaynCategory category,
    List<QuickFilterOption> options,
  ) {
    final groups = <String, List<QuickFilterOption>>{};
    for (final opt in options) {
      final colon = opt.id.indexOf(':');
      final tail = colon < 0 ? opt.id : opt.id.substring(colon + 1);
      final dashIdx = tail.indexOf('-');
      final dimension = dashIdx < 0 ? tail : tail.substring(0, dashIdx);
      groups.putIfAbsent(dimension, () => <QuickFilterOption>[]).add(opt);
    }

    return <Widget>[
      for (final entry in groups.entries)
        _FilterGroup(
          label: _quickGroupLabel(entry.key),
          children: <Widget>[
            for (final opt in entry.value)
              _PillChip(
                label: opt.label,
                selected: _draft.quickFilter == opt.id,
                onTap: () => _set(
                  _draft.copyWith(
                    quickFilter: _draft.quickFilter == opt.id ? '' : opt.id,
                  ),
                ),
              ),
          ],
        ),
    ];
  }

  String _quickGroupLabel(String dimension) {
    switch (dimension) {
      case 'apr':
        return 'APR';
      case 'amount':
        return 'Amount';
      case 'term':
        return 'Term';
      case 'rate':
        return 'Best rate';
      case 'min':
        return 'Minimum deposit';
      case 'access':
        return 'Access';
      case 'free':
        return 'Fee';
      case 'zero':
        return 'FX fee';
      case 'instant':
      case '24h':
      case 'multi':
        return 'Speed';
      case 'etf':
      case 'stocks':
      case 'crypto':
      case 'robo':
      case 'recurring':
        return 'Platform';
      case 'beginner':
      case 'advanced':
        return 'Best for';
      default:
        return dimension[0].toUpperCase() + dimension.substring(1);
    }
  }
}

class _FilterGroup extends StatelessWidget {
  const _FilterGroup({required this.label, required this.children});

  final String label;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    if (children.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(top: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            label.toUpperCase(),
            style: theme.textTheme.labelMedium?.copyWith(
              color: PaynColors.textTertiary,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.1,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: children,
          ),
        ],
      ),
    );
  }
}

class _PillChip extends StatelessWidget {
  const _PillChip({
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
      color: selected ? PaynColors.accent : PaynColors.surface,
      borderRadius: BorderRadius.circular(999),
      child: InkWell(
        onTap: () {
          HapticFeedback.selectionClick();
          onTap();
        },
        borderRadius: BorderRadius.circular(999),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(999),
            border: Border.all(
              color: selected ? PaynColors.accent : PaynColors.outlineSubtle,
            ),
          ),
          child: Text(
            label,
            style: theme.textTheme.labelMedium?.copyWith(
              color: selected ? PaynColors.surface : PaynColors.text,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }
}

class _LoanRangeSliders extends StatelessWidget {
  const _LoanRangeSliders({
    required this.draft,
    required this.market,
    required this.onChange,
  });

  final ExploreFilters draft;
  final PaynMarket market;
  final ValueChanged<ExploreFilters> onChange;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;

    return Padding(
      padding: const EdgeInsets.only(top: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            l10n.exploreAmountLabel(
              formatCurrencyLabel(draft.amount, market),
            ),
            style: theme.textTheme.labelLarge,
          ),
          Slider(
            value: draft.amount.toDouble(),
            min: 1000,
            max: 60000,
            divisions: 59,
            onChanged: (v) => onChange(draft.copyWith(amount: v.round())),
          ),
          const SizedBox(height: 4),
          Text(
            l10n.exploreTermLabel(draft.term),
            style: theme.textTheme.labelLarge,
          ),
          Slider(
            value: draft.term.toDouble(),
            min: 6,
            max: 84,
            divisions: 13,
            onChanged: (v) => onChange(draft.copyWith(term: v.round())),
          ),
        ],
      ),
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

// Calculate the pinned height required for the deep-filter row. Each
// affordance (insurance subtype chips, dimension pills) adds its own
// fixed slice; total is 0 when no deep filters apply (e.g. no category
// selected) so the sliver collapses entirely.
double _stickyFilterExtent(AppController controller) {
  final cat = controller.selectedExploreCategory;
  double extent = 0;
  if (cat == PaynCategory.insurance || cat == PaynCategory.cards) {
    // 38pt chips + 12pt top padding + 8pt below
    extent += 58;
  }
  if (_quickFilterCategory(cat) != null) {
    // Insurance dimension facets are per-subtype — _DimensionPillRow returns
    // an empty box until a subtype chip is active. Reserving its 58pt slot
    // before then is what produced the hollow white band above the results,
    // so only count it once it will actually paint.
    final dimsWillRender = cat == PaynCategory.insurance
        ? controller.exploreFilters.subtype.isNotEmpty
        : true;
    // 42pt dimension pills + 10pt top padding + 6pt below
    if (dimsWillRender) extent += 58;
  }
  return extent;
}

class _StickyDeepFilters extends SliverPersistentHeaderDelegate {
  const _StickyDeepFilters({required this.extent, required this.controller});

  final double extent;
  final AppController controller;

  @override
  double get minExtent => extent;

  @override
  double get maxExtent => extent;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    // ListenableBuilder is the fix for an earlier bug: the delegate
    // itself is a const-ish object built once per category-switch, and
    // `shouldRebuild` only compares constructor args. Without an
    // explicit listenable, tapping an Insurance subtype chip updated
    // the controller but the sticky strip never re-painted — the green
    // selected state was never reflected. Wrapping with ListenableBuilder
    // ensures every notifyListeners() flushes a fresh rebuild here so
    // chip + dimension-pill selected states stay in sync.
    return ListenableBuilder(
      listenable: controller,
      builder: (context, _) {
        final isInsurance =
            controller.selectedExploreCategory == PaynCategory.insurance;
        final isCards =
            controller.selectedExploreCategory == PaynCategory.cards;
        final hasDims =
            _quickFilterCategory(controller.selectedExploreCategory) != null;
        final hasSubtypeChips = isInsurance || isCards;
        return Container(
          decoration: BoxDecoration(
            color: PaynColors.background.withValues(alpha: 0.97),
            border: const Border(
              bottom: BorderSide(color: PaynColors.outlineSubtle, width: 0.5),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              if (isInsurance)
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 10, 20, 0),
                  child: _InsuranceSubtypeChips(controller: controller),
                ),
              if (isCards)
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 10, 20, 0),
                  child: _CardsSubtypeChips(controller: controller),
                ),
              if (hasDims)
                Padding(
                  padding:
                      EdgeInsets.fromLTRB(20, hasSubtypeChips ? 6 : 10, 20, 0),
                  child: _DimensionPillRow(controller: controller),
                ),
            ],
          ),
        );
      },
    );
  }

  @override
  bool shouldRebuild(covariant _StickyDeepFilters oldDelegate) {
    // Always rebuild — ListenableBuilder inside `build` re-paints on
    // controller changes regardless, but Flutter still needs `true` so
    // the delegate isn't cached when the parent slivers re-mount.
    return oldDelegate.extent != extent;
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
    required this.detail,
    required this.selected,
    required this.onTap,
    this.icon,
  });

  final String label;
  final String detail;
  final bool selected;
  final VoidCallback onTap;
  final IconData? icon;

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
            color: selected ? PaynColors.surface : Colors.transparent,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: selected
                  ? PaynColors.outlineSubtle
                  : Colors.transparent,
            ),
            boxShadow: selected
                ? <BoxShadow>[
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.06),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ]
                : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              if (icon != null) ...<Widget>[
                Icon(
                  icon,
                  size: 15,
                  color: selected
                      ? PaynColors.accentStrong
                      : PaynColors.textTertiary,
                ),
                const SizedBox(width: 7),
              ],
              Flexible(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: selected
                        ? PaynColors.accentStrong
                        : PaynColors.textSecondary,
                    fontWeight: selected ? FontWeight.w700 : FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: selected
                      ? PaynColors.accentSurface
                      : PaynColors.surfaceDim,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  detail,
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: selected
                        ? PaynColors.accentStrong
                        : PaynColors.textTertiary,
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
            color: selected
                ? PaynColors.accentSurface
                : PaynColors.surfaceDim,
            borderRadius: BorderRadius.circular(999),
            border: Border.all(
              color: selected
                  ? Colors.transparent
                  : PaynColors.outlineSubtle,
            ),
          ),
          child: Text(
            label,
            style: theme.textTheme.labelLarge?.copyWith(
              color: selected
                  ? PaynColors.accentStrong
                  : PaynColors.textSecondary,
              fontWeight: selected ? FontWeight.w700 : FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }
}

// P0.5 — Header that reconciles "what's visible" vs "what's in the
// category". Big bold count + market name on the left, a soft "of M
// total" + Reset chip on the right when filters narrow the visible
// set. Without the second line the user sees `32` in the pill but
// only `5` in the body — that delta erodes trust in the ranking.
class _ExploreHeader extends StatelessWidget {
  const _ExploreHeader({
    required this.visibleCount,
    required this.totalInCategory,
    required this.marketLabel,
    required this.hasFilters,
    required this.onReset,
    required this.onMarketTap,
    required this.searchActive,
    required this.onSearchTap,
    required this.filterButton,
    this.scopeLabel,
  });

  final int visibleCount;
  final String? scopeLabel;
  final int totalInCategory;
  final String marketLabel;
  final bool hasFilters;
  final VoidCallback onReset;
  final VoidCallback onMarketTap;
  final bool searchActive;
  final VoidCallback onSearchTap;
  final Widget filterButton;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final hidden = totalInCategory - visibleCount;
    final showDelta = hasFilters && hidden > 0;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: <Widget>[
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Text(
                scopeLabel ?? 'All offers',
                style: theme.textTheme.titleLarge?.copyWith(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.3,
                  color: PaynColors.text,
                ),
              ),
              const SizedBox(height: 3),
              if (showDelta)
                Row(
                  children: <Widget>[
                    Flexible(
                      child: Text(
                        '$visibleCount of $totalInCategory · $hidden filtered',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.labelMedium?.copyWith(
                          color: PaynColors.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    InkWell(
                      onTap: onReset,
                      borderRadius: BorderRadius.circular(999),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        child: Text(
                          'Reset',
                          style: theme.textTheme.labelMedium?.copyWith(
                            color: PaynColors.accent,
                            fontWeight: FontWeight.w700,
                            decoration: TextDecoration.underline,
                            decorationColor: PaynColors.accent,
                            decorationThickness: 1.4,
                          ),
                        ),
                      ),
                    ),
                  ],
                )
              else
                Text(
                  '$visibleCount options in $marketLabel',
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: PaynColors.textSecondary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        _SearchIconButton(active: searchActive, onTap: onSearchTap),
        const SizedBox(width: 8),
        filterButton,
      ],
    );
  }
}

class _MarketPickerSheet extends StatelessWidget {
  const _MarketPickerSheet({required this.controller});

  final AppController controller;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;
    final currentMarket = controller.preferences.market;
    final markets = controller.availableMarkets;

    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
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
            const SizedBox(height: 14),
            Text(l10n.exploreMarketLabel, style: theme.textTheme.titleLarge),
            const SizedBox(height: 10),
            ...markets.map((market) {
              final selected = market == currentMarket;
              return _PickerRow(
                label: market.localizedLabel(l10n),
                hint: '',
                selected: selected,
                onTap: () {
                  HapticFeedback.selectionClick();
                  if (!selected) {
                    controller.setMarket(market);
                    unawaited(
                      controller.analytics.track(
                        AnalyticsEvents.countryChanged,
                        properties: controller.analytics.buildDefaultProperties(
                          preferences: controller.preferences,
                          loggedIn: controller.isAuthenticated,
                          country: market.name,
                          extra: <String, dynamic>{'country': market.name},
                        ),
                      ),
                    );
                  }
                  Navigator.of(context).pop();
                },
              );
            }),
          ],
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
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Icon(
                Icons.tune_rounded,
                size: 16,
                color:
                    hasFilters ? PaynColors.surface : PaynColors.textSecondary,
              ),
              if (hasFilters) ...<Widget>[
                const SizedBox(width: 5),
                Text(
                  '$count',
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: PaynColors.surface,
                    fontWeight: FontWeight.w800,
                    fontSize: 11,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _SearchIconButton extends StatelessWidget {
  const _SearchIconButton({required this.active, required this.onTap});

  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: active ? PaynColors.accent : PaynColors.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: active
            ? BorderSide.none
            : const BorderSide(color: PaynColors.outlineSubtle),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Icon(
            Icons.search_rounded,
            size: 16,
            color: active ? PaynColors.surface : PaynColors.textSecondary,
          ),
        ),
      ),
    );
  }
}

// Returns the category whose quick-filter chip set should render, or
// null when the current category has no chip set defined.
PaynCategory? _quickFilterCategory(PaynCategory? selected) {
  if (selected == null) return null;
  return kQuickFilterGroups.containsKey(selected) ? selected : null;
}

// Inline dimension-pill row — mirrors web's filter pill row exactly.
// Each pill shows DIMENSION + current value ("APR  Under 5%" or
// "AMOUNT  Any"). Tapping opens a picker bottom-sheet with that
// dimension's options. Replaces the old single-row of individual
// option chips that didn't match the web pattern.
class _DimensionPillRow extends StatelessWidget {
  const _DimensionPillRow({required this.controller});

  final AppController controller;

  @override
  Widget build(BuildContext context) {
    final category = controller.selectedExploreCategory;
    if (category == null) return const SizedBox.shrink();
    final groups = kQuickFilterGroups[category];
    if (groups == null || groups.isEmpty) return const SizedBox.shrink();

    final scope = controller.marketplaceRepository.offersForMarket(
      controller.preferences.market,
      category: category,
    );
    final filters = controller.exploreFilters;

    // For insurance, narrow the count-scope to the active subtype so
    // counts read "Up to 30 days (4)" against Travel offers, not the
    // whole insurance bucket. Mirrors web's bucketCategories filter.
    final subtypeScope = (category == PaynCategory.insurance &&
            filters.subtype.isNotEmpty)
        ? scope.where((o) {
            final raw = o.attributes.subtype ?? '';
            final bucket = raw == 'nomad' ? 'travel' : raw;
            return bucket == filters.subtype;
          }).toList()
        : scope;

    final live = <_LiveGroup>[];
    for (final group in groups) {
      // Insurance per-subtype groups only render when their subtype is
      // active. Dimension keys are shaped "insurance:<subtype>-<facet>"
      // (e.g. "insurance:travel-length", "insurance:health-coverage").
      if (group.dimension.startsWith('insurance:')) {
        if (filters.subtype.isEmpty) continue;
        final tail = group.dimension.substring('insurance:'.length);
        final wantedSubtype = tail.split('-').first;
        if (wantedSubtype != filters.subtype) continue;
      }
      final matching = <QuickFilterOption, int>{};
      for (final opt in group.options) {
        final count = subtypeScope.where(opt.match).length;
        if (count > 0) matching[opt] = count;
      }
      if (matching.isEmpty) continue;
      live.add(_LiveGroup(group: group, options: matching));
    }
    if (live.isEmpty) return const SizedBox.shrink();

    return SizedBox(
      height: 42,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.zero,
        itemCount: live.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final entry = live[index];
          final activeId = activeIdForGroup(filters.quickFilter, entry.group);
          final activeLabel = activeId == null
              ? 'Any'
              : entry.group.options
                  .firstWhere(
                    (o) => o.id == activeId,
                    orElse: () => entry.group.options.first,
                  )
                  .label;
          return _DimensionPill(
            dimension: entry.group.label,
            value: activeLabel,
            active: activeId != null,
            onTap: () => _openPicker(context, entry),
          );
        },
      ),
    );
  }

  Future<void> _openPicker(BuildContext context, _LiveGroup entry) async {
    HapticFeedback.selectionClick();
    final reduceMotion = PaynMotion.reduce(context);
    final filters = controller.exploreFilters;
    final activeId = activeIdForGroup(filters.quickFilter, entry.group);

    await showModalBottomSheet<void>(
      context: context,
      useRootNavigator: true,
      isScrollControlled: false,
      backgroundColor: PaynColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      sheetAnimationStyle: AnimationStyle(
        duration: reduceMotion ? Duration.zero : PaynMotion.sheet,
        reverseDuration: reduceMotion ? Duration.zero : PaynMotion.medium,
        curve: PaynMotion.ease,
      ),
      builder: (sheetContext) {
        final theme = Theme.of(sheetContext);
        return SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
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
                const SizedBox(height: 14),
                Text(
                  entry.group.label,
                  style: theme.textTheme.titleLarge,
                ),
                const SizedBox(height: 10),
                _PickerRow(
                  label: 'Any',
                  hint:
                      '${entry.options.values.fold<int>(0, (a, b) => a + b)} options',
                  selected: activeId == null,
                  onTap: () {
                    final next = setGroupSelection(
                      filters.quickFilter,
                      entry.group,
                      null,
                    );
                    controller.updateExploreFilters(
                      filters.copyWith(quickFilter: next),
                    );
                    Navigator.of(sheetContext).pop();
                  },
                ),
                for (final option in entry.options.entries)
                  _PickerRow(
                    label: option.key.label,
                    hint:
                        '${option.value} ${option.value == 1 ? 'offer' : 'offers'}',
                    selected: activeId == option.key.id,
                    onTap: () {
                      final next = setGroupSelection(
                        filters.quickFilter,
                        entry.group,
                        option.key.id,
                      );
                      controller.updateExploreFilters(
                        filters.copyWith(quickFilter: next),
                      );
                      Navigator.of(sheetContext).pop();
                    },
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _LiveGroup {
  const _LiveGroup({required this.group, required this.options});
  final QuickFilterGroup group;
  final Map<QuickFilterOption, int> options;
}

class _DimensionPill extends StatelessWidget {
  const _DimensionPill({
    required this.dimension,
    required this.value,
    required this.active,
    required this.onTap,
  });

  final String dimension;
  final String value;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    // P2.3 — Active dimension pill fills with full emerald to match
    // _SortChip / subtype chips. The previous pale-tint state was too
    // close to the resting colour and users couldn't see at a glance
    // which dimensions had been narrowed.
    final fg = active ? Colors.white : PaynColors.text;
    return Material(
      color: active ? PaynColors.accent : PaynColors.surface,
      borderRadius: BorderRadius.circular(999),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          curve: Curves.easeOutCubic,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(999),
            border: Border.all(
              color: active ? Colors.transparent : PaynColors.outlineSubtle,
            ),
            boxShadow: active
                ? <BoxShadow>[
                    BoxShadow(
                      color: PaynColors.accent.withValues(alpha: 0.18),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ]
                : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Text(
                dimension.toUpperCase(),
                style: theme.textTheme.labelSmall?.copyWith(
                  color:
                      active
                          ? Colors.white.withValues(alpha: 0.78)
                          : PaynColors.textTertiary,
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.9,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                value,
                style: theme.textTheme.labelMedium?.copyWith(
                  color: fg,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(width: 4),
              Icon(
                Icons.keyboard_arrow_down_rounded,
                size: 16,
                color: active ? Colors.white : PaynColors.textTertiary,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PickerRow extends StatelessWidget {
  const _PickerRow({
    required this.label,
    required this.hint,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final String hint;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 12),
        child: Row(
          children: <Widget>[
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    label,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: PaynColors.text,
                    ),
                  ),
                  if (hint.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 2),
                      child: Text(
                        hint,
                        style: theme.textTheme.labelMedium?.copyWith(
                          color: PaynColors.textTertiary,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            if (selected)
              const Icon(
                Icons.check_rounded,
                size: 22,
                color: PaynColors.accent,
              ),
          ],
        ),
      ),
    );
  }
}

// Quick-pick subtype chips for the Insurance bucket. Mirrors the web
// /explore/protect chip row: each chip toggles the `subtype` filter
// (already wired on the controller via the filter sheet) and shows
// how many offers fall into that slice within the current market.
class _InsuranceSubtypeChips extends StatelessWidget {
  const _InsuranceSubtypeChips({required this.controller});

  final AppController controller;

  // Subtypes mirror web's InsuranceSubtype taxonomy exactly. Web folds
  // nomad → travel via inferInsuranceSubtype (nomad-style policies are
  // conceptually travel cover); mobile does the same fold in the count
  // tally below and at filter-match time in the repository.
  static const List<_InsuranceSubtype> _subtypes = <_InsuranceSubtype>[
    _InsuranceSubtype(value: 'health', label: 'Health'),
    _InsuranceSubtype(value: 'travel', label: 'Travel'),
    _InsuranceSubtype(value: 'life', label: 'Life'),
    _InsuranceSubtype(value: 'auto', label: 'Auto'),
    _InsuranceSubtype(value: 'device', label: 'Device'),
  ];

  @override
  Widget build(BuildContext context) {
    final selected = controller.exploreFilters.subtype;
    final counts = <String, int>{};
    for (final offer in controller.marketplaceRepository.offersForMarket(
      controller.preferences.market,
      category: PaynCategory.insurance,
    )) {
      final raw = offer.attributes.subtype;
      if (raw == null || raw.isEmpty) continue;
      // Fold nomad → travel so the chip counts match the web bucket and
      // a Travel chip selection still picks up nomad-tagged offers.
      final bucket = raw == 'nomad' ? 'travel' : raw;
      counts[bucket] = (counts[bucket] ?? 0) + 1;
    }

    return SizedBox(
      height: 38,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.zero,
        itemCount: _subtypes.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final s = _subtypes[index];
          final count = counts[s.value] ?? 0;
          if (count == 0) return const SizedBox.shrink();
          return _PillChip(
            label: s.label,
            selected: selected == s.value,
            onTap: () {
              HapticFeedback.selectionClick();
              final next = selected == s.value ? '' : s.value;
              controller.updateExploreFilters(
                controller.exploreFilters.copyWith(subtype: next),
              );
            },
          );
        },
      ),
    );
  }
}

// P1.6 — Sub-type chip row for the Cards bucket. Mirrors the insurance
// pattern: each chip filters the visible offer list down to a card
// flavour. Filters on the raw API category (preserved on PaynOffer
// since P1.6 model change). Only renders chips with non-zero counts in
// the current market so the row never shows a dead pill.
class _CardsSubtypeChips extends StatelessWidget {
  const _CardsSubtypeChips({required this.controller});

  final AppController controller;

  // Web's spend-smarter bucket categories.
  static const List<_CardsSubtype> _subtypes = <_CardsSubtype>[
    _CardsSubtype(value: 'cards', label: 'Credit'),
    _CardsSubtype(value: 'debit', label: 'Debit'),
    _CardsSubtype(value: 'travel', label: 'Travel'),
    _CardsSubtype(value: 'cashback', label: 'Cashback'),
  ];

  @override
  Widget build(BuildContext context) {
    final selected = controller.exploreFilters.subtype;
    final counts = <String, int>{};
    for (final offer in controller.marketplaceRepository.offersForMarket(
      controller.preferences.market,
      category: PaynCategory.cards,
    )) {
      final raw = offer.rawCategory;
      if (raw == null || raw.isEmpty) continue;
      counts[raw] = (counts[raw] ?? 0) + 1;
    }

    return SizedBox(
      height: 38,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.zero,
        itemCount: _subtypes.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final s = _subtypes[index];
          final count = counts[s.value] ?? 0;
          if (count == 0) return const SizedBox.shrink();
          return _PillChip(
            label: s.label,
            selected: selected == s.value,
            onTap: () {
              HapticFeedback.selectionClick();
              final next = selected == s.value ? '' : s.value;
              controller.updateExploreFilters(
                controller.exploreFilters.copyWith(subtype: next),
              );
            },
          );
        },
      ),
    );
  }
}

class _CardsSubtype {
  const _CardsSubtype({required this.value, required this.label});

  final String value;
  final String label;
}

class _InsuranceSubtype {
  const _InsuranceSubtype({required this.value, required this.label});

  final String value;
  final String label;
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
  // Expanded by default so the chart is immediately visible above the
  // offer list — mirrors the web explore/investing page which shows the
  // chart at the top of the page. State is per-build because the panel
  // re-mounts as the user moves in/out of the Investments tab.
  bool _expanded = true;

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

  void _toggle() {
    setState(() {
      _expanded = !_expanded;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Material(
      color: Colors.transparent,
      child: Container(
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: theme.colorScheme.outlineVariant.withValues(alpha: 0.7),
          ),
          boxShadow: <BoxShadow>[
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            // Tap-to-expand header. Hits the entire row, not just a
            // chevron — keeps the affordance discoverable without a
            // visible "expand" button.
            InkWell(
              onTap: _toggle,
              borderRadius: BorderRadius.circular(24),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Text(
                            context.l10n.exploreMarketIntelligenceTitle,
                            style: theme.textTheme.titleLarge,
                          ),
                          const SizedBox(height: 6),
                          Text(
                            context.l10n.exploreMarketIntelligenceSubtitle,
                            style: theme.textTheme.bodyMedium,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    AnimatedRotation(
                      turns: _expanded ? 0.5 : 0,
                      duration: const Duration(milliseconds: 180),
                      child: Icon(
                        Icons.expand_more_rounded,
                        color: PaynColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            AnimatedCrossFade(
              crossFadeState: _expanded
                  ? CrossFadeState.showSecond
                  : CrossFadeState.showFirst,
              duration: const Duration(milliseconds: 200),
              firstChild: const SizedBox(width: double.infinity),
              secondChild: Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
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
                        // TASK-313 (PR-V3-07). Directional arrow makes the
                        // sign legible at a glance — `+2.28%` and `-2.28%`
                        // are easy to misread in dense layouts; `▲ +2.28%`
                        // / `▼ -2.28%` aren't. The number already carries
                        // the sign so we only prepend the glyph.
                        child: Text(
                          '${data.changePercent >= 0 ? '▲ +' : '▼ '}${data.changePercent.toStringAsFixed(2)}%',
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
                  // TASK-313 (PR-V3-07). "AI insights" + "Recommended
                  // actions" sections removed. The insights were
                  // templated filler ("Volatility contained", "Trend
                  // stabilizing") with no real LLM output; the V3 brief
                  // §6 bans claims that aren't backed by real product
                  // behaviour. Recommendations were pulled from the same
                  // static well — both kept users on the chart longer
                  // without telling them anything actionable about the
                  // offer list below. Trends row above stays because
                  // it's pure data (other assets at a glance).
                ],
              );
            },
          ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// P2.4 — Hero treatment for the #1 ranked result.
///
/// Wraps the standard OfferRow in an emerald-tinted frame with a
/// "★ TOP MATCH" header band. The frame's emerald inner border + soft
/// glow makes the row scannable in <1s without redesigning OfferRow
/// itself (which keeps ranks 2+ visually consistent).
class _TopMatchHero extends StatelessWidget {
  const _TopMatchHero({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: <Color>[
            PaynColors.accent.withValues(alpha: 0.08),
            PaynColors.accent.withValues(alpha: 0.02),
          ],
        ),
        border: Border.all(
          color: PaynColors.accent.withValues(alpha: 0.45),
          width: 1.4,
        ),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: PaynColors.accent.withValues(alpha: 0.18),
            blurRadius: 22,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      padding: const EdgeInsets.fromLTRB(6, 6, 6, 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          // "TOP MATCH" header band — bright emerald with a star icon.
          // Sits inside the frame, above the OfferRow, so the row's
          // own #1 pill still does its job (consistency with ranks
          // 2+) while the frame signals "this one's special".
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 4, 8, 6),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                const Icon(
                  Icons.auto_awesome_rounded,
                  size: 14,
                  color: PaynColors.accentStrong,
                ),
                const SizedBox(width: 6),
                Text(
                  'TOP MATCH',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: PaynColors.accentStrong,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.8,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
          child,
        ],
      ),
    );
  }
}
