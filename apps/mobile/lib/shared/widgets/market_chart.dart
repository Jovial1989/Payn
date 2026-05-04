import 'dart:math' as math;

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/models/analytics_models.dart';

class MarketChartLine {
  const MarketChartLine({
    required this.label,
    required this.points,
    required this.color,
    this.showArea = false,
  });

  final String label;
  final List<SeriesPoint> points;
  final Color color;
  final bool showArea;
}

class MarketChart extends StatelessWidget {
  const MarketChart({
    super.key,
    required this.lines,
    required this.range,
    this.height = 220,
    this.showLegend = true,
  });

  final List<MarketChartLine> lines;
  final ChartTimeRange range;
  final double height;
  final bool showLegend;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final flattened = lines.expand((line) => line.points).toList();
    if (flattened.isEmpty) {
      return SizedBox(height: height);
    }

    final values = flattened.map((point) => point.value).toList();
    final minValue = values.reduce(math.min);
    final maxValue = values.reduce(math.max);
    final valuePadding = math.max(
      (maxValue - minValue) * 0.18,
      maxValue * 0.02,
    );
    final maxPointCount =
        lines.map((line) => line.points.length).reduce(math.max).toDouble();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        SizedBox(
          height: height,
          child: LineChart(
            LineChartData(
              minX: 0,
              maxX: maxPointCount - 1,
              minY: minValue - valuePadding,
              maxY: maxValue + valuePadding,
              borderData: FlBorderData(show: false),
              clipData: const FlClipData.all(),
              gridData: FlGridData(
                show: true,
                drawVerticalLine: false,
                horizontalInterval:
                    (maxValue - minValue) <= 0 ? 1 : (maxValue - minValue) / 4,
                getDrawingHorizontalLine:
                    (_) =>
                        FlLine(color: PaynColors.outlineSubtle, strokeWidth: 0.5),
              ),
              titlesData: FlTitlesData(
                topTitles: const AxisTitles(),
                rightTitles: const AxisTitles(),
                leftTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    reservedSize: 42,
                    interval:
                        (maxValue - minValue) <= 0
                            ? 1
                            : (maxValue - minValue) / 2,
                    getTitlesWidget:
                        (value, meta) => Text(
                          _formatYAxis(context, value),
                          style: theme.textTheme.labelMedium,
                        ),
                  ),
                ),
                bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    reservedSize: 24,
                    interval: math.max(1, (maxPointCount - 1) / 2),
                    getTitlesWidget: (value, meta) {
                      final index = value.round().clamp(
                        0,
                        lines.first.points.length - 1,
                      );
                      return Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Text(
                          _formatXAxis(
                            context,
                            lines.first.points[index].time,
                            range,
                          ),
                          style: theme.textTheme.labelMedium,
                        ),
                      );
                    },
                  ),
                ),
              ),
              lineBarsData:
                  lines.map((line) {
                    return LineChartBarData(
                      isCurved: true,
                      barWidth: 2.8,
                      color: line.color,
                      dotData: const FlDotData(show: false),
                      belowBarData:
                          line.showArea
                              ? BarAreaData(
                                show: true,
                                gradient: LinearGradient(
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                  colors: <Color>[
                                    line.color.withValues(alpha: 0.18),
                                    line.color.withValues(alpha: 0.02),
                                  ],
                                ),
                              )
                              : BarAreaData(show: false),
                      spots:
                          line.points
                              .asMap()
                              .entries
                              .map(
                                (entry) => FlSpot(
                                  entry.key.toDouble(),
                                  entry.value.value,
                                ),
                              )
                              .toList(),
                    );
                  }).toList(),
              lineTouchData: LineTouchData(
                handleBuiltInTouches: true,
                getTouchedSpotIndicator:
                    (barData, spotIndexes) =>
                        spotIndexes
                            .map(
                              (_) => TouchedSpotIndicatorData(
                                FlLine(
                                  color: barData.color?.withValues(alpha: 0.22),
                                  strokeWidth: 1,
                                ),
                                FlDotData(
                                  show: true,
                                  getDotPainter:
                                      (_, __, ___, ____) => FlDotCirclePainter(
                                        radius: 4,
                                        color: barData.color ?? PaynColors.text,
                                        strokeWidth: 2,
                                        strokeColor: Colors.white,
                                      ),
                                ),
                              ),
                            )
                            .toList(),
                touchTooltipData: LineTouchTooltipData(
                  tooltipPadding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 8,
                  ),
                  tooltipRoundedRadius: 12,
                  fitInsideHorizontally: true,
                  fitInsideVertically: true,
                  getTooltipItems:
                      (spots) =>
                          spots.map((spot) {
                            final line = lines[spot.barIndex];
                            return LineTooltipItem(
                              '${line.label}\n${spot.y.toStringAsFixed(spot.y < 10 ? 2 : 0)}',
                              theme.textTheme.labelLarge!.copyWith(
                                color: PaynColors.text,
                              ),
                            );
                          }).toList(),
                ),
              ),
            ),
            duration: const Duration(milliseconds: 280),
            curve: Curves.easeOutCubic,
          ),
        ),
        if (showLegend) ...<Widget>[
          const SizedBox(height: 12),
          Wrap(
            spacing: 12,
            runSpacing: 8,
            children:
                lines.map((line) {
                  return Row(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          color: line.color,
                          borderRadius: BorderRadius.circular(999),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        line.label,
                        style: theme.textTheme.labelMedium?.copyWith(
                          color: PaynColors.textSecondary,
                        ),
                      ),
                    ],
                  );
                }).toList(),
          ),
        ],
      ],
    );
  }

  String _formatYAxis(BuildContext context, double value) {
    if (value.abs() >= 1000) {
      return '${(value / 1000).toStringAsFixed(1)}k';
    }
    if (value.abs() < 10) {
      return value.toStringAsFixed(1);
    }
    return value.toStringAsFixed(0);
  }

  String _formatXAxis(
    BuildContext context,
    DateTime time,
    ChartTimeRange range,
  ) {
    final localeName = Localizations.localeOf(context).toLanguageTag();
    switch (range) {
      case ChartTimeRange.day:
        return '${time.hour.toString().padLeft(2, '0')}:00';
      case ChartTimeRange.week:
        return DateFormat.E(localeName).format(time);
      case ChartTimeRange.month:
        return DateFormat.Md(localeName).format(time);
    }
  }
}
