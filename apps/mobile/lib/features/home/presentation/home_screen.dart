import 'package:flutter/material.dart';
import 'package:payn_mobile/features/marketplace/presentation/marketplace_screen.dart';
import 'package:payn_mobile/features/profile/presentation/profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  static const _destinations = <_TabDestination>[
    _TabDestination(
      label: 'Loans',
      icon: Icons.account_balance_outlined,
      selectedIcon: Icons.account_balance_rounded,
    ),
    _TabDestination(
      label: 'Cards',
      icon: Icons.credit_card_outlined,
      selectedIcon: Icons.credit_card_rounded,
    ),
    _TabDestination(
      label: 'Transfers',
      icon: Icons.swap_horiz_outlined,
      selectedIcon: Icons.swap_horiz_rounded,
    ),
    _TabDestination(
      label: 'Exchange',
      icon: Icons.currency_exchange_outlined,
      selectedIcon: Icons.currency_exchange_rounded,
    ),
    _TabDestination(
      label: 'Profile',
      icon: Icons.person_outline_rounded,
      selectedIcon: Icons.person_rounded,
    ),
  ];

  int _selectedIndex = 0;

  Widget _buildScreen() {
    switch (_selectedIndex) {
      case 0:
        return const MarketplaceScreen(section: MarketplaceSection.loans);
      case 1:
        return const MarketplaceScreen(section: MarketplaceSection.cards);
      case 2:
        return const MarketplaceScreen(section: MarketplaceSection.transfers);
      case 3:
        return const MarketplaceScreen(section: MarketplaceSection.exchange);
      case 4:
        return const ProfileScreen();
      default:
        return const MarketplaceScreen(section: MarketplaceSection.loans);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 280),
        switchInCurve: Curves.easeOutCubic,
        switchOutCurve: Curves.easeInCubic,
        transitionBuilder: (child, animation) {
          return FadeTransition(
            opacity: animation,
            child: SlideTransition(
              position: Tween<Offset>(
                begin: const Offset(0.02, 0),
                end: Offset.zero,
              ).animate(animation),
              child: child,
            ),
          );
        },
        child: KeyedSubtree(
          key: ValueKey(_selectedIndex),
          child: _buildScreen(),
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          if (index == _selectedIndex) {
            return;
          }
          setState(() {
            _selectedIndex = index;
          });
        },
        destinations: [
          for (final destination in _destinations)
            NavigationDestination(
              icon: Icon(destination.icon),
              selectedIcon: Icon(destination.selectedIcon),
              label: destination.label,
            ),
        ],
      ),
    );
  }
}

class _TabDestination {
  const _TabDestination({
    required this.label,
    required this.icon,
    required this.selectedIcon,
  });

  final String label;
  final IconData icon;
  final IconData selectedIcon;
}
