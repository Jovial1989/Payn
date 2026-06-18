// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Payn';

  @override
  String get categoryLoans => 'Borrowing';

  @override
  String get categoryCards => 'Cards';

  @override
  String get categoryBanking => 'Bank accounts';

  @override
  String get categoryTransfers => 'Sending money';

  @override
  String get categoryExchange => 'Currency exchange';

  @override
  String get categoryInsurance => 'Insurance';

  @override
  String get categoryInvestments => 'Investing';

  @override
  String get categoryCrypto => 'Crypto';

  @override
  String get categoryBusiness => 'For business';

  @override
  String get categoryBudgeting => 'Family budgeting';

  @override
  String get categoryKids => 'Family';

  @override
  String get categorySavings => 'Saving';

  @override
  String get profileTypePersonal => 'Personal';

  @override
  String get profileTypeFreelancer => 'Freelancer';

  @override
  String get profileTypeBusiness => 'Business';

  @override
  String get marketEu => 'All Europe';

  @override
  String get marketInternational => 'International';

  @override
  String get marketGermany => 'Germany';

  @override
  String get marketSpain => 'Spain';

  @override
  String get marketUnitedKingdom => 'United Kingdom';

  @override
  String get marketFrance => 'France';

  @override
  String get marketItaly => 'Italy';

  @override
  String get marketPortugal => 'Portugal';

  @override
  String get marketNetherlands => 'Netherlands';

  @override
  String get localeEnglish => 'English';

  @override
  String get localeGerman => 'German';

  @override
  String get localeSpanish => 'Spanish';

  @override
  String get localeFrench => 'French';

  @override
  String get localeItalian => 'Italian';

  @override
  String get localePortuguese => 'Portuguese';

  @override
  String get homeLiveRanking => 'Live FX rates';

  @override
  String get homeHeroTitle => 'Best options for you';

  @override
  String get homeTopPicksTitle => 'Best matches today';

  @override
  String get homeSmartSuggestions => 'Smart suggestions';

  @override
  String get homeContinueTitle => 'Continue where you left off';

  @override
  String get homeSeeAll => 'See all';

  @override
  String get homeSaved => 'Saved';

  @override
  String get homeCompared => 'Compared';

  @override
  String get homeProviders => 'Providers';

  @override
  String get homeDecisionTitle => 'Recommended actions';

  @override
  String get homeDecisionSubtitle =>
      'Pick the next useful step toward a decision.';

  @override
  String get homeContinueComparingTitle => 'Continue comparing';

  @override
  String homeContinueComparingBody(int count) {
    return '$count offers are ready side by side.';
  }

  @override
  String get homeStartComparingTitle => 'Start with your best options';

  @override
  String get homeStartComparingBody =>
      'Compare fees, speed, and eligibility before you apply.';

  @override
  String get homeBestOffersInCountryTitle => 'Best offers right now';

  @override
  String homeBestOffersInCountryBody(Object provider, Object market) {
    return '$provider is ranking well for $market today.';
  }

  @override
  String homeBestOffersInCountryEmpty(Object market) {
    return 'Browse ranked offers available in $market.';
  }

  @override
  String get homeRecentlyViewedTitle => 'Recently viewed';

  @override
  String homeRecentlyViewedBody(Object provider, Object category) {
    return 'Continue reviewing $provider in $category.';
  }

  @override
  String get homeMarketUpdatesTitle => 'Market updates';

  @override
  String homeMarketUpdatesBody(int count) {
    return '$count live offers are available for your market.';
  }

  @override
  String get homeDecisionFootnote =>
      'Payn helps you compare. Final rates and terms are confirmed by each provider.';

  @override
  String get savedTitle => 'Saved';

  @override
  String get savedSubtitle =>
      'Keep your shortlist ready and compare the strongest options when you want to decide.';

  @override
  String get savedEmptyTitle => 'No saved offers yet';

  @override
  String get savedEmptyDescription =>
      'Save offers from Explore to build a shortlist you can return to quickly.';

  @override
  String get savedFindOffers => 'Find my best offers';

  @override
  String get savedSuggested => 'Suggested for you';

  @override
  String get savedCompareTrayTitle => 'Compare tray';

  @override
  String get savedCompareTrayReady => 'Your shortlist is ready to compare.';

  @override
  String savedCompareTrayNeedMore(int count) {
    return 'Pick $count more offers to compare.';
  }

  @override
  String get savedCompare => 'Compare';

  @override
  String get savedRecent => 'Recently viewed';

  @override
  String get savedCompareLimit => 'Compare supports up to 3 offers.';

  @override
  String get savedAddedToCompare => 'Added to compare';

  @override
  String get savedAddToCompare => 'Add to compare';

  @override
  String get compareTitle => 'Compare';

  @override
  String get compareNeedTwoTitle => 'Select at least 2 offers';

  @override
  String get compareNeedTwoDescription =>
      'Use the Saved tab to choose offers for comparison.';

  @override
  String get compareGoToSaved => 'Go to Saved';

  @override
  String get compareBestOption => 'Best option';

  @override
  String get compareApply => 'Apply';

  @override
  String get compareProvider => 'Provider';

  @override
  String get compareBestFor => 'Best for';

  @override
  String get compareTradeoff => 'Tradeoff';

  @override
  String get compareSelected => 'Selected';

  @override
  String get profileTitle => 'Profile';

  @override
  String get profileSubtitle =>
      'Manage region, language, and how Payn remembers your experience.';

  @override
  String get profilePreferencesTitle => 'Preferences';

  @override
  String get profilePreferencesSubtitle =>
      'Saved locally so your market and language stay consistent.';

  @override
  String get profileRegion => 'Region';

  @override
  String get profileLanguage => 'Language';

  @override
  String get profileSavedOffers => 'Saved offers';

  @override
  String profileSavedCount(int count) {
    return '$count saved';
  }

  @override
  String get profileInterestsTitle => 'Interests';

  @override
  String get profileInterestsSubtitle =>
      'Tap topics you care about. We\'ll show those first.';

  @override
  String get profileSecurityTitle => 'Security';

  @override
  String get profileSecuritySubtitle =>
      'Provider links always open outside the app so your Payn session stays active.';

  @override
  String get profileExternalHandoff => 'External provider handoff';

  @override
  String get profileExternalHandoffDescription =>
      'Links open in your browser and return you to Payn without a stuck modal.';

  @override
  String get profileLocalPreferences => 'Local preferences';

  @override
  String get profileLocalPreferencesDescription =>
      'Market, language, and shortlist settings persist on this device.';

  @override
  String get profileAccountTitle => 'Account';

  @override
  String get profileSignOut => 'Sign out';

  @override
  String get profileLogIn => 'Log in';

  @override
  String get profileCreateAccount => 'Create account';

  @override
  String get profileChooseRegion => 'Choose region';

  @override
  String get profileChooseLanguage => 'Choose language';

  @override
  String get profileSignedIn => 'Signed in';

  @override
  String get profileGuestMode => 'Guest mode';

  @override
  String profileMarketSummary(Object market) {
    return 'Your market is $market.';
  }

  @override
  String get profileGuestSummary =>
      'Browse freely, save locally, and personalize your market at any time.';

  @override
  String get authSignIn => 'Sign in';

  @override
  String get authCreateAccount => 'Create account';

  @override
  String get authOptionalDescription =>
      'Login is optional. Guest mode works without an account.';

  @override
  String get authSignUp => 'Sign up';

  @override
  String get authEmail => 'Email';

  @override
  String get authEmailPlaceholder => 'you@example.com';

  @override
  String get authPassword => 'Password';

  @override
  String get authPasswordPlaceholder => 'At least 6 characters';

  @override
  String get authWorking => 'Working...';

  @override
  String get authContinueGuest => 'Continue as guest';

  @override
  String get authSignedInSuccess => 'Signed in.';

  @override
  String get authCreatedSuccess => 'Account created.';

  @override
  String get localeGateTitle => 'Choose your market and language';

  @override
  String get localeGateSubtitle =>
      'Set your region and language to start with the right product experience.';

  @override
  String get localeGateRegion => 'Region';

  @override
  String get localeGateSelectCountry => 'Select your country';

  @override
  String get localeGateLanguage => 'Language';

  @override
  String get localeGateSelectLanguage => 'Select a language';

  @override
  String get localeGateContinue => 'Continue';

  @override
  String get localeGateSettingsHint =>
      'You can change this at any time from your profile.';

  @override
  String get exploreLiveRanking => 'Live FX rates';

  @override
  String get exploreBestOptions => 'What do you need?';

  @override
  String exploreRankedOffersInMarket(int count, Object market) {
    return '$count ranked offers in $market';
  }

  @override
  String get exploreSearchPlaceholder => 'Search providers or products';

  @override
  String get exploreAll => 'All';

  @override
  String exploreNoExactMatch(Object market) {
    return 'No exact match. Showing strongest offers for $market.';
  }

  @override
  String get commonClear => 'Clear';

  @override
  String get commonRetry => 'Retry';

  @override
  String get exploreNoOffersTitle => 'No offers match your filters';

  @override
  String get exploreNoOffersDescription =>
      'Try clearing filters or switching category.';

  @override
  String get exploreClearFilters => 'Clear filters';

  @override
  String get exploreFiltersTitle => 'Filters';

  @override
  String get exploreMarketLabel => 'Market';

  @override
  String get exploreProviderLabel => 'Provider';

  @override
  String get exploreFeatureLabel => 'Feature';

  @override
  String get exploreSubtypeLabel => 'Subtype';

  @override
  String exploreAmountLabel(Object amount) {
    return 'Amount $amount';
  }

  @override
  String exploreTermLabel(int months) {
    return 'Term $months months';
  }

  @override
  String get exploreApply => 'Apply';

  @override
  String get exploreMarketIntelligenceTitle => 'Market today';

  @override
  String get exploreMarketIntelligenceSubtitle =>
      'See how the market\'s moving before you invest.';

  @override
  String get offerDecisionReviewed => 'Reviewed';

  @override
  String get offerOnRequest => 'On request';

  @override
  String get offerSave => 'Save';

  @override
  String get offerSaved => 'Saved';

  @override
  String get offerUnavailable => 'Offer no longer available.';

  @override
  String get offerStrongMatch => 'Strong match';

  @override
  String get offerInformational => 'Informational';

  @override
  String get offerEstimated =>
      'Estimated rates. Final terms confirmed by provider.';

  @override
  String offerEstimatedUpdated(Object date) {
    return 'Estimated / last updated $date';
  }

  @override
  String get offerRatesTitle => 'Rates';

  @override
  String get offerBenefitsTitle => 'Benefits';

  @override
  String get offerTradeoffsTitle => 'Tradeoffs';

  @override
  String get navHome => 'Home';

  @override
  String get navExplore => 'Explore';

  @override
  String get navSaved => 'Saved';

  @override
  String get navProfile => 'Profile';

  @override
  String formatterThousandsCompact(Object value) {
    return '${value}k';
  }

  @override
  String get homeActivityTitle => 'Your financial activity';

  @override
  String get homeActivitySubtitle =>
      'Track views, shortlist momentum, and clicks over time.';

  @override
  String get homeActivityTotalViews => 'Total views';

  @override
  String get homeActivityCtr => 'Click-through rate';

  @override
  String get homeActivityOfferHandoff => 'Offer handoff';

  @override
  String get homeActivitySavedOffers => 'Saved offers';

  @override
  String get homeActivityShortlistReady => 'Shortlist ready';

  @override
  String get chartViews => 'Views';

  @override
  String get chartClicks => 'Clicks';

  @override
  String get offerDecisionNoFees => 'No fees';

  @override
  String get offerDecisionFast => 'Fast';

  @override
  String get offerDecisionBestValue => 'Best value';

  @override
  String get offerCtaCheckRate => 'Check my rate';

  @override
  String get offerCtaApprovalOdds => 'See approval odds';

  @override
  String get offerCtaOpenProvider => 'Open provider';

  @override
  String get offerCtaCoverPrice => 'Check cover price';

  @override
  String get offerCtaOpenDetails => 'Open details';

  @override
  String get offerDetailsLoan => 'Loan details';

  @override
  String get offerDetailsCard => 'Card details';

  @override
  String get offerDetailsFee => 'Fee details';

  @override
  String get offerDetailsPolicy => 'Policy details';

  @override
  String get offerDetailsPlatform => 'Platform details';

  @override
  String providerOpeningTitle(Object provider) {
    return 'Opening $provider';
  }

  @override
  String get providerLeavingDescription => 'You are leaving Payn to continue';

  @override
  String get providerDisclosure =>
      'You are opening the provider site. Rates and final terms are confirmed by the provider.';

  @override
  String get providerOpeningMessage => 'Opening provider page...';

  @override
  String get providerManualMessage => 'Use Open provider if nothing happened.';

  @override
  String get providerOpenButton => 'Open provider';

  @override
  String get providerFallbackBrowserButton => 'Open in browser';

  @override
  String get providerBackButton => 'Back to Payn';

  @override
  String get providerLinkUnavailable => 'Provider link is unavailable.';

  @override
  String get providerLinkCopied =>
      'Could not open automatically. URL copied to clipboard.';

  @override
  String get providerLinkUnavailableSnackbar =>
      'This provider link is unavailable right now.';

  @override
  String get interestTravel => 'Travel';

  @override
  String get interestSavings => 'Savings';

  @override
  String get interestCrypto => 'Crypto';

  @override
  String get interestInternationalTransfers => 'International transfers';

  @override
  String get interestInvesting => 'Investing';

  @override
  String get interestInsurance => 'Insurance';

  @override
  String get interestEverydayBanking => 'Everyday banking';

  @override
  String get exploreSortBestMatch => 'Best match';

  @override
  String get exploreSortLowestFee => 'Lowest fee';

  @override
  String get exploreSortFastest => 'Fastest';

  @override
  String get exploreSortRecommended => 'Top picks';

  @override
  String get exploreMarketDataUnavailable =>
      'Market data is temporarily unavailable. Try another asset.';

  @override
  String get exploreMarketTrendsTitle => 'Trends';

  @override
  String get exploreMarketInsightsTitle => 'AI insights';

  @override
  String get exploreMarketRecommendationsTitle => 'Recommended actions';

  @override
  String get marketAssetSp500 => 'S&P 500';

  @override
  String get marketAssetGold => 'Gold';

  @override
  String get marketAssetPriceSpot => 'Spot price';

  @override
  String get marketAssetPriceIndex => 'Index level';

  @override
  String get marketAssetPriceFx => 'FX rate';

  @override
  String get marketAssetPriceFutures => 'Futures price';

  @override
  String get splashTagline => 'Every money option, in one place';

  @override
  String get routerError => 'We could not open that route.';

  @override
  String get catalogSyncError =>
      'Latest offers could not be synced. Cached offers are shown.';
}
