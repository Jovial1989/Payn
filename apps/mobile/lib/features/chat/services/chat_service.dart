import 'package:dio/dio.dart';

class ChatMessage {
  const ChatMessage({required this.role, required this.content});
  final String role; // 'user' or 'assistant'
  final String content;
  Map<String, dynamic> toJson() => {'role': role, 'content': content};
}

class ChatService {
  ChatService(this._dio);
  final Dio _dio;

  Future<({String reply, List<String> suggestions})> send({
    required List<ChatMessage> messages,
    String? country,
    List<String>? goals,
  }) async {
    final response = await _dio.post(
      'https://payn.online/api/v1/chat',
      data: {
        'messages': messages.map((m) => m.toJson()).toList(),
        'context': {
          if (country != null) 'country': country,
          if (goals != null && goals.isNotEmpty) 'goals': goals,
        },
      },
    );
    final data = response.data as Map<String, dynamic>;
    final reply = data['reply'] as String? ?? 'Something went wrong.';
    final rawSuggestions = data['suggestions'] as List<dynamic>? ?? [];
    final suggestions = rawSuggestions.map((s) => s.toString()).toList();
    return (reply: reply, suggestions: suggestions);
  }
}
