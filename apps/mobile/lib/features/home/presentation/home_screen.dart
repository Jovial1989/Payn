import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text(
                'Payn',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700),
              ),
              SizedBox(height: 12),
              Text(
                'Mobile foundation for saved offers, alerts, and authenticated discovery.',
                style: TextStyle(fontSize: 16, color: Color(0xFF96B5A7)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

