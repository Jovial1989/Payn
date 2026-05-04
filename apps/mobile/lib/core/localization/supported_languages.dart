import 'package:payn_mobile/l10n/app_localizations.dart';

class SupportedLanguageOption {
  const SupportedLanguageOption({
    required this.code,
    required this.native,
    this.flag,
  });

  final String code;
  final String native;
  final String? flag;

  String localizedLabel(AppLocalizations l10n) {
    switch (code) {
      case 'de':
        return l10n.localeGerman;
      case 'es':
        return l10n.localeSpanish;
      case 'fr':
        return l10n.localeFrench;
      case 'it':
        return l10n.localeItalian;
      case 'pt':
        return l10n.localePortuguese;
      case 'en':
      default:
        return l10n.localeEnglish;
    }
  }
}

const List<SupportedLanguageOption> supportedLanguageOptions =
    <SupportedLanguageOption>[
      SupportedLanguageOption(
        code: 'en',
        native: 'English',
        flag: '🇬🇧',
      ),
      SupportedLanguageOption(
        code: 'de',
        native: 'Deutsch',
        flag: '🇩🇪',
      ),
      SupportedLanguageOption(
        code: 'es',
        native: 'Español',
        flag: '🇪🇸',
      ),
      SupportedLanguageOption(
        code: 'fr',
        native: 'Français',
        flag: '🇫🇷',
      ),
      SupportedLanguageOption(
        code: 'it',
        native: 'Italiano',
        flag: '🇮🇹',
      ),
      SupportedLanguageOption(
        code: 'pt',
        native: 'Português',
        flag: '🇵🇹',
      ),
    ];

final Set<String> supportedLanguageCodes =
    AppLocalizations.supportedLocales
        .map((locale) => locale.languageCode)
        .toSet();

String normalizeSupportedLanguageCode(String? code) {
  if (code != null && supportedLanguageCodes.contains(code)) {
    return code;
  }
  return 'en';
}
