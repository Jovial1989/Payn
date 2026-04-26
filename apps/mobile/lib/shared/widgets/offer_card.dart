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
    final secondaryMetrics = widget.offer.metrics.skip(1).take(2).toList();
    final highlights =
        <String>[
              ...widget.offer.bestFor,
              ...widget.reasons,
              if (widget.showCategory) widget.offer.category.label,
            ]
            .map((value) => value.trim())
            .where((value) => value.isNotEmpty)
            .toSet()
            .take(2)
            .toList();

    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0, end: 1),
      duration: Duration(milliseconds: 380 + (widget.motionIndex * 60)),
      curve: Curves.easeOutCubic,
      builder: (context, value, child) {
        return Opacity(
          opacity: value.clamp(0, 1),
          child: Transform.translate(
            offset: Offset(0, (1 - value) * 18),
            child: MouseRegion(
              onEnter: (_) => setState(() => _hovered = true),
              onExit: (_) => setState(() => _hovered = false),
              child: AnimatedScale(
                duration: const Duration(milliseconds: 140),
                curve: Curves.easeOutCubic,
                scale: _pressed ? 0.985 : 1,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 220),
                  curve: Curves.easeOutCubic,
                  transform: Matrix4.translationValues(0, _hovered ? -3 : 0, 0),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: <Color>[Color(0xFFFFFFFF), Color(0xFFF8FBF8)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(PaynRadius.card),
                    border: Border.all(
                      color:
                          _hovered
                              ? PaynColors.accent.withValues(alpha: 0.24)
                              : PaynColors.outlineSubtle,
                    ),
                    boxShadow: <BoxShadow>[
                      BoxShadow(
                        color: Colors.black.withValues(alpha: _hovered ? 0.09 : 0.05),
                        blurRadius: _hovered ? 32 : 20,
                        offset: Offset(0, _hovered ? 16 : 10),
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
                                              color: PaynColors.textSecondary,
                                              fontWeight: FontWeight.w700,
                                            ),
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
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                        style: theme.textTheme.titleLarge?.copyWith(
                                          fontSize: 18,
                                          fontWeight: FontWeight.w800,
                                          letterSpacing: -0.45,
                                          height: 1.08,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: <Widget>[
                                    _OfferTag(
                                      label: _decisionLabel(),
                                      background: PaynColors.accentSurface,
                                      foreground: PaynColors.accent,
                                    ),
                                    const SizedBox(height: 8),
                                    _SaveButton(
                                      saved: widget.saved,
                                      onPressed: widget.onSave,
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 22),
                            Text(
                              (primaryMetric?.label ?? widget.offer.category.label).toUpperCase(),
                              style: theme.textTheme.labelMedium?.copyWith(
                                color: PaynColors.textTertiary,
                                fontSize: 10,
                                letterSpacing: 1.55,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              primaryMetric?.value ?? 'On request',
                              style: theme.textTheme.headlineLarge?.copyWith(
                                fontSize: 34,
                                fontWeight: FontWeight.w800,
                                height: 0.98,
                                letterSpacing: -1.5,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              highlights.isNotEmpty ? highlights.first : widget.offer.subtitle,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: theme.textTheme.bodyLarge?.copyWith(
                                color: PaynColors.textSecondary,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            if (secondaryMetrics.isNotEmpty) ...<Widget>[
                              const SizedBox(height: 18),
                              Row(
                                children:
                                    secondaryMetrics.map((metric) {
                                      final isLast =
                                          identical(metric, secondaryMetrics.last);
                                      return Expanded(
                                        child: Padding(
                                          padding: EdgeInsets.only(
                                            right: isLast ? 0 : 10,
                                          ),
                                          child: _MetricMiniTile(metric: metric),
                                        ),
                                      );
                                    }).toList(),
                              ),
                            ],
                            if (highlights.length > 1) ...<Widget>[
                              const SizedBox(height: 16),
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children:
                                    highlights
                                        .skip(1)
                                        .map(
                                          (item) => _InfoPill(label: item),
                                        )
                                        .toList(),
                              ),
                            ],
                            const SizedBox(height: 18),
                            Container(height: 1, color: PaynColors.outlineSubtle),
                            const SizedBox(height: 16),
                            Row(
                              children: <Widget>[
                                Expanded(
                                  child: OutlinedButton(
                                    onPressed: widget.onTap,
                                    style: OutlinedButton.styleFrom(
                                      minimumSize: const Size(0, 50),
                                    ),
                                    child: Text(_secondaryCtaLabel()),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: FilledButton(
                                    onPressed: widget.onProviderTap,
                                    style: FilledButton.styleFrom(
                                      minimumSize: const Size(0, 50),
                                    ),
                                    child: Text(_primaryCtaLabel()),
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
    final metricText =
        widget.offer.metrics.map((metric) => metric.value.toLowerCase()).join(' ');
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
        return 'Open provider';
      case PaynCategory.insurance:
        return 'Check cover price';
      case PaynCategory.investments:
        return 'Open details';
    }
  }

  String _secondaryCtaLabel() {
    switch (widget.offer.category) {
      case PaynCategory.loans:
        return 'Loan details';
      case PaynCategory.cards:
        return 'Card details';
      case PaynCategory.transfers:
      case PaynCategory.exchange:
        return 'Fee details';
      case PaynCategory.insurance:
        return 'Policy details';
      case PaynCategory.investments:
        return 'Platform details';
    }
  }
}

class _MetricMiniTile extends StatelessWidget {
  const _MetricMiniTile({required this.metric});

  final PaynMetric metric;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: PaynColors.surfaceRaised,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: PaynColors.outlineSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            metric.label.toUpperCase(),
            style: theme.textTheme.labelMedium?.copyWith(
              fontSize: 10,
              letterSpacing: 1.3,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            metric.value,
            style: theme.textTheme.labelLarge?.copyWith(
              fontWeight: FontWeight.w800,
              color: PaynColors.text,
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoPill extends StatelessWidget {
  const _InfoPill({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(
        color: const Color(0xFFFBFCFB),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: const Color(0xFFE6ECE8)),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
          color: PaynColors.textSecondary,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
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
      width: 42,
      height: 42,
      child: IconButton(
        onPressed: onPressed,
        style: IconButton.styleFrom(
          backgroundColor: saved ? PaynColors.surfaceDim : Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: BorderSide(
              color: saved ? Colors.transparent : PaynColors.outlineSubtle,
            ),
          ),
        ),
        icon: Icon(
          saved ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
          size: 19,
          color: saved ? PaynColors.text : PaynColors.textTertiary,
        ),
      ),
    );
  }
}
