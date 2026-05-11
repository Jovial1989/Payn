import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/localization/app_localizations_ext.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/models/payn_models.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';
import 'package:payn_mobile/shared/widgets/offer_card.dart';
import 'package:payn_mobile/shared/widgets/payn_shell.dart';
import 'package:payn_mobile/shared/widgets/provider_badge.dart';
import 'package:payn_mobile/shared/widgets/section_card.dart';

class SavedScreen extends StatelessWidget {
  const SavedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = AppScope.of(context);
    final theme = Theme.of(context);
    final l10n = context.l10n;
    final offers = controller.savedOffers;
    final suggestions = controller.homeRecommendations.take(2).toList();

    return SafeArea(
      bottom: false,
      child: CustomScrollView(
        physics: const BouncingScrollPhysics(
          parent: AlwaysScrollableScrollPhysics(),
        ),
        slivers: <Widget>[
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(l10n.savedTitle, style: theme.textTheme.headlineMedium),
                  const SizedBox(height: 6),
                  Text(
                    l10n.savedSubtitle,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: PaynColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 18),
                  _SavedSummary(controller: controller),
                ],
              ),
            ),
          ),
          if (offers.isEmpty)
            SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.fromLTRB(
                  20,
                  20,
                  20,
                  PaynShell.contentBottomInset(context),
                ),
                child: Column(
                  children: <Widget>[
                    EmptyStateCard(
                      title: l10n.savedEmptyTitle,
                      description: l10n.savedEmptyDescription,
                      action: FilledButton(
                        onPressed: () => context.go('/explore'),
                        child: Text(l10n.savedFindOffers),
                      ),
                    ),
                    if (suggestions.isNotEmpty) ...<Widget>[
                      const SizedBox(height: 20),
                      Align(
                        alignment: Alignment.centerLeft,
                        child: Text(
                          l10n.savedSuggested,
                          style: theme.textTheme.titleLarge,
                        ),
                      ),
                      const SizedBox(height: 12),
                      ...suggestions.map(
                        (item) => Padding(
                          padding: const EdgeInsets.only(bottom: 14),
                          child: OfferCard(
                            offer: item.offer,
                            reasons: item.reasons,
                            tradeoff: item.tradeoff,
                            saved: false,
                            motionIndex: 0,
                            onTap:
                                () => context.push('/offer/${item.offer.id}'),
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
            )
          else ...<Widget>[
            if (controller.compareOffers.isNotEmpty)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                  child: SectionCard(
                    title: l10n.savedCompareTrayTitle,
                    subtitle:
                        controller.compareCount >= 2
                            ? l10n.savedCompareTrayReady
                            : l10n.savedCompareTrayNeedMore(
                              2 - controller.compareCount,
                            ),
                    child: Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: <Widget>[
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children:
                                controller.compareOffers
                                    .take(3)
                                    .map(
                                      (offer) => Padding(
                                        padding: const EdgeInsets.only(
                                          right: 8,
                                        ),
                                        child: ProviderBadge(
                                          offer: offer,
                                          compact: true,
                                        ),
                                      ),
                                    )
                                    .toList(),
                          ),
                        ),
                        FilledButton(
                          onPressed:
                              controller.compareCount >= 2
                                  ? () => context.push('/compare')
                                  : null,
                          child: Text(l10n.savedCompare),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              sliver: SliverList.separated(
                itemCount: offers.length,
                separatorBuilder: (_, __) => const SizedBox(height: 14),
                itemBuilder: (context, index) {
                  final offer = offers[index];
                  return OfferCard(
                    offer: offer,
                    reasons: controller.reasonsFor(offer),
                    tradeoff: controller.tradeoffFor(offer),
                    saved: true,
                    motionIndex: index,
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
          ],
          SliverPadding(
            padding: EdgeInsets.only(
              bottom: PaynShell.contentBottomInset(context),
            ),
          ),
        ],
      ),
    );
  }
}

class _SavedSummary extends StatelessWidget {
  const _SavedSummary({required this.controller});

  final dynamic controller;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: <Color>[Color(0xFFFFFFFF), Color(0xFFF7FBF8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(PaynRadius.panel),
        border: Border.all(color: PaynColors.outlineSubtle),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Row(
        children: <Widget>[
          Expanded(
            child: _SummaryMetric(
              label: context.l10n.homeSaved,
              value: '${controller.savedCount}',
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: _SummaryMetric(
              label: context.l10n.savedCompare,
              value: '${controller.compareCount}',
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: _SummaryMetric(
              label: context.l10n.savedRecent,
              value: '${controller.recentOffers.length}',
            ),
          ),
        ],
      ),
    );
  }
}

class _SummaryMetric extends StatelessWidget {
  const _SummaryMetric({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
      decoration: BoxDecoration(
        color: PaynColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: PaynColors.outlineSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(label, style: theme.textTheme.labelMedium),
          const SizedBox(height: 8),
          Text(
            value,
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w800,
              fontSize: 20,
            ),
          ),
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

    return Material(
      color: selected ? PaynColors.accentSurface : PaynColors.surfaceRaised,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: () async {
          final ok = await controller.toggleCompare(offer.id);
          if (!context.mounted) return;
          if (!ok) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(context.l10n.savedCompareLimit)),
            );
          }
        },
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Icon(
                selected
                    ? Icons.check_circle_rounded
                    : Icons.add_circle_outline_rounded,
                size: 18,
                color: selected ? PaynColors.accent : PaynColors.textSecondary,
              ),
              const SizedBox(width: 8),
              Text(
                selected
                    ? context.l10n.savedAddedToCompare
                    : context.l10n.savedAddToCompare,
                style: theme.textTheme.labelLarge?.copyWith(
                  color:
                      selected ? PaynColors.accent : PaynColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
