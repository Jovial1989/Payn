import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:payn_mobile/app/app.dart';
import 'package:payn_mobile/core/network/api_client.dart';
import 'package:payn_mobile/core/storage/local_store.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';
import 'package:payn_mobile/shared/services/analytics_service.dart';
import 'package:payn_mobile/shared/services/app_controller.dart';
import 'package:payn_mobile/shared/services/dashboard_analytics_service.dart';
import 'package:payn_mobile/shared/services/local_auth_repository.dart';
import 'package:payn_mobile/shared/services/local_marketplace_repository.dart';
import 'package:payn_mobile/shared/services/market_intelligence_service.dart';
import 'package:payn_mobile/shared/services/marketplace_catalog_service.dart';

class _FakeCatalogService extends MarketplaceCatalogService {
  _FakeCatalogService(this.repository)
    : super(ApiClient('https://payn.online'));

  final LocalMarketplaceRepository repository;

  @override
  Future<MarketplaceCatalogManifest> fetchCatalog() async {
    return MarketplaceCatalogManifest(
      generatedAt: DateTime.now().toUtc().toIso8601String(),
      languages: const <CatalogLanguageOption>[
        CatalogLanguageOption(code: 'en', native: 'English'),
        CatalogLanguageOption(code: 'de', native: 'Deutsch'),
        CatalogLanguageOption(code: 'es', native: 'Español'),
        CatalogLanguageOption(code: 'fr', native: 'Français'),
        CatalogLanguageOption(code: 'it', native: 'Italiano'),
        CatalogLanguageOption(code: 'pt', native: 'Português'),
      ],
      countries: const <CatalogCountryOption>[],
      categories: PaynCategory.values.map((category) => category.name).toList(),
      offers: repository.fallbackOffers,
    );
  }
}

void main() {
  testWidgets('renders the Payn mobile shell', (WidgetTester tester) async {
    final store = MemoryLocalStore();
    final marketplaceRepository = LocalMarketplaceRepository();
    await store.saveString('payn.mobile.locale_gate_done', '1');
    final controller = AppController(
      store: store,
      authRepository: LocalAuthRepository(store),
      marketplaceRepository: marketplaceRepository,
      analytics: AnalyticsService(),
      dashboardAnalyticsService: DashboardAnalyticsService(),
      marketIntelligenceService: MarketIntelligenceService(),
      catalogService: _FakeCatalogService(marketplaceRepository),
    );

    await controller.restore();
    await tester.pumpWidget(PaynApp(controller: controller));
    await tester.pump(const Duration(seconds: 2));

    expect(find.text('Explore'), findsOneWidget);
    expect(find.text('Best options for you'), findsOneWidget);
    expect(find.textContaining('providers'), findsWidgets);
  });

  testWidgets('profile region and language selectors open', (
    WidgetTester tester,
  ) async {
    final store = MemoryLocalStore();
    final marketplaceRepository = LocalMarketplaceRepository();
    await store.saveString('payn.mobile.locale_gate_done', '1');
    final controller = AppController(
      store: store,
      authRepository: LocalAuthRepository(store),
      marketplaceRepository: marketplaceRepository,
      analytics: AnalyticsService(),
      dashboardAnalyticsService: DashboardAnalyticsService(),
      marketIntelligenceService: MarketIntelligenceService(),
      catalogService: _FakeCatalogService(marketplaceRepository),
    );

    await controller.restore();
    await tester.pumpWidget(PaynApp(controller: controller));
    await tester.pump(const Duration(seconds: 2));

    await tester.tap(find.byIcon(Icons.person_outline_rounded));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Region'));
    await tester.pumpAndSettle();
    expect(find.text('Choose region'), findsOneWidget);

    await tester.tap(find.text('Germany'));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Language'));
    await tester.pumpAndSettle();
    expect(find.text('Choose language'), findsOneWidget);

    await tester.tap(find.textContaining('Français'));
    await tester.pumpAndSettle();
    expect(find.text('Profil'), findsWidgets);
  });

  testWidgets('active languages localize profile shell', (
    WidgetTester tester,
  ) async {
    const expectedTitles = <String, String>{
      'en': 'Profile',
      'de': 'Profil',
      'es': 'Perfil',
      'fr': 'Profil',
      'uk': 'Профіль',
    };

    for (final entry in expectedTitles.entries) {
      final store = MemoryLocalStore();
      final marketplaceRepository = LocalMarketplaceRepository();
      await store.saveString('payn.mobile.locale_gate_done', '1');
      await store.saveString(
        'payn.mobile.preferences',
        '{"languageCode":"${entry.key}","market":"de","profileType":"personal","interests":[]}',
      );
      final controller = AppController(
        store: store,
        authRepository: LocalAuthRepository(store),
        marketplaceRepository: marketplaceRepository,
        analytics: AnalyticsService(),
        dashboardAnalyticsService: DashboardAnalyticsService(),
        marketIntelligenceService: MarketIntelligenceService(),
        catalogService: _FakeCatalogService(marketplaceRepository),
      );

      await controller.restore();
      await tester.pumpWidget(PaynApp(controller: controller));
      await tester.pump(const Duration(seconds: 2));
      await tester.tap(find.byIcon(Icons.person_outline_rounded));
      await tester.pumpAndSettle();

      expect(find.text(entry.value), findsWidgets);
    }
  });
}
