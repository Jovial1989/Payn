// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for German (`de`).
class AppLocalizationsDe extends AppLocalizations {
  AppLocalizationsDe([String locale = 'de']) : super(locale);

  @override
  String get appTitle => 'Payn';

  @override
  String get categoryLoans => 'Kredite';

  @override
  String get categoryCards => 'Karten';

  @override
  String get categoryTransfers => 'Überweisungen';

  @override
  String get categoryExchange => 'Wechsel';

  @override
  String get categoryInsurance => 'Versicherungen';

  @override
  String get categoryInvestments => 'Investments';

  @override
  String get profileTypePersonal => 'Privat';

  @override
  String get profileTypeFreelancer => 'Freiberuflich';

  @override
  String get profileTypeBusiness => 'Geschäftlich';

  @override
  String get marketEu => 'Ganz Europa';

  @override
  String get marketInternational => 'International';

  @override
  String get marketGermany => 'Deutschland';

  @override
  String get marketSpain => 'Spanien';

  @override
  String get marketUnitedKingdom => 'Vereinigtes Königreich';

  @override
  String get marketFrance => 'Frankreich';

  @override
  String get marketItaly => 'Italien';

  @override
  String get marketPortugal => 'Portugal';

  @override
  String get marketNetherlands => 'Niederlande';

  @override
  String get localeEnglish => 'Englisch';

  @override
  String get localeGerman => 'Deutsch';

  @override
  String get localeSpanish => 'Spanisch';

  @override
  String get homeLiveRanking => 'Live-Ranking';

  @override
  String get homeHeroTitle => 'Beste Optionen für dich';

  @override
  String get homeTopPicksTitle => 'Beste Treffer heute';

  @override
  String get homeSmartSuggestions => 'Smarte Vorschläge';

  @override
  String get homeContinueTitle => 'Dort weitermachen, wo du aufgehört hast';

  @override
  String get homeSeeAll => 'Alle ansehen';

  @override
  String get homeSaved => 'Gespeichert';

  @override
  String get homeCompared => 'Verglichen';

  @override
  String get homeProviders => 'Anbieter';

  @override
  String get savedTitle => 'Gespeichert';

  @override
  String get savedSubtitle =>
      'Halte deine Shortlist bereit und vergleiche die stärksten Optionen, sobald du entscheiden willst.';

  @override
  String get savedEmptyTitle => 'Noch keine gespeicherten Angebote';

  @override
  String get savedEmptyDescription =>
      'Speichere Angebote aus Explore, um eine Shortlist aufzubauen, zu der du schnell zurückkehren kannst.';

  @override
  String get savedFindOffers => 'Beste Angebote finden';

  @override
  String get savedSuggested => 'Für dich vorgeschlagen';

  @override
  String get savedCompareTrayTitle => 'Vergleichsleiste';

  @override
  String get savedCompareTrayReady =>
      'Deine Shortlist ist bereit zum Vergleichen.';

  @override
  String savedCompareTrayNeedMore(int count) {
    return 'Wähle noch $count Angebote zum Vergleichen.';
  }

  @override
  String get savedCompare => 'Vergleichen';

  @override
  String get savedRecent => 'Zuletzt';

  @override
  String get savedCompareLimit => 'Vergleiche unterstützen bis zu 3 Angebote.';

  @override
  String get savedAddedToCompare => 'Zum Vergleich hinzugefügt';

  @override
  String get savedAddToCompare => 'Zum Vergleich hinzufügen';

  @override
  String get compareTitle => 'Vergleichen';

  @override
  String get compareNeedTwoTitle => 'Mindestens 2 Angebote auswählen';

  @override
  String get compareNeedTwoDescription =>
      'Nutze den Bereich Gespeichert, um Angebote für den Vergleich auszuwählen.';

  @override
  String get compareGoToSaved => 'Zu Gespeichert';

  @override
  String get compareBestOption => 'Beste Option';

  @override
  String get compareApply => 'Beantragen';

  @override
  String get compareProvider => 'Anbieter';

  @override
  String get compareBestFor => 'Am besten für';

  @override
  String get compareTradeoff => 'Abwägung';

  @override
  String get compareSelected => 'Ausgewählt';

  @override
  String get profileTitle => 'Profil';

  @override
  String get profileSubtitle =>
      'Verwalte Region, Sprache und wie Payn sich dein Erlebnis merkt.';

  @override
  String get profilePreferencesTitle => 'Einstellungen';

  @override
  String get profilePreferencesSubtitle =>
      'Lokal gespeichert, damit Markt und Sprache konsistent bleiben.';

  @override
  String get profileRegion => 'Region';

  @override
  String get profileLanguage => 'Sprache';

  @override
  String get profileSavedOffers => 'Gespeicherte Angebote';

  @override
  String profileSavedCount(int count) {
    return '$count gespeichert';
  }

  @override
  String get profileInterestsTitle => 'Interessen';

  @override
  String get profileInterestsSubtitle =>
      'Richte zukünftige Empfehlungen auf die Kategorien aus, die dich interessieren.';

  @override
  String get profileSecurityTitle => 'Sicherheit';

  @override
  String get profileSecuritySubtitle =>
      'Anbieterlinks öffnen sich immer außerhalb der App, damit deine Payn-Sitzung aktiv bleibt.';

  @override
  String get profileExternalHandoff => 'Externer Anbieterwechsel';

  @override
  String get profileExternalHandoffDescription =>
      'Links öffnen im Browser und bringen dich ohne festhängendes Modal zu Payn zurück.';

  @override
  String get profileLocalPreferences => 'Lokale Einstellungen';

  @override
  String get profileLocalPreferencesDescription =>
      'Markt-, Sprach- und Shortlist-Einstellungen bleiben auf diesem Gerät erhalten.';

  @override
  String get profileAccountTitle => 'Konto';

  @override
  String get profileSignOut => 'Abmelden';

  @override
  String get profileLogIn => 'Anmelden';

  @override
  String get profileCreateAccount => 'Konto erstellen';

  @override
  String get profileChooseRegion => 'Region wählen';

  @override
  String get profileChooseLanguage => 'Sprache wählen';

  @override
  String get profileSignedIn => 'Angemeldet';

  @override
  String get profileGuestMode => 'Gastmodus';

  @override
  String profileMarketSummary(Object market) {
    return 'Dein Markt ist $market.';
  }

  @override
  String get profileGuestSummary =>
      'Frei stöbern, lokal speichern und deinen Markt jederzeit personalisieren.';

  @override
  String get authSignIn => 'Anmelden';

  @override
  String get authCreateAccount => 'Konto erstellen';

  @override
  String get authOptionalDescription =>
      'Anmeldung ist optional. Der Gastmodus funktioniert ohne Konto.';

  @override
  String get authSignUp => 'Registrieren';

  @override
  String get authEmail => 'E-Mail';

  @override
  String get authEmailPlaceholder => 'du@beispiel.de';

  @override
  String get authPassword => 'Passwort';

  @override
  String get authPasswordPlaceholder => 'Mindestens 6 Zeichen';

  @override
  String get authWorking => 'Wird verarbeitet...';

  @override
  String get authContinueGuest => 'Als Gast fortfahren';

  @override
  String get authSignedInSuccess => 'Angemeldet.';

  @override
  String get authCreatedSuccess => 'Konto erstellt.';

  @override
  String get localeGateTitle => 'Markt und Sprache auswählen';

  @override
  String get localeGateSubtitle =>
      'Lege Region und Sprache fest, um mit der richtigen Produkterfahrung zu starten.';

  @override
  String get localeGateRegion => 'Region';

  @override
  String get localeGateSelectCountry => 'Land auswählen';

  @override
  String get localeGateLanguage => 'Sprache';

  @override
  String get localeGateSelectLanguage => 'Sprache auswählen';

  @override
  String get localeGateContinue => 'Weiter';

  @override
  String get localeGateSettingsHint =>
      'Du kannst das jederzeit in deinem Profil ändern.';

  @override
  String get exploreLiveRanking => 'Live-Ranking';

  @override
  String get exploreBestOptions => 'Was brauchst du?';

  @override
  String exploreRankedOffersInMarket(int count, Object market) {
    return '$count bewertete Angebote in $market';
  }

  @override
  String get exploreSearchPlaceholder => 'Anbieter oder Produkte suchen';

  @override
  String get exploreAll => 'Alle';

  @override
  String exploreNoExactMatch(Object market) {
    return 'Kein exakter Treffer. Es werden die stärksten Angebote für $market angezeigt.';
  }

  @override
  String get commonClear => 'Zurücksetzen';

  @override
  String get exploreNoOffersTitle => 'Keine Angebote passen zu deinen Filtern';

  @override
  String get exploreNoOffersDescription =>
      'Versuche, Filter zu löschen oder die Kategorie zu wechseln.';

  @override
  String get exploreClearFilters => 'Filter löschen';

  @override
  String get exploreFiltersTitle => 'Filter';

  @override
  String get exploreMarketLabel => 'Markt';

  @override
  String get exploreProviderLabel => 'Anbieter';

  @override
  String get exploreFeatureLabel => 'Merkmal';

  @override
  String get exploreSubtypeLabel => 'Untertyp';

  @override
  String exploreAmountLabel(Object amount) {
    return 'Betrag $amount';
  }

  @override
  String exploreTermLabel(int months) {
    return 'Laufzeit $months Monate';
  }

  @override
  String get exploreApply => 'Anwenden';

  @override
  String get exploreMarketIntelligenceTitle => 'Marktintelligenz';

  @override
  String get exploreMarketIntelligenceSubtitle =>
      'Beobachte den Live-Marktkontext, bevor du in Investmentprodukte wechselst.';

  @override
  String get offerDecisionReviewed => 'Geprüft';

  @override
  String get offerOnRequest => 'Auf Anfrage';

  @override
  String get offerSave => 'Speichern';

  @override
  String get offerSaved => 'Gespeichert';

  @override
  String get offerUnavailable => 'Dieses Angebot ist nicht mehr verfügbar.';

  @override
  String get offerStrongMatch => 'Starker Treffer';

  @override
  String get offerRatesTitle => 'Konditionen';

  @override
  String get offerBenefitsTitle => 'Vorteile';

  @override
  String get offerTradeoffsTitle => 'Abwägungen';

  @override
  String get navHome => 'Start';

  @override
  String get navExplore => 'Entdecken';

  @override
  String get navSaved => 'Gespeichert';

  @override
  String get navProfile => 'Profil';

  @override
  String formatterThousandsCompact(Object value) {
    return '$value Tsd.';
  }

  @override
  String get homeActivityTitle => 'Deine Finanzaktivität';

  @override
  String get homeActivitySubtitle =>
      'Verfolge Aufrufe, Shortlist und Klicks über die Zeit.';

  @override
  String get homeActivityTotalViews => 'Aufrufe gesamt';

  @override
  String get homeActivityCtr => 'Klickrate';

  @override
  String get homeActivityOfferHandoff => 'Weiterleitung';

  @override
  String get homeActivitySavedOffers => 'Gespeicherte Angebote';

  @override
  String get homeActivityShortlistReady => 'Shortlist bereit';

  @override
  String get chartViews => 'Aufrufe';

  @override
  String get chartClicks => 'Klicks';

  @override
  String get offerDecisionNoFees => 'Gebührenfrei';

  @override
  String get offerDecisionFast => 'Schnell';

  @override
  String get offerDecisionBestValue => 'Bestes Angebot';

  @override
  String get offerCtaCheckRate => 'Meine Rate prüfen';

  @override
  String get offerCtaApprovalOdds => 'Chancen prüfen';

  @override
  String get offerCtaOpenProvider => 'Anbieter öffnen';

  @override
  String get offerCtaCoverPrice => 'Prämie prüfen';

  @override
  String get offerCtaOpenDetails => 'Details öffnen';

  @override
  String get offerDetailsLoan => 'Kreditdetails';

  @override
  String get offerDetailsCard => 'Kartendetails';

  @override
  String get offerDetailsFee => 'Gebührendetails';

  @override
  String get offerDetailsPolicy => 'Versicherungsdetails';

  @override
  String get offerDetailsPlatform => 'Plattformdetails';

  @override
  String providerOpeningTitle(Object provider) {
    return '$provider öffnen';
  }

  @override
  String get providerLeavingDescription => 'Du verlässt Payn, um fortzufahren';

  @override
  String get providerOpeningMessage => 'Anbieterseite wird geöffnet...';

  @override
  String get providerManualMessage =>
      'Tippe auf \"Anbieter öffnen\", falls nichts passiert.';

  @override
  String get providerOpenButton => 'Anbieter öffnen';

  @override
  String get providerBackButton => 'Zurück zu Payn';

  @override
  String get providerLinkUnavailable => 'Dieser Link ist nicht verfügbar.';

  @override
  String get providerLinkCopied =>
      'Konnte nicht automatisch öffnen. Link kopiert.';

  @override
  String get providerLinkUnavailableSnackbar =>
      'Dieser Anbieterlink ist gerade nicht verfügbar.';

  @override
  String get interestTravel => 'Reisen';

  @override
  String get interestSavings => 'Sparen';

  @override
  String get interestCrypto => 'Krypto';

  @override
  String get interestInternationalTransfers => 'Internationale Überweisungen';

  @override
  String get interestInvesting => 'Investieren';

  @override
  String get interestInsurance => 'Versicherung';

  @override
  String get interestEverydayBanking => 'Alltägliches Banking';

  @override
  String get exploreSortBestMatch => 'Beste Übereinstimmung';

  @override
  String get exploreSortLowestFee => 'Niedrigste Gebühr';

  @override
  String get exploreSortFastest => 'Am schnellsten';

  @override
  String get exploreSortRecommended => 'Empfohlen';

  @override
  String get exploreMarketDataUnavailable =>
      'Marktdaten sind vorübergehend nicht verfügbar. Versuche einen anderen Vermögenswert.';

  @override
  String get exploreMarketTrendsTitle => 'Trends';

  @override
  String get exploreMarketInsightsTitle => 'KI-Einblicke';

  @override
  String get exploreMarketRecommendationsTitle => 'Empfohlene Aktionen';

  @override
  String get marketAssetSp500 => 'S&P 500';

  @override
  String get marketAssetGold => 'Gold';

  @override
  String get marketAssetPriceSpot => 'Spotpreis';

  @override
  String get marketAssetPriceIndex => 'Indexstand';

  @override
  String get marketAssetPriceFx => 'FX-Kurs';

  @override
  String get marketAssetPriceFutures => 'Futures-Preis';

  @override
  String get splashTagline => 'Transparenz für deine Finanzen';

  @override
  String get routerError => 'Diese Seite konnte nicht geöffnet werden.';
}
