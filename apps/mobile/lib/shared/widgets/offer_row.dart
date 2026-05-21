import 'package:flutter/material.dart';
import 'package:payn_mobile/core/localization/app_localizations_ext.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';
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
    this.motionIndex = 0,
  });

  final PaynOffer offer;
  final VoidCallback onTap;
  final String? rankLabel;
  final int motionIndex;

  @override
  State<OfferRow> createState() => _OfferRowState();
}

class _OfferRowState extends State<OfferRow> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;
    final primary = widget.offer.metrics.isNotEmpty ? widget.offer.metrics.first : null;
    final bestFor = widget.offer.bestFor.isNotEmpty
        ? widget.offer.bestFor.first.trim()
        : '';
    final categoryLabel = widget.offer.category.localizedLabel(l10n);

    return AnimatedScale(
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
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: <Widget>[
                ProviderBadge(offer: widget.offer, compact: true),
                const SizedBox(width: PaynSpace.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      Row(
                        children: <Widget>[
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
                            const SizedBox(width: 6),
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
                      const SizedBox(height: 2),
                      Text(
                        widget.offer.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.titleSmall?.copyWith(
                          color: PaynColors.text,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.2,
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
                ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 110),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
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
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          textAlign: TextAlign.end,
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.3,
                            color: PaynColors.text,
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
    );
  }
}
