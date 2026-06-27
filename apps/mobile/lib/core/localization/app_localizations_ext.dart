import 'package:flutter/material.dart';
import 'package:payn_mobile/shared/models/analytics_models.dart';
import 'package:payn_mobile/l10n/app_localizations.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';

extension AppLocalizationsX on BuildContext {
  AppLocalizations get l10n => AppLocalizations.of(this)!;
}

extension PaynCategoryL10n on PaynCategory {
  String localizedLabel(AppLocalizations l10n) {
    switch (this) {
      case PaynCategory.loans:
        return l10n.categoryLoans;
      case PaynCategory.cards:
        return l10n.categoryCards;
      case PaynCategory.transfers:
        return l10n.categoryTransfers;
      case PaynCategory.exchange:
        return l10n.categoryExchange;
      case PaynCategory.insurance:
        return l10n.categoryInsurance;
      case PaynCategory.investments:
        return l10n.categoryInvestments;
      case PaynCategory.banking:
        return l10n.categoryBanking;
      case PaynCategory.savings:
        return l10n.categorySavings;
      case PaynCategory.crypto:
        return l10n.categoryCrypto;
      case PaynCategory.business:
        return l10n.categoryBusiness;
      case PaynCategory.budgeting:
        return l10n.categoryBudgeting;
      case PaynCategory.kids:
        return l10n.categoryKids;
    }
  }
}

extension PaynMarketL10n on PaynMarket {
  String localizedLabel(AppLocalizations l10n) {
    switch (this) {
      case PaynMarket.eu:
        return l10n.marketEu;
      case PaynMarket.de:
        return l10n.marketGermany;
      case PaynMarket.es:
        return l10n.marketSpain;
      case PaynMarket.uk:
        return l10n.marketUnitedKingdom;
      case PaynMarket.fr:
        return l10n.marketFrance;
      case PaynMarket.it:
        return l10n.marketItaly;
      case PaynMarket.pt:
        return l10n.marketPortugal;
      case PaynMarket.nl:
        return l10n.marketNetherlands;
    }
  }
}

extension ProfileTypeL10n on ProfileType {
  String localizedLabel(AppLocalizations l10n) {
    switch (this) {
      case ProfileType.personal:
        return l10n.profileTypePersonal;
      case ProfileType.freelancer:
        return l10n.profileTypeFreelancer;
      case ProfileType.business:
        return l10n.profileTypeBusiness;
    }
  }
}

extension MarketAssetL10n on MarketAsset {
  String localizedLabel(AppLocalizations l10n) {
    switch (this) {
      case MarketAsset.btc:
        return 'BTC';
      case MarketAsset.sp500:
        return l10n.marketAssetSp500;
      case MarketAsset.eurUsd:
        return 'EUR/USD';
      case MarketAsset.gold:
        return l10n.marketAssetGold;
    }
  }

  String localizedPriceLabel(AppLocalizations l10n) {
    switch (this) {
      case MarketAsset.btc:
        return l10n.marketAssetPriceSpot;
      case MarketAsset.sp500:
        return l10n.marketAssetPriceIndex;
      case MarketAsset.eurUsd:
        return l10n.marketAssetPriceFx;
      case MarketAsset.gold:
        return l10n.marketAssetPriceFutures;
    }
  }
}

String localizedInterestLabel(String interest, AppLocalizations l10n) {
  switch (interest) {
    case 'travel':
      return l10n.interestTravel;
    case 'savings':
      return l10n.interestSavings;
    case 'crypto':
      return l10n.interestCrypto;
    case 'international_transfers':
      return l10n.interestInternationalTransfers;
    case 'investing':
      return l10n.interestInvesting;
    case 'insurance':
      return l10n.interestInsurance;
    case 'everyday_banking':
      return l10n.interestEverydayBanking;
    default:
      return interest;
  }
}
