import 'package:flutter/material.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';

class ProviderBrand {
  const ProviderBrand({
    required this.mark,
    required this.background,
    required this.foreground,
  });

  final String mark;
  final Color background;
  final Color foreground;
}

const Map<String, ProviderBrand> _providerBrands = <String, ProviderBrand>{
  'Revolut': ProviderBrand(
    mark: 'R',
    background: Color(0xFF191C1F),
    foreground: Colors.white,
  ),
  'Wise': ProviderBrand(
    mark: 'W',
    background: Color(0xFF9FE870),
    foreground: Color(0xFF163300),
  ),
  'N26': ProviderBrand(
    mark: 'N',
    background: Color(0xFF36A18B),
    foreground: Colors.white,
  ),
  'Klarna': ProviderBrand(
    mark: 'K',
    background: Color(0xFFFFB3C7),
    foreground: Color(0xFF17120F),
  ),
  'bunq': ProviderBrand(
    mark: 'b',
    background: Color(0xFF00B7A8),
    foreground: Colors.white,
  ),
  'Curve': ProviderBrand(
    mark: 'C',
    background: Color(0xFF12123B),
    foreground: Colors.white,
  ),
  'Santander': ProviderBrand(
    mark: 'S',
    background: Color(0xFFEC0000),
    foreground: Colors.white,
  ),
  'ING': ProviderBrand(
    mark: 'ING',
    background: Color(0xFFFF6200),
    foreground: Colors.white,
  ),
  'Allianz': ProviderBrand(
    mark: 'AZ',
    background: Color(0xFF003781),
    foreground: Colors.white,
  ),
  'AXA': ProviderBrand(
    mark: 'AXA',
    background: Color(0xFF0C1C8C),
    foreground: Colors.white,
  ),
  'SafetyWing': ProviderBrand(
    mark: 'SW',
    background: Color(0xFF1D4ED8),
    foreground: Colors.white,
  ),
  'Trade Republic': ProviderBrand(
    mark: 'TR',
    background: Color(0xFF101010),
    foreground: Colors.white,
  ),
  'Scalable Capital': ProviderBrand(
    mark: 'SC',
    background: Color(0xFF1D3B6A),
    foreground: Colors.white,
  ),
  'eToro': ProviderBrand(
    mark: 'ET',
    background: Color(0xFF6CC24A),
    foreground: Color(0xFF0B1307),
  ),
};

const ProviderBrand _fallbackBrand = ProviderBrand(
  mark: '?',
  background: Color(0xFF6B7280),
  foreground: Colors.white,
);

ProviderBrand providerBrandFor(String providerName, String fallbackMark) {
  final brand = _providerBrands[providerName];
  if (brand != null) {
    return brand;
  }

  return ProviderBrand(
    mark: fallbackMark,
    background: _fallbackBrand.background,
    foreground: _fallbackBrand.foreground,
  );
}

class ProviderBadge extends StatelessWidget {
  const ProviderBadge({
    super.key,
    required this.offer,
    this.compact = false,
    this.size,
  });

  final PaynOffer offer;
  final bool compact;
  final double? size;

  @override
  Widget build(BuildContext context) {
    final brand = providerBrandFor(offer.providerName, offer.providerMark);
    final dimension = size ?? (compact ? 38.0 : 48.0);

    return Container(
      width: dimension,
      height: dimension,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(compact ? 12 : 16),
        color: brand.background,
        border: Border.all(color: Colors.white.withValues(alpha: 0.16)),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: Colors.black.withValues(alpha: compact ? 0.08 : 0.12),
            blurRadius: compact ? 10 : 18,
            offset: Offset(0, compact ? 4 : 8),
          ),
        ],
      ),
      alignment: Alignment.center,
      child: Text(
        brand.mark,
        style: Theme.of(context).textTheme.labelLarge?.copyWith(
          color: brand.foreground,
          fontWeight: FontWeight.w800,
          fontSize: compact ? 12 : 14,
        ),
      ),
    );
  }
}

Future<void> showProviderHandoffSheet(
  BuildContext context, {
  required PaynOffer offer,
}) {
  return showModalBottomSheet<void>(
    context: context,
    useSafeArea: true,
    builder: (context) {
      final theme = Theme.of(context);
      return Padding(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              children: <Widget>[
                ProviderBadge(offer: offer, compact: true),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        offer.providerName,
                        style: theme.textTheme.titleMedium,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Provider handoff',
                        style: theme.textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              'Payn would continue into the provider journey for ${offer.title} using the destination below.',
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: 14),
            SelectableText(
              offer.providerWebsiteUrl,
              style: theme.textTheme.bodyLarge?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 18),
            FilledButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Done'),
            ),
          ],
        ),
      );
    },
  );
}
