import 'dart:ui';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/localization/app_localizations_ext.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';
import 'package:payn_mobile/shared/widgets/payn_mark.dart';
import 'package:payn_mobile/shared/widgets/payn_motion.dart';

class PaynShell extends StatelessWidget {
  const PaynShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  static const double toolbarHeight = 72;
  static const double toolbarTopPadding = 8;

  static double contentBottomInset(BuildContext context) {
    return toolbarHeight + MediaQuery.paddingOf(context).bottom + 12;
  }

  // MOB.10 — `contentBottomInsetWithCompareBar` + `compareBarHeight`
  // were retired with the docked ribbon. Nothing floats above the nav
  // anymore — `contentBottomInset` alone is the right padding for any
  // scroll surface.

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      // Tab switches use the cinematic _TabTransitionStage rather than
      // a vanilla AnimatedSwitcher — every change of currentIndex plays
      // a 1.6s choreography: outgoing recedes + dims, an emerald-glow
      // sweep cuts through the middle, incoming reveals from below
      // with a soft overshoot. Per-branch widget state is preserved by
      // StatefulNavigationShell so scroll positions and forms survive.
      // MOB.8 — Was a Stack with a floating Compare bar overlaying the
      // content. That bar visually hovered ~96pt above the screen
      // bottom and covered the bottom offer row on Explore. Now the
      // Compare ribbon is docked INTO the nav itself (see
      // `_FrostedNavBar` below), so it visually grows out of the bottom
      // chrome instead of floating mid-screen.
      body: _TabTransitionStage(navigationShell: navigationShell),
      bottomNavigationBar: _FrostedNavBar(navigationShell: navigationShell),
    );
  }
}

// ─── Tab transition ─────────────────────────────────────────────────────────
//
// Design intent: a single deliberate animation when the user navigates TO
// Explore — that's the "I want to browse" moment and deserves a visual
// beat. Every other tab switch (Home / Saved / Profile) snaps instantly,
// no fade, no slide. Animating ALL transitions made the navigation feel
// laggy and over-decorated.
//
// What it shows (1800ms cinematic intro, Explore-only):
//   • 0–150ms     emerald gradient overlay fades in over the screen
//   • 150–450ms   € icon springs in, holds, fades out
//   • 400–700ms   ₿ (bitcoin) springs in, holds, fades out
//   • 650–950ms   ATM-with-cash icon springs in, holds, fades out
//   • 900–1200ms  car icon (loan / lease metaphor) springs in, fades out
//   • 1200–1550ms PaynMark logo "writes on" via the progress param
//   • 1550–1800ms emerald overlay fades out, Explore underneath fades in
//
// Each icon uses Curves.easeOutBack for entrance so it overshoots
// slightly past 1.0 then settles — gives the row a tactile "punch"
// rather than a flat cross-fade.
//
// Reduce-motion: the OS accessibility flag collapses everything to an
// instant snap, same as the other tabs.

const int _exploreBranchIndex = 1;
// MOB.7 — Saved branch index. Used by the Compare-bar gating + by the
// cinematic intro stage (intro only fires when entering Explore, not
// Saved).
const int _savedBranchIndex = 2;

class _TabTransitionStage extends StatefulWidget {
  const _TabTransitionStage({required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  State<_TabTransitionStage> createState() => _TabTransitionStageState();
}

class _TabTransitionStageState extends State<_TabTransitionStage>
    with SingleTickerProviderStateMixin {
  // 1800ms total — long enough to read every icon, short enough that
  // a returning user who switches tabs frequently doesn't feel held
  // hostage by the intro.
  static const Duration _duration = Duration(milliseconds: 1800);

  late int _currentIndex;
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.navigationShell.currentIndex;
    _controller = AnimationController(
      vsync: this,
      duration: _duration,
      value: 1.0, // first paint: park at the end so nothing animates.
    );
  }

  @override
  void didUpdateWidget(covariant _TabTransitionStage oldWidget) {
    super.didUpdateWidget(oldWidget);
    final newIndex = widget.navigationShell.currentIndex;
    if (newIndex == _currentIndex) return;
    _currentIndex = newIndex;
    if (newIndex == _exploreBranchIndex) {
      // Going TO Explore — play the icon-cascade intro.
      _controller.forward(from: 0);
    } else {
      // Going to any other tab — snap, no animation. Park the
      // controller at the end value so build() returns the bare shell.
      _controller.value = 1.0;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final reduceMotion = PaynMotion.reduce(context);
    if (reduceMotion) {
      return widget.navigationShell;
    }

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final t = _controller.value;
        // Controller at rest — skip every layer to keep idle tabs free
        // of Opacity / Transform overhead.
        if (t >= 1.0) return child!;

        // Explore content fades in during the last 250ms (alongside
        // the overlay fade-out) so the icon row dissolves into the
        // real list rather than cutting hard.
        final contentOpacity = Curves.easeOut.transform(
          ((t - 0.78) / 0.22).clamp(0.0, 1.0),
        );

        return Stack(
          fit: StackFit.expand,
          children: <Widget>[
            // Explore screen underneath — kept mounted so its own
            // entrance animations (offer-row stagger, etc.) start
            // running in parallel with the overlay fade-out.
            Opacity(opacity: contentOpacity, child: child),
            // Icon-cascade overlay on top — repaints every frame off
            // the same controller value, so we don't allocate extra
            // Tweens or controllers per icon.
            Positioned.fill(
              child: IgnorePointer(
                ignoring: t > 0.92,
                child: _ExploreIntroOverlay(progress: t),
              ),
            ),
          ],
        );
      },
      child: widget.navigationShell,
    );
  }
}

// ─── Explore intro overlay ──────────────────────────────────────────────────
//
// Owns the icon cascade. Reads a single progress value (0..1) from the
// parent controller and computes per-icon scale/opacity from sub-
// intervals. No internal state; the parent decides when to play.

class _ExploreIntroOverlay extends StatelessWidget {
  const _ExploreIntroOverlay({required this.progress});

  /// 0 = transition just started, 1 = Explore fully revealed.
  final double progress;

  // Per-icon visibility windows inside the 0..1 controller range.
  // Each [_IconWindow] gets a 300ms entrance/exit pair; consecutive
  // windows overlap by ~50ms so the row flows instead of stepping.
  static const List<_IconWindow> _icons = <_IconWindow>[
    _IconWindow(begin: 0.083, end: 0.25, icon: Icons.euro_rounded),
    _IconWindow(begin: 0.22, end: 0.39, icon: Icons.currency_bitcoin),
    _IconWindow(begin: 0.36, end: 0.53, icon: Icons.local_atm_rounded),
    _IconWindow(
      begin: 0.50,
      end: 0.67,
      icon: Icons.directions_car_filled_rounded,
    ),
  ];

  // Logo "writes on" between 0.66 and 0.86. Past 0.86 the whole
  // overlay starts dissolving out (handled by `overlayAlpha`).
  static const double _logoBegin = 0.66;
  static const double _logoEnd = 0.86;

  @override
  Widget build(BuildContext context) {
    final t = progress;

    // Overlay fade-in (0..0.08) then steady, then fade-out (0.86..1).
    final overlayAlpha = _overlayAlpha(t);
    if (overlayAlpha <= 0) {
      return const SizedBox.shrink();
    }

    // Which icon is "active" right now — the first one whose window
    // contains t. Past the last icon's end, we render the logo.
    Widget? currentIcon;
    for (final win in _icons) {
      if (t >= win.begin && t <= win.end) {
        currentIcon = _AnimatedIntroIcon(icon: win.icon, windowProgress: _normalize(t, win.begin, win.end));
        break;
      }
    }

    final showLogo = t >= _logoBegin && t <= 1.0;
    final logoProgress = _normalize(t, _logoBegin, _logoEnd).clamp(0.0, 1.0);
    // After the logo finishes drawing (t > _logoEnd), keep it fully
    // formed but let the parent's overlayAlpha fade the whole stage.
    final logoOpacity = _easeOut(((t - _logoBegin) / 0.08).clamp(0.0, 1.0));

    return Opacity(
      opacity: overlayAlpha,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: RadialGradient(
            center: Alignment.center,
            radius: 1.1,
            colors: <Color>[
              PaynColors.accentSurface,
              PaynColors.accentSurfaceStrong,
              PaynColors.accent.withValues(alpha: 0.92),
            ],
            stops: const <double>[0.0, 0.55, 1.0],
          ),
        ),
        child: Center(
          child: showLogo
              ? Opacity(
                  opacity: logoOpacity,
                  child: _IntroLogo(progress: logoProgress),
                )
              : (currentIcon ?? const SizedBox.shrink()),
        ),
      ),
    );
  }

  // Overlay alpha curve: 0 → 1 by t=0.08, holds at 1 until t=0.86,
  // then 1 → 0 by t=1.0. The hold lets the icons + logo render at
  // full opacity; the fade-out reveals Explore underneath.
  double _overlayAlpha(double t) {
    if (t < 0.08) return _easeOut(t / 0.08);
    if (t < 0.86) return 1.0;
    return _easeIn(1.0 - (t - 0.86) / 0.14).clamp(0.0, 1.0);
  }
}

class _IconWindow {
  const _IconWindow({
    required this.begin,
    required this.end,
    required this.icon,
  });

  final double begin;
  final double end;
  final IconData icon;
}

class _AnimatedIntroIcon extends StatelessWidget {
  const _AnimatedIntroIcon({required this.icon, required this.windowProgress});

  final IconData icon;
  // 0 at entry, 0.5 at peak, 1 at exit. Computed by the parent.
  final double windowProgress;

  @override
  Widget build(BuildContext context) {
    final p = windowProgress;
    // Entry (0..0.4): scale 0.55 → 1.1 with easeOutBack so it
    // overshoots; opacity 0 → 1.
    // Hold  (0.4..0.6): scale 1.1 → 1.0, opacity 1.
    // Exit  (0.6..1.0): scale 1.0 → 0.85, opacity 1 → 0 (fades out as
    // the next icon's entry starts overlapping).
    double scale;
    double opacity;
    if (p < 0.4) {
      final n = p / 0.4;
      scale = 0.55 + (1.10 - 0.55) * Curves.easeOutBack.transform(n);
      opacity = Curves.easeOut.transform(n);
    } else if (p < 0.6) {
      final n = (p - 0.4) / 0.2;
      scale = 1.10 - 0.10 * n;
      opacity = 1.0;
    } else {
      final n = (p - 0.6) / 0.4;
      scale = 1.0 - 0.15 * Curves.easeIn.transform(n);
      opacity = 1.0 - Curves.easeIn.transform(n);
    }

    return Opacity(
      opacity: opacity.clamp(0.0, 1.0),
      child: Transform.scale(
        scale: scale,
        child: Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(28),
            boxShadow: <BoxShadow>[
              BoxShadow(
                color: PaynColors.accentStrong.withValues(alpha: 0.25),
                blurRadius: 32,
                offset: const Offset(0, 16),
              ),
            ],
          ),
          alignment: Alignment.center,
          child: Icon(
            icon,
            size: 64,
            color: PaynColors.accentStrong,
          ),
        ),
      ),
    );
  }
}

class _IntroLogo extends StatelessWidget {
  const _IntroLogo({required this.progress});

  /// 0..1 progress for the PaynMark stroke-draw animation.
  final double progress;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        Container(
          width: 96,
          height: 96,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            boxShadow: <BoxShadow>[
              BoxShadow(
                color: PaynColors.accentStrong.withValues(alpha: 0.35),
                blurRadius: 32,
                offset: const Offset(0, 18),
              ),
            ],
          ),
          alignment: Alignment.center,
          child: PaynMark(
            size: 48,
            color: PaynColors.accentStrong,
            strokeWidth: 4.2,
            progress: progress,
          ),
        ),
        const SizedBox(height: 18),
        // Tiny "Payn" wordmark beneath the chevron — only revealed
        // once the stroke draw finishes so it doesn't compete for
        // attention while the mark is still being drawn.
        Opacity(
          opacity: progress >= 1 ? 1.0 : 0.0,
          child: const Text(
            'Payn',
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.5,
            ),
          ),
        ),
      ],
    );
  }
}

// Local easing helpers — avoids allocating CurvedAnimation per frame.
double _easeOut(double t) => Curves.easeOut.transform(t.clamp(0.0, 1.0));
double _easeIn(double t) => Curves.easeIn.transform(t.clamp(0.0, 1.0));
double _normalize(double t, double begin, double end) =>
    ((t - begin) / (end - begin)).clamp(0.0, 1.0);

class _FrostedNavBar extends StatelessWidget {
  const _FrostedNavBar({required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.paddingOf(context).bottom;
    final l10n = context.l10n;
    final reduceMotion = PaynMotion.reduce(context);
    // MOB.8 — Read the compare set so the Saved-icon badge + docked
    // ribbon can light up the second a user adds anything. The nav
    // listens to the controller via AppScope, so any toggleCompare()
    // anywhere in the app re-renders the bar in place.
    final controller = AppScope.of(context);
    final compareCount = controller.compareCount;
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

    final Widget bar = DecoratedBox(
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
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                // MOB.10 — Was a `_DockedCompareRibbon` that grew the
                // nav by ~56pt whenever the user had 1+ offers picked.
                // Even docked, it still ate vertical space and read as
                // chrome sitting on top of the offer list. The ribbon
                // is gone now — the Saved-icon badge alone signals the
                // shortlist from anywhere in the app, and the CTA into
                // /compare lives as a normal inline section on the
                // Saved screen (where the user is already curating).
                SizedBox(
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
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                              ),
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
                            final selected =
                                navigationShell.currentIndex == index;

                            return Expanded(
                              child: _NavButton(
                                item: item,
                                selected: selected,
                                // MOB.8 — Light the Saved tab with a
                                // small emerald count badge whenever
                                // the user has 1+ offers in Compare,
                                // so the nav itself signals "you have
                                // a shortlist waiting". The badge sits
                                // top-right of the bookmark icon and
                                // animates in/out via AnimatedScale.
                                badgeCount:
                                    index == _savedBranchIndex && compareCount > 0
                                        ? compareCount
                                        : null,
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
              ],
            ),
          ),
        );

    // Frosted-glass blur behind the nav bar. The fill is already 96%
    // opaque (0xF4FFFFFF), so the blur is a subtle finish, not load-
    // bearing. Skip it off iOS: the Android emulator's GL backend
    // mishandles BackdropFilter's saveLayer and blacks out the entire
    // frame, and even on real Android devices a full-width backdrop
    // blur is a needless per-frame cost for a near-opaque surface.
    // iOS (Metal) keeps the glass.
    if (defaultTargetPlatform == TargetPlatform.iOS) {
      return ClipRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 22, sigmaY: 22),
          child: bar,
        ),
      );
    }
    return bar;
  }
}

// MOB.10 — `_DockedCompareRibbon` was deleted in favour of an inline
// CTA section on the Saved screen (see `_CompareReadyCard`). No more
// floating / docked chrome over the body; nav badge alone signals the
// shortlist, page content owns the navigation path into /compare.

class _NavButton extends StatelessWidget {
  const _NavButton({
    required this.item,
    required this.selected,
    required this.onTap,
    this.badgeCount,
  });

  final _NavItem item;
  final bool selected;
  final VoidCallback onTap;
  // MOB.8 — When non-null, an emerald count chip rides the top-right
  // of the icon. Currently driven by the Compare set on the Saved tab,
  // but the slot is generic — any tab can light up the same way later.
  final int? badgeCount;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // MOB.13 — Rewritten with strict centering. Previous version had:
    //   • `Padding(horizontal: 2)` that asymmetrically shrank the
    //     hit-area inside an Expanded flex slot, so adjacent tabs
    //     ended up with non-uniform tap zones.
    //   • `AnimatedScale(1.05 / 0.95)` on the whole Column, which
    //     physically shifted the icon position on (de)selection by ~1px
    //     — the eye reads that as misalignment.
    //   • Column with implicit `crossAxisAlignment: center`, plus an
    //     `Icon` rendered via `Transform.translate(0, -1.5 * value)` on
    //     selection. The translate moved the icon up by 1.5px when
    //     active, which again read as "not vertically centered".
    //
    // Now:
    //   • The InkWell fills the Expanded slot edge-to-edge (no outer
    //     padding) so every tab has identical width and identical hit
    //     area.
    //   • Center widget anchors content to the geometric middle of the
    //     tab — both axes.
    //   • Column is `mainAxisSize: min` + `crossAxisAlignment: center`.
    //   • The selected-state animation is purely visual (icon size +
    //     colour interpolation), no transforms that move the icon
    //     relative to its centre.
    //   • Badge uses a hard `Positioned(top: -6, right: -10)` measured
    //     from the icon's centre Stack — stable per icon size.
    return SizedBox.expand(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Stack(
                  clipBehavior: Clip.none,
                  alignment: Alignment.center,
                  children: <Widget>[
                    TweenAnimationBuilder<double>(
                      tween: Tween<double>(begin: 0, end: selected ? 1 : 0),
                      duration: const Duration(milliseconds: 240),
                      curve: PaynMotion.curve(context, PaynMotion.ease),
                      builder: (context, value, _) {
                        return Icon(
                          selected ? item.selectedIcon : item.icon,
                          // 22pt resting, 24pt selected — driven by
                          // `value` so the size animates smoothly. No
                          // Transform.translate; the icon stays on its
                          // optical centre throughout the interpolation.
                          size: 22 + (2 * value),
                          color: Color.lerp(
                            PaynColors.textTertiary,
                            PaynColors.accent,
                            value,
                          ),
                        );
                      },
                    ),
                    if (badgeCount != null)
                      Positioned(
                        top: -6,
                        right: -10,
                        child: Container(
                          constraints: const BoxConstraints(
                            minWidth: 16,
                            minHeight: 16,
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: PaynColors.accent,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.white, width: 1.4),
                          ),
                          child: Text(
                            '$badgeCount',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                              fontSize: 10,
                              height: 1,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 3),
                // MOB.13 — Was wrapped in AnimatedSlide(0, 0.06) +
                // AnimatedOpacity(0.72/1) which physically shifted the
                // label down by ~1px when not selected. Removed — the
                // label sits on a fixed baseline now, and the weight +
                // colour interpolation on AnimatedDefaultTextStyle
                // carries the "selected" state without breaking
                // alignment.
                AnimatedDefaultTextStyle(
                  duration: PaynMotion.duration(context, PaynMotion.fast),
                  curve: PaynMotion.curve(context, PaynMotion.ease),
                  style: theme.textTheme.labelMedium!.copyWith(
                    fontSize: 11,
                    fontWeight:
                        selected ? FontWeight.w700 : FontWeight.w500,
                    color: selected
                        ? PaynColors.accent
                        : PaynColors.textTertiary,
                  ),
                  child: Text(item.label, textAlign: TextAlign.center),
                ),
              ],
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

// MOB.8 — The old `_FloatingCompareBar` class was deleted. Its job
// (showing N-in-Compare + a CTA) is now done by `_DockedCompareRibbon`
// embedded inside the frosted nav above, so the bar can't ever be
// "stuck mid-screen" again and the user always knows it lives down
// in the nav chrome — never overlapping list content.
