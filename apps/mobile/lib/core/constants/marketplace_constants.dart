import 'package:payn_mobile/shared/models/payn_models.dart';

class MarketDefinition {
  const MarketDefinition({
    required this.marketCode,
    required this.currency,
    required this.label,
  });

  final String marketCode;
  final String currency;
  final String label;
}

const Map<PaynMarket, MarketDefinition> marketDefinitions =
    <PaynMarket, MarketDefinition>{
      PaynMarket.eu: MarketDefinition(
        marketCode: 'EU',
        currency: 'EUR',
        label: 'All Europe',
      ),
      PaynMarket.international: MarketDefinition(
        marketCode: 'INTL',
        currency: 'Multi',
        label: 'International',
      ),
      PaynMarket.de: MarketDefinition(
        marketCode: 'DE',
        currency: 'EUR',
        label: 'Germany',
      ),
      PaynMarket.es: MarketDefinition(
        marketCode: 'ES',
        currency: 'EUR',
        label: 'Spain',
      ),
      PaynMarket.uk: MarketDefinition(
        marketCode: 'UK',
        currency: 'GBP',
        label: 'United Kingdom',
      ),
      PaynMarket.fr: MarketDefinition(
        marketCode: 'FR',
        currency: 'EUR',
        label: 'France',
      ),
      PaynMarket.it: MarketDefinition(
        marketCode: 'IT',
        currency: 'EUR',
        label: 'Italy',
      ),
      PaynMarket.pt: MarketDefinition(
        marketCode: 'PT',
        currency: 'EUR',
        label: 'Portugal',
      ),
      PaynMarket.nl: MarketDefinition(
        marketCode: 'NL',
        currency: 'EUR',
        label: 'Netherlands',
      ),
    };

const Map<PaynCategory, String> categoryDescriptions = <PaynCategory, String>{
  PaynCategory.loans:
      'Review borrowing options with a cleaner view of cost, term, and repayment flexibility.',
  PaynCategory.cards:
      'Compare credit and debit cards by travel fit, fee profile, and everyday value.',
  PaynCategory.banking:
      'Find the right current account — from neobanks to traditional institutions.',
  PaynCategory.transfers:
      'Rank transfer routes by delivered amount, timing, and payout method.',
  PaynCategory.exchange:
      'Watch spread, execution timing, and currency coverage before you convert.',
  PaynCategory.insurance:
      'Compare protection products by cover depth, exclusions, and monthly cost.',
  PaynCategory.investments:
      'Shortlist platforms by fee profile, market access, and long-term usability.',
  PaynCategory.crypto:
      'Compare crypto platforms by fees, supported assets, and security model.',
  PaynCategory.business:
      'Business accounts, multi-currency wallets, and team expense tools.',
  PaynCategory.budgeting:
      'Track spending, set savings goals, and get actionable financial insights.',
  PaynCategory.kids:
      'Pocket money apps and family finance tools with full parental controls.',
};

const Map<String, String> interestLabels = <String, String>{
  'travel': 'Travel',
  'savings': 'Savings',
  'crypto': 'Crypto',
  'international_transfers': 'International transfers',
  'investing': 'Investing',
  'insurance': 'Insurance',
  'everyday_banking': 'Everyday banking',
};

const Map<String, List<String>> interestKeywords = <String, List<String>>{
  'travel': <String>['travel', 'fx', 'worldwide', 'nomad', 'multi-currency'],
  'savings': <String>['savings', 'etf', 'low-cost', 'fee', 'cashback'],
  'crypto': <String>['crypto', 'digital assets'],
  'international_transfers': <String>[
    'transfer',
    'multi-currency',
    'corridors',
    'cross-border',
  ],
  'investing': <String>['invest', 'stocks', 'etf', 'broker', 'portfolio'],
  'insurance': <String>['insurance', 'cover', 'medical', 'protection'],
  'everyday_banking': <String>[
    'card',
    'budgeting',
    'cashback',
    'mobile banking',
  ],
};

const Map<ProfileType, List<PaynCategory>> profileCategoryPreferences =
    <ProfileType, List<PaynCategory>>{
      ProfileType.personal: <PaynCategory>[
        PaynCategory.banking,
        PaynCategory.cards,
        PaynCategory.loans,
        PaynCategory.transfers,
        PaynCategory.insurance,
        PaynCategory.investments,
        PaynCategory.exchange,
        PaynCategory.budgeting,
        PaynCategory.crypto,
        PaynCategory.kids,
      ],
      ProfileType.freelancer: <PaynCategory>[
        PaynCategory.transfers,
        PaynCategory.business,
        PaynCategory.exchange,
        PaynCategory.cards,
        PaynCategory.banking,
        PaynCategory.insurance,
        PaynCategory.investments,
        PaynCategory.loans,
        PaynCategory.crypto,
        PaynCategory.budgeting,
      ],
      ProfileType.business: <PaynCategory>[
        PaynCategory.business,
        PaynCategory.exchange,
        PaynCategory.transfers,
        PaynCategory.investments,
        PaynCategory.insurance,
        PaynCategory.cards,
        PaynCategory.banking,
        PaynCategory.loans,
        PaynCategory.crypto,
        PaynCategory.budgeting,
      ],
    };

const List<String> globallyRecognizedProviders = <String>[
  'Wise',
  'Revolut',
  'Paysera',
  'Payoneer',
  'Remitly',
  'XE',
  'Skrill',
  'Neteller',
  'CurrencyFair',
  'OFX',
  'N26',
  'SafetyWing',
  'eToro',
  'Coinbase',
  'Bitpanda',
];
