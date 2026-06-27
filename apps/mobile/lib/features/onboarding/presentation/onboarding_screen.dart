import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen>
    with TickerProviderStateMixin {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  // ── Animation controllers ──
  late final AnimationController _entryCtrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 700),
  );
  late final AnimationController _floatCtrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 2800),
  );
  late final AnimationController _bgCtrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 3400),
  );

  // ── Entry animations ──
  late final Animation<double> _iconScale = Tween<double>(
    begin: 0.72,
    end: 1.0,
  ).animate(
    CurvedAnimation(
      parent: _entryCtrl,
      curve: const Interval(0.0, 0.7, curve: Curves.elasticOut),
    ),
  );

  late final Animation<Offset> _titleOffset = Tween<Offset>(
    begin: const Offset(0, 0.10),
    end: Offset.zero,
  ).animate(
    CurvedAnimation(
      parent: _entryCtrl,
      curve: const Interval(0.12, 0.55, curve: Curves.easeOutCubic),
    ),
  );

  late final Animation<double> _titleFade = Tween<double>(
    begin: 0.0,
    end: 1.0,
  ).animate(
    CurvedAnimation(
      parent: _entryCtrl,
      curve: const Interval(0.10, 0.50, curve: Curves.easeOut),
    ),
  );

  late final Animation<double> _bodyFade = Tween<double>(
    begin: 0.0,
    end: 1.0,
  ).animate(
    CurvedAnimation(
      parent: _entryCtrl,
      curve: const Interval(0.30, 0.85, curve: Curves.easeOut),
    ),
  );

  // ── Continuous animations ──
  late final Animation<double> _iconFloat = Tween<double>(
    begin: -6.0,
    end: 6.0,
  ).animate(_floatCtrl);

  late final Animation<double> _bgScale = Tween<double>(
    begin: 0.94,
    end: 1.06,
  ).animate(_bgCtrl);

  // Redesign: 3 punchy pages, one cohesive emerald brand colour (dropped
  // the off-brand blue/orange), copy aligned with the web hero.
  static const List<_OnboardingPage> _pages = [
    _OnboardingPage(
      icon: Icons.insights_rounded,
      iconColor: PaynColors.accent,
      title: 'Compare every bank, card & app',
      subtitle:
          'Ranked by what it really costs you — not by who pays us.',
    ),
    _OnboardingPage(
      icon: Icons.verified_user_rounded,
      iconColor: PaynColors.accent,
      title: 'No bias. Free. Account optional.',
      subtitle:
          'We earn a commission on some links — it never changes the ranking. Compare everything for free.',
    ),
    _OnboardingPage(
      icon: Icons.bolt_rounded,
      iconColor: PaynColors.accent,
      title: 'Your best option, in seconds',
      subtitle:
          'Cards, accounts, transfers, savings and more — all in one place.',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _entryCtrl.forward();
    _floatCtrl.repeat(reverse: true);
    _bgCtrl.repeat(reverse: true);
  }

  @override
  void dispose() {
    _pageController.dispose();
    _entryCtrl.dispose();
    _floatCtrl.dispose();
    _bgCtrl.dispose();
    super.dispose();
  }

  Future<void> _complete() async {
    final controller = AppScope.of(context);
    await controller.completeOnboarding();
    if (mounted) context.go('/home');
  }

  void _next() {
    _pageController.nextPage(
      duration: const Duration(milliseconds: 320),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isLast = _currentPage == _pages.length - 1;
    final page = _pages[_currentPage];

    return Scaffold(
      backgroundColor: PaynColors.surface,
      body: SafeArea(
        child: Column(
          children: [
            // ── Illustration area (55% of remaining space) ──
            Expanded(
              flex: 55,
              child: Container(
                color: PaynColors.background,
                child: Stack(
                  children: [
                    // PageView for swipe support
                    PageView.builder(
                      controller: _pageController,
                      itemCount: _pages.length,
                      onPageChanged: (i) {
                        setState(() => _currentPage = i);
                        _entryCtrl
                          ..reset()
                          ..forward();
                      },
                      physics: const BouncingScrollPhysics(),
                      // Empty items — illustration drawn by AnimatedBuilder below
                      itemBuilder: (context, index) => const SizedBox.shrink(),
                    ),
                    // Animated illustration drawn on top, reads _currentPage
                    IgnorePointer(
                      child: Center(
                        child: AnimatedBuilder(
                          animation: Listenable.merge([_floatCtrl, _bgCtrl]),
                          builder: (context, _) {
                            return SizedBox(
                              width: 200,
                              height: 200,
                              child: Stack(
                                alignment: Alignment.center,
                                children: [
                                  // Soft emerald glow ring (pulsing)
                                  ScaleTransition(
                                    scale: _bgScale,
                                    child: Container(
                                      width: 172,
                                      height: 172,
                                      decoration: BoxDecoration(
                                        color: PaynColors.accent.withValues(
                                          alpha: 0.12,
                                        ),
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                  ),
                                  // Premium emerald medallion + white icon
                                  Transform.translate(
                                    offset: Offset(0, _iconFloat.value),
                                    child: ScaleTransition(
                                      scale: _iconScale,
                                      child: Container(
                                        width: 112,
                                        height: 112,
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          gradient: const LinearGradient(
                                            begin: Alignment.topLeft,
                                            end: Alignment.bottomRight,
                                            colors: [
                                              PaynColors.accent,
                                              PaynColors.accentStrong,
                                            ],
                                          ),
                                          boxShadow: [
                                            BoxShadow(
                                              color: PaynColors.accent
                                                  .withValues(alpha: 0.32),
                                              blurRadius: 28,
                                              offset: const Offset(0, 12),
                                            ),
                                          ],
                                        ),
                                        child: Icon(
                                          page.icon,
                                          size: 50,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // ── Content panel (45%) ──
            Expanded(
              flex: 45,
              child: Container(
                color: PaynColors.surface,
                padding: const EdgeInsets.fromLTRB(28, 28, 28, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Animated title + subtitle
                    Expanded(
                      child: AnimatedBuilder(
                        animation: _entryCtrl,
                        builder: (context, _) {
                          return Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              SlideTransition(
                                position: _titleOffset,
                                child: FadeTransition(
                                  opacity: _titleFade,
                                  child: Text(
                                    page.title,
                                    style: theme.textTheme.titleLarge?.copyWith(
                                      fontSize: 26,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: -0.6,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 12),
                              FadeTransition(
                                opacity: _bodyFade,
                                child: Text(
                                  page.subtitle,
                                  style: theme.textTheme.bodyLarge?.copyWith(
                                    color: PaynColors.textSecondary,
                                    height: 1.5,
                                  ),
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 20),
                    // ── Dot indicators ──
                    Row(
                      children: [
                        Row(
                          children: List.generate(_pages.length, (i) {
                            final active = i == _currentPage;
                            return AnimatedContainer(
                              duration: const Duration(milliseconds: 220),
                              curve: Curves.easeOutCubic,
                              margin: const EdgeInsets.only(right: 6),
                              width: active ? 20 : 7,
                              height: 7,
                              decoration: BoxDecoration(
                                color: active
                                    ? PaynColors.accent
                                    : PaynColors.outlineSubtle,
                                borderRadius: BorderRadius.circular(999),
                              ),
                            );
                          }),
                        ),
                        const Spacer(),
                        // Skip / Next / Get started
                        if (isLast)
                          AnimatedBuilder(
                            animation: _bgCtrl,
                            builder: (context, child) {
                              return Container(
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(14),
                                  boxShadow: [
                                    BoxShadow(
                                      color: PaynColors.accent.withValues(
                                        alpha: 0.30 + 0.20 * _bgCtrl.value,
                                      ),
                                      blurRadius: 18 + 10 * _bgCtrl.value,
                                      offset: Offset.zero,
                                    ),
                                  ],
                                ),
                                child: child,
                              );
                            },
                            child: FilledButton(
                              onPressed: _complete,
                              style: FilledButton.styleFrom(
                                minimumSize: const Size(0, 48),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 28,
                                ),
                              ),
                              child: const Text('Get started'),
                            ),
                          )
                        else ...[
                          TextButton(
                            onPressed: _complete,
                            style: TextButton.styleFrom(
                              foregroundColor: PaynColors.textSecondary,
                              minimumSize: const Size(0, 48),
                            ),
                            child: const Text('Skip'),
                          ),
                          const SizedBox(width: 4),
                          FilledButton(
                            onPressed: _next,
                            style: FilledButton.styleFrom(
                              minimumSize: const Size(0, 48),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                              ),
                            ),
                            child: const Text('Next'),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OnboardingPage {
  const _OnboardingPage({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
}
