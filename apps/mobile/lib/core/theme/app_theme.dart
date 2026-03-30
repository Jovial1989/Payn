import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

// ─────────────────────────────────────────────────────────────
// Payn Design System v2.1 — Premium polish pass
// ─────────────────────────────────────────────────────────────
// Typography: H1 28 / Title 18 / Subtitle 15 / Body 14 / Label 13 / Caption 12
// Spacing:    4 / 8 / 12 / 16 / 20 / 24 / 28 / 32
// Radius:     section 28 / cards 20 / chips 10 / buttons 14 / badges 8
// Elevation:  subtle shadow on cards for depth
// ─────────────────────────────────────────────────────────────

abstract final class PaynColors {
  static const background = Color(0xFFF5F5F7);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceDim = Color(0xFFF1F2F4);
  static const text = Color(0xFF0D0D0D);
  static const textSecondary = Color(0xFF5F6368);
  static const textTertiary = Color(0xFF9AA0A6);
  static const outline = Color(0xFFE6E8EC);
  static const outlineSubtle = Color(0xFFEEF0F3);
  static const accent = Color(0xFF1A73E8);
  static const accentSurface = Color(0xFFE8F0FE);
  static const positive = Color(0xFF137333);
  static const positiveSurface = Color(0xFFE6F4EA);
  static const warning = Color(0xFFE37400);
  static const warningSurface = Color(0xFFFEF3E2);
  static const error = Color(0xFFD93025);
}

ThemeData buildAppTheme() {
  const bg = PaynColors.background;
  const sf = PaynColors.surface;
  const tx = PaynColors.text;
  const txSec = PaynColors.textSecondary;
  const txTer = PaynColors.textTertiary;
  const ol = PaynColors.outline;

  const colorScheme = ColorScheme(
    brightness: Brightness.light,
    primary: tx,
    onPrimary: sf,
    secondary: PaynColors.accentSurface,
    onSecondary: PaynColors.accent,
    error: PaynColors.error,
    onError: sf,
    surface: sf,
    onSurface: tx,
    onSurfaceVariant: txSec,
    outline: ol,
    outlineVariant: PaynColors.outlineSubtle,
    primaryContainer: PaynColors.surfaceDim,
    onPrimaryContainer: tx,
    secondaryContainer: PaynColors.accentSurface,
    onSecondaryContainer: PaynColors.accent,
    tertiary: PaynColors.warningSurface,
    onTertiary: PaynColors.warning,
    tertiaryContainer: PaynColors.warningSurface,
    onTertiaryContainer: PaynColors.warning,
    inverseSurface: tx,
    onInverseSurface: bg,
    inversePrimary: sf,
    shadow: Colors.black,
    scrim: Colors.black,
    surfaceTint: Colors.transparent,
  );

  final base =
      ThemeData(
        brightness: Brightness.light,
        useMaterial3: true,
        colorScheme: colorScheme,
      ).textTheme;
  final tt = GoogleFonts.manropeTextTheme(base);

  return ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: colorScheme,
    scaffoldBackgroundColor: bg,
    canvasColor: bg,
    splashColor: Colors.black.withValues(alpha: 0.04),
    highlightColor: Colors.transparent,
    dividerColor: ol,
    textTheme: tt.copyWith(
      // H1 — screen headlines
      headlineMedium: tt.headlineMedium?.copyWith(
        fontSize: 28,
        fontWeight: FontWeight.w800,
        letterSpacing: -0.8,
        height: 1.12,
        color: tx,
      ),
      // Title — section titles
      titleLarge: tt.titleLarge?.copyWith(
        fontSize: 18,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.3,
        color: tx,
      ),
      // Subtitle — card titles, row titles (lighter than title for hierarchy)
      titleMedium: tt.titleMedium?.copyWith(
        fontSize: 15,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.15,
        color: tx,
      ),
      // Body
      bodyLarge: tt.bodyLarge?.copyWith(
        fontSize: 15,
        fontWeight: FontWeight.w400,
        color: tx,
        height: 1.4,
      ),
      bodyMedium: tt.bodyMedium?.copyWith(
        fontSize: 13,
        fontWeight: FontWeight.w400,
        color: txSec,
        height: 1.4,
      ),
      // Label — buttons, badges, small headings
      labelLarge: tt.labelLarge?.copyWith(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.0,
        color: tx,
      ),
      // Caption — minimum 12px for legibility
      labelMedium: tt.labelMedium?.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        color: txTer,
        letterSpacing: 0.05,
      ),
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: bg,
      elevation: 0,
      scrolledUnderElevation: 0,
      surfaceTintColor: Colors.transparent,
      foregroundColor: tx,
      systemOverlayStyle: SystemUiOverlayStyle.dark,
      titleTextStyle: tt.titleMedium?.copyWith(
        fontSize: 15,
        color: tx,
        fontWeight: FontWeight.w700,
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: sf,
      indicatorColor: Colors.black.withValues(alpha: 0.06),
      surfaceTintColor: Colors.transparent,
      shadowColor: Colors.transparent,
      height: 72,
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        final selected = states.contains(WidgetState.selected);
        return tt.labelMedium?.copyWith(
          fontSize: 11,
          color: selected ? tx : txTer,
          fontWeight: selected ? FontWeight.w700 : FontWeight.w400,
        );
      }),
      iconTheme: WidgetStateProperty.resolveWith((states) {
        final selected = states.contains(WidgetState.selected);
        return IconThemeData(
          color: selected ? tx : txTer,
          size: selected ? 24 : 22,
        );
      }),
    ),
    cardTheme: CardThemeData(
      color: sf,
      margin: EdgeInsets.zero,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      shadowColor: Colors.black.withValues(alpha: 0.08),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: ol),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: tx,
        foregroundColor: sf,
        disabledBackgroundColor: ol,
        disabledForegroundColor: txTer,
        minimumSize: const Size.fromHeight(48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: tt.labelLarge?.copyWith(
          fontSize: 14,
          fontWeight: FontWeight.w700,
        ),
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 24),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: tx,
        backgroundColor: sf,
        side: BorderSide(color: ol),
        minimumSize: const Size.fromHeight(48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: tt.labelLarge?.copyWith(fontSize: 14),
        padding: const EdgeInsets.symmetric(horizontal: 24),
      ),
    ),
    chipTheme: ChipThemeData(
      backgroundColor: sf,
      selectedColor: PaynColors.accentSurface,
      side: BorderSide(color: PaynColors.outlineSubtle),
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      labelStyle: tt.labelMedium?.copyWith(fontSize: 13, color: tx, fontWeight: FontWeight.w600),
      secondaryLabelStyle: tt.labelMedium?.copyWith(fontSize: 13, color: tx, fontWeight: FontWeight.w600),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      showCheckmark: false,
    ),
    bottomSheetTheme: BottomSheetThemeData(
      backgroundColor: bg,
      modalBackgroundColor: bg,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
    ),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: tx,
      contentTextStyle: tt.bodyMedium?.copyWith(color: sf),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ),
    segmentedButtonTheme: SegmentedButtonThemeData(
      style: ButtonStyle(
        backgroundColor: WidgetStateProperty.resolveWith<Color?>((states) {
          return states.contains(WidgetState.selected) ? tx : sf;
        }),
        foregroundColor: WidgetStateProperty.resolveWith<Color?>((states) {
          return states.contains(WidgetState.selected) ? sf : tx;
        }),
        side: WidgetStatePropertyAll(BorderSide(color: ol)),
        shape: WidgetStatePropertyAll(
          RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        visualDensity: VisualDensity.compact,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: sf,
      hintStyle: tt.bodyMedium?.copyWith(color: txTer, fontSize: 14),
      labelStyle: tt.bodyMedium?.copyWith(color: txSec, fontSize: 14),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: PaynColors.outlineSubtle),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: PaynColors.outlineSubtle),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: tx, width: 1.5),
      ),
    ),
    sliderTheme: SliderThemeData(
      activeTrackColor: tx,
      inactiveTrackColor: ol,
      thumbColor: tx,
      overlayColor: Colors.black.withValues(alpha: 0.06),
      trackHeight: 3,
      thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 8),
    ),
  );
}
