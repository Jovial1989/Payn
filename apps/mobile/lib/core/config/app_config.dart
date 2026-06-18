import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  const AppConfig({
    required this.apiBaseUrl,
    required this.supabaseUrl,
    required this.supabaseAnonKey,
  });

  final String apiBaseUrl;
  final String supabaseUrl;
  final String supabaseAnonKey;

  // ── Defaults baked in — the anon key is public by design (Supabase RLS
  //    enforces data access; the anon key is not a secret). Override via .env.
  static const _kSupabaseUrl = 'https://xxyawuovvaklpsafzcqc.supabase.co';
  static const _kAnonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
      '.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eWF3dW92dmFrbHBzYWZ6Y3FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMDU3ODksImV4cCI6MjA4OTU4MTc4OX0'
      '.RW0vaX3udueFrTkNFc5NfU5BnlU1XHgaacAQGUFbbp4';

  static Future<AppConfig> load() async {
    String? apiUrl;
    String? supaUrl;
    String? anonKey;
    try {
      await dotenv.load(fileName: '.env');
      apiUrl = dotenv.maybeGet('PAYN_API_BASE_URL');
      supaUrl = dotenv.maybeGet('SUPABASE_URL');
      anonKey = dotenv.maybeGet('SUPABASE_ANON_KEY');
    } catch (_) {}

    return AppConfig(
      apiBaseUrl:
          (apiUrl == null || apiUrl.trim().isEmpty)
              ? 'https://payn.online'
              : apiUrl.trim(),
      supabaseUrl:
          (supaUrl == null || supaUrl.trim().isEmpty) ? _kSupabaseUrl : supaUrl.trim(),
      supabaseAnonKey:
          (anonKey == null || anonKey.trim().isEmpty) ? _kAnonKey : anonKey.trim(),
    );
  }
}
