import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  const AppConfig({required this.apiBaseUrl});

  final String apiBaseUrl;

  static Future<AppConfig> load() async {
    String? configured;
    try {
      await dotenv.load(fileName: '.env');
      configured = dotenv.maybeGet('PAYN_API_BASE_URL');
    } catch (_) {}

    return AppConfig(
      apiBaseUrl:
          (configured == null || configured.trim().isEmpty)
              ? 'https://payn.online'
              : configured.trim(),
    );
  }
}
