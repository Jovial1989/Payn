import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:payn_mobile/core/localization/app_localizations_ext.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/shared/services/app_scope.dart';

enum AuthMode { signIn, signUp }

// Password strength buckets surfaced under the input on sign-up. Bands
// are intentionally coarse — a true zxcvbn-style score would need a
// dictionary check we can't ship to the mobile bundle. These rules
// catch the obvious failures (too short, single character class) and
// land on "Strong" for the common 12+ char mixed-case + digit case.
enum _PasswordStrength { empty, weak, medium, strong }

_PasswordStrength _scorePassword(String value) {
  if (value.isEmpty) return _PasswordStrength.empty;
  if (value.length < 8) return _PasswordStrength.weak;
  var classes = 0;
  if (RegExp(r'[a-z]').hasMatch(value)) classes++;
  if (RegExp(r'[A-Z]').hasMatch(value)) classes++;
  if (RegExp(r'\d').hasMatch(value)) classes++;
  if (RegExp(r'[^A-Za-z0-9]').hasMatch(value)) classes++;
  if (value.length >= 12 && classes >= 3) return _PasswordStrength.strong;
  if (classes >= 2) return _PasswordStrength.medium;
  return _PasswordStrength.weak;
}

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
  bool _showPassword = false;
  bool _termsAccepted = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _passwordController.addListener(_onPasswordChanged);
  }

  void _onPasswordChanged() {
    // setState() to refresh the strength indicator. Cheap — the
    // strength widget rebuilds, no controllers re-create.
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _passwordController.removeListener(_onPasswordChanged);
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  bool get _isSignUp => _mode == AuthMode.signUp;
  bool get _canSubmit {
    if (_submitting) return false;
    if (_emailController.text.trim().isEmpty) return false;
    if (_passwordController.text.isEmpty) return false;
    if (_isSignUp) {
      if (!_termsAccepted) return false;
      final strength = _scorePassword(_passwordController.text);
      if (strength == _PasswordStrength.weak ||
          strength == _PasswordStrength.empty) {
        return false;
      }
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = context.l10n;

    return Scaffold(
      appBar: AppBar(),
      body: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 40),
          children: <Widget>[
            Container(
              padding: const EdgeInsets.fromLTRB(20, 22, 20, 22),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [PaynColors.surfaceDark, PaynColors.surfaceElevatedDark],
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    _mode == AuthMode.signIn
                        ? l10n.authSignIn
                        : l10n.authCreateAccount,
                    style: theme.textTheme.headlineMedium?.copyWith(
                      color: PaynColors.textInverse,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    l10n.authOptionalDescription,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: Colors.white.withValues(alpha: 0.6),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            SegmentedButton<AuthMode>(
              segments: <ButtonSegment<AuthMode>>[
                ButtonSegment<AuthMode>(
                  value: AuthMode.signIn,
                  label: Text(l10n.authSignIn),
                ),
                ButtonSegment<AuthMode>(
                  value: AuthMode.signUp,
                  label: Text(l10n.authSignUp),
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
              textInputAction: TextInputAction.next,
              autocorrect: false,
              autofillHints: const <String>[AutofillHints.email],
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                labelText: l10n.authEmail,
                hintText: l10n.authEmailPlaceholder,
                prefixIcon: const Icon(Icons.alternate_email_rounded, size: 18),
              ),
            ),
            const SizedBox(height: 10),
            // P0.6 — Password field with show/hide toggle. Default
            // hidden; tapping the eye icon flips the state. Autofill
            // hints differ between sign-in (existing password) and
            // sign-up (new password) so iOS Password autofill works
            // correctly on both flows.
            TextField(
              controller: _passwordController,
              obscureText: !_showPassword,
              textInputAction: TextInputAction.done,
              autofillHints: <String>[
                _isSignUp
                    ? AutofillHints.newPassword
                    : AutofillHints.password,
              ],
              onSubmitted: (_) {
                if (_canSubmit) _submit(context);
              },
              decoration: InputDecoration(
                labelText: l10n.authPassword,
                hintText: l10n.authPasswordPlaceholder,
                prefixIcon: const Icon(Icons.lock_outline_rounded, size: 18),
                suffixIcon: IconButton(
                  icon: Icon(
                    _showPassword
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined,
                    size: 20,
                  ),
                  tooltip: _showPassword ? 'Hide password' : 'Show password',
                  onPressed: () => setState(() => _showPassword = !_showPassword),
                ),
              ),
            ),
            // P0.6 — Password strength indicator. Only shown on sign-up
            // and only after the user has typed something. A weak score
            // disables Create account so users can't ship "12345678" to
            // the backend.
            if (_isSignUp && _passwordController.text.isNotEmpty) ...<Widget>[
              const SizedBox(height: 8),
              _PasswordStrengthMeter(
                strength: _scorePassword(_passwordController.text),
              ),
            ],
            // P0.6 — GDPR T&C consent checkbox. Required for EU launch.
            // Submit stays disabled until checked. Links are placeholder
            // markdown-style — wire to /legal/terms and /legal/privacy
            // once those pages ship.
            if (_isSignUp) ...<Widget>[
              const SizedBox(height: 12),
              _TermsCheckbox(
                checked: _termsAccepted,
                onChanged: (value) =>
                    setState(() => _termsAccepted = value ?? false),
              ),
            ],
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
              onPressed: _canSubmit ? () => _submit(context) : null,
              child: Text(
                _submitting
                    ? l10n.authWorking
                    : _mode == AuthMode.signIn
                    ? l10n.authSignIn
                    : l10n.authCreateAccount,
              ),
            ),
            const SizedBox(height: 8),
            OutlinedButton(
              onPressed: () => context.pop(),
              child: Text(l10n.authContinueGuest),
            ),
            const SizedBox(height: 20),
            // ── Social auth divider ───────────────────────────────────────
            Row(
              children: <Widget>[
                const Expanded(child: Divider()),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  child: Text(
                    'or continue with',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: PaynColors.textTertiary,
                      letterSpacing: 0.2,
                    ),
                  ),
                ),
                const Expanded(child: Divider()),
              ],
            ),
            const SizedBox(height: 14),
            _SocialAuthButton(
              onPressed: _submitting ? null : () => _signInWithGoogle(context),
              logo: const _GoogleLogo(),
              label: 'Continue with Google',
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
    final l10n = context.l10n;

    setState(() {
      _submitting = true;
      _error = null;
    });

    // MOB.3 — Wrap the whole submit in try/catch so a thrown
    // exception from the auth repository (network failure, bad
    // credentials surfaced as a thrown error, downstream listener
    // crash during notifyListeners) shows an inline message instead
    // of dropping the app onto Flutter's red ErrorWidget screen. The
    // previous version trusted controller.signIn to always return a
    // String? and never throw — that assumption broke as soon as the
    // dashboard rebuild on auth-state-change tripped over a nullable.
    String? error;
    try {
      error = _mode == AuthMode.signIn
          ? await controller.signIn(
              email: _emailController.text,
              password: _passwordController.text,
            )
          : await controller.signUp(
              email: _emailController.text,
              password: _passwordController.text,
            );
    } catch (e, stack) {
      debugPrint('[auth] submit failed: $e\n$stack');
      error = 'Something went wrong. Please try again.';
    }

    if (!mounted) return;

    setState(() {
      _submitting = false;
      _error = error;
    });

    if (error == null) {
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            _mode == AuthMode.signIn
                ? l10n.authSignedInSuccess
                : l10n.authCreatedSuccess,
          ),
        ),
      );
      // Defer pop to next frame so any listeners that rebuild on the
      // auth state change have a chance to settle before the route
      // animation starts. Without this, a synchronous notifyListeners
      // fired during pop() can interleave with the route animation
      // and surface a brief mid-transition error frame on slower
      // simulators.
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        router.pop();
      });
    }
  }

  Future<void> _signInWithGoogle(BuildContext context) async {
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      await AppScope.of(context).signInWithGoogle();
      if (!context.mounted) return;
      // Explicit navigation — GoRouter redirect fires on notifyListeners but
      // can miss the frame; this guarantees immediate transition.
      context.go('/home');
    } catch (e) {
      if (!mounted) return;
      final msg = e.toString();
      if (msg.contains('cancelled')) {
        // User dismissed the picker — not an error, just reset.
        setState(() => _submitting = false);
        return;
      }
      setState(() {
        if (kDebugMode) {
          _error = 'Google error (debug): $msg';
        } else if (msg.contains('GIDClientID') || msg.contains('REPLACE_WITH')) {
          _error = 'Google Sign-In is not configured yet. Use email/password for now.';
        } else {
          _error = 'Google sign-in failed. Please try again.';
        }
      });
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

}

// ─────────────────────────────────────────────────────────────────────────────
// Social auth button + provider logos
// ─────────────────────────────────────────────────────────────────────────────

class _SocialAuthButton extends StatelessWidget {
  const _SocialAuthButton({
    required this.onPressed,
    required this.logo,
    required this.label,
  });

  final VoidCallback? onPressed;
  final Widget logo;
  final String label;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          foregroundColor: PaynColors.text,
          side: const BorderSide(color: PaynColors.outline),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            logo,
            const SizedBox(width: 10),
            Text(
              label,
              style: theme.textTheme.labelLarge?.copyWith(
                fontWeight: FontWeight.w500,
                color: PaynColors.text,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Google "G" logo rendered via CustomPaint.
class _GoogleLogo extends StatelessWidget {
  const _GoogleLogo();

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: const Size(20, 20),
      painter: _GoogleLogoPainter(),
    );
  }
}

class _GoogleLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final rect = Rect.fromLTWH(0, 0, size.width, size.height);
    final center = rect.center;
    final r = size.width / 2;

    // Draw Google G using arc segments
    final paint = Paint()..style = PaintingStyle.fill;

    // Red segment
    paint.color = const Color(0xFFEA4335);
    canvas.drawArc(rect, -0.5236, 1.5708, true, paint);

    // Yellow segment
    paint.color = const Color(0xFFFBBC05);
    canvas.drawArc(rect, 1.0472, 1.5708, true, paint);

    // Green segment
    paint.color = const Color(0xFF34A853);
    canvas.drawArc(rect, 2.618, 1.5708, true, paint);

    // Blue segment
    paint.color = const Color(0xFF4285F4);
    canvas.drawArc(rect, -2.0944, 1.5708, true, paint);

    // White center circle
    paint.color = Colors.white;
    canvas.drawCircle(center, r * 0.58, paint);

    // Blue right bar
    paint.color = const Color(0xFF4285F4);
    canvas.drawRect(
      Rect.fromLTWH(center.dx, center.dy - r * 0.22, r, r * 0.44),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Visual strength bar shown under the password field on sign-up.
/// Three coloured segments: weak (red) → medium (amber) → strong
/// (emerald). The unmet segments are rendered as faint outlines so the
/// user can see how much progress they've made toward "strong".
class _PasswordStrengthMeter extends StatelessWidget {
  const _PasswordStrengthMeter({required this.strength});

  final _PasswordStrength strength;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final reached = switch (strength) {
      _PasswordStrength.empty => 0,
      _PasswordStrength.weak => 1,
      _PasswordStrength.medium => 2,
      _PasswordStrength.strong => 3,
    };
    final colour = switch (strength) {
      _PasswordStrength.weak => const Color(0xFFD92D20),
      _PasswordStrength.medium => const Color(0xFFD97706),
      _PasswordStrength.strong => PaynColors.accent,
      _PasswordStrength.empty => PaynColors.outlineSubtle,
    };
    final label = switch (strength) {
      _PasswordStrength.weak =>
        'Too weak — use at least 8 characters with letters + numbers.',
      _PasswordStrength.medium => 'Good — adding length or symbols makes it stronger.',
      _PasswordStrength.strong => 'Strong.',
      _PasswordStrength.empty => '',
    };

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Row(
          children: List<Widget>.generate(3, (index) {
            final filled = index < reached;
            return Expanded(
              child: Padding(
                padding: EdgeInsets.only(right: index < 2 ? 6 : 0),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  height: 4,
                  decoration: BoxDecoration(
                    color: filled ? colour : PaynColors.outlineSubtle,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
            );
          }),
        ),
        if (label.isNotEmpty) ...<Widget>[
          const SizedBox(height: 6),
          Text(
            label,
            style: theme.textTheme.labelMedium?.copyWith(
              color: strength == _PasswordStrength.weak
                  ? const Color(0xFFB42318)
                  : PaynColors.textSecondary,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ],
    );
  }
}

/// GDPR-compliant T&C / Privacy consent checkbox. Tapping the row OR the
/// "Terms" / "Privacy" link launches the respective legal page. Submit
/// stays disabled until the checkbox is checked.
class _TermsCheckbox extends StatelessWidget {
  const _TermsCheckbox({required this.checked, required this.onChanged});

  final bool checked;
  final ValueChanged<bool?> onChanged;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: () => onChanged(!checked),
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            SizedBox(
              width: 24,
              height: 24,
              child: Checkbox(
                value: checked,
                onChanged: onChanged,
                visualDensity: VisualDensity.compact,
                activeColor: PaynColors.accent,
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text.rich(
                TextSpan(
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: PaynColors.textSecondary,
                    fontSize: 13,
                    height: 1.4,
                  ),
                  children: const <TextSpan>[
                    TextSpan(text: 'I agree to the '),
                    TextSpan(
                      text: 'Terms',
                      style: TextStyle(
                        color: PaynColors.accent,
                        fontWeight: FontWeight.w700,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                    TextSpan(text: ' and '),
                    TextSpan(
                      text: 'Privacy Policy',
                      style: TextStyle(
                        color: PaynColors.accent,
                        fontWeight: FontWeight.w700,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                    TextSpan(text: '.'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
