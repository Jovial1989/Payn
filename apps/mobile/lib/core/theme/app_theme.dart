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
  static const double input = 22;
  static const double badge = 16;
}

abstract final class PaynColors {
  static const background = Color(0xFFFAFAF7);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceDim = Color(0xFFF2F4F1);
  static const surfaceRaised = Color(0xFFF7F8F5);
  static const surfaceDark = Color(0xFF13181A);
  static const surfaceElevatedDark = Color(0xFF1B2123);
  static const text = Color(0xFF0A0E0A);
  static const textInverse = Color(0xFFF5F7F3);
  static const textSecondary = Color(0xFF5C5F5C);
  static const textTertiary = Color(0xFF8C8F8C);
  static const outline = Color(0xFFE6E6E0);
  static const outlineSubtle = Color(0xFFEDEEE8);
  static const accent = Color(0xFF0FBE7B);
  static const accentStrong = Color(0xFF0D9F67);
  static const accentSurface = Color(0xFFE2F7EE);
  static const accentSurfaceStrong = Color(0xFFD1F2E2);
  static const positive = Color(0xFF0FBE7B);
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
    primary: PaynColors.accent,
    onPrimary: sf,
    secondary: PaynColors.surfaceDim,
    onSecondary: tx,
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
  final bodyText = GoogleFonts.interTextTheme(base);

  return ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: colorScheme,
    scaffoldBackgroundColor: bg,
    canvasColor: bg,
    splashColor: PaynColors.accent.withValues(alpha: 0.08),
    highlightColor: Colors.transparent,
    dividerColor: ol,
    textTheme: bodyText.copyWith(
      // H1 — screen headlines
      headlineMedium: GoogleFonts.interTight(
        fontSize: 38,
        fontWeight: FontWeight.w600,
        letterSpacing: -1.45,
        height: 0.98,
        color: tx,
      ),
      headlineLarge: GoogleFonts.interTight(
        fontSize: 58,
        fontWeight: FontWeight.w600,
        letterSpacing: -2.2,
        height: 0.94,
        color: tx,
      ),
      titleLarge: GoogleFonts.interTight(
        fontSize: 22,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.55,
        color: tx,
      ),
      titleMedium: bodyText.titleMedium?.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.22,
        color: tx,
      ),
      bodyLarge: bodyText.bodyLarge?.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        color: tx,
        height: 1.55,
      ),
      bodyMedium: bodyText.bodyMedium?.copyWith(
        fontSize: 15,
        fontWeight: FontWeight.w400,
        color: txSec,
        height: 1.5,
      ),
      labelLarge: bodyText.labelLarge?.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.05,
        color: tx,
      ),
      labelMedium: bodyText.labelMedium?.copyWith(
        fontSize: 12.5,
        fontWeight: FontWeight.w500,
        color: txTer,
        letterSpacing: 0.32,
      ),
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: bg,
      elevation: 0,
      scrolledUnderElevation: 0,
      surfaceTintColor: Colors.transparent,
      foregroundColor: tx,
      systemOverlayStyle: SystemUiOverlayStyle.dark,
      titleTextStyle: GoogleFonts.interTight(
        fontSize: 17,
        color: tx,
        fontWeight: FontWeight.w600,
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: sf,
      indicatorColor: PaynColors.accentSurface,
      surfaceTintColor: Colors.transparent,
      shadowColor: Colors.transparent,
      height: 74,
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        final selected = states.contains(WidgetState.selected);
        return bodyText.labelMedium?.copyWith(
          fontSize: 11,
          color: selected ? PaynColors.accent : txTer,
          fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
        );
      }),
      iconTheme: WidgetStateProperty.resolveWith((states) {
        final selected = states.contains(WidgetState.selected);
        return IconThemeData(
          color: selected ? PaynColors.accent : txTer,
          size: selected ? 23 : 21,
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
        textStyle: bodyText.labelLarge?.copyWith(
          fontSize: 14,
          fontWeight: FontWeight.w700,
        ),
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 24),
        shadowColor: Colors.transparent,
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
        textStyle: bodyText.labelLarge?.copyWith(fontSize: 14),
        padding: const EdgeInsets.symmetric(horizontal: 24),
      ),
    ),
    chipTheme: ChipThemeData(
      backgroundColor: sf,
      selectedColor: PaynColors.accentSurface,
      side: BorderSide(color: PaynColors.outlineSubtle),
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      labelStyle: bodyText.labelMedium?.copyWith(
        fontSize: 13,
        color: tx,
        fontWeight: FontWeight.w600,
      ),
      secondaryLabelStyle: bodyText.labelMedium?.copyWith(
        fontSize: 13,
        color: tx,
        fontWeight: FontWeight.w600,
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
      showCheckmark: false,
    ),
    bottomSheetTheme: BottomSheetThemeData(
      backgroundColor: bg,
      modalBackgroundColor: bg,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(PaynRadius.card),
        ),
      ),
    ),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: tx,
      contentTextStyle: bodyText.bodyMedium?.copyWith(color: sf),
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
      hintStyle: bodyText.bodyMedium?.copyWith(color: txTer, fontSize: 14),
      labelStyle: bodyText.labelMedium?.copyWith(
        color: txSec,
        fontSize: 13,
        fontWeight: FontWeight.w600,
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(PaynRadius.input),
        borderSide: const BorderSide(color: PaynColors.outlineSubtle),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(PaynRadius.input),
        borderSide: const BorderSide(color: PaynColors.outlineSubtle),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(PaynRadius.input),
        borderSide: const BorderSide(color: PaynColors.accent, width: 1.5),
      ),
      suffixIconColor: txTer,
      prefixIconColor: txTer,
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
