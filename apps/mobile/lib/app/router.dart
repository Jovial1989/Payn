import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/features/auth/presentation/auth_screen.dart';
import 'package:payn_mobile/features/compare/presentation/compare_screen.dart';
import 'package:payn_mobile/features/explore/presentation/explore_screen.dart';
import 'package:payn_mobile/features/home/presentation/home_screen.dart';
import 'package:payn_mobile/features/locale_gate/presentation/locale_gate_screen.dart';
import 'package:payn_mobile/features/offers/presentation/offer_detail_screen.dart';
import 'package:payn_mobile/features/profile/presentation/profile_screen.dart';
import 'package:payn_mobile/features/saved/presentation/saved_screen.dart';
import 'package:payn_mobile/shared/services/app_controller.dart';
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
        builder: (context, state) => const LocaleGateScreen(),
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
                builder: (context, state) => const HomeScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: <RouteBase>[
              GoRoute(
                path: '/explore',
                builder: (context, state) => const ExploreScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: <RouteBase>[
              GoRoute(
                path: '/saved',
                builder: (context, state) => const SavedScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: <RouteBase>[
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/offer/:offerId',
        builder: (context, state) {
          final offerId = state.pathParameters['offerId']!;
          return OfferDetailScreen(offerId: offerId);
        },
      ),
      GoRoute(
        path: '/compare',
        builder: (context, state) => const CompareScreen(),
      ),
      GoRoute(
        path: '/auth',
        builder: (context, state) {
          final mode = state.uri.queryParameters['mode'] ?? 'signIn';
          return AuthScreen(
            initialMode: mode == 'signUp' ? AuthMode.signUp : AuthMode.signIn,
          );
        },
      ),
    ],
    errorBuilder: (context, state) {
      return Scaffold(
        body: Center(
          child: Text(
            'We could not open that route.',
            style: Theme.of(context).textTheme.titleMedium,
          ),
        ),
      );
    },
  );
}
