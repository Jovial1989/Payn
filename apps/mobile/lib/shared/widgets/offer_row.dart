import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:payn_mobile/core/localization/app_localizations_ext.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';
import 'package:payn_mobile/shared/widgets/provider_badge.dart';

/// Compact horizontal-row variant of OfferCard.
///
/// The full-size OfferCard claims half a viewport per offer (hero metric,
/// secondary metric tiles, badges, two CTAs), which is fine for a single-
/// offer surface but unscannable for a browse list — three offers and
/// you've already scrolled twice. This row is the list-friendly version:
///
///   ┌──────────────────────────────────────────────────────────────────┐
///   │  ⬜ Wise                                                Fee      │
///   │     Wise International Transfer                     From 0.41%   │
///   │     Best for Best rates · #1                                     │
///   └──────────────────────────────────────────────────────────────────┘
///
/// ~108pt tall — five or six fit on a phone viewport. Tap navigates to
/// the full PDP where the detailed card still lives.
class OfferRow extends StatefulWidget {
  const OfferRow({
    super.key,
    required this.offer,
    required this.onTap,
    this.rankLabel,
    this.rankReasons,
    this.motionIndex = 0,
    this.showCompareChip = false,
  });

  final PaynOffer offer;
  final VoidCallback onTap;
  final String? rankLabel;
  // P1.8 — When non-empty AND rankLabel == '#1', the rank pill becomes
  // a tappable element that opens a "Why #1?" sheet with the ranking
  // reasons. Builds trust in the ranking model. Quiet UX for everything
  // else.
  final List<String>? rankReasons;
  final int motionIndex;
  // MOB.7 — Show a secondary "+ Compare" / "✓ In Compare" chip beneath
  // the bookmark, used on the Saved screen so the user can pick which
  // saved items go side-by-side. On Home / Explore the chip stays
  // hidden — the bookmark is the only top-row action there.
  final bool showCompareChip;

  @override
  State<OfferRow> createState() => _OfferRowState();
}

class _OfferRowState extends State<OfferRow>
    with SingleTickerProviderStateMixin {
  bool _pressed = false;
  late final AnimationController _entrance;
  late final Animation<double> _entranceFade;
  late final Animation<Offset> _entranceSlide;

  @override
  void initState() {
    super.initState();
    // Stagger reveal — each row enters slightly later than the one
    // above so the list cascades on first paint and on category
    // changes. Capped at ~10 rows of stagger to keep below the
    // perceptual horizon.
    final delayMs = (widget.motionIndex.clamp(0, 10)) * 55;
    _entrance = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 440),
    );
    _entranceFade = CurvedAnimation(
      parent: _entrance,
      curve: Curves.easeOutCubic,
    );
    _entranceSlide = Tween<Offset>(
      begin: const Offset(0, 0.06),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(parent: _entrance, curve: Curves.easeOutCubic),
    );
    Future<void>.delayed(Duration(milliseconds: delayMs), () {
      if (mounted) _entrance.forward();
    });
  }

  @override
  void dispose() {
    _entrance.dispose();
    super.dispose();
  }

  Future<void> _toggleSaved(BuildContext context) async {
    HapticFeedback.selectionClick();
    final controller = AppScope.of(context);
    await controller.toggleSaved(widget.offer.id);
  }

  Future<void> _toggleCompare(BuildContext context) async {
    HapticFeedback.selectionClick();
    final controller = AppScope.of(context);
    final ok = await controller.toggleCompare(widget.offer.id);
    if (!ok && context.mounted) {
      final l10n = context.l10n;
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(
          SnackBar(
            content: Text(l10n.savedCompareLimit),
            duration: const Duration(seconds: 2),
            behavior: SnackBarBehavior.floating,
            margin: const EdgeInsets.fromLTRB(16, 0, 16, 96),
          ),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;
    final primary = widget.offer.metrics.isNotEmpty ? widget.offer.metrics.first : null;
    final bestFor = widget.offer.bestFor.isNotEmpty
        ? widget.offer.bestFor.first.trim()
        : '';
    final categoryLabel = widget.offer.category.localizedLabel(l10n);
    final controller = AppScope.of(context);
    final compareActive = controller.isCompared(widget.offer.id);
    final savedActive = controller.isSaved(widget.offer.id);
    // P1.10 — Suppress the standalone provider-name line when the
    // product title already starts with the provider name (e.g.
    // "GoHenry / GoHenry / Ages 6-18 · Kids & Fa…"). Frees a row of
    // vertical space and removes a repetitive read for the user.
    // We compare case-insensitive whole-word prefix; "Wise" wouldn't
    // collapse "Wise International Transfer" because the title still
    // adds useful info, but "GoHenry" + "GoHenry" collapses to a
    // single "GoHenry" line.
    final providerName = widget.offer.providerName;
    final title = widget.offer.title;
    final hideProviderLine = providerName.isNotEmpty &&
        providerName.toLowerCase() == title.toLowerCase();

    return FadeTransition(
      opacity: _entranceFade,
      child: SlideTransition(
        position: _entranceSlide,
        child: AnimatedScale(
      duration: const Duration(milliseconds: 110),
      curve: Curves.easeOut,
      scale: _pressed ? 0.985 : 1,
      child: Material(
        color: PaynColors.surface,
        borderRadius: BorderRadius.circular(20),
        elevation: 0,
        child: InkWell(
          onTap: widget.onTap,
          onTapDown: (_) => setState(() => _pressed = true),
          onTapUp: (_) => setState(() => _pressed = false),
          onTapCancel: () => setState(() => _pressed = false),
          borderRadius: BorderRadius.circular(20),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: PaynColors.outlineSubtle),
              boxShadow: const <BoxShadow>[
                BoxShadow(
                  color: Color(0x0A000000),
                  blurRadius: 12,
                  offset: Offset(0, 4),
                ),
              ],
            ),
            padding: const EdgeInsets.symmetric(
              horizontal: PaynSpace.md,
              vertical: PaynSpace.sm + 2,
            ),
            // P0.1 — was center; when title wraps to 2 lines the badge
            // and right-column metric look awkward floating in the
            // middle. Top-align so all three columns share a baseline
            // at the top of the card.
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                ProviderBadge(offer: widget.offer, compact: true),
                const SizedBox(width: PaynSpace.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      // P1.10 — Hide the provider-name line entirely
                      // when it duplicates the title AND no rank pill
                      // is showing. With a rank, keep the row so the
                      // pill has a home.
                      if (!hideProviderLine || widget.rankLabel != null)
                        Row(
                        children: <Widget>[
                          if (!hideProviderLine)
                            Flexible(
                              child: Text(
                                widget.offer.providerName,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: theme.textTheme.labelMedium?.copyWith(
                                  color: PaynColors.textSecondary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          if (widget.rankLabel != null) ...<Widget>[
                            if (!hideProviderLine) const SizedBox(width: 6),
                            // P1.8 — Rank #1 with reasons becomes
                            // tappable — opens a small sheet that
                            // explains why this offer landed on top.
                            // Other ranks render as plain labels.
                            if (widget.rankLabel == '#1' &&
                                (widget.rankReasons?.isNotEmpty ?? false))
                              _RankReasonPill(
                                label: widget.rankLabel!,
                                reasons: widget.rankReasons!,
                                offerTitle: widget.offer.title,
                              )
                            else
                              Text(
                                widget.rankLabel!,
                                style: theme.textTheme.labelSmall?.copyWith(
                                  color: PaynColors.textTertiary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                          ],
                        ],
                      ),
                      if (!hideProviderLine || widget.rankLabel != null)
                        const SizedBox(height: 2),
                      // P0.1 — Truncation audit. Was maxLines: 1 which clipped
                      // titles like "Wise Business Account", "N26 You Travel
                      // Acco…", "Coinhouse Crypto …" at 393pt and worse at
                      // 320pt. Two-line cap with tighter line-height keeps
                      // vertical rhythm reasonable while VoiceOver gets the
                      // full string from the .semanticsLabel-less Text widget.
                      Text(
                        widget.offer.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        softWrap: true,
                        style: theme.textTheme.titleSmall?.copyWith(
                          color: PaynColors.text,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.2,
                          height: 1.15,
                        ),
                      ),
                      if (bestFor.isNotEmpty || widget.rankLabel == null) ...<Widget>[
                        const SizedBox(height: 4),
                        Text(
                          bestFor.isNotEmpty
                              ? '$bestFor · $categoryLabel'
                              : categoryLabel,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: PaynColors.textTertiary,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(width: PaynSpace.sm),
                // Right column: primary metric stacked vertically, kept
                // narrow so the title block keeps the bulk of the row.
                // P0.1 — was maxWidth: 110 + maxLines: 1, which clipped
                // values like "0% (weekda…)", "GBP 3.99/c…", "1% at 3
                // reta…" at 393pt. Min 96 keeps the right column from
                // collapsing on tiny screens; max 140 gives long values
                // (e.g. "From €0/mo (Free)") room to wrap to 2 lines
                // before ellipsing. Label still single-line per spec.
                ConstrainedBox(
                  constraints: const BoxConstraints(
                    minWidth: 96,
                    maxWidth: 140,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      // MOB.7 — Was a Compare toggle (P0.4) but users
                      // expected the prominent "+" icon to save the
                      // offer to their backlog — and instead it added to
                      // the (hidden until 2+) Compare set, making Saved
                      // appear empty. The bookmark is now the primary
                      // unbounded action across every list. Compare is
                      // demoted to a secondary chip (via showCompareChip)
                      // shown only on the Saved screen.
                      _SaveToggleIcon(
                        active: savedActive,
                        onTap: () => _toggleSaved(context),
                      ),
                      if (widget.showCompareChip) ...<Widget>[
                        const SizedBox(height: 6),
                        _CompareChip(
                          active: compareActive,
                          onTap: () => _toggleCompare(context),
                        ),
                      ],
                      const SizedBox(height: 4),
                      if (primary != null) ...<Widget>[
                        Text(
                          primary.label.toUpperCase(),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          textAlign: TextAlign.end,
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.6,
                            color: PaynColors.textTertiary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          primary.value,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          softWrap: true,
                          textAlign: TextAlign.end,
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.3,
                            color: PaynColors.text,
                            height: 1.15,
                            fontFeatures: <FontFeature>[FontFeature.tabularFigures()],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(width: 4),
                const Icon(
                  Icons.chevron_right_rounded,
                  size: 20,
                  color: PaynColors.textTertiary,
                ),
              ],
            ),
          ),
        ),
      ),
        ),
      ),
    );
  }
}

/// P1.8 — Tappable rank pill that opens a "Why #1?" sheet. Only rendered
/// on rank-1 offers when ranking reasons are available. Reasons text
/// comes from the ranker (`RankedOffer.reasons`) and is up to 3 lines.
class _RankReasonPill extends StatelessWidget {
  const _RankReasonPill({
    required this.label,
    required this.reasons,
    required this.offerTitle,
  });

  final String label;
  final List<String> reasons;
  final String offerTitle;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Material(
      color: PaynColors.accentSurface,
      shape: const StadiumBorder(),
      child: InkWell(
        onTap: () => _showReasonsSheet(context),
        customBorder: const StadiumBorder(),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Text(
                label,
                style: theme.textTheme.labelSmall?.copyWith(
                  color: PaynColors.accentStrong,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(width: 3),
              const Icon(
                Icons.info_outline_rounded,
                size: 11,
                color: PaynColors.accentStrong,
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showReasonsSheet(BuildContext context) {
    HapticFeedback.selectionClick();
    showModalBottomSheet<void>(
      context: context,
      useRootNavigator: true,
      backgroundColor: PaynColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (sheetContext) {
        final theme = Theme.of(sheetContext);
        return SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 14, 20, 24),
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
                Row(
                  children: <Widget>[
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: PaynColors.accentSurface,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      alignment: Alignment.center,
                      child: const Icon(
                        Icons.workspace_premium_rounded,
                        size: 20,
                        color: PaynColors.accent,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Text(
                            'Why #1?',
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w800,
                              color: PaynColors.text,
                            ),
                          ),
                          Text(
                            offerTitle,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.labelMedium?.copyWith(
                              color: PaynColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                ...reasons.map(
                  (r) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        const Padding(
                          padding: EdgeInsets.only(top: 2, right: 10),
                          child: Icon(
                            Icons.check_circle_rounded,
                            size: 16,
                            color: PaynColors.accent,
                          ),
                        ),
                        Expanded(
                          child: Text(
                            r,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: PaynColors.text,
                              height: 1.4,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Rankings reflect product fit, transparency, and value '
                  '— never paid placement.',
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: PaynColors.textTertiary,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

/// MOB.7 — 32pt circular bookmark toggle. Lives top-right of every
/// OfferRow's value column and is the only place a user adds/removes an
/// offer from their Saved backlog. Animates the icon swap (outline →
/// filled bookmark) and the chip background + border colour. Hit area
/// is independent from the parent row's InkWell — tapping here doesn't
/// navigate into the PDP.
class _SaveToggleIcon extends StatelessWidget {
  const _SaveToggleIcon({required this.active, required this.onTap});

  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: active ? 'Remove from saved' : 'Save offer',
      child: Material(
        color: Colors.transparent,
        shape: const CircleBorder(),
        child: InkResponse(
          onTap: onTap,
          radius: 22,
          containedInkWell: true,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            curve: Curves.easeOutCubic,
            width: 30,
            height: 30,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: active ? PaynColors.accentSurface : PaynColors.surface,
              border: Border.all(
                color: active ? PaynColors.accent : PaynColors.outlineSubtle,
                width: 1.2,
              ),
            ),
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 160),
              transitionBuilder: (child, animation) {
                return ScaleTransition(
                  scale: animation,
                  child: FadeTransition(opacity: animation, child: child),
                );
              },
              child: Icon(
                active
                    ? Icons.bookmark_rounded
                    : Icons.bookmark_border_rounded,
                key: ValueKey<bool>(active),
                size: 18,
                color: active ? PaynColors.accent : PaynColors.textSecondary,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// MOB.7 — Compact "Compare" pill rendered only when OfferRow is opted
/// into showCompareChip (currently Saved screen only). Inactive state:
/// thin outlined "+ Compare". Active state: emerald-tinted "✓ Compare".
/// Hit area is independent from the row tap.
class _CompareChip extends StatelessWidget {
  const _CompareChip({required this.active, required this.onTap});

  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: active ? 'Remove from compare' : 'Add to compare',
      child: Material(
        color: Colors.transparent,
        shape: const StadiumBorder(),
        child: InkWell(
          onTap: onTap,
          customBorder: const StadiumBorder(),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            curve: Curves.easeOutCubic,
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: active ? PaynColors.accentSurface : PaynColors.surface,
              borderRadius: BorderRadius.circular(999),
              border: Border.all(
                color: active ? PaynColors.accent : PaynColors.outlineSubtle,
                width: 1,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Icon(
                  active ? Icons.check_rounded : Icons.compare_arrows_rounded,
                  size: 12,
                  color: active
                      ? PaynColors.accent
                      : PaynColors.textSecondary,
                ),
                const SizedBox(width: 4),
                Text(
                  'Compare',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.2,
                    color: active
                        ? PaynColors.accent
                        : PaynColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
