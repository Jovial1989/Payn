import 'package:flutter/material.dart';
import 'package:payn_mobile/shared/app_scaffold.dart';

enum MarketplaceSection { loans, cards, transfers, exchange }

class MarketplaceScreen extends StatelessWidget {
  const MarketplaceScreen({super.key, required this.section});

  final MarketplaceSection section;

  static const _content = <MarketplaceSection, _MarketplaceContent>{
    MarketplaceSection.loans: _MarketplaceContent(
      title: 'Loans',
      subtitle:
          'Review borrowing options with a clearer view of monthly cost, total repayment, and flexibility.',
      panelLead:
          'Start with the signals that change the real borrowing decision, not just the headline rate.',
      icon: Icons.account_balance_outlined,
      focusAreas: ['Monthly repayment', 'Total cost', 'Early repayment rules'],
      bestFor: [
        'Planned borrowing with a clear repayment window.',
        'Refinancing when total cost matters more than a loud headline APR.',
        'Shortlisting offers before going through a full eligibility check.',
      ],
      watchFor: [
        'Promotional rates that reset later.',
        'Origination, setup, or broker fees added outside the first rate view.',
        'Penalties that reduce the value of paying back early.',
      ],
      decisionLens:
          'Balance monthly comfort with the total amount repaid over time.',
      bestMatch:
          'Borrowers who want a cleaner first pass before opening a provider application.',
    ),
    MarketplaceSection.cards: _MarketplaceContent(
      title: 'Cards',
      subtitle:
          'Scan card options with attention on fees, everyday use, and travel fit.',
      panelLead:
          'Compare the fee structure and the real usage pattern before rewards or perks take over the screen.',
      icon: Icons.credit_card_outlined,
      focusAreas: ['Card fees', 'FX and ATM costs', 'Rewards structure'],
      bestFor: [
        'Everyday spending with a predictable cost profile.',
        'Travel usage where foreign currency fees matter.',
        'Shortlisting cards by control, fee discipline, and practical value.',
      ],
      watchFor: [
        'Intro pricing that disappears quickly.',
        'FX markups hidden behind a simple travel message.',
        'Reward rules tied to narrow spend categories or caps.',
      ],
      decisionLens:
          'Match the card to actual spending behavior, not the noisiest perk.',
      bestMatch: 'Users balancing annual cost, travel fit, and everyday value.',
    ),
    MarketplaceSection.transfers: _MarketplaceContent(
      title: 'Transfers',
      subtitle:
          'Compare money transfer routes by delivered amount, timing, and funding method.',
      panelLead:
          'The right transfer is usually the one that lands the most value after fees and timing tradeoffs.',
      icon: Icons.swap_horiz_outlined,
      focusAreas: ['Receive amount', 'Transfer speed', 'Funding method'],
      bestFor: [
        'Personal transfers across countries with a fixed delivery goal.',
        'Contractor payouts or salary moves where timing matters.',
        'Cross-border sending when you want clarity before confirming.',
      ],
      watchFor: [
        'Fees that appear late in the flow.',
        'Card funding that looks fast but costs more than bank funding.',
        'Receiving-side conversion or banking tradeoffs.',
      ],
      decisionLens:
          'Judge the final delivered amount together with speed, not in isolation.',
      bestMatch:
          'Users moving money across borders and comparing value against urgency.',
    ),
    MarketplaceSection.exchange: _MarketplaceContent(
      title: 'Exchange',
      subtitle:
          'Track conversion decisions with focus on spread, timing, and currency coverage.',
      panelLead:
          'A strong exchange view keeps attention on the real rate after spread instead of the headline promise.',
      icon: Icons.currency_exchange_outlined,
      focusAreas: ['Rate spread', 'Available pairs', 'Conversion timing'],
      bestFor: [
        'Travel planning before spending in another currency.',
        'Holding value in more than one currency.',
        'Monitoring regular conversions where spread matters over time.',
      ],
      watchFor: [
        'Wide spreads during volatile periods.',
        'Weekend pricing adjustments.',
        'Settlement timing or minimum conversion limits.',
      ],
      decisionLens:
          'Compare the real executable rate after spread, not the mid-market reference alone.',
      bestMatch:
          'Users watching ongoing currency value rather than one-off conversions only.',
    ),
  };

  @override
  Widget build(BuildContext context) {
    final content = _content[section]!;

    return AppScaffold(
      eyebrow: 'Payn',
      title: content.title,
      subtitle: content.subtitle,
      children: [
        AppPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AppPanelHeader(
                icon: content.icon,
                title: 'Comparison focus',
                subtitle: content.panelLead,
              ),
              const SizedBox(height: 18),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  for (final item in content.focusAreas)
                    AppInfoPill(label: item),
                ],
              ),
            ],
          ),
        ),
        AppPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const AppPanelHeader(
                icon: Icons.task_alt_rounded,
                title: 'Best used for',
                subtitle:
                    'Use this section when you need a faster first pass before going deeper.',
              ),
              const SizedBox(height: 18),
              ..._buildBulletList(
                content.bestFor,
                Icons.check_circle_outline_rounded,
              ),
            ],
          ),
        ),
        AppPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const AppPanelHeader(
                icon: Icons.remove_red_eye_outlined,
                title: 'Watch closely',
                subtitle:
                    'A cleaner decision starts with the tradeoffs that usually get buried.',
              ),
              const SizedBox(height: 18),
              ..._buildBulletList(
                content.watchFor,
                Icons.keyboard_arrow_right_rounded,
              ),
              const SizedBox(height: 18),
              AppDetailRow(label: 'Decision lens', value: content.decisionLens),
              const SizedBox(height: 14),
              AppDetailRow(label: 'Best match', value: content.bestMatch),
            ],
          ),
        ),
      ],
    );
  }

  List<Widget> _buildBulletList(List<String> items, IconData icon) {
    final widgets = <Widget>[];

    for (var index = 0; index < items.length; index++) {
      widgets.add(AppBulletRow(icon: icon, label: items[index]));
      if (index < items.length - 1) {
        widgets.add(const SizedBox(height: 12));
      }
    }

    return widgets;
  }
}

class _MarketplaceContent {
  const _MarketplaceContent({
    required this.title,
    required this.subtitle,
    required this.panelLead,
    required this.icon,
    required this.focusAreas,
    required this.bestFor,
    required this.watchFor,
    required this.decisionLens,
    required this.bestMatch,
  });

  final String title;
  final String subtitle;
  final String panelLead;
  final IconData icon;
  final List<String> focusAreas;
  final List<String> bestFor;
  final List<String> watchFor;
  final String decisionLens;
  final String bestMatch;
}
