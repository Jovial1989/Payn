import 'dart:convert';

import 'package:payn_mobile/core/storage/local_store.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';

class LocalAuthRepository {
  LocalAuthRepository(this.store);

  static const String _sessionKey = 'payn.mobile.session';

  final LocalStore store;

  Future<UserSession> restoreSession() async {
    final raw = await store.readString(_sessionKey);
    if (raw == null || raw.isEmpty) {
      return const UserSession.guest();
    }

    try {
      final json = jsonDecode(raw) as Map<String, dynamic>;
      return UserSession.fromJson(json);
    } catch (_) {
      return const UserSession.guest();
    }
  }

  Future<UserSession> signIn({
    required String email,
    required String password,
  }) async {
    return _persistAuthenticatedSession(email: email);
  }

  Future<UserSession> signUp({
    required String email,
    required String password,
  }) async {
    return _persistAuthenticatedSession(email: email);
  }

  Future<void> signOut() async {
    await store.remove(_sessionKey);
  }

  Future<UserSession> _persistAuthenticatedSession({
    required String email,
  }) async {
    final session = UserSession(
      isAuthenticated: true,
      email: email.trim(),
      updatedAt: DateTime.now().toIso8601String(),
    );

    await store.saveString(_sessionKey, jsonEncode(session.toJson()));
    return session;
  }
}
