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
import 'package:payn_mobile/shared/services/push_service.dart';
import 'package:payn_mobile/shared/widgets/payn_motion.dart';
import 'package:payn_mobile/shared/widgets/payn_mark.dart';

class PaynApp extends StatefulWidget {
  PaynApp({super.key, required this.controller, this.pushService})
    : _router = createRouter(controller);

  final AppController controller;
  final GoRouter _router;
  // PR-INT-01 — Optional so bootstrap can decline to wire push in
  // environments where Firebase isn't configured. When present we wire
  // the tap-to-route callback in initState, which gives PushService a
  // way to navigate without holding a BuildContext.
  final PushService? pushService;

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
      duration: const Duration(milliseconds: 820),
    );
    _splashOpacity = CurvedAnimation(
      parent: _splashController,
      curve: Curves.easeOutCubic,
    );
    _splashScale = Tween<double>(begin: 0.86, end: 1).animate(
      CurvedAnimation(parent: _splashController, curve: Curves.easeOutCubic),
    );

    // Entrance choreography: 3.0s wall-time. Phases overlap so the
    // splash reads as one continuous bloom — glow → tile pop → chevron
    // stroke draw → wordmark → tagline → settle pulse → halo expand
    // before the screen hands off.
    _entranceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3000),
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

    // Keep the branded launch surface visible long enough for the full
    // choreography (glow → stroke draw → wordmark → tagline → settle
    // pulse → halo expand) to play. Total ~3.1s of branded launch before
    // the route surface fades in.
    Timer(const Duration(milliseconds: 3100), () {
      if (!mounted) return;
      setState(() => _minimumSplashElapsed = true);
      _completeSplashIfReady();
    });

    // PR-INT-01 — Hand the router callback to PushService now that the
    // router exists. If a cold-start push tap fired before this point,
    // PushService has buffered the route and will replay it immediately
    // via the callback we pass in.
    widget.pushService?.attachRouter((route) {
      // Schedule the navigation after the current frame so the route
      // change doesn't race with the splash dismiss animation.
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        try {
          widget._router.go(route);
        } catch (e) {
          debugPrint('[PaynApp] Failed to open push route "$route" — $e');
        }
      });
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

      // Choreography across [0..1] of the entrance animation (now 3.0s
      // wall-time). Phases overlap heavily so the splash reads as a
      // continuous bloom rather than discrete beats.
      final glowT = easeOutCubic(interval(0.0, 0.22));
      final iconScaleT = easeOutBack(interval(0.03, 0.34));
      final strokeT = easeOutCubic(interval(0.14, 0.5));
      final wordT = easeOutCubic(interval(0.36, 0.6));
      final tagT = easeOutCubic(interval(0.52, 0.76));

      // Settle pulse — gentle breath at 70-85% of the timeline.
      final settlePulsePhase = interval(0.7, 0.85);
      final settlePulse = 1 + 0.025 * math.sin(settlePulsePhase * math.pi);

      // Halo bloom — at 85-100% a soft radial glow grows behind the
      // icon then fades, the visual "we're ready" beat right before
      // the route surface fades in. Bell-curve so it peaks at ~92.5%.
      final haloPhase = interval(0.85, 1.0);
      final haloIntensity = math.sin(haloPhase * math.pi);

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
                // Halo bloom — expanding ring during the final 15% of
                // the timeline. Grows ~30% beyond the base glow and
                // fades back to zero, signalling "ready to launch".
                if (haloIntensity > 0)
                  Opacity(
                    opacity: 0.45 * haloIntensity,
                    child: Container(
                      width: 132 + 60 * haloIntensity,
                      height: 132 + 60 * haloIntensity,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: RadialGradient(
                          colors: <Color>[
                            PaynColors.accent.withValues(alpha: 0.0),
                            PaynColors.accent.withValues(alpha: 0.35),
                            PaynColors.accent.withValues(alpha: 0.0),
                          ],
                          stops: const <double>[0.55, 0.78, 1.0],
                        ),
                      ),
                    ),
                  ),
                Transform.scale(
                  scale: (0.9 + 0.1 * iconScaleT) * settlePulse,
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
