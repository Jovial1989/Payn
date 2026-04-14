import 'dart:async';

import 'package:flutter/widgets.dart';

class AnalyticsViewTracker extends StatefulWidget {
  const AnalyticsViewTracker({
    super.key,
    required this.viewKey,
    required this.onTrack,
  });

  final String viewKey;
  final Future<void> Function() onTrack;

  @override
  State<AnalyticsViewTracker> createState() => _AnalyticsViewTrackerState();
}

class _AnalyticsViewTrackerState extends State<AnalyticsViewTracker> {
  String? _lastTrackedKey;

  @override
  void initState() {
    super.initState();
    _scheduleTrack();
  }

  @override
  void didUpdateWidget(covariant AnalyticsViewTracker oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (oldWidget.viewKey != widget.viewKey) {
      _scheduleTrack(force: true);
    }
  }

  void _scheduleTrack({bool force = false}) {
    if (!force && _lastTrackedKey == widget.viewKey) {
      return;
    }

    _lastTrackedKey = widget.viewKey;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) {
        return;
      }

      unawaited(widget.onTrack());
    });
  }

  @override
  Widget build(BuildContext context) {
    return const SizedBox.shrink();
  }
}
