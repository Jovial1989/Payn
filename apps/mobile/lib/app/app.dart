import 'dart:async';
import 'dart:math' as math;

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
import 'package:payn_mobile/shared/widgets/payn_motion.dart';
import 'package:payn_mobile/shared/widgets/payn_mark.dart';

class PaynApp extends StatefulWidget {
  PaynApp({super.key, required this.controller})
    : _router = createRouter(controller);

  final AppController controller;
  final GoRouter _router;

  @override
  State<PaynApp> createState() => _PaynAppState();
}

class _PaynAppState extends State<PaynApp> with TickerProviderStateMixin {
  // Exit controller — drives the cross-fade from splash → first real
  // route once minimum-elapsed + first-frame-ready both fire.
  late final AnimationController _splashController;
  late final Animation<double> _splashOpacity;
  late final Animation<double> _splashScale;

  // Entrance controller — drives the in-splash choreography (glow pulse,
  // chevron draw, wordmark + tagline staggered reveal). Runs immediately
  // on mount so the user sees motion within ~100ms of launch instead of
  // a static logo holding for ~1.1s.
  late final AnimationController _entranceController;

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
      duration: const Duration(milliseconds: 520),
    );
    _splashOpacity = CurvedAnimation(
      parent: _splashController,
      curve: Curves.easeOutCubic,
    );
    _splashScale = Tween<double>(begin: 0.92, end: 1).animate(
      CurvedAnimation(parent: _splashController, curve: Curves.easeOutCubic),
    );

    _entranceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1100),
    )..forward();
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
    Timer(const Duration(milliseconds: 1180), () {
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
    _entranceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AppScope(
      controller: widget.controller,
      child: AnimatedBuilder(
        animation: widget.controller,
        builder: (context, _) {
          return MaterialApp.router(
            title: 'Payn',
            debugShowCheckedModeBanner: false,
            themeMode: ThemeMode.light,
            theme: buildAppTheme(),
            darkTheme: buildAppTheme(),
            locale: Locale(widget.controller.languageCode),
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
            builder: (context, child) {
              final reduceMotion = PaynMotion.reduce(context);
              final appChild = child ?? _SplashScreen(scale: _splashScale);

              return Stack(
                children: <Widget>[
                  AnimatedScale(
                    scale: _splashDone || reduceMotion ? 1 : 0.985,
                    duration: PaynMotion.duration(
                      context,
                      const Duration(milliseconds: 360),
                    ),
                    curve: PaynMotion.curve(context, Curves.easeOutCubic),
                    child: appChild,
                  ),
                  if (!_splashDone)
                    IgnorePointer(
                      ignoring: true,
                      child: FadeTransition(
                        opacity:
                            reduceMotion
                                ? const AlwaysStoppedAnimation<double>(0)
                                : ReverseAnimation(_splashOpacity),
                        child: _SplashScreen(
                          scale:
                              reduceMotion
                                  ? const AlwaysStoppedAnimation<double>(1)
                                  : _splashScale,
                          entrance:
                              reduceMotion
                                  ? const AlwaysStoppedAnimation<double>(1)
                                  : _entranceController,
                        ),
                      ),
                    ),
                ],
              );
            },
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
  const _SplashScreen({this.scale, this.entrance});

  /// Exit scale (driven by the parent's exit controller).
  final Animation<double>? scale;

  /// In-splash entrance progress (0..1). When non-null we stagger glow →
  /// chevron stroke draw → wordmark → tagline across the value range so
  /// the splash feels alive instead of holding a static logo for ~1.1s.
  final Animation<double>? entrance;

  @override
  Widget build(BuildContext context) {
    final tagline = AppLocalizations.of(context)?.splashTagline ?? '';

    Widget buildContent(double t) {
      // Interval helpers — clamp + remap a sub-range of t into 0..1.
      double interval(double start, double end) {
        if (t <= start) return 0;
        if (t >= end) return 1;
        return ((t - start) / (end - start)).clamp(0.0, 1.0);
      }

      double easeOutCubic(double v) => 1 - math.pow(1 - v, 3).toDouble();
      double easeOutBack(double v) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * math.pow(v - 1, 3) + c1 * math.pow(v - 1, 2).toDouble();
      }

      final glowT = easeOutCubic(interval(0.0, 0.35));
      final iconScaleT = easeOutBack(interval(0.05, 0.5));
      final strokeT = easeOutCubic(interval(0.18, 0.65));
      final wordT = easeOutCubic(interval(0.45, 0.8));
      final tagT = easeOutCubic(interval(0.65, 1.0));

      return Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          // Icon stack — pulsing emerald glow behind the gradient tile,
          // chevron stroke draws inside.
          SizedBox(
            width: 132,
            height: 132,
            child: Stack(
              alignment: Alignment.center,
              children: <Widget>[
                // Soft pulsing glow — sits behind the icon tile, fades up
                // first then settles.
                Opacity(
                  opacity: 0.55 * glowT,
                  child: Container(
                    width: 132,
                    height: 132,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: <Color>[
                          PaynColors.accent.withValues(alpha: 0.55),
                          PaynColors.accent.withValues(alpha: 0.0),
                        ],
                        stops: const <double>[0.0, 1.0],
                      ),
                    ),
                  ),
                ),
                Transform.scale(
                  scale: 0.9 + 0.1 * iconScaleT,
                  child: Container(
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
                    child: PaynMark(
                      size: 32,
                      strokeWidth: 3,
                      progress: strokeT,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 22),
          // "Payn" wordmark — fades up with a small Y translation.
          Opacity(
            opacity: wordT,
            child: Transform.translate(
              offset: Offset(0, 12 * (1 - wordT)),
              child: const Text(
                'Payn',
                style: TextStyle(
                  fontFamily: 'Manrope',
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.7,
                  color: PaynColors.text,
                  decoration: TextDecoration.none,
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          // Localised tagline — same fade-up, even slower.
          Opacity(
            opacity: tagT,
            child: Transform.translate(
              offset: Offset(0, 8 * (1 - tagT)),
              child: Text(
                tagline,
                style: const TextStyle(
                  fontFamily: 'Manrope',
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  letterSpacing: -0.1,
                  color: PaynColors.textSecondary,
                  decoration: TextDecoration.none,
                ),
              ),
            ),
          ),
        ],
      );
    }

    final inner = entrance == null
        ? buildContent(1)
        : AnimatedBuilder(
            animation: entrance!,
            builder: (_, __) => buildContent(entrance!.value),
          );

    return DecoratedBox(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: <Color>[
            Color(0xFFF8FCFA),
            Color(0xFFF2F7F4),
            Color(0xFFEAF4EE),
          ],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Center(
        child: scale == null ? inner : ScaleTransition(scale: scale!, child: inner),
      ),
    );
  }
}
