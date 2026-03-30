import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';

enum AuthMode { signIn, signUp }

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key, required this.initialMode});

  final AuthMode initialMode;

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  late AuthMode _mode = widget.initialMode;
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(),
      body: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 40),
          children: <Widget>[
            Text(
              _mode == AuthMode.signIn ? 'Sign in' : 'Create account',
              style: theme.textTheme.headlineMedium,
            ),
            const SizedBox(height: 4),
            Text(
              'Login is optional. Guest mode works without an account.',
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            SegmentedButton<AuthMode>(
              segments: const <ButtonSegment<AuthMode>>[
                ButtonSegment<AuthMode>(
                  value: AuthMode.signIn,
                  label: Text('Sign in'),
                ),
                ButtonSegment<AuthMode>(
                  value: AuthMode.signUp,
                  label: Text('Sign up'),
                ),
              ],
              selected: <AuthMode>{_mode},
              onSelectionChanged: (selection) {
                setState(() {
                  _mode = selection.first;
                  _error = null;
                });
              },
            ),
            const SizedBox(height: 14),
            TextField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                labelText: 'Email',
                hintText: 'you@example.com',
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _passwordController,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Password',
                hintText: 'At least 6 characters',
              ),
            ),
            if (_error != null) ...<Widget>[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEE2E2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  _error!,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: PaynColors.error,
                  ),
                ),
              ),
            ],
            const SizedBox(height: 14),
            FilledButton(
              onPressed: _submitting ? null : () => _submit(context),
              child: Text(
                _submitting
                    ? 'Working...'
                    : _mode == AuthMode.signIn
                    ? 'Sign in'
                    : 'Create account',
              ),
            ),
            const SizedBox(height: 8),
            OutlinedButton(
              onPressed: () => context.pop(),
              child: const Text('Continue as guest'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submit(BuildContext context) async {
    final controller = AppScope.of(context);
    final messenger = ScaffoldMessenger.of(context);
    final router = GoRouter.of(context);

    setState(() {
      _submitting = true;
      _error = null;
    });

    final error =
        _mode == AuthMode.signIn
            ? await controller.signIn(
              email: _emailController.text,
              password: _passwordController.text,
            )
            : await controller.signUp(
              email: _emailController.text,
              password: _passwordController.text,
            );

    if (!mounted) return;

    setState(() {
      _submitting = false;
      _error = error;
    });

    if (error == null) {
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            _mode == AuthMode.signIn ? 'Signed in.' : 'Account created.',
          ),
        ),
      );
      router.pop();
    }
  }
}
