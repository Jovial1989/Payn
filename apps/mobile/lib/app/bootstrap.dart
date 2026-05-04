import 'package:flutter/widgets.dart';
import 'package:payn_mobile/app/app.dart';
import 'package:payn_mobile/core/config/app_config.dart';
import 'package:payn_mobile/core/storage/local_store.dart';
import 'package:payn_mobile/shared/services/analytics_service.dart';
import 'package:payn_mobile/shared/services/app_controller.dart';
import 'package:payn_mobile/shared/services/dashboard_analytics_service.dart';
import 'package:payn_mobile/shared/services/local_auth_repository.dart';
import 'package:payn_mobile/shared/services/local_marketplace_repository.dart';
import 'package:payn_mobile/shared/services/market_intelligence_service.dart';
import 'package:payn_mobile/shared/services/marketplace_catalog_service.dart';
import 'package:payn_mobile/core/network/api_client.dart';

Future<void> bootstrap() async {
  WidgetsFlutterBinding.ensureInitialized();

  final analytics = AnalyticsService();
  await analytics.initialize();
  final appConfig = await AppConfig.load();
  final store = LocalStore();
  final marketplaceRepository = LocalMarketplaceRepository();
  final controller = AppController(
    store: store,
    authRepository: LocalAuthRepository(store),
    marketplaceRepository: marketplaceRepository,
    analytics: analytics,
    dashboardAnalyticsService: DashboardAnalyticsService(),
    marketIntelligenceService: MarketIntelligenceService(),
    catalogService: MarketplaceCatalogService(ApiClient(appConfig.apiBaseUrl)),
  );

  await controller.restore();
  await analytics.track(
    AnalyticsEvents.appOpened,
    properties: analytics.buildDefaultProperties(
      preferences: controller.preferences,
      loggedIn: controller.isAuthenticated,
    ),
  );
  runApp(PaynApp(controller: controller));
}
