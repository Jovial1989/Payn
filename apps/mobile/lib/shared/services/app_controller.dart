import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:payn_mobile/core/localization/supported_languages.dart';
import 'package:payn_mobile/core/storage/local_store.dart';
import 'package:payn_mobile/shared/models/analytics_models.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';
import 'package:payn_mobile/shared/services/analytics_service.dart';
import 'package:payn_mobile/shared/services/dashboard_analytics_service.dart';
import 'package:payn_mobile/shared/services/supabase_auth_service.dart';
import 'package:payn_mobile/shared/services/local_marketplace_repository.dart';
import 'package:payn_mobile/shared/services/market_intelligence_service.dart';
import 'package:payn_mobile/shared/services/marketplace_catalog_service.dart';

class AppController extends ChangeNotifier {
  AppController({
    required this.store,
    required this.authService,
    required this.marketplaceRepository,
    required this.analytics,
    required this.dashboardAnalyticsService,
    required this.marketIntelligenceService,
    required this.catalogService,
  });

  static const String _preferencesKey = 'payn.mobile.preferences';
  static const String _savedKey = 'payn.mobile.saved';
  static const String _recentKey = 'payn.mobile.recent';
  static const String _compareKey = 'payn.mobile.compare';
  static const String _localeGateKey = 'payn.mobile.locale_gate_done';
  static const String _onboardingKey = 'payn.mobile.onboarding_done';
  static const String _catalogKey = 'payn.mobile.catalog_manifest';

  final LocalStore store;
  final SupabaseAuthService authService;
  final LocalMarketplaceRepository marketplaceRepository;

  StreamSubscription<UserSession>? _authSub;
  final AnalyticsService analytics;
  final DashboardAnalyticsService dashboardAnalyticsService;
  final MarketIntelligenceService marketIntelligenceService;
  final MarketplaceCatalogService catalogService;

  UserSession _session = const UserSession.guest();
  ProfilePreferences _preferences = ProfilePreferences.defaults();
  ExploreFilters _exploreFilters = const ExploreFilters();
  PaynCategory? _selectedExploreCategory;
  List<String> _savedOfferIds = <String>[];
  List<String> _recentOfferIds = <String>[];
  List<String> _compareOfferIds = <String>[];
  bool _localeGateDone = false;
  bool _onboardingDone = false;
  MarketplaceCatalogManifest? _catalogManifest;
  bool _catalogLoading = true;
  String? _catalogError;

  UserSession get session => _session;
  ProfilePreferences get preferences => _preferences;
  ExploreFilters get exploreFilters => _exploreFilters;
  PaynCategory? get selectedExploreCategory => _selectedExploreCategory;
  bool get isAuthenticated => _session.isAuthenticated;
  bool get localeGateDone => _localeGateDone;
  bool get onboardingDone => _onboardingDone;
  String get languageCode => _preferences.languageCode;
  bool get catalogLoading => _catalogLoading;
  String? get catalogError => _catalogError;
  bool get hasCatalogError => _catalogError != null;
  MarketplaceCatalogManifest? get catalogManifest => _catalogManifest;
  List<CatalogLanguageOption> get availableLanguages =>
      supportedLanguageOptions.map((language) {
        final catalogMatch =
            _catalogManifest?.languages
                .where((item) => item.code == language.code)
                .firstOrNull;
        return catalogMatch ??
            CatalogLanguageOption(code: language.code, native: language.native);
      }).toList();
  List<PaynMarket> get availableMarkets {
    final countries =
        _catalogManifest?.countries ?? const <CatalogCountryOption>[];
    final values = <PaynMarket>[];
    for (final country in countries) {
      final market = paynMarketFromCode(country.value);
      if (market != null && !values.contains(market)) {
        values.add(market);
      }
    }
    return values.isEmpty ? PaynMarket.values : values;
  }

  Future<void> restore() async {
    _session = authService.currentSession;

    // Subscribe to Supabase auth state changes so OAuth callbacks
    // and token refreshes automatically update the app session.
    _authSub = authService.authStateChanges.listen((session) {
      _session = session;
      notifyListeners();
    });

    final rawPreferences = await store.readString(_preferencesKey);
    if (rawPreferences != null && rawPreferences.isNotEmpty) {
      try {
        _preferences = ProfilePreferences.fromJson(
          jsonDecode(rawPreferences) as Map<String, dynamic>,
        );
        _preferences = _preferences.copyWith(
          languageCode: normalizeSupportedLanguageCode(
            _preferences.languageCode,
          ),
        );
      } catch (_) {
        _preferences = ProfilePreferences.defaults();
      }
    }

    _savedOfferIds = await store.readStringList(_savedKey);
    _recentOfferIds = await store.readStringList(_recentKey);
    // MOB.7 — Compare is decoupled from Saved. The previous code filtered
    // restored compare IDs by `_savedOfferIds.contains`, which forced every
    // compare entry to also live in Saved and made the user think the
    // "+" toggle saved the offer. They're now two independent sets:
    //   • Saved   = unbounded backlog (bookmark)
    //   • Compare = side-by-side shortlist, max 3
    _compareOfferIds = (await store.readStringList(_compareKey)).take(3).toList();

    final localeGateRaw = await store.readString(_localeGateKey);
    _localeGateDone = localeGateRaw == '1';
    final onboardingRaw = await store.readString(_onboardingKey);
    _onboardingDone = onboardingRaw == '1';
    await _restoreCatalogManifest();
    await analytics.setUserId(_session.isAuthenticated ? _session.email : null);

    notifyListeners();
  }

  Future<void> _restoreCatalogManifest() async {
    _catalogLoading = true;
    _catalogError = null;
    final cachedCatalog = await store.readString(_catalogKey);
    if (cachedCatalog != null && cachedCatalog.isNotEmpty) {
      try {
        _catalogManifest = MarketplaceCatalogManifest.fromJson(
          jsonDecode(cachedCatalog) as Map<String, dynamic>,
        );
        marketplaceRepository.replaceOffers(_catalogManifest!.offers);
      } catch (_) {}
    }

    try {
      final manifest = await catalogService.fetchCatalog();
      _catalogManifest = manifest;
      marketplaceRepository.replaceOffers(manifest.offers);
      _catalogError = null;
      await store.saveString(
        _catalogKey,
        catalogService.encodeCatalog(manifest),
      );
    } catch (error) {
      _catalogError = error.toString();
      _catalogManifest ??= MarketplaceCatalogManifest(
        generatedAt: DateTime.now().toUtc().toIso8601String(),
        languages: availableLanguages,
        countries: const <CatalogCountryOption>[],
        categories: const <String>[
          'loans',
          'cards',
          'transfers',
          'exchange',
          'insurance',
          'investments',
        ],
        offers: marketplaceRepository.fallbackOffers,
      );
      marketplaceRepository.replaceOffers(_catalogManifest!.offers);
    } finally {
      _catalogLoading = false;
    }
  }

  Future<void> refreshCatalog() async {
    _catalogLoading = true;
    _catalogError = null;
    notifyListeners();

    try {
      final manifest = await catalogService.fetchCatalog();
      _catalogManifest = manifest;
      marketplaceRepository.replaceOffers(manifest.offers);
      await store.saveString(
        _catalogKey,
        catalogService.encodeCatalog(manifest),
      );
    } catch (error) {
      _catalogError = error.toString();
    } finally {
      _catalogLoading = false;
      notifyListeners();
    }
  }

  Future<void> completeOnboarding() async {
    _onboardingDone = true;
    notifyListeners();
    await store.saveString(_onboardingKey, '1');
  }

  Future<void> completeLocaleGate({
    required PaynMarket market,
    required String language,
  }) async {
    _preferences = _preferences.copyWith(
      languageCode: normalizeSupportedLanguageCode(language),
      market: market,
    );
    _localeGateDone = true;
    notifyListeners();
    await store.saveString(_preferencesKey, jsonEncode(_preferences.toJson()));
    await store.saveString(_localeGateKey, '1');
  }

  Future<void> updatePreferences(ProfilePreferences next) async {
    _preferences = next.copyWith(
      languageCode: normalizeSupportedLanguageCode(next.languageCode),
    );
    notifyListeners();
    await store.saveString(_preferencesKey, jsonEncode(_preferences.toJson()));
  }

  Future<void> setLocale(String languageCode) {
    return updatePreferences(
      _preferences.copyWith(
        languageCode: normalizeSupportedLanguageCode(languageCode),
      ),
    );
  }

  Future<void> setMarket(PaynMarket market) {
    return updatePreferences(_preferences.copyWith(market: market));
  }

  void setExploreCategory(PaynCategory? category) {
    if (_selectedExploreCategory == category) {
      return;
    }

    _selectedExploreCategory = category;
    // Quick-filter chips are per-category; carrying one across a category
    // switch would mean (e.g.) "APR Under 5%" filters the Cards list down
    // to zero. Drop it whenever the bucket changes.
    if (_exploreFilters.quickFilter.isNotEmpty ||
        _exploreFilters.subtype.isNotEmpty) {
      _exploreFilters = _exploreFilters.copyWith(
        quickFilter: '',
        subtype: '',
      );
    }

    if (category != null) {
      unawaited(
        analytics.track(
          AnalyticsEvents.categoryViewed,
          properties: analytics.buildDefaultProperties(
            preferences: _preferences,
            loggedIn: isAuthenticated,
            category: category,
          ),
        ),
      );
    }

    notifyListeners();
  }

  void updateExploreFilters(ExploreFilters next) {
    _exploreFilters = next;
    notifyListeners();
  }

  void clearExploreFilters() {
    _exploreFilters = const ExploreFilters();
    notifyListeners();
  }

  Future<void> toggleSaved(String offerId) async {
    if (_savedOfferIds.contains(offerId)) {
      _savedOfferIds.remove(offerId);
      // MOB.7 — Was: also remove from compare. Compare is now independent
      // — a user can unsave an offer they previously bookmarked while
      // keeping it pinned for side-by-side comparison.
      final offer = marketplaceRepository.offerById(offerId);
      if (offer != null) {
        unawaited(
          analytics.track(
            AnalyticsEvents.offerSavedRemoved,
            properties: analytics.buildDefaultProperties(
              preferences: _preferences,
              loggedIn: isAuthenticated,
              category: offer.category,
              offerId: offer.id,
              provider: offer.providerName,
            ),
          ),
        );
      }
    } else {
      _savedOfferIds = <String>[offerId, ..._savedOfferIds];

      final offer = marketplaceRepository.offerById(offerId);
      if (offer != null) {
        unawaited(
          analytics.track(
            AnalyticsEvents.offerSaved,
            properties: analytics.buildDefaultProperties(
              preferences: _preferences,
              loggedIn: isAuthenticated,
              category: offer.category,
              offerId: offer.id,
              provider: offer.providerName,
            ),
          ),
        );
      }
    }

    await _persistSavedState();
    notifyListeners();
  }

  Future<bool> toggleCompare(String offerId) async {
    if (_compareOfferIds.contains(offerId)) {
      _compareOfferIds.remove(offerId);
      await store.saveStringList(_compareKey, _compareOfferIds);
      final offer = marketplaceRepository.offerById(offerId);
      if (offer != null) {
        unawaited(
          analytics.track(
            AnalyticsEvents.compareRemoved,
            properties: analytics.buildDefaultProperties(
              preferences: _preferences,
              loggedIn: isAuthenticated,
              category: offer.category,
              offerId: offer.id,
              provider: offer.providerName,
              extra: <String, dynamic>{'compare_count': _compareOfferIds.length},
            ),
          ),
        );
      }
      notifyListeners();
      return true;
    }

    if (_compareOfferIds.length >= 3) {
      return false;
    }

    _compareOfferIds = <String>[..._compareOfferIds, offerId];
    await store.saveStringList(_compareKey, _compareOfferIds);
    final offer = marketplaceRepository.offerById(offerId);
    if (offer != null) {
      unawaited(
        analytics.track(
          AnalyticsEvents.compareAdded,
          properties: analytics.buildDefaultProperties(
            preferences: _preferences,
            loggedIn: isAuthenticated,
            category: offer.category,
            offerId: offer.id,
            provider: offer.providerName,
            extra: <String, dynamic>{'compare_count': _compareOfferIds.length},
          ),
        ),
      );
      if (_compareOfferIds.length == 2) {
        unawaited(
          analytics.track(
            AnalyticsEvents.compareStarted,
            properties: analytics.buildDefaultProperties(
              preferences: _preferences,
              loggedIn: isAuthenticated,
              category: offer.category,
              offerId: offer.id,
              provider: offer.providerName,
              extra: <String, dynamic>{'compare_count': _compareOfferIds.length},
            ),
          ),
        );
      }
    }
    notifyListeners();
    return true;
  }

  Future<void> recordOfferView(String offerId) async {
    _recentOfferIds.remove(offerId);
    _recentOfferIds = <String>[offerId, ..._recentOfferIds].take(8).toList();
    await store.saveStringList(_recentKey, _recentOfferIds);
    final offer = marketplaceRepository.offerById(offerId);
    if (offer != null) {
      unawaited(
        analytics.track(
          AnalyticsEvents.offerDetailsViewed,
          properties: analytics.buildDefaultProperties(
            preferences: _preferences,
            loggedIn: isAuthenticated,
            category: offer.category,
            offerId: offer.id,
            provider: offer.providerName,
          ),
        ),
      );
    }
    notifyListeners();
  }

  Future<String?> signIn({
    required String email,
    required String password,
  }) async {
    final normalizedEmail = email.trim();
    if (normalizedEmail.isEmpty || !normalizedEmail.contains('@')) {
      return 'Enter a valid email address.';
    }
    if (password.trim().length < 6) {
      return 'Password must be at least 6 characters.';
    }

    // MOB.3 — Wrap the repository call + analytics + notifyListeners
    // in a single try block. Without this, any thrown exception
    // (repository failure, analytics SDK throwing on a malformed
    // user id, a listener panicking during notifyListeners) bubbles
    // up to the UI's awaited Future and we lose the chance to render
    // a friendly inline error.
    try {
      _session = await authService.signIn(
        email: normalizedEmail,
        password: password,
      );
    } catch (e) {
      return 'Sign-in failed. Please check your credentials.';
    }

    try {
      await analytics.setUserId(_session.email);
      await analytics.track(
        AnalyticsEvents.signInCompleted,
        properties: analytics.buildDefaultProperties(
          preferences: _preferences,
          loggedIn: true,
          extra: <String, dynamic>{'method': 'email'},
        ),
      );
    } catch (_) {}
    notifyListeners();
    return null;
  }

  Future<String?> signUp({
    required String email,
    required String password,
  }) async {
    final normalizedEmail = email.trim();
    if (normalizedEmail.isEmpty || !normalizedEmail.contains('@')) {
      return 'Enter a valid email address.';
    }
    if (password.trim().length < 6) {
      return 'Password must be at least 6 characters.';
    }

    try {
      _session = await authService.signUp(
        email: normalizedEmail,
        password: password,
      );
    } catch (e) {
      return 'Could not create the account. Please try again.';
    }

    try {
      await analytics.setUserId(_session.email);
      await analytics.track(
        AnalyticsEvents.signUpCompleted,
        properties: analytics.buildDefaultProperties(
          preferences: _preferences,
          loggedIn: true,
          extra: <String, dynamic>{'method': 'email'},
        ),
      );
    } catch (_) {}
    notifyListeners();
    return null;
  }

  /// Launches the system browser for OAuth. Session update arrives via
  /// [authStateChanges] when the browser redirects back to the deep link.
  Future<void> signInWithOAuth(OAuthProvider provider) async {
    await authService.signInWithOAuth(provider);
  }

  /// Native Google Sign-In (iOS account picker, no browser).
  Future<void> signInWithGoogle() async {
    await authService.signInWithGoogle();
    // Explicitly pull the fresh session — the authStateChanges stream can
    // arrive late on first sign-in, leaving the router unrefreshed.
    _session = authService.currentSession;
    await analytics.setUserId(_session.isAuthenticated ? _session.email : null);
    notifyListeners();
  }

  Future<void> signOut() async {
    await authService.signOut();
    _session = const UserSession.guest();
    await analytics.setUserId(null);
    notifyListeners();
  }

  @override
  void dispose() {
    _authSub?.cancel();
    super.dispose();
  }

  bool isSaved(String offerId) => _savedOfferIds.contains(offerId);

  bool isCompared(String offerId) => _compareOfferIds.contains(offerId);

  PaynOffer? offerById(String offerId) =>
      marketplaceRepository.offerById(offerId);

  List<PaynOffer> get savedOffers =>
      _savedOfferIds
          .map(marketplaceRepository.offerById)
          .whereType<PaynOffer>()
          .toList();

  List<PaynOffer> get compareOffers =>
      _compareOfferIds
          .map(marketplaceRepository.offerById)
          .whereType<PaynOffer>()
          .toList();

  List<PaynOffer> get recentOffers =>
      _recentOfferIds
          .map(marketplaceRepository.offerById)
          .whereType<PaynOffer>()
          .toList();

  List<RankedOffer> get exploreResults {
    return _rankOffers(
      filters: _exploreFilters,
      category: _selectedExploreCategory,
      excludeSaved: false,
    );
  }

  bool get isUsingExploreFallback => exploreResults.isEmpty;

  /// P0.5 — Total offers available in the currently-selected category
  /// (no filters applied), scoped to the user's market. Used by the
  /// Explore header to render "N of M" when filters shrink the visible
  /// list. When no category is selected, returns the total of all
  /// in-market offers so the heading still reconciles against the All
  /// pill's count.
  int get exploreCategoryTotal {
    return marketplaceRepository
        .offersForMarket(
          _preferences.market,
          category: _selectedExploreCategory,
        )
        .length;
  }

  List<RankedOffer> get exploreVisibleResults {
    final exact = exploreResults;
    if (exact.isNotEmpty) {
      return exact;
    }

    final categoryFallback = _rankOffers(
      filters: const ExploreFilters(),
      category: _selectedExploreCategory,
      excludeSaved: false,
    );

    if (categoryFallback.isNotEmpty) {
      return categoryFallback.take(8).toList();
    }

    return _rankOffers(
      filters: const ExploreFilters(),
      category: null,
      excludeSaved: false,
    ).take(8).toList();
  }

  List<RankedOffer> get homeRecommendations {
    // One offer per (provider × category) pair — Revolut card ≠ Revolut savings,
    // so each can appear, but two Revolut cards can't both show up.
    final seenSlots = <String>{};
    return _rankOffers(
      filters: const ExploreFilters(),
      category: null,
      excludeSaved: isAuthenticated,
    )
        .where(
          (item) => seenSlots.add(
            '${item.offer.providerName}:${item.offer.category.name}',
          ),
        )
        .take(5)
        .toList();
  }

  List<RankedOffer> get trendingOffers {
    final ids = homeRecommendations.map((item) => item.offer.id).toSet();
    // Exclude (provider × category) slots already used in homeRecommendations.
    final usedSlots = homeRecommendations
        .map((item) => '${item.offer.providerName}:${item.offer.category.name}')
        .toSet();
    final seenSlots = <String>{...usedSlots};
    return _rankOffers(
      filters: const ExploreFilters(),
      category: null,
      personalize: false,
      excludeSaved: false,
    )
        .where(
          (item) =>
              !ids.contains(item.offer.id) &&
              seenSlots.add(
                '${item.offer.providerName}:${item.offer.category.name}',
              ),
        )
        .take(4)
        .toList();
  }

  List<TrendSignal> get trendSignals {
    return marketplaceRepository.buildTrendSignals(
      market: _preferences.market,
      savedOfferIds: _savedOfferIds,
      languageCode: _preferences.languageCode,
    );
  }

  Map<PaynCategory, int> get categoryCounts {
    return marketplaceRepository.countOffersByCategory(_preferences.market);
  }

  List<String> get providerOptions {
    return marketplaceRepository.providerOptions(
      _preferences.market,
      _selectedExploreCategory,
    );
  }

  List<String> get featureOptions {
    return marketplaceRepository.featureOptions(
      _preferences.market,
      _selectedExploreCategory,
    );
  }

  List<String> get subtypeOptions {
    return marketplaceRepository.subtypeOptions(
      _preferences.market,
      _selectedExploreCategory,
    );
  }

  int get savedCount => _savedOfferIds.length;

  int get compareCount => _compareOfferIds.length;

  int get activeProviderCount =>
      marketplaceRepository.providerOptions(_preferences.market, null).length;

  int get marketOfferCount =>
      marketplaceRepository.offersForMarket(_preferences.market).length;

  int get activeFilterCount {
    var count = 0;
    if (_exploreFilters.provider.isNotEmpty) count += 1;
    if (_exploreFilters.feature.isNotEmpty) count += 1;
    if (_exploreFilters.subtype.isNotEmpty) count += 1;
    if (_exploreFilters.quickFilter.isNotEmpty) count += 1;
    if (_selectedExploreCategory == PaynCategory.loans) {
      if (_exploreFilters.amount != 25000) count += 1;
      if (_exploreFilters.term != 60) count += 1;
    }
    return count;
  }

  String tradeoffFor(PaynOffer offer) => marketplaceRepository.tradeoffFor(
    offer,
    languageCode: _preferences.languageCode,
  );

  RankedOffer rankedOfferFor(PaynOffer offer, {bool? personalize}) {
    return marketplaceRepository.rankOffer(
      offer: offer,
      market: _preferences.market,
      preferences: _preferences,
      personalize: personalize ?? isAuthenticated,
      savedOfferIds: _savedOfferIds,
      recentOfferIds: _recentOfferIds,
      languageCode: _preferences.languageCode,
    );
  }

  List<String> reasonsFor(PaynOffer offer) {
    return rankedOfferFor(offer).reasons;
  }

  DashboardActivitySnapshot activitySnapshotFor(ChartTimeRange range) {
    return dashboardAnalyticsService.buildSnapshot(
      range: range,
      savedCount: savedCount,
      compareCount: compareCount,
      recentCount: recentOffers.length,
      languageCode: _preferences.languageCode,
    );
  }

  Future<MarketIntelligenceSnapshot> marketSnapshotFor({
    required MarketAsset asset,
    required ChartTimeRange range,
  }) {
    return marketIntelligenceService.snapshotFor(
      asset: asset,
      range: range,
      languageCode: _preferences.languageCode,
    );
  }

  List<RankedOffer> _rankOffers({
    required ExploreFilters filters,
    required PaynCategory? category,
    bool? personalize,
    required bool excludeSaved,
  }) {
    final filtered = marketplaceRepository.filterOffers(
      market: _preferences.market,
      category: category,
      filters: filters,
    );

    final ranked =
        filtered
            .where(
              (offer) => !excludeSaved || !_savedOfferIds.contains(offer.id),
            )
            .map(
              (offer) => marketplaceRepository.rankOffer(
                offer: offer,
                market: _preferences.market,
                preferences: _preferences,
                personalize: personalize ?? isAuthenticated,
                savedOfferIds: _savedOfferIds,
                recentOfferIds: _recentOfferIds,
                languageCode: _preferences.languageCode,
              ),
            )
            .toList()
          ..sort((left, right) => right.score.compareTo(left.score));

    return ranked;
  }

  Future<void> _persistSavedState() async {
    await store.saveStringList(_savedKey, _savedOfferIds);
    await store.saveStringList(_compareKey, _compareOfferIds);
  }
}
