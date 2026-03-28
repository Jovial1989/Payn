import 'package:flutter/material.dart';
import 'package:payn_mobile/shared/app_scaffold.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      eyebrow: 'Payn',
      title: 'Profile',
      subtitle:
          'Keep saved offers, alerts, and account preferences in one calm control panel.',
      children: [
        AppPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              AppPanelHeader(
                icon: Icons.person_outline_rounded,
                title: 'Account state',
                subtitle:
                    'The shell is ready for secure sign-in, saved offers, and synced preferences.',
              ),
              SizedBox(height: 18),
              AppDetailRow(
                label: 'Session',
                value: 'Ready for secure sign-in on this device.',
              ),
              SizedBox(height: 14),
              AppDetailRow(
                label: 'Saved offers',
                value:
                    'Designed for one view across loans, cards, transfers, and exchange.',
              ),
              SizedBox(height: 14),
              AppDetailRow(
                label: 'Alerts',
                value: 'Prepared for rate, fee, and provider-term changes.',
              ),
            ],
          ),
        ),
        AppPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              AppPanelHeader(
                icon: Icons.tune_rounded,
                title: 'Preference rails',
                subtitle:
                    'The profile area holds the controls that shape how Payn behaves for each user.',
              ),
              SizedBox(height: 18),
              AppBulletRow(
                icon: Icons.check_circle_outline_rounded,
                label:
                    'Choose notification cadence for the categories you actually track.',
              ),
              SizedBox(height: 12),
              AppBulletRow(
                icon: Icons.check_circle_outline_rounded,
                label: 'Set market defaults and a preferred currency view.',
              ),
              SizedBox(height: 12),
              AppBulletRow(
                icon: Icons.check_circle_outline_rounded,
                label:
                    'Keep biometric unlock and device security options in one place.',
              ),
            ],
          ),
        ),
        AppPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              AppPanelHeader(
                icon: Icons.shield_outlined,
                title: 'What this supports',
                subtitle:
                    'The mobile foundation is ready to carry authenticated comparison flows without changing the shell.',
              ),
              SizedBox(height: 18),
              AppDetailRow(
                label: 'Return path',
                value:
                    'Come back to shortlisted offers without restarting the search.',
              ),
              SizedBox(height: 14),
              AppDetailRow(
                label: 'Coverage',
                value:
                    'Keep a Europe-focused view across the core Payn categories.',
              ),
              SizedBox(height: 14),
              AppDetailRow(
                label: 'Next connection',
                value:
                    'Auth, persistence, and live marketplace data can plug into the existing tabs.',
              ),
            ],
          ),
        ),
      ],
    );
  }
}
