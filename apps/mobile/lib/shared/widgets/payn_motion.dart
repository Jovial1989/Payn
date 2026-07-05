import 'package:flutter/material.dart';

class PaynMotion {
  const PaynMotion._();

  static const Duration fast = Duration(milliseconds: 180);
  static const Duration medium = Duration(milliseconds: 280);
  // Route transitions take a touch longer — the Revolut-style stack push
  // (incoming slides + scales, outgoing recedes + dims) needs ~460ms to
  // breathe without feeling laggy.
  static const Duration route = Duration(milliseconds: 460);
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
