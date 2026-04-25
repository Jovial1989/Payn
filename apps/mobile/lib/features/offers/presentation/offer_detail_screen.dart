import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
    final primaryMetric = offer.metrics.isNotEmpty ? offer.metrics.first : null;
    final secondaryMetrics = offer.metrics.skip(1).take(3).toList();

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
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 10),
          child: FilledButton.icon(
            onPressed: () {
              HapticFeedback.lightImpact();
              showProviderHandoffSheet(context, offer: offer);
            },
            style: FilledButton.styleFrom(minimumSize: const Size(0, 56)),
            icon: const Icon(Icons.lock_outline_rounded, size: 16),
            label: const Text('Check my rate'),
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
        physics: const BouncingScrollPhysics(),
        children: <Widget>[
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: PaynColors.surface,
              borderRadius: BorderRadius.circular(PaynRadius.panel),
              border: Border.all(color: PaynColors.outlineSubtle),
              boxShadow: <BoxShadow>[
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 26,
                  offset: const Offset(0, 12),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
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
                              fontSize: 24,
                              letterSpacing: -0.7,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Text(
                  primaryMetric?.label.toUpperCase() ?? offer.category.label.toUpperCase(),
                  style: theme.textTheme.labelMedium?.copyWith(
                    fontSize: 10,
                    letterSpacing: 1.7,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  primaryMetric?.value ?? 'On request',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontSize: 40,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -1.8,
                    height: 0.95,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  offer.subtitle,
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: PaynColors.textSecondary,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: <Widget>[
                    _Badge(
                      label: ranked.score >= 110 ? 'Best option' : 'Strong match',
                      bg:
                          ranked.score >= 110
                              ? PaynColors.positiveSurface
                              : PaynColors.accentSurface,
                      fg:
                          ranked.score >= 110
                              ? PaynColors.positive
                              : PaynColors.accent,
                    ),
                    _Badge(
                      label: offer.category.label,
                      bg: PaynColors.surfaceDim,
                      fg: PaynColors.textSecondary,
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          _SectionCard(
            title: 'Rates',
            child: Column(
              children:
                  offer.metrics
                      .map(
                        (metric) => Padding(
                          padding: EdgeInsets.only(
                            bottom: identical(metric, offer.metrics.last) ? 0 : 18,
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Expanded(
                                child: Text(
                                  metric.label,
                                  style: theme.textTheme.labelLarge?.copyWith(
                                    color: PaynColors.textSecondary,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Text(
                                metric.value,
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: -0.4,
                                ),
                              ),
                            ],
                          ),
                        ),
                      )
                      .toList(),
            ),
          ),
          if (reasons.isNotEmpty) ...<Widget>[
            const SizedBox(height: 16),
            _SectionCard(
              title: 'Benefits',
              child: Column(
                children:
                    reasons
                        .map(
                          (reason) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
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
                                const SizedBox(width: 10),
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
                        )
                        .toList(),
              ),
            ),
          ],
          const SizedBox(height: 16),
          _SectionCard(
            title: 'Tradeoffs',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  controller.tradeoffFor(offer),
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: PaynColors.text,
                  ),
                ),
                if (secondaryMetrics.isNotEmpty) ...<Widget>[
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children:
                        secondaryMetrics
                            .map(
                              (metric) => Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 10,
                                ),
                                decoration: BoxDecoration(
                                  color: PaynColors.surfaceDim,
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisSize: MainAxisSize.min,
                                  children: <Widget>[
                                    Text(
                                      metric.label.toUpperCase(),
                                      style: theme.textTheme.labelMedium?.copyWith(
                                        fontSize: 10,
                                        letterSpacing: 1.4,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      metric.value,
                                      style: theme.textTheme.labelLarge?.copyWith(
                                        color: PaynColors.text,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            )
                            .toList(),
                  ),
                ],
              ],
            ),
          ),
          if (offer.bestFor.isNotEmpty) ...<Widget>[
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children:
                  offer.bestFor
                      .map(
                        (item) => Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: PaynColors.surfaceDim,
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            item,
                            style: theme.textTheme.labelMedium?.copyWith(
                              color: PaynColors.textSecondary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      )
                      .toList(),
            ),
          ],
        ],
      ),
    );
  }
}

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
        borderRadius: BorderRadius.circular(999),
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

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: PaynColors.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: PaynColors.outlineSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(title, style: theme.textTheme.titleMedium),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}
