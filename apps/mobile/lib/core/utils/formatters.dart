import 'package:payn_mobile/core/constants/marketplace_constants.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';

String formatMarketLabel(PaynMarket market) => marketDefinitions[market]!.label;

String formatCurrencyLabel(int value, PaynMarket market) {
  final currency = marketDefinitions[market]!.currency;
  final symbol = currency == 'GBP' ? '£' : '€';
  final compact = value >= 1000 ? '${(value / 1000).round()}k' : '$value';
  return '$symbol$compact';
}

String formatShortDate(String iso) {
  final date = DateTime.tryParse(iso)?.toLocal();
  if (date == null) {
    return iso;
  }

  const months = <String>[
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return '${months[date.month - 1]} ${date.day}';
}

String normalizeDisplayText(String value) {
  return value.replaceAll('–', '-').replaceAll('—', '-');
}
