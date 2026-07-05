import 'dart:async';

import 'package:flutter/material.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/widgets/payn_motion.dart';

class SelectionSheetOption<T> {
  const SelectionSheetOption({
    required this.value,
    required this.label,
    required this.selected,
    this.leading,
  });

  final T value;
  final String label;
  final bool selected;
  final String? leading;
}

Future<void> showPaynSelectionBottomSheet<T>({
  required BuildContext context,
  required String title,
  required List<SelectionSheetOption<T>> options,
  required FutureOr<void> Function(T value) onSelected,
}) {
  final reduceMotion = PaynMotion.reduce(context);
  return showModalBottomSheet<void>(
    context: context,
    useRootNavigator: false,
    isScrollControlled: true,
    useSafeArea: true,
    barrierColor: Colors.black.withValues(alpha: 0.28),
    backgroundColor: Colors.transparent,
    clipBehavior: Clip.none,
    sheetAnimationStyle: AnimationStyle(
      duration: reduceMotion ? Duration.zero : PaynMotion.sheet,
      reverseDuration: reduceMotion ? Duration.zero : PaynMotion.medium,
      curve: PaynMotion.ease,
      reverseCurve: Curves.easeInCubic,
    ),
    builder: (sheetContext) {
      final mediaQuery = MediaQuery.of(sheetContext);
      final maxHeight = mediaQuery.size.height * 0.78;
      final bottomPadding = mediaQuery.padding.bottom + 20;

      return ConstrainedBox(
        constraints: BoxConstraints(maxHeight: maxHeight),
        child: DecoratedBox(
          decoration: const BoxDecoration(
            color: PaynColors.surface,
            borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
            boxShadow: <BoxShadow>[
              BoxShadow(
                color: Color(0x18000000),
                blurRadius: 48,
                offset: Offset(0, -4),
              ),
            ],
          ),
          child: Padding(
            padding: EdgeInsets.fromLTRB(20, 12, 20, bottomPadding),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                // Drag handle
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: PaynColors.outline,
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  title,
                  style: Theme.of(sheetContext).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.4,
                  ),
                ),
                const SizedBox(height: 16),
                // Grouped list container — ChatGPT style
                Flexible(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: ColoredBox(
                      color: PaynColors.surfaceRaised,
                      child: ListView.separated(
                        shrinkWrap: true,
                        padding: EdgeInsets.zero,
                        itemCount: options.length,
                        separatorBuilder:
                            (_, __) => const Divider(
                              height: 1,
                              thickness: 0.5,
                              indent: 68,
                              endIndent: 0,
                              color: PaynColors.outlineSubtle,
                            ),
                        itemBuilder: (context, index) {
                          final option = options[index];
                          return _SelectionRow<T>(
                            option: option,
                            onTap: () async {
                              await onSelected(option.value);
                              if (sheetContext.mounted) {
                                Navigator.of(sheetContext).pop();
                              }
                            },
                          );
                        },
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    },
  );
}

class _SelectionRow<T> extends StatelessWidget {
  const _SelectionRow({required this.option, required this.onTap});

  final SelectionSheetOption<T> option;
  final Future<void> Function() onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final hasLeading = (option.leading ?? '').isNotEmpty;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        splashColor: PaynColors.accent.withValues(alpha: 0.06),
        highlightColor: PaynColors.accent.withValues(alpha: 0.04),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
          child: Row(
            children: <Widget>[
              // Flag / icon container
              if (hasLeading) ...<Widget>[
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: PaynColors.surface,
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: const <BoxShadow>[
                      BoxShadow(
                        color: Color(0x0C000000),
                        blurRadius: 4,
                        offset: Offset(0, 1),
                      ),
                    ],
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    option.leading!,
                    style: const TextStyle(fontSize: 22, height: 1),
                  ),
                ),
                const SizedBox(width: 14),
              ] else ...<Widget>[
                const SizedBox(width: 6),
              ],
              // Label
              Expanded(
                child: Text(
                  option.label,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodyLarge?.copyWith(
                    fontWeight:
                        option.selected ? FontWeight.w600 : FontWeight.w400,
                    color: PaynColors.text,
                    letterSpacing: -0.1,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // Radio dot
              _RadioDot(selected: option.selected),
            ],
          ),
        ),
      ),
    );
  }
}

/// Filled green circle with white check when selected; empty circle otherwise.
class _RadioDot extends StatelessWidget {
  const _RadioDot({required this.selected});
  final bool selected;

  @override
  Widget build(BuildContext context) {
    if (selected) {
      return Container(
        width: 22,
        height: 22,
        decoration: const BoxDecoration(
          color: PaynColors.accent,
          shape: BoxShape.circle,
        ),
        alignment: Alignment.center,
        child: const Icon(Icons.check_rounded, color: Colors.white, size: 13),
      );
    }
    return Container(
      width: 22,
      height: 22,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: PaynColors.outline, width: 1.5),
      ),
    );
  }
}
