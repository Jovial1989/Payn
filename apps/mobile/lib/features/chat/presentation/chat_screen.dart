import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:payn_mobile/core/theme/app_theme.dart';
import 'package:payn_mobile/features/chat/services/chat_service.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final ChatService _chatService = ChatService(Dio());

  final List<ChatMessage> _messages = [];
  List<String> _suggestions = const [
    'How does Payn work?',
    'What is APR?',
    'Best way to send money?',
    'Compare loans vs credit cards',
  ];
  bool _loading = false;

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _send(String text) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty || _loading) return;

    _inputController.clear();
    setState(() {
      _messages.add(ChatMessage(role: 'user', content: trimmed));
      _loading = true;
      _suggestions = const [];
    });

    _scrollToBottom();

    try {
      final result = await _chatService.send(messages: _messages);
      if (!mounted) return;
      setState(() {
        _messages.add(ChatMessage(role: 'assistant', content: result.reply));
        _suggestions = result.suggestions;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _messages.add(
          const ChatMessage(
            role: 'assistant',
            content: "I couldn't connect right now. Please try again.",
          ),
        );
        _loading = false;
      });
    }

    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          0,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOutCubic,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final hasMessages = _messages.isNotEmpty;

    return Scaffold(
      backgroundColor: PaynColors.surface,
      appBar: AppBar(
        backgroundColor: PaynColors.surface,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: const Text('Payn AI'),
        leading: const _BackButton(),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(
            height: 1,
            color: PaynColors.outlineSubtle,
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // ── Messages ──
            Expanded(
              child: hasMessages
                  ? ListView.builder(
                      controller: _scrollController,
                      reverse: true,
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                      itemCount: _messages.length + (_loading ? 1 : 0),
                      itemBuilder: (context, index) {
                        // Loading bubble at top of reversed list
                        if (_loading && index == 0) {
                          return const _TypingBubble();
                        }
                        final realIndex = _loading
                            ? _messages.length - index
                            : _messages.length - 1 - index;
                        final msg = _messages[realIndex];
                        return _MessageBubble(message: msg);
                      },
                    )
                  : _WelcomeState(theme: theme),
            ),
            // ── Suggestion chips ──
            if (_suggestions.isNotEmpty && !_loading)
              _SuggestionChips(
                suggestions: _suggestions,
                onTap: _send,
              ),
            // ── Input area ──
            _InputBar(
              controller: _inputController,
              loading: _loading,
              onSend: () => _send(_inputController.text),
            ),
          ],
        ),
      ),
    );
  }
}

class _BackButton extends StatelessWidget {
  const _BackButton();

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
      onPressed: () => Navigator.of(context).maybePop(),
    );
  }
}

class _WelcomeState extends StatelessWidget {
  const _WelcomeState({required this.theme});

  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 68,
              height: 68,
              decoration: BoxDecoration(
                color: PaynColors.accentSurface,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.auto_awesome_rounded,
                size: 32,
                color: PaynColors.accent,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Ask me anything about loans, cards, transfers, or exchange rates.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyLarge?.copyWith(
                color: PaynColors.textSecondary,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({required this.message});

  final ChatMessage message;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isUser = message.role == 'user';

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.78,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: isUser ? PaynColors.accentSurface : PaynColors.surfaceRaised,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(20),
            topRight: const Radius.circular(20),
            bottomLeft:
                isUser ? const Radius.circular(20) : const Radius.circular(4),
            bottomRight:
                isUser ? const Radius.circular(4) : const Radius.circular(20),
          ),
        ),
        child: Text(
          message.content,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: isUser ? PaynColors.accentStrong : PaynColors.text,
            height: 1.45,
          ),
        ),
      ),
    );
  }
}

class _TypingBubble extends StatelessWidget {
  const _TypingBubble();

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: PaynColors.surfaceRaised,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
            bottomLeft: Radius.circular(4),
            bottomRight: Radius.circular(20),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _Dot(delay: 0),
            const SizedBox(width: 4),
            _Dot(delay: 150),
            const SizedBox(width: 4),
            _Dot(delay: 300),
          ],
        ),
      ),
    );
  }
}

class _Dot extends StatefulWidget {
  const _Dot({required this.delay});
  final int delay;

  @override
  State<_Dot> createState() => _DotState();
}

class _DotState extends State<_Dot> with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 600),
  )..repeat(reverse: true);

  late final Animation<double> _anim = Tween<double>(begin: 0.3, end: 1.0)
      .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut));

  @override
  void initState() {
    super.initState();
    Future.delayed(Duration(milliseconds: widget.delay), () {
      if (mounted) _ctrl.forward();
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _anim,
      child: Container(
        width: 7,
        height: 7,
        decoration: const BoxDecoration(
          color: PaynColors.textTertiary,
          shape: BoxShape.circle,
        ),
      ),
    );
  }
}

class _SuggestionChips extends StatelessWidget {
  const _SuggestionChips({
    required this.suggestions,
    required this.onTap,
  });

  final List<String> suggestions;
  final void Function(String) onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      height: 46,
      margin: const EdgeInsets.only(bottom: 4),
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        physics: const BouncingScrollPhysics(),
        itemCount: suggestions.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final s = suggestions[index];
          return GestureDetector(
            onTap: () => onTap(s),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: PaynColors.surfaceRaised,
                borderRadius: BorderRadius.circular(PaynRadius.chip),
                border: Border.all(color: PaynColors.outlineSubtle),
              ),
              child: Text(
                s,
                style: theme.textTheme.labelLarge?.copyWith(
                  color: PaynColors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _InputBar extends StatelessWidget {
  const _InputBar({
    required this.controller,
    required this.loading,
    required this.onSend,
  });

  final TextEditingController controller;
  final bool loading;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: PaynColors.surface,
        border: const Border(
          top: BorderSide(color: PaynColors.outlineSubtle),
        ),
      ),
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 8),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: controller,
                  minLines: 1,
                  maxLines: 4,
                  textInputAction: TextInputAction.send,
                  onSubmitted: (_) => onSend(),
                  decoration: InputDecoration(
                    hintText: 'Ask anything...',
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    border: OutlineInputBorder(
                      borderRadius:
                          BorderRadius.circular(PaynRadius.input),
                      borderSide: const BorderSide(
                        color: PaynColors.outlineSubtle,
                      ),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius:
                          BorderRadius.circular(PaynRadius.input),
                      borderSide: const BorderSide(
                        color: PaynColors.outlineSubtle,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius:
                          BorderRadius.circular(PaynRadius.input),
                      borderSide: const BorderSide(
                        color: PaynColors.accent,
                        width: 1.5,
                      ),
                    ),
                    filled: true,
                    fillColor: PaynColors.surfaceRaised,
                    suffixIcon: loading
                        ? const Padding(
                            padding: EdgeInsets.all(12),
                            child: SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: PaynColors.accent,
                              ),
                            ),
                          )
                        : IconButton(
                            icon: const Icon(
                              Icons.send_rounded,
                              color: PaynColors.accent,
                            ),
                            onPressed: onSend,
                          ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'Powered by Gemini',
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: PaynColors.textTertiary,
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }
}
