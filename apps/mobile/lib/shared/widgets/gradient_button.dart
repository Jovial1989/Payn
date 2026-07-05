import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';

/// Primary action button with emerald → forest gradient and glow shadow.
/// Drop-in replacement for [FilledButton] in offer contexts.
class GradientButton extends StatelessWidget {
  const GradientButton({
    super.key,
    required this.onPressed,
    required this.label,
    this.icon,
    this.minimumSize = const Size(double.infinity, 50),
    this.padding = const EdgeInsets.symmetric(horizontal: 20),
  });

  final VoidCallback? onPressed;
  final Widget label;
  final Widget? icon;
  final Size minimumSize;
  final EdgeInsetsGeometry padding;

  static const _gradientEnabled = LinearGradient(
    colors: [Color(0xFF14D474), Color(0xFF0A7A40)],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const _shadow = BoxShadow(
    color: Color(0x520F8A4B), // #0F8A4B @ 32%
    blurRadius: 14,
    offset: Offset(0, 4),
  );

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final enabled = onPressed != null;
    final radius = BorderRadius.circular(PaynRadius.button);

    return AnimatedOpacity(
      opacity: enabled ? 1.0 : 0.45,
      duration: const Duration(milliseconds: 180),
      child: Container(
        constraints: BoxConstraints(
          minWidth: minimumSize.width,
          minHeight: minimumSize.height,
        ),
        decoration: BoxDecoration(
          gradient: enabled ? _gradientEnabled : null,
          color: enabled ? null : PaynColors.outlineSubtle,
          borderRadius: radius,
          boxShadow: enabled ? const [_shadow] : null,
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: radius,
          child: InkWell(
            onTap: enabled
                ? () {
                    HapticFeedback.lightImpact();
                    onPressed!();
                  }
                : null,
            borderRadius: radius,
            splashColor: Colors.white.withValues(alpha: 0.15),
            highlightColor: Colors.white.withValues(alpha: 0.08),
            child: Padding(
              padding: padding,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  if (icon != null) ...<Widget>[
                    IconTheme(
                      data: const IconThemeData(color: Colors.white, size: 18),
                      child: icon!,
                    ),
                    const SizedBox(width: 8),
                  ],
                  DefaultTextStyle(
                    style: (theme.textTheme.labelLarge ?? const TextStyle()).copyWith(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
                    child: label,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
