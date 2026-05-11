// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Spanish Castilian (`es`).
class AppLocalizationsEs extends AppLocalizations {
  AppLocalizationsEs([String locale = 'es']) : super(locale);

  @override
  String get appTitle => 'Payn';

  @override
  String get categoryLoans => 'Préstamos';

  @override
  String get categoryCards => 'Tarjetas de crédito';

  @override
  String get categoryBanking => 'Banca';

  @override
  String get categoryTransfers => 'Transferencias';

  @override
  String get categoryExchange => 'Cambio de divisas';

  @override
  String get categoryInsurance => 'Seguros';

  @override
  String get categoryInvestments => 'Inversiones';

  @override
  String get categoryCrypto => 'Cripto';

  @override
  String get categoryBusiness => 'Banca empresarial';

  @override
  String get categoryBudgeting => 'Presupuesto y finanzas';

  @override
  String get categoryKids => 'Niños y familia';

  @override
  String get profileTypePersonal => 'Personal';

  @override
  String get profileTypeFreelancer => 'Autónomo';

  @override
  String get profileTypeBusiness => 'Empresa';

  @override
  String get marketEu => 'Toda Europa';

  @override
  String get marketInternational => 'Internacional';

  @override
  String get marketGermany => 'Alemania';

  @override
  String get marketSpain => 'España';

  @override
  String get marketUnitedKingdom => 'Reino Unido';

  @override
  String get marketFrance => 'Francia';

  @override
  String get marketItaly => 'Italia';

  @override
  String get marketPortugal => 'Portugal';

  @override
  String get marketNetherlands => 'Países Bajos';

  @override
  String get localeEnglish => 'Inglés';

  @override
  String get localeGerman => 'Alemán';

  @override
  String get localeSpanish => 'Español';

  @override
  String get localeFrench => 'Francés';

  @override
  String get localeItalian => 'Italiano';

  @override
  String get localePortuguese => 'Portugués';

  @override
  String get homeLiveRanking => 'Ranking en vivo';

  @override
  String get homeHeroTitle => 'Mejores opciones para ti';

  @override
  String get homeTopPicksTitle => 'Mejores coincidencias de hoy';

  @override
  String get homeSmartSuggestions => 'Sugerencias inteligentes';

  @override
  String get homeContinueTitle => 'Continúa donde lo dejaste';

  @override
  String get homeSeeAll => 'Ver todo';

  @override
  String get homeSaved => 'Guardado';

  @override
  String get homeCompared => 'Comparado';

  @override
  String get homeProviders => 'Proveedores';

  @override
  String get homeDecisionTitle => 'Acciones recomendadas';

  @override
  String get homeDecisionSubtitle =>
      'Elige el siguiente paso útil para decidir.';

  @override
  String get homeContinueComparingTitle => 'Continuar comparando';

  @override
  String homeContinueComparingBody(int count) {
    return '$count ofertas están listas para comparar.';
  }

  @override
  String get homeStartComparingTitle => 'Empieza con tus mejores opciones';

  @override
  String get homeStartComparingBody =>
      'Compara comisiones, rapidez y elegibilidad antes de solicitar.';

  @override
  String get homeBestOffersInCountryTitle => 'Mejores ofertas en tu país';

  @override
  String homeBestOffersInCountryBody(Object provider, Object market) {
    return '$provider destaca hoy para $market.';
  }

  @override
  String homeBestOffersInCountryEmpty(Object market) {
    return 'Explora ofertas clasificadas disponibles en $market.';
  }

  @override
  String get homeRecentlyViewedTitle => 'Visto recientemente';

  @override
  String homeRecentlyViewedBody(Object provider, Object category) {
    return 'Sigue revisando $provider en $category.';
  }

  @override
  String get homeMarketUpdatesTitle => 'Actualizaciones del mercado';

  @override
  String homeMarketUpdatesBody(int count) {
    return '$count ofertas activas están disponibles para tu mercado.';
  }

  @override
  String get homeDecisionFootnote =>
      'Payn te ayuda a comparar. Las condiciones finales las confirma cada proveedor.';

  @override
  String get savedTitle => 'Guardado';

  @override
  String get savedSubtitle =>
      'Mantén tu selección lista y compara las opciones más fuertes cuando quieras decidir.';

  @override
  String get savedEmptyTitle => 'Aún no hay ofertas guardadas';

  @override
  String get savedEmptyDescription =>
      'Guarda ofertas desde Explorar para crear una lista a la que puedas volver rápidamente.';

  @override
  String get savedFindOffers => 'Encontrar mis mejores ofertas';

  @override
  String get savedSuggested => 'Sugerido para ti';

  @override
  String get savedCompareTrayTitle => 'Bandeja de comparación';

  @override
  String get savedCompareTrayReady => 'Tu selección está lista para comparar.';

  @override
  String savedCompareTrayNeedMore(int count) {
    return 'Elige $count ofertas más para comparar.';
  }

  @override
  String get savedCompare => 'Comparar';

  @override
  String get savedRecent => 'Reciente';

  @override
  String get savedCompareLimit => 'La comparación admite hasta 3 ofertas.';

  @override
  String get savedAddedToCompare => 'Añadido a comparar';

  @override
  String get savedAddToCompare => 'Añadir a comparar';

  @override
  String get compareTitle => 'Comparar';

  @override
  String get compareNeedTwoTitle => 'Selecciona al menos 2 ofertas';

  @override
  String get compareNeedTwoDescription =>
      'Usa la pestaña Guardado para elegir ofertas para comparar.';

  @override
  String get compareGoToSaved => 'Ir a Guardado';

  @override
  String get compareBestOption => 'Mejor opción';

  @override
  String get compareApply => 'Solicitar';

  @override
  String get compareProvider => 'Proveedor';

  @override
  String get compareBestFor => 'Mejor para';

  @override
  String get compareTradeoff => 'Compromiso';

  @override
  String get compareSelected => 'Seleccionado';

  @override
  String get profileTitle => 'Perfil';

  @override
  String get profileSubtitle =>
      'Gestiona la región, el idioma y cómo Payn recuerda tu experiencia.';

  @override
  String get profilePreferencesTitle => 'Preferencias';

  @override
  String get profilePreferencesSubtitle =>
      'Guardado localmente para que tu mercado y tu idioma se mantengan consistentes.';

  @override
  String get profileRegion => 'Región';

  @override
  String get profileLanguage => 'Idioma';

  @override
  String get profileSavedOffers => 'Ofertas guardadas';

  @override
  String profileSavedCount(int count) {
    return '$count guardadas';
  }

  @override
  String get profileInterestsTitle => 'Intereses';

  @override
  String get profileInterestsSubtitle =>
      'Ajusta las recomendaciones futuras a las categorías que te importan.';

  @override
  String get profileSecurityTitle => 'Seguridad';

  @override
  String get profileSecuritySubtitle =>
      'Los enlaces a proveedores siempre se abren fuera de la app para que tu sesión de Payn siga activa.';

  @override
  String get profileExternalHandoff => 'Salida al proveedor';

  @override
  String get profileExternalHandoffDescription =>
      'Los enlaces se abren en tu navegador y vuelves a Payn sin un modal bloqueado.';

  @override
  String get profileLocalPreferences => 'Preferencias locales';

  @override
  String get profileLocalPreferencesDescription =>
      'Las opciones de mercado, idioma y selección permanecen en este dispositivo.';

  @override
  String get profileAccountTitle => 'Cuenta';

  @override
  String get profileSignOut => 'Cerrar sesión';

  @override
  String get profileLogIn => 'Iniciar sesión';

  @override
  String get profileCreateAccount => 'Crear cuenta';

  @override
  String get profileChooseRegion => 'Elegir región';

  @override
  String get profileChooseLanguage => 'Elegir idioma';

  @override
  String get profileSignedIn => 'Sesión iniciada';

  @override
  String get profileGuestMode => 'Modo invitado';

  @override
  String profileMarketSummary(Object market) {
    return 'Tu mercado es $market.';
  }

  @override
  String get profileGuestSummary =>
      'Navega libremente, guarda localmente y personaliza tu mercado en cualquier momento.';

  @override
  String get authSignIn => 'Iniciar sesión';

  @override
  String get authCreateAccount => 'Crear cuenta';

  @override
  String get authOptionalDescription =>
      'El inicio de sesión es opcional. El modo invitado funciona sin cuenta.';

  @override
  String get authSignUp => 'Registrarse';

  @override
  String get authEmail => 'Correo electrónico';

  @override
  String get authEmailPlaceholder => 'tu@ejemplo.com';

  @override
  String get authPassword => 'Contraseña';

  @override
  String get authPasswordPlaceholder => 'Al menos 6 caracteres';

  @override
  String get authWorking => 'Procesando...';

  @override
  String get authContinueGuest => 'Continuar como invitado';

  @override
  String get authSignedInSuccess => 'Sesión iniciada.';

  @override
  String get authCreatedSuccess => 'Cuenta creada.';

  @override
  String get localeGateTitle => 'Elige tu mercado e idioma';

  @override
  String get localeGateSubtitle =>
      'Configura tu región y tu idioma para empezar con la experiencia adecuada.';

  @override
  String get localeGateRegion => 'Región';

  @override
  String get localeGateSelectCountry => 'Selecciona tu país';

  @override
  String get localeGateLanguage => 'Idioma';

  @override
  String get localeGateSelectLanguage => 'Selecciona un idioma';

  @override
  String get localeGateContinue => 'Continuar';

  @override
  String get localeGateSettingsHint =>
      'Puedes cambiarlo en cualquier momento desde tu perfil.';

  @override
  String get exploreLiveRanking => 'Ranking en vivo';

  @override
  String get exploreBestOptions => '¿Qué necesitas?';

  @override
  String exploreRankedOffersInMarket(int count, Object market) {
    return '$count ofertas clasificadas en $market';
  }

  @override
  String get exploreSearchPlaceholder => 'Buscar proveedores o productos';

  @override
  String get exploreAll => 'Todo';

  @override
  String exploreNoExactMatch(Object market) {
    return 'No hay coincidencia exacta. Mostrando las ofertas más fuertes para $market.';
  }

  @override
  String get commonClear => 'Limpiar';

  @override
  String get commonRetry => 'Reintentar';

  @override
  String get exploreNoOffersTitle => 'Ninguna oferta coincide con tus filtros';

  @override
  String get exploreNoOffersDescription =>
      'Prueba a borrar los filtros o cambiar de categoría.';

  @override
  String get exploreClearFilters => 'Borrar filtros';

  @override
  String get exploreFiltersTitle => 'Filtros';

  @override
  String get exploreMarketLabel => 'Mercado';

  @override
  String get exploreProviderLabel => 'Proveedor';

  @override
  String get exploreFeatureLabel => 'Característica';

  @override
  String get exploreSubtypeLabel => 'Subtipo';

  @override
  String exploreAmountLabel(Object amount) {
    return 'Importe $amount';
  }

  @override
  String exploreTermLabel(int months) {
    return 'Plazo $months meses';
  }

  @override
  String get exploreApply => 'Aplicar';

  @override
  String get exploreMarketIntelligenceTitle => 'Inteligencia de mercado';

  @override
  String get exploreMarketIntelligenceSubtitle =>
      'Sigue el contexto del mercado en vivo antes de pasar a productos de inversión.';

  @override
  String get offerDecisionReviewed => 'Revisado';

  @override
  String get offerOnRequest => 'A consultar';

  @override
  String get offerSave => 'Guardar';

  @override
  String get offerSaved => 'Guardado';

  @override
  String get offerUnavailable => 'La oferta ya no está disponible.';

  @override
  String get offerStrongMatch => 'Buena coincidencia';

  @override
  String get offerInformational => 'Informativa';

  @override
  String get offerEstimated =>
      'Tarifas estimadas. Las condiciones finales las confirma el proveedor.';

  @override
  String offerEstimatedUpdated(Object date) {
    return 'Estimado / actualizado por última vez $date';
  }

  @override
  String get offerRatesTitle => 'Condiciones';

  @override
  String get offerBenefitsTitle => 'Ventajas';

  @override
  String get offerTradeoffsTitle => 'Compensaciones';

  @override
  String get navHome => 'Inicio';

  @override
  String get navExplore => 'Explorar';

  @override
  String get navSaved => 'Guardado';

  @override
  String get navProfile => 'Perfil';

  @override
  String formatterThousandsCompact(Object value) {
    return '$value mil';
  }

  @override
  String get homeActivityTitle => 'Tu actividad financiera';

  @override
  String get homeActivitySubtitle =>
      'Sigue vistas, lista corta y clics a lo largo del tiempo.';

  @override
  String get homeActivityTotalViews => 'Vistas totales';

  @override
  String get homeActivityCtr => 'Tasa de clics';

  @override
  String get homeActivityOfferHandoff => 'Derivaciones';

  @override
  String get homeActivitySavedOffers => 'Ofertas guardadas';

  @override
  String get homeActivityShortlistReady => 'Lista lista';

  @override
  String get chartViews => 'Vistas';

  @override
  String get chartClicks => 'Clics';

  @override
  String get offerDecisionNoFees => 'Sin comisiones';

  @override
  String get offerDecisionFast => 'Rápido';

  @override
  String get offerDecisionBestValue => 'Mejor oferta';

  @override
  String get offerCtaCheckRate => 'Ver mi tipo';

  @override
  String get offerCtaApprovalOdds => 'Ver probabilidad';

  @override
  String get offerCtaOpenProvider => 'Abrir proveedor';

  @override
  String get offerCtaCoverPrice => 'Ver precio de cobertura';

  @override
  String get offerCtaOpenDetails => 'Ver detalles';

  @override
  String get offerDetailsLoan => 'Detalles del préstamo';

  @override
  String get offerDetailsCard => 'Detalles de la tarjeta';

  @override
  String get offerDetailsFee => 'Detalles de tarifas';

  @override
  String get offerDetailsPolicy => 'Detalles de la póliza';

  @override
  String get offerDetailsPlatform => 'Detalles de la plataforma';

  @override
  String providerOpeningTitle(Object provider) {
    return 'Abriendo $provider';
  }

  @override
  String get providerLeavingDescription => 'Saliendo de Payn para continuar';

  @override
  String get providerDisclosure =>
      'Vas a abrir el sitio del proveedor. Las tarifas y condiciones finales las confirma el proveedor.';

  @override
  String get providerOpeningMessage => 'Abriendo la página del proveedor...';

  @override
  String get providerManualMessage =>
      'Pulsa \"Abrir proveedor\" si nada ocurrió.';

  @override
  String get providerOpenButton => 'Abrir proveedor';

  @override
  String get providerFallbackBrowserButton => 'Abrir en navegador';

  @override
  String get providerBackButton => 'Volver a Payn';

  @override
  String get providerLinkUnavailable => 'Este enlace no está disponible.';

  @override
  String get providerLinkCopied =>
      'No se pudo abrir. URL copiada al portapapeles.';

  @override
  String get providerLinkUnavailableSnackbar =>
      'Este enlace del proveedor no está disponible ahora.';

  @override
  String get interestTravel => 'Viajes';

  @override
  String get interestSavings => 'Ahorro';

  @override
  String get interestCrypto => 'Cripto';

  @override
  String get interestInternationalTransfers => 'Transferencias internacionales';

  @override
  String get interestInvesting => 'Inversión';

  @override
  String get interestInsurance => 'Seguros';

  @override
  String get interestEverydayBanking => 'Banca diaria';

  @override
  String get exploreSortBestMatch => 'Mejor coincidencia';

  @override
  String get exploreSortLowestFee => 'Menor comisión';

  @override
  String get exploreSortFastest => 'Más rápido';

  @override
  String get exploreSortRecommended => 'Recomendado';

  @override
  String get exploreMarketDataUnavailable =>
      'Los datos de mercado no están disponibles temporalmente. Prueba con otro activo.';

  @override
  String get exploreMarketTrendsTitle => 'Tendencias';

  @override
  String get exploreMarketInsightsTitle => 'Ideas de IA';

  @override
  String get exploreMarketRecommendationsTitle => 'Acciones recomendadas';

  @override
  String get marketAssetSp500 => 'S&P 500';

  @override
  String get marketAssetGold => 'Oro';

  @override
  String get marketAssetPriceSpot => 'Precio spot';

  @override
  String get marketAssetPriceIndex => 'Nivel del índice';

  @override
  String get marketAssetPriceFx => 'Tipo FX';

  @override
  String get marketAssetPriceFutures => 'Precio de futuros';

  @override
  String get splashTagline => 'Claridad para tu dinero';

  @override
  String get routerError => 'No pudimos abrir esa ruta.';

  @override
  String get catalogSyncError =>
      'No se pudieron sincronizar los datos más recientes del marketplace. Se muestran ofertas en caché.';
}
