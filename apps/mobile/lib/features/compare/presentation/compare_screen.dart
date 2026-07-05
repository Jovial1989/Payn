import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/localization/app_localizations_ext.dart';
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
    final l10n = context.l10n;
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
        appBar: AppBar(title: Text(l10n.compareTitle)),
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
                      l10n.compareNeedTwoTitle,
                      style: theme.textTheme.titleMedium,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      l10n.compareNeedTwoDescription,
                      style: theme.textTheme.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: () => context.go('/saved'),
                      child: Text(l10n.compareGoToSaved),
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
      appBar: AppBar(title: Text(l10n.compareTitle)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 40),
        physics: const BouncingScrollPhysics(),
        children: <Widget>[
          compareViewTracker,
          // ── Winner banner ──
          // MOB.5 — Slimmed down. The full product name now lives in
          // the column header below, so this card no longer needs to
          // repeat it. Reads more like a banner: "Best option →
          // Apply" with the provider mark for context, then the
          // table speaks for itself.
          Container(
            padding: const EdgeInsets.fromLTRB(14, 12, 12, 12),
            decoration: BoxDecoration(
              color: PaynColors.positiveSurface,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: <Widget>[
                ProviderBadge(offer: best.offer, compact: true),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        l10n.compareBestOption,
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: PaynColors.positive,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.4,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        best.offer.title,
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                FilledButton(
                  onPressed:
                      () =>
                          showProviderHandoffSheet(context, offer: best.offer),
                  style: FilledButton.styleFrom(
                    minimumSize: const Size(0, 36),
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                  ),
                  child: Text(l10n.compareApply),
                ),
              ],
            ),
          ),

          // ── Comparison table ──
          // MOB.5 — Column headers replaced the redundant "Provider"
          // row + the duplicate "Selected" footer at the bottom. Each
          // header carries the product name, the provider name as
          // secondary text, a "Best" badge on the winner, and an x
          // button to drop the column from Compare. Two Revoluts now
          // read as two distinct products at a glance.
          const SizedBox(height: 14),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: IntrinsicWidth(
              child: Column(
                children: <Widget>[
                  _HeaderRow(
                    offers: offers,
                    bestOfferId: best.offer.id,
                    onRemove: (id) => controller.toggleCompare(id),
                    onOpen: (id) => context.push('/offer/$id'),
                  ),
                  const SizedBox(height: 8),
                  _Row(
                    label: l10n.compareBestFor,
                    cells: offers
                        .map((o) {
                          final txt = o.bestFor.take(2).join(' · ');
                          return txt.isEmpty
                              ? const _Cell.notOffered()
                              : _Cell.value(txt);
                        })
                        .toList(),
                  ),
                  // TASK-307 (PR-V3-04). Cells used to render a bare
                  // em-dash when the offer didn't have a value for a
                  // given metric label — ambiguous between "feature
                  // absent", "value is zero", "data unknown". Now we
                  // emit a `_Cell` discriminated value so `_Row` can
                  // render explicit copy + a tap-tooltip explaining
                  // why the cell is empty. Per V3 §2.2 the most
                  // common case ("provider doesn't offer this") shows
                  // "Not offered"; rare unknown cases fall back to
                  // "Check with provider".
                  ...metricLabels.map((label) {
                    return _Row(
                      label: label,
                      cells: offers.map((o) {
                        final m = o.metrics.where((m) => m.label == label);
                        if (m.isEmpty) {
                          return const _Cell.notOffered();
                        }
                        return _Cell.value(m.first.value);
                      }).toList(),
                    );
                  }),
                  // TASK-306 (PR-V3-04). Tradeoff text comes from
                  // `controller.tradeoffFor(offer)` which still has a
                  // templated category-level fallback. When that
                  // fallback fires for two different offers in the
                  // same compare set the user sees the identical
                  // sentence in both columns ("looks broken" per V3
                  // §2.1). Suppress the whole row when every offer's
                  // tradeoff text resolves to the same string. Real
                  // fix is per-offer `tradeoff` field in catalog
                  // data — flagged in TASKS_V3.md as content debt.
                  Builder(
                    builder: (context) {
                      final tradeoffs =
                          offers.map(controller.tradeoffFor).toList();
                      final allEqual = tradeoffs
                          .every((t) => t == tradeoffs.first);
                      if (allEqual) return const SizedBox.shrink();
                      return _Row(
                        label: l10n.compareTradeoff,
                        cells: tradeoffs
                            .map((t) => t.isEmpty
                                ? const _Cell.notOffered()
                                : _Cell.value(t))
                            .toList(),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// MOB.5 — Sticky header row for the comparison table. Each cell is
/// the product+provider identity for one column; the "Best" badge
/// floats on the winning offer; an x button removes the column from
/// the Compare set. Width per cell matches `_Row` (152px) so the
/// columns line up with the data below.
class _HeaderRow extends StatelessWidget {
  const _HeaderRow({
    required this.offers,
    required this.bestOfferId,
    required this.onRemove,
    required this.onOpen,
  });

  final List<dynamic> offers;
  final String bestOfferId;
  final void Function(String offerId) onRemove;
  final void Function(String offerId) onOpen;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        // Left spacer matches the label-column width on `_Row` so the
        // product cells align with the data rows below.
        const SizedBox(width: 96 + 4),
        ...offers.map((offer) {
          final isBest = offer.id == bestOfferId;
          return Container(
            width: 152,
            margin: const EdgeInsets.only(right: 4),
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: isBest
                  ? PaynColors.positiveSurface
                  : PaynColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isBest
                    ? PaynColors.positive.withValues(alpha: 0.4)
                    : PaynColors.outline,
                width: isBest ? 1.4 : 1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Row(
                  children: <Widget>[
                    Expanded(
                      child: ProviderBadge(offer: offer, compact: true),
                    ),
                    InkResponse(
                      onTap: () => onRemove(offer.id as String),
                      radius: 16,
                      child: const Padding(
                        padding: EdgeInsets.all(2),
                        child: Icon(
                          Icons.close_rounded,
                          size: 16,
                          color: PaynColors.textTertiary,
                        ),
                      ),
                    ),
                  ],
                ),
                // TASK-308 (PR-V3-04). Was a "★ BEST" pill that
                // duplicated the top "Best option · {provider} · Apply"
                // banner above the table. Per V3 §2.3 we keep ONE
                // best indicator — the banner, because it has the
                // Apply CTA and doesn't burn vertical space inside
                // each column. The winning column is still visually
                // tinted via `PaynColors.positiveSurface` + emerald
                // border (set on `_HeaderRow` above) so the eye knows
                // which one won — just without the redundant chip.
                const SizedBox(height: 8),
                InkWell(
                  onTap: () => onOpen(offer.id as String),
                  borderRadius: BorderRadius.circular(4),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 1),
                    child: Text(
                      offer.title as String,
                      style: theme.textTheme.labelLarge?.copyWith(
                        fontWeight: FontWeight.w700,
                        height: 1.2,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  offer.providerName as String,
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: PaynColors.textTertiary,
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          );
        }),
      ],
    );
  }
}

/// TASK-307 (PR-V3-04). Discriminated cell value. `value` carries a
/// real metric string; `notOffered` means the offer doesn't have this
/// metric and the cell renders "Not offered" with a tap-tooltip
/// explaining why (per V3 §2.2). A future `unknown` / `notApplicable`
/// kind can be added when we wire per-metric semantic hints from the
/// catalog.
class _Cell {
  const _Cell.value(this.value) : kind = _CellKind.value;
  const _Cell.notOffered()
      : value = 'Not offered',
        kind = _CellKind.notOffered;

  final String value;
  final _CellKind kind;
}

enum _CellKind { value, notOffered }

class _Row extends StatelessWidget {
  // MOB.5 — Was `_Row({label, values, highlightValue})`. The
  // highlightValue parameter was used to colour the cell green when
  // its value matched the winner's value — but that visual cue is
  // now delivered by the green border on the winning column header,
  // which is consistent across every row instead of popping randomly
  // when two offers happen to share a value. Removed.
  // TASK-308 (PR-V3-04) — the inline "★ BEST" header pill that
  // accompanied that border was also removed; the top "Best option …
  // Apply" banner is now the sole best indicator.
  // TASK-307 (PR-V3-04) — `values: List<String>` became `cells:
  // List<_Cell>` so empty cells can render explicit "Not offered" copy
  // with a tooltip instead of a bare em-dash.
  const _Row({required this.label, required this.cells});

  final String label;
  final List<_Cell> cells;

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
          ...cells.map((cell) {
            final isMissing = cell.kind == _CellKind.notOffered;
            return Container(
              width: 152,
              margin: const EdgeInsets.only(right: 4),
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isMissing
                    ? PaynColors.surfaceDim
                    : PaynColors.surface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: isMissing
                      ? PaynColors.outlineSubtle
                      : PaynColors.outline,
                ),
              ),
              child: isMissing
                  ? Tooltip(
                      // Native Flutter Tooltip — long-press on mobile
                      // shows the explainer below the cell. No
                      // additional dialog wiring needed.
                      message:
                          "This product doesn't include this metric — "
                          "either it's not part of the offer or the "
                          "provider doesn't publish it.",
                      triggerMode: TooltipTriggerMode.tap,
                      preferBelow: false,
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: <Widget>[
                          Text(
                            cell.value,
                            style:
                                theme.textTheme.bodyMedium?.copyWith(
                              color: PaynColors.textTertiary,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Icon(
                            Icons.info_outline_rounded,
                            size: 12,
                            color: PaynColors.textTertiary,
                          ),
                        ],
                      ),
                    )
                  : Text(
                      cell.value,
                      style: theme.textTheme.bodyMedium?.copyWith(
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
