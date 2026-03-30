import 'package:shared_preferences/shared_preferences.dart';

class LocalStore {
  Future<void> saveString(String key, String value) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(key, value);
  }

  Future<String?> readString(String key) async {
    final preferences = await SharedPreferences.getInstance();
    return preferences.getString(key);
  }

  Future<void> saveStringList(String key, List<String> values) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setStringList(key, values);
  }

  Future<List<String>> readStringList(String key) async {
    final preferences = await SharedPreferences.getInstance();
    return preferences.getStringList(key) ?? <String>[];
  }

  Future<void> remove(String key) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.remove(key);
  }
}

class MemoryLocalStore extends LocalStore {
  final Map<String, Object> _values = <String, Object>{};

  @override
  Future<void> saveString(String key, String value) async {
    _values[key] = value;
  }

  @override
  Future<String?> readString(String key) async {
    final value = _values[key];
    return value is String ? value : null;
  }

  @override
  Future<void> saveStringList(String key, List<String> values) async {
    _values[key] = List<String>.from(values);
  }

  @override
  Future<List<String>> readStringList(String key) async {
    final value = _values[key];
    if (value is List<String>) {
      return List<String>.from(value);
    }

    return <String>[];
  }

  @override
  Future<void> remove(String key) async {
    _values.remove(key);
  }
}
