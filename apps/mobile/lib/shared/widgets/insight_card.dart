import 'package:flutter/material.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/models/analytics_models.dart';

class InsightCard extends StatelessWidget {
  const InsightCard({
    super.key,
    required this.title,
    required this.body,
    required this.tone,
    this.compact = false,
  });

  final String title;
  final String body;
  final InsightTone tone;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colors = _toneColors(tone);

    return Container(
      padding: EdgeInsets.all(compact ? 14 : 16),
      decoration: BoxDecoration(
        color: colors.background,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: colors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: colors.foreground.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(_toneIcon(tone), size: 16, color: colors.foreground),
          ),
          const SizedBox(height: 12),
          Text(
            title,
            style: theme.textTheme.labelLarge?.copyWith(
              color: PaynColors.text,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            body,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: PaynColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  IconData _toneIcon(InsightTone tone) {
    switch (tone) {
      case InsightTone.neutral:
        return Icons.insights_rounded;
      case InsightTone.positive:
        return Icons.trending_up_rounded;
      case InsightTone.accent:
        return Icons.auto_graph_rounded;
      case InsightTone.warning:
        return Icons.warning_amber_rounded;
    }
  }

  _ToneColors _toneColors(InsightTone tone) {
    switch (tone) {
      case InsightTone.neutral:
        return const _ToneColors(
          background: Color(0xFFF7F7F9),
          border: Color(0xFFE8EAED),
          foreground: PaynColors.textSecondary,
        );
      case InsightTone.positive:
        return const _ToneColors(
          background: PaynColors.positiveSurface,
          border: Color(0xFFD7EAD8),
          foreground: PaynColors.positive,
        );
      case InsightTone.accent:
        return const _ToneColors(
          background: PaynColors.accentSurface,
          border: Color(0xFFD5E3FB),
          foreground: PaynColors.accent,
        );
      case InsightTone.warning:
        return const _ToneColors(
          background: PaynColors.warningSurface,
          border: Color(0xFFF5DEC0),
          foreground: PaynColors.warning,
        );
    }
  }
}

class _ToneColors {
  const _ToneColors({
    required this.background,
    required this.border,
    required this.foreground,
  });

  final Color background;
  final Color border;
  final Color foreground;
}
