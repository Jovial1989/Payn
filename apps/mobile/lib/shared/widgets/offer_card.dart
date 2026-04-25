import 'package:flutter/material.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';
import 'package:payn_mobile/shared/widgets/provider_badge.dart';

class OfferCard extends StatefulWidget {
  const OfferCard({
    super.key,
    required this.offer,
    required this.reasons,
    required this.tradeoff,
    required this.saved,
    required this.onTap,
    required this.onSave,
    required this.onProviderTap,
    this.footer,
    this.showCategory = false,
    this.rankLabel,
    this.motionIndex = 0,
  });

  final PaynOffer offer;
  final List<String> reasons;
  final String tradeoff;
  final bool saved;
  final VoidCallback onTap;
  final VoidCallback onSave;
  final VoidCallback onProviderTap;
  final Widget? footer;
  final bool showCategory;
  final String? rankLabel;
  final int motionIndex;

  @override
  State<OfferCard> createState() => _OfferCardState();
}

class _OfferCardState extends State<OfferCard> {
  bool _hovered = false;
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final primaryMetric =
        widget.offer.metrics.isNotEmpty ? widget.offer.metrics.first : null;
    final badgeLabel = _decisionLabel();
    final benefits =
        <String>[
              ...widget.offer.bestFor,
              ...widget.reasons,
              if (widget.showCategory) widget.offer.category.label,
            ]
            .map((value) => value.trim())
            .where((value) => value.isNotEmpty)
            .toSet()
            .take(3)
            .toList();

    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0, end: 1),
      duration: Duration(milliseconds: 420 + (widget.motionIndex * 70)),
      curve: Curves.easeOutCubic,
      builder: (context, value, child) {
        return Opacity(
          opacity: value.clamp(0, 1),
          child: Transform.translate(
            offset: Offset(0, (1 - value) * 20),
            child: MouseRegion(
              onEnter: (_) => setState(() => _hovered = true),
              onExit: (_) => setState(() => _hovered = false),
              child: AnimatedScale(
                scale: _pressed ? 0.98 : 1,
                duration: const Duration(milliseconds: 120),
                curve: Curves.easeOutCubic,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 220),
                  curve: Curves.easeOutCubic,
                  transform: Matrix4.translationValues(0, _hovered ? -4 : 0, 0),
                  decoration: BoxDecoration(
                    color: PaynColors.surface,
                    borderRadius: BorderRadius.circular(PaynRadius.card),
                    border: Border.all(
                      color:
                          _hovered
                              ? PaynColors.accent.withValues(alpha: 0.24)
                              : PaynColors.outlineSubtle,
                    ),
                    gradient: const LinearGradient(
                      colors: <Color>[Color(0xFFFFFFFF), Color(0xFFF8FBF8)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    boxShadow: <BoxShadow>[
                      BoxShadow(
                        color: Colors.black.withValues(alpha: _hovered ? 0.10 : 0.06),
                        blurRadius: _hovered ? 38 : 22,
                        offset: Offset(0, _hovered ? 18 : 10),
                      ),
                    ],
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
              onTap: widget.onTap,
              borderRadius: BorderRadius.circular(PaynRadius.card),
              onTapDown: (_) => setState(() => _pressed = true),
              onTapUp: (_) => setState(() => _pressed = false),
              onTapCancel: () => setState(() => _pressed = false),
              child: Padding(
                padding: const EdgeInsets.all(PaynSpace.lg),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        ProviderBadge(
                          offer: widget.offer,
                          size: 52,
                          heroTag: 'provider-${widget.offer.id}',
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                crossAxisAlignment: WrapCrossAlignment.center,
                                children: <Widget>[
                                  Text(
                                    widget.offer.providerName,
                                    style: theme.textTheme.labelLarge?.copyWith(
                                      color: PaynColors.text,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w700,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  if (widget.rankLabel != null)
                                    _OfferTag(
                                      label: widget.rankLabel!,
                                      background: PaynColors.surfaceDim,
                                      foreground: PaynColors.textSecondary,
                                    ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                widget.offer.title,
                                style: theme.textTheme.titleLarge?.copyWith(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: -0.45,
                                  height: 1.08,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        _OfferTag(
                          label: badgeLabel,
                          background: PaynColors.accentSurface,
                          foreground: PaynColors.accent,
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    // Primary metric — Robinhood-style, no container
                    if (primaryMetric != null)
                      Text(
                        primaryMetric.label.toUpperCase(),
                        style: theme.textTheme.labelMedium?.copyWith(
                          color: PaynColors.textTertiary,
                          fontWeight: FontWeight.w700,
                          fontSize: 10,
                          letterSpacing: 1.6,
                        ),
                      ),
                    const SizedBox(height: 6),
                    Text(
                      primaryMetric == null ? 'On request' : primaryMetric.value,
                      style: theme.textTheme.headlineLarge?.copyWith(
                        fontSize: 32,
                        fontWeight: FontWeight.w800,
                        height: 1.0,
                        letterSpacing: -1.2,
                      ),
                    ),
                    if (widget.offer.metrics.length > 1) ...<Widget>[
                      const SizedBox(height: 16),
                      Row(
                        children: widget.offer.metrics
                            .skip(1)
                            .take(3)
                            .expand<Widget>(
                              (m) => <Widget>[
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: <Widget>[
                                      Text(
                                        m.label.toUpperCase(),
                                        style: theme.textTheme.labelMedium?.copyWith(
                                          color: PaynColors.textTertiary,
                                          fontWeight: FontWeight.w700,
                                          fontSize: 10,
                                          letterSpacing: 1.4,
                                        ),
                                      ),
                                      const SizedBox(height: 3),
                                      Text(
                                        m.value,
                                        style: theme.textTheme.titleMedium?.copyWith(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            )
                            .toList(),
                      ),
                    ],
                    if (benefits.isNotEmpty) ...<Widget>[
                      const SizedBox(height: 16),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children:
                            benefits
                                .map(
                                  (item) => Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 6,
                                    ),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFFBFCFB),
                                      borderRadius: BorderRadius.circular(999),
                                      border: Border.all(
                                        color: const Color(0xFFE6ECE8),
                                      ),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: <Widget>[
                                        Container(
                                          width: 6,
                                          height: 6,
                                          decoration: const BoxDecoration(
                                            color: PaynColors.accent,
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Flexible(
                                          child: Text(
                                            item,
                                            style: theme.textTheme.bodyMedium
                                                ?.copyWith(
                                                  color:
                                                      PaynColors.textSecondary,
                                                  fontWeight: FontWeight.w600,
                                                ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                )
                                .toList(),
                      ),
                    ],
                    const SizedBox(height: 18),
                    Container(height: 1, color: PaynColors.outlineSubtle),
                    const SizedBox(height: 16),
                    Row(
                      children: <Widget>[
                        _SaveButton(
                          saved: widget.saved,
                          onPressed: widget.onSave,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: widget.onTap,
                            style: OutlinedButton.styleFrom(
                              minimumSize: const Size(0, 48),
                              side: const BorderSide(color: PaynColors.outline),
                            ),
                            child: Text(_secondaryCtaLabel()),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: FilledButton(
                            onPressed: widget.onProviderTap,
                            style: FilledButton.styleFrom(
                              minimumSize: const Size(0, 48),
                              backgroundColor: PaynColors.accent,
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: <Widget>[
                                Flexible(child: Text(_primaryCtaLabel())),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (widget.footer != null) ...<Widget>[
                      const SizedBox(height: 12),
                      widget.footer!,
                    ],
                  ],
                ),
              ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  String _decisionLabel() {
    final metricText = widget.offer.metrics
        .map((metric) => metric.value.toLowerCase())
        .join(' ');

    if (metricText.contains('0%') ||
        metricText.contains('no fee') ||
        metricText.contains('free')) {
      return 'No fees';
    }
    if (widget.reasons.any(
      (reason) =>
          reason.toLowerCase().contains('fast') ||
          reason.toLowerCase().contains('instant'),
    )) {
      return 'Fast';
    }
    return 'Best value';
  }
  String _primaryCtaLabel() {
    switch (widget.offer.category) {
      case PaynCategory.loans:
        return 'Check my rate';
      case PaynCategory.cards:
        return 'See approval odds';
      case PaynCategory.transfers:
      case PaynCategory.exchange:
        return 'Save on fees';
      case PaynCategory.insurance:
        return 'Check cover price';
      case PaynCategory.investments:
        return 'Open investing details';
    }
  }

  String _secondaryCtaLabel() {
    switch (widget.offer.category) {
      case PaynCategory.loans:
        return 'View repayment details';
      case PaynCategory.cards:
        return 'See card details';
      case PaynCategory.transfers:
      case PaynCategory.exchange:
        return 'See fee details';
      case PaynCategory.insurance:
        return 'View policy details';
      case PaynCategory.investments:
        return 'See platform details';
    }
  }
}

class _OfferTag extends StatelessWidget {
  const _OfferTag({
    required this.label,
    required this.background,
    required this.foreground,
  });

  final String label;
  final Color background;
  final Color foreground;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
          color: foreground,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _SaveButton extends StatelessWidget {
  const _SaveButton({required this.saved, required this.onPressed});

  final bool saved;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 46,
      height: 46,
      child: IconButton(
        onPressed: onPressed,
        style: IconButton.styleFrom(
          backgroundColor: saved ? PaynColors.surfaceDim : Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: BorderSide(
              color: saved ? Colors.transparent : PaynColors.outline,
            ),
          ),
        ),
        icon: Icon(
          saved ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
          size: 20,
          color: saved ? PaynColors.text : PaynColors.textTertiary,
        ),
      ),
    );
  }
}
