package com.ecoone.companion;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.ViewGroup;
import android.view.inputmethod.EditorInfo;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {
  private static final String PREFS = "ecoone";
  private static final String KEY = "server_url";
  private WebView webView;
  private String serverHost;

  private int dp(float v) { return (int)(v * getResources().getDisplayMetrics().density + 0.5f); }
  private GradientDrawable rounded(int color, int radius) {
    GradientDrawable d = new GradientDrawable(); d.setColor(color); d.setCornerRadius(dp(radius)); return d;
  }
  private TextView label(String text, int size, int color) {
    TextView t = new TextView(this); t.setText(text); t.setTextSize(size); t.setTextColor(color); return t;
  }

  @Override public void onCreate(Bundle state) {
    super.onCreate(state);
    getWindow().setStatusBarColor(Color.rgb(8,11,18));
    getWindow().setNavigationBarColor(Color.rgb(8,11,18));
    String saved = getSharedPreferences(PREFS, MODE_PRIVATE).getString(KEY, "");
    if (saved.isEmpty()) showConnectScreen(""); else openServer(saved);
  }

  private void showConnectScreen(String initial) {
    LinearLayout root = new LinearLayout(this);
    root.setOrientation(LinearLayout.VERTICAL); root.setGravity(Gravity.CENTER);
    root.setPadding(dp(28),dp(30),dp(28),dp(30)); root.setBackgroundColor(Color.rgb(8,11,18));
    LinearLayout card = new LinearLayout(this);
    card.setOrientation(LinearLayout.VERTICAL); card.setPadding(dp(28),dp(28),dp(28),dp(28));
    card.setBackground(rounded(Color.rgb(20,28,43),22)); card.setFocusableInTouchMode(true);
    TextView brand = label("ecoone",25,Color.WHITE); brand.setTypeface(Typeface.DEFAULT_BOLD);
    TextView title = label("Connect your screen",28,Color.WHITE); title.setTypeface(Typeface.DEFAULT_BOLD); title.setPadding(0,dp(22),0,dp(10));
    TextView info = label("Enter the local EcoOne server address shown in the terminal on your host computer. Your phone, TV and host must use the same home network.",15,Color.rgb(169,183,204));
    info.setLineSpacing(dp(4),1.0f); info.setPadding(0,0,0,dp(22));
    EditText address = new EditText(this); address.setSingleLine(true); address.setText(initial);
    address.setHint("http://192.168.1.20:43821"); address.setTextColor(Color.WHITE);
    address.setHintTextColor(Color.rgb(125,139,160)); address.setTextSize(16);
    address.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_URI);
    address.setImeOptions(EditorInfo.IME_ACTION_GO); address.setPadding(dp(14),dp(12),dp(14),dp(12));
    address.setBackground(rounded(Color.rgb(8,15,26),12));
    Button connect = new Button(this); connect.setText("Connect to EcoOne"); connect.setTextColor(Color.rgb(13,22,36));
    connect.setTextSize(15); connect.setAllCaps(false); connect.setTypeface(Typeface.DEFAULT_BOLD);
    connect.setBackground(rounded(Color.rgb(157,194,255),12));
    connect.setOnClickListener(v -> {
      String value=address.getText().toString().trim(); Uri uri=Uri.parse(value);
      if ((! "http".equals(uri.getScheme()) && !"https".equals(uri.getScheme())) || uri.getHost()==null || uri.getPort()==-1) {
        Toast.makeText(this,"Enter the full address, including :43821",Toast.LENGTH_LONG).show(); return;
      }
      value=value.replaceAll("/+$","");
      getSharedPreferences(PREFS,MODE_PRIVATE).edit().putString(KEY,value).apply();
      openServer(value);
    });
    Button change = new Button(this); change.setText("Use another server"); change.setAllCaps(false);
    change.setTextColor(Color.rgb(190,205,225)); change.setBackgroundColor(Color.TRANSPARENT);
    change.setOnClickListener(v -> address.setText(""));
    card.addView(brand); card.addView(title); card.addView(info);
    card.addView(address,new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,dp(54)));
    LinearLayout.LayoutParams bp=new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,dp(54)); bp.topMargin=dp(15);
    card.addView(connect,bp); card.addView(change);
    root.addView(card,new LinearLayout.LayoutParams(Math.min(getResources().getDisplayMetrics().widthPixels-dp(36),dp(720)),ViewGroup.LayoutParams.WRAP_CONTENT));
    setContentView(root); address.requestFocus();
  }

  private void openServer(String address) {
    Uri uri=Uri.parse(address); if(uri.getHost()==null){showConnectScreen(address);return;}
    serverHost=uri.getHost(); webView=new WebView(this); webView.setBackgroundColor(Color.rgb(8,11,18));
    webView.setFocusable(true); webView.setFocusableInTouchMode(true);
    webView.getSettings().setJavaScriptEnabled(true); webView.getSettings().setDomStorageEnabled(true);
    webView.getSettings().setAllowFileAccess(false); webView.getSettings().setAllowContentAccess(false);
    webView.setWebChromeClient(new WebChromeClient());
    webView.setWebViewClient(new WebViewClient(){
      @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        Uri target=request.getUrl(); return target.getHost()!=null && !target.getHost().equals(serverHost);
      }
    });
    setContentView(webView); webView.loadUrl(address);
  }

  @Override public void onBackPressed() {
    if(webView!=null && webView.canGoBack()) webView.goBack();
    else showConnectScreen(getSharedPreferences(PREFS,MODE_PRIVATE).getString(KEY,""));
  }
}
