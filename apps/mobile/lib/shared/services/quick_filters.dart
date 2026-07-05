import 'package:payn_mobile/shared/models/payn_models.dart';

// Per-category quick-filter definitions, ported from the matching web
// files (card-fee-filters.ts, transfer-speed.ts, loans-deep-filters.ts,
// investments-deep-filters.ts, savings-deep-filters.ts, insurance-
// deep-filters.ts). One pill in the inline row == one Group; tapping
// it opens a picker with that group's options. Matchers read the same
// offer fields the web app reads (typed attributes first, free-text
// metric values as fallback) so a selection on mobile narrows the list
// to the same offers the equivalent web pill would.

class QuickFilterOption {
  const QuickFilterOption({
    required this.id,
    required this.label,
    required this.match,
  });

  // Stable id stored on ExploreFilters.quickFilter (e.g. "cards:free-monthly").
  final String id;
  final String label;
  final bool Function(PaynOffer offer) match;
}

// One dimension on the filter row — e.g. "APR" / "Amount" / "Speed".
// Renders as a single pill on the explore screen that shows
// "<DIMENSION>  <current value or Any>". Tapping it opens a picker
// sheet with the options.
class QuickFilterGroup {
  const QuickFilterGroup({
    required this.dimension,
    required this.label,
    required this.options,
  });

  // Stable prefix on every option id (the chunk before the first ':').
  // E.g. an option `loans:apr-under-5` belongs to dimension `loans:apr`.
  final String dimension;
  final String label;
  final List<QuickFilterOption> options;

  // True if the given filter id belongs to this group's dimension.
  bool owns(String id) => id.startsWith('$dimension-') || id == dimension;
}

// Grouped per-dimension definitions. Used by the inline dimension-pill
// row on Explore (one pill per group). The flat `kQuickFilters` below is
// derived from these and kept for the full Filters bottom-sheet panel.
final Map<PaynCategory, List<QuickFilterGroup>> kQuickFilterGroups =
    <PaynCategory, List<QuickFilterGroup>>{
      PaynCategory.cards: <QuickFilterGroup>[
        QuickFilterGroup(
          dimension: 'cards:fee',
          label: 'Monthly fee',
          options: <QuickFilterOption>[
            QuickFilterOption(
              id: 'cards:fee-free',
              label: 'Free only',
              match: _isMonthlyFeeFree,
            ),
          ],
        ),
        QuickFilterGroup(
          dimension: 'cards:fx',
          label: 'FX fee',
          options: <QuickFilterOption>[
            QuickFilterOption(
              id: 'cards:fx-zero',
              label: 'Zero FX',
              match: _isFxFeeZero,
            ),
          ],
        ),
      ],
      PaynCategory.transfers: <QuickFilterGroup>[
        QuickFilterGroup(
          dimension: 'transfers:speed',
          label: 'Speed',
          options: <QuickFilterOption>[
            QuickFilterOption(
              id: 'transfers:speed-instant',
              label: 'Instant',
              match: _isInstantTransfer,
            ),
            QuickFilterOption(
              id: 'transfers:speed-fast',
              label: 'Under 24h',
              match: _isFastTransfer,
            ),
            QuickFilterOption(
              id: 'transfers:speed-multi',
              label: '1+ days',
              match: _isMultiDayTransfer,
            ),
          ],
        ),
      ],
      PaynCategory.loans: <QuickFilterGroup>[
        QuickFilterGroup(
          dimension: 'loans:apr',
          label: 'APR',
          options: <QuickFilterOption>[
            QuickFilterOption(
              id: 'loans:apr-under-5',
              label: 'Under 5%',
              match: _aprUnder5,
            ),
            QuickFilterOption(
              id: 'loans:apr-5-10',
              label: '5% – 10%',
              match: _apr5To10,
            ),
            QuickFilterOption(
              id: 'loans:apr-over-10',
              label: 'Over 10%',
              match: _aprOver10,
            ),
          ],
        ),
        QuickFilterGroup(
          dimension: 'loans:amount',
          label: 'Amount',
          options: <QuickFilterOption>[
            // P2.6 — Brackets rebalanced against real distribution.
            // Live catalog: max amounts range €5K–€120K, ~80% sit in
            // the €25K-€75K corridor. Old €10K threshold only matched
            // 2 / 43 offers; €25K hits the natural break point.
            QuickFilterOption(
              id: 'loans:amount-small',
              label: 'Up to €25K',
              match: _loanAmountSmall,
            ),
            QuickFilterOption(
              id: 'loans:amount-mid',
              label: '€25K – €75K',
              match: _loanAmountMid,
            ),
            QuickFilterOption(
              id: 'loans:amount-large',
              label: 'Over €75K',
              match: _loanAmountLarge,
            ),
          ],
        ),
        QuickFilterGroup(
          dimension: 'loans:term',
          label: 'Term',
          options: <QuickFilterOption>[
            QuickFilterOption(
              id: 'loans:term-short',
              label: 'Up to 24 mo',
              match: _loanTermShort,
            ),
            QuickFilterOption(
              id: 'loans:term-mid',
              label: '24 – 60 mo',
              match: _loanTermMid,
            ),
            QuickFilterOption(
              id: 'loans:term-long',
              label: '60+ mo',
              match: _loanTermLong,
            ),
          ],
        ),
      ],
      PaynCategory.investments: <QuickFilterGroup>[
        QuickFilterGroup(
          dimension: 'investments:platform',
          label: 'Platform',
          options: <QuickFilterOption>[
            QuickFilterOption(
              id: 'investments:platform-crypto',
              label: 'Crypto',
              match: _isCryptoPlatform,
            ),
            QuickFilterOption(
              id: 'investments:platform-etf',
              label: 'ETFs',
              match: _isEtfPlatform,
            ),
            QuickFilterOption(
              id: 'investments:platform-stocks',
              label: 'Stocks',
              match: _isStocksPlatform,
            ),
            QuickFilterOption(
              id: 'investments:platform-robo',
              label: 'Robo-advisor',
              match: _isRoboAdvisor,
            ),
            QuickFilterOption(
              id: 'investments:platform-recurring',
              label: 'Recurring buys',
              match: _supportsRecurring,
            ),
          ],
        ),
        QuickFilterGroup(
          dimension: 'investments:skill',
          label: 'Best for',
          options: <QuickFilterOption>[
            QuickFilterOption(
              id: 'investments:skill-beginner',
              label: 'First-time investors',
              match: _isBeginnerFriendly,
            ),
            QuickFilterOption(
              id: 'investments:skill-advanced',
              label: 'Advanced / Pro',
              match: _isAdvancedTools,
            ),
          ],
        ),
      ],
      PaynCategory.savings: <QuickFilterGroup>[
        QuickFilterGroup(
          dimension: 'savings:rate',
          label: 'Best rate',
          options: <QuickFilterOption>[
            QuickFilterOption(
              id: 'savings:rate-4-plus',
              label: '4% or more',
              match: _rate4Plus,
            ),
            QuickFilterOption(
              id: 'savings:rate-3-4',
              label: '3% – 4%',
              match: _rate3To4,
            ),
            QuickFilterOption(
              id: 'savings:rate-under-3',
              label: 'Under 3%',
              match: _rateUnder3,
            ),
          ],
        ),
        QuickFilterGroup(
          dimension: 'savings:min',
          label: 'Min deposit',
          options: <QuickFilterOption>[
            QuickFilterOption(
              id: 'savings:min-low',
              label: '€100 or less',
              match: _minDepositLow,
            ),
            QuickFilterOption(
              id: 'savings:min-mid',
              label: '€100 – €10K',
              match: _minDepositMid,
            ),
            QuickFilterOption(
              id: 'savings:min-high',
              label: 'Over €10K',
              match: _minDepositHigh,
            ),
          ],
        ),
        QuickFilterGroup(
          dimension: 'savings:access',
          label: 'Access',
          options: <QuickFilterOption>[
            QuickFilterOption(
              id: 'savings:access-instant',
              label: 'Instant',
              match: _accessInstant,
            ),
            QuickFilterOption(
              id: 'savings:access-notice',
              label: 'Notice period',
              match: _accessNotice,
            ),
            QuickFilterOption(
              id: 'savings:access-fixed',
              label: 'Fixed term',
              match: _accessFixed,
            ),
          ],
        ),
      ],
      PaynCategory.banking: <QuickFilterGroup>[
        QuickFilterGroup(
          dimension: 'banking:fee',
          label: 'Account fee',
          options: <QuickFilterOption>[
            QuickFilterOption(
              id: 'banking:fee-free',
              label: 'No fee',
              match: _isMonthlyFeeFree,
            ),
          ],
        ),
        QuickFilterGroup(
          dimension: 'banking:currency',
          label: 'Currencies',
          options: <QuickFilterOption>[
            QuickFilterOption(
              id: 'banking:currency-multi',
              label: 'Multi-currency',
              match: _isMultiCurrencyBanking,
            ),
          ],
        ),
      ],
      PaynCategory.business: <QuickFilterGroup>[
        QuickFilterGroup(
          dimension: 'business:fee',
          label: 'Monthly fee',
          options: <QuickFilterOption>[
            QuickFilterOption(
              id: 'business:fee-free',
              label: 'No fee',
              match: _isMonthlyFeeFree,
            ),
          ],
        ),
        QuickFilterGroup(
          dimension: 'business:features',
          label: 'Features',
          options: <QuickFilterOption>[
            QuickFilterOption(
              id: 'business:features-invoicing',
              label: 'Invoicing',
              match: _hasInvoicing,
            ),
          ],
        ),
      ],
      // Insurance subtype-specific dimensions, ported 1:1 from web's
      // insurance-deep-filters.ts. Surfaced only when the matching
      // subtype is active (the dimension-pill row consults the current
      // subtype before showing these groups). Numeric attributes use
      // typed fields (priceAmount, coverageAmount, maxTripDays, etc.)
      // and fall back to attribute presence so the filter only narrows
      // to offers we can actually classify.
      PaynCategory.insurance: <QuickFilterGroup>[
        // ── Health ───────────────────────────────────────────────────
        QuickFilterGroup(
          dimension: 'insurance:health-coverage',
          label: 'Coverage area',
          options: <QuickFilterOption>[
            QuickFilterOption(
              id: 'insurance:health-coverage-worldwide',
              label: 'Worldwide',
              match: (o) => o.attributes.regionCoverage == 'worldwide',
            ),
            QuickFilterOption(
              id: 'insurance:health-coverage-regional',
              label: 'Regional / EU',
              match: (o) =>
                  o.attributes.regionCoverage == 'regional' ||
                  o.attributes.regionCoverage == 'eu',
            ),
          ],
        ),
        QuickFilterGroup(
          dimension: 'insurance:health-premium',
          label: 'Monthly premium',
          options: <QuickFilterOption>[
            QuickFilterOption(
              id: 'insurance:health-premium-under50',
              label: 'Under €50',
              match: (o) => _price(o, max: 49.99),
            ),
            QuickFilterOption(
              id: 'insurance:health-premium-50-100',
              label: '€50 – €100',
              match: (o) => _priceRange(o, 50, 100),
            ),
            QuickFilterOption(
              id: 'insurance:health-premium-over100',
              label: 'Over €100',
              match: (o) => _price(o, min: 100.01),
            ),
          ],
        ),
        // ── Travel (folds nomad) ─────────────────────────────────────
        QuickFilterGroup(
          dimension: 'insurance:travel-length',
          label: 'Trip length',
          options: <QuickFilterOption>[
            QuickFilterOption(
              id: 'insurance:travel-length-30',
              label: 'Up to 30 days',
              match: (o) => _maxDays(o, max: 30),
            ),
            QuickFilterOption(
              id: 'insurance:travel-length-90',
              label: '30 – 90 days',
              match: (o) => _daysInRange(o, 30, 90),
            ),
            QuickFilterOption(
              id: 'insurance:travel-length-long',
              label: '90+ days',
              match: (o) => _maxDays(o, min: 90),
            ),
            QuickFilterOption(
              id: 'insurance:travel-length-rolling',
              label: 'Rolling monthly',
              match: (o) =>
                  (o.subtitle.toLowerCase().contains('rolling') ||
                  o.bestFor.join(' ').toLowerCase().contains('rolling')),
            ),
          ],
        ),
        QuickFilterGroup(
          dimension: 'insurance:travel-activity',
          label: 'Activity',
          options: <QuickFilterOption>[
            QuickFilterOption(
              id: 'insurance:travel-activity-standard',
              label: 'Standard',
              match: (o) => o.attributes.activityLevel == 'standard',
            ),
            QuickFilterOption(
              id: 'insurance:travel-activity-adventure',
              label: 'Adventure / Sports',
              match: (o) =>
                  o.attributes.activityLevel == 'adventure' ||
                  o.attributes.activityLevel == 'sports',
            ),
          ],
        ),
        QuickFilterGroup(
          dimension: 'insurance:travel-medical',
          label: 'Medical cover',
          options: <QuickFilterOption>[
            QuickFilterOption(
              id: 'insurance:travel-medical-500k',
              label: 'Up to €500K',
              match: (o) => _medical(o, max: 500000),
            ),
            QuickFilterOption(
              id: 'insurance:travel-medical-2m',
              label: '€500K – €2M',
              match: (o) => _medicalRange(o, 500000, 2000000),
            ),
            QuickFilterOption(
              id: 'insurance:travel-medical-over2m',
              label: 'Over €2M',
              match: (o) => _medical(o, min: 2000000),
            ),
          ],
        ),
        // ── Life ─────────────────────────────────────────────────────
        QuickFilterGroup(
          dimension: 'insurance:life-amount',
          label: 'Insured amount',
          options: <QuickFilterOption>[
            QuickFilterOption(
              id: 'insurance:life-amount-small',
              label: 'Up to €100K',
              match: (o) => _coverage(o, max: 100000),
            ),
            QuickFilterOption(
              id: 'insurance:life-amount-mid',
              label: '€100K – €500K',
              match: (o) => _coverageRange(o, 100000, 500000),
            ),
            QuickFilterOption(
              id: 'insurance:life-amount-large',
              label: 'Over €500K',
              match: (o) => _coverage(o, min: 500000),
            ),
          ],
        ),
        QuickFilterGroup(
          dimension: 'insurance:life-family',
          label: 'Family cover',
          options: <QuickFilterOption>[
            QuickFilterOption(
              id: 'insurance:life-family-yes',
              label: 'Includes family',
              match: (o) {
                final hay =
                    '${o.title} ${o.subtitle} ${o.bestFor.join(' ')}'.toLowerCase();
                return hay.contains('family');
              },
            ),
            QuickFilterOption(
              id: 'insurance:life-family-no',
              label: 'Individual only',
              match: (o) {
                final hay =
                    '${o.title} ${o.subtitle} ${o.bestFor.join(' ')}'.toLowerCase();
                return !hay.contains('family');
              },
            ),
          ],
        ),
        // ── Auto ─────────────────────────────────────────────────────
        // P2.6 — Rebracket against real EU auto-liability coverage
        // distribution. Live data: 30M / 50M / 60M / 75M / 100M.
        // Previous "Up to €25M" bracket matched zero offers because
        // EU minimum statutory liability is far above that.
        QuickFilterGroup(
          dimension: 'insurance:auto-liability',
          label: 'Liability cover',
          options: <QuickFilterOption>[
            QuickFilterOption(
              id: 'insurance:auto-liability-50m',
              label: 'Up to €50M',
              match: (o) => _coverage(o, max: 50000000),
            ),
            QuickFilterOption(
              id: 'insurance:auto-liability-80m',
              label: '€50M – €80M',
              match: (o) => _coverageRange(o, 50000000, 80000000),
            ),
            QuickFilterOption(
              id: 'insurance:auto-liability-over80m',
              label: 'Over €80M',
              match: (o) => _coverage(o, min: 80000000),
            ),
          ],
        ),
        // ── Device ───────────────────────────────────────────────────
        // P2.6 — Live data: device coverage 1.2K–3K. Old brackets
        // missed everything (≤€1K = 0 offers, >€3K = 0). New thresholds
        // hit the real distribution: ≤€1,500 / €1,500–€2,500 / >€2,500.
        QuickFilterGroup(
          dimension: 'insurance:device-value',
          label: 'Device value',
          options: <QuickFilterOption>[
            QuickFilterOption(
              id: 'insurance:device-value-1500',
              label: 'Up to €1,500',
              match: (o) => _coverage(o, max: 1500),
            ),
            QuickFilterOption(
              id: 'insurance:device-value-2500',
              label: '€1,500 – €2,500',
              match: (o) => _coverageRange(o, 1500, 2500),
            ),
            QuickFilterOption(
              id: 'insurance:device-value-over2500',
              label: 'Over €2,500',
              match: (o) => _coverage(o, min: 2500),
            ),
          ],
        ),
      ],
    };

// Flat per-category list, derived from groups. Used by the full filter
// panel sheet (which still renders one chip cluster per dimension via
// its own grouping logic).
final Map<PaynCategory, List<QuickFilterOption>> kQuickFilters =
    <PaynCategory, List<QuickFilterOption>>{
      for (final entry in kQuickFilterGroups.entries)
        entry.key: <QuickFilterOption>[
          for (final group in entry.value) ...group.options,
        ],
    };

// Returns true iff the offer matches the comma-separated filter ids
// (every id must match; missing definition is ignored).
bool applyQuickFilter(PaynOffer offer, String filterIds) {
  if (filterIds.isEmpty) return true;
  final ids = filterIds.split(',').where((s) => s.isNotEmpty);
  for (final id in ids) {
    final option = _lookupOption(id);
    if (option != null && !option.match(offer)) return false;
  }
  return true;
}

QuickFilterOption? _lookupOption(String id) {
  for (final entries in kQuickFilters.values) {
    for (final option in entries) {
      if (option.id == id) return option;
    }
  }
  return null;
}

// Mutates a comma-separated id string so that, within the given group,
// only the new id is set (or removed if null/empty). Other dimensions'
// selections survive.
String setGroupSelection(
  String current,
  QuickFilterGroup group,
  String? newId,
) {
  final tokens = current
      .split(',')
      .map((t) => t.trim())
      .where((t) => t.isNotEmpty)
      .where((t) => !group.owns(t))
      .toList();
  if (newId != null && newId.isNotEmpty) tokens.add(newId);
  return tokens.join(',');
}

String? activeIdForGroup(String current, QuickFilterGroup group) {
  for (final token in current.split(',')) {
    if (group.owns(token)) return token;
  }
  return null;
}

// ─── Insurance attribute helpers ─────────────────────────────────────────────

bool _maxDays(PaynOffer offer, {int? min, int? max}) {
  final v = offer.attributes.maxTripDays;
  if (v == null) return false;
  if (min != null && v < min) return false;
  if (max != null && v > max) return false;
  return true;
}

bool _daysInRange(PaynOffer offer, int min, int max) {
  final v = offer.attributes.maxTripDays;
  return v != null && v >= min && v <= max;
}

bool _coverage(PaynOffer offer, {num? min, num? max}) {
  final raw = offer.attributes.coverageAmount;
  if (raw == null) return false;
  if (min != null && raw < min) return false;
  if (max != null && raw > max) return false;
  return true;
}

bool _coverageRange(PaynOffer offer, num min, num max) {
  final raw = offer.attributes.coverageAmount;
  return raw != null && raw >= min && raw <= max;
}

bool _price(PaynOffer offer, {num? min, num? max}) {
  final v = offer.attributes.priceAmount;
  if (v == null) return false;
  if (min != null && v < min) return false;
  if (max != null && v > max) return false;
  return true;
}

bool _priceRange(PaynOffer offer, num min, num max) {
  final v = offer.attributes.priceAmount;
  return v != null && v >= min && v <= max;
}

bool _medical(PaynOffer offer, {num? min, num? max}) {
  final v = offer.attributes.medicalCoverage;
  if (v == null) return false;
  if (min != null && v < min) return false;
  if (max != null && v > max) return false;
  return true;
}

bool _medicalRange(PaynOffer offer, num min, num max) {
  final v = offer.attributes.medicalCoverage;
  return v != null && v >= min && v <= max;
}

// ─── Card / banking / business matchers ──────────────────────────────────────

final RegExp _freeFeeRegex = RegExp(
  r'\bfree\b|\b(eur|usd|gbp|chf)\s*0(?:\b|\.0+\b)|\b0\s*(?:eur|usd|gbp|chf)\b|\bfrom\s+(?:€|\$|£)?0(?:\.0+)?\b',
  caseSensitive: false,
);

bool _isMonthlyFeeFree(PaynOffer offer) {
  for (final m in offer.metrics) {
    if (RegExp(
      r'\b(monthly|annual|account)\s+fee\b',
      caseSensitive: false,
    ).hasMatch(m.label)) {
      if (_freeFeeRegex.hasMatch(m.value)) return true;
    }
  }
  return false;
}

bool _isFxFeeZero(PaynOffer offer) {
  for (final m in offer.metrics) {
    if (RegExp(r'\bfx\s*fee\b', caseSensitive: false).hasMatch(m.label)) {
      final value = m.value;
      if (RegExp(r'^\s*0\s*%|\b0\s*%').hasMatch(value)) {
        // Reject "0% up to X then 2%" — any later non-zero percent fails.
        final stripped = value.replaceAll(RegExp(r'0\s*%[^%]*'), ' ');
        if (!RegExp(r'\d+\s*%').hasMatch(stripped)) return true;
      }
    }
  }
  return false;
}

bool _isMultiCurrencyBanking(PaynOffer offer) {
  for (final m in offer.metrics) {
    if (RegExp(
      r'\bcurrencies\b|\bmulti[- ]currency\b',
      caseSensitive: false,
    ).hasMatch(m.label)) {
      return true;
    }
  }
  final hay =
      '${offer.title} ${offer.subtitle} ${offer.bestFor.join(' ')}'
          .toLowerCase();
  return hay.contains('multi-currency') || hay.contains('multi currency');
}

bool _hasInvoicing(PaynOffer offer) {
  final hay =
      '${offer.title} ${offer.subtitle} ${offer.bestFor.join(' ')} ${offer.attributes.searchTags.join(' ')}'
          .toLowerCase();
  return hay.contains('invoic');
}

// ─── Transfer speed ──────────────────────────────────────────────────────────

final RegExp _instantRe = RegExp(
  r'\b(instant|minutes?|real[- ]time|same[- ]day)\b',
  caseSensitive: false,
);
final RegExp _fastRe = RegExp(
  r'\b(24\s*h(?:rs?|ours?)?|next[- ]day|1\s*day\b|0[-–]1\s*days?)\b',
  caseSensitive: false,
);
final RegExp _multiDayRe = RegExp(
  r'\b\d+\s*[-–]\s*\d+\s*days?\b|\b\d+\s*days?\b',
  caseSensitive: false,
);

String _transferHaystack(PaynOffer offer) {
  final speedMetric = offer.metrics.firstWhere(
    (m) => RegExp(r'speed', caseSensitive: false).hasMatch(m.label),
    orElse: () => const PaynMetric(label: '', value: ''),
  );
  if (speedMetric.value.isNotEmpty) return speedMetric.value;
  return '${offer.title} ${offer.subtitle}';
}

bool _isInstantTransfer(PaynOffer offer) =>
    _instantRe.hasMatch(_transferHaystack(offer));
bool _isFastTransfer(PaynOffer offer) {
  final hay = _transferHaystack(offer);
  return _fastRe.hasMatch(hay) && !_instantRe.hasMatch(hay);
}

bool _isMultiDayTransfer(PaynOffer offer) {
  final hay = _transferHaystack(offer);
  if (_instantRe.hasMatch(hay) || _fastRe.hasMatch(hay)) return false;
  return _multiDayRe.hasMatch(hay);
}

// ─── Loans APR ───────────────────────────────────────────────────────────────

double? _lowestApr(PaynOffer offer) {
  for (final m in offer.metrics) {
    if (RegExp(r'\bapr\b', caseSensitive: false).hasMatch(m.label)) {
      final nums =
          RegExp(
            r'(\d+(?:\.\d+)?)\s*%',
          ).allMatches(m.value).map((g) => double.parse(g.group(1)!)).toList();
      if (nums.isNotEmpty) {
        nums.sort();
        return nums.first;
      }
    }
  }
  return null;
}

bool _aprUnder5(PaynOffer offer) {
  final apr = _lowestApr(offer);
  return apr != null && apr < 5;
}

bool _apr5To10(PaynOffer offer) {
  final apr = _lowestApr(offer);
  return apr != null && apr >= 5 && apr < 10;
}

bool _aprOver10(PaynOffer offer) {
  final apr = _lowestApr(offer);
  return apr != null && apr >= 10;
}

// ─── Investments platform ────────────────────────────────────────────────────

bool _isEtfPlatform(PaynOffer offer) {
  if (offer.attributes.accessType == 'etf_dealing') return true;
  final hay =
      '${offer.title} ${offer.subtitle} ${offer.bestFor.join(' ')}'.toLowerCase();
  return hay.contains('etf');
}

bool _isStocksPlatform(PaynOffer offer) {
  if (offer.attributes.accessType == 'stocks_etf') return true;
  if (offer.attributes.accessType == 'multi_asset') return true;
  final hay =
      '${offer.title} ${offer.subtitle} ${offer.bestFor.join(' ')}'.toLowerCase();
  return hay.contains('stocks') ||
      hay.contains('shares') ||
      hay.contains('brokerage');
}

bool _isCryptoPlatform(PaynOffer offer) {
  if (offer.attributes.accessType == 'spot_crypto') return true;
  if (offer.attributes.subtype == 'crypto') return true;
  final hay =
      '${offer.title} ${offer.subtitle} ${offer.bestFor.join(' ')}'.toLowerCase();
  return hay.contains('crypto') ||
      hay.contains('bitcoin') ||
      hay.contains('ethereum');
}

// ─── Savings ─────────────────────────────────────────────────────────────────

double? _highestRate(PaynOffer offer) {
  for (final m in offer.metrics) {
    if (RegExp(
      r'\b(interest|rate|aer|apy)\b',
      caseSensitive: false,
    ).hasMatch(m.label)) {
      final nums =
          RegExp(
            r'(\d+(?:\.\d+)?)\s*%',
          ).allMatches(m.value).map((g) => double.parse(g.group(1)!)).toList();
      if (nums.isNotEmpty) {
        nums.sort();
        return nums.last;
      }
    }
  }
  return null;
}

bool _rate4Plus(PaynOffer offer) {
  final r = _highestRate(offer);
  return r != null && r >= 4;
}

bool _rate3To4(PaynOffer offer) {
  final r = _highestRate(offer);
  return r != null && r >= 3 && r < 4;
}

bool _rateUnder3(PaynOffer offer) {
  final r = _highestRate(offer);
  return r != null && r < 3;
}

double? _minDepositOf(PaynOffer offer) {
  final attrMin = offer.attributes.minDeposit;
  if (attrMin != null && attrMin.isNotEmpty) {
    final cleaned = attrMin.replaceAll(RegExp(r'[,\s]'), '');
    final match = RegExp(r'(\d+(?:\.\d+)?)').firstMatch(cleaned);
    if (match != null) return double.tryParse(match.group(1)!);
  }
  for (final m in offer.metrics) {
    if (RegExp(
      r'\b(min(?:imum)?\s*(?:deposit)?|min)\b',
      caseSensitive: false,
    ).hasMatch(m.label)) {
      final cleaned = m.value.replaceAll(RegExp(r'[,\s]'), '');
      final match = RegExp(r'(\d+(?:\.\d+)?)').firstMatch(cleaned);
      if (match != null) return double.parse(match.group(1)!);
    }
  }
  return null;
}

bool _minDepositLow(PaynOffer offer) {
  final v = _minDepositOf(offer);
  return v != null && v <= 100;
}

bool _minDepositMid(PaynOffer offer) {
  final v = _minDepositOf(offer);
  return v != null && v > 100 && v <= 10000;
}

bool _minDepositHigh(PaynOffer offer) {
  final v = _minDepositOf(offer);
  return v != null && v > 10000;
}

String _accessKind(PaynOffer offer) {
  String? raw;
  for (final m in offer.metrics) {
    if (RegExp(r'\baccess\b', caseSensitive: false).hasMatch(m.label)) {
      raw = m.value;
      break;
    }
  }
  final hay =
      '${raw ?? ''} ${offer.bestFor.join(' ')} ${offer.title}'.toLowerCase();
  if (RegExp(
    r'\b(instant|same[- ]day|on[- ]demand|anytime|flexible)\b',
  ).hasMatch(hay)) {
    return 'instant';
  }
  if (RegExp(r'\b(notice|\d+[- ]day\s+notice)\b').hasMatch(hay)) return 'notice';
  if (RegExp(r'\b(fixed|term|locked|maturity|bond)\b').hasMatch(hay)) {
    return 'fixed';
  }
  return 'unknown';
}

bool _accessInstant(PaynOffer offer) => _accessKind(offer) == 'instant';
bool _accessNotice(PaynOffer offer) => _accessKind(offer) == 'notice';
bool _accessFixed(PaynOffer offer) => _accessKind(offer) == 'fixed';

// ─── Loans amount / term ─────────────────────────────────────────────────────

double? _loanMaxAmount(PaynOffer offer) {
  final a = offer.attributes.maxAmount;
  if (a != null) return a.toDouble();
  for (final m in offer.metrics) {
    if (RegExp(r'\bamount\b', caseSensitive: false).hasMatch(m.label)) {
      final nums =
          RegExp(r'(\d[\d,]*)')
              .allMatches(m.value.replaceAll(' ', ''))
              .map((g) => double.tryParse(g.group(1)!.replaceAll(',', '')) ?? 0)
              .where((v) => v > 0)
              .toList();
      if (nums.isNotEmpty) {
        nums.sort();
        return nums.last;
      }
    }
  }
  return null;
}

double? _loanMaxTerm(PaynOffer offer) {
  final t = offer.attributes.maxTermMonths;
  if (t != null) return t.toDouble();
  for (final m in offer.metrics) {
    if (RegExp(r'\bterm\b', caseSensitive: false).hasMatch(m.label)) {
      final nums =
          RegExp(r'(\d+)')
              .allMatches(m.value)
              .map((g) => double.tryParse(g.group(1)!) ?? 0)
              .toList();
      if (nums.isNotEmpty) {
        nums.sort();
        return nums.last;
      }
    }
  }
  return null;
}

bool _loanAmountSmall(PaynOffer offer) {
  final v = _loanMaxAmount(offer);
  return v != null && v <= 25000;
}

bool _loanAmountMid(PaynOffer offer) {
  final v = _loanMaxAmount(offer);
  return v != null && v > 25000 && v <= 75000;
}

bool _loanAmountLarge(PaynOffer offer) {
  final v = _loanMaxAmount(offer);
  return v != null && v > 75000;
}

bool _loanTermShort(PaynOffer offer) {
  final v = _loanMaxTerm(offer);
  return v != null && v <= 24;
}

bool _loanTermMid(PaynOffer offer) {
  final v = _loanMaxTerm(offer);
  return v != null && v > 24 && v <= 60;
}

bool _loanTermLong(PaynOffer offer) {
  final v = _loanMaxTerm(offer);
  return v != null && v > 60;
}

// ─── Investments: robo / recurring / skill level ─────────────────────────────

bool _isRoboAdvisor(PaynOffer offer) {
  if (offer.attributes.accessType == 'robo_advisor') return true;
  final hay =
      '${offer.title} ${offer.subtitle} ${offer.bestFor.join(' ')}'.toLowerCase();
  return hay.contains('robo') || hay.contains('managed portfolio');
}

bool _supportsRecurring(PaynOffer offer) {
  if (offer.attributes.recurringSupported == true) return true;
  final hay =
      '${offer.subtitle} ${offer.bestFor.join(' ')} ${offer.attributes.searchTags.join(' ')}'
          .toLowerCase();
  return hay.contains('recurring') || hay.contains('savings plan');
}

bool _isBeginnerFriendly(PaynOffer offer) {
  if (offer.attributes.beginnerFriendly == true) return true;
  if (offer.attributes.platformUxLevel == 'beginner') return true;
  final hay =
      '${offer.subtitle} ${offer.bestFor.join(' ')}'.toLowerCase();
  return hay.contains('beginner') ||
      hay.contains('first-time') ||
      hay.contains('first time');
}

bool _isAdvancedTools(PaynOffer offer) {
  if (offer.attributes.platformUxLevel == 'advanced') return true;
  if (offer.attributes.platformUxLevel == 'pro') return true;
  final hay =
      '${offer.subtitle} ${offer.bestFor.join(' ')}'.toLowerCase();
  return hay.contains('advanced') ||
      hay.contains(' pro ') ||
      hay.contains('professional');
}
