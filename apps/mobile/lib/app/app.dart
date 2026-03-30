import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/app/router.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/services/app_controller.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';

class PaynApp extends StatelessWidget {
  PaynApp({super.key, required this.controller})
    : _router = createRouter(controller);

  final AppController controller;
  final GoRouter _router;

  @override
  Widget build(BuildContext context) {
    return AppScope(
      controller: controller,
      child: MaterialApp.router(
        title: 'Payn',
        debugShowCheckedModeBanner: false,
        themeMode: ThemeMode.light,
        theme: buildAppTheme(),
        darkTheme: buildAppTheme(),
        routerConfig: _router,
      ),
    );
  }
}
