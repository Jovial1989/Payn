import 'package:flutter/material.dart';

/// Payn geometric mark — the chevron glyph in the wordmark.
/// Extracted as a shared widget so it can be used in splash, home header,
/// locale gate, and any other branded surface.
class PaynMark extends StatelessWidget {
  const PaynMark({
    super.key,
    this.size = 14,
    this.color = Colors.white,
    this.strokeWidth = 2.2,
  });

  final double size;
  final Color color;
  final double strokeWidth;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(size, size),
      painter: _MarkPainter(color: color, strokeWidth: strokeWidth),
    );
  }
}

class _MarkPainter extends CustomPainter {
  const _MarkPainter({required this.color, required this.strokeWidth});

  final Color color;
  final double strokeWidth;

  @override
  void paint(Canvas canvas, Size size) {
    final paint =
        Paint()
          ..color = color
          ..strokeWidth = strokeWidth
          ..strokeCap = StrokeCap.round
          ..style = PaintingStyle.stroke;

    final path =
        Path()
          ..moveTo(size.width * 0.18, size.height * 0.82)
          ..lineTo(size.width * 0.5, size.height * 0.18)
          ..lineTo(size.width * 0.82, size.height * 0.82);

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _MarkPainter old) =>
      old.color != color || old.strokeWidth != strokeWidth;
}
