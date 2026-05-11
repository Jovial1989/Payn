import 'dart:convert';

import 'package:payn_mobile/core/network/api_client.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';

class MarketplaceCatalogService {
  MarketplaceCatalogService(this._client);

  final ApiClient _client;

  Future<MarketplaceCatalogManifest> fetchCatalog() async {
    final response = await _client.dio.get<Map<String, dynamic>>(
      '/api/v1/catalog',
    );
    final payload = response.data;
    if (payload == null) {
      throw StateError('Catalog response payload was empty.');
    }
    return MarketplaceCatalogManifest.fromJson(payload);
  }

  String encodeCatalog(MarketplaceCatalogManifest manifest) {
    return jsonEncode(<String, dynamic>{
      'generatedAt': manifest.generatedAt,
      'languages':
          manifest.languages
              .map(
                (language) => <String, dynamic>{
                  'code': language.code,
                  'native': language.native,
                },
              )
              .toList(),
      'countries':
          manifest.countries
              .map(
                (country) => <String, dynamic>{
                  'value': country.value,
                  'label': country.label,
                  'flag': country.flag,
                  'code': country.code,
                  'currency': country.currency,
                  'kind': country.kind,
                  'labels': country.labels,
                },
              )
              .toList(),
      'categories': manifest.categories,
      'offers':
          manifest.offers
              .map(
                (offer) => <String, dynamic>{
                  'id': offer.id,
                  'slug': offer.slug,
                  'category': offer.category.name,
                  'countryCodes': offer.countryCodes,
                  'providerMark': offer.providerMark,
                  'providerName': offer.providerName,
                  'title': offer.title,
                  'subtitle': offer.subtitle,
                  'metrics':
                      offer.metrics
                          .map(
                            (metric) => <String, dynamic>{
                              'label': metric.label,
                              'value': metric.value,
                            },
                          )
                          .toList(),
                  'bestFor': offer.bestFor,
                  'providerWebsiteUrl': offer.providerWebsiteUrl,
                  'affiliateLink': offer.affiliateLink,
                  'providerUrls': offer.providerUrls,
                  'linkType': offer.linkType,
                  'affiliatePriorityScore': offer.affiliatePriorityScore,
                  'updatedAt': offer.updatedAt,
                  'attributes': <String, dynamic>{
                    'subtype': offer.attributes.subtype,
                    'insuranceType': offer.attributes.insuranceType,
                    'minAmount': offer.attributes.minAmount,
                    'maxAmount': offer.attributes.maxAmount,
                    'minTermMonths': offer.attributes.minTermMonths,
                    'maxTermMonths': offer.attributes.maxTermMonths,
                    'speed': offer.attributes.speed,
                    'feeProfile': offer.attributes.feeProfile,
                    'riskProfile': offer.attributes.riskProfile,
                    'availability': offer.attributes.availability,
                    'isPartner': offer.attributes.isPartner,
                    'affiliate': offer.attributes.affiliate,
                    'monetized': offer.attributes.monetized,
                    'searchTags': offer.attributes.searchTags,
                    'supportedAssets': offer.attributes.supportedAssets,
                    'accessType': offer.attributes.accessType,
                    'estimatedCostLabel': offer.attributes.estimatedCostLabel,
                    'feeModel': offer.attributes.feeModel,
                    'estimatedSpreadRange':
                        offer.attributes.estimatedSpreadRange,
                    'recurringSupported': offer.attributes.recurringSupported,
                    'minimumOrder': offer.attributes.minimumOrder,
                    'notes': offer.attributes.notes,
                    'priceAmount': offer.attributes.priceAmount,
                    'coverageAmount': offer.attributes.coverageAmount,
                    'medicalCoverage': offer.attributes.medicalCoverage,
                    'deductibleAmount': offer.attributes.deductibleAmount,
                    'maxTripDays': offer.attributes.maxTripDays,
                    'regionCoverage': offer.attributes.regionCoverage,
                    'activityLevel': offer.attributes.activityLevel,
                    'visaCompliant': offer.attributes.visaCompliant,
                    'instantActivation': offer.attributes.instantActivation,
                    'comparisonHighlights':
                        offer.attributes.comparisonHighlights,
                    'cardType': offer.attributes.cardType,
                    'annualFeeAmount': offer.attributes.annualFeeAmount,
                    'fxFeePercent': offer.attributes.fxFeePercent,
                    'atmFreeLimit': offer.attributes.atmFreeLimit,
                    'cashbackPercent': offer.attributes.cashbackPercent,
                    'cryptoSupport': offer.attributes.cryptoSupport,
                    'beginnerFriendly': offer.attributes.beginnerFriendly,
                    'platformUxLevel': offer.attributes.platformUxLevel,
                    'minDeposit': offer.attributes.minDeposit,
                    'assetsAvailableLabel':
                        offer.attributes.assetsAvailableLabel,
                  },
                },
              )
              .toList(),
    });
  }
}
