import 'dart:math' as math;

import 'package:payn_mobile/core/constants/marketplace_constants.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';
import 'package:payn_mobile/shared/services/quick_filters.dart';

class _NumberRange {
  const _NumberRange({this.min, this.max});

  final double? min;
  final double? max;
}

class LocalMarketplaceRepository {
  List<PaynOffer> _catalogOffers = List<PaynOffer>.from(_fallbackOffers);

  void replaceOffers(List<PaynOffer> offers) {
    if (offers.isEmpty) {
      return;
    }
    _catalogOffers = List<PaynOffer>.from(offers);
  }

  List<PaynOffer> get fallbackOffers => List<PaynOffer>.from(_fallbackOffers);

  List<PaynOffer> offersForMarket(PaynMarket market, {PaynCategory? category}) {
    return _catalogOffers.where((offer) {
      if (!_matchesMarket(offer, market)) {
        return false;
      }

      if (category != null && offer.category != category) {
        return false;
      }

      return true;
    }).toList();
  }

  PaynOffer? offerById(String id) {
    for (final offer in _catalogOffers) {
      if (offer.id == id) {
        return offer;
      }
    }
    return null;
  }

  List<PaynOffer> filterOffers({
    required PaynMarket market,
    required PaynCategory? category,
    required ExploreFilters filters,
  }) {
    return offersForMarket(market, category: category).where((offer) {
      final query = filters.query.trim().toLowerCase();
      if (query.isNotEmpty && !_searchText(offer).contains(query)) {
        return false;
      }

      if (filters.provider.isNotEmpty &&
          offer.providerName != filters.provider) {
        return false;
      }

      if (filters.feature.isNotEmpty) {
        final normalizedFeature = filters.feature.toLowerCase();
        final searchable =
            <String>[
              ...offer.bestFor,
              ...offer.attributes.searchTags,
            ].join(' ').toLowerCase();
        if (!searchable.contains(normalizedFeature)) {
          return false;
        }
      }

      if (filters.subtype.isNotEmpty) {
        // P1.6 — Subtype filtering now reads from two sources:
        //   • attributes.subtype — for insurance (health/travel/life/…)
        //     and any other category that gets server-side classified.
        //   • rawCategory — for the Cards bucket where each card flavour
        //     (cards/debit/travel/cashback) lives as its own top-level
        //     category before being folded into PaynCategory.cards.
        // We check both, fold nomad→travel for insurance, and accept any
        // hit. Offers with no subtype data are dropped (a missing field
        // shouldn't silently match every filter).
        final attrSubtype = offer.attributes.subtype ?? '';
        final rawCat = offer.rawCategory ?? '';
        final candidates = <String>{
          if (attrSubtype.isNotEmpty)
            (attrSubtype == 'nomad' ? 'travel' : attrSubtype),
          if (rawCat.isNotEmpty) rawCat,
        };
        if (!candidates.contains(filters.subtype)) {
          return false;
        }
      }

      if (filters.quickFilter.isNotEmpty &&
          !applyQuickFilter(offer, filters.quickFilter)) {
        return false;
      }

      if (category == PaynCategory.loans) {
        final amountRange =
            offer.attributes.maxAmount == null
                ? _metricRange(_metricValue(offer, const <String>['Amount']))
                : _NumberRange(
                  min: offer.attributes.minAmount?.toDouble(),
                  max: offer.attributes.maxAmount?.toDouble(),
                );
        final termRange =
            offer.attributes.maxTermMonths == null
                ? _metricRange(_metricValue(offer, const <String>['Term']))
                : _NumberRange(
                  min: offer.attributes.minTermMonths?.toDouble(),
                  max: offer.attributes.maxTermMonths?.toDouble(),
                );
        final amountOkay =
            amountRange.max == null || amountRange.max! >= filters.amount;
        final termOkay =
            termRange.max == null || termRange.max! >= filters.term;
        if (!amountOkay || !termOkay) {
          return false;
        }
      }

      return true;
    }).toList();
  }

  Map<PaynCategory, int> countOffersByCategory(PaynMarket market) {
    final scoped = offersForMarket(market);
    return <PaynCategory, int>{
      for (final category in PaynCategory.values)
        category: scoped.where((offer) => offer.category == category).length,
    };
  }

  List<String> providerOptions(PaynMarket market, PaynCategory? category) {
    return offersForMarket(
        market,
        category: category,
      ).map((offer) => offer.providerName).toSet().toList()
      ..sort();
  }

  List<String> featureOptions(PaynMarket market, PaynCategory? category) {
    final values = <String>{};
    for (final offer in offersForMarket(market, category: category)) {
      values.addAll(offer.bestFor);
      values.addAll(offer.attributes.searchTags);
    }

    final result = values.toList()..sort();
    return result.take(12).toList();
  }

  List<String> subtypeOptions(PaynMarket market, PaynCategory? category) {
    if (category != PaynCategory.insurance &&
        category != PaynCategory.investments) {
      return const <String>[];
    }

    return offersForMarket(market, category: category)
        .map((offer) => offer.attributes.subtype)
        .whereType<String>()
        .toSet()
        .toList()
      ..sort();
  }

  RankedOffer rankOffer({
    required PaynOffer offer,
    required PaynMarket market,
    required ProfilePreferences preferences,
    required bool personalize,
    required List<String> savedOfferIds,
    required List<String> recentOfferIds,
    required String languageCode,
  }) {
    final directMarketMatch = _isDirectMarketMatch(offer, market);
    final saved = savedOfferIds.contains(offer.id);
    final recent = recentOfferIds.contains(offer.id);
    final recentProvider = recentOfferIds
        .map(offerById)
        .whereType<PaynOffer>()
        .map((item) => item.providerName)
        .contains(offer.providerName);

    var score = offer.affiliatePriorityScore * 100;
    score += directMarketMatch ? 10 : 4;
    score += _freshnessBoost(offer);

    final reasons = <String>[
      directMarketMatch
          ? _directMarketReason(market, languageCode)
          : _regionalVisibilityReason(languageCode),
      offer.bestFor.first,
    ];

    if (personalize) {
      final orderedCategories =
          preferences.selectedCategories.isNotEmpty
              ? preferences.selectedCategories
              : profileCategoryPreferences[preferences.profileType]!;
      final categoryIndex = orderedCategories.indexOf(offer.category);
      if (categoryIndex != -1) {
        score += math.max(0, 12 - categoryIndex * 2);
        reasons.add(_categoryFocusReason(offer.category, languageCode));
      }

      for (final interest in preferences.interests) {
        final keywords = interestKeywords[interest] ?? const <String>[];
        final haystack = _searchText(offer);
        if (keywords.any(
          (keyword) => haystack.contains(keyword.toLowerCase()),
        )) {
          score += 6;
          reasons.add(_interestAlignmentReason(interest, languageCode));
          break;
        }
      }

      if (recentProvider) {
        score += 3;
        reasons.add(_recentProviderReason(languageCode));
      }
    }

    if (saved) {
      reasons.add(_savedReason(languageCode));
    }

    final continueReason = _continueReason(languageCode);
    if (recent && !reasons.contains(continueReason)) {
      reasons.add(continueReason);
    }

    return RankedOffer(
      offer: offer,
      score: score,
      reasons: reasons.take(3).toList(),
      tradeoff: tradeoffFor(offer, languageCode: languageCode),
    );
  }

  List<TrendSignal> buildTrendSignals({
    required PaynMarket market,
    required List<String> savedOfferIds,
    required String languageCode,
  }) {
    final categoryCounts =
        countOffersByCategory(market).entries.toList()
          ..sort((left, right) => right.value.compareTo(left.value));
    final topCategory = categoryCounts.first;
    final providers = providerOptions(market, null);
    final topTransfer =
        offersForMarket(market, category: PaynCategory.transfers)
            .where(
              (offer) =>
                  offer.providerName == 'Wise' ||
                  offer.providerName == 'Revolut',
            )
            .toList();

    return <TrendSignal>[
      TrendSignal(
        label: _marketDepthLabel(languageCode),
        value: _marketDepthValue(
          count: topCategory.value,
          category: topCategory.key,
          languageCode: languageCode,
        ),
        detail: _marketDepthDetail(
          market: market,
          category: topCategory.key,
          languageCode: languageCode,
        ),
      ),
      TrendSignal(
        label: _providerCoverageLabel(languageCode),
        value: _providerCoverageValue(providers.length, languageCode),
        detail: _providerCoverageDetail(languageCode),
      ),
      TrendSignal(
        label: _decisionPressureLabel(languageCode),
        value: _decisionPressureValue(topTransfer.isNotEmpty, languageCode),
        detail:
            savedOfferIds.isEmpty
                ? _decisionPressureEmptyDetail(languageCode)
                : _decisionPressureReadyDetail(languageCode),
      ),
    ];
  }

  String tradeoffFor(PaynOffer offer, {required String languageCode}) {
    switch (offer.category) {
      case PaynCategory.loans:
        return switch (languageCode) {
          'de' =>
            'Die endgültige Preisgestaltung kann sich durch Bonität, Einkommensprüfung und Rückzahlungsprofil noch ändern.',
          'es' =>
            'El precio final aún puede variar según elegibilidad, ingresos y perfil de devolución.',
          _ =>
            'Final pricing can still move with eligibility, income checks, and repayment profile.',
        };
      case PaynCategory.cards:
        return switch (languageCode) {
          'de' =>
            'Die stärksten Reisevorteile gehen oft mit einer laufenden Gebühr oder strengeren Nutzungsbedingungen einher.',
          'es' =>
            'Las mejores ventajas de viaje suelen venir con una cuota recurrente o condiciones de uso más estrictas.',
          _ =>
            'The strongest travel perks usually come with a recurring plan fee or stricter usage pattern.',
        };
      case PaynCategory.transfers:
        return switch (languageCode) {
          'de' =>
            'Der günstigste Weg ist nicht immer der schnellste, besonders über verschiedene Auszahlungsarten hinweg.',
          'es' =>
            'La ruta más barata no siempre es la más rápida, especialmente entre distintos métodos de pago.',
          _ =>
            'The cheapest route is not always the fastest, especially across payout methods.',
        };
      case PaynCategory.exchange:
        return switch (languageCode) {
          'de' =>
            'Beworbene Kurse können weiterhin Limits, Wochenendaufschläge oder corridor-spezifische Spreads verbergen.',
          'es' =>
            'Los tipos anunciados aún pueden ocultar límites, recargos de fin de semana o diferenciales por corredor.',
          _ =>
            'Headline rates can still hide limits, weekend markups, or corridor-specific spreads.',
        };
      case PaynCategory.insurance:
        return switch (languageCode) {
          'de' =>
            'Prämien und Deckungstiefe können sich je nach Gesundheit, Alter, Reiseprofil oder Fahrzeugprofil ändern.',
          'es' =>
            'Las primas y la cobertura pueden cambiar según salud, edad, patrón de viaje o perfil del vehículo.',
          _ =>
            'Premiums and cover depth can change with health, age, travel pattern, or vehicle profile.',
        };
      case PaynCategory.investments:
        return switch (languageCode) {
          'de' =>
            'Niedrige Gebühren beseitigen weder Marktrisiko noch Plattformkomplexität oder Verwahrungsabwägungen.',
          'es' =>
            'Las comisiones bajas no eliminan el riesgo de mercado, la complejidad de la plataforma ni las compensaciones de custodia.',
          _ =>
            'Low fees do not remove market risk, platform complexity, or custody tradeoffs.',
        };
      case PaynCategory.banking:
        return switch (languageCode) {
          'de' =>
            'Einlagen-, Verfügbarkeits- und Kontogebühren können sich nach den ersten Monaten ändern.',
          'es' =>
            'Las tarifas de depósito, disponibilidad y cuenta pueden cambiar después de los primeros meses.',
          _ =>
            'Deposit protection, availability, and account fees may shift after the first months.',
        };
      case PaynCategory.savings:
        return switch (languageCode) {
          'de' =>
            'Beworbene Zinssätze können Aktionen, Mindestbeträge oder Bindungsdauern voraussetzen.',
          'es' =>
            'Las tasas anunciadas pueden requerir promociones, importes mínimos o periodos de fidelización.',
          _ =>
            'Headline rates may rely on promos, minimum balances, or lock-in periods.',
        };
      case PaynCategory.crypto:
        return switch (languageCode) {
          'de' =>
            'Spread, Verwahrung und Lizenzierung variieren stark zwischen den Anbietern.',
          'es' =>
            'El spread, la custodia y la licencia varían bastante entre proveedores.',
          _ =>
            'Spread, custody, and licensing vary considerably between providers.',
        };
      case PaynCategory.business:
        return switch (languageCode) {
          'de' =>
            'Geschäftskonten-Vorteile hängen von Umsatz, Teamgrösse und Land ab.',
          'es' =>
            'Las ventajas de cuenta de negocio dependen de la facturación, el equipo y el país.',
          _ =>
            'Business-account perks depend on turnover, team size, and country of registration.',
        };
      case PaynCategory.budgeting:
        return switch (languageCode) {
          'de' =>
            'Funktionen entwickeln sich schnell, Datenintegrationen und Banken können wechseln.',
          'es' =>
            'Las funciones evolucionan rápido y las integraciones bancarias pueden cambiar.',
          _ =>
            'Features evolve quickly and bank integrations can shift release-to-release.',
        };
      case PaynCategory.kids:
        return switch (languageCode) {
          'de' =>
            'Limits und Auszahlungen unterscheiden sich je nach Alter und Aufsichtsrolle.',
          'es' =>
            'Los límites y los retiros varían según la edad y el rol de supervisión.',
          _ =>
            'Limits and payouts vary by age tier and supervising-account role.',
        };
    }
  }

  String _directMarketReason(PaynMarket market, String languageCode) {
    final marketLabel = _marketLabel(market, languageCode);
    return switch (languageCode) {
      'de' => 'Starke Abdeckung für $marketLabel',
      'es' => 'Cobertura sólida para $marketLabel',
      _ => 'Strong coverage for $marketLabel',
    };
  }

  // TASK-318 — Was "Visible across European comparison flows" (en) /
  // "In europäischen Vergleichsflüssen sichtbar" (de) — pure internal
  // marketing-deck phrasing that leaked into the Benefits section on
  // PDP. Replaced with user-facing copy that says what the customer
  // actually gets: a cross-border product they can sign up for from
  // their EU country of residence.
  String _regionalVisibilityReason(String languageCode) =>
      switch (languageCode) {
        'de' => 'Grenzüberschreitend in der EU verfügbar',
        'es' => 'Disponible para clientes en toda la UE',
        'fr' => 'Disponible aux clients dans toute l\'UE',
        'it' => 'Disponibile ai clienti in tutta l\'UE',
        'pt' => 'Disponível para clientes em toda a UE',
        _ => 'Available to customers across the EU',
      };

  String _categoryFocusReason(PaynCategory category, String languageCode) {
    final categoryLabel = _categoryLabel(category, languageCode).toLowerCase();
    return switch (languageCode) {
      'de' => 'Passt zu deinem Fokus auf $categoryLabel',
      'es' => 'Encaja con tu foco en $categoryLabel',
      _ => 'Matches your $categoryLabel focus',
    };
  }

  String _interestAlignmentReason(String interest, String languageCode) {
    final interestLabel = _interestLabel(interest, languageCode);
    return switch (languageCode) {
      'de' => 'Passt zu $interestLabel',
      'es' => 'Alineado con $interestLabel',
      _ => 'Aligned with $interestLabel',
    };
  }

  String _recentProviderReason(String languageCode) => switch (languageCode) {
    'de' => 'Nahe an Anbietern, die du zuletzt geprüft hast',
    'es' => 'Cerca de proveedores que revisaste recientemente',
    _ => 'Close to providers you reviewed recently',
  };

  String _savedReason(String languageCode) => switch (languageCode) {
    'de' => 'Bereits in deiner Shortlist',
    'es' => 'Ya está en tu lista corta',
    _ => 'Already in your shortlist',
  };

  String _continueReason(String languageCode) => switch (languageCode) {
    'de' => 'Dort weitermachen, wo du aufgehört hast',
    'es' => 'Continúa donde lo dejaste',
    _ => 'Continue where you left off',
  };

  String _marketDepthLabel(String languageCode) => switch (languageCode) {
    'de' => 'Markttiefe',
    'es' => 'Profundidad del mercado',
    _ => 'Market depth',
  };

  String _marketDepthValue({
    required int count,
    required PaynCategory category,
    required String languageCode,
  }) => '$count ${_categoryLabel(category, languageCode).toLowerCase()}';

  String _marketDepthDetail({
    required PaynMarket market,
    required PaynCategory category,
    required String languageCode,
  }) {
    final categoryLabel = _categoryLabel(category, languageCode);
    final marketLabel = _marketLabel(market, languageCode);
    return switch (languageCode) {
      'de' => '$categoryLabel prägen die Entdeckung in $marketLabel.',
      'es' => '$categoryLabel lideran el descubrimiento en $marketLabel.',
      _ => '$categoryLabel lead discovery in $marketLabel.',
    };
  }

  String _providerCoverageLabel(String languageCode) => switch (languageCode) {
    'de' => 'Anbieterabdeckung',
    'es' => 'Cobertura de proveedores',
    _ => 'Provider coverage',
  };

  String _providerCoverageValue(int count, String languageCode) =>
      switch (languageCode) {
        'de' => '$count Anbieter',
        'es' => '$count proveedores',
        _ => '$count providers',
      };

  String _providerCoverageDetail(String languageCode) => switch (languageCode) {
    'de' => 'Bekannte Institute bleiben im gesamten Shortlist-Fluss sichtbar.',
    'es' =>
      'Las instituciones reconocidas siguen visibles en todo el flujo de shortlist.',
    _ => 'Recognizable institutions stay visible across the shortlist flow.',
  };

  String _decisionPressureLabel(String languageCode) => switch (languageCode) {
    'de' => 'Entscheidungsdruck',
    'es' => 'Presión de decisión',
    _ => 'Decision pressure',
  };

  String _decisionPressureValue(bool transferActive, String languageCode) {
    if (transferActive) {
      return switch (languageCode) {
        'de' => 'Transfers und FX aktiv',
        'es' => 'Transferencias y FX activas',
        _ => 'Transfers and FX active',
      };
    }

    return switch (languageCode) {
      'de' => 'Breiter Markt stabil',
      'es' => 'Mercado general estable',
      _ => 'Broader market steady',
    };
  }

  String _decisionPressureEmptyDetail(
    String languageCode,
  ) => switch (languageCode) {
    'de' => 'Speichere Angebote, um deine mobile Shortlist enger zu halten.',
    'es' => 'Guarda ofertas para mantener una shortlist móvil más enfocada.',
    _ => 'Save offers to keep a tighter mobile shortlist.',
  };

  String _decisionPressureReadyDetail(String languageCode) =>
      switch (languageCode) {
        'de' => 'Deine Shortlist ist bereit für den direkten Vergleich.',
        'es' => 'Tu shortlist está lista para una comparación lado a lado.',
        _ => 'Your shortlist is ready for side-by-side comparison.',
      };

  String _marketLabel(PaynMarket market, String languageCode) {
    switch (market) {
      case PaynMarket.eu:
        return switch (languageCode) {
          'de' => 'Ganz Europa',
          'es' => 'Toda Europa',
          _ => 'All Europe',
        };
      case PaynMarket.international:
        return switch (languageCode) {
          'de' => 'International',
          'es' => 'Internacional',
          _ => 'International',
        };
      case PaynMarket.de:
        return switch (languageCode) {
          'de' => 'Deutschland',
          'es' => 'Alemania',
          _ => 'Germany',
        };
      case PaynMarket.es:
        return switch (languageCode) {
          'de' => 'Spanien',
          'es' => 'España',
          _ => 'Spain',
        };
      case PaynMarket.uk:
        return switch (languageCode) {
          'de' => 'Vereinigtes Königreich',
          'es' => 'Reino Unido',
          _ => 'United Kingdom',
        };
      case PaynMarket.fr:
        return switch (languageCode) {
          'de' => 'Frankreich',
          'es' => 'Francia',
          _ => 'France',
        };
      case PaynMarket.it:
        return switch (languageCode) {
          'de' => 'Italien',
          'es' => 'Italia',
          _ => 'Italy',
        };
      case PaynMarket.pt:
        return switch (languageCode) {
          'de' => 'Portugal',
          'es' => 'Portugal',
          _ => 'Portugal',
        };
      case PaynMarket.nl:
        return switch (languageCode) {
          'de' => 'Niederlande',
          'es' => 'Países Bajos',
          _ => 'Netherlands',
        };
    }
  }

  String _categoryLabel(PaynCategory category, String languageCode) {
    // TASK-302 (PR-V3-02). Aligned with `PaynCategoryLabel.label` and
    // the ARB `categoryX` strings. Six locales kept for parity with
    // the rest of the catalogue — when the caller has a `BuildContext`
    // it should still prefer `PaynCategoryL10n.localizedLabel(l10n)`.
    switch (category) {
      case PaynCategory.loans:
        return switch (languageCode) {
          'de' => 'Kredite',
          'es' => 'Pedir prestado',
          'fr' => 'Emprunter',
          'it' => 'Prendere in prestito',
          'pt' => 'Pedir emprestado',
          _ => 'Borrowing',
        };
      case PaynCategory.cards:
        return switch (languageCode) {
          'de' => 'Karten',
          'es' => 'Tarjetas',
          'fr' => 'Cartes',
          'it' => 'Carte',
          'pt' => 'Cartões',
          _ => 'Cards',
        };
      case PaynCategory.transfers:
        return switch (languageCode) {
          'de' => 'Geld senden',
          'es' => 'Enviar dinero',
          'fr' => "Envoyer de l'argent",
          'it' => 'Inviare denaro',
          'pt' => 'Enviar dinheiro',
          _ => 'Sending money',
        };
      case PaynCategory.exchange:
        return switch (languageCode) {
          'de' => 'Währungswechsel',
          'es' => 'Cambio de divisas',
          'fr' => 'Change',
          'it' => 'Cambio valuta',
          'pt' => 'Câmbio',
          _ => 'Currency exchange',
        };
      case PaynCategory.insurance:
        return switch (languageCode) {
          'de' => 'Versicherung',
          'es' => 'Seguros',
          'fr' => 'Assurance',
          'it' => 'Assicurazione',
          'pt' => 'Seguros',
          _ => 'Insurance',
        };
      case PaynCategory.investments:
        return switch (languageCode) {
          'de' => 'Anlegen',
          'es' => 'Invertir',
          'fr' => 'Investir',
          'it' => 'Investire',
          'pt' => 'Investir',
          _ => 'Investing',
        };
      case PaynCategory.banking:
        return switch (languageCode) {
          'de' => 'Bankkonten',
          'es' => 'Cuentas bancarias',
          'fr' => 'Comptes bancaires',
          'it' => 'Conti bancari',
          'pt' => 'Contas bancárias',
          _ => 'Bank accounts',
        };
      case PaynCategory.savings:
        return switch (languageCode) {
          'de' => 'Sparen',
          'es' => 'Ahorrar',
          'fr' => 'Épargner',
          'it' => 'Risparmiare',
          'pt' => 'Poupar',
          _ => 'Saving',
        };
      case PaynCategory.crypto:
        return switch (languageCode) {
          'de' => 'Krypto',
          'es' => 'Cripto',
          _ => 'Crypto',
        };
      case PaynCategory.business:
        return switch (languageCode) {
          'de' => 'Business',
          'es' => 'Negocio',
          _ => 'Business',
        };
      case PaynCategory.budgeting:
        return switch (languageCode) {
          'de' => 'Budget',
          'es' => 'Presupuesto',
          _ => 'Budgeting',
        };
      case PaynCategory.kids:
        return switch (languageCode) {
          'de' => 'Kinder',
          'es' => 'Niños',
          _ => 'Kids',
        };
    }
  }

  String _interestLabel(String interest, String languageCode) {
    switch (interest) {
      case 'travel':
        return switch (languageCode) {
          'de' => 'Reisen',
          'es' => 'Viajes',
          _ => 'Travel',
        };
      case 'savings':
        return switch (languageCode) {
          'de' => 'Sparen',
          'es' => 'Ahorro',
          _ => 'Savings',
        };
      case 'crypto':
        return switch (languageCode) {
          'de' => 'Krypto',
          'es' => 'Cripto',
          _ => 'Crypto',
        };
      case 'international_transfers':
        return switch (languageCode) {
          'de' => 'Internationale Überweisungen',
          'es' => 'Transferencias internacionales',
          _ => 'International transfers',
        };
      case 'investing':
        return switch (languageCode) {
          'de' => 'Investieren',
          'es' => 'Inversión',
          _ => 'Investing',
        };
      case 'insurance':
        return switch (languageCode) {
          'de' => 'Versicherung',
          'es' => 'Seguros',
          _ => 'Insurance',
        };
      case 'everyday_banking':
        return switch (languageCode) {
          'de' => 'Alltägliches Banking',
          'es' => 'Banca diaria',
          _ => 'Everyday banking',
        };
      default:
        return interest;
    }
  }

  bool _matchesMarket(PaynOffer offer, PaynMarket market) {
    final marketCode = marketDefinitions[market]!.marketCode;
    final codes = offer.countryCodes.map((item) => item.toUpperCase()).toSet();
    final euWideMatch =
        codes.contains('EU') ||
        codes.contains('ALL_EU') ||
        offer.attributes.availability == 'eu_wide';
    final internationalMatch = offer.attributes.availability == 'international';

    if (market == PaynMarket.eu) {
      return euWideMatch || internationalMatch || codes.length >= 4;
    }

    if (market == PaynMarket.international) {
      return euWideMatch ||
          codes.length >= 4 ||
          internationalMatch ||
          globallyRecognizedProviders.contains(offer.providerName);
    }

    return codes.contains(marketCode) || euWideMatch || internationalMatch;
  }

  bool _isDirectMarketMatch(PaynOffer offer, PaynMarket market) {
    final directCode = marketDefinitions[market]!.marketCode;
    return offer.countryCodes
        .map((item) => item.toUpperCase())
        .contains(directCode);
  }

  String _searchText(PaynOffer offer) {
    return <String>[
      offer.providerName,
      offer.title,
      offer.subtitle,
      offer.category.name,
      offer.attributes.subtype ?? '',
      ...offer.bestFor,
      ...offer.attributes.searchTags,
      ...offer.metrics.map((metric) => '${metric.label} ${metric.value}'),
    ].join(' ').toLowerCase();
  }

  double _freshnessBoost(PaynOffer offer) {
    final updatedAt = DateTime.tryParse(offer.updatedAt);
    if (updatedAt == null) {
      return 0;
    }

    final age = DateTime.now().difference(updatedAt).inDays;
    return math.max(0, 5 - age * 0.5).toDouble();
  }

  String? _metricValue(PaynOffer offer, List<String> labels) {
    for (final metric in offer.metrics) {
      if (labels.contains(metric.label)) {
        return metric.value;
      }
    }
    return null;
  }

  _NumberRange _metricRange(String? value) {
    if (value == null || value.isEmpty) {
      return const _NumberRange();
    }

    final matches = RegExp(r'(\d+(?:[.,]\d+)?)').allMatches(value);
    final numbers =
        matches
            .map(
              (match) => double.tryParse(match.group(1)!.replaceAll(',', '')),
            )
            .whereType<double>()
            .toList();

    if (numbers.isEmpty) {
      return const _NumberRange();
    }

    return _NumberRange(min: numbers.first, max: numbers.last);
  }

  static const List<PaynOffer> _fallbackOffers = <PaynOffer>[
    PaynOffer(
      id: 'loan-klarna-flex',
      slug: 'klarna-flexible-loan',
      category: PaynCategory.loans,
      countryCodes: <String>['DE', 'SE', 'FI', 'NO'],
      providerMark: 'KL',
      providerName: 'Klarna',
      title: 'Klarna Flexible Loan',
      subtitle:
          'Buy now, pay later pioneer offering flexible personal loans with instant decisions and no hidden fees across Nordic and DACH markets.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'APR', value: '3.9% - 11.9%'),
        PaynMetric(label: 'Amount', value: 'EUR 500 - 50,000'),
        PaynMetric(label: 'Term', value: '6 - 72 months'),
      ],
      bestFor: <String>['BNPL users', 'Instant decision', 'Flexible repayment'],
      providerWebsiteUrl: 'https://klarna.com',
      affiliateLink: 'https://klarna.com',
      affiliatePriorityScore: 0.95,
      updatedAt: '2026-03-24T00:00:00Z',
      attributes: PaynOfferAttributes(
        minAmount: 500,
        maxAmount: 50000,
        minTermMonths: 6,
        maxTermMonths: 72,
        feeProfile: 'medium',
        availability: 'regional',
        searchTags: <String>['personal loan', 'quick approval', 'repayment'],
      ),
    ),
    PaynOffer(
      id: 'loan-n26-personal',
      slug: 'n26-personal-loan',
      category: PaynCategory.loans,
      countryCodes: <String>['DE', 'ES', 'FR', 'IT', 'AT'],
      providerMark: 'N26',
      providerName: 'N26',
      title: 'N26 Personal Loan',
      subtitle:
          'Fully digital personal loan from one of Europe\'s leading neobanks. Apply in minutes, receive funds within 24 hours.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'APR', value: '4.5% - 12.5%'),
        PaynMetric(label: 'Amount', value: 'EUR 1,000 - 25,000'),
        PaynMetric(label: 'Term', value: '12 - 60 months'),
      ],
      bestFor: <String>[
        'Digital application',
        'Fast funding',
        'No branch needed',
      ],
      providerWebsiteUrl: 'https://n26.com',
      affiliateLink: 'https://n26.com',
      affiliatePriorityScore: 0.91,
      updatedAt: '2026-03-24T00:00:00Z',
      attributes: PaynOfferAttributes(
        minAmount: 1000,
        maxAmount: 25000,
        minTermMonths: 12,
        maxTermMonths: 60,
        feeProfile: 'medium',
        availability: 'regional',
        searchTags: <String>['digital loan', 'mobile banking', 'fast funding'],
      ),
    ),
    PaynOffer(
      id: 'loan-ing-personal',
      slug: 'ing-personal-loan',
      category: PaynCategory.loans,
      countryCodes: <String>['DE', 'NL', 'BE', 'ES'],
      providerMark: 'ING',
      providerName: 'ING',
      title: 'ING Personal Loan',
      subtitle:
          'Established European bank offering competitive rates with the trust of a tier-1 banking institution. Ideal for larger borrowing amounts.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'APR', value: '4.99% - 9.99%'),
        PaynMetric(label: 'Amount', value: 'EUR 5,000 - 65,000'),
        PaynMetric(label: 'Term', value: '24 - 84 months'),
      ],
      bestFor: <String>['Large amounts', 'Bank-grade trust', 'Long term'],
      providerWebsiteUrl: 'https://ing.com',
      affiliateLink: 'https://ing.com',
      affiliatePriorityScore: 0.86,
      updatedAt: '2026-03-22T00:00:00Z',
      attributes: PaynOfferAttributes(
        minAmount: 5000,
        maxAmount: 65000,
        minTermMonths: 24,
        maxTermMonths: 84,
        feeProfile: 'low',
        availability: 'regional',
        searchTags: <String>[
          'bank loan',
          'home improvements',
          'large purchase',
        ],
      ),
    ),
    PaynOffer(
      id: 'card-revolut-metal',
      slug: 'revolut-metal-card',
      category: PaynCategory.cards,
      countryCodes: <String>['UK', 'EU'],
      providerMark: 'RV',
      providerName: 'Revolut',
      title: 'Revolut Metal Card',
      subtitle:
          'Premium metal card with cashback on all spending, lounge access, and no FX fees on any currency. The fintech flagship card.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'Cashback', value: 'Up to 1%'),
        PaynMetric(label: 'FX Fee', value: '0%'),
        PaynMetric(label: 'Monthly fee', value: 'EUR 13.99'),
      ],
      bestFor: <String>['Travel', 'Cashback', 'No FX fees'],
      providerWebsiteUrl: 'https://revolut.com',
      affiliateLink: 'https://revolut.com',
      affiliatePriorityScore: 0.94,
      updatedAt: '2026-03-24T00:00:00Z',
      attributes: PaynOfferAttributes(
        feeProfile: 'premium',
        availability: 'international',
        searchTags: <String>['cashback', 'travel perks', 'lounge access'],
      ),
    ),
    PaynOffer(
      id: 'card-n26-you',
      slug: 'n26-you-card',
      category: PaynCategory.cards,
      countryCodes: <String>['DE', 'ES', 'FR', 'IT', 'AT'],
      providerMark: 'N26',
      providerName: 'N26',
      title: 'N26 You Card',
      subtitle:
          'Premium debit card with travel insurance, free ATM withdrawals worldwide, and no FX markup. Available in custom colors.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'FX Fee', value: '0%'),
        PaynMetric(label: 'ATM', value: 'Free worldwide'),
        PaynMetric(label: 'Monthly fee', value: 'EUR 9.90'),
      ],
      bestFor: <String>['Travel insurance', 'Free ATM', 'Custom design'],
      providerWebsiteUrl: 'https://n26.com',
      affiliateLink: 'https://n26.com',
      affiliatePriorityScore: 0.89,
      updatedAt: '2026-03-24T00:00:00Z',
      attributes: PaynOfferAttributes(
        feeProfile: 'premium',
        availability: 'regional',
        searchTags: <String>['travel insurance', 'atm', 'spending abroad'],
      ),
    ),
    PaynOffer(
      id: 'card-wise-debit',
      slug: 'wise-debit-card',
      category: PaynCategory.cards,
      countryCodes: <String>['UK', 'EU'],
      providerMark: 'WS',
      providerName: 'Wise',
      title: 'Wise Multi-Currency Card',
      subtitle:
          'Hold and spend in 40+ currencies at the real exchange rate. No annual fee, transparent conversion at the mid-market rate.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'FX Fee', value: '0.35% - 1%'),
        PaynMetric(label: 'Currencies', value: '40+'),
        PaynMetric(label: 'Annual fee', value: 'EUR 0'),
      ],
      bestFor: <String>['Multi-currency', 'Mid-market rate', 'No annual fee'],
      providerWebsiteUrl: 'https://wise.com',
      affiliateLink: 'https://wise.com',
      affiliatePriorityScore: 0.92,
      updatedAt: '2026-03-24T00:00:00Z',
      attributes: PaynOfferAttributes(
        feeProfile: 'low',
        availability: 'international',
        searchTags: <String>[
          'multi-currency card',
          'mid-market rate',
          'travel',
        ],
      ),
    ),
    PaynOffer(
      id: 'transfer-wise-intl',
      slug: 'wise-international-transfer',
      category: PaynCategory.transfers,
      countryCodes: <String>['UK', 'EU'],
      providerMark: 'WS',
      providerName: 'Wise',
      title: 'Wise International Transfer',
      subtitle:
          'The gold standard for international money transfers. Real mid-market exchange rate with transparent, low fees shown upfront.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'Fee', value: 'From 0.41%'),
        PaynMetric(label: 'Speed', value: 'Minutes - 2 days'),
        PaynMetric(label: 'Corridors', value: '80+ countries'),
      ],
      bestFor: <String>['Best rates', 'Transparent fees', 'Fast delivery'],
      providerWebsiteUrl: 'https://wise.com',
      affiliateLink: 'https://wise.com',
      affiliatePriorityScore: 0.96,
      updatedAt: '2026-03-24T00:00:00Z',
      attributes: PaynOfferAttributes(
        feeProfile: 'low',
        availability: 'international',
        searchTags: <String>['cross-border', 'mid-market', 'bank transfer'],
      ),
    ),
    PaynOffer(
      id: 'transfer-revolut-send',
      slug: 'revolut-money-transfer',
      category: PaynCategory.transfers,
      countryCodes: <String>['UK', 'EU'],
      providerMark: 'RV',
      providerName: 'Revolut',
      title: 'Revolut Money Transfer',
      subtitle:
          'Send money to 150+ countries with competitive rates. Free transfers between Revolut users, instant delivery available.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'Fee', value: 'Free - 1.5%'),
        PaynMetric(label: 'Speed', value: 'Instant - 3 days'),
        PaynMetric(label: 'Corridors', value: '150+ countries'),
      ],
      bestFor: <String>['Free P2P', 'Wide coverage', 'App-based'],
      providerWebsiteUrl: 'https://revolut.com',
      affiliateLink: 'https://revolut.com',
      affiliatePriorityScore: 0.93,
      updatedAt: '2026-03-24T00:00:00Z',
      attributes: PaynOfferAttributes(
        feeProfile: 'medium',
        availability: 'international',
        searchTags: <String>['instant transfer', 'p2p', 'global payout'],
      ),
    ),
    PaynOffer(
      id: 'transfer-n26-moneybeam',
      slug: 'n26-moneybeam-transfer',
      category: PaynCategory.transfers,
      countryCodes: <String>['DE', 'ES', 'FR', 'IT', 'AT'],
      providerMark: 'N26',
      providerName: 'N26',
      title: 'N26 MoneyBeam',
      subtitle:
          'Instant transfers to other N26 users and SEPA transfers across Europe. Integrated directly into your N26 banking app.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'Fee', value: 'EUR 0 (SEPA)'),
        PaynMetric(label: 'Speed', value: 'Instant (N26)'),
        PaynMetric(label: 'Corridors', value: 'SEPA zone'),
      ],
      bestFor: <String>['SEPA transfers', 'Instant P2P', 'No fees'],
      providerWebsiteUrl: 'https://n26.com',
      affiliateLink: 'https://n26.com',
      affiliatePriorityScore: 0.84,
      updatedAt: '2026-03-23T00:00:00Z',
      attributes: PaynOfferAttributes(
        feeProfile: 'low',
        availability: 'regional',
        searchTags: <String>['sepa', 'peer to peer', 'banking app'],
      ),
    ),
    PaynOffer(
      id: 'exchange-wise-multi',
      slug: 'wise-multi-currency-account',
      category: PaynCategory.exchange,
      countryCodes: <String>['UK', 'EU'],
      providerMark: 'WS',
      providerName: 'Wise',
      title: 'Wise Multi-Currency Account',
      subtitle:
          'Hold and convert between 40+ currencies at the real mid-market rate. Set rate alerts and auto-convert when rates hit your target.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'Spread', value: '0% (mid-market)'),
        PaynMetric(label: 'Conversion fee', value: '0.35% - 1%'),
        PaynMetric(label: 'Currencies', value: '40+'),
      ],
      bestFor: <String>[
        'Mid-market rate',
        'Rate alerts',
        'Multi-currency hold',
      ],
      providerWebsiteUrl: 'https://wise.com',
      affiliateLink: 'https://wise.com',
      affiliatePriorityScore: 0.95,
      updatedAt: '2026-03-24T00:00:00Z',
      attributes: PaynOfferAttributes(
        feeProfile: 'low',
        availability: 'international',
        searchTags: <String>['rate alerts', 'currency hold', 'fx'],
      ),
    ),
    PaynOffer(
      id: 'exchange-revolut-fx',
      slug: 'revolut-currency-exchange',
      category: PaynCategory.exchange,
      countryCodes: <String>['UK', 'EU'],
      providerMark: 'RV',
      providerName: 'Revolut',
      title: 'Revolut Currency Exchange',
      subtitle:
          'Exchange 30+ currencies in-app with competitive rates. Free exchanges up to a monthly limit, weekend markup applies.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'Spread', value: '0% (weekday)'),
        PaynMetric(label: 'Free limit', value: 'EUR 1,000/mo'),
        PaynMetric(label: 'Currencies', value: '30+'),
      ],
      bestFor: <String>['Free exchanges', 'Instant conversion', 'App-based'],
      providerWebsiteUrl: 'https://revolut.com',
      affiliateLink: 'https://revolut.com',
      affiliatePriorityScore: 0.93,
      updatedAt: '2026-03-24T00:00:00Z',
      attributes: PaynOfferAttributes(
        feeProfile: 'medium',
        availability: 'international',
        searchTags: <String>['weekday rates', 'weekend markup', 'travel fx'],
      ),
    ),
    PaynOffer(
      id: 'exchange-n26-fx',
      slug: 'n26-currency-exchange',
      category: PaynCategory.exchange,
      countryCodes: <String>['DE', 'ES', 'FR', 'IT', 'AT'],
      providerMark: 'N26',
      providerName: 'N26',
      title: 'N26 Currency Exchange',
      subtitle:
          'In-app currency exchange for N26 customers powered by Wise. Competitive rates with transparent fee breakdown.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'Spread', value: 'Wise-powered'),
        PaynMetric(label: 'Conversion fee', value: 'From 0.5%'),
        PaynMetric(label: 'Currencies', value: '30+'),
      ],
      bestFor: <String>[
        'Wise rates in-app',
        'N26 integration',
        'No extra accounts',
      ],
      providerWebsiteUrl: 'https://n26.com',
      affiliateLink: 'https://n26.com',
      affiliatePriorityScore: 0.82,
      updatedAt: '2026-03-23T00:00:00Z',
      attributes: PaynOfferAttributes(
        feeProfile: 'medium',
        availability: 'regional',
        searchTags: <String>[
          'in-app exchange',
          'wise powered',
          'transparent fee',
        ],
      ),
    ),
    PaynOffer(
      id: 'insurance-allianz-life-protect',
      slug: 'allianz-life-protect',
      category: PaynCategory.insurance,
      countryCodes: <String>['DE', 'FR', 'IT', 'ES'],
      providerMark: 'AZ',
      providerName: 'Allianz',
      title: 'Allianz Life Protect',
      subtitle:
          'Life cover designed for long-term family protection with flexible monthly premiums and clear cover bands across major European markets.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'Cover', value: 'EUR 100,000 - 500,000'),
        PaynMetric(label: 'Monthly premium', value: 'EUR 19 - 62'),
        PaynMetric(label: 'Term', value: '5 - 30 years'),
      ],
      bestFor: <String>[
        'Family protection',
        'Long-term cover',
        'Established insurer',
      ],
      providerWebsiteUrl: 'https://www.allianz.com',
      affiliateLink: 'https://www.allianz.com',
      affiliatePriorityScore: 0.90,
      updatedAt: '2026-03-25T00:00:00Z',
      attributes: PaynOfferAttributes(
        subtype: 'life',
        feeProfile: 'medium',
        availability: 'regional',
        searchTags: <String>['life insurance', 'beneficiary', 'family cover'],
      ),
    ),
    PaynOffer(
      id: 'insurance-axa-health-essential',
      slug: 'axa-health-essential',
      category: PaynCategory.insurance,
      countryCodes: <String>['FR', 'ES', 'IT', 'DE'],
      providerMark: 'AXA',
      providerName: 'AXA',
      title: 'AXA Health Essential',
      subtitle:
          'Private health cover with digital claims, outpatient support, and a simple plan structure for people moving between large European markets.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'Cover', value: 'Outpatient and inpatient'),
        PaynMetric(label: 'Monthly premium', value: 'EUR 29 - 89'),
        PaynMetric(label: 'Waiting period', value: '30 days'),
      ],
      bestFor: <String>[
        'Health cover',
        'Digital claims',
        'Cross-border living',
      ],
      providerWebsiteUrl: 'https://www.axa.com',
      affiliateLink: 'https://www.axa.com',
      affiliatePriorityScore: 0.88,
      updatedAt: '2026-03-25T00:00:00Z',
      attributes: PaynOfferAttributes(
        subtype: 'health',
        feeProfile: 'medium',
        availability: 'regional',
        searchTags: <String>[
          'health insurance',
          'medical cover',
          'digital claims',
        ],
      ),
    ),
    PaynOffer(
      id: 'insurance-safetywing-nomad',
      slug: 'safetywing-nomad-insurance',
      category: PaynCategory.insurance,
      countryCodes: <String>['EU', 'UK'],
      providerMark: 'SW',
      providerName: 'SafetyWing',
      title: 'SafetyWing Nomad Insurance',
      subtitle:
          'Travel and remote work insurance for people moving across borders regularly, with monthly billing and flexible international coverage.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'Trip length', value: 'Rolling monthly cover'),
        PaynMetric(label: 'Cover', value: 'Travel medical and emergencies'),
        PaynMetric(label: 'Monthly premium', value: 'From EUR 45'),
      ],
      bestFor: <String>[
        'Remote workers',
        'Travel cover',
        'International movement',
      ],
      providerWebsiteUrl: 'https://safetywing.com',
      affiliateLink: 'https://safetywing.com',
      affiliatePriorityScore: 0.87,
      updatedAt: '2026-03-25T00:00:00Z',
      attributes: PaynOfferAttributes(
        subtype: 'travel',
        feeProfile: 'medium',
        availability: 'international',
        searchTags: <String>[
          'nomad',
          'travel insurance',
          'cross-border living',
        ],
      ),
    ),
    PaynOffer(
      id: 'investment-trade-republic-core',
      slug: 'trade-republic-core-invest',
      category: PaynCategory.investments,
      countryCodes: <String>['DE', 'ES', 'FR', 'IT', 'AT'],
      providerMark: 'TR',
      providerName: 'Trade Republic',
      title: 'Trade Republic Core Invest',
      subtitle:
          'Low-friction investing with ETF savings plans, stock access, and a clean mobile workflow for long-term retail investors.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'ETF trades', value: 'From EUR 1'),
        PaynMetric(label: 'Savings plan', value: 'From EUR 1'),
        PaynMetric(label: 'Markets', value: '9 exchanges'),
      ],
      bestFor: <String>['Stocks', 'ETF plans', 'Long-term investing'],
      providerWebsiteUrl: 'https://traderepublic.com',
      affiliateLink: 'https://traderepublic.com',
      affiliatePriorityScore: 0.92,
      updatedAt: '2026-03-25T00:00:00Z',
      attributes: PaynOfferAttributes(
        subtype: 'stocks',
        feeProfile: 'low',
        availability: 'regional',
        searchTags: <String>['stocks', 'etf', 'savings plan', 'broker'],
      ),
    ),
    PaynOffer(
      id: 'investment-scalable-prime',
      slug: 'scalable-capital-prime-broker',
      category: PaynCategory.investments,
      countryCodes: <String>['DE', 'FR', 'ES', 'IT', 'AT'],
      providerMark: 'SC',
      providerName: 'Scalable Capital',
      title: 'Scalable Capital Prime Broker',
      subtitle:
          'A brokerage and wealth platform combining broad ETF access with recurring investing and portfolio tools.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'ETF trades', value: 'From EUR 0.99'),
        PaynMetric(label: 'Savings plan', value: 'From EUR 1'),
        PaynMetric(label: 'Custody fee', value: 'EUR 0'),
      ],
      bestFor: <String>[
        'ETF investors',
        'Portfolio building',
        'Recurring plans',
      ],
      providerWebsiteUrl: 'https://de.scalable.capital',
      affiliateLink: 'https://de.scalable.capital',
      affiliatePriorityScore: 0.89,
      updatedAt: '2026-03-25T00:00:00Z',
      attributes: PaynOfferAttributes(
        subtype: 'platforms',
        feeProfile: 'low',
        availability: 'regional',
        searchTags: <String>['wealth platform', 'etf', 'portfolio'],
      ),
    ),
    PaynOffer(
      id: 'investment-etoro-multi-asset',
      slug: 'etoro-multi-asset-account',
      category: PaynCategory.investments,
      countryCodes: <String>['EU', 'UK'],
      providerMark: 'ET',
      providerName: 'eToro',
      title: 'eToro Multi-Asset Account',
      subtitle:
          'A single investing account for stocks, ETFs, and crypto with social discovery and strong cross-market availability.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'Access', value: 'Stocks, ETFs, crypto'),
        PaynMetric(label: 'Custody fee', value: 'EUR 0'),
        PaynMetric(label: 'Markets', value: 'Global listed markets'),
      ],
      bestFor: <String>[
        'Multi-asset',
        'Crypto access',
        'Cross-market investing',
      ],
      providerWebsiteUrl: 'https://www.etoro.com',
      affiliateLink: 'https://www.etoro.com',
      affiliatePriorityScore: 0.86,
      updatedAt: '2026-03-24T00:00:00Z',
      attributes: PaynOfferAttributes(
        subtype: 'platforms',
        feeProfile: 'medium',
        availability: 'international',
        searchTags: <String>[
          'social investing',
          'stocks',
          'crypto',
          'platform',
        ],
      ),
    ),
    PaynOffer(
      id: 'investment-kraken-crypto-access',
      slug: 'kraken-crypto-access',
      category: PaynCategory.investments,
      countryCodes: <String>['EU', 'UK'],
      providerMark: 'KR',
      providerName: 'Kraken',
      title: 'Kraken Crypto Access',
      subtitle:
          'Crypto trading access for BTC and ETH with lower-fee exchange routes and stronger pro tooling for active investors.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'Access', value: 'BTC, ETH and major crypto pairs'),
        PaynMetric(label: 'Fee model', value: 'Low-fee exchange pricing'),
        PaynMetric(label: 'Platform', value: 'Advanced trading tools'),
      ],
      bestFor: <String>['Crypto', 'BTC', 'ETH', 'Low fees', 'Pro tools'],
      providerWebsiteUrl: 'https://www.kraken.com',
      affiliateLink: 'https://www.financeads.net/tc.php?t=83248C5666133898T',
      affiliatePriorityScore: 0.90,
      updatedAt: '2026-04-30T00:00:00Z',
      attributes: PaynOfferAttributes(
        subtype: 'crypto',
        feeProfile: 'low',
        availability: 'international',
        affiliate: true,
        monetized: true,
        searchTags: <String>['crypto', 'btc', 'eth', 'low fees', 'pro tools'],
      ),
    ),
    PaynOffer(
      id: 'investment-linxea-avenir-2',
      slug: 'linxea-avenir-2',
      category: PaynCategory.investments,
      countryCodes: <String>['FR'],
      providerMark: 'LX',
      providerName: 'Linxea',
      title: 'Linxea Avenir 2',
      subtitle:
          'French assurance vie option for long-term savings and investment insurance positioning with tax-efficient wrappers.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'Product type', value: 'Assurance vie'),
        PaynMetric(label: 'Market', value: 'France'),
        PaynMetric(
          label: 'Positioning',
          value: 'Long-term tax-efficient savings',
        ),
      ],
      bestFor: <String>[
        'Assurance vie',
        'Long-term savings',
        'France',
        'Investment insurance',
        'Tax-efficient savings',
      ],
      providerWebsiteUrl: 'https://www.linxea.com',
      affiliateLink: 'https://www.financeads.net/tc.php?t=83248C432495606T',
      affiliatePriorityScore: 0.85,
      updatedAt: '2026-04-30T00:00:00Z',
      attributes: PaynOfferAttributes(
        subtype: 'assurance_vie',
        feeProfile: 'low',
        availability: 'local',
        affiliate: true,
        monetized: true,
        searchTags: <String>[
          'assurance vie',
          'long-term savings',
          'france',
          'investment insurance',
          'tax-efficient savings',
        ],
      ),
    ),
    PaynOffer(
      id: 'investment-iuvo-p2p-investing',
      slug: 'iuvo-p2p-investing',
      category: PaynCategory.investments,
      countryCodes: <String>['DE', 'EU'],
      providerMark: 'IV',
      providerName: 'Iuvo Group',
      title: 'Iuvo P2P Investing',
      subtitle:
          'P2P investment platform offering fixed-income style marketplace access with diversified loan portfolio exposure.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'Access', value: 'Diversified P2P loan portfolios'),
        PaynMetric(
          label: 'Return style',
          value: 'Fixed-income marketplace exposure',
        ),
        PaynMetric(label: 'Market', value: 'Germany and EU availability'),
      ],
      bestFor: <String>[
        'P2P',
        'Passive income',
        'Fixed returns',
        'Lending marketplace',
        'EU investing',
      ],
      providerWebsiteUrl: 'https://iuvo-group.com',
      affiliateLink: 'https://www.financeads.net/tc.php?t=83248C226841413T',
      affiliatePriorityScore: 0.84,
      updatedAt: '2026-04-30T00:00:00Z',
      attributes: PaynOfferAttributes(
        subtype: 'p2p',
        feeProfile: 'medium',
        availability: 'eu_wide',
        affiliate: true,
        monetized: true,
        searchTags: <String>[
          'p2p',
          'passive income',
          'fixed returns',
          'lending marketplace',
          'eu investing',
        ],
      ),
    ),
    PaynOffer(
      id: 'investment-trezor-hardware-wallet',
      slug: 'trezor-hardware-wallet',
      category: PaynCategory.investments,
      countryCodes: <String>['EU', 'UK'],
      providerMark: 'TZ',
      providerName: 'Trezor',
      title: 'Trezor Hardware Wallet',
      subtitle:
          'Secure offline hardware wallet for BTC, ETH, and broader crypto self-custody when storage security matters most.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'Security', value: 'Offline cold storage'),
        PaynMetric(label: 'Assets', value: 'BTC, ETH and supported crypto'),
        PaynMetric(label: 'Use case', value: 'Hardware wallet self-custody'),
      ],
      bestFor: <String>[
        'Crypto',
        'Security',
        'Hardware wallet',
        'BTC',
        'Cold storage',
      ],
      providerWebsiteUrl: 'https://trezor.io',
      affiliateLink: 'https://www.financeads.net/tc.php?t=83248C5142119968T',
      affiliatePriorityScore: 0.82,
      updatedAt: '2026-04-30T00:00:00Z',
      attributes: PaynOfferAttributes(
        subtype: 'crypto_wallet',
        feeProfile: 'medium',
        availability: 'international',
        affiliate: true,
        monetized: true,
        searchTags: <String>[
          'crypto',
          'security',
          'hardware wallet',
          'btc',
          'cold storage',
        ],
      ),
    ),

    // ── SAVINGS (easy-access) ──────────────────────────────────────────────
    PaynOffer(
      id: 'savings-trade-republic',
      slug: 'trade-republic-savings',
      category: PaynCategory.savings,
      countryCodes: <String>['DE', 'AT', 'ES', 'FR', 'IT', 'PT', 'NL', 'BE'],
      providerMark: 'TR',
      providerName: 'Trade Republic',
      title: 'Trade Republic Savings',
      subtitle:
          '4% interest on uninvested cash with daily accrual. Backed by Deutsche Bank and BaFin regulated. No minimum deposit required.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'Interest rate', value: '4.0% per year'),
        PaynMetric(label: 'Access', value: 'Instant'),
        PaynMetric(label: 'Deposit protection', value: 'EUR 100,000'),
      ],
      bestFor: <String>['High yield', 'No minimum', 'Daily interest'],
      providerWebsiteUrl: 'https://traderepublic.com/en-de/cash',
      affiliateLink: 'https://traderepublic.com/en-de/cash',
      affiliatePriorityScore: 0.96,
      updatedAt: '2026-05-01T00:00:00Z',
      attributes: PaynOfferAttributes(
        accessType: 'easy-access',
        minDeposit: 'EUR 1',
        feeProfile: 'low',
        availability: 'eu_wide',
        searchTags: <String>['savings', 'high yield', 'interest'],
      ),
    ),
    PaynOffer(
      id: 'savings-raisin-eu',
      slug: 'raisin-savings',
      category: PaynCategory.savings,
      countryCodes: <String>['DE', 'AT', 'ES', 'FR', 'IT', 'PT', 'NL'],
      providerMark: 'RS',
      providerName: 'Raisin',
      title: 'Raisin Savings Marketplace',
      subtitle:
          "Europe's leading deposit marketplace. Access savings accounts from 100+ European banks through one platform. Compare rates and switch instantly.",
      metrics: <PaynMetric>[
        PaynMetric(label: 'Interest rate', value: 'Up to 4.5% per year'),
        PaynMetric(label: 'Access', value: 'Instant — switch banks any time'),
        PaynMetric(
          label: 'Deposit protection',
          value: 'Up to EUR 100,000 per bank',
        ),
      ],
      bestFor: <String>[
        'Best rates in Europe',
        'Multiple banks',
        'EUR 1,000+ deposits',
      ],
      providerWebsiteUrl: 'https://www.raisin.com/en-eu/savings/',
      affiliateLink: 'https://www.raisin.com/en-eu/savings/',
      affiliatePriorityScore: 0.92,
      updatedAt: '2026-05-01T00:00:00Z',
      attributes: PaynOfferAttributes(
        accessType: 'easy-access',
        minDeposit: 'EUR 1,000',
        feeProfile: 'low',
        availability: 'eu_wide',
        searchTags: <String>['savings', 'deposit', 'best rates'],
      ),
    ),
    PaynOffer(
      id: 'savings-revolut-savings',
      slug: 'revolut-savings',
      category: PaynCategory.savings,
      countryCodes: <String>['EU', 'UK'],
      providerMark: 'R',
      providerName: 'Revolut',
      title: 'Revolut Savings Vault',
      subtitle:
          'Flexible savings pocket within your Revolut app. Rates vary by currency and plan; instant access, no lock-in.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'EUR rate (Metal)', value: 'Up to 1.96% AER'),
        PaynMetric(label: 'GBP rate (Metal)', value: 'Up to 3.64% AER'),
        PaynMetric(label: 'Access', value: 'Instant'),
      ],
      bestFor: <String>['Revolut users', 'Instant access', 'No lock-in'],
      providerWebsiteUrl: 'https://www.revolut.com/savings/',
      affiliateLink: 'https://www.revolut.com/savings/',
      affiliatePriorityScore: 0.83,
      updatedAt: '2026-05-01T00:00:00Z',
      attributes: PaynOfferAttributes(
        accessType: 'easy-access',
        minDeposit: 'EUR 1',
        feeProfile: 'low',
        availability: 'eu_wide',
        searchTags: <String>['savings', 'revolut', 'flexible'],
      ),
    ),
    PaynOffer(
      id: 'savings-n26-savings',
      slug: 'n26-savings',
      category: PaynCategory.savings,
      countryCodes: <String>['DE', 'AT', 'ES', 'FR', 'IT'],
      providerMark: 'N26',
      providerName: 'N26',
      title: 'N26 Savings',
      subtitle:
          'Savings account built into N26 banking app. Instant access, no fees, and backed by German deposit protection up to EUR 100,000.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'Interest rate', value: 'Up to 4.0% AER'),
        PaynMetric(label: 'Access', value: 'Instant'),
        PaynMetric(label: 'Deposit protection', value: 'EUR 100,000'),
      ],
      bestFor: <String>[
        'N26 customers',
        'German deposit protection',
        'No fees',
      ],
      providerWebsiteUrl: 'https://n26.com/en-eu/compare-bank-accounts',
      affiliateLink: 'https://n26.com/en-eu/compare-bank-accounts',
      affiliatePriorityScore: 0.79,
      updatedAt: '2026-05-01T00:00:00Z',
      attributes: PaynOfferAttributes(
        accessType: 'easy-access',
        minDeposit: 'EUR 1',
        feeProfile: 'low',
        availability: 'eu_wide',
        searchTags: <String>['savings', 'N26', 'Germany'],
      ),
    ),
    PaynOffer(
      id: 'savings-lightyear',
      slug: 'lightyear-savings',
      category: PaynCategory.savings,
      countryCodes: <String>['UK', 'EU'],
      providerMark: 'LY',
      providerName: 'Lightyear',
      title: 'Lightyear Cash Account',
      subtitle:
          'Yield on idle cash via money-market funds, accessible inside the same app you use for stocks and ETFs. Note: held in MMFs, not as a bank deposit.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'USD rate', value: 'Up to 3.75% (variable)'),
        PaynMetric(label: 'EUR rate', value: '1.94% AER (variable)'),
        PaynMetric(
          label: 'Protection',
          value: '€20,000 IPSF (MMF, not FSCS deposit)',
        ),
      ],
      bestFor: <String>['Investors', 'Multi-currency cash', 'UK/EU residents'],
      providerWebsiteUrl: 'https://lightyear.com/gb/invest',
      affiliateLink: 'https://lightyear.com/gb/invest',
      affiliatePriorityScore: 0.77,
      updatedAt: '2026-05-01T00:00:00Z',
      attributes: PaynOfferAttributes(
        accessType: 'easy-access',
        feeProfile: 'low',
        availability: 'eu_wide',
        searchTags: <String>['savings', 'cash account', 'interest'],
      ),
    ),
    PaynOffer(
      id: 'savings-vivid-prime',
      slug: 'vivid-savings',
      category: PaynCategory.savings,
      countryCodes: <String>['DE', 'FR', 'ES', 'IT'],
      providerMark: 'VV',
      providerName: 'Vivid Money',
      title: 'Vivid Savings',
      subtitle:
          'Earn up to 4% interest on EUR savings through Vivid Prime. Access your funds any time with no minimum deposit.',
      metrics: <PaynMetric>[
        PaynMetric(label: 'Interest rate', value: 'Up to 4.0%'),
        PaynMetric(label: 'Access', value: 'Instant'),
        PaynMetric(label: 'Plan required', value: 'Vivid Prime (EUR 9.90/month)'),
      ],
      bestFor: <String>[
        'Cashback + savings combo',
        'EU residents',
        'Vivid users',
      ],
      providerWebsiteUrl: 'https://vivid.money/en-de/pricing/',
      affiliateLink: 'https://vivid.money/en-de/pricing/',
      affiliatePriorityScore: 0.73,
      updatedAt: '2026-05-01T00:00:00Z',
      attributes: PaynOfferAttributes(
        accessType: 'easy-access',
        minDeposit: 'EUR 1',
        feeProfile: 'medium',
        availability: 'eu_wide',
        searchTags: <String>['savings', 'Vivid', 'interest'],
      ),
    ),

    // ── SAVINGS (fixed-term deposits) ─────────────────────────────────────
    PaynOffer(
      id: 'savings-raisin-festgeld',
      slug: 'raisin-festgeld',
      category: PaynCategory.savings,
      countryCodes: <String>['DE', 'AT', 'ES', 'FR', 'IT', 'PT', 'NL'],
      providerMark: 'RS',
      providerName: 'Raisin',
      title: 'Raisin Festgeld (fixed-term deposit)',
      subtitle:
          'One-click access to fixed-term deposits from 100+ European partner banks. Lock in 1-, 2-, 3-, or 5-year rates without opening separate accounts.',
      metrics: <PaynMetric>[
        PaynMetric(
          label: '1-year rate',
          value: 'Up to 3.10% p.a. (variable per bank)',
        ),
        PaynMetric(label: 'Term length', value: '1 / 2 / 3 / 5 years'),
        PaynMetric(label: 'Minimum deposit', value: 'EUR 1,000'),
        PaynMetric(
          label: 'Deposit protection',
          value: 'Up to EUR 100,000 per bank (EU DGS)',
        ),
      ],
      bestFor: <String>[
        'Locked-in rate',
        'Best of 100+ banks',
        'EUR 1,000+ savings',
      ],
      providerWebsiteUrl: 'https://www.raisin.com/en-eu/fixed-term-deposit/',
      affiliateLink: 'https://www.raisin.com/en-eu/fixed-term-deposit/',
      affiliatePriorityScore: 0.90,
      updatedAt: '2026-05-01T00:00:00Z',
      attributes: PaynOfferAttributes(
        accessType: 'fixed-term',
        minDeposit: 'EUR 1,000',
        minTermMonths: 12,
        maxTermMonths: 60,
        feeProfile: 'low',
        availability: 'eu_wide',
        searchTags: <String>['fixed-term', 'Festgeld', 'deposit', 'fixed rate'],
      ),
    ),
    PaynOffer(
      id: 'savings-klarna-festgeld',
      slug: 'klarna-festgeld',
      category: PaynCategory.savings,
      countryCodes: <String>['DE'],
      providerMark: 'K',
      providerName: 'Klarna',
      title: 'Klarna Festgeld',
      subtitle:
          "Fixed-term deposit from Klarna's Swedish banking entity. Lock in a guaranteed rate for 1–4 years with Swedish deposit protection.",
      metrics: <PaynMetric>[
        PaynMetric(
          label: '1-year rate',
          value: 'Up to 2.85% p.a. (variable)',
        ),
        PaynMetric(label: 'Term length', value: '1 / 2 / 3 / 4 years'),
        PaynMetric(label: 'Minimum deposit', value: 'EUR 1'),
        PaynMetric(
          label: 'Deposit protection',
          value: 'EUR 100,000 (Swedish DGS via Klarna Bank AB)',
        ),
      ],
      bestFor: <String>['No minimum', 'Familiar brand DE', 'Fixed return'],
      providerWebsiteUrl: 'https://www.klarna.com/de/festgeld/',
      affiliateLink: 'https://www.klarna.com/de/festgeld/',
      affiliatePriorityScore: 0.82,
      updatedAt: '2026-05-01T00:00:00Z',
      attributes: PaynOfferAttributes(
        accessType: 'fixed-term',
        minDeposit: 'EUR 1',
        minTermMonths: 12,
        maxTermMonths: 48,
        feeProfile: 'low',
        availability: 'local',
        searchTags: <String>['Festgeld', 'Klarna', 'fixed-term'],
      ),
    ),
    PaynOffer(
      id: 'savings-myinvestor-deposito',
      slug: 'myinvestor-deposito',
      category: PaynCategory.savings,
      countryCodes: <String>['ES'],
      providerMark: 'MI',
      providerName: 'MyInvestor',
      title: 'MyInvestor Depósito a Plazo Fijo',
      subtitle:
          'Spanish fixed-term deposit from MyInvestor (Andbank-backed). 12-month locked rate with Spanish FGD deposit protection.',
      metrics: <PaynMetric>[
        PaynMetric(
          label: '12-month rate',
          value: 'Up to 2.75% TAE (variable)',
        ),
        PaynMetric(label: 'Term length', value: '12 months'),
        PaynMetric(label: 'Minimum deposit', value: 'EUR 10,000'),
        PaynMetric(label: 'Deposit protection', value: 'EUR 100,000 (Spanish FGD)'),
      ],
      bestFor: <String>[
        'Spanish residents',
        'Locked-in rate',
        'Tax-resident in ES',
      ],
      providerWebsiteUrl: 'https://myinvestor.es/ahorro/deposito-a-plazo/',
      affiliateLink: 'https://myinvestor.es/ahorro/deposito-a-plazo/',
      affiliatePriorityScore: 0.78,
      updatedAt: '2026-05-01T00:00:00Z',
      attributes: PaynOfferAttributes(
        accessType: 'fixed-term',
        minDeposit: 'EUR 10,000',
        minTermMonths: 12,
        maxTermMonths: 12,
        feeProfile: 'low',
        availability: 'local',
        searchTags: <String>['depósito', 'plazo fijo', 'MyInvestor', 'ES'],
      ),
    ),
    PaynOffer(
      id: 'savings-illimity-conto-deposito',
      slug: 'illimity-conto-deposito',
      category: PaynCategory.savings,
      countryCodes: <String>['IT'],
      providerMark: 'IL',
      providerName: 'Illimity Bank',
      title: 'Illimity Conto Deposito',
      subtitle:
          'Italian online-only fixed-term deposit from Illimity. Choose tenor from 6 to 60 months with Italian FITD deposit protection.',
      metrics: <PaynMetric>[
        PaynMetric(
          label: '12-month rate',
          value: 'Up to 2.90% lordo (variable)',
        ),
        PaynMetric(label: 'Term length', value: '6 / 12 / 24 / 36 / 60 months'),
        PaynMetric(label: 'Minimum deposit', value: 'EUR 1,000'),
        PaynMetric(label: 'Deposit protection', value: 'EUR 100,000 (Italian FITD)'),
      ],
      bestFor: <String>[
        'Italian residents',
        'Online-only',
        'Flexible tenor',
      ],
      providerWebsiteUrl:
          'https://www.illimitybank.com/it/private/conto-deposito',
      affiliateLink:
          'https://www.illimitybank.com/it/private/conto-deposito',
      affiliatePriorityScore: 0.76,
      updatedAt: '2026-05-01T00:00:00Z',
      attributes: PaynOfferAttributes(
        accessType: 'fixed-term',
        minDeposit: 'EUR 1,000',
        minTermMonths: 6,
        maxTermMonths: 60,
        feeProfile: 'low',
        availability: 'local',
        searchTags: <String>['conto deposito', 'Illimity', 'IT', 'fixed-term'],
      ),
    ),
    PaynOffer(
      id: 'savings-distingo-livret',
      slug: 'distingo-livret',
      category: PaynCategory.savings,
      countryCodes: <String>['FR'],
      providerMark: 'DB',
      providerName: 'Distingo Bank',
      title: 'Distingo Compte à Terme',
      subtitle:
          'French fixed-term deposit from Distingo Bank (PSA Banque Finance). Lock in a guaranteed rate for 1, 2, 3, or 5 years.',
      metrics: <PaynMetric>[
        PaynMetric(label: '1-year rate', value: 'Up to 2.60% brut (variable)'),
        PaynMetric(label: 'Term length', value: '1 / 2 / 3 / 5 years'),
        PaynMetric(label: 'Minimum deposit', value: 'EUR 1,000'),
        PaynMetric(label: 'Deposit protection', value: 'EUR 100,000 (French FGDR)'),
      ],
      bestFor: <String>[
        'French residents',
        'Locked-in rate',
        'Complement to Livret A',
      ],
      providerWebsiteUrl: 'https://www.distingo.fr/compte-a-terme',
      affiliateLink: 'https://www.distingo.fr/compte-a-terme',
      affiliatePriorityScore: 0.74,
      updatedAt: '2026-05-01T00:00:00Z',
      attributes: PaynOfferAttributes(
        accessType: 'fixed-term',
        minDeposit: 'EUR 1,000',
        minTermMonths: 12,
        maxTermMonths: 60,
        feeProfile: 'low',
        availability: 'local',
        searchTags: <String>['compte à terme', 'Distingo', 'FR', 'fixed-term'],
      ),
    ),
    PaynOffer(
      id: 'savings-nsi-bonds',
      slug: 'nsi-guaranteed-bonds',
      category: PaynCategory.savings,
      countryCodes: <String>['UK'],
      providerMark: 'NSI',
      providerName: 'NS&I',
      title: 'NS&I Guaranteed Growth Bonds (1-Year)',
      subtitle:
          'UK-government-backed fixed-term bonds from NS&I. 100% capital protected — backed by HM Treasury, no FSCS cap.',
      metrics: <PaynMetric>[
        PaynMetric(label: '1-year rate', value: 'Up to 3.95% AER (variable)'),
        PaynMetric(label: 'Term length', value: '1 / 2 / 3 / 5 years'),
        PaynMetric(label: 'Minimum deposit', value: 'GBP 500'),
        PaynMetric(
          label: 'Protection',
          value: '100% HM Treasury backed (no FSCS cap)',
        ),
      ],
      bestFor: <String>[
        'UK residents',
        'Above-FSCS-cap savers',
        'Government guarantee',
      ],
      providerWebsiteUrl:
          'https://www.nsandi.com/products/guaranteed-growth-bonds',
      affiliateLink:
          'https://www.nsandi.com/products/guaranteed-growth-bonds',
      affiliatePriorityScore: 0.85,
      updatedAt: '2026-05-01T00:00:00Z',
      attributes: PaynOfferAttributes(
        accessType: 'fixed-term',
        minDeposit: 'GBP 500',
        minTermMonths: 12,
        maxTermMonths: 60,
        feeProfile: 'low',
        availability: 'local',
        searchTags: <String>['bonds', 'NS&I', 'UK', 'fixed-term', 'government'],
      ),
    ),
  ];
}
