import 'dart:math' as math;

import 'package:payn_mobile/shared/models/analytics_models.dart';

class DashboardAnalyticsService {
  DashboardActivitySnapshot buildSnapshot({
    required ChartTimeRange range,
    required int savedCount,
    required int compareCount,
    required int recentCount,
  }) {
    final now = DateTime.now();
    final points = range.pointCount;
    final views = <SeriesPoint>[];
    final clicks = <SeriesPoint>[];
    final saves = <SeriesPoint>[];

    for (var index = 0; index < points; index += 1) {
      final progress = points == 1 ? 1.0 : index / (points - 1);
      final phase = progress * math.pi * 1.35;
      final activityBias =
          38 +
          savedCount * 4 +
          compareCount * 6 +
          recentCount * 3 +
          progress * (18 + compareCount * 2);
      final viewsValue =
          activityBias +
          math.sin(phase) * 9 +
          math.cos(progress * math.pi * 0.7) * 4;
      final clicksValue = viewsValue * (0.22 + progress * 0.08);
      final saveValue = math.max<double>(
        1.0,
        savedCount.toDouble() * 0.7 +
            progress * 4 +
            math.sin(phase * 1.2) * 1.4,
      );

      views.add(
        SeriesPoint(
          time: _timeForRange(now, range, points, index),
          value: viewsValue,
        ),
      );
      clicks.add(
        SeriesPoint(
          time: _timeForRange(now, range, points, index),
          value: clicksValue,
        ),
      );
      saves.add(
        SeriesPoint(
          time: _timeForRange(now, range, points, index),
          value: saveValue,
        ),
      );
    }

    final totalViews =
        views.fold<double>(0, (sum, point) => sum + point.value).round();
    final totalClicks =
        clicks.fold<double>(0, (sum, point) => sum + point.value).round();
    final clickThroughRate =
        totalViews == 0 ? 0.0 : (totalClicks / totalViews) * 100;
    final baseline = views
        .take(points ~/ 2)
        .fold<double>(0, (sum, point) => sum + point.value);
    final latest = views
        .skip(points ~/ 2)
        .fold<double>(0, (sum, point) => sum + point.value);
    final changePercent =
        baseline == 0 ? 0.0 : ((latest - baseline) / baseline) * 100;

    return DashboardActivitySnapshot(
      totalViews: totalViews,
      clickThroughRate: clickThroughRate,
      savedOffers: savedCount,
      changePercent: changePercent,
      insight:
          'Your activity increased by ${changePercent.abs().round()}% this ${range == ChartTimeRange.day
              ? 'day'
              : range == ChartTimeRange.week
              ? 'week'
              : 'month'}.',
      views: views,
      clicks: clicks,
      saves: saves,
    );
  }

  DateTime _timeForRange(
    DateTime now,
    ChartTimeRange range,
    int points,
    int index,
  ) {
    switch (range) {
      case ChartTimeRange.day:
        return now.subtract(Duration(hours: points - index - 1));
      case ChartTimeRange.week:
        return now.subtract(Duration(days: points - index - 1));
      case ChartTimeRange.month:
        return now.subtract(Duration(days: points - index - 1));
    }
  }
}
