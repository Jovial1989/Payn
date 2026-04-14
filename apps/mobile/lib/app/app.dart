import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/app/router.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/services/app_controller.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';
import 'package:payn_mobile/shared/widgets/payn_mark.dart';

class PaynApp extends StatefulWidget {
  PaynApp({super.key, required this.controller})
    : _router = createRouter(controller);

  final AppController controller;
  final GoRouter _router;

  @override
  State<PaynApp> createState() => _PaynAppState();
}

class _PaynAppState extends State<PaynApp> with SingleTickerProviderStateMixin {
  late final AnimationController _splashController;
  late final Animation<double> _splashOpacity;
  bool _splashDone = false;

  @override
  void initState() {
    super.initState();

    // Edge-to-edge + transparent bars for iPhone Dynamic Island / home indicator.
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        statusBarBrightness: Brightness.light,
        systemNavigationBarColor: Colors.transparent,
        systemNavigationBarDividerColor: Colors.transparent,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
    );

    _splashController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 380),
    );
    _splashOpacity = CurvedAnimation(
      parent: _splashController,
      curve: Curves.easeIn,
    );

    // Brief branded moment (250ms) then fade out.
    Timer(const Duration(milliseconds: 250), () {
      if (!mounted) return;
      _splashController.forward().then((_) {
        if (mounted) setState(() => _splashDone = true);
      });
    });
  }

  @override
  void dispose() {
    _splashController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AppScope(
      controller: widget.controller,
      child: MaterialApp.router(
        title: 'Payn',
        debugShowCheckedModeBanner: false,
        themeMode: ThemeMode.light,
        theme: buildAppTheme(),
        darkTheme: buildAppTheme(),
        routerConfig: widget._router,
        // Wrap every page in the splash overlay so it fades from app launch.
        builder: (context, child) {
          return Stack(
            children: <Widget>[
              child ?? const SizedBox.shrink(),
              if (!_splashDone)
                FadeTransition(
                  opacity: ReverseAnimation(_splashOpacity),
                  child: const _SplashScreen(),
                ),
            ],
          );
        },
      ),
    );
  }
}

// ─────────────────────────────────────────────────
// Splash
// ─────────────────────────────────────────────────

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: PaynColors.background,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: PaynColors.text,
                borderRadius: BorderRadius.circular(18),
                boxShadow: <BoxShadow>[
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.10),
                    blurRadius: 24,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              alignment: Alignment.center,
              child: const PaynMark(size: 22, strokeWidth: 2.8),
            ),
            const SizedBox(height: 18),
            const Text(
              'Payn',
              style: TextStyle(
                fontFamily: 'Manrope',
                fontSize: 22,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.6,
                color: PaynColors.text,
                decoration: TextDecoration.none,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
