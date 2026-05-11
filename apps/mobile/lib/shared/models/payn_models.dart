enum PaynCategory {
  loans,
  cards,
  banking,
  transfers,
  exchange,
  insurance,
  investments,
  crypto,
  business,
  budgeting,
  kids,
}

extension PaynCategoryLabel on PaynCategory {
  String get label {
    switch (this) {
      case PaynCategory.loans:
        return 'Loans';
      case PaynCategory.cards:
        return 'Credit Cards';
      case PaynCategory.banking:
        return 'Banking';
      case PaynCategory.transfers:
        return 'Money Transfers';
      case PaynCategory.exchange:
        return 'Exchange';
      case PaynCategory.insurance:
        return 'Insurance';
      case PaynCategory.investments:
        return 'Investments';
      case PaynCategory.crypto:
        return 'Crypto';
      case PaynCategory.business:
        return 'Business Banking';
      case PaynCategory.budgeting:
        return 'Budgeting & Finance';
      case PaynCategory.kids:
        return 'Kids & Family';
    }
  }

  String get slug {
    switch (this) {
      case PaynCategory.loans:       return 'loans';
      case PaynCategory.cards:       return 'cards';
      case PaynCategory.banking:     return 'banking';
      case PaynCategory.transfers:   return 'transfers';
      case PaynCategory.exchange:    return 'exchange';
      case PaynCategory.insurance:   return 'insurance';
      case PaynCategory.investments: return 'investments';
      case PaynCategory.crypto:      return 'crypto';
      case PaynCategory.business:    return 'business';
      case PaynCategory.budgeting:   return 'budgeting';
      case PaynCategory.kids:        return 'kids';
    }
  }

  static PaynCategory? fromSlug(String slug) {
    for (final cat in PaynCategory.values) {
      if (cat.slug == slug) return cat;
    }
    return null;
  }
}

enum PaynMarket { eu, international, de, es, uk, fr, it, pt, nl }

enum ProfileType { personal, freelancer, business }

extension ProfileTypeLabel on ProfileType {
  String get label {
    switch (this) {
      case ProfileType.personal:
        return 'Personal';
      case ProfileType.freelancer:
        return 'Freelancer';
      case ProfileType.business:
        return 'Business';
    }
  }
}

class PaynMetric {
  const PaynMetric({required this.label, required this.value});

  factory PaynMetric.fromJson(Map<String, dynamic> json) {
    return PaynMetric(
      label: (json['label'] as String? ?? '').trim(),
      value: (json['value'] as String? ?? '').trim(),
    );
  }

  final String label;
  final String value;
}

class PaynOfferAttributes {
  const PaynOfferAttributes({
    this.subtype,
    this.insuranceType,
    this.minAmount,
    this.maxAmount,
    this.minTermMonths,
    this.maxTermMonths,
    this.speed,
    this.feeProfile,
    this.riskProfile,
    this.availability,
    this.isPartner = false,
    this.affiliate = false,
    this.monetized = false,
    this.searchTags = const <String>[],
    this.supportedAssets = const <String>[],
    this.accessType,
    this.estimatedCostLabel,
    this.feeModel,
    this.estimatedSpreadRange,
    this.recurringSupported,
    this.minimumOrder,
    this.notes,
    this.sourceUrl,
    this.dataSource,
    this.lastCheckedAt,
    this.confidenceScore,
    this.informational = false,
    this.priceAmount,
    this.coverageAmount,
    this.medicalCoverage,
    this.deductibleAmount,
    this.maxTripDays,
    this.regionCoverage,
    this.activityLevel,
    this.visaCompliant,
    this.instantActivation,
    this.comparisonHighlights = const <String>[],
    this.cardType,
    this.annualFeeAmount,
    this.fxFeePercent,
    this.atmFreeLimit,
    this.cashbackPercent,
    this.cryptoSupport,
    this.beginnerFriendly,
    this.platformUxLevel,
    this.minDeposit,
    this.assetsAvailableLabel,
  });

  factory PaynOfferAttributes.fromJson(Map<String, dynamic>? json) {
    final data = json ?? <String, dynamic>{};
    return PaynOfferAttributes(
      subtype: data['subtype'] as String?,
      insuranceType: data['insuranceType'] as String?,
      minAmount: (data['minAmount'] as num?)?.toInt(),
      maxAmount: (data['maxAmount'] as num?)?.toInt(),
      minTermMonths: (data['minTermMonths'] as num?)?.toInt(),
      maxTermMonths: (data['maxTermMonths'] as num?)?.toInt(),
      speed: data['speed'] as String?,
      feeProfile: data['feeProfile'] as String?,
      riskProfile: data['riskProfile'] as String?,
      availability: data['availability'] as String?,
      isPartner: data['isPartner'] as bool? ?? false,
      affiliate: data['affiliate'] as bool? ?? false,
      monetized: data['monetized'] as bool? ?? false,
      searchTags:
          (data['searchTags'] as List<dynamic>? ?? const <dynamic>[])
              .map((value) => value.toString())
              .toList(),
      supportedAssets:
          (data['supportedAssets'] as List<dynamic>? ?? const <dynamic>[])
              .map((value) => value.toString())
              .toList(),
      accessType: data['accessType'] as String?,
      estimatedCostLabel: data['estimatedCostLabel'] as String?,
      feeModel: data['feeModel'] as String?,
      estimatedSpreadRange: data['estimatedSpreadRange'] as String?,
      recurringSupported: data['recurringSupported'] as bool?,
      minimumOrder: data['minimumOrder'] as String?,
      notes: data['notes'] as String?,
      sourceUrl: data['sourceUrl'] as String?,
      dataSource: data['dataSource'] as String?,
      lastCheckedAt: data['lastCheckedAt'] as String?,
      confidenceScore: (data['confidenceScore'] as num?)?.toDouble(),
      informational: data['informational'] as bool? ?? false,
      priceAmount: (data['priceAmount'] as num?)?.toDouble(),
      coverageAmount: (data['coverageAmount'] as num?)?.toDouble(),
      medicalCoverage: (data['medicalCoverage'] as num?)?.toDouble(),
      deductibleAmount: (data['deductibleAmount'] as num?)?.toDouble(),
      maxTripDays: (data['maxTripDays'] as num?)?.toInt(),
      regionCoverage: data['regionCoverage'] as String?,
      activityLevel: data['activityLevel'] as String?,
      visaCompliant: data['visaCompliant'] as bool?,
      instantActivation: data['instantActivation'] as bool?,
      comparisonHighlights:
          (data['comparisonHighlights'] as List<dynamic>? ?? const <dynamic>[])
              .map((value) => value.toString())
              .toList(),
      cardType: data['cardType'] as String?,
      annualFeeAmount: (data['annualFeeAmount'] as num?)?.toDouble(),
      fxFeePercent: (data['fxFeePercent'] as num?)?.toDouble(),
      atmFreeLimit: (data['atmFreeLimit'] as num?)?.toDouble(),
      cashbackPercent: (data['cashbackPercent'] as num?)?.toDouble(),
      cryptoSupport: data['cryptoSupport'] as bool?,
      beginnerFriendly: data['beginnerFriendly'] as bool?,
      platformUxLevel: data['platformUxLevel'] as String?,
      minDeposit: data['minDeposit'] as String?,
      assetsAvailableLabel: data['assetsAvailableLabel'] as String?,
    );
  }

  final String? subtype;
  final String? insuranceType;
  final int? minAmount;
  final int? maxAmount;
  final int? minTermMonths;
  final int? maxTermMonths;
  final String? speed;
  final String? feeProfile;
  final String? riskProfile;
  final String? availability;
  final bool isPartner;
  final bool affiliate;
  final bool monetized;
  final List<String> searchTags;
  final List<String> supportedAssets;
  final String? accessType;
  final String? estimatedCostLabel;
  final String? feeModel;
  final String? estimatedSpreadRange;
  final bool? recurringSupported;
  final String? minimumOrder;
  final String? notes;
  final String? sourceUrl;
  final String? dataSource;
  final String? lastCheckedAt;
  final double? confidenceScore;
  final bool informational;
  final double? priceAmount;
  final double? coverageAmount;
  final double? medicalCoverage;
  final double? deductibleAmount;
  final int? maxTripDays;
  final String? regionCoverage;
  final String? activityLevel;
  final bool? visaCompliant;
  final bool? instantActivation;
  final List<String> comparisonHighlights;
  final String? cardType;
  final double? annualFeeAmount;
  final double? fxFeePercent;
  final double? atmFreeLimit;
  final double? cashbackPercent;
  final bool? cryptoSupport;
  final bool? beginnerFriendly;
  final String? platformUxLevel;
  final String? minDeposit;
  final String? assetsAvailableLabel;
}

class PaynOffer {
  const PaynOffer({
    required this.id,
    required this.slug,
    required this.category,
    required this.countryCodes,
    required this.providerMark,
    required this.providerName,
    required this.title,
    required this.subtitle,
    required this.metrics,
    required this.bestFor,
    required this.providerWebsiteUrl,
    required this.affiliateLink,
    required this.affiliatePriorityScore,
    required this.updatedAt,
    this.providerUrls = const <String, String>{},
    this.linkType = 'affiliate_redirect',
    this.attributes = const PaynOfferAttributes(),
  });

  factory PaynOffer.fromJson(Map<String, dynamic> json) {
    return PaynOffer(
      id: (json['id'] as String? ?? '').trim(),
      slug: (json['slug'] as String? ?? '').trim(),
      category:
          _categoryFromName(json['category'] as String?) ?? PaynCategory.loans,
      countryCodes:
          (json['countryCodes'] as List<dynamic>? ?? const <dynamic>[])
              .map((value) => value.toString())
              .toList(),
      providerMark: (json['providerMark'] as String? ?? '').trim(),
      providerName: (json['providerName'] as String? ?? '').trim(),
      title: (json['title'] as String? ?? '').trim(),
      subtitle: (json['subtitle'] as String? ?? '').trim(),
      metrics:
          (json['metrics'] as List<dynamic>? ?? const <dynamic>[])
              .whereType<Map>()
              .map(
                (value) =>
                    PaynMetric.fromJson(Map<String, dynamic>.from(value)),
              )
              .toList(),
      bestFor:
          (json['bestFor'] as List<dynamic>? ?? const <dynamic>[])
              .map((value) => value.toString())
              .toList(),
      providerWebsiteUrl: (json['providerWebsiteUrl'] as String? ?? '').trim(),
      affiliateLink: (json['affiliateLink'] as String? ?? '').trim(),
      providerUrls: (json['providerUrls'] as Map<String, dynamic>? ??
              const <String, dynamic>{})
          .map((key, value) => MapEntry(key.toUpperCase(), value.toString())),
      linkType: (json['linkType'] as String? ?? 'affiliate_redirect').trim(),
      affiliatePriorityScore:
          (json['affiliatePriorityScore'] as num?)?.toDouble() ?? 0,
      updatedAt: (json['updatedAt'] as String? ?? '').trim(),
      attributes: PaynOfferAttributes.fromJson(
        json['attributes'] as Map<String, dynamic>?,
      ),
    );
  }

  final String id;
  final String slug;
  final PaynCategory category;
  final List<String> countryCodes;
  final String providerMark;
  final String providerName;
  final String title;
  final String subtitle;
  final List<PaynMetric> metrics;
  final List<String> bestFor;
  final String providerWebsiteUrl;
  final String affiliateLink;
  final Map<String, String> providerUrls;
  final String linkType;
  final double affiliatePriorityScore;
  final String updatedAt;
  final PaynOfferAttributes attributes;
}

class CatalogLanguageOption {
  const CatalogLanguageOption({required this.code, required this.native});

  factory CatalogLanguageOption.fromJson(Map<String, dynamic> json) {
    return CatalogLanguageOption(
      code: (json['code'] as String? ?? '').trim(),
      native: (json['native'] as String? ?? '').trim(),
    );
  }

  final String code;
  final String native;
}

class CatalogCountryOption {
  const CatalogCountryOption({
    required this.value,
    required this.label,
    required this.flag,
    required this.code,
    required this.currency,
    required this.kind,
    required this.labels,
  });

  factory CatalogCountryOption.fromJson(Map<String, dynamic> json) {
    return CatalogCountryOption(
      value: (json['value'] as String? ?? '').trim(),
      label: (json['label'] as String? ?? '').trim(),
      flag: (json['flag'] as String? ?? '').trim(),
      code: (json['code'] as String? ?? '').trim(),
      currency: (json['currency'] as String? ?? '').trim(),
      kind: (json['kind'] as String? ?? 'country').trim(),
      labels: (json['labels'] as Map<String, dynamic>? ??
              const <String, dynamic>{})
          .map((key, value) => MapEntry(key, value.toString())),
    );
  }

  final String value;
  final String label;
  final String flag;
  final String code;
  final String currency;
  final String kind;
  final Map<String, String> labels;
}

class MarketplaceCatalogManifest {
  const MarketplaceCatalogManifest({
    required this.generatedAt,
    required this.languages,
    required this.countries,
    required this.categories,
    required this.offers,
  });

  factory MarketplaceCatalogManifest.fromJson(Map<String, dynamic> json) {
    return MarketplaceCatalogManifest(
      generatedAt: (json['generatedAt'] as String? ?? '').trim(),
      languages:
          (json['languages'] as List<dynamic>? ?? const <dynamic>[])
              .whereType<Map>()
              .map(
                (value) => CatalogLanguageOption.fromJson(
                  Map<String, dynamic>.from(value),
                ),
              )
              .toList(),
      countries:
          (json['countries'] as List<dynamic>? ?? const <dynamic>[])
              .whereType<Map>()
              .map(
                (value) => CatalogCountryOption.fromJson(
                  Map<String, dynamic>.from(value),
                ),
              )
              .toList(),
      categories:
          (json['categories'] as List<dynamic>? ?? const <dynamic>[])
              .map((value) => value.toString())
              .toList(),
      offers:
          (json['offers'] as List<dynamic>? ?? const <dynamic>[])
              .whereType<Map>()
              .map(
                (value) => PaynOffer.fromJson(Map<String, dynamic>.from(value)),
              )
              .toList(),
    );
  }

  final String generatedAt;
  final List<CatalogLanguageOption> languages;
  final List<CatalogCountryOption> countries;
  final List<String> categories;
  final List<PaynOffer> offers;
}

class ExploreFilters {
  const ExploreFilters({
    this.query = '',
    this.provider = '',
    this.feature = '',
    this.subtype = '',
    this.amount = 25000,
    this.term = 60,
  });

  final String query;
  final String provider;
  final String feature;
  final String subtype;
  final int amount;
  final int term;

  ExploreFilters copyWith({
    String? query,
    String? provider,
    String? feature,
    String? subtype,
    int? amount,
    int? term,
  }) {
    return ExploreFilters(
      query: query ?? this.query,
      provider: provider ?? this.provider,
      feature: feature ?? this.feature,
      subtype: subtype ?? this.subtype,
      amount: amount ?? this.amount,
      term: term ?? this.term,
    );
  }
}

class ProfilePreferences {
  const ProfilePreferences({
    required this.languageCode,
    required this.market,
    required this.profileType,
    required this.selectedCategories,
    required this.interests,
  });

  factory ProfilePreferences.defaults() {
    return ProfilePreferences(
      languageCode: 'en',
      market: PaynMarket.eu,
      profileType: ProfileType.personal,
      selectedCategories: List<PaynCategory>.from(PaynCategory.values),
      interests: const <String>[],
    );
  }

  factory ProfilePreferences.fromJson(Map<String, dynamic> json) {
    return ProfilePreferences(
      languageCode: (json['languageCode'] as String?) ?? 'en',
      market: _marketFromName(json['market'] as String?) ?? PaynMarket.eu,
      profileType:
          _profileTypeFromName(json['profileType'] as String?) ??
          ProfileType.personal,
      selectedCategories:
          ((json['selectedCategories'] as List<dynamic>? ?? <dynamic>[])
                  .map((value) => _categoryFromName(value as String?))
                  .whereType<PaynCategory>())
              .toList(),
      interests:
          (json['interests'] as List<dynamic>? ?? <dynamic>[])
              .map((value) => value.toString())
              .toList(),
    );
  }

  final String languageCode;
  final PaynMarket market;
  final ProfileType profileType;
  final List<PaynCategory> selectedCategories;
  final List<String> interests;

  ProfilePreferences copyWith({
    String? languageCode,
    PaynMarket? market,
    ProfileType? profileType,
    List<PaynCategory>? selectedCategories,
    List<String>? interests,
  }) {
    return ProfilePreferences(
      languageCode: languageCode ?? this.languageCode,
      market: market ?? this.market,
      profileType: profileType ?? this.profileType,
      selectedCategories:
          selectedCategories ??
          List<PaynCategory>.from(this.selectedCategories),
      interests: interests ?? List<String>.from(this.interests),
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'languageCode': languageCode,
      'market': market.name,
      'profileType': profileType.name,
      'selectedCategories':
          selectedCategories.map((value) => value.name).toList(),
      'interests': interests,
    };
  }
}

class UserSession {
  const UserSession({
    required this.isAuthenticated,
    this.email,
    this.updatedAt,
  });

  const UserSession.guest()
    : isAuthenticated = false,
      email = null,
      updatedAt = null;

  factory UserSession.fromJson(Map<String, dynamic> json) {
    return UserSession(
      isAuthenticated: json['isAuthenticated'] as bool? ?? false,
      email: json['email'] as String?,
      updatedAt: json['updatedAt'] as String?,
    );
  }

  final bool isAuthenticated;
  final String? email;
  final String? updatedAt;

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'isAuthenticated': isAuthenticated,
      'email': email,
      'updatedAt': updatedAt,
    };
  }
}

class RankedOffer {
  const RankedOffer({
    required this.offer,
    required this.score,
    required this.reasons,
    required this.tradeoff,
  });

  final PaynOffer offer;
  final double score;
  final List<String> reasons;
  final String tradeoff;
}

class TrendSignal {
  const TrendSignal({
    required this.label,
    required this.value,
    required this.detail,
  });

  final String label;
  final String value;
  final String detail;
}

PaynCategory? _categoryFromName(String? value) {
  for (final category in PaynCategory.values) {
    if (category.name == value) {
      return category;
    }
  }
  return null;
}

PaynMarket? _marketFromName(String? value) {
  for (final market in PaynMarket.values) {
    if (market.name == value) {
      return market;
    }
  }
  return null;
}

PaynMarket? paynMarketFromCode(String? value) => _marketFromName(value);

ProfileType? _profileTypeFromName(String? value) {
  for (final type in ProfileType.values) {
    if (type.name == value) {
      return type;
    }
  }
  return null;
}
