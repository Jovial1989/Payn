package online.payn.payn_mobile

import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.android.RenderMode

class MainActivity : FlutterActivity() {
    // Force TextureView rendering instead of the default SurfaceView.
    // On the Android emulator (notably Apple Silicon hosts), Flutter's
    // FlutterSurfaceView frequently fails to composite over the
    // emulator GL pipeline and presents a pure-black frame even though
    // the Dart side is running. TextureView renders into the normal
    // view hierarchy and presents reliably. Negligible perf cost on
    // modern devices; only matters for the emulator black-screen bug.
    override fun getRenderMode(): RenderMode = RenderMode.texture
}
