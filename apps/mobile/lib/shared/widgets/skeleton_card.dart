import 'package:flutter/material.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';

class OfferCardSkeleton extends StatefulWidget {
  const OfferCardSkeleton({super.key});

  @override
  State<OfferCardSkeleton> createState() => _OfferCardSkeletonState();
}

class _OfferCardSkeletonState extends State<OfferCardSkeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1200),
  )..repeat();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return _SkeletonScope(
          progress: _controller.value,
          child: child!,
        );
      },
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(PaynRadius.card),
          border: Border.all(color: PaynColors.outlineSubtle),
          boxShadow: <BoxShadow>[
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                SkeletonBox(width: 52, height: 52, radius: 16),
                SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      SkeletonBox(width: 84, height: 12, radius: 999),
                      SizedBox(height: 10),
                      SkeletonBox(width: 180, height: 18, radius: 999),
                      SizedBox(height: 8),
                      SkeletonBox(width: 140, height: 14, radius: 999),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: 18),
            SkeletonBox(width: double.infinity, height: 168, radius: 24),
            SizedBox(height: 18),
            Row(
              children: <Widget>[
                Expanded(child: SkeletonBox(width: double.infinity, height: 48, radius: 999)),
                SizedBox(width: 10),
                Expanded(child: SkeletonBox(width: double.infinity, height: 48, radius: 999)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class SkeletonBox extends StatelessWidget {
  const SkeletonBox({
    super.key,
    required this.width,
    required this.height,
    required this.radius,
  });

  final double width;
  final double height;
  final double radius;

  @override
  Widget build(BuildContext context) {
    final scope = _SkeletonScope.of(context);
    final progress = scope?.progress ?? 0.0;

    return LayoutBuilder(
      builder: (context, constraints) {
        final resolvedWidth =
            width == double.infinity ? constraints.maxWidth : width;
        final travel = resolvedWidth + 120;
        final offsetX = (progress * travel) - 60;

        return ClipRRect(
          borderRadius: BorderRadius.circular(radius),
          child: Stack(
            children: <Widget>[
              Container(
                width: width,
                height: height,
                color: const Color(0xFFF0F3F1),
              ),
              Positioned(
                left: offsetX,
                top: 0,
                bottom: 0,
                child: Container(
                  width: 120,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: <Color>[
                        Colors.white.withValues(alpha: 0.0),
                        Colors.white.withValues(alpha: 0.72),
                        Colors.white.withValues(alpha: 0.0),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _SkeletonScope extends InheritedWidget {
  const _SkeletonScope({
    required this.progress,
    required super.child,
  });

  final double progress;

  static _SkeletonScope? of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<_SkeletonScope>();
  }

  @override
  bool updateShouldNotify(_SkeletonScope oldWidget) {
    return oldWidget.progress != progress;
  }
}
