import 'package:flutter/widgets.dart';
import 'package:payn_mobile/app/app.dart';
import 'package:payn_mobile/core/storage/local_store.dart';
import 'package:payn_mobile/shared/services/app_controller.dart';
import 'package:payn_mobile/shared/services/dashboard_analytics_service.dart';
import 'package:payn_mobile/shared/services/local_auth_repository.dart';
import 'package:payn_mobile/shared/services/local_marketplace_repository.dart';
import 'package:payn_mobile/shared/services/market_intelligence_service.dart';

Future<void> bootstrap() async {
  WidgetsFlutterBinding.ensureInitialized();

  final store = LocalStore();
  final controller = AppController(
    store: store,
    authRepository: LocalAuthRepository(store),
    marketplaceRepository: LocalMarketplaceRepository(),
    dashboardAnalyticsService: DashboardAnalyticsService(),
    marketIntelligenceService: MarketIntelligenceService(),
  );

  await controller.restore();
  runApp(PaynApp(controller: controller));
}
