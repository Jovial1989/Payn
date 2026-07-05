import 'dart:async';

import 'package:app_links/app_links.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:payn_mobile/app/app.dart';
import 'package:payn_mobile/core/config/app_config.dart';
import 'package:payn_mobile/core/storage/local_store.dart';
import 'package:payn_mobile/shared/services/analytics_service.dart';
import 'package:payn_mobile/shared/services/app_controller.dart';
import 'package:payn_mobile/shared/services/dashboard_analytics_service.dart';
import 'package:payn_mobile/shared/services/supabase_auth_service.dart';
import 'package:payn_mobile/shared/services/local_marketplace_repository.dart';
import 'package:payn_mobile/shared/services/market_intelligence_service.dart';
import 'package:payn_mobile/shared/services/marketplace_catalog_service.dart';
import 'package:payn_mobile/shared/services/push_service.dart';
import 'package:payn_mobile/core/network/api_client.dart';
import 'package:payn_mobile/core/constants/marketplace_constants.dart';

Future<void> bootstrap() async {
  WidgetsFlutterBinding.ensureInitialized();

  // MOB.3 — Global ErrorWidget.builder. Flutter's default in debug
  // mode renders any widget-build exception as a bright red filled
  // rectangle (`Color(0xFFB71C1C)`), which on Profile / Saved /
  // Explore looked like the whole content area had been "painted
  // red" — terrible UX even for a debug crash. Replace it with a
  // calm white card that surfaces a friendly message and (in debug)
  // the actual exception, so a partial crash on one screen no
  // longer looks like the whole app died. Also installs a
  // PlatformDispatcher.onError fallback that logs uncaught async
  // exceptions so they don't sit silent.
  ErrorWidget.builder = (FlutterErrorDetails details) {
    if (kReleaseMode) {
      return _FriendlyErrorBox(message: 'Something went wrong here.');
    }
    return _FriendlyErrorBox(
      message: 'Widget build failed (debug only):',
      detail: details.exceptionAsString(),
    );
  };
  FlutterError.onError = (FlutterErrorDetails details) {
    debugPrint('[FlutterError] ${details.exceptionAsString()}');
    FlutterError.presentError(details);
  };

  final appConfig = await AppConfig.load();

  // Initialize Firebase first — both PushService and FirebaseAnalytics
  // depend on it. PushService._ensureFirebase() no-ops if apps ≥ 1.
  try {
    if (Firebase.apps.isEmpty) {
      await Firebase.initializeApp();
    }
  } catch (e) {
    debugPrint('[bootstrap] Firebase init failed — push + GA will be unavailable: $e');
  }

  final analytics = AnalyticsService();
  await analytics.initialize();

  // Initialize Supabase — required for real email/password auth and OAuth.
  // Wrapped in try/catch so a network failure at boot doesn't white-screen
  // the app — auth features will be unavailable but the catalog still works.
  bool supabaseReady = false;
  try {
    await Supabase.initialize(
      url: appConfig.supabaseUrl,
      anonKey: appConfig.supabaseAnonKey,
      authOptions: const FlutterAuthClientOptions(
        authFlowType: AuthFlowType.pkce,
      ),
      debug: kDebugMode,
    );
    supabaseReady = true;

    // Debug: log every deep link AFTER Supabase has registered its own
    // listeners, so we see the raw OAuth callback URL (code= or error=).
    if (kDebugMode) {
      final appLinks = AppLinks();
      appLinks.getInitialLink().then((uri) {
        if (uri != null) {
          debugPrint('[DeepLink] initial (full): $uri');
        }
      });
      appLinks.uriLinkStream.listen((uri) {
        debugPrint('[DeepLink] stream (full): $uri');
      });
    }
  } catch (e) {
    debugPrint('[bootstrap] Supabase init failed — auth unavailable: $e');
  }

  final store = LocalStore();
  final marketplaceRepository = LocalMarketplaceRepository();
  final apiClient = ApiClient(appConfig.apiBaseUrl);
  final authService = supabaseReady
      ? SupabaseAuthService(Supabase.instance.client)
      : SupabaseAuthService.offline();
  final controller = AppController(
    store: store,
    authService: authService,
    marketplaceRepository: marketplaceRepository,
    analytics: analytics,
    dashboardAnalyticsService: DashboardAnalyticsService(),
    marketIntelligenceService: MarketIntelligenceService(),
    catalogService: MarketplaceCatalogService(apiClient),
  );

  await controller.restore();
  await analytics.track(
    AnalyticsEvents.appOpened,
    properties: analytics.buildDefaultProperties(
      preferences: controller.preferences,
      loggedIn: controller.isAuthenticated,
    ),
  );

  // Push notifications — runs alongside the UI so a slow Firebase init
  // doesn't block first paint. The service self-handles the case where
  // Firebase config files aren't bundled yet (logs a warning, exits).
  final pushService = PushService(
    apiClient: apiClient,
    country: marketDefinitions[controller.preferences.market]?.marketCode,
    locale: controller.preferences.languageCode,
  );
  unawaited(pushService.initialise());
  // Re-register the token whenever the user's market or locale changes
  // so admin push audiences stay accurate.
  controller.addListener(() {
    unawaited(
      pushService.updateContext(
        country:
            marketDefinitions[controller.preferences.market]?.marketCode,
        locale: controller.preferences.languageCode,
      ),
    );
  });

  runApp(PaynApp(controller: controller, pushService: pushService));
}

/// MOB.3 — Replacement for Flutter's bright-red ErrorWidget. Renders a
/// muted white card with an info icon + plain-language message so a
/// partial crash on one screen doesn't paint the entire content area
/// solid red. In debug mode we also surface the exception text so we
/// can debug from the device; in release we strip the technical detail.
class _FriendlyErrorBox extends StatelessWidget {
  const _FriendlyErrorBox({required this.message, this.detail});

  final String message;
  final String? detail;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          const Icon(
            Icons.info_outline_rounded,
            size: 28,
            color: Color(0xFF6B7280),
          ),
          const SizedBox(height: 10),
          Text(
            message,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Color(0xFF111827),
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
          if (detail != null) ...<Widget>[
            const SizedBox(height: 8),
            Text(
              detail!,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Color(0xFF6B7280),
                fontSize: 11,
                fontFamily: 'monospace',
              ),
              maxLines: 6,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ],
      ),
    );
  }
}
