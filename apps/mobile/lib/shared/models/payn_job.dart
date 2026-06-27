import 'package:flutter/material.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';

/// Intent-first entry points.
///
/// Payn leads with real-life money *jobs* ("Send money", "Grow savings")
/// rather than the 12-value [PaynCategory] product taxonomy, which a
/// consumer can't reliably self-select (Cards vs Bank accounts vs
/// Currency exchange all overlap for "spend abroad"). Each job maps to
/// one or more categories used to scope the results list.
enum PaynJob {
  spendAbroad,
  sendMoney,
  everydayAccount,
  growSavings,
  invest,
  family,
  borrow,
  insurance,
  business,
}

extension PaynJobMeta on PaynJob {
  String get title {
    switch (this) {
      case PaynJob.spendAbroad:
        return 'Spend abroad';
      case PaynJob.sendMoney:
        return 'Send money';
      case PaynJob.everydayAccount:
        return 'Everyday account';
      case PaynJob.growSavings:
        return 'Grow savings';
      case PaynJob.invest:
        return 'Invest';
      case PaynJob.family:
        return 'Family';
      case PaynJob.borrow:
        return 'Borrow';
      case PaynJob.insurance:
        return 'Insurance';
      case PaynJob.business:
        return 'For business';
    }
  }

  String get subtitle {
    switch (this) {
      case PaynJob.spendAbroad:
        return 'Cards & FX with no hidden fees';
      case PaynJob.sendMoney:
        return 'Cheapest way to send overseas';
      case PaynJob.everydayAccount:
        return 'Current accounts & neobanks';
      case PaynJob.growSavings:
        return 'Earn more on what you save';
      case PaynJob.invest:
        return 'Stocks, ETFs & crypto';
      case PaynJob.family:
        return 'Cards & budgeting for kids';
      case PaynJob.borrow:
        return 'Loans & credit, compared';
      case PaynJob.insurance:
        return 'Cover for travel, health & more';
      case PaynJob.business:
        return 'Accounts & tools for companies';
    }
  }

  IconData get icon {
    switch (this) {
      case PaynJob.spendAbroad:
        return Icons.public_rounded;
      case PaynJob.sendMoney:
        return Icons.send_rounded;
      case PaynJob.everydayAccount:
        return Icons.account_balance_rounded;
      case PaynJob.growSavings:
        return Icons.savings_rounded;
      case PaynJob.invest:
        return Icons.trending_up_rounded;
      case PaynJob.family:
        return Icons.family_restroom_rounded;
      case PaynJob.borrow:
        return Icons.account_balance_wallet_rounded;
      case PaynJob.insurance:
        return Icons.shield_rounded;
      case PaynJob.business:
        return Icons.business_center_rounded;
    }
  }

  /// Categories this job draws its results from. Order matters:
  /// [primaryCategory] is the first entry.
  List<PaynCategory> get categories {
    switch (this) {
      case PaynJob.spendAbroad:
        return const <PaynCategory>[PaynCategory.cards, PaynCategory.exchange];
      case PaynJob.sendMoney:
        return const <PaynCategory>[PaynCategory.transfers];
      case PaynJob.everydayAccount:
        return const <PaynCategory>[PaynCategory.banking];
      case PaynJob.growSavings:
        return const <PaynCategory>[PaynCategory.savings];
      case PaynJob.invest:
        return const <PaynCategory>[
          PaynCategory.investments,
          PaynCategory.crypto,
        ];
      case PaynJob.family:
        return const <PaynCategory>[PaynCategory.kids, PaynCategory.budgeting];
      case PaynJob.borrow:
        return const <PaynCategory>[PaynCategory.loans];
      case PaynJob.insurance:
        return const <PaynCategory>[PaynCategory.insurance];
      case PaynJob.business:
        return const <PaynCategory>[PaynCategory.business];
    }
  }

  PaynCategory get primaryCategory => categories.first;
}

/// Jobs shown as the primary launcher grid on Home.
const List<PaynJob> kPrimaryJobs = <PaynJob>[
  PaynJob.spendAbroad,
  PaynJob.sendMoney,
  PaynJob.everydayAccount,
  PaynJob.growSavings,
  PaynJob.invest,
  PaynJob.family,
  PaynJob.borrow,
];

/// Lower-frequency jobs shown as quiet secondary links.
const List<PaynJob> kSecondaryJobs = <PaynJob>[
  PaynJob.insurance,
  PaynJob.business,
];

/// Icon per product category — used for the Explore category tabs so
/// "Cards", "Saving", "Sending" etc. read at a glance, not as bare text.
extension PaynCategoryIcon on PaynCategory {
  IconData get tabIcon {
    switch (this) {
      case PaynCategory.loans:
        return Icons.account_balance_wallet_rounded;
      case PaynCategory.cards:
        return Icons.credit_card_rounded;
      case PaynCategory.banking:
        return Icons.account_balance_rounded;
      case PaynCategory.savings:
        return Icons.savings_rounded;
      case PaynCategory.transfers:
        return Icons.send_rounded;
      case PaynCategory.exchange:
        return Icons.currency_exchange_rounded;
      case PaynCategory.insurance:
        return Icons.shield_rounded;
      case PaynCategory.investments:
        return Icons.trending_up_rounded;
      case PaynCategory.crypto:
        return Icons.currency_bitcoin_rounded;
      case PaynCategory.business:
        return Icons.business_center_rounded;
      case PaynCategory.budgeting:
        return Icons.pie_chart_rounded;
      case PaynCategory.kids:
        return Icons.family_restroom_rounded;
    }
  }
}
