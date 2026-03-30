import 'package:flutter_test/flutter_test.dart';
import 'package:payn_mobile/app/app.dart';
import 'package:payn_mobile/core/storage/local_store.dart';
import 'package:payn_mobile/shared/services/app_controller.dart';
import 'package:payn_mobile/shared/services/dashboard_analytics_service.dart';
import 'package:payn_mobile/shared/services/local_auth_repository.dart';
import 'package:payn_mobile/shared/services/local_marketplace_repository.dart';
import 'package:payn_mobile/shared/services/market_intelligence_service.dart';

void main() {
  testWidgets('renders the Payn mobile shell', (WidgetTester tester) async {
    final store = MemoryLocalStore();
    final controller = AppController(
      store: store,
      authRepository: LocalAuthRepository(store),
      marketplaceRepository: LocalMarketplaceRepository(),
      dashboardAnalyticsService: DashboardAnalyticsService(),
      marketIntelligenceService: MarketIntelligenceService(),
    );

    await controller.restore();
    await tester.pumpWidget(PaynApp(controller: controller));
    await tester.pumpAndSettle();

    expect(find.text('Explore'), findsOneWidget);
    expect(find.text('Payn'), findsOneWidget);
    expect(find.text('Your financial activity'), findsOneWidget);
  });
}
