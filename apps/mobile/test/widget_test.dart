import 'package:flutter_test/flutter_test.dart';
import 'package:payn_mobile/app/payn_app.dart';

void main() {
  testWidgets('renders the Payn mobile shell', (WidgetTester tester) async {
    await tester.pumpWidget(const PaynApp());

    expect(find.text('Loans'), findsWidgets);
    expect(find.text('Comparison focus'), findsOneWidget);
  });
}
