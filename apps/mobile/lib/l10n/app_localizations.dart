import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_de.dart';
import 'app_localizations_en.dart';
import 'app_localizations_es.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('de'),
    Locale('en'),
    Locale('es'),
  ];

  /// No description provided for @appTitle.
  ///
  /// In en, this message translates to:
  /// **'Payn'**
  String get appTitle;

  /// No description provided for @categoryLoans.
  ///
  /// In en, this message translates to:
  /// **'Loans'**
  String get categoryLoans;

  /// No description provided for @categoryCards.
  ///
  /// In en, this message translates to:
  /// **'Cards'**
  String get categoryCards;

  /// No description provided for @categoryTransfers.
  ///
  /// In en, this message translates to:
  /// **'Transfers'**
  String get categoryTransfers;

  /// No description provided for @categoryExchange.
  ///
  /// In en, this message translates to:
  /// **'Exchange'**
  String get categoryExchange;

  /// No description provided for @categoryInsurance.
  ///
  /// In en, this message translates to:
  /// **'Insurance'**
  String get categoryInsurance;

  /// No description provided for @categoryInvestments.
  ///
  /// In en, this message translates to:
  /// **'Investments'**
  String get categoryInvestments;

  /// No description provided for @profileTypePersonal.
  ///
  /// In en, this message translates to:
  /// **'Personal'**
  String get profileTypePersonal;

  /// No description provided for @profileTypeFreelancer.
  ///
  /// In en, this message translates to:
  /// **'Freelancer'**
  String get profileTypeFreelancer;

  /// No description provided for @profileTypeBusiness.
  ///
  /// In en, this message translates to:
  /// **'Business'**
  String get profileTypeBusiness;

  /// No description provided for @marketEu.
  ///
  /// In en, this message translates to:
  /// **'All Europe'**
  String get marketEu;

  /// No description provided for @marketInternational.
  ///
  /// In en, this message translates to:
  /// **'International'**
  String get marketInternational;

  /// No description provided for @marketGermany.
  ///
  /// In en, this message translates to:
  /// **'Germany'**
  String get marketGermany;

  /// No description provided for @marketSpain.
  ///
  /// In en, this message translates to:
  /// **'Spain'**
  String get marketSpain;

  /// No description provided for @marketUnitedKingdom.
  ///
  /// In en, this message translates to:
  /// **'United Kingdom'**
  String get marketUnitedKingdom;

  /// No description provided for @marketFrance.
  ///
  /// In en, this message translates to:
  /// **'France'**
  String get marketFrance;

  /// No description provided for @marketItaly.
  ///
  /// In en, this message translates to:
  /// **'Italy'**
  String get marketItaly;

  /// No description provided for @marketPortugal.
  ///
  /// In en, this message translates to:
  /// **'Portugal'**
  String get marketPortugal;

  /// No description provided for @marketNetherlands.
  ///
  /// In en, this message translates to:
  /// **'Netherlands'**
  String get marketNetherlands;

  /// No description provided for @localeEnglish.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get localeEnglish;

  /// No description provided for @localeGerman.
  ///
  /// In en, this message translates to:
  /// **'German'**
  String get localeGerman;

  /// No description provided for @localeSpanish.
  ///
  /// In en, this message translates to:
  /// **'Spanish'**
  String get localeSpanish;

  /// No description provided for @homeLiveRanking.
  ///
  /// In en, this message translates to:
  /// **'Live ranking'**
  String get homeLiveRanking;

  /// No description provided for @homeHeroTitle.
  ///
  /// In en, this message translates to:
  /// **'Best options for you'**
  String get homeHeroTitle;

  /// No description provided for @homeTopPicksTitle.
  ///
  /// In en, this message translates to:
  /// **'Best matches today'**
  String get homeTopPicksTitle;

  /// No description provided for @homeSmartSuggestions.
  ///
  /// In en, this message translates to:
  /// **'Smart suggestions'**
  String get homeSmartSuggestions;

  /// No description provided for @homeContinueTitle.
  ///
  /// In en, this message translates to:
  /// **'Continue where you left off'**
  String get homeContinueTitle;

  /// No description provided for @homeSeeAll.
  ///
  /// In en, this message translates to:
  /// **'See all'**
  String get homeSeeAll;

  /// No description provided for @homeSaved.
  ///
  /// In en, this message translates to:
  /// **'Saved'**
  String get homeSaved;

  /// No description provided for @homeCompared.
  ///
  /// In en, this message translates to:
  /// **'Compared'**
  String get homeCompared;

  /// No description provided for @homeProviders.
  ///
  /// In en, this message translates to:
  /// **'Providers'**
  String get homeProviders;

  /// No description provided for @savedTitle.
  ///
  /// In en, this message translates to:
  /// **'Saved'**
  String get savedTitle;

  /// No description provided for @savedSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Keep your shortlist ready and compare the strongest options when you want to decide.'**
  String get savedSubtitle;

  /// No description provided for @savedEmptyTitle.
  ///
  /// In en, this message translates to:
  /// **'No saved offers yet'**
  String get savedEmptyTitle;

  /// No description provided for @savedEmptyDescription.
  ///
  /// In en, this message translates to:
  /// **'Save offers from Explore to build a shortlist you can return to quickly.'**
  String get savedEmptyDescription;

  /// No description provided for @savedFindOffers.
  ///
  /// In en, this message translates to:
  /// **'Find my best offers'**
  String get savedFindOffers;

  /// No description provided for @savedSuggested.
  ///
  /// In en, this message translates to:
  /// **'Suggested for you'**
  String get savedSuggested;

  /// No description provided for @savedCompareTrayTitle.
  ///
  /// In en, this message translates to:
  /// **'Compare tray'**
  String get savedCompareTrayTitle;

  /// No description provided for @savedCompareTrayReady.
  ///
  /// In en, this message translates to:
  /// **'Your shortlist is ready to compare.'**
  String get savedCompareTrayReady;

  /// No description provided for @savedCompareTrayNeedMore.
  ///
  /// In en, this message translates to:
  /// **'Pick {count} more offers to compare.'**
  String savedCompareTrayNeedMore(int count);

  /// No description provided for @savedCompare.
  ///
  /// In en, this message translates to:
  /// **'Compare'**
  String get savedCompare;

  /// No description provided for @savedRecent.
  ///
  /// In en, this message translates to:
  /// **'Recent'**
  String get savedRecent;

  /// No description provided for @savedCompareLimit.
  ///
  /// In en, this message translates to:
  /// **'Compare supports up to 3 offers.'**
  String get savedCompareLimit;

  /// No description provided for @savedAddedToCompare.
  ///
  /// In en, this message translates to:
  /// **'Added to compare'**
  String get savedAddedToCompare;

  /// No description provided for @savedAddToCompare.
  ///
  /// In en, this message translates to:
  /// **'Add to compare'**
  String get savedAddToCompare;

  /// No description provided for @compareTitle.
  ///
  /// In en, this message translates to:
  /// **'Compare'**
  String get compareTitle;

  /// No description provided for @compareNeedTwoTitle.
  ///
  /// In en, this message translates to:
  /// **'Select at least 2 offers'**
  String get compareNeedTwoTitle;

  /// No description provided for @compareNeedTwoDescription.
  ///
  /// In en, this message translates to:
  /// **'Use the Saved tab to choose offers for comparison.'**
  String get compareNeedTwoDescription;

  /// No description provided for @compareGoToSaved.
  ///
  /// In en, this message translates to:
  /// **'Go to Saved'**
  String get compareGoToSaved;

  /// No description provided for @compareBestOption.
  ///
  /// In en, this message translates to:
  /// **'Best option'**
  String get compareBestOption;

  /// No description provided for @compareApply.
  ///
  /// In en, this message translates to:
  /// **'Apply'**
  String get compareApply;

  /// No description provided for @compareProvider.
  ///
  /// In en, this message translates to:
  /// **'Provider'**
  String get compareProvider;

  /// No description provided for @compareBestFor.
  ///
  /// In en, this message translates to:
  /// **'Best for'**
  String get compareBestFor;

  /// No description provided for @compareTradeoff.
  ///
  /// In en, this message translates to:
  /// **'Tradeoff'**
  String get compareTradeoff;

  /// No description provided for @compareSelected.
  ///
  /// In en, this message translates to:
  /// **'Selected'**
  String get compareSelected;

  /// No description provided for @profileTitle.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profileTitle;

  /// No description provided for @profileSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Manage region, language, and how Payn remembers your experience.'**
  String get profileSubtitle;

  /// No description provided for @profilePreferencesTitle.
  ///
  /// In en, this message translates to:
  /// **'Preferences'**
  String get profilePreferencesTitle;

  /// No description provided for @profilePreferencesSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Saved locally so your market and language stay consistent.'**
  String get profilePreferencesSubtitle;

  /// No description provided for @profileRegion.
  ///
  /// In en, this message translates to:
  /// **'Region'**
  String get profileRegion;

  /// No description provided for @profileLanguage.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get profileLanguage;

  /// No description provided for @profileSavedOffers.
  ///
  /// In en, this message translates to:
  /// **'Saved offers'**
  String get profileSavedOffers;

  /// No description provided for @profileSavedCount.
  ///
  /// In en, this message translates to:
  /// **'{count} saved'**
  String profileSavedCount(int count);

  /// No description provided for @profileInterestsTitle.
  ///
  /// In en, this message translates to:
  /// **'Interests'**
  String get profileInterestsTitle;

  /// No description provided for @profileInterestsSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Tune future recommendations toward the categories you care about.'**
  String get profileInterestsSubtitle;

  /// No description provided for @profileSecurityTitle.
  ///
  /// In en, this message translates to:
  /// **'Security'**
  String get profileSecurityTitle;

  /// No description provided for @profileSecuritySubtitle.
  ///
  /// In en, this message translates to:
  /// **'Provider links always open outside the app so your Payn session stays active.'**
  String get profileSecuritySubtitle;

  /// No description provided for @profileExternalHandoff.
  ///
  /// In en, this message translates to:
  /// **'External provider handoff'**
  String get profileExternalHandoff;

  /// No description provided for @profileExternalHandoffDescription.
  ///
  /// In en, this message translates to:
  /// **'Links open in your browser and return you to Payn without a stuck modal.'**
  String get profileExternalHandoffDescription;

  /// No description provided for @profileLocalPreferences.
  ///
  /// In en, this message translates to:
  /// **'Local preferences'**
  String get profileLocalPreferences;

  /// No description provided for @profileLocalPreferencesDescription.
  ///
  /// In en, this message translates to:
  /// **'Market, language, and shortlist settings persist on this device.'**
  String get profileLocalPreferencesDescription;

  /// No description provided for @profileAccountTitle.
  ///
  /// In en, this message translates to:
  /// **'Account'**
  String get profileAccountTitle;

  /// No description provided for @profileSignOut.
  ///
  /// In en, this message translates to:
  /// **'Sign out'**
  String get profileSignOut;

  /// No description provided for @profileLogIn.
  ///
  /// In en, this message translates to:
  /// **'Log in'**
  String get profileLogIn;

  /// No description provided for @profileCreateAccount.
  ///
  /// In en, this message translates to:
  /// **'Create account'**
  String get profileCreateAccount;

  /// No description provided for @profileChooseRegion.
  ///
  /// In en, this message translates to:
  /// **'Choose region'**
  String get profileChooseRegion;

  /// No description provided for @profileChooseLanguage.
  ///
  /// In en, this message translates to:
  /// **'Choose language'**
  String get profileChooseLanguage;

  /// No description provided for @profileSignedIn.
  ///
  /// In en, this message translates to:
  /// **'Signed in'**
  String get profileSignedIn;

  /// No description provided for @profileGuestMode.
  ///
  /// In en, this message translates to:
  /// **'Guest mode'**
  String get profileGuestMode;

  /// No description provided for @profileMarketSummary.
  ///
  /// In en, this message translates to:
  /// **'Your market is {market}.'**
  String profileMarketSummary(Object market);

  /// No description provided for @profileGuestSummary.
  ///
  /// In en, this message translates to:
  /// **'Browse freely, save locally, and personalize your market at any time.'**
  String get profileGuestSummary;

  /// No description provided for @authSignIn.
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get authSignIn;

  /// No description provided for @authCreateAccount.
  ///
  /// In en, this message translates to:
  /// **'Create account'**
  String get authCreateAccount;

  /// No description provided for @authOptionalDescription.
  ///
  /// In en, this message translates to:
  /// **'Login is optional. Guest mode works without an account.'**
  String get authOptionalDescription;

  /// No description provided for @authSignUp.
  ///
  /// In en, this message translates to:
  /// **'Sign up'**
  String get authSignUp;

  /// No description provided for @authEmail.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get authEmail;

  /// No description provided for @authEmailPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'you@example.com'**
  String get authEmailPlaceholder;

  /// No description provided for @authPassword.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get authPassword;

  /// No description provided for @authPasswordPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'At least 6 characters'**
  String get authPasswordPlaceholder;

  /// No description provided for @authWorking.
  ///
  /// In en, this message translates to:
  /// **'Working...'**
  String get authWorking;

  /// No description provided for @authContinueGuest.
  ///
  /// In en, this message translates to:
  /// **'Continue as guest'**
  String get authContinueGuest;

  /// No description provided for @authSignedInSuccess.
  ///
  /// In en, this message translates to:
  /// **'Signed in.'**
  String get authSignedInSuccess;

  /// No description provided for @authCreatedSuccess.
  ///
  /// In en, this message translates to:
  /// **'Account created.'**
  String get authCreatedSuccess;

  /// No description provided for @localeGateTitle.
  ///
  /// In en, this message translates to:
  /// **'Choose your market and language'**
  String get localeGateTitle;

  /// No description provided for @localeGateSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Set your region and language to start with the right product experience.'**
  String get localeGateSubtitle;

  /// No description provided for @localeGateRegion.
  ///
  /// In en, this message translates to:
  /// **'Region'**
  String get localeGateRegion;

  /// No description provided for @localeGateSelectCountry.
  ///
  /// In en, this message translates to:
  /// **'Select your country'**
  String get localeGateSelectCountry;

  /// No description provided for @localeGateLanguage.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get localeGateLanguage;

  /// No description provided for @localeGateSelectLanguage.
  ///
  /// In en, this message translates to:
  /// **'Select a language'**
  String get localeGateSelectLanguage;

  /// No description provided for @localeGateContinue.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get localeGateContinue;

  /// No description provided for @localeGateSettingsHint.
  ///
  /// In en, this message translates to:
  /// **'You can change this at any time from your profile.'**
  String get localeGateSettingsHint;

  /// No description provided for @exploreLiveRanking.
  ///
  /// In en, this message translates to:
  /// **'Live ranking'**
  String get exploreLiveRanking;

  /// No description provided for @exploreBestOptions.
  ///
  /// In en, this message translates to:
  /// **'Best options for you'**
  String get exploreBestOptions;

  /// No description provided for @exploreRankedOffersInMarket.
  ///
  /// In en, this message translates to:
  /// **'{count} ranked offers in {market}'**
  String exploreRankedOffersInMarket(int count, Object market);

  /// No description provided for @exploreSearchPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Search providers or products'**
  String get exploreSearchPlaceholder;

  /// No description provided for @exploreAll.
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get exploreAll;

  /// No description provided for @exploreNoExactMatch.
  ///
  /// In en, this message translates to:
  /// **'No exact match. Showing strongest offers for {market}.'**
  String exploreNoExactMatch(Object market);

  /// No description provided for @commonClear.
  ///
  /// In en, this message translates to:
  /// **'Clear'**
  String get commonClear;

  /// No description provided for @exploreNoOffersTitle.
  ///
  /// In en, this message translates to:
  /// **'No offers match your filters'**
  String get exploreNoOffersTitle;

  /// No description provided for @exploreNoOffersDescription.
  ///
  /// In en, this message translates to:
  /// **'Try clearing filters or switching category.'**
  String get exploreNoOffersDescription;

  /// No description provided for @exploreClearFilters.
  ///
  /// In en, this message translates to:
  /// **'Clear filters'**
  String get exploreClearFilters;

  /// No description provided for @offerDecisionReviewed.
  ///
  /// In en, this message translates to:
  /// **'Reviewed'**
  String get offerDecisionReviewed;

  /// No description provided for @offerOnRequest.
  ///
  /// In en, this message translates to:
  /// **'On request'**
  String get offerOnRequest;

  /// No description provided for @offerSave.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get offerSave;

  /// No description provided for @offerSaved.
  ///
  /// In en, this message translates to:
  /// **'Saved'**
  String get offerSaved;

  /// No description provided for @navHome.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get navHome;

  /// No description provided for @navExplore.
  ///
  /// In en, this message translates to:
  /// **'Explore'**
  String get navExplore;

  /// No description provided for @navSaved.
  ///
  /// In en, this message translates to:
  /// **'Saved'**
  String get navSaved;

  /// No description provided for @navProfile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get navProfile;

  /// No description provided for @formatterThousandsCompact.
  ///
  /// In en, this message translates to:
  /// **'{value}k'**
  String formatterThousandsCompact(Object value);

  String get homeActivityTitle;
  String get homeActivitySubtitle;
  String get homeActivityTotalViews;
  String get homeActivityCtr;
  String get homeActivityOfferHandoff;
  String get homeActivitySavedOffers;
  String get homeActivityShortlistReady;
  String get chartViews;
  String get chartClicks;
  String get offerDecisionNoFees;
  String get offerDecisionFast;
  String get offerDecisionBestValue;
  String get offerCtaCheckRate;
  String get offerCtaApprovalOdds;
  String get offerCtaOpenProvider;
  String get offerCtaCoverPrice;
  String get offerCtaOpenDetails;
  String get offerDetailsLoan;
  String get offerDetailsCard;
  String get offerDetailsFee;
  String get offerDetailsPolicy;
  String get offerDetailsPlatform;
  String providerOpeningTitle(Object provider);
  String get providerLeavingDescription;
  String get providerOpeningMessage;
  String get providerManualMessage;
  String get providerOpenButton;
  String get providerBackButton;
  String get providerLinkUnavailable;
  String get providerLinkCopied;
  String get providerLinkUnavailableSnackbar;
  String get splashTagline;
  String get routerError;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['de', 'en', 'es'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'de':
      return AppLocalizationsDe();
    case 'en':
      return AppLocalizationsEn();
    case 'es':
      return AppLocalizationsEs();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
