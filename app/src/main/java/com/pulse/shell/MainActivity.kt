package com.pulse.shell

import android.os.Bundle
import android.util.Log
import android.webkit.ConsoleMessage
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceResponse
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.activity.compose.LocalOnBackPressedDispatcherOwner
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.pulse.shell.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                TelegramWebShell(
                    startUrl = BuildConfig.PULSE_WEB_URL,
                )
            }
        }
    }
}

@Composable
private fun TelegramWebShell(startUrl: String) {
    var progress by remember { mutableIntStateOf(0) }
    var webViewRef by remember { mutableStateOf<WebView?>(null) }
    val dispatcherOwner = LocalOnBackPressedDispatcherOwner.current

    DisposableEffect(Unit) {
        val cb = object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                val wv = webViewRef
                if (wv != null && wv.canGoBack()) {
                    wv.goBack()
                } else {
                    isEnabled = false
                }
            }
        }
        dispatcherOwner?.onBackPressedDispatcher?.addCallback(cb)
        onDispose { cb.remove() }
    }

    AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { ctx ->
            // Enables chrome://inspect/#devices debugging from desktop Chrome.
            WebView.setWebContentsDebuggingEnabled(true)
            WebView(ctx).apply {
                webViewRef = this

                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.databaseEnabled = true
                settings.mediaPlaybackRequiresUserGesture = false
                settings.useWideViewPort = true
                settings.loadWithOverviewMode = true

                // Keep navigation inside the app for same-origin.
                webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(
                        view: WebView,
                        request: WebResourceRequest,
                    ): Boolean {
                        val u = request.url ?: return false
                        val scheme = (u.scheme ?: "").lowercase()
                        // Let WebView handle internal pages & assets.
                        if (scheme == "http" || scheme == "https") {
                            val start = kotlin.runCatching { android.net.Uri.parse(startUrl) }.getOrNull()
                            val sameHost = start?.host != null && start.host == u.host
                            return if (sameHost) false else {
                                kotlin.runCatching {
                                    ctx.startActivity(
                                        android.content.Intent(android.content.Intent.ACTION_VIEW, u)
                                    )
                                }
                                true
                            }
                        }

                        // Handle app-intents/external schemes.
                        return kotlin.runCatching {
                            ctx.startActivity(
                                android.content.Intent(android.content.Intent.ACTION_VIEW, u)
                            )
                            true
                        }.getOrDefault(false)
                    }

                    override fun onPageFinished(view: WebView, url: String) {
                        super.onPageFinished(view, url)
                    }

                    override fun onReceivedError(
                        view: WebView,
                        request: WebResourceRequest,
                        error: WebResourceError,
                    ) {
                        Log.e(
                            "PulseWebView",
                            "onReceivedError: url=${request.url} main=${request.isForMainFrame} code=${error.errorCode} desc=${error.description}"
                        )
                        super.onReceivedError(view, request, error)
                    }

                    override fun onReceivedHttpError(
                        view: WebView,
                        request: WebResourceRequest,
                        errorResponse: WebResourceResponse,
                    ) {
                        Log.e(
                            "PulseWebView",
                            "onReceivedHttpError: url=${request.url} main=${request.isForMainFrame} status=${errorResponse.statusCode}"
                        )
                        super.onReceivedHttpError(view, request, errorResponse)
                    }

                    override fun onRenderProcessGone(
                        view: WebView,
                        detail: RenderProcessGoneDetail,
                    ): Boolean {
                        Log.e(
                            "PulseWebView",
                            "onRenderProcessGone: didCrash=${detail.didCrash()} priorityAtExit=${detail.rendererPriorityAtExit()}"
                        )
                        // Let the system kill and recreate; app will relaunch cleanly.
                        return false
                    }
                }

                webChromeClient = object : WebChromeClient() {
                    override fun onProgressChanged(view: WebView, newProgress: Int) {
                        progress = newProgress
                        super.onProgressChanged(view, newProgress)
                    }

                    override fun onConsoleMessage(consoleMessage: ConsoleMessage): Boolean {
                        Log.e(
                            "PulseWebView",
                            "${consoleMessage.message()} (${consoleMessage.sourceId()}:${consoleMessage.lineNumber()})"
                        )
                        return super.onConsoleMessage(consoleMessage)
                    }
                }

                loadUrl(startUrl)
            }
        },
        update = { wv ->
            webViewRef = wv
        },
        onRelease = { wv ->
            if (webViewRef === wv) webViewRef = null
            wv.stopLoading()
            wv.destroy()
        },
    )

    if (progress in 1..99) {
        LinearProgressIndicator(
            progress = { progress / 100f },
        )
    }
}

