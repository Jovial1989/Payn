import 'package:flutter/material.dart';

ThemeData buildAppTheme() {
  const accent = Color(0xFF19C37D);
  const background = Color(0xFF04100C);

  return ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: background,
    colorScheme: const ColorScheme.dark(
      primary: accent,
      secondary: accent,
      surface: Color(0xFF0E1F19),
    ),
    cardTheme: const CardThemeData(
      color: Color(0xFF0E1F19),
      margin: EdgeInsets.zero,
    ),
  );
}

