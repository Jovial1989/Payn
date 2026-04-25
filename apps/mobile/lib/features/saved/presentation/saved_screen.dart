import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';
import 'package:payn_mobile/shared/widgets/offer_card.dart';
import 'package:payn_mobile/shared/widgets/provider_badge.dart';

class SavedScreen extends StatelessWidget {
  const SavedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = AppScope.of(context);
    final theme = Theme.of(context);
    final offers = controller.savedOffers;
    final suggestions = controller.homeRecommendations.take(2).toList();

    return SafeArea(
      bottom: false,
      child: CustomScrollView(
        physics: const BouncingScrollPhysics(
          parent: AlwaysScrollableScrollPhysics(),
        ),
        slivers: <Widget>[
          // ── Header ──
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: Row(
                children: <Widget>[
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text('Saved', style: theme.textTheme.titleLarge),
                        const SizedBox(height: 2),
                        Text(
                          '${controller.savedCount} offers · ${controller.compareCount} to compare',
                          style: theme.textTheme.labelMedium,
                        ),
                      ],
                    ),
                  ),
                  FilledButton.icon(
                    onPressed:
                        controller.compareCount >= 2
                            ? () => context.push('/compare')
                            : null,
                    icon: const Icon(Icons.compare_arrows_rounded, size: 16),
                    label: const Text('Compare'),
                    style: FilledButton.styleFrom(
                      minimumSize: const Size(0, 36),
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Empty state ──
          if (offers.isEmpty)
            SliverFillRemaining(
              hasScrollBody: false,
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(40),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      Container(
                        width: 88,
                        height: 88,
                        decoration: BoxDecoration(
                          color: PaynColors.surfaceDim,
                          borderRadius: BorderRadius.circular(28),
                        ),
                        alignment: Alignment.center,
                        child: const Icon(
                          Icons.bookmark_border_rounded,
                          size: 42,
                          color: PaynColors.textTertiary,
                        ),
                      ),
                      const SizedBox(height: 14),
                      Text(
                        'No saved offers yet',
                        style: theme.textTheme.titleMedium,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Save offers from Explore to build your shortlist.',
                        style: theme.textTheme.bodyMedium,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      FilledButton(
                        onPressed: () => context.go('/explore'),
                        style: FilledButton.styleFrom(
                          minimumSize: const Size(0, 48),
                        ),
                        child: const Text('Find my best offers'),
                      ),
                      if (suggestions.isNotEmpty) ...<Widget>[
                        const SizedBox(height: 24),
                        Align(
                          alignment: Alignment.centerLeft,
                          child: Text(
                            'Suggested offers',
                            style: theme.textTheme.titleSmall,
                          ),
                        ),
                        const SizedBox(height: 12),
                        ...suggestions.map(
                          (item) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: OfferCard(
                              offer: item.offer,
                              reasons: item.reasons,
                              tradeoff: item.tradeoff,
                              saved: false,
                              onTap: () => context.push('/offer/${item.offer.id}'),
                              onSave: () => controller.toggleSaved(item.offer.id),
                              onProviderTap:
                                  () => showProviderHandoffSheet(
                                    context,
                                    offer: item.offer,
                                  ),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            )
          else ...<Widget>[
            // ── Saved offers ──
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
              sliver: SliverList.separated(
                itemCount: offers.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (context, index) {
                  final offer = offers[index];
                  return OfferCard(
                    offer: offer,
                    reasons: controller.reasonsFor(offer),
                    tradeoff: controller.tradeoffFor(offer),
                    saved: true,
                    onTap: () => context.push('/offer/${offer.id}'),
                    onSave: () => controller.toggleSaved(offer.id),
                    onProviderTap:
                        () => showProviderHandoffSheet(context, offer: offer),
                    showCategory: true,
                    footer: _CompareToggle(offer: offer),
                  );
                },
              ),
            ),

            // ── Quick compare preview ──
            if (controller.compareOffers.isNotEmpty)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: PaynColors.surfaceDim,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: <Widget>[
                        Expanded(
                          child: Row(
                            children: <Widget>[
                              ...controller.compareOffers
                                  .take(3)
                                  .map(
                                    (offer) => Padding(
                                      padding: const EdgeInsets.only(right: 6),
                                      child: ProviderBadge(
                                        offer: offer,
                                        compact: true,
                                      ),
                                    ),
                                  ),
                              const SizedBox(width: 4),
                              Text(
                                controller.compareCount >= 2
                                    ? 'Ready'
                                    : 'Pick ${2 - controller.compareCount} more',
                                style: theme.textTheme.labelMedium,
                              ),
                            ],
                          ),
                        ),
                        if (controller.compareCount >= 2)
                          GestureDetector(
                            onTap: () => context.push('/compare'),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: PaynColors.text,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                'Compare',
                                style: theme.textTheme.labelMedium?.copyWith(
                                  color: PaynColors.surface,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),

            // ── Browse more CTA ──
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                child: OutlinedButton(
                  onPressed: () => context.go('/explore'),
                  child: const Text('Browse more offers'),
                ),
              ),
            ),
          ],

          const SliverPadding(padding: EdgeInsets.only(bottom: 80)),
        ],
      ),
    );
  }
}

class _CompareToggle extends StatelessWidget {
  const _CompareToggle({required this.offer});

  final PaynOffer offer;

  @override
  Widget build(BuildContext context) {
    final controller = AppScope.of(context);
    final selected = controller.isCompared(offer.id);
    final theme = Theme.of(context);

    return GestureDetector(
      onTap: () async {
        final ok = await controller.toggleCompare(offer.id);
        if (!context.mounted) return;
        if (!ok) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Compare supports up to 3 offers.')),
          );
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? PaynColors.text : PaynColors.surfaceDim,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Icon(
              selected
                  ? Icons.check_circle_rounded
                  : Icons.add_circle_outline_rounded,
              size: 14,
              color: selected ? PaynColors.surface : PaynColors.textSecondary,
            ),
            const SizedBox(width: 4),
            Text(
              selected ? 'In compare' : 'Add to compare',
              style: theme.textTheme.labelMedium?.copyWith(
                color: selected ? PaynColors.surface : PaynColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
