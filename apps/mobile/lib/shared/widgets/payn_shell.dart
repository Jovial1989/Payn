import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';

class PaynShell extends StatelessWidget {
  const PaynShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Content flows behind the nav bar so scroll content is visible through it.
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

    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 28, sigmaY: 28),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: const Color(0xEBFFFFFF),
            border: const Border(
              top: BorderSide(color: PaynColors.outlineSubtle),
            ),
          ),
          child: Padding(
            padding: EdgeInsets.fromLTRB(8, 6, 8, bottomInset > 0 ? bottomInset : 8),
            child: NavigationBar(
              backgroundColor: Colors.transparent,
              surfaceTintColor: Colors.transparent,
              shadowColor: Colors.transparent,
              selectedIndex: navigationShell.currentIndex,
              destinations: const <NavigationDestination>[
                NavigationDestination(
                  icon: Icon(Icons.home_outlined),
                  selectedIcon: Icon(Icons.home_rounded),
                  label: 'Home',
                ),
                NavigationDestination(
                  icon: Icon(Icons.explore_outlined),
                  selectedIcon: Icon(Icons.explore_rounded),
                  label: 'Explore',
                ),
                NavigationDestination(
                  icon: Icon(Icons.bookmark_border_rounded),
                  selectedIcon: Icon(Icons.bookmark_rounded),
                  label: 'Saved',
                ),
                NavigationDestination(
                  icon: Icon(Icons.person_outline_rounded),
                  selectedIcon: Icon(Icons.person_rounded),
                  label: 'Profile',
                ),
              ],
              onDestinationSelected: (index) {
                navigationShell.goBranch(
                  index,
                  initialLocation: index == navigationShell.currentIndex,
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}
