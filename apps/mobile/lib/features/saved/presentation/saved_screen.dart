import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/localization/app_localizations_ext.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/services/app_controller.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';
import 'package:payn_mobile/shared/widgets/offer_row.dart';
import 'package:payn_mobile/shared/widgets/payn_shell.dart';
import 'package:payn_mobile/shared/widgets/section_card.dart';

class SavedScreen extends StatelessWidget {
  const SavedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = AppScope.of(context);
    final theme = Theme.of(context);
    final l10n = context.l10n;
    final offers = controller.savedOffers;
    final recents = controller.recentOffers.take(5).toList();
    final suggestions = controller.homeRecommendations.take(2).toList();
    final compareCount = controller.compareCount;

    // TASK-311 (PR-V3-06). Single layout. The V1 build branched between
    // an "empty" rendering (centered empty card + suggestions) and a
    // "filled" rendering (list of saved offers + inline compare card).
    // Two layouts meant the user saw a different shaped page depending
    // on state — and the empty-state suggestions vanished the moment
    // the first save came in.
    //
    // The single layout below renders one consistent stack of sections.
    // Each section knows how to handle its own empty case:
    //   • Saved: list of OfferRow, or an inline empty card.
    //   • Recently viewed (TASK-312): only mounted when recents > 0.
    //   • Suggested: only mounted when recommendations exist.
    //
    // The Compare CTA still sits between the summary and the saved
    // list when at least one offer is picked (MOB.10).
    return SafeArea(
      bottom: false,
      child: CustomScrollView(
        physics: const BouncingScrollPhysics(
          parent: AlwaysScrollableScrollPhysics(),
        ),
        slivers: <Widget>[
          // ── Header + summary ───────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(l10n.savedTitle, style: theme.textTheme.headlineMedium),
                  const SizedBox(height: 6),
                  Text(
                    l10n.savedSubtitle,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: PaynColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 18),
                  _SavedSummary(controller: controller),
                ],
              ),
            ),
          ),

          // ── Compare CTA (only when at least one offer is picked) ──
          if (compareCount > 0)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                child: _CompareReadyCard(
                  compareCount: compareCount,
                  onCompare: () => context.push('/compare'),
                ),
              ),
            ),

          // ── Saved list (or inline empty card) ──────────────────────
          if (offers.isEmpty)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                child: EmptyStateCard(
                  title: l10n.savedEmptyTitle,
                  description: l10n.savedEmptyDescription,
                  action: FilledButton(
                    onPressed: () => context.go('/explore'),
                    child: Text(l10n.savedFindOffers),
                  ),
                ),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              sliver: SliverList.separated(
                itemCount: offers.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final offer = offers[index];
                  return OfferRow(
                    offer: offer,
                    onTap: () => context.push('/offer/${offer.id}'),
                    motionIndex: index,
                    // MOB.7 — Surface the "+ Compare" pill on every
                    // saved offer so the user can pick up to 3 to
                    // line up side-by-side. The Saved screen is the
                    // only surface in the app where this chip shows;
                    // everywhere else the bookmark stays the sole
                    // primary action.
                    showCompareChip: true,
                  );
                },
              ),
            ),

          // ── Recently viewed (TASK-312) ─────────────────────────────
          // Surfaces the recents list (capped at 5) on the Saved screen.
          // The data already feeds the summary tile; we just expose the
          // section so the user can re-open something they previewed
          // without bookmarking. Hidden when no recents exist.
          if (recents.isNotEmpty) ...<Widget>[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 28, 20, 0),
                child: Text(
                  l10n.savedRecent,
                  style: theme.textTheme.titleLarge,
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
              sliver: SliverList.separated(
                itemCount: recents.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final offer = recents[index];
                  return OfferRow(
                    offer: offer,
                    onTap: () => context.push('/offer/${offer.id}'),
                    motionIndex: index,
                  );
                },
              ),
            ),
          ],

          // ── Suggested for you ──────────────────────────────────────
          if (suggestions.isNotEmpty) ...<Widget>[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 28, 20, 0),
                child: Text(
                  l10n.savedSuggested,
                  style: theme.textTheme.titleLarge,
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
              sliver: SliverList.separated(
                itemCount: suggestions.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final ranked = suggestions[index];
                  return OfferRow(
                    offer: ranked.offer,
                    onTap: () => context.push('/offer/${ranked.offer.id}'),
                    motionIndex: index,
                  );
                },
              ),
            ),
          ],

          SliverPadding(
            // MOB.10 — Compare CTA is now inline (`_CompareReadyCard`
            // above the saved-offer list), not a floating bar, so the
            // bottom inset only needs to clear the nav itself.
            padding: EdgeInsets.only(
              bottom: PaynShell.contentBottomInset(context),
            ),
          ),
        ],
      ),
    );
  }
}

class _SavedSummary extends StatelessWidget {
  const _SavedSummary({required this.controller});

  // MOB.3 — Same bug as `_ProfileHero`: `dynamic` here blocks Dart's
  // extension-method dispatch and would throw NoSuchMethodError as
  // soon as any code path called an extension on a property of this
  // field. Typing the receiver strictly fixes the dispatch.
  final AppController controller;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: <Color>[Color(0xFFFFFFFF), Color(0xFFF7FBF8)],
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
      // P3.2 + MOB.9 — Each metric tile is now suppressed when its
      // count is zero so the row never reads as a broken counter on
      // first launch. "Compare 0" was especially misleading post MOB.7
      // because Compare is an opt-in shortlist for side-by-side review
      // — surfacing it before the user has picked anything implied
      // they were already in a comparison flow they hadn't started.
      // The row now collapses to just "Saved" on first launch and
      // grows tiles in as the user builds state.
      child: Builder(
        builder: (context) {
          // MOB.3 — was `... as int` to satisfy the dynamic controller
          // type. Now that `controller` is typed `AppController`, the
          // cast is redundant — `recentOffers.length` is already `int`.
          final recentCount = controller.recentOffers.length;
          final compareCount = controller.compareCount;
          return Row(
            children: <Widget>[
              Expanded(
                child: _SummaryMetric(
                  label: context.l10n.homeSaved,
                  value: '${controller.savedCount}',
                ),
              ),
              if (compareCount > 0) ...<Widget>[
                const SizedBox(width: 10),
                Expanded(
                  child: _SummaryMetric(
                    label: context.l10n.savedCompare,
                    value: '$compareCount',
                  ),
                ),
              ],
              if (recentCount > 0) ...<Widget>[
                const SizedBox(width: 10),
                Expanded(
                  child: _SummaryMetric(
                    label: context.l10n.savedRecent,
                    value: '$recentCount',
                  ),
                ),
              ],
            ],
          );
        },
      ),
    );
  }
}

class _SummaryMetric extends StatelessWidget {
  const _SummaryMetric({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
      decoration: BoxDecoration(
        color: PaynColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: PaynColors.outlineSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(label, style: theme.textTheme.labelMedium),
          const SizedBox(height: 8),
          Text(
            value,
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w800,
              fontSize: 20,
            ),
          ),
        ],
      ),
    );
  }
}

// P0.4 — The old _CompareToggle pill was removed. Compare lives as an
// inline icon on every OfferRow now (top-right of the value column).

/// MOB.10 — Inline "ready-to-compare" card. Lives at the top of the
/// Saved offer list whenever the user has 1+ offers picked. Replaces
/// the floating Compare bar entirely:
///   • Count == 1: muted variant ("Pick 1 more · Compare disabled").
///   • Count >= 2: emerald primary CTA ("Compare 3 offers side by side").
/// Tapping the CTA pushes /compare. Nothing floats; this is regular
/// scroll content so it can never overlap the row beneath it.
class _CompareReadyCard extends StatelessWidget {
  const _CompareReadyCard({
    required this.compareCount,
    required this.onCompare,
  });

  final int compareCount;
  final VoidCallback onCompare;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final ready = compareCount >= 2;
    return Material(
      color: ready ? PaynColors.text : PaynColors.surfaceDim,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        onTap: ready ? onCompare : null,
        borderRadius: BorderRadius.circular(18),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(14, 12, 12, 12),
          child: Row(
            children: <Widget>[
              Container(
                width: 32,
                height: 32,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: PaynColors.accent,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  '$compareCount',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 14,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    Text(
                      ready
                          ? 'Ready to compare'
                          : 'Add 1 more to compare',
                      style: theme.textTheme.titleSmall?.copyWith(
                        color: ready ? Colors.white : PaynColors.text,
                        fontWeight: FontWeight.w800,
                        height: 1.15,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      ready
                          ? 'See $compareCount offers side by side'
                          : 'Pick one more saved offer below',
                      style: theme.textTheme.labelMedium?.copyWith(
                        color: ready
                            ? Colors.white.withValues(alpha: 0.72)
                            : PaynColors.textSecondary,
                        height: 1.15,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              DecoratedBox(
                decoration: BoxDecoration(
                  color: ready
                      ? PaynColors.accent
                      : PaynColors.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: ready
                      ? null
                      : Border.all(color: PaynColors.outline),
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      Text(
                        'Compare',
                        style: TextStyle(
                          color: ready
                              ? Colors.white
                              : PaynColors.textTertiary,
                          fontWeight: FontWeight.w700,
                          fontSize: 12.5,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Icon(
                        Icons.arrow_forward_rounded,
                        size: 13,
                        color: ready
                            ? Colors.white
                            : PaynColors.textTertiary,
                      ),
                    ],
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
