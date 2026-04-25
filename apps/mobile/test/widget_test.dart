import 'package:flutter_test/flutter_test.dart';
import 'package:payn_mobile/app/app.dart';
import 'package:payn_mobile/core/storage/local_store.dart';
import 'package:payn_mobile/shared/services/analytics_service.dart';
import 'package:payn_mobile/shared/services/app_controller.dart';
import 'package:payn_mobile/shared/services/dashboard_analytics_service.dart';
import 'package:payn_mobile/shared/services/local_auth_repository.dart';
import 'package:payn_mobile/shared/services/local_marketplace_repository.dart';
import 'package:payn_mobile/shared/services/market_intelligence_service.dart';

void main() {
  testWidgets('renders the Payn mobile shell', (WidgetTester tester) async {
    final store = MemoryLocalStore();
    await store.saveString('payn.mobile.locale_gate_done', '1');
    final controller = AppController(
      store: store,
      authRepository: LocalAuthRepository(store),
      marketplaceRepository: LocalMarketplaceRepository(),
      analytics: AnalyticsService(),
      dashboardAnalyticsService: DashboardAnalyticsService(),
      marketIntelligenceService: MarketIntelligenceService(),
    );

    await controller.restore();
    await tester.pumpWidget(PaynApp(controller: controller));
    await tester.pump(const Duration(milliseconds: 700));

    expect(find.text('Explore'), findsOneWidget);
    expect(find.text('Best offers for you'), findsOneWidget);
    expect(find.text('4.9/5 Trust Rating'), findsOneWidget);
  });
}
