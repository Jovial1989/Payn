// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Portuguese (`pt`).
class AppLocalizationsPt extends AppLocalizations {
  AppLocalizationsPt([String locale = 'pt']) : super(locale);

  @override
  String get appTitle => 'Payn';

  @override
  String get categoryLoans => 'Pedir emprestado';

  @override
  String get categoryCards => 'Cartões';

  @override
  String get categoryBanking => 'Contas bancárias';

  @override
  String get categoryTransfers => 'Enviar dinheiro';

  @override
  String get categoryExchange => 'Câmbio';

  @override
  String get categoryInsurance => 'Seguros';

  @override
  String get categoryInvestments => 'Investir';

  @override
  String get categoryCrypto => 'Cripto';

  @override
  String get categoryBusiness => 'Para empresas';

  @override
  String get categoryBudgeting => 'Orçamento familiar';

  @override
  String get categoryKids => 'Família';

  @override
  String get categorySavings => 'Poupar';

  @override
  String get profileTypePersonal => 'Pessoal';

  @override
  String get profileTypeFreelancer => 'Freelancer';

  @override
  String get profileTypeBusiness => 'Empresarial';

  @override
  String get marketEu => 'Toda a Europa';

  @override
  String get marketInternational => 'Internacional';

  @override
  String get marketGermany => 'Alemanha';

  @override
  String get marketSpain => 'Espanha';

  @override
  String get marketUnitedKingdom => 'Reino Unido';

  @override
  String get marketFrance => 'França';

  @override
  String get marketItaly => 'Itália';

  @override
  String get marketPortugal => 'Portugal';

  @override
  String get marketNetherlands => 'Países Baixos';

  @override
  String get localeEnglish => 'Inglês';

  @override
  String get localeGerman => 'Alemão';

  @override
  String get localeSpanish => 'Espanhol';

  @override
  String get localeFrench => 'Francês';

  @override
  String get localeItalian => 'Italiano';

  @override
  String get localePortuguese => 'Português';

  @override
  String get homeLiveRanking => 'Ranking ao vivo';

  @override
  String get homeHeroTitle => 'Melhores opções para si';

  @override
  String get homeTopPicksTitle => 'Melhores correspondências hoje';

  @override
  String get homeSmartSuggestions => 'Sugestões inteligentes';

  @override
  String get homeContinueTitle => 'Continue de onde parou';

  @override
  String get homeSeeAll => 'Ver tudo';

  @override
  String get homeSaved => 'Guardadas';

  @override
  String get homeCompared => 'Comparadas';

  @override
  String get homeProviders => 'Fornecedores';

  @override
  String get homeDecisionTitle => 'Ações recomendadas';

  @override
  String get homeDecisionSubtitle =>
      'Escolha o próximo passo útil para decidir.';

  @override
  String get homeContinueComparingTitle => 'Continuar a comparar';

  @override
  String homeContinueComparingBody(int count) {
    return '$count ofertas estão prontas para comparar.';
  }

  @override
  String get homeStartComparingTitle => 'Comece pelas melhores opções';

  @override
  String get homeStartComparingBody =>
      'Compare comissões, rapidez e elegibilidade antes de pedir.';

  @override
  String get homeBestOffersInCountryTitle => 'Melhores ofertas no seu país';

  @override
  String homeBestOffersInCountryBody(Object provider, Object market) {
    return '$provider está bem classificado hoje para $market.';
  }

  @override
  String homeBestOffersInCountryEmpty(Object market) {
    return 'Explore ofertas classificadas disponíveis em $market.';
  }

  @override
  String get homeRecentlyViewedTitle => 'Visto recentemente';

  @override
  String homeRecentlyViewedBody(Object provider, Object category) {
    return 'Continue a analisar $provider em $category.';
  }

  @override
  String get homeMarketUpdatesTitle => 'Atualizações do mercado';

  @override
  String homeMarketUpdatesBody(int count) {
    return '$count ofertas ativas estão disponíveis para o seu mercado.';
  }

  @override
  String get homeDecisionFootnote =>
      'A Payn ajuda-o a comparar. As taxas e condições finais são confirmadas por cada fornecedor.';

  @override
  String get savedTitle => 'Guardadas';

  @override
  String get savedSubtitle =>
      'Mantenha a sua seleção pronta e compare as melhores opções quando quiser decidir.';

  @override
  String get savedEmptyTitle => 'Ainda não há ofertas guardadas';

  @override
  String get savedEmptyDescription =>
      'Guarde ofertas em Explorar para criar uma seleção à qual pode voltar rapidamente.';

  @override
  String get savedFindOffers => 'Encontrar as melhores ofertas';

  @override
  String get savedSuggested => 'Sugeridas para si';

  @override
  String get savedCompareTrayTitle => 'Barra de comparação';

  @override
  String get savedCompareTrayReady =>
      'A sua seleção está pronta para comparar.';

  @override
  String savedCompareTrayNeedMore(int count) {
    return 'Escolha mais $count ofertas para comparar.';
  }

  @override
  String get savedCompare => 'Comparar';

  @override
  String get savedRecent => 'Vistos recentemente';

  @override
  String get savedCompareLimit => 'A comparação suporta até 3 ofertas.';

  @override
  String get savedAddedToCompare => 'Adicionada à comparação';

  @override
  String get savedAddToCompare => 'Adicionar à comparação';

  @override
  String get compareTitle => 'Comparar';

  @override
  String get compareNeedTwoTitle => 'Selecione pelo menos 2 ofertas';

  @override
  String get compareNeedTwoDescription =>
      'Use o separador Guardadas para escolher ofertas para comparação.';

  @override
  String get compareGoToSaved => 'Ir para Guardadas';

  @override
  String get compareBestOption => 'Melhor opção';

  @override
  String get compareApply => 'Pedir';

  @override
  String get compareProvider => 'Fornecedor';

  @override
  String get compareBestFor => 'Ideal para';

  @override
  String get compareTradeoff => 'Compromisso';

  @override
  String get compareSelected => 'Selecionada';

  @override
  String get profileTitle => 'Perfil';

  @override
  String get profileSubtitle =>
      'Gerir região, idioma e como a Payn recorda a sua experiência.';

  @override
  String get profilePreferencesTitle => 'Preferências';

  @override
  String get profilePreferencesSubtitle =>
      'Guardadas localmente para manter mercado e idioma consistentes.';

  @override
  String get profileRegion => 'Região';

  @override
  String get profileLanguage => 'Idioma';

  @override
  String get profileSavedOffers => 'Ofertas guardadas';

  @override
  String profileSavedCount(int count) {
    return '$count guardadas';
  }

  @override
  String get profileInterestsTitle => 'Interesses';

  @override
  String get profileInterestsSubtitle =>
      'Toca nos temas que te interessam. Mostramos esses primeiro.';

  @override
  String get profileSecurityTitle => 'Segurança';

  @override
  String get profileSecuritySubtitle =>
      'Os links dos fornecedores abrem sempre fora da app para manter a sua sessão Payn ativa.';

  @override
  String get profileExternalHandoff => 'Passagem para fornecedor externo';

  @override
  String get profileExternalHandoffDescription =>
      'Os links abrem no browser e permitem voltar à Payn sem janelas bloqueadas.';

  @override
  String get profileLocalPreferences => 'Preferências locais';

  @override
  String get profileLocalPreferencesDescription =>
      'Mercado, idioma e seleção ficam guardados neste dispositivo.';

  @override
  String get profileAccountTitle => 'Conta';

  @override
  String get profileSignOut => 'Terminar sessão';

  @override
  String get profileLogIn => 'Iniciar sessão';

  @override
  String get profileCreateAccount => 'Criar conta';

  @override
  String get profileChooseRegion => 'Escolher região';

  @override
  String get profileChooseLanguage => 'Escolher idioma';

  @override
  String get profileSignedIn => 'Sessão iniciada';

  @override
  String get profileGuestMode => 'Modo convidado';

  @override
  String profileMarketSummary(Object market) {
    return 'O seu mercado é $market.';
  }

  @override
  String get profileGuestSummary =>
      'Navegue livremente, guarde localmente e personalize o seu mercado a qualquer momento.';

  @override
  String get authSignIn => 'Iniciar sessão';

  @override
  String get authCreateAccount => 'Criar conta';

  @override
  String get authOptionalDescription =>
      'O login é opcional. O modo convidado funciona sem conta.';

  @override
  String get authSignUp => 'Registar';

  @override
  String get authEmail => 'Email';

  @override
  String get authEmailPlaceholder => 'voce@example.com';

  @override
  String get authPassword => 'Palavra-passe';

  @override
  String get authPasswordPlaceholder => 'Pelo menos 6 caracteres';

  @override
  String get authWorking => 'A processar...';

  @override
  String get authContinueGuest => 'Continuar como convidado';

  @override
  String get authSignedInSuccess => 'Sessão iniciada.';

  @override
  String get authCreatedSuccess => 'Conta criada.';

  @override
  String get localeGateTitle => 'Escolha mercado e idioma';

  @override
  String get localeGateSubtitle =>
      'Defina região e idioma para começar com a experiência de produto certa.';

  @override
  String get localeGateRegion => 'Região';

  @override
  String get localeGateSelectCountry => 'Selecione o seu país';

  @override
  String get localeGateLanguage => 'Idioma';

  @override
  String get localeGateSelectLanguage => 'Selecione um idioma';

  @override
  String get localeGateContinue => 'Continuar';

  @override
  String get localeGateSettingsHint =>
      'Pode alterar isto a qualquer momento no perfil.';

  @override
  String get exploreLiveRanking => 'Ranking ao vivo';

  @override
  String get exploreBestOptions => 'Do que precisa?';

  @override
  String exploreRankedOffersInMarket(int count, Object market) {
    return '$count ofertas classificadas em $market';
  }

  @override
  String get exploreSearchPlaceholder => 'Pesquisar fornecedores ou produtos';

  @override
  String get exploreAll => 'Tudo';

  @override
  String exploreNoExactMatch(Object market) {
    return 'Sem correspondência exata. A mostrar as ofertas mais fortes para $market.';
  }

  @override
  String get commonClear => 'Limpar';

  @override
  String get commonRetry => 'Tentar novamente';

  @override
  String get exploreNoOffersTitle => 'Nenhuma oferta corresponde aos filtros';

  @override
  String get exploreNoOffersDescription =>
      'Tente limpar os filtros ou mudar de categoria.';

  @override
  String get exploreClearFilters => 'Limpar filtros';

  @override
  String get exploreFiltersTitle => 'Filtros';

  @override
  String get exploreMarketLabel => 'Mercado';

  @override
  String get exploreProviderLabel => 'Fornecedor';

  @override
  String get exploreFeatureLabel => 'Funcionalidade';

  @override
  String get exploreSubtypeLabel => 'Subtipo';

  @override
  String exploreAmountLabel(Object amount) {
    return 'Montante $amount';
  }

  @override
  String exploreTermLabel(int months) {
    return 'Prazo $months meses';
  }

  @override
  String get exploreApply => 'Aplicar';

  @override
  String get exploreMarketIntelligenceTitle => 'Mercado hoje';

  @override
  String get exploreMarketIntelligenceSubtitle =>
      'Veja como o mercado está se movendo antes de investir.';

  @override
  String get offerDecisionReviewed => 'Revista';

  @override
  String get offerOnRequest => 'Sob pedido';

  @override
  String get offerSave => 'Guardar';

  @override
  String get offerSaved => 'Guardada';

  @override
  String get offerUnavailable => 'A oferta já não está disponível.';

  @override
  String get offerStrongMatch => 'Forte correspondência';

  @override
  String get offerInformational => 'Informativa';

  @override
  String get offerEstimated =>
      'Taxas estimadas. Condições finais confirmadas pelo fornecedor.';

  @override
  String offerEstimatedUpdated(Object date) {
    return 'Estimado / última atualização $date';
  }

  @override
  String get offerRatesTitle => 'Taxas';

  @override
  String get offerBenefitsTitle => 'Vantagens';

  @override
  String get offerTradeoffsTitle => 'Compromissos';

  @override
  String get navHome => 'Início';

  @override
  String get navExplore => 'Explorar';

  @override
  String get navSaved => 'Guardadas';

  @override
  String get navProfile => 'Perfil';

  @override
  String formatterThousandsCompact(Object value) {
    return '$value mil';
  }

  @override
  String get homeActivityTitle => 'A sua atividade financeira';

  @override
  String get homeActivitySubtitle =>
      'Acompanhe visualizações, seleção e cliques ao longo do tempo.';

  @override
  String get homeActivityTotalViews => 'Visualizações totais';

  @override
  String get homeActivityCtr => 'Taxa de cliques';

  @override
  String get homeActivityOfferHandoff => 'Passagem da oferta';

  @override
  String get homeActivitySavedOffers => 'Ofertas guardadas';

  @override
  String get homeActivityShortlistReady => 'Seleção pronta';

  @override
  String get chartViews => 'Visualizações';

  @override
  String get chartClicks => 'Cliques';

  @override
  String get offerDecisionNoFees => 'Sem comissões';

  @override
  String get offerDecisionFast => 'Rápida';

  @override
  String get offerDecisionBestValue => 'Melhor valor';

  @override
  String get offerCtaCheckRate => 'Verificar a minha taxa';

  @override
  String get offerCtaApprovalOdds => 'Ver probabilidade de aprovação';

  @override
  String get offerCtaOpenProvider => 'Abrir fornecedor';

  @override
  String get offerCtaCoverPrice => 'Ver preço da cobertura';

  @override
  String get offerCtaOpenDetails => 'Abrir detalhes';

  @override
  String get offerDetailsLoan => 'Detalhes do empréstimo';

  @override
  String get offerDetailsCard => 'Detalhes do cartão';

  @override
  String get offerDetailsFee => 'Detalhes das comissões';

  @override
  String get offerDetailsPolicy => 'Detalhes da apólice';

  @override
  String get offerDetailsPlatform => 'Detalhes da plataforma';

  @override
  String providerOpeningTitle(Object provider) {
    return 'A abrir $provider';
  }

  @override
  String get providerLeavingDescription => 'Está a sair da Payn para continuar';

  @override
  String get providerDisclosure =>
      'Está a abrir o site do fornecedor. As taxas e condições finais são confirmadas pelo fornecedor.';

  @override
  String get providerOpeningMessage => 'A abrir a página do fornecedor...';

  @override
  String get providerManualMessage => 'Use Abrir fornecedor se nada aconteceu.';

  @override
  String get providerOpenButton => 'Abrir fornecedor';

  @override
  String get providerFallbackBrowserButton => 'Abrir no browser';

  @override
  String get providerBackButton => 'Voltar à Payn';

  @override
  String get providerLinkUnavailable =>
      'O link do fornecedor está indisponível.';

  @override
  String get providerLinkCopied =>
      'Não foi possível abrir automaticamente. URL copiado para a área de transferência.';

  @override
  String get providerLinkUnavailableSnackbar =>
      'Este link do fornecedor está indisponível de momento.';

  @override
  String get interestTravel => 'Viagens';

  @override
  String get interestSavings => 'Poupança';

  @override
  String get interestCrypto => 'Cripto';

  @override
  String get interestInternationalTransfers => 'Transferências internacionais';

  @override
  String get interestInvesting => 'Investimento';

  @override
  String get interestInsurance => 'Seguros';

  @override
  String get interestEverydayBanking => 'Banca diária';

  @override
  String get exploreSortBestMatch => 'Melhor correspondência';

  @override
  String get exploreSortLowestFee => 'Comissão mais baixa';

  @override
  String get exploreSortFastest => 'Mais rápida';

  @override
  String get exploreSortRecommended => 'Recomendada';

  @override
  String get exploreMarketDataUnavailable =>
      'Os dados de mercado estão temporariamente indisponíveis. Tente outro ativo.';

  @override
  String get exploreMarketTrendsTitle => 'Tendências';

  @override
  String get exploreMarketInsightsTitle => 'Insights de IA';

  @override
  String get exploreMarketRecommendationsTitle => 'Ações recomendadas';

  @override
  String get marketAssetSp500 => 'S&P 500';

  @override
  String get marketAssetGold => 'Ouro';

  @override
  String get marketAssetPriceSpot => 'Preço spot';

  @override
  String get marketAssetPriceIndex => 'Nível do índice';

  @override
  String get marketAssetPriceFx => 'Taxa FX';

  @override
  String get marketAssetPriceFutures => 'Preço de futuros';

  @override
  String get splashTagline => 'Cada opção de dinheiro, num só lugar';

  @override
  String get routerError => 'Não foi possível abrir esse ecrã.';

  @override
  String get catalogSyncError =>
      'Não foi possível sincronizar as últimas ofertas. As ofertas em cache são exibidas.';
}
