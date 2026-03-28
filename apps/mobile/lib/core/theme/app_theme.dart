import 'package:flutter/material.dart';

ThemeData buildAppTheme() {
  const background = Color(0xFF071018);
  const surface = Color(0xFF101A24);
  const accent = Color(0xFF58E0B8);
  const outline = Color(0xFF243342);
  const text = Color(0xFFF4F7FB);
  const muted = Color(0xFF8A9EAF);

  const colorScheme = ColorScheme(
    brightness: Brightness.dark,
    primary: accent,
    onPrimary: Color(0xFF03120D),
    secondary: Color(0xFF7BC3FF),
    onSecondary: Color(0xFF04111B),
    error: Color(0xFFFF8B7B),
    onError: Color(0xFF1C0502),
    surface: surface,
    onSurface: text,
    onSurfaceVariant: muted,
    outline: Color(0xFF314254),
    outlineVariant: outline,
    primaryContainer: Color(0xFF0E3429),
    onPrimaryContainer: Color(0xFFDFF9F1),
    secondaryContainer: Color(0xFF132F47),
    onSecondaryContainer: Color(0xFFDCEEFF),
    tertiary: Color(0xFF9F8CFF),
    onTertiary: Color(0xFF140B3A),
    tertiaryContainer: Color(0xFF302364),
    onTertiaryContainer: Color(0xFFEAE4FF),
    inverseSurface: text,
    onInverseSurface: background,
    inversePrimary: Color(0xFF0E8D6E),
    shadow: Colors.black,
    scrim: Colors.black,
    surfaceTint: Colors.transparent,
  );

  final baseTextTheme =
      ThemeData(
        brightness: Brightness.dark,
        useMaterial3: true,
        colorScheme: colorScheme,
      ).textTheme;

  return ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: colorScheme,
    scaffoldBackgroundColor: background,
    canvasColor: background,
    splashColor: accent.withValues(alpha: 0.08),
    highlightColor: Colors.transparent,
    dividerColor: outline,
    textTheme: baseTextTheme.copyWith(
      headlineMedium: baseTextTheme.headlineMedium?.copyWith(
        fontSize: 30,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.6,
        height: 1.05,
      ),
      titleLarge: baseTextTheme.titleLarge?.copyWith(
        fontSize: 20,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.2,
      ),
      titleMedium: baseTextTheme.titleMedium?.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.1,
      ),
      bodyLarge: baseTextTheme.bodyLarge?.copyWith(
        fontSize: 16,
        color: text,
        height: 1.5,
      ),
      bodyMedium: baseTextTheme.bodyMedium?.copyWith(
        fontSize: 14,
        color: muted,
        height: 1.5,
      ),
      labelLarge: baseTextTheme.labelLarge?.copyWith(
        fontSize: 13,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.1,
      ),
      labelMedium: baseTextTheme.labelMedium?.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.1,
      ),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: const Color(0xFF0B141E),
      indicatorColor: accent.withValues(alpha: 0.16),
      surfaceTintColor: Colors.transparent,
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        final selected = states.contains(WidgetState.selected);
        return baseTextTheme.labelMedium?.copyWith(
          color: selected ? text : muted,
          fontWeight: selected ? FontWeight.w700 : FontWeight.w600,
        );
      }),
      iconTheme: WidgetStateProperty.resolveWith((states) {
        final selected = states.contains(WidgetState.selected);
        return IconThemeData(color: selected ? accent : muted, size: 24);
      }),
    ),
    cardTheme: CardThemeData(
      color: surface,
      margin: EdgeInsets.zero,
      surfaceTintColor: Colors.transparent,
      shadowColor: Colors.black.withValues(alpha: 0.2),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: const BorderSide(color: outline),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: accent,
        foregroundColor: colorScheme.onPrimary,
        minimumSize: const Size.fromHeight(52),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        textStyle: baseTextTheme.labelLarge?.copyWith(
          fontWeight: FontWeight.w700,
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: surface,
      hintStyle: baseTextTheme.bodyMedium?.copyWith(color: muted),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: outline),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: outline),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: accent.withValues(alpha: 0.8)),
      ),
    ),
  );
}
