import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
            onPressed: () {
              HapticFeedback.selectionClick();
              controller.toggleSaved(offer.id);
            },
            icon: Icon(
              isSaved ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
            ),
          ),
        ],
      ),
      // ── Sticky primary CTA ──
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
          child: FilledButton.icon(
            onPressed: () {
              HapticFeedback.lightImpact();
              showProviderHandoffSheet(context, offer: offer);
            },
            icon: const Icon(Icons.open_in_new_rounded, size: 16),
            label: const Text('Continue to provider'),
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        physics: const BouncingScrollPhysics(),
        children: <Widget>[
          // ── Header ──
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              ProviderBadge(offer: offer),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      offer.providerName,
                      style: theme.textTheme.labelLarge?.copyWith(
                        color: PaynColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      offer.title,
                      style: theme.textTheme.headlineMedium?.copyWith(
                        fontSize: 22,
                        letterSpacing: -0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            offer.subtitle,
            style: theme.textTheme.bodyLarge?.copyWith(
              color: PaynColors.textSecondary,
              height: 1.5,
            ),
          ),

          // ── Score badges ──
          const SizedBox(height: 14),
          Row(
            children: <Widget>[
              _Badge(
                label: ranked.score >= 110 ? 'Best option' : 'Strong match',
                bg: ranked.score >= 110
                    ? PaynColors.positiveSurface
                    : PaynColors.accentSurface,
                fg: ranked.score >= 110
                    ? PaynColors.positive
                    : PaynColors.accent,
              ),
              const SizedBox(width: 6),
              _Badge(
                label: offer.category.label,
                bg: PaynColors.surfaceDim,
                fg: PaynColors.textSecondary,
              ),
            ],
          ),

          // ── Metrics grid ──
          const SizedBox(height: 20),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 2.0,
            children: offer.metrics.map((metric) {
              return Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: PaynColors.surfaceDim,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    Text(metric.label, style: theme.textTheme.labelMedium),
                    const SizedBox(height: 4),
                    Text(metric.value, style: theme.textTheme.titleMedium),
                  ],
                ),
              );
            }).toList(),
          ),

          // ── Match reasons ──
          if (reasons.isNotEmpty) ...<Widget>[
            const SizedBox(height: 20),
            Text(
              'Why this result',
              style: theme.textTheme.titleMedium,
            ),
            const SizedBox(height: 10),
            ...reasons.map(
              (reason) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    const Padding(
                      padding: EdgeInsets.only(top: 2),
                      child: Icon(
                        Icons.check_circle_rounded,
                        size: 16,
                        color: PaynColors.positive,
                      ),
                    ),
                    const SizedBox(width: 8),
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
              spacing: 6,
              runSpacing: 6,
              children: offer.bestFor.map((item) {
                return Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: PaynColors.surfaceDim,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: PaynColors.outlineSubtle),
                  ),
                  child: Text(
                    item,
                    style: theme.textTheme.labelMedium?.copyWith(
                      color: PaynColors.text,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                );
              }).toList(),
            ),
          ],

          // ── Tradeoff ──
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: PaynColors.warningSurface,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                const Padding(
                  padding: EdgeInsets.only(top: 1),
                  child: Icon(
                    Icons.info_outline_rounded,
                    size: 16,
                    color: PaynColors.warning,
                  ),
                ),
                const SizedBox(width: 8),
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
                      const SizedBox(height: 3),
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

          // ── Secondary actions ──
          const SizedBox(height: 16),
          Row(
            children: <Widget>[
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    HapticFeedback.selectionClick();
                    controller.toggleSaved(offer.id);
                  },
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
                  onPressed: isSaved
                      ? () async {
                          HapticFeedback.selectionClick();
                          final ok =
                              await controller.toggleCompare(offer.id);
                          if (!context.mounted) return;
                          if (!ok) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content:
                                    Text('Compare supports up to 3 offers.'),
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

// ─────────────────────────────────────────────────
// Badge
// ─────────────────────────────────────────────────

class _Badge extends StatelessWidget {
  const _Badge({required this.label, required this.bg, required this.fg});

  final String label;
  final Color bg;
  final Color fg;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
          color: fg,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
