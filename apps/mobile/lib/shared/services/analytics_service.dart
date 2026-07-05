import 'package:amplitude_flutter/amplitude.dart';
import 'package:amplitude_flutter/configuration.dart';
import 'package:amplitude_flutter/constants.dart';
import 'package:amplitude_flutter/events/base_event.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:flutter/foundation.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';

// ─── Event name constants ─────────────────────────────────────────────────────

class AnalyticsEvents {
  static const String appOpened                  = 'App Opened';
  static const String splashViewed               = 'Splash Viewed';
  static const String onboardingRegionModalViewed = 'Onboarding Region Modal Viewed';
  static const String regionSelected             = 'Region Selected';
  static const String languageSelected           = 'Language Selected';
  static const String discoverViewed             = 'Discover Viewed';
  static const String categoryViewed             = 'Category Viewed';
  static const String offerDetailsViewed         = 'Offer Details Viewed';
  static const String providerClicked            = 'Provider Clicked';
  static const String offerSaved                 = 'Offer Saved';
  static const String compareStarted             = 'Compare Started';
  static const String compareViewed              = 'Compare Viewed';
  static const String signInClicked              = 'Sign In Clicked';
  static const String signInCompleted            = 'Sign In Completed';
  static const String signUpCompleted            = 'Sign Up Completed';
  static const String signedOut                  = 'Signed Out';
  static const String oauthStarted              = 'OAuth Started';
  static const String dashboardViewed            = 'Dashboard Viewed';
  static const String settingsViewed             = 'Settings Viewed';
  static const String searchUsed                 = 'Search Used';
  static const String filterApplied              = 'Filter Applied';
  static const String sortChanged                = 'Sort Changed';
  static const String countryChanged             = 'Country Changed';
  static const String offerSavedRemoved          = 'Offer Saved Removed';
  static const String compareAdded               = 'Compare Added';
  static const String compareRemoved             = 'Compare Removed';
  static const String compareCleared             = 'Compare Cleared';
  static const String deepLinkReceived           = 'Deep Link Received';
  static const String profileUpdated             = 'Profile Updated';
  static const String interestsUpdated           = 'Interests Updated';
  static const String offerCardViewed            = 'Offer Card Viewed';
}

// ─── Service ──────────────────────────────────────────────────────────────────

/// Dual-tracks every event to:
///   • Amplitude (EU server zone) — product analytics / funnels
///   • Firebase Analytics (Google Analytics 4) — funnel + retention
///
/// Both are fire-and-forget; a failure in one never blocks the other or
/// the calling code. Firebase Analytics is available only after
/// `Firebase.initializeApp()` has been called in `bootstrap.dart`.
class AnalyticsService {
  Amplitude? _amplitude;
  FirebaseAnalytics? _ga;
  Future<void>? _initFuture;

  Future<void> initialize() => _initFuture ??= _init();

  Future<void> _init() async {
    // Amplitude
    try {
      final a = Amplitude(
        Configuration(
          apiKey: '84cb1925d4b2677d8d13d29ae4f9fb46',
          serverZone: ServerZone.eu,
        ),
      );
      await a.isBuilt;
      _amplitude = a;
    } catch (e) {
      debugPrint('[Analytics] Amplitude init failed: $e');
    }

    // Firebase Analytics — safe if Firebase.initializeApp() was not yet
    // called (GA instance is lazy; events queued internally).
    try {
      _ga = FirebaseAnalytics.instance;
    } catch (e) {
      debugPrint('[Analytics] Firebase Analytics init failed: $e');
    }
  }

  // ─── Identity ─────────────────────────────────────────────────────────────

  Future<void> setUserId(String? userId) async {
    _amplitude?.setUserId(userId).ignore();
    _ga?.setUserId(id: userId).ignore();
  }

  // ─── Tracking ─────────────────────────────────────────────────────────────

  Future<void> track(
    String eventName, {
    Map<String, dynamic>? properties,
  }) async {
    final props = _compact(<String, dynamic>{
      ...?properties,
      'platform': 'mobile',
    });

    // Amplitude
    _amplitude
        ?.track(BaseEvent(eventName, eventProperties: props))
        .ignore();

    // Firebase Analytics — event names must be snake_case ≤ 40 chars,
    // parameters max 25 key-value pairs (string value ≤ 100 chars).
    _logToFirebase(eventName, props).ignore();
  }

  // ─── Firebase Analytics bridge ────────────────────────────────────────────

  Future<void> _logToFirebase(
    String eventName,
    Map<String, dynamic> props,
  ) async {
    final ga = _ga;
    if (ga == null) return;

    // Normalise to GA4 snake_case name (≤ 40 chars, alphanumeric + _)
    final gaName = _toGaName(eventName);

    // Map to Firebase standard events where possible
    try {
      switch (eventName) {
        case AnalyticsEvents.signInCompleted:
          await ga.logLogin(loginMethod: props['method']?.toString() ?? 'email');
        case AnalyticsEvents.signUpCompleted:
          await ga.logSignUp(signUpMethod: props['method']?.toString() ?? 'email');
        case AnalyticsEvents.offerDetailsViewed:
          await ga.logSelectContent(
            contentType: 'offer',
            itemId: props['offer_id']?.toString() ?? '',
          );
        case AnalyticsEvents.providerClicked:
          await ga.logSelectContent(
            contentType: 'provider',
            itemId: props['provider']?.toString() ?? '',
          );
        default:
          await ga.logEvent(
            name: gaName,
            parameters: _gaParameters(props),
          );
      }
    } catch (e) {
      debugPrint('[Analytics] Firebase log failed for "$gaName": $e');
    }
  }

  /// Convert event name → GA4-safe snake_case (max 40 chars).
  static String _toGaName(String name) {
    final snake = name
        .replaceAll(RegExp(r'[^A-Za-z0-9 ]'), '')
        .trim()
        .toLowerCase()
        .replaceAll(RegExp(r'\s+'), '_');
    return snake.length > 40 ? snake.substring(0, 40) : snake;
  }

  /// GA4 parameter values must be String, int, double, or bool.
  static Map<String, Object> _gaParameters(Map<String, dynamic> props) {
    final result = <String, Object>{};
    for (final entry in props.entries.take(25)) {
      final v = entry.value;
      if (v is String || v is int || v is double || v is bool) {
        final key = entry.key.length > 40
            ? entry.key.substring(0, 40)
            : entry.key;
        result[key] = v is String && v.length > 100 ? v.substring(0, 100) : v;
      }
    }
    return result;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

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
  }) =>
      _compact(<String, dynamic>{
        'country': country ?? preferences.market.name,
        'language': language ?? preferences.languageCode,
        'category': category?.name,
        'offer_id': offerId,
        'provider': provider,
        'asset': asset,
        'logged_in': loggedIn ? 'true' : 'false',
        ...?extra,
      });

  Map<String, dynamic> _compact(Map<String, dynamic> props) =>
      Map<String, dynamic>.fromEntries(
        props.entries.where((e) => e.value != null),
      );
}
