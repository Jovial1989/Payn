import 'package:amplitude_flutter/amplitude.dart';
import 'package:amplitude_flutter/configuration.dart';
import 'package:amplitude_flutter/constants.dart';
import 'package:amplitude_flutter/events/base_event.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';

class AnalyticsEvents {
  static const String appOpened = 'App Opened';
  static const String splashViewed = 'Splash Viewed';
  static const String onboardingRegionModalViewed =
      'Onboarding Region Modal Viewed';
  static const String regionSelected = 'Region Selected';
  static const String languageSelected = 'Language Selected';
  static const String discoverViewed = 'Discover Viewed';
  static const String categoryViewed = 'Category Viewed';
  static const String offerDetailsViewed = 'Offer Details Viewed';
  static const String providerClicked = 'Provider Clicked';
  static const String offerSaved = 'Offer Saved';
  static const String compareStarted = 'Compare Started';
  static const String compareViewed = 'Compare Viewed';
  static const String signInClicked = 'Sign In Clicked';
  static const String dashboardViewed = 'Dashboard Viewed';
  static const String settingsViewed = 'Settings Viewed';
}

class AnalyticsService {
  Amplitude? _client;
  Future<void>? _initializeFuture;

  Future<void> initialize() {
    return _initializeFuture ??= _initializeInternal();
  }

  Future<void> _initializeInternal() async {
    var amplitude = Amplitude(
      Configuration(
        apiKey: '84cb1925d4b2677d8d13d29ae4f9fb46',
        serverZone: ServerZone.eu,
      ),
    );

    await amplitude.isBuilt;
    _client = amplitude;
  }

  Future<void> setUserId(String? userId) async {
    final client = _client;
    if (client == null) {
      return;
    }

    await client.setUserId(userId);
  }

  Future<void> track(
    String eventName, {
    Map<String, dynamic>? properties,
  }) async {
    final client = _client;
    if (client == null) {
      return;
    }

    await client.track(
      BaseEvent(
        eventName,
        eventProperties: _compactProperties(<String, dynamic>{
          ...?properties,
          'platform': 'mobile',
        }),
      ),
    );
  }

  Map<String, dynamic> buildDefaultProperties({
    required ProfilePreferences preferences,
    required bool loggedIn,
    PaynCategory? category,
    String? offerId,
    String? provider,
    String? asset,
    String? country,
    String? language,
    Map<String, dynamic>? extra,
  }) {
    return _compactProperties(<String, dynamic>{
      'country': country ?? preferences.market.name,
      'language': language ?? preferences.languageCode,
      'category': category?.name,
      'offer_id': offerId,
      'provider': provider,
      'asset': asset,
      'logged_in': loggedIn,
      ...?extra,
    });
  }

  Map<String, dynamic> _compactProperties(Map<String, dynamic> properties) {
    return Map<String, dynamic>.fromEntries(
      properties.entries.where((entry) => entry.value != null),
    );
  }
}
