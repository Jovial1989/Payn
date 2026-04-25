import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

abstract final class PaynSpace {
  static const double xxs = 4;
  static const double xs = 8;
  static const double sm = 12;
  static const double md = 16;
  static const double lg = 20;
  static const double xl = 24;
  static const double xxl = 32;
}

abstract final class PaynRadius {
  static const double chip = 999;
  static const double button = 18;
  static const double card = 28;
  static const double panel = 32;
  static const double shell = 34;
  static const double badge = 16;
}

abstract final class PaynColors {
  static const background = Color(0xFFF4F6F3);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceDim = Color(0xFFF7F9F6);
  static const surfaceRaised = Color(0xFFFBFCFB);
  static const text = Color(0xFF111827);
  static const textSecondary = Color(0xFF4B5563);
  static const textTertiary = Color(0xFF8A94A6);
  static const outline = Color(0xFFDDE3DD);
  static const outlineSubtle = Color(0xFFE9EEEA);
  static const accent = Color(0xFF0F8A4B);
  static const accentStrong = Color(0xFF0B6D3B);
  static const accentSurface = Color(0xFFDDF4E7);
  static const positive = Color(0xFF0F8A4B);
  static const positiveSurface = Color(0xFFE7F7EF);
  static const warning = Color(0xFFC46B1A);
  static const warningSurface = Color(0xFFFFF1E5);
  static const info = Color(0xFF1F6FEB);
  static const infoSurface = Color(0xFFE8F3FF);
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
    splashColor: PaynColors.accent.withValues(alpha: 0.08),
    highlightColor: Colors.transparent,
    dividerColor: ol,
    textTheme: tt.copyWith(
      // H1 — screen headlines
      headlineMedium: tt.headlineMedium?.copyWith(
        fontSize: 30,
        fontWeight: FontWeight.w800,
        letterSpacing: -1.0,
        height: 1.06,
        color: tx,
      ),
      headlineLarge: tt.headlineLarge?.copyWith(
        fontSize: 38,
        fontWeight: FontWeight.w800,
        letterSpacing: -1.6,
        height: 0.98,
        color: tx,
      ),
      // Title — section titles
      titleLarge: tt.titleLarge?.copyWith(
        fontSize: 19,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.42,
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
        indicatorColor: PaynColors.accentSurface,
        surfaceTintColor: Colors.transparent,
        shadowColor: Colors.transparent,
        height: 76,
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
        borderRadius: BorderRadius.circular(PaynRadius.card),
        side: BorderSide(color: PaynColors.outlineSubtle),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: PaynColors.accent,
        foregroundColor: sf,
        disabledBackgroundColor: ol,
        disabledForegroundColor: txTer,
        minimumSize: const Size.fromHeight(48),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(PaynRadius.button),
        ),
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
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(PaynRadius.button),
        ),
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
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
      showCheckmark: false,
    ),
    bottomSheetTheme: BottomSheetThemeData(
      backgroundColor: bg,
      modalBackgroundColor: bg,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(PaynRadius.card)),
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
        borderSide: const BorderSide(color: PaynColors.accent, width: 1.5),
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
