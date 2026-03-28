import 'package:flutter/material.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/features/home/presentation/home_screen.dart';

class PaynApp extends StatelessWidget {
  const PaynApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Payn',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      theme: buildAppTheme(),
      darkTheme: buildAppTheme(),
      home: const HomeScreen(),
    );
  }
}
