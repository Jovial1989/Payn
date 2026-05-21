import 'dart:ui' as ui;

import 'package:flutter/material.dart';

/// Payn geometric mark — the chevron glyph in the wordmark.
/// Extracted as a shared widget so it can be used in splash, home header,
/// locale gate, and any other branded surface.
///
/// When `progress` is provided (0..1), the chevron stroke draws itself
/// in proportionally — used by the splash to give the brand mark a
/// "writing on" entrance instead of popping in fully formed.
class PaynMark extends StatelessWidget {
  const PaynMark({
    super.key,
    this.size = 14,
    this.color = Colors.white,
    this.strokeWidth = 2.2,
    this.progress,
  });

  final double size;
  final Color color;
  final double strokeWidth;

  /// 0..1 stroke-draw progress. Null = fully drawn (back-compat).
  final double? progress;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(size, size),
      painter: _MarkPainter(
        color: color,
        strokeWidth: strokeWidth,
        progress: progress,
      ),
    );
  }
}

class _MarkPainter extends CustomPainter {
  const _MarkPainter({
    required this.color,
    required this.strokeWidth,
    this.progress,
  });

  final Color color;
  final double strokeWidth;
  final double? progress;

  @override
  void paint(Canvas canvas, Size size) {
    final paint =
        Paint()
          ..color = color
          ..strokeWidth = strokeWidth
          ..strokeCap = StrokeCap.round
          ..strokeJoin = StrokeJoin.round
          ..style = PaintingStyle.stroke;

    final path =
        Path()
          ..moveTo(size.width * 0.18, size.height * 0.82)
          ..lineTo(size.width * 0.5, size.height * 0.18)
          ..lineTo(size.width * 0.82, size.height * 0.82);

    if (progress == null || progress! >= 1) {
      canvas.drawPath(path, paint);
      return;
    }

    // PathMetric-based progressive draw — extract a sub-path covering
    // the first `progress` fraction of total length so the stroke
    // appears to draw itself.
    final clamped = progress!.clamp(0.0, 1.0);
    for (final ui.PathMetric metric in path.computeMetrics()) {
      final length = metric.length * clamped;
      if (length <= 0) continue;
      canvas.drawPath(metric.extractPath(0, length), paint);
    }
  }

  @override
  bool shouldRepaint(covariant _MarkPainter old) =>
      old.color != color ||
      old.strokeWidth != strokeWidth ||
      old.progress != progress;
}
