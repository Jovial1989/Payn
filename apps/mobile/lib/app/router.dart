import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/features/auth/presentation/auth_screen.dart';
import 'package:payn_mobile/features/chat/presentation/chat_screen.dart';
import 'package:payn_mobile/features/compare/presentation/compare_screen.dart';
import 'package:payn_mobile/features/explore/presentation/explore_screen.dart';
import 'package:payn_mobile/features/home/presentation/home_screen.dart';
import 'package:payn_mobile/features/locale_gate/presentation/locale_gate_screen.dart';
import 'package:payn_mobile/features/offers/presentation/offer_detail_screen.dart';
import 'package:payn_mobile/features/onboarding/presentation/onboarding_screen.dart';
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
      // Gate order is STRICT: onboarding → locale-gate → auth. Each gate
      // is fully resolved before the next is even evaluated. The earlier
      // flat version evaluated the locale-gate check while still on
      // /onboarding (it wasn't guarded by onboardingDone), so a fresh
      // install bounced /onboarding → /locale-gate → /onboarding forever.
      // GoRouter then hit its redirect limit and rendered the
      // errorBuilder's SizedBox.shrink() — a permanent BLACK screen.
      final loc = state.matchedLocation;
      final onboardingDone = controller.onboardingDone;
      final localeGateDone = controller.localeGateDone;
      final isAuth = controller.isAuthenticated;

      // Gate 1 — onboarding. Until it's done, force /onboarding and do
      // NOT evaluate any later gate (this is what breaks the loop).
      if (!onboardingDone) {
        return loc == '/onboarding' ? null : '/onboarding';
      }
      // Onboarding done but user is still parked on it → advance.
      if (loc == '/onboarding') {
        return localeGateDone ? '/home' : '/locale-gate';
      }

      // Gate 2 — locale gate (only reached once onboarding is done).
      if (!localeGateDone) {
        return loc == '/locale-gate' ? null : '/locale-gate';
      }
      if (loc == '/locale-gate') return '/home';

      // After OAuth / email sign-in succeeds, redirect away from the auth
      // screen to home. GoRouter re-evaluates this redirect whenever
      // AppController calls notifyListeners(), which happens on every
      // Supabase auth state change — so signedIn fires → next frame the
      // user lands on /home.
      if (isAuth && loc == '/auth') return '/home';

      // Supabase OAuth deeplinks arrive as io.supabase.xxx://login-callback/
      // GoRouter intercepts this and tries to match the path '/login-callback/'
      // (or '/') as a navigation URL — it matches nothing and would normally
      // hit errorBuilder. Intercept here instead so the user never sees the
      // error screen. supabase_flutter processes the auth code independently
      // via its own app_links listener; auth state updates via the stream.
      final path = state.uri.path;
      if (path == '/login-callback' ||
          path == '/login-callback/' ||
          path.startsWith('/login-callback?')) {
        return '/home';
      }

      return null;
    },
    routes: <RouteBase>[
      GoRoute(
        path: '/onboarding',
        pageBuilder:
            (context, state) => _buildTransitionPage(
              state: state,
              child: const OnboardingScreen(),
            ),
      ),
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
      GoRoute(
        path: '/chat',
        pageBuilder:
            (context, state) => _buildTransitionPage(
              state: state,
              child: const ChatScreen(),
            ),
      ),
    ],
    errorBuilder: (context, state) {
      // Belt-and-suspenders: if GoRouter reaches here with a path it
      // can't match (e.g. OAuth deeplink that slipped past the redirect),
      // navigate home instead of showing a confusing error screen.
      // supabase_flutter processes the auth code via its own listener.
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (context.mounted) context.go('/home');
      });
      return const SizedBox.shrink();
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
    reverseTransitionDuration: PaynMotion.route,
    child: child,
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      if (PaynMotion.reduce(context)) {
        return child;
      }
      // Revolut-style stack push.
      //
      // Incoming page (animation):
      //   • Slides up from 18% of screen height
      //   • Scales up from 0.96 → 1.0 with a slight overshoot easing
      //   • Fades in over the first ~60% of the transition
      //   • Has a subtle elevated shadow that grows then settles
      //
      // Outgoing page (secondaryAnimation):
      //   • Stays in place but recedes — scales down to 0.94
      //   • Dims with a black overlay (opacity → 0.18) so the new card
      //     visually sits ON TOP of it
      //   • Drifts up a hair (-1.5% of height) for parallax depth
      //
      // Net effect: the new screen feels like a card pushed onto a deck,
      // the previous one sliding back into the stack — same vibe as the
      // Revolut iOS app's screen-to-screen navigation.
      final incomingCurve = CurvedAnimation(
        parent: animation,
        curve: Curves.easeOutQuint,
        reverseCurve: Curves.easeInCubic,
      );
      final incomingFade = CurvedAnimation(
        parent: animation,
        curve: const Interval(0, 0.6, curve: Curves.easeOut),
        reverseCurve: const Interval(0.4, 1, curve: Curves.easeIn),
      );
      final incomingSlide = Tween<Offset>(
        begin: const Offset(0, 0.18),
        end: Offset.zero,
      ).animate(incomingCurve);
      final incomingScale = Tween<double>(
        begin: 0.96,
        end: 1,
      ).animate(incomingCurve);

      final outgoingCurve = CurvedAnimation(
        parent: secondaryAnimation,
        curve: Curves.easeOutCubic,
        reverseCurve: Curves.easeInCubic,
      );
      final outgoingScale = Tween<double>(
        begin: 1,
        end: 0.94,
      ).animate(outgoingCurve);
      final outgoingSlide = Tween<Offset>(
        begin: Offset.zero,
        end: const Offset(0, -0.015),
      ).animate(outgoingCurve);
      final outgoingDim = Tween<double>(
        begin: 0,
        end: 0.18,
      ).animate(outgoingCurve);

      return SlideTransition(
        position: outgoingSlide,
        child: ScaleTransition(
          scale: outgoingScale,
          child: AnimatedBuilder(
            animation: outgoingDim,
            builder: (context, layered) {
              return Stack(
                fit: StackFit.expand,
                children: <Widget>[
                  layered!,
                  IgnorePointer(
                    child: ColoredBox(
                      color: Colors.black.withValues(
                        alpha: outgoingDim.value,
                      ),
                    ),
                  ),
                ],
              );
            },
            child: FadeTransition(
              opacity: incomingFade,
              child: SlideTransition(
                position: incomingSlide,
                child: ScaleTransition(
                  scale: incomingScale,
                  child: _ElevatedRouteCard(
                    progress: animation,
                    child: child,
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    },
  );
}

// Lightweight wrapper that paints a soft shadow under the incoming
// screen during the transition. Shadow grows during the push and fades
// out once the screen has settled — selling the "card lifted onto the
// deck" feel without permanently rendering a layered shadow on every
// route.
class _ElevatedRouteCard extends StatelessWidget {
  const _ElevatedRouteCard({required this.progress, required this.child});

  final Animation<double> progress;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: progress,
      builder: (context, layered) {
        final t = progress.value;
        // Bell-curve intensity: peaks mid-flight, fades to 0 at rest.
        final intensity = (1 - (2 * t - 1).abs()).clamp(0.0, 1.0);
        if (intensity <= 0) return layered!;
        return DecoratedBox(
          decoration: BoxDecoration(
            boxShadow: <BoxShadow>[
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.18 * intensity),
                blurRadius: 40 * intensity,
                offset: Offset(0, -8 * intensity),
              ),
            ],
          ),
          child: layered,
        );
      },
      child: child,
    );
  }
}
