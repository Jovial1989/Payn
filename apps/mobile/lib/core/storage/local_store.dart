import 'package:shared_preferences/shared_preferences.dart';

class LocalStore {
  Future<void> saveString(String key, String value) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(key, value);
  }
}

