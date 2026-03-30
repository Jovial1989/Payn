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
    final tags = <_CardTagData>[];

    if (widget.rankLabel != null) {
      tags.add(
        _CardTagData(
          label: widget.rankLabel!,
          background: PaynColors.accentSurface,
          foreground: PaynColors.accent,
        ),
      );
    }

    for (final value in widget.offer.bestFor.take(2)) {
      tags.add(_tagData(value, isPrimary: true));
    }

    for (final value in widget.reasons.take(1)) {
      if (tags.any((tag) => tag.label == value)) {
        continue;
      }
      tags.add(_tagData(value));
    }

    if (widget.showCategory &&
        !tags.any((tag) => tag.label == widget.offer.category.label)) {
      tags.add(
        _CardTagData(
          label: widget.offer.category.label,
          background: PaynColors.surfaceDim,
          foreground: PaynColors.textSecondary,
        ),
      );
    }

    return MouseRegion(
      onEnter: (_) => setState(() => _hovered = true),
      onExit: (_) => setState(() => _hovered = false),
      child: AnimatedScale(
        scale: _pressed ? 0.98 : 1,
        duration: const Duration(milliseconds: 120),
        curve: Curves.easeOutCubic,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          curve: Curves.easeOutCubic,
          transform: Matrix4.translationValues(0, _hovered ? -2 : 0, 0),
          decoration: BoxDecoration(
            color: const Color(0xFFFFFFFF),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFEAEAEA)),
            boxShadow: <BoxShadow>[
              BoxShadow(
                color: Colors.black.withValues(alpha: _hovered ? 0.07 : 0.03),
                blurRadius: _hovered ? 24 : 16,
                offset: Offset(0, _hovered ? 6 : 3),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: widget.onTap,
              borderRadius: BorderRadius.circular(20),
              onTapDown: (_) => setState(() => _pressed = true),
              onTapUp: (_) => setState(() => _pressed = false),
              onTapCancel: () => setState(() => _pressed = false),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        ProviderBadge(offer: widget.offer, size: 52),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Text(
                                widget.offer.providerName,
                                style: theme.textTheme.labelLarge?.copyWith(
                                  color: PaynColors.textSecondary,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 6),
                              Text(
                                widget.offer.title,
                                style: theme.textTheme.titleLarge?.copyWith(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: -0.45,
                                  height: 1.12,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        if (primaryMetric != null) ...<Widget>[
                          const SizedBox(width: 14),
                          _MetricEmphasis(metric: primaryMetric),
                        ],
                      ],
                    ),
                    if (tags.isNotEmpty) ...<Widget>[
                      const SizedBox(height: 16),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children:
                            tags
                                .take(4)
                                .map(
                                  (tag) => _OfferTag(
                                    label: tag.label,
                                    background: tag.background,
                                    foreground: tag.foreground,
                                  ),
                                )
                                .toList(),
                      ),
                    ],
                    const SizedBox(height: 16),
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
                              minimumSize: const Size(0, 46),
                              side: const BorderSide(color: Color(0xFFEAEAEA)),
                            ),
                            child: const Text('Details'),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: FilledButton(
                            onPressed: widget.onProviderTap,
                            style: FilledButton.styleFrom(
                              minimumSize: const Size(0, 46),
                            ),
                            child: const Text('Check rate'),
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
    );
  }

  _CardTagData _tagData(String label, {bool isPrimary = false}) {
    final normalized = label.toLowerCase();
    if (normalized.contains('fast') || normalized.contains('instant')) {
      return _CardTagData(
        label: label,
        background: PaynColors.accentSurface,
        foreground: PaynColors.accent,
      );
    }
    if (normalized.contains('no fee') ||
        normalized.contains('top') ||
        normalized.contains('best') ||
        normalized.contains('save') ||
        isPrimary) {
      return _CardTagData(
        label: label,
        background: PaynColors.positiveSurface,
        foreground: PaynColors.positive,
      );
    }

    return _CardTagData(
      label: label,
      background: PaynColors.surfaceDim,
      foreground: PaynColors.textSecondary,
    );
  }
}

class _MetricEmphasis extends StatelessWidget {
  const _MetricEmphasis({required this.metric});

  final PaynMetric metric;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      constraints: const BoxConstraints(minWidth: 92),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: <Widget>[
          Text(
            metric.label,
            style: theme.textTheme.labelMedium?.copyWith(
              color: PaynColors.textTertiary,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            metric.value,
            textAlign: TextAlign.right,
            style: theme.textTheme.titleLarge?.copyWith(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: PaynColors.text,
            ),
          ),
        ],
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
        borderRadius: BorderRadius.circular(8),
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
              color: saved ? Colors.transparent : const Color(0xFFEAEAEA),
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

class _CardTagData {
  const _CardTagData({
    required this.label,
    required this.background,
    required this.foreground,
  });

  final String label;
  final Color background;
  final Color foreground;
}
