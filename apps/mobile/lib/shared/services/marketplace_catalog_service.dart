import 'dart:convert';

import 'package:payn_mobile/core/network/api_client.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';

class MarketplaceCatalogService {
  MarketplaceCatalogService(this._client);

  final ApiClient _client;

  Future<MarketplaceCatalogManifest> fetchCatalog() async {
    final response = await _client.dio.get<Map<String, dynamic>>('/api/v1/catalog');
    final payload = response.data;
    if (payload == null) {
      throw StateError('Catalog response payload was empty.');
    }
    return MarketplaceCatalogManifest.fromJson(payload);
  }

  String encodeCatalog(MarketplaceCatalogManifest manifest) {
    return jsonEncode(<String, dynamic>{
      'generatedAt': manifest.generatedAt,
      'languages': manifest.languages
          .map((language) => <String, dynamic>{
                'code': language.code,
                'native': language.native,
              })
          .toList(),
      'countries': manifest.countries
          .map((country) => <String, dynamic>{
                'value': country.value,
                'label': country.label,
                'flag': country.flag,
                'code': country.code,
                'currency': country.currency,
                'kind': country.kind,
                'labels': country.labels,
              })
          .toList(),
      'categories': manifest.categories,
      'offers': manifest.offers.map((offer) => <String, dynamic>{
            'id': offer.id,
            'slug': offer.slug,
            'category': offer.category.name,
            'countryCodes': offer.countryCodes,
            'providerMark': offer.providerMark,
            'providerName': offer.providerName,
            'title': offer.title,
            'subtitle': offer.subtitle,
            'metrics': offer.metrics
                .map((metric) => <String, dynamic>{
                      'label': metric.label,
                      'value': metric.value,
                    })
                .toList(),
            'bestFor': offer.bestFor,
            'providerWebsiteUrl': offer.providerWebsiteUrl,
            'affiliateLink': offer.affiliateLink,
            'affiliatePriorityScore': offer.affiliatePriorityScore,
            'updatedAt': offer.updatedAt,
            'attributes': <String, dynamic>{
              'subtype': offer.attributes.subtype,
              'minAmount': offer.attributes.minAmount,
              'maxAmount': offer.attributes.maxAmount,
              'minTermMonths': offer.attributes.minTermMonths,
              'maxTermMonths': offer.attributes.maxTermMonths,
              'feeProfile': offer.attributes.feeProfile,
              'availability': offer.attributes.availability,
              'affiliate': offer.attributes.affiliate,
              'monetized': offer.attributes.monetized,
              'searchTags': offer.attributes.searchTags,
            },
          }).toList(),
    });
  }
}
