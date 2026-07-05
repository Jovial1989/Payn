// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for French (`fr`).
class AppLocalizationsFr extends AppLocalizations {
  AppLocalizationsFr([String locale = 'fr']) : super(locale);

  @override
  String get appTitle => 'Payn';

  @override
  String get categoryLoans => 'Emprunter';

  @override
  String get categoryCards => 'Cartes';

  @override
  String get categoryBanking => 'Comptes bancaires';

  @override
  String get categoryTransfers => 'Envoyer de l\'argent';

  @override
  String get categoryExchange => 'Change';

  @override
  String get categoryInsurance => 'Assurance';

  @override
  String get categoryInvestments => 'Investir';

  @override
  String get categoryCrypto => 'Crypto';

  @override
  String get categoryBusiness => 'Pour entreprises';

  @override
  String get categoryBudgeting => 'Budget familial';

  @override
  String get categoryKids => 'Famille';

  @override
  String get categorySavings => 'Épargner';

  @override
  String get profileTypePersonal => 'Particulier';

  @override
  String get profileTypeFreelancer => 'Indépendant';

  @override
  String get profileTypeBusiness => 'Entreprise';

  @override
  String get marketEu => 'Toute l\'Europe';

  @override
  String get marketInternational => 'International';

  @override
  String get marketGermany => 'Allemagne';

  @override
  String get marketSpain => 'Espagne';

  @override
  String get marketUnitedKingdom => 'Royaume-Uni';

  @override
  String get marketFrance => 'France';

  @override
  String get marketItaly => 'Italie';

  @override
  String get marketPortugal => 'Portugal';

  @override
  String get marketNetherlands => 'Pays-Bas';

  @override
  String get localeEnglish => 'Anglais';

  @override
  String get localeGerman => 'Allemand';

  @override
  String get localeSpanish => 'Espagnol';

  @override
  String get localeFrench => 'Français';

  @override
  String get localeItalian => 'Italien';

  @override
  String get localePortuguese => 'Portugais';

  @override
  String get homeLiveRanking => 'Classement en direct';

  @override
  String get homeHeroTitle => 'Les meilleures options pour vous';

  @override
  String get homeTopPicksTitle => 'Meilleures correspondances aujourd\'hui';

  @override
  String get homeSmartSuggestions => 'Suggestions intelligentes';

  @override
  String get homeContinueTitle => 'Reprendre là où vous en étiez';

  @override
  String get homeSeeAll => 'Tout voir';

  @override
  String get homeSaved => 'Enregistrés';

  @override
  String get homeCompared => 'Comparés';

  @override
  String get homeProviders => 'Fournisseurs';

  @override
  String get homeDecisionTitle => 'Actions recommandées';

  @override
  String get homeDecisionSubtitle =>
      'Choisissez la prochaine étape utile pour décider.';

  @override
  String get homeContinueComparingTitle => 'Continuer à comparer';

  @override
  String homeContinueComparingBody(int count) {
    return '$count offres sont prêtes à comparer.';
  }

  @override
  String get homeStartComparingTitle => 'Commencer par vos meilleures options';

  @override
  String get homeStartComparingBody =>
      'Comparez frais, rapidité et éligibilité avant de faire une demande.';

  @override
  String get homeBestOffersInCountryTitle =>
      'Meilleures offres dans votre pays';

  @override
  String homeBestOffersInCountryBody(Object provider, Object market) {
    return '$provider est bien classé aujourd\'hui pour $market.';
  }

  @override
  String homeBestOffersInCountryEmpty(Object market) {
    return 'Parcourez les offres classées disponibles en $market.';
  }

  @override
  String get homeRecentlyViewedTitle => 'Vu récemment';

  @override
  String homeRecentlyViewedBody(Object provider, Object category) {
    return 'Continuez à examiner $provider dans $category.';
  }

  @override
  String get homeMarketUpdatesTitle => 'Actualités du marché';

  @override
  String homeMarketUpdatesBody(int count) {
    return '$count offres actives sont disponibles pour votre marché.';
  }

  @override
  String get homeDecisionFootnote =>
      'Payn vous aide à comparer. Les tarifs et conditions finales sont confirmés par chaque fournisseur.';

  @override
  String get savedTitle => 'Enregistrés';

  @override
  String get savedSubtitle =>
      'Gardez votre sélection prête et comparez les meilleures options au moment de décider.';

  @override
  String get savedEmptyTitle => 'Aucune offre enregistrée';

  @override
  String get savedEmptyDescription =>
      'Enregistrez des offres depuis Explorer pour créer une sélection facile à retrouver.';

  @override
  String get savedFindOffers => 'Trouver mes meilleures offres';

  @override
  String get savedSuggested => 'Suggéré pour vous';

  @override
  String get savedCompareTrayTitle => 'Barre de comparaison';

  @override
  String get savedCompareTrayReady => 'Votre sélection est prête à comparer.';

  @override
  String savedCompareTrayNeedMore(int count) {
    return 'Choisissez encore $count offres à comparer.';
  }

  @override
  String get savedCompare => 'Comparer';

  @override
  String get savedRecent => 'Vus récemment';

  @override
  String get savedCompareLimit =>
      'La comparaison prend en charge jusqu\'à 3 offres.';

  @override
  String get savedAddedToCompare => 'Ajouté à la comparaison';

  @override
  String get savedAddToCompare => 'Ajouter à la comparaison';

  @override
  String get compareTitle => 'Comparer';

  @override
  String get compareNeedTwoTitle => 'Sélectionnez au moins 2 offres';

  @override
  String get compareNeedTwoDescription =>
      'Utilisez l\'onglet Enregistrés pour choisir les offres à comparer.';

  @override
  String get compareGoToSaved => 'Aller aux enregistrés';

  @override
  String get compareBestOption => 'Meilleure option';

  @override
  String get compareApply => 'Postuler';

  @override
  String get compareProvider => 'Fournisseur';

  @override
  String get compareBestFor => 'Idéal pour';

  @override
  String get compareTradeoff => 'Compromis';

  @override
  String get compareSelected => 'Sélectionné';

  @override
  String get profileTitle => 'Profil';

  @override
  String get profileSubtitle =>
      'Gérez la région, la langue et la façon dont Payn mémorise votre expérience.';

  @override
  String get profilePreferencesTitle => 'Préférences';

  @override
  String get profilePreferencesSubtitle =>
      'Enregistrées localement pour garder votre marché et votre langue cohérents.';

  @override
  String get profileRegion => 'Région';

  @override
  String get profileLanguage => 'Langue';

  @override
  String get profileSavedOffers => 'Offres enregistrées';

  @override
  String profileSavedCount(int count) {
    return '$count enregistrées';
  }

  @override
  String get profileInterestsTitle => 'Centres d\'intérêt';

  @override
  String get profileInterestsSubtitle =>
      'Touche les sujets qui comptent pour toi. On les montre en premier.';

  @override
  String get profileSecurityTitle => 'Sécurité';

  @override
  String get profileSecuritySubtitle =>
      'Les liens fournisseurs s\'ouvrent toujours hors de l\'app pour garder votre session Payn active.';

  @override
  String get profileExternalHandoff => 'Redirection fournisseur externe';

  @override
  String get profileExternalHandoffDescription =>
      'Les liens s\'ouvrent dans votre navigateur et vous ramènent à Payn sans fenêtre bloquée.';

  @override
  String get profileLocalPreferences => 'Préférences locales';

  @override
  String get profileLocalPreferencesDescription =>
      'Le marché, la langue et la sélection sont conservés sur cet appareil.';

  @override
  String get profileAccountTitle => 'Compte';

  @override
  String get profileSignOut => 'Se déconnecter';

  @override
  String get profileLogIn => 'Se connecter';

  @override
  String get profileCreateAccount => 'Créer un compte';

  @override
  String get profileChooseRegion => 'Choisir une région';

  @override
  String get profileChooseLanguage => 'Choisir une langue';

  @override
  String get profileSignedIn => 'Connecté';

  @override
  String get profileGuestMode => 'Mode invité';

  @override
  String profileMarketSummary(Object market) {
    return 'Votre marché est $market.';
  }

  @override
  String get profileGuestSummary =>
      'Parcourez librement, enregistrez localement et personnalisez votre marché à tout moment.';

  @override
  String get authSignIn => 'Se connecter';

  @override
  String get authCreateAccount => 'Créer un compte';

  @override
  String get authOptionalDescription =>
      'La connexion est facultative. Le mode invité fonctionne sans compte.';

  @override
  String get authSignUp => 'S\'inscrire';

  @override
  String get authEmail => 'Email';

  @override
  String get authEmailPlaceholder => 'you@example.com';

  @override
  String get authPassword => 'Mot de passe';

  @override
  String get authPasswordPlaceholder => 'Au moins 6 caractères';

  @override
  String get authWorking => 'Traitement...';

  @override
  String get authContinueGuest => 'Continuer en invité';

  @override
  String get authSignedInSuccess => 'Connecté.';

  @override
  String get authCreatedSuccess => 'Compte créé.';

  @override
  String get localeGateTitle => 'Choisissez votre marché et votre langue';

  @override
  String get localeGateSubtitle =>
      'Définissez votre région et votre langue pour commencer avec la bonne expérience produit.';

  @override
  String get localeGateRegion => 'Région';

  @override
  String get localeGateSelectCountry => 'Sélectionnez votre pays';

  @override
  String get localeGateLanguage => 'Langue';

  @override
  String get localeGateSelectLanguage => 'Sélectionnez une langue';

  @override
  String get localeGateContinue => 'Continuer';

  @override
  String get localeGateSettingsHint =>
      'Vous pouvez modifier ce choix à tout moment depuis votre profil.';

  @override
  String get exploreLiveRanking => 'Classement en direct';

  @override
  String get exploreBestOptions => 'De quoi avez-vous besoin ?';

  @override
  String exploreRankedOffersInMarket(int count, Object market) {
    return '$count offres classées en $market';
  }

  @override
  String get exploreSearchPlaceholder =>
      'Rechercher des fournisseurs ou produits';

  @override
  String get exploreAll => 'Tout';

  @override
  String exploreNoExactMatch(Object market) {
    return 'Aucune correspondance exacte. Voici les meilleures offres pour $market.';
  }

  @override
  String get commonClear => 'Effacer';

  @override
  String get commonRetry => 'Réessayer';

  @override
  String get exploreNoOffersTitle => 'Aucune offre ne correspond à vos filtres';

  @override
  String get exploreNoOffersDescription =>
      'Essayez d\'effacer les filtres ou de changer de catégorie.';

  @override
  String get exploreClearFilters => 'Effacer les filtres';

  @override
  String get exploreFiltersTitle => 'Filtres';

  @override
  String get exploreMarketLabel => 'Marché';

  @override
  String get exploreProviderLabel => 'Fournisseur';

  @override
  String get exploreFeatureLabel => 'Fonctionnalité';

  @override
  String get exploreSubtypeLabel => 'Sous-type';

  @override
  String exploreAmountLabel(Object amount) {
    return 'Montant $amount';
  }

  @override
  String exploreTermLabel(int months) {
    return 'Durée $months mois';
  }

  @override
  String get exploreApply => 'Appliquer';

  @override
  String get exploreMarketIntelligenceTitle => 'Marché aujourd\'hui';

  @override
  String get exploreMarketIntelligenceSubtitle =>
      'Voyez comment le marché évolue avant d\'investir.';

  @override
  String get offerDecisionReviewed => 'Vérifié';

  @override
  String get offerOnRequest => 'Sur demande';

  @override
  String get offerSave => 'Enregistrer';

  @override
  String get offerSaved => 'Enregistré';

  @override
  String get offerUnavailable => 'Cette offre n\'est plus disponible.';

  @override
  String get offerStrongMatch => 'Très bonne correspondance';

  @override
  String get offerInformational => 'Informationnel';

  @override
  String get offerEstimated =>
      'Tarifs estimés. Les conditions finales sont confirmées par le fournisseur.';

  @override
  String offerEstimatedUpdated(Object date) {
    return 'Estimé / dernière mise à jour $date';
  }

  @override
  String get offerRatesTitle => 'Tarifs';

  @override
  String get offerBenefitsTitle => 'Avantages';

  @override
  String get offerTradeoffsTitle => 'Compromis';

  @override
  String get navHome => 'Accueil';

  @override
  String get navExplore => 'Explorer';

  @override
  String get navSaved => 'Enregistrés';

  @override
  String get navProfile => 'Profil';

  @override
  String formatterThousandsCompact(Object value) {
    return '${value}k';
  }

  @override
  String get homeActivityTitle => 'Votre activité financière';

  @override
  String get homeActivitySubtitle =>
      'Suivez les vues, la dynamique de votre sélection et les clics dans le temps.';

  @override
  String get homeActivityTotalViews => 'Vues totales';

  @override
  String get homeActivityCtr => 'Taux de clic';

  @override
  String get homeActivityOfferHandoff => 'Redirection d\'offre';

  @override
  String get homeActivitySavedOffers => 'Offres enregistrées';

  @override
  String get homeActivityShortlistReady => 'Sélection prête';

  @override
  String get chartViews => 'Vues';

  @override
  String get chartClicks => 'Clics';

  @override
  String get offerDecisionNoFees => 'Sans frais';

  @override
  String get offerDecisionFast => 'Rapide';

  @override
  String get offerDecisionBestValue => 'Meilleur rapport qualité-prix';

  @override
  String get offerCtaCheckRate => 'Vérifier mon taux';

  @override
  String get offerCtaApprovalOdds => 'Voir mes chances d\'approbation';

  @override
  String get offerCtaOpenProvider => 'Ouvrir le fournisseur';

  @override
  String get offerCtaCoverPrice => 'Vérifier le prix de couverture';

  @override
  String get offerCtaOpenDetails => 'Ouvrir les détails';

  @override
  String get offerDetailsLoan => 'Détails du prêt';

  @override
  String get offerDetailsCard => 'Détails de la carte';

  @override
  String get offerDetailsFee => 'Détails des frais';

  @override
  String get offerDetailsPolicy => 'Détails de la police';

  @override
  String get offerDetailsPlatform => 'Détails de la plateforme';

  @override
  String providerOpeningTitle(Object provider) {
    return 'Ouverture de $provider';
  }

  @override
  String get providerLeavingDescription => 'Vous quittez Payn pour continuer';

  @override
  String get providerDisclosure =>
      'Vous ouvrez le site du fournisseur. Les tarifs et conditions finales sont confirmés par le fournisseur.';

  @override
  String get providerOpeningMessage => 'Ouverture de la page du fournisseur...';

  @override
  String get providerManualMessage =>
      'Utilisez Ouvrir le fournisseur si rien ne s\'est passé.';

  @override
  String get providerOpenButton => 'Ouvrir le fournisseur';

  @override
  String get providerFallbackBrowserButton => 'Ouvrir dans le navigateur';

  @override
  String get providerBackButton => 'Retour à Payn';

  @override
  String get providerLinkUnavailable =>
      'Le lien du fournisseur est indisponible.';

  @override
  String get providerLinkCopied =>
      'Ouverture automatique impossible. L\'URL a été copiée.';

  @override
  String get providerLinkUnavailableSnackbar =>
      'Ce lien fournisseur est indisponible pour le moment.';

  @override
  String get interestTravel => 'Voyage';

  @override
  String get interestSavings => 'Épargne';

  @override
  String get interestCrypto => 'Crypto';

  @override
  String get interestInternationalTransfers => 'Virements internationaux';

  @override
  String get interestInvesting => 'Investissement';

  @override
  String get interestInsurance => 'Assurance';

  @override
  String get interestEverydayBanking => 'Banque au quotidien';

  @override
  String get exploreSortBestMatch => 'Meilleure correspondance';

  @override
  String get exploreSortLowestFee => 'Frais les plus bas';

  @override
  String get exploreSortFastest => 'Le plus rapide';

  @override
  String get exploreSortRecommended => 'Recommandé';

  @override
  String get exploreMarketDataUnavailable =>
      'Les données de marché sont temporairement indisponibles. Essayez un autre actif.';

  @override
  String get exploreMarketTrendsTitle => 'Tendances';

  @override
  String get exploreMarketInsightsTitle => 'Analyses IA';

  @override
  String get exploreMarketRecommendationsTitle => 'Actions recommandées';

  @override
  String get marketAssetSp500 => 'S&P 500';

  @override
  String get marketAssetGold => 'Or';

  @override
  String get marketAssetPriceSpot => 'Prix spot';

  @override
  String get marketAssetPriceIndex => 'Niveau de l\'indice';

  @override
  String get marketAssetPriceFx => 'Taux de change';

  @override
  String get marketAssetPriceFutures => 'Prix à terme';

  @override
  String get splashTagline =>
      'Toutes vos options d\'argent, en un seul endroit';

  @override
  String get routerError => 'Impossible d\'ouvrir cette page.';

  @override
  String get catalogSyncError =>
      'Les dernières données du marché n\'ont pas pu être synchronisées. Les offres en cache sont affichées.';
}
