import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';
import 'package:payn_mobile/shared/widgets/provider_badge.dart';

class OfferDetailScreen extends StatefulWidget {
  const OfferDetailScreen({super.key, required this.offerId});

  final String offerId;

  @override
  State<OfferDetailScreen> createState() => _OfferDetailScreenState();
}

class _OfferDetailScreenState extends State<OfferDetailScreen> {
  bool _tracked = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_tracked) return;
    _tracked = true;
    AppScope.of(context).recordOfferView(widget.offerId);
  }

  @override
  Widget build(BuildContext context) {
    final controller = AppScope.of(context);
    final theme = Theme.of(context);
    final offer = controller.offerById(widget.offerId);

    if (offer == null) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(child: Text('Offer no longer available.')),
      );
    }

    final reasons = controller.reasonsFor(offer);
    final ranked = controller.rankedOfferFor(offer);
    final isSaved = controller.isSaved(offer.id);
    final isCompared = controller.isCompared(offer.id);

    return Scaffold(
      appBar: AppBar(
        title: Text(offer.category.label),
        actions: <Widget>[
          IconButton(
            onPressed: () => controller.toggleSaved(offer.id),
            icon: Icon(
              isSaved ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 40),
        physics: const BouncingScrollPhysics(),
        children: <Widget>[
          // ── Header ──
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              ProviderBadge(offer: offer),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(offer.providerName, style: theme.textTheme.labelLarge),
                    const SizedBox(height: 2),
                    Text(
                      offer.title,
                      style: theme.textTheme.headlineMedium?.copyWith(
                        fontSize: 22,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            offer.subtitle,
            style: theme.textTheme.bodyLarge?.copyWith(
              color: PaynColors.textSecondary,
            ),
          ),

          // ── Score badge ──
          const SizedBox(height: 12),
          Row(
            children: <Widget>[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color:
                      ranked.score >= 110
                          ? PaynColors.positiveSurface
                          : PaynColors.accentSurface,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  ranked.score >= 110 ? 'Best option' : 'Strong match',
                  style: theme.textTheme.labelMedium?.copyWith(
                    color:
                        ranked.score >= 110
                            ? PaynColors.positive
                            : PaynColors.accent,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: PaynColors.surfaceDim,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  offer.category.label,
                  style: theme.textTheme.labelMedium,
                ),
              ),
            ],
          ),

          // ── Metrics ──
          const SizedBox(height: 16),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            mainAxisSpacing: 6,
            crossAxisSpacing: 6,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 2.2,
            children:
                offer.metrics.map((metric) {
                  return Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: PaynColors.surfaceDim,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: <Widget>[
                        Text(metric.label, style: theme.textTheme.labelMedium),
                        const SizedBox(height: 2),
                        Text(metric.value, style: theme.textTheme.titleMedium),
                      ],
                    ),
                  );
                }).toList(),
          ),

          // ── Match reasons ──
          if (reasons.isNotEmpty) ...<Widget>[
            const SizedBox(height: 16),
            Text(
              'Why this result',
              style: theme.textTheme.labelLarge?.copyWith(
                color: PaynColors.textSecondary,
              ),
            ),
            const SizedBox(height: 6),
            ...reasons.map(
              (reason) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    const Padding(
                      padding: EdgeInsets.only(top: 2),
                      child: Icon(
                        Icons.check_circle_rounded,
                        size: 14,
                        color: PaynColors.positive,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        reason,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: PaynColors.text,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],

          // ── Best for ──
          if (offer.bestFor.isNotEmpty) ...<Widget>[
            const SizedBox(height: 12),
            Wrap(
              spacing: 4,
              runSpacing: 4,
              children:
                  offer.bestFor
                      .map(
                        (item) => Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: PaynColors.surfaceDim,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            item,
                            style: theme.textTheme.labelMedium?.copyWith(
                              color: PaynColors.text,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      )
                      .toList(),
            ),
          ],

          // ── Tradeoff ──
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: PaynColors.warningSurface,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                const Padding(
                  padding: EdgeInsets.only(top: 1),
                  child: Icon(
                    Icons.info_outline_rounded,
                    size: 14,
                    color: PaynColors.warning,
                  ),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        'Tradeoff',
                        style: theme.textTheme.labelLarge?.copyWith(
                          color: PaynColors.warning,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        controller.tradeoffFor(offer),
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: PaynColors.warning,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ── Actions ──
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: () => showProviderHandoffSheet(context, offer: offer),
            icon: const Icon(Icons.open_in_new_rounded, size: 16),
            label: const Text('Continue to provider'),
          ),
          const SizedBox(height: 8),
          Row(
            children: <Widget>[
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => controller.toggleSaved(offer.id),
                  icon: Icon(
                    isSaved
                        ? Icons.bookmark_rounded
                        : Icons.bookmark_border_rounded,
                    size: 16,
                  ),
                  label: Text(isSaved ? 'Saved' : 'Save'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed:
                      isSaved
                          ? () async {
                            final ok = await controller.toggleCompare(offer.id);
                            if (!context.mounted) return;
                            if (!ok) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text(
                                    'Compare supports up to 3 offers.',
                                  ),
                                ),
                              );
                              return;
                            }
                            context.push('/compare');
                          }
                          : null,
                  icon: Icon(
                    isCompared
                        ? Icons.compare_arrows_rounded
                        : Icons.add_circle_outline_rounded,
                    size: 16,
                  ),
                  label: Text(isCompared ? 'Comparing' : 'Compare'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
