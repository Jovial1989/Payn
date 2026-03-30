import 'package:flutter/foundation.dart';

enum ChartTimeRange { day, week, month }

extension ChartTimeRangeLabel on ChartTimeRange {
  String get shortLabel {
    switch (this) {
      case ChartTimeRange.day:
        return '24H';
      case ChartTimeRange.week:
        return '7D';
      case ChartTimeRange.month:
        return '30D';
    }
  }

  int get pointCount {
    switch (this) {
      case ChartTimeRange.day:
        return 24;
      case ChartTimeRange.week:
        return 7;
      case ChartTimeRange.month:
        return 30;
    }
  }
}

@immutable
class SeriesPoint {
  const SeriesPoint({required this.time, required this.value});

  final DateTime time;
  final double value;
}

@immutable
class DashboardActivitySnapshot {
  const DashboardActivitySnapshot({
    required this.totalViews,
    required this.clickThroughRate,
    required this.savedOffers,
    required this.changePercent,
    required this.insight,
    required this.views,
    required this.clicks,
    required this.saves,
  });

  final int totalViews;
  final double clickThroughRate;
  final int savedOffers;
  final double changePercent;
  final String insight;
  final List<SeriesPoint> views;
  final List<SeriesPoint> clicks;
  final List<SeriesPoint> saves;
}

enum MarketAsset { btc, sp500, eurUsd, gold }

extension MarketAssetMeta on MarketAsset {
  String get label {
    switch (this) {
      case MarketAsset.btc:
        return 'BTC';
      case MarketAsset.sp500:
        return 'S&P 500';
      case MarketAsset.eurUsd:
        return 'EUR/USD';
      case MarketAsset.gold:
        return 'Gold';
    }
  }

  String get symbol {
    switch (this) {
      case MarketAsset.btc:
        return 'BTC-USD';
      case MarketAsset.sp500:
        return '^GSPC';
      case MarketAsset.eurUsd:
        return 'EURUSD=X';
      case MarketAsset.gold:
        return 'GC=F';
    }
  }

  String get priceLabel {
    switch (this) {
      case MarketAsset.btc:
        return 'Spot price';
      case MarketAsset.sp500:
        return 'Index level';
      case MarketAsset.eurUsd:
        return 'FX rate';
      case MarketAsset.gold:
        return 'Futures price';
    }
  }
}

enum InsightTone { neutral, positive, accent, warning }

@immutable
class MarketTrendItem {
  const MarketTrendItem({
    required this.asset,
    required this.valueLabel,
    required this.changePercent,
  });

  final MarketAsset asset;
  final String valueLabel;
  final double changePercent;
}

@immutable
class MarketInsight {
  const MarketInsight({
    required this.title,
    required this.body,
    required this.tone,
  });

  final String title;
  final String body;
  final InsightTone tone;
}

@immutable
class MarketIntelligenceSnapshot {
  const MarketIntelligenceSnapshot({
    required this.asset,
    required this.currentValueLabel,
    required this.changePercent,
    required this.points,
    required this.trends,
    required this.insights,
    required this.recommendations,
  });

  final MarketAsset asset;
  final String currentValueLabel;
  final double changePercent;
  final List<SeriesPoint> points;
  final List<MarketTrendItem> trends;
  final List<MarketInsight> insights;
  final List<String> recommendations;
}
