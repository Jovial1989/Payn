import 'dart:math' as math;

import 'package:dio/dio.dart';
import 'package:payn_mobile/shared/models/analytics_models.dart';

class MarketIntelligenceService {
  MarketIntelligenceService({Dio? dio})
    : _dio =
          dio ??
          Dio(
            BaseOptions(
              connectTimeout: const Duration(seconds: 6),
              receiveTimeout: const Duration(seconds: 6),
            ),
          );

  final Dio _dio;
  final Map<String, MarketIntelligenceSnapshot> _cache =
      <String, MarketIntelligenceSnapshot>{};

  Future<MarketIntelligenceSnapshot> snapshotFor({
    required MarketAsset asset,
    required ChartTimeRange range,
  }) async {
    final cacheKey = '${asset.name}-${range.name}';

    try {
      final points = await _fetchSeries(asset, range);
      final trendAssets = <MarketAsset>[
        MarketAsset.btc,
        MarketAsset.sp500,
        MarketAsset.eurUsd,
        MarketAsset.gold,
      ];
      final trends = await Future.wait<MarketTrendItem>(
        trendAssets.map(_safeTrendItem),
      );
      final snapshot = _buildSnapshot(
        asset: asset,
        points: points,
        trends:
            trends..sort(
              (left, right) =>
                  right.changePercent.compareTo(left.changePercent),
            ),
      );
      _cache[cacheKey] = snapshot;
      return snapshot;
    } catch (_) {
      final fallback = _cache[cacheKey] ?? _buildFallbackSnapshot(asset, range);
      _cache[cacheKey] = fallback;
      return fallback;
    }
  }

  Future<MarketTrendItem> _safeTrendItem(MarketAsset asset) async {
    try {
      final points = await _fetchSeries(asset, ChartTimeRange.week);
      return MarketTrendItem(
        asset: asset,
        valueLabel: _formatValue(asset, points.last.value),
        changePercent: _changePercent(points),
      );
    } catch (_) {
      final fallback = _fallbackSeries(asset, ChartTimeRange.week);
      return MarketTrendItem(
        asset: asset,
        valueLabel: _formatValue(asset, fallback.last.value),
        changePercent: _changePercent(fallback),
      );
    }
  }

  Future<List<SeriesPoint>> _fetchSeries(
    MarketAsset asset,
    ChartTimeRange range,
  ) async {
    final response = await _dio.get<Map<String, dynamic>>(
      'https://query1.finance.yahoo.com/v8/finance/chart/${Uri.encodeComponent(asset.symbol)}',
      queryParameters: <String, dynamic>{
        'range': _rangeQuery(range),
        'interval': _intervalQuery(range),
        'includePrePost': false,
        'events': 'div,splits',
      },
    );

    final chart = response.data?['chart'] as Map<String, dynamic>?;
    final result =
        (chart?['result'] as List<dynamic>?)?.cast<Map<String, dynamic>>();
    if (result == null || result.isEmpty) {
      throw StateError('No chart result for ${asset.symbol}');
    }

    final payload = result.first;
    final timestamps =
        (payload['timestamp'] as List<dynamic>? ?? <dynamic>[])
            .map((item) => item as int)
            .toList();
    final indicators = payload['indicators'] as Map<String, dynamic>?;
    final quotes =
        (indicators?['quote'] as List<dynamic>?)?.cast<Map<String, dynamic>>();
    final closes =
        (quotes?.first['close'] as List<dynamic>? ?? <dynamic>[])
            .map((item) => item is num ? item.toDouble() : null)
            .toList();

    final points = <SeriesPoint>[];
    for (
      var index = 0;
      index < timestamps.length && index < closes.length;
      index += 1
    ) {
      final close = closes[index];
      if (close == null || !close.isFinite) {
        continue;
      }
      points.add(
        SeriesPoint(
          time: DateTime.fromMillisecondsSinceEpoch(timestamps[index] * 1000),
          value: close,
        ),
      );
    }

    if (points.length < 2) {
      throw StateError('Not enough chart points for ${asset.symbol}');
    }

    return points;
  }

  MarketIntelligenceSnapshot _buildSnapshot({
    required MarketAsset asset,
    required List<SeriesPoint> points,
    required List<MarketTrendItem> trends,
  }) {
    final changePercent = _changePercent(points);
    final volatility = _volatility(points);
    final insights = <MarketInsight>[
      MarketInsight(
        title:
            changePercent >= 2.5
                ? 'Strong upward trend'
                : changePercent <= -2.5
                ? 'Potential correction'
                : 'Trend is stabilizing',
        body:
            'Momentum across ${asset.label} is ${changePercent >= 0 ? 'positive' : 'under pressure'} over the selected period.',
        tone:
            changePercent >= 2.5
                ? InsightTone.positive
                : changePercent <= -2.5
                ? InsightTone.warning
                : InsightTone.accent,
      ),
      MarketInsight(
        title:
            volatility >= 2.3
                ? 'Volatility increasing'
                : 'Volatility contained',
        body:
            volatility >= 2.3
                ? 'Price swings are widening, which can change entry timing.'
                : 'Price moves remain comparatively controlled right now.',
        tone: volatility >= 2.3 ? InsightTone.warning : InsightTone.neutral,
      ),
      MarketInsight(
        title:
            trends.first.asset == asset && trends.first.changePercent > 0
                ? 'Leading relative move'
                : 'Relative performance mixed',
        body:
            'Compare ${asset.label} against nearby benchmarks before committing capital.',
        tone: InsightTone.neutral,
      ),
    ];

    final recommendations = <String>[
      if (volatility >= 2.3) 'High volatility warning',
      if (changePercent >= 3.5) 'Consider diversification',
      if (asset == MarketAsset.eurUsd && volatility < 1.2)
        'Low risk profile match',
      if (asset == MarketAsset.btc && volatility >= 2.3)
        'Keep position sizing tight',
      if (asset == MarketAsset.sp500 && changePercent > 0)
        'Momentum supports staggered entry',
      if (asset == MarketAsset.gold) 'Use as defensive exposure',
    ];

    return MarketIntelligenceSnapshot(
      asset: asset,
      currentValueLabel: _formatValue(asset, points.last.value),
      changePercent: changePercent,
      points: points,
      trends: trends,
      insights: insights,
      recommendations:
          recommendations.isEmpty
              ? const <String>['Monitor price action before making a move']
              : recommendations.take(3).toList(),
    );
  }

  MarketIntelligenceSnapshot _buildFallbackSnapshot(
    MarketAsset asset,
    ChartTimeRange range,
  ) {
    final points = _fallbackSeries(asset, range);
    final trends =
        <MarketAsset>[
              MarketAsset.btc,
              MarketAsset.sp500,
              MarketAsset.eurUsd,
              MarketAsset.gold,
            ]
            .map(
              (item) => MarketTrendItem(
                asset: item,
                valueLabel: _formatValue(
                  item,
                  _fallbackSeries(item, ChartTimeRange.week).last.value,
                ),
                changePercent: _changePercent(
                  _fallbackSeries(item, ChartTimeRange.week),
                ),
              ),
            )
            .toList()
          ..sort(
            (left, right) => right.changePercent.compareTo(left.changePercent),
          );

    return _buildSnapshot(asset: asset, points: points, trends: trends);
  }

  List<SeriesPoint> _fallbackSeries(MarketAsset asset, ChartTimeRange range) {
    final now = DateTime.now();
    final count = range.pointCount;
    final baseline = switch (asset) {
      MarketAsset.btc => 68200.0,
      MarketAsset.sp500 => 5310.0,
      MarketAsset.eurUsd => 1.09,
      MarketAsset.gold => 2184.0,
    };
    final volatility = switch (asset) {
      MarketAsset.btc => 0.045,
      MarketAsset.sp500 => 0.012,
      MarketAsset.eurUsd => 0.006,
      MarketAsset.gold => 0.01,
    };

    return List<SeriesPoint>.generate(count, (index) {
      final progress = count == 1 ? 1.0 : index / (count - 1);
      final drift = baseline * progress * volatility * 2.8;
      final wave =
          math.sin(progress * math.pi * 1.4) * baseline * volatility +
          math.cos(progress * math.pi * 0.8) * baseline * volatility * 0.45;

      return SeriesPoint(
        time: _timeForRange(now, range, count, index),
        value: baseline + drift + wave,
      );
    });
  }

  DateTime _timeForRange(
    DateTime now,
    ChartTimeRange range,
    int count,
    int index,
  ) {
    switch (range) {
      case ChartTimeRange.day:
        return now.subtract(Duration(hours: count - index - 1));
      case ChartTimeRange.week:
        return now.subtract(Duration(days: count - index - 1));
      case ChartTimeRange.month:
        return now.subtract(Duration(days: count - index - 1));
    }
  }

  double _changePercent(List<SeriesPoint> points) {
    if (points.length < 2) {
      return 0;
    }
    final first = points.first.value;
    final last = points.last.value;
    if (first == 0) {
      return 0;
    }
    return ((last - first) / first) * 100;
  }

  double _volatility(List<SeriesPoint> points) {
    if (points.length < 2) {
      return 0;
    }
    final changes = <double>[];
    for (var index = 1; index < points.length; index += 1) {
      final previous = points[index - 1].value;
      if (previous == 0) {
        continue;
      }
      changes.add(((points[index].value - previous) / previous).abs() * 100);
    }
    if (changes.isEmpty) {
      return 0;
    }
    return changes.reduce((left, right) => left + right) / changes.length;
  }

  String _rangeQuery(ChartTimeRange range) {
    switch (range) {
      case ChartTimeRange.day:
        return '1d';
      case ChartTimeRange.week:
        return '7d';
      case ChartTimeRange.month:
        return '1mo';
    }
  }

  String _intervalQuery(ChartTimeRange range) {
    switch (range) {
      case ChartTimeRange.day:
        return '1h';
      case ChartTimeRange.week:
        return '1d';
      case ChartTimeRange.month:
        return '1d';
    }
  }

  String _formatValue(MarketAsset asset, double value) {
    switch (asset) {
      case MarketAsset.btc:
      case MarketAsset.gold:
        return '\$${value.toStringAsFixed(0)}';
      case MarketAsset.sp500:
        return value.toStringAsFixed(0);
      case MarketAsset.eurUsd:
        return value.toStringAsFixed(4);
    }
  }
}
