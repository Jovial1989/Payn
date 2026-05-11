import 'package:flutter/material.dart';

class PaynMotion {
  const PaynMotion._();

  static const Duration fast = Duration(milliseconds: 180);
  static const Duration medium = Duration(milliseconds: 280);
  static const Duration route = Duration(milliseconds: 360);
  static const Duration sheet = Duration(milliseconds: 380);

  static const Curve ease = Curves.easeOutCubic;
  static const Curve spring = Curves.easeOutBack;

  static bool reduce(BuildContext context) {
    final mediaQuery = MediaQuery.maybeOf(context);
    if (mediaQuery == null) return false;
    return mediaQuery.disableAnimations || mediaQuery.accessibleNavigation;
  }

  static Duration duration(BuildContext context, Duration duration) {
    return reduce(context) ? Duration.zero : duration;
  }

  static Curve curve(BuildContext context, Curve curve) {
    return reduce(context) ? Curves.linear : curve;
  }
}
