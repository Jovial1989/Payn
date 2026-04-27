import 'package:intl/intl.dart';
import 'package:payn_mobile/core/constants/marketplace_constants.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';

String formatMarketLabel(PaynMarket market) => marketDefinitions[market]!.label;

String formatCurrencyLabel(
  int value,
  PaynMarket market, {
  String locale = 'en',
}) {
  final currency = marketDefinitions[market]!.currency;
  final compact = NumberFormat.compactCurrency(
    locale: locale,
    name: currency,
    decimalDigits: value >= 10000 ? 0 : 1,
  );
  return compact.format(value);
}

String formatShortDate(String iso, {String locale = 'en'}) {
  final date = DateTime.tryParse(iso)?.toLocal();
  if (date == null) {
    return iso;
  }
  return DateFormat.MMMd(locale).format(date);
}

String formatMoney(
  num value, {
  String locale = 'en',
  String currency = 'EUR',
  int? decimalDigits,
}) {
  return NumberFormat.currency(
    locale: locale,
    name: currency,
    decimalDigits: decimalDigits,
  ).format(value);
}

String formatPercent(
  num value, {
  String locale = 'en',
  int decimalDigits = 2,
}) {
  return NumberFormat.decimalPercentPattern(
    locale: locale,
    decimalDigits: decimalDigits,
  ).format(value / 100);
}

String normalizeDisplayText(String value) {
  return value.replaceAll('–', '-').replaceAll('—', '-');
}
