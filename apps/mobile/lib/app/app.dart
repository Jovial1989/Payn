import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/app/router.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/l10n/app_localizations.dart';
import 'package:payn_mobile/shared/services/analytics_service.dart';
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
  late final Animation<double> _splashScale;
  bool _splashDone = false;
  bool _minimumSplashElapsed = false;
  bool _firstFrameReady = false;

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
      duration: const Duration(milliseconds: 920),
    );
    _splashOpacity = CurvedAnimation(
      parent: _splashController,
      curve: const Interval(0.28, 1, curve: Curves.easeOutCubic),
    );
    _splashScale = Tween<double>(begin: 0.92, end: 1).animate(
      CurvedAnimation(
        parent: _splashController,
        curve: const Interval(0, 0.72, curve: Curves.easeOutBack),
      ),
    );
    unawaited(
      widget.controller.analytics.track(
        AnalyticsEvents.splashViewed,
        properties: widget.controller.analytics.buildDefaultProperties(
          preferences: widget.controller.preferences,
          loggedIn: widget.controller.isAuthenticated,
        ),
      ),
    );

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      setState(() => _firstFrameReady = true);
      _completeSplashIfReady();
    });

    // Keep the branded launch surface visible until the app has produced
    // its first real frame and the minimum splash duration has elapsed.
    Timer(const Duration(milliseconds: 820), () {
      if (!mounted) return;
      setState(() => _minimumSplashElapsed = true);
      _completeSplashIfReady();
    });
  }

  void _completeSplashIfReady() {
    if (_splashDone || !_minimumSplashElapsed || !_firstFrameReady) {
      return;
    }

    _splashController.forward().then((_) {
      if (mounted) {
        setState(() => _splashDone = true);
      }
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
        locale: Locale(widget.controller.preferences.languageCode),
        supportedLocales: AppLocalizations.supportedLocales,
        localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        routerConfig: widget._router,
        localeResolutionCallback: (locale, supportedLocales) {
          if (locale == null) {
            return const Locale('en');
          }
          for (final supported in supportedLocales) {
            if (supported.languageCode == locale.languageCode) {
              return supported;
            }
          }
          return const Locale('en');
        },
        // Wrap every page in the splash overlay so it fades from app launch.
        builder: (context, child) {
          return Stack(
            children: <Widget>[
              child ?? _SplashScreen(scale: _splashScale),
              if (!_splashDone)
                FadeTransition(
                  opacity: ReverseAnimation(_splashOpacity),
                  child: _SplashScreen(scale: _splashScale),
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
  const _SplashScreen({this.scale});

  final Animation<double>? scale;

  @override
  Widget build(BuildContext context) {
    final content = Column(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        Container(
          width: 84,
          height: 84,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: <Color>[
                Color(0xFF1BE39A),
                PaynColors.accent,
                Color(0xFF0A6B46),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(26),
            boxShadow: <BoxShadow>[
              BoxShadow(
                color: PaynColors.accent.withValues(alpha: 0.28),
                blurRadius: 36,
                offset: const Offset(0, 16),
              ),
            ],
          ),
          alignment: Alignment.center,
          child: const PaynMark(size: 28, strokeWidth: 3),
        ),
        const SizedBox(height: 18),
        const Text(
          'Payn',
          style: TextStyle(
            fontFamily: 'Manrope',
            fontSize: 24,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.7,
            color: PaynColors.text,
            decoration: TextDecoration.none,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          AppLocalizations.of(context)?.splashTagline ?? 'Move money with more clarity',
          style: const TextStyle(
            fontFamily: 'Manrope',
            fontSize: 13,
            fontWeight: FontWeight.w600,
            letterSpacing: -0.1,
            color: PaynColors.textSecondary,
            decoration: TextDecoration.none,
          ),
        ),
      ],
    );

    return DecoratedBox(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: <Color>[Color(0xFFF8FCFA), Color(0xFFF2F7F4), Color(0xFFEAF4EE)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Center(
        child:
            scale == null
                ? content
                : ScaleTransition(scale: scale!, child: content),
      ),
    );
  }
}
