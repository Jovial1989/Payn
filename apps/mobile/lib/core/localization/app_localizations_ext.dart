import 'package:flutter/material.dart';
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
    }
  }
}

extension PaynMarketL10n on PaynMarket {
  String localizedLabel(AppLocalizations l10n) {
    switch (this) {
      case PaynMarket.eu:
        return l10n.marketEu;
      case PaynMarket.international:
        return l10n.marketInternational;
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
