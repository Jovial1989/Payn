import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/localization/app_localizations_ext.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/constants/known_provider_logos.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';
import 'package:payn_mobile/shared/services/analytics_service.dart';
import 'package:payn_mobile/shared/services/app_controller.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';
import 'package:payn_mobile/shared/widgets/analytics_view_tracker.dart';
import 'package:payn_mobile/shared/widgets/offer_row.dart';
import 'package:payn_mobile/shared/widgets/payn_mark.dart';
import 'package:payn_mobile/shared/widgets/payn_shell.dart';
import 'package:payn_mobile/shared/widgets/provider_badge.dart';
import 'package:payn_mobile/shared/widgets/section_card.dart';
import 'package:payn_mobile/shared/widgets/selection_bottom_sheet.dart';

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

          // ── Animated live reel ──
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: _AnimatedHeroReel(
                offers: controller.homeRecommendations.take(5).toList(),
              ),
            ),
          ),

          // Horizontal ranked-offer cards. Replaces the old category-
          // chip navigation strip — showing actual best offers is more
          // actionable than "Cards 27". Peek design (~55pt of the next
          // card visible) makes swiping obvious. #1 gets an emerald
          // tint so the hierarchy is instant.
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(0, 18, 0, 0),
              child: _TopOffersStrip(controller: controller),
            ),
          ),

          // MOB.12 — Trust bar, category-pill strip, and smart-
          // suggestions carousel were three more sections fighting for
          // the user's attention above the fold. None of them is a
          // primary action — they were noise that diluted the hero
          // CTA. All three (plus the multi-metric `_DashboardHero`)
          // now live inside the `_MoreFromPayn` expansion below the
          // primary content. Power users can still open it; first-
          // time visitors get a glanceable screen.

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 22, 20, 0),
              child: _DecisionSection(controller: controller),
            ),
          ),

          // ── Top picks ──
          // MOB.12 — Hard cap at 3 picks (was unbounded `picks.length`).
          // The "See all" link still takes the user to /explore for
          // the full ranked catalogue. Keeps the home page glanceable
          // and signals that the home isn't trying to BE the catalogue.
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
                itemCount: picks.length.clamp(0, 3),
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final item = picks[index];
                  return OfferRow(
                    offer: item.offer,
                    onTap: () => context.push('/offer/${item.offer.id}'),
                    rankLabel: '#${index + 1}',
                    motionIndex: index,
                  );
                },
              ),
            ),
          ],

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

          // MOB.12 — Progressive-disclosure section that absorbs every
          // secondary block we used to render above the fold.
          // Collapsed by default so the first paint stays clean; the
          // user opts in with a tap when they want depth.
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 32, 20, 0),
              child: _MoreFromPayn(
                controller: controller,
                trending: trending.map((item) => item.offer).toList(),
                categoryCounts: categoryCounts,
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

/// MOB.12 — Progressive-disclosure section. Collapsed by default so
/// first-time visitors see the glanceable home; the user opts in by
/// tapping the title. Everything we yanked out of the above-the-fold
/// layout lives here: the multi-metric panel, trust logos, category
/// pills, smart suggestions. None of it is below "useful" — it's just
/// not "first-tap critical".
class _MoreFromPayn extends StatefulWidget {
  const _MoreFromPayn({
    required this.controller,
    required this.trending,
    required this.categoryCounts,
  });

  final AppController controller;
  final List<PaynOffer> trending;
  final Map<PaynCategory, int> categoryCounts;

  @override
  State<_MoreFromPayn> createState() => _MoreFromPaynState();
}

class _MoreFromPaynState extends State<_MoreFromPayn> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;
    return Container(
      decoration: BoxDecoration(
        color: PaynColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: PaynColors.outlineSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          InkWell(
            onTap: () => setState(() => _expanded = !_expanded),
            borderRadius: BorderRadius.circular(20),
            child: Padding(
              padding: const EdgeInsets.fromLTRB(18, 16, 14, 16),
              child: Row(
                children: <Widget>[
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          'More from Payn',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          _expanded
                              ? 'Tap to hide'
                              : 'Your activity, categories, suggestions, trust',
                          style: theme.textTheme.labelMedium?.copyWith(
                            color: PaynColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  AnimatedRotation(
                    turns: _expanded ? 0.5 : 0,
                    duration: const Duration(milliseconds: 220),
                    curve: Curves.easeOutCubic,
                    child: const Icon(
                      Icons.expand_more_rounded,
                      color: PaynColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ),
          AnimatedSize(
            duration: const Duration(milliseconds: 220),
            curve: Curves.easeOutCubic,
            alignment: Alignment.topCenter,
            child: _expanded
                ? Padding(
                    padding: const EdgeInsets.fromLTRB(18, 0, 18, 18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        _DashboardHero(controller: widget.controller),
                        const SizedBox(height: 18),
                        const _TrustBar(),
                        const SizedBox(height: 18),
                        SizedBox(
                          height: 58,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemBuilder: (context, index) {
                              final category = PaynCategory.values[index];
                              return _CategoryPill(
                                label: category.localizedLabel(l10n),
                                count: widget.categoryCounts[category] ?? 0,
                                onTap: () => context.go('/explore'),
                              );
                            },
                            separatorBuilder: (_, __) => const SizedBox(width: 10),
                            itemCount: PaynCategory.values.length,
                          ),
                        ),
                        if (widget.trending.isNotEmpty) ...<Widget>[
                          const SizedBox(height: 22),
                          Text(
                            l10n.homeSmartSuggestions,
                            style: theme.textTheme.titleLarge,
                          ),
                          const SizedBox(height: 10),
                          _SmartSuggestionsCarousel(offers: widget.trending),
                        ],
                      ],
                    ),
                  )
                : const SizedBox.shrink(),
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
          // P1.2 — Guest users used to see `Saved 0 · Compared 0 ·
          // Providers 114+`. Two zeros next to a 3-digit number screams
          // "empty app" on first launch. Now we split the metric row by
          // auth state:
          //   • Guests → system-level pride metrics: live count today,
          //     last-updated, markets covered.
          //   • Authenticated users → their actual saved / compared
          //     counts (even if still zero — that's intentional, it
          //     belongs to them).
          if (controller.isAuthenticated)
            // MOB.9 — Was a fixed 3-tile row (Saved · Compared ·
            // Providers). When the user had no offers in Compare yet,
            // "Compared 0" sat between two real numbers and read as a
            // broken counter / unfinished feature. Per the new Saved
            // panel rule, the Compare tile is suppressed until the
            // user has actually picked at least one offer for
            // side-by-side review — then it grows in beside the
            // others.
            Builder(
              builder: (context) {
                final compareCount = controller.compareCount;
                return Row(
                  children: <Widget>[
                    Expanded(
                      child: _HeroMetric(
                        label: l10n.homeSaved,
                        value: '${controller.savedCount}',
                      ),
                    ),
                    if (compareCount > 0) ...<Widget>[
                      const SizedBox(width: 10),
                      Expanded(
                        child: _HeroMetric(
                          label: l10n.homeCompared,
                          value: '$compareCount',
                        ),
                      ),
                    ],
                    const SizedBox(width: 10),
                    Expanded(
                      child: _HeroMetric(
                        label: l10n.homeProviders,
                        value: '${controller.activeProviderCount}+',
                      ),
                    ),
                  ],
                );
              },
            )
          else
            Row(
              children: <Widget>[
                Expanded(
                  child: _HeroMetric(
                    label: 'Live offers',
                    value: '${controller.marketOfferCount}',
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _HeroMetric(
                    label: 'Providers',
                    value: '${controller.activeProviderCount}+',
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _HeroMetric(
                    label: 'Markets',
                    value: '30+',
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

/// P2.1 — Snap carousel for Smart suggestions. Uses PageView with
/// viewportFraction so the cards land aligned, the next card's edge
/// peeks ~7%, and the section reads as a "featured" surface instead
/// of a horizontal list.
class _SmartSuggestionsCarousel extends StatefulWidget {
  const _SmartSuggestionsCarousel({required this.offers});

  final List<PaynOffer> offers;

  @override
  State<_SmartSuggestionsCarousel> createState() =>
      _SmartSuggestionsCarouselState();
}

class _SmartSuggestionsCarouselState extends State<_SmartSuggestionsCarousel> {
  late final PageController _controller =
      PageController(viewportFraction: 0.86);
  int _page = 0;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Column(
        children: <Widget>[
          SizedBox(
            height: 188,
            child: PageView.builder(
              controller: _controller,
              itemCount: widget.offers.length,
              onPageChanged: (i) => setState(() => _page = i),
              physics: const BouncingScrollPhysics(),
              padEnds: false,
              itemBuilder: (context, index) {
                final offer = widget.offers[index];
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: _SuggestionCard(
                    offer: offer,
                    onTap: () => context.push('/offer/${offer.id}'),
                  ),
                );
              },
            ),
          ),
          if (widget.offers.length > 1) ...<Widget>[
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List<Widget>.generate(widget.offers.length, (i) {
                final selected = i == _page;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 220),
                  curve: Curves.easeOutCubic,
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  width: selected ? 18 : 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: selected
                        ? PaynColors.accent
                        : PaynColors.outline,
                    borderRadius: BorderRadius.circular(999),
                  ),
                );
              }),
            ),
          ],
        ],
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

    // P2.1 — Fixed 244pt width removed. Card now stretches to the
    // PageView page width (~86% of viewport, ~340pt on iPhone 17 Pro)
    // so the carousel reads as featured content with a clean snap.
    return Material(
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

    final logoUrl = providerLogoUrl(
      label,
      origin: 'https://www.payn.online',
    );

    final fallback = Container(
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

    if (logoUrl == null) return fallback;

    return Container(
      height: 34,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: PaynColors.outlineSubtle),
      ),
      child: Image.network(
        logoUrl,
        fit: BoxFit.contain,
        filterQuality: FilterQuality.medium,
        errorBuilder: (_, __, ___) => fallback,
        loadingBuilder: (context, child, progress) {
          if (progress == null) return child;
          return fallback;
        },
      ),
    );
  }
}

/// Cinematic auto-cycling reel that functions like a mini product demo.
/// Cycles through the top 5 ranked offers on a 3-second timer.
/// Dark panel with a moving radial-gradient background (CustomPainter),
/// an animated counter, and a "LIVE" pulse badge.
class _AnimatedHeroReel extends StatefulWidget {
  const _AnimatedHeroReel({required this.offers});
  final List<RankedOffer> offers;

  @override
  State<_AnimatedHeroReel> createState() => _AnimatedHeroReelState();
}

class _AnimatedHeroReelState extends State<_AnimatedHeroReel>
    with TickerProviderStateMixin {
  late final AnimationController _bgCtrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 4800),
  )..repeat();

  late final AnimationController _liveCtrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 900),
  )..repeat(reverse: true);

  // Large even multiple so modulo wraps cleanly in both directions.
  static const int _kLoopOffset = 10000;
  late final PageController _pageCtrl =
      PageController(initialPage: _kLoopOffset);
  int _index = 0;
  Timer? _autoTimer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _autoTimer?.cancel();
    _autoTimer = Timer.periodic(const Duration(milliseconds: 3200), (_) {
      if (!mounted || widget.offers.isEmpty) return;
      final current = _pageCtrl.page?.round() ?? _kLoopOffset;
      _pageCtrl.animateToPage(
        current + 1,
        duration: const Duration(milliseconds: 420),
        curve: Curves.easeInOutCubic,
      );
    });
  }

  @override
  void dispose() {
    _autoTimer?.cancel();
    _bgCtrl.dispose();
    _liveCtrl.dispose();
    _pageCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.offers.isEmpty) return const SizedBox.shrink();

    return ClipRRect(
      borderRadius: BorderRadius.circular(26),
      child: SizedBox(
        height: 212,
        child: Stack(
          fit: StackFit.expand,
          children: [
            // ── Animated background (shared across all pages) ──
            AnimatedBuilder(
              animation: _bgCtrl,
              builder: (context, _) => CustomPaint(
                painter: _ReelBgPainter(t: _bgCtrl.value),
              ),
            ),
            // ── Swipeable pages ──
            PageView.builder(
              controller: _pageCtrl,
              // null = infinite scroll; modulo maps virtual page → real offer
              onPageChanged: (page) {
                setState(() => _index = page % widget.offers.length);
                _startTimer(); // reset timer on manual swipe
              },
              itemBuilder: (context, page) {
                final i = page % widget.offers.length;
                final item = widget.offers[i];
                final offer = item.offer;
                final metric =
                    offer.metrics.isNotEmpty ? offer.metrics.first : null;
                final theme = Theme.of(context);

                return GestureDetector(
                  onTap: () => context.push('/offer/${offer.id}'),
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(22, 18, 22, 18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Top row: LIVE badge + dots
                        Row(
                          children: [
                            AnimatedBuilder(
                              animation: _liveCtrl,
                              builder: (context, _) => Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 9, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(
                                      alpha: 0.08 + 0.06 * _liveCtrl.value),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: Colors.white.withValues(
                                        alpha: 0.18 + 0.10 * _liveCtrl.value),
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Container(
                                      width: 6,
                                      height: 6,
                                      decoration: BoxDecoration(
                                        color: PaynColors.accent.withValues(
                                            alpha:
                                                0.7 + 0.3 * _liveCtrl.value),
                                        shape: BoxShape.circle,
                                        boxShadow: [
                                          BoxShadow(
                                            color: PaynColors.accent.withValues(
                                                alpha:
                                                    0.5 * _liveCtrl.value),
                                            blurRadius: 6,
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(width: 5),
                                    Text(
                                      'LIVE',
                                      style:
                                          theme.textTheme.labelSmall?.copyWith(
                                        color: Colors.white
                                            .withValues(alpha: 0.85),
                                        fontWeight: FontWeight.w800,
                                        fontSize: 10,
                                        letterSpacing: 0.8,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const Spacer(),
                            // Dot indicators (driven by _index, not i)
                            Row(
                              children: List.generate(
                                widget.offers.length.clamp(0, 5),
                                (d) => AnimatedContainer(
                                  duration: const Duration(milliseconds: 300),
                                  curve: Curves.easeOutCubic,
                                  margin: const EdgeInsets.only(left: 5),
                                  width: d == _index ? 14 : 5,
                                  height: 5,
                                  decoration: BoxDecoration(
                                    color: d == _index
                                        ? PaynColors.accent
                                        : Colors.white
                                            .withValues(alpha: 0.25),
                                    borderRadius: BorderRadius.circular(99),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const Spacer(),
                        // Provider + category
                        Row(
                          children: [
                            Text(
                              offer.providerName.isNotEmpty
                                  ? offer.providerName
                                  : offer.title,
                              style: theme.textTheme.labelLarge?.copyWith(
                                color: Colors.white.withValues(alpha: 0.65),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 7, vertical: 2),
                              decoration: BoxDecoration(
                                color:
                                    PaynColors.accent.withValues(alpha: 0.20),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                offer.category.name.toUpperCase(),
                                style: theme.textTheme.labelSmall?.copyWith(
                                  color: PaynColors.accent,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 9,
                                  letterSpacing: 0.6,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        // Big metric value
                        Text(
                          metric?.value ?? offer.title,
                          style: theme.textTheme.displaySmall?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                            height: 1.05,
                            fontSize: 32,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        // Metric label + rank badge
                        Row(
                          children: [
                            Text(
                              metric?.label ?? '',
                              style: theme.textTheme.labelMedium?.copyWith(
                                color: Colors.white.withValues(alpha: 0.55),
                              ),
                            ),
                            if (i + 1 <= 3) ...[
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 7, vertical: 2),
                                decoration: BoxDecoration(
                                  color:
                                      Colors.white.withValues(alpha: 0.10),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(
                                    color: Colors.white
                                        .withValues(alpha: 0.15),
                                  ),
                                ),
                                child: Text(
                                  '#${i + 1} ranked',
                                  style: theme.textTheme.labelSmall?.copyWith(
                                    color:
                                        Colors.white.withValues(alpha: 0.80),
                                    fontWeight: FontWeight.w700,
                                    fontSize: 10,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 4),
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

/// Moving radial-gradient background for the reel.
/// Two overlapping blobs shift position on [t] to give a slow
/// liquid-motion feel without any heavy packages.
class _ReelBgPainter extends CustomPainter {
  const _ReelBgPainter({required this.t});
  final double t; // 0..1 looping

  @override
  void paint(Canvas canvas, Size size) {
    // Base fill
    canvas.drawRect(
      Offset.zero & size,
      Paint()..color = const Color(0xFF0C1210),
    );

    final w = size.width;
    final h = size.height;

    // Blob 1 — emerald, slow drift top-left → top-right
    final c1 = Offset(
      w * (0.15 + 0.55 * _ease(t)),
      h * (0.10 + 0.20 * _ease((t + 0.3) % 1.0)),
    );
    canvas.drawCircle(
      c1,
      w * 0.62,
      Paint()
        ..shader = RadialGradient(
          colors: [
            const Color(0xFF0F8A4B).withValues(alpha: 0.28),
            const Color(0xFF0F8A4B).withValues(alpha: 0.0),
          ],
        ).createShader(Rect.fromCircle(center: c1, radius: w * 0.62)),
    );

    // Blob 2 — cobalt blue, opposite phase
    final c2 = Offset(
      w * (0.75 - 0.40 * _ease(t)),
      h * (0.70 - 0.25 * _ease((t + 0.5) % 1.0)),
    );
    canvas.drawCircle(
      c2,
      w * 0.50,
      Paint()
        ..shader = RadialGradient(
          colors: [
            const Color(0xFF1F6FEB).withValues(alpha: 0.18),
            const Color(0xFF1F6FEB).withValues(alpha: 0.0),
          ],
        ).createShader(Rect.fromCircle(center: c2, radius: w * 0.50)),
    );
  }

  double _ease(double t) {
    // Smoothstep for a natural blob motion
    return t * t * (3 - 2 * t);
  }

  @override
  bool shouldRepaint(_ReelBgPainter old) => old.t != t;
}

// ─────────────────────────────────────────────────
// Private widgets — tight, zero waste
// ─────────────────────────────────────────────────

class _DecisionSection extends StatelessWidget {
  const _DecisionSection({required this.controller});

  final AppController controller;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;
    final topOffer = controller.homeRecommendations.firstOrNull?.offer;
    final recentOffer = controller.recentOffers.firstOrNull;
    final marketLabel = controller.preferences.market.localizedLabel(l10n);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [PaynColors.surfaceDark, PaynColors.surfaceElevatedDark],
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            l10n.homeDecisionTitle,
            style: theme.textTheme.titleLarge?.copyWith(
              color: PaynColors.textInverse,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            l10n.homeDecisionSubtitle,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: Colors.white.withValues(alpha: 0.6),
            ),
          ),
          const SizedBox(height: 20),
          Column(
            children: <Widget>[
          _DecisionActionCard(
            icon: Icons.compare_arrows_rounded,
            title:
                controller.compareCount >= 2
                    ? l10n.homeContinueComparingTitle
                    : l10n.homeStartComparingTitle,
            body:
                controller.compareCount >= 2
                    ? l10n.homeContinueComparingBody(controller.compareCount)
                    : l10n.homeStartComparingBody,
            cta:
                controller.compareCount >= 2
                    ? l10n.savedCompare
                    : l10n.savedFindOffers,
            onTap:
                () => context.go(
                  controller.compareCount >= 2 ? '/compare' : '/explore',
                ),
          ),
          const SizedBox(height: 10),
          _DecisionActionCard(
            icon: Icons.local_offer_rounded,
            title: l10n.homeBestOffersInCountryTitle,
            body:
                topOffer == null
                    ? l10n.homeBestOffersInCountryEmpty(marketLabel)
                    : l10n.homeBestOffersInCountryBody(
                      topOffer.providerName,
                      marketLabel,
                    ),
            cta: l10n.homeSeeAll,
            onTap: () => context.go('/explore'),
          ),
          const SizedBox(height: 10),
          _DecisionActionCard(
            icon:
                recentOffer == null
                    ? Icons.trending_up_rounded
                    : Icons.history_rounded,
            title:
                recentOffer == null
                    ? l10n.homeMarketUpdatesTitle
                    : l10n.homeRecentlyViewedTitle,
            body:
                recentOffer == null
                    ? l10n.homeMarketUpdatesBody(controller.marketOfferCount)
                    : l10n.homeRecentlyViewedBody(
                      recentOffer.providerName,
                      recentOffer.category.localizedLabel(l10n),
                    ),
            cta:
                recentOffer == null
                    ? l10n.exploreMarketInsightsTitle
                    : l10n.offerCtaOpenDetails,
            onTap:
                recentOffer == null
                    ? () => context.go('/explore')
                    : () => context.push('/offer/${recentOffer.id}'),
          ),
          const SizedBox(height: 10),
          // P0.7 — Compliance disclaimer for a fin-marketplace.
          // Was labelMedium / textTertiary (#8a94a6 — fails WCAG AA at
          // 2.96:1 against white). Now bodyMedium / textSecondary
          // (#4b5563 — 7.39:1, AAA) and at 13pt minimum so it reads as
          // regulatory copy, not ghost text. Info icon signals
          // "important detail" rather than "footer fluff".
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: PaynColors.surfaceDim,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: PaynColors.outlineSubtle),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                const Icon(
                  Icons.info_outline_rounded,
                  size: 16,
                  color: PaynColors.textSecondary,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    l10n.homeDecisionFootnote,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: PaynColors.textSecondary,
                      fontSize: 13,
                      height: 1.4,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
            ],
          ),
        ],
      ),
    );
  }
}

class _DecisionActionCard extends StatelessWidget {
  const _DecisionActionCard({
    required this.icon,
    required this.title,
    required this.body,
    required this.cta,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String body;
  final String cta;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [PaynColors.surfaceDark, PaynColors.surfaceElevatedDark],
            ),
            borderRadius: BorderRadius.circular(18),
          ),
          child: Row(
            children: <Widget>[
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: PaynColors.accent.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, size: 19, color: PaynColors.accent),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      title,
                      style: theme.textTheme.titleSmall?.copyWith(
                        color: PaynColors.textInverse,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      body,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: Colors.white.withValues(alpha: 0.6),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              Text(
                cta,
                style: theme.textTheme.labelLarge?.copyWith(
                  color: PaynColors.accent,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(width: 2),
              const Icon(
                Icons.chevron_right_rounded,
                color: PaynColors.accent,
                size: 18,
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
      case PaynMarket.international:
        return '🌍';
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

/// Horizontal swipeable strip of the top ranked offers. Replaces the
/// old category-chip navigation — actual offers are more actionable
/// than "Cards 27". Cards are 300pt wide so ~55pt of the next one
/// peeks past the right edge, making the swipe affordance obvious.
/// #1 gets an emerald-tinted background so the hierarchy reads at a
/// glance. Tapping any card opens the offer detail.
class _TopOffersStrip extends StatelessWidget {
  const _TopOffersStrip({required this.controller});

  final AppController controller;

  @override
  Widget build(BuildContext context) {
    final picks = controller.homeRecommendations.take(5).toList();
    if (picks.isEmpty) return const SizedBox.shrink();
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
          child: Row(
            children: <Widget>[
              Text(
                'Best right now',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: () => context.go('/explore'),
                child: Text(
                  'See all',
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: PaynColors.accent,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
        ),
        SizedBox(
          height: 168,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            // Right padding deliberately small so the next card
            // peeks ~55pt past the viewport edge.
            padding: const EdgeInsets.only(left: 20, right: 8),
            physics: const BouncingScrollPhysics(),
            itemCount: picks.length,
            separatorBuilder: (_, __) => const SizedBox(width: 10),
            itemBuilder: (context, index) {
              final item = picks[index];
              return _TopOfferCard(
                item: item,
                rank: index + 1,
                onTap: () => context.push('/offer/${item.offer.id}'),
              );
            },
          ),
        ),
      ],
    );
  }
}

/// Single card in the `_TopOffersStrip`. Fixed 300pt wide — leaves
/// ~55pt of peek on a standard 393pt device. Rank #1 gets a distinct
/// emerald-tinted background + stronger border; ranks 2+ are white
/// with a subtle border so they still read as cards but step back.
class _TopOfferCard extends StatelessWidget {
  const _TopOfferCard({
    required this.item,
    required this.rank,
    required this.onTap,
  });

  final RankedOffer item;
  final int rank;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;
    final offer = item.offer;
    final metric = offer.metrics.isNotEmpty ? offer.metrics.first : null;
    final isTop = rank == 1;
    // Show first "best for" reason as the attractive hook; fall back to metric label.
    final attractiveHint =
        offer.bestFor.isNotEmpty ? offer.bestFor.first : (metric?.label ?? '');

    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(22),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(22),
        child: Container(
          width: 300,
          padding: const EdgeInsets.fromLTRB(14, 13, 14, 13),
          decoration: BoxDecoration(
            color: isTop ? PaynColors.accentSurface : PaynColors.surface,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(
              color: isTop
                  ? PaynColors.accent.withValues(alpha: 0.28)
                  : PaynColors.outlineSubtle,
              width: isTop ? 1.5 : 1.0,
            ),
            boxShadow: <BoxShadow>[
              BoxShadow(
                color: isTop
                    ? PaynColors.accent.withValues(alpha: 0.10)
                    : Colors.black.withValues(alpha: 0.04),
                blurRadius: isTop ? 18 : 12,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              // ── Top row: logo left, rank badge right ──
              Row(
                children: <Widget>[
                  ProviderBadge(offer: offer, compact: true),
                  const Spacer(),
                  _RankBadge(rank: rank),
                ],
              ),
              const SizedBox(height: 8),
              // ── Provider name (left) + category chip (right) ──
              Row(
                children: <Widget>[
                  Expanded(
                    child: Text(
                      offer.providerName.isNotEmpty
                          ? offer.providerName
                          : offer.title,
                      style: theme.textTheme.labelMedium?.copyWith(
                        color: PaynColors.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 6),
                  _CategoryChip(
                    label: offer.category.localizedLabel(l10n),
                    isTop: isTop,
                  ),
                ],
              ),
              const SizedBox(height: 4),
              // ── The headline metric — sized to feel decisive ──
              Text(
                metric?.value ?? '—',
                style: theme.textTheme.titleLarge?.copyWith(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  height: 1,
                  color: PaynColors.text,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              // ── Attractive hint + chevron ──
              Row(
                children: <Widget>[
                  Expanded(
                    child: Text(
                      attractiveHint,
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: PaynColors.textTertiary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  // Chevron signals tappability without a full button.
                  Icon(
                    Icons.chevron_right_rounded,
                    size: 16,
                    color: isTop ? PaynColors.accentStrong : PaynColors.textTertiary,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Small category pill shown on each "Best right now" card — e.g.
/// "Cards", "Sending money". Tinted emerald on the #1 card, muted grey
/// on the rest so it doesn't fight the rank badge.
class _CategoryChip extends StatelessWidget {
  const _CategoryChip({required this.label, required this.isTop});

  final String label;
  final bool isTop;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: isTop
            ? PaynColors.accentStrong.withValues(alpha: 0.10)
            : PaynColors.surfaceDim,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
          color: isTop ? PaynColors.accentStrong : PaynColors.textSecondary,
          fontWeight: FontWeight.w700,
          fontSize: 10,
        ),
      ),
    );
  }
}

/// Rank badge — "#1" in emerald for the top spot, muted grey for the
/// rest. Small pill shape so it doesn't dominate the card.
class _RankBadge extends StatelessWidget {
  const _RankBadge({required this.rank});

  final int rank;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isTop = rank == 1;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: isTop ? PaynColors.accent : PaynColors.surfaceDim,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        '#$rank',
        style: theme.textTheme.labelSmall?.copyWith(
          color: isTop ? PaynColors.textInverse : PaynColors.textSecondary,
          fontWeight: FontWeight.w800,
          fontSize: 11,
        ),
      ),
    );
  }
}

