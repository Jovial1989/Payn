import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/localization/app_localizations_ext.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/widgets/payn_motion.dart';

class PaynShell extends StatelessWidget {
  const PaynShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  static const double toolbarHeight = 72;
  static const double toolbarTopPadding = 8;

  static double contentBottomInset(BuildContext context) {
    return toolbarHeight + MediaQuery.paddingOf(context).bottom + 12;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      body: navigationShell,
      bottomNavigationBar: _FrostedNavBar(navigationShell: navigationShell),
    );
  }
}

class _FrostedNavBar extends StatelessWidget {
  const _FrostedNavBar({required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.paddingOf(context).bottom;
    final l10n = context.l10n;
    final reduceMotion = PaynMotion.reduce(context);
    final destinations = <_NavItem>[
      _NavItem(
        label: l10n.navHome,
        icon: Icons.home_outlined,
        selectedIcon: Icons.home_rounded,
      ),
      _NavItem(
        label: l10n.navExplore,
        icon: Icons.explore_outlined,
        selectedIcon: Icons.explore_rounded,
      ),
      _NavItem(
        label: l10n.navSaved,
        icon: Icons.bookmark_border_rounded,
        selectedIcon: Icons.bookmark_rounded,
      ),
      _NavItem(
        label: l10n.navProfile,
        icon: Icons.person_outline_rounded,
        selectedIcon: Icons.person_rounded,
      ),
    ];

    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 22, sigmaY: 22),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: const Color(0xF4FFFFFF),
            border: Border(
              top: BorderSide(color: PaynColors.outline.withValues(alpha: 0.7)),
            ),
            boxShadow: <BoxShadow>[
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.06),
                blurRadius: 28,
                offset: const Offset(0, -6),
              ),
            ],
          ),
          child: SafeArea(
            top: false,
            child: SizedBox(
              height: PaynShell.toolbarHeight,
              child: Padding(
                padding: EdgeInsets.fromLTRB(
                  12,
                  PaynShell.toolbarTopPadding,
                  12,
                  bottomInset > 0 ? 6 : 10,
                ),
                child: Stack(
                  children: <Widget>[
                    AnimatedAlign(
                      duration:
                          reduceMotion ? Duration.zero : PaynMotion.medium,
                      curve: PaynMotion.ease,
                      alignment: Alignment(
                        -1 +
                            (navigationShell.currentIndex *
                                (2 / (destinations.length - 1))),
                        0,
                      ),
                      child: FractionallySizedBox(
                        widthFactor: 1 / destinations.length,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 6),
                          child: Container(
                            height: 42,
                            decoration: BoxDecoration(
                              color: PaynColors.accentSurface.withValues(
                                alpha: 0.9,
                              ),
                              borderRadius: BorderRadius.circular(18),
                              boxShadow: <BoxShadow>[
                                BoxShadow(
                                  color: PaynColors.accent.withValues(
                                    alpha: 0.18,
                                  ),
                                  blurRadius: 20,
                                  offset: const Offset(0, 8),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                    Row(
                      children: List<Widget>.generate(destinations.length, (
                        index,
                      ) {
                        final item = destinations[index];
                        final selected = navigationShell.currentIndex == index;

                        return Expanded(
                          child: _NavButton(
                            item: item,
                            selected: selected,
                            onTap: () {
                              navigationShell.goBranch(
                                index,
                                initialLocation:
                                    index == navigationShell.currentIndex,
                              );
                            },
                          ),
                        );
                      }),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavButton extends StatelessWidget {
  const _NavButton({
    required this.item,
    required this.selected,
    required this.onTap,
  });

  final _NavItem item;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 2),
      child: SizedBox(
        height: 48,
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(16),
            child: ConstrainedBox(
              constraints: const BoxConstraints(minHeight: 48, minWidth: 48),
              child: AnimatedScale(
                duration: PaynMotion.duration(context, PaynMotion.fast),
                curve: PaynMotion.curve(context, PaynMotion.spring),
                scale: selected ? 1.05 : 0.95,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    TweenAnimationBuilder<double>(
                      tween: Tween<double>(begin: 0, end: selected ? 1 : 0),
                      duration: const Duration(milliseconds: 240),
                      curve: PaynMotion.curve(context, PaynMotion.ease),
                      builder: (context, value, _) {
                        return Transform.translate(
                          offset: Offset(0, -1.5 * value),
                          child: Icon(
                            selected ? item.selectedIcon : item.icon,
                            size: selected ? 23 : 22,
                            color: Color.lerp(
                              PaynColors.textTertiary,
                              PaynColors.accent,
                              value,
                            ),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 3),
                    AnimatedSlide(
                      offset: Offset(0, selected ? 0 : 0.06),
                      duration: PaynMotion.duration(context, PaynMotion.fast),
                      curve: PaynMotion.curve(context, PaynMotion.ease),
                      child: AnimatedOpacity(
                        opacity: selected ? 1 : 0.72,
                        duration: PaynMotion.duration(context, PaynMotion.fast),
                        curve: PaynMotion.curve(context, PaynMotion.ease),
                        child: AnimatedDefaultTextStyle(
                          duration: PaynMotion.duration(
                            context,
                            PaynMotion.fast,
                          ),
                          curve: PaynMotion.curve(context, PaynMotion.ease),
                          style: theme.textTheme.labelMedium!.copyWith(
                            fontSize: 11,
                            fontWeight:
                                selected ? FontWeight.w700 : FontWeight.w500,
                            color:
                                selected
                                    ? PaynColors.accent
                                    : PaynColors.textTertiary,
                          ),
                          child: Text(item.label, textAlign: TextAlign.center),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  const _NavItem({
    required this.label,
    required this.icon,
    required this.selectedIcon,
  });

  final String label;
  final IconData icon;
  final IconData selectedIcon;
}
