import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../features/home/presentation/home_screen.dart';

class PaynApp extends StatelessWidget {
  const PaynApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Payn',
      theme: buildAppTheme(),
      home: const HomeScreen(),
    );
  }
}

