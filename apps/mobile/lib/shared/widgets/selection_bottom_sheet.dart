import 'dart:async';

import 'package:flutter/material.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';

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
  return showModalBottomSheet<void>(
    context: context,
    useRootNavigator: true,
    isScrollControlled: true,
    useSafeArea: true,
    backgroundColor: Colors.transparent,
    builder: (sheetContext) {
      final mediaQuery = MediaQuery.of(sheetContext);
      final maxHeight = mediaQuery.size.height * 0.78;
      final bottomPadding = mediaQuery.padding.bottom + 24;

      return ConstrainedBox(
        constraints: BoxConstraints(maxHeight: maxHeight),
        child: DecoratedBox(
          decoration: const BoxDecoration(
            color: PaynColors.surface,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            boxShadow: <BoxShadow>[
              BoxShadow(
                color: Color(0x1F000000),
                blurRadius: 28,
                offset: Offset(0, -8),
              ),
            ],
          ),
          child: Padding(
            padding: EdgeInsets.fromLTRB(20, 12, 20, bottomPadding),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Center(
                  child: Container(
                    width: 44,
                    height: 5,
                    decoration: BoxDecoration(
                      color: PaynColors.outline,
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                Text(
                  title,
                  style: Theme.of(sheetContext).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 16),
                Flexible(
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: options.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
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
              ],
            ),
          ),
        ),
      );
    },
  );
}

class _SelectionRow<T> extends StatelessWidget {
  const _SelectionRow({
    required this.option,
    required this.onTap,
  });

  final SelectionSheetOption<T> option;
  final Future<void> Function() onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Material(
      color:
          option.selected ? PaynColors.accentSurface : PaynColors.surfaceRaised,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: ConstrainedBox(
          constraints: const BoxConstraints(minHeight: 60),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              children: <Widget>[
                if ((option.leading ?? '').isNotEmpty) ...<Widget>[
                  Text(
                    option.leading!,
                    style: theme.textTheme.titleMedium,
                  ),
                  const SizedBox(width: 12),
                ],
                Expanded(
                  child: Text(
                    option.label,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.labelLarge?.copyWith(
                      fontWeight:
                          option.selected ? FontWeight.w800 : FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                SizedBox(
                  width: 20,
                  child:
                      option.selected
                          ? const Icon(
                            Icons.check_rounded,
                            color: PaynColors.accent,
                            size: 20,
                          )
                          : null,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
