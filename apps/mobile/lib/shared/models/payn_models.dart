enum PaynCategory { loans, cards, transfers, exchange, insurance, investments }

extension PaynCategoryLabel on PaynCategory {
  String get label {
    switch (this) {
      case PaynCategory.loans:
        return 'Loans';
      case PaynCategory.cards:
        return 'Cards';
      case PaynCategory.transfers:
        return 'Transfers';
      case PaynCategory.exchange:
        return 'Exchange';
      case PaynCategory.insurance:
        return 'Insurance';
      case PaynCategory.investments:
        return 'Investments';
    }
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

  final String label;
  final String value;
}

class PaynOfferAttributes {
  const PaynOfferAttributes({
    this.subtype,
    this.minAmount,
    this.maxAmount,
    this.minTermMonths,
    this.maxTermMonths,
    this.feeProfile,
    this.availability,
    this.searchTags = const <String>[],
  });

  final String? subtype;
  final int? minAmount;
  final int? maxAmount;
  final int? minTermMonths;
  final int? maxTermMonths;
  final String? feeProfile;
  final String? availability;
  final List<String> searchTags;
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
    this.attributes = const PaynOfferAttributes(),
  });

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
  final double affiliatePriorityScore;
  final String updatedAt;
  final PaynOfferAttributes attributes;
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
    required this.market,
    required this.profileType,
    required this.selectedCategories,
    required this.interests,
  });

  factory ProfilePreferences.defaults() {
    return ProfilePreferences(
      market: PaynMarket.eu,
      profileType: ProfileType.personal,
      selectedCategories: List<PaynCategory>.from(PaynCategory.values),
      interests: const <String>[],
    );
  }

  factory ProfilePreferences.fromJson(Map<String, dynamic> json) {
    return ProfilePreferences(
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

  final PaynMarket market;
  final ProfileType profileType;
  final List<PaynCategory> selectedCategories;
  final List<String> interests;

  ProfilePreferences copyWith({
    PaynMarket? market,
    ProfileType? profileType,
    List<PaynCategory>? selectedCategories,
    List<String>? interests,
  }) {
    return ProfilePreferences(
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

ProfileType? _profileTypeFromName(String? value) {
  for (final type in ProfileType.values) {
    if (type.name == value) {
      return type;
    }
  }
  return null;
}
