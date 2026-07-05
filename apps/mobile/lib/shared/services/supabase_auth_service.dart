import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:payn_mobile/shared/models/payn_models.dart';

/// Wraps [SupabaseClient] auth with the [UserSession] model the rest of
/// the app expects. Also exposes an [authStateChanges] stream so the
/// [AppController] can react to OAuth callbacks without polling.
class SupabaseAuthService {
  SupabaseAuthService(this._client) : _available = true;

  /// Offline fallback — Supabase could not be initialised at boot.
  /// All auth operations return guest / no-op.
  SupabaseAuthService.offline()
      : _client = null,
        _available = false;

  final SupabaseClient? _client;
  final bool _available;

  // ─── Deep-link redirect registered in iOS Info.plist ─────────────────────
  static const String _redirectUrl =
      'io.supabase.xxyawuovvaklpsafzcqc://login-callback/';

  // iOS OAuth client ID — must also be added to Supabase Dashboard →
  // Auth → Providers → Google → "Authorized Client IDs" so Supabase
  // accepts ID tokens whose audience is the iOS client (not the web client).
  static const String _googleIosClientId =
      '643986868857-objpogbq2od2egim0gljohvahrvcjo98.apps.googleusercontent.com';

  // ─── Session helpers ──────────────────────────────────────────────────────

  UserSession _sessionFrom(Session? s) {
    if (s == null) return const UserSession.guest();
    return UserSession(
      isAuthenticated: true,
      email: s.user.email,
      updatedAt: DateTime.now().toIso8601String(),
    );
  }

  UserSession get currentSession =>
      _available ? _sessionFrom(_client!.auth.currentSession) : const UserSession.guest();

  /// Fires whenever Supabase auth state changes — sign-in, sign-out, token
  /// refresh, OAuth callback. The controller subscribes once at startup.
  Stream<UserSession> get authStateChanges {
    if (!_available) return const Stream<UserSession>.empty();
    return _client!.auth.onAuthStateChange
        .handleError((Object error, StackTrace st) {
          debugPrint('[Auth] ⚠️ authStateChange error: $error\n$st');
        })
        .map((event) {
          debugPrint(
            '[Auth] event=${event.event} '
            'user=${event.session?.user.email ?? 'null'} '
            'provider=${event.session?.user.appMetadata['provider'] ?? '-'}',
          );
          return _sessionFrom(event.session);
        });
  }

  // ─── Email / password ─────────────────────────────────────────────────────

  Future<UserSession> signIn({
    required String email,
    required String password,
  }) async {
    if (!_available) throw Exception('Supabase not available');
    final res = await _client!.auth.signInWithPassword(
      email: email,
      password: password,
    );
    return _sessionFrom(res.session);
  }

  Future<UserSession> signUp({
    required String email,
    required String password,
  }) async {
    if (!_available) throw Exception('Supabase not available');
    final res = await _client!.auth.signUp(
      email: email,
      password: password,
    );
    return _sessionFrom(res.session);
  }

  Future<void> signOut() async {
    if (!_available) return;
    await _client!.auth.signOut();
  }

  // ─── OAuth ────────────────────────────────────────────────────────────────

  Future<void> signInWithOAuth(OAuthProvider provider) async {
    if (!_available) throw Exception('Supabase not available');
    try {
      await _client!.auth.signInWithOAuth(
        provider,
        redirectTo: _redirectUrl,
        authScreenLaunchMode: LaunchMode.externalApplication,
      );
    } catch (e, st) {
      debugPrint('[SupabaseAuthService] OAuth error: $e\n$st');
      rethrow;
    }
  }

  /// Native Google Sign-In — uses the iOS account picker instead of a browser.
  /// No app-switching, no Safari "can't open" error.
  ///
  /// Prerequisites:
  ///   • GIDClientID + REVERSED_CLIENT_ID URL scheme in Info.plist
  ///   • Google provider enabled in Supabase Dashboard → Authentication → Providers
  ///   • Web client ID + secret entered in Supabase Google provider settings
  ///   • "Skip nonce checks" enabled in Supabase → Authentication → Providers → Google
  ///     (required because google_sign_in v6 cannot embed a nonce in the ID token)
  Future<void> signInWithGoogle() async {
    if (!_available) throw Exception('Supabase not available');

    // 1. Open the native iOS account picker.
    //    No serverClientId — iOS SDK always signs idToken for the iOS client.
    //    Supabase must have _googleIosClientId in "Authorized Client IDs".
    final googleSignIn = GoogleSignIn(
      clientId: _googleIosClientId,
    );

    GoogleSignInAccount? account;
    try {
      account = await googleSignIn.signIn();
    } catch (e, st) {
      debugPrint('[Auth] Google picker error: $e\n$st');
      rethrow;
    }

    if (account == null) {
      // User dismissed the picker — not an error.
      throw Exception('cancelled');
    }

    // 2. Exchange account for Google credentials.
    final auth = await account.authentication;
    final idToken = auth.idToken;

    if (idToken == null) {
      debugPrint('[Auth] Google returned null idToken. '
          'Check: GIDClientID in Info.plist, serverClientId matches web client, '
          'and Google Sign-In is enabled in Firebase Console.');
      throw Exception(
        'Google did not return an ID token. '
        'Ensure GIDClientID is set in Info.plist.',
      );
    }

    // 3. Pass to Supabase (nonce check disabled in Dashboard for google_sign_in v6).
    try {
      await _client!.auth.signInWithIdToken(
        provider: OAuthProvider.google,
        idToken: idToken,
        accessToken: auth.accessToken,
      );
    } catch (e, st) {
      debugPrint('[Auth] Supabase signInWithIdToken error: $e\n$st');
      rethrow;
    }
  }
}
