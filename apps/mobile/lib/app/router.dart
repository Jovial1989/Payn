import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/l10n/app_localizations.dart';
import 'package:payn_mobile/features/auth/presentation/auth_screen.dart';
import 'package:payn_mobile/features/compare/presentation/compare_screen.dart';
import 'package:payn_mobile/features/explore/presentation/explore_screen.dart';
import 'package:payn_mobile/features/home/presentation/home_screen.dart';
import 'package:payn_mobile/features/locale_gate/presentation/locale_gate_screen.dart';
import 'package:payn_mobile/features/offers/presentation/offer_detail_screen.dart';
import 'package:payn_mobile/features/profile/presentation/profile_screen.dart';
import 'package:payn_mobile/features/saved/presentation/saved_screen.dart';
import 'package:payn_mobile/shared/services/app_controller.dart';
import 'package:payn_mobile/shared/widgets/payn_motion.dart';
import 'package:payn_mobile/shared/widgets/payn_shell.dart';

GoRouter createRouter(AppController controller) {
  return GoRouter(
    initialLocation: '/home',
    refreshListenable: controller,
    redirect: (context, state) {
      final isDone = controller.localeGateDone;
      final onGate = state.matchedLocation == '/locale-gate';

      if (!isDone && !onGate) return '/locale-gate';
      if (isDone && onGate) return '/home';
      return null;
    },
    routes: <RouteBase>[
      GoRoute(
        path: '/locale-gate',
        pageBuilder:
            (context, state) => _buildTransitionPage(
              state: state,
              child: const LocaleGateScreen(),
            ),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return PaynShell(navigationShell: navigationShell);
        },
        branches: <StatefulShellBranch>[
          StatefulShellBranch(
            routes: <RouteBase>[
              GoRoute(
                path: '/home',
                pageBuilder:
                    (context, state) => _buildTransitionPage(
                      state: state,
                      child: const HomeScreen(),
                    ),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: <RouteBase>[
              GoRoute(
                path: '/explore',
                pageBuilder:
                    (context, state) => _buildTransitionPage(
                      state: state,
                      child: const ExploreScreen(),
                    ),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: <RouteBase>[
              GoRoute(
                path: '/saved',
                pageBuilder:
                    (context, state) => _buildTransitionPage(
                      state: state,
                      child: const SavedScreen(),
                    ),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: <RouteBase>[
              GoRoute(
                path: '/profile',
                pageBuilder:
                    (context, state) => _buildTransitionPage(
                      state: state,
                      child: const ProfileScreen(),
                    ),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/offer/:offerId',
        pageBuilder: (context, state) {
          final offerId = state.pathParameters['offerId']!;
          return _buildTransitionPage(
            state: state,
            child: OfferDetailScreen(offerId: offerId),
          );
        },
      ),
      GoRoute(
        path: '/compare',
        pageBuilder:
            (context, state) => _buildTransitionPage(
              state: state,
              child: const CompareScreen(),
            ),
      ),
      GoRoute(
        path: '/auth',
        pageBuilder: (context, state) {
          final mode = state.uri.queryParameters['mode'] ?? 'signIn';
          return _buildTransitionPage(
            state: state,
            child: AuthScreen(
              initialMode: mode == 'signUp' ? AuthMode.signUp : AuthMode.signIn,
            ),
          );
        },
      ),
    ],
    errorBuilder: (context, state) {
      return Scaffold(
        body: Center(
          child: Text(
            AppLocalizations.of(context)?.routerError ?? '',
            style: Theme.of(context).textTheme.titleMedium,
          ),
        ),
      );
    },
  );
}

CustomTransitionPage<void> _buildTransitionPage({
  required GoRouterState state,
  required Widget child,
}) {
  return CustomTransitionPage<void>(
    key: state.pageKey,
    transitionDuration: PaynMotion.route,
    reverseTransitionDuration: PaynMotion.medium,
    child: child,
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      if (PaynMotion.reduce(context)) {
        return child;
      }
      // Two-layer iOS-grade transition:
      //   • Incoming page (animation): fade up + slight scale.
      //   • Outgoing page (secondaryAnimation): parallax — fades slightly
      //     and drifts up a touch so the new content feels like it lands
      //     ON TOP of something, not blinks in from nowhere.
      final fade = CurvedAnimation(parent: animation, curve: PaynMotion.ease);
      final slide = Tween<Offset>(
        begin: const Offset(0, 0.06),
        end: Offset.zero,
      ).animate(fade);
      final scale = Tween<double>(
        begin: 0.975,
        end: 1,
      ).animate(fade);

      final outgoingFade = CurvedAnimation(
        parent: secondaryAnimation,
        curve: PaynMotion.ease,
      );
      final outgoingSlide = Tween<Offset>(
        begin: Offset.zero,
        end: const Offset(0, -0.02),
      ).animate(outgoingFade);
      final outgoingOpacity = Tween<double>(
        begin: 1,
        end: 0.85,
      ).animate(outgoingFade);

      return FadeTransition(
        opacity: outgoingOpacity,
        child: SlideTransition(
          position: outgoingSlide,
          child: FadeTransition(
            opacity: fade,
            child: SlideTransition(
              position: slide,
              child: ScaleTransition(scale: scale, child: child),
            ),
          ),
        ),
      );
    },
  );
}
