import sys
import os
import threading
import tkinter as tk
from tkinter import ttk, messagebox

# Add current directory to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from dxa import DXA

# =========================================================
# DEEP X AUTH DEFAULT APPLICATION CONFIGURATION
# (You can also edit these live in the app via the ⚙ button!)
# =========================================================
DEFAULT_APP_NAME = "opti"
DEFAULT_SECRET_KEY = "DXA-K6EN1PCEMF"
DEFAULT_APP_VERSION = "1.0"
DEFAULT_API_URL = "https://deepxauth.pages.dev"
# =========================================================

# Color Palette (Ultra-Sleek Dark Theme)
BG_COLOR = "#0F172A"       # Slate 900
CARD_BG = "#1E293B"        # Slate 800
ACCENT_COLOR = "#6366F1"   # Indigo 500
ACCENT_HOVER = "#4F46E5"   # Indigo 600
TEXT_COLOR = "#F8FAFC"     # Slate 50
TEXT_MUTED = "#94A3B8"     # Slate 400
SUCCESS_COLOR = "#10B981"  # Emerald 500
ERROR_COLOR = "#EF4444"    # Red 500
INPUT_BG = "#0F172A"

class KeyAuthLoginApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Deep X Auth - Secure Client")
        self.root.geometry("420x560")
        self.root.resizable(False, False)
        self.root.configure(bg=BG_COLOR)

        # App Credentials (Editable live)
        self.app_name_var = tk.StringVar(value=DEFAULT_APP_NAME)
        self.secret_var = tk.StringVar(value=DEFAULT_SECRET_KEY)
        self.version_var = tk.StringVar(value=DEFAULT_APP_VERSION)
        self.api_url_var = tk.StringVar(value=DEFAULT_API_URL)

        # User Auth Inputs
        self.username_var = tk.StringVar()
        self.password_var = tk.StringVar()
        self.license_var = tk.StringVar()

        self.show_config = False

        self._apply_styles()
        self._build_ui()

    def _apply_styles(self):
        style = ttk.Style()
        style.theme_use('default')
        style.configure("TNotebook", background=BG_COLOR, borderwidth=0)
        style.configure("TNotebook.Tab", background=CARD_BG, foreground=TEXT_MUTED, padding=[20, 10], font=("Segoe UI", 10, "bold"))
        style.map("TNotebook.Tab", background=[("selected", ACCENT_COLOR)], foreground=[("selected", "#FFFFFF")])

    def _build_ui(self):
        # Header Bar with App Name and Settings Button
        header = tk.Frame(self.root, bg=BG_COLOR, pady=15)
        header.pack(fill="x", padx=20)

        # Top Bar containing Title and Settings Toggle Icon
        top_bar = tk.Frame(header, bg=BG_COLOR)
        top_bar.pack(fill="x")

        self.title_label = tk.Label(top_bar, text=self.app_name_var.get().upper(), font=("Segoe UI", 20, "bold"), fg=ACCENT_COLOR, bg=BG_COLOR)
        self.title_label.pack(side="left")

        btn_gear = tk.Button(top_bar, text="⚙ Credentials", font=("Segoe UI", 9, "bold"), bg=CARD_BG, fg=TEXT_MUTED, activebackground=ACCENT_COLOR, activeforeground="#FFFFFF", relief="flat", cursor="hand2", command=self._toggle_config)
        btn_gear.pack(side="right")

        subtitle = tk.Label(header, text="User Login & License Registration", font=("Segoe UI", 9), fg=TEXT_MUTED, bg=BG_COLOR)
        subtitle.pack(anchor="w", pady=(2, 0))

        # Hidden Collapsible App Credentials Drawer
        self.config_drawer = tk.LabelFrame(self.root, text=" Website App Credentials ", bg=CARD_BG, fg=TEXT_MUTED, font=("Segoe UI", 8, "bold"), bd=1, relief="solid", padx=10, pady=8)

        tk.Label(self.config_drawer, text="App Name:", bg=CARD_BG, fg=TEXT_MUTED, font=("Segoe UI", 8)).grid(row=0, column=0, sticky="w")
        e_app = tk.Entry(self.config_drawer, textvariable=self.app_name_var, bg=INPUT_BG, fg=TEXT_COLOR, insertbackground=TEXT_COLOR, relief="flat", font=("Segoe UI", 9), width=12)
        e_app.grid(row=0, column=1, padx=5, pady=2)
        e_app.bind("<KeyRelease>", lambda e: self.title_label.config(text=self.app_name_var.get().upper() or "APP"))

        tk.Label(self.config_drawer, text="Version:", bg=CARD_BG, fg=TEXT_MUTED, font=("Segoe UI", 8)).grid(row=0, column=2, sticky="w")
        tk.Entry(self.config_drawer, textvariable=self.version_var, bg=INPUT_BG, fg=TEXT_COLOR, insertbackground=TEXT_COLOR, relief="flat", font=("Segoe UI", 9), width=6).grid(row=0, column=3, padx=5, pady=2)

        tk.Label(self.config_drawer, text="Secret Key:", bg=CARD_BG, fg=TEXT_MUTED, font=("Segoe UI", 8)).grid(row=1, column=0, sticky="w", pady=(5,0))
        tk.Entry(self.config_drawer, textvariable=self.secret_var, bg=INPUT_BG, fg=TEXT_COLOR, insertbackground=TEXT_COLOR, relief="flat", font=("Segoe UI", 8)).grid(row=1, column=1, columnspan=3, sticky="we", padx=5, pady=(5,0))

        # Main Card Container
        self.card = tk.Frame(self.root, bg=CARD_BG, bd=1, relief="solid")
        self.card.pack(fill="both", expand=True, padx=20, pady=(5, 10))

        # Notebook / Tabs
        self.notebook = ttk.Notebook(self.card)
        self.notebook.pack(fill="both", expand=True, padx=10, pady=10)

        # Login Tab
        self.login_tab = tk.Frame(self.notebook, bg=CARD_BG)
        self.notebook.add(self.login_tab, text="  LOGIN  ")

        # Register Tab
        self.register_tab = tk.Frame(self.notebook, bg=CARD_BG)
        self.notebook.add(self.register_tab, text="  REGISTER  ")

        self._build_login_tab()
        self._build_register_tab()

        # Status Message Footer
        self.status_label = tk.Label(self.root, text="Ready to authenticate", bg=BG_COLOR, fg=TEXT_MUTED, font=("Segoe UI", 9, "italic"), anchor="center")
        self.status_label.pack(fill="x", side="bottom", pady=8)

    def _toggle_config(self):
        if self.show_config:
            self.config_drawer.pack_forget()
            self.show_config = False
        else:
            self.config_drawer.pack(fill="x", padx=20, pady=(0, 5), before=self.card)
            self.show_config = True

    def _build_login_tab(self):
        f = tk.Frame(self.login_tab, bg=CARD_BG, pady=15)
        f.pack(fill="both", expand=True)

        tk.Label(f, text="Username", bg=CARD_BG, fg=TEXT_MUTED, font=("Segoe UI", 9, "bold")).pack(anchor="w", padx=10)
        e_user = tk.Entry(f, textvariable=self.username_var, bg=INPUT_BG, fg=TEXT_COLOR, insertbackground=TEXT_COLOR, relief="flat", font=("Segoe UI", 11))
        e_user.pack(fill="x", padx=10, pady=(2, 15), ipady=6)

        tk.Label(f, text="Password", bg=CARD_BG, fg=TEXT_MUTED, font=("Segoe UI", 9, "bold")).pack(anchor="w", padx=10)
        e_pass = tk.Entry(f, textvariable=self.password_var, bg=INPUT_BG, fg=TEXT_COLOR, insertbackground=TEXT_COLOR, relief="flat", font=("Segoe UI", 11), show="•")
        e_pass.pack(fill="x", padx=10, pady=(2, 25), ipady=6)

        self.btn_login = tk.Button(f, text="LOG IN", bg=ACCENT_COLOR, fg="#FFFFFF", activebackground=ACCENT_HOVER, activeforeground="#FFFFFF", font=("Segoe UI", 11, "bold"), relief="flat", cursor="hand2", command=self._handle_login)
        self.btn_login.pack(fill="x", padx=10, ipady=8)

    def _build_register_tab(self):
        f = tk.Frame(self.register_tab, bg=CARD_BG, pady=10)
        f.pack(fill="both", expand=True)

        tk.Label(f, text="Username", bg=CARD_BG, fg=TEXT_MUTED, font=("Segoe UI", 9, "bold")).pack(anchor="w", padx=10)
        e_user = tk.Entry(f, textvariable=self.username_var, bg=INPUT_BG, fg=TEXT_COLOR, insertbackground=TEXT_COLOR, relief="flat", font=("Segoe UI", 10))
        e_user.pack(fill="x", padx=10, pady=(2, 8), ipady=4)

        tk.Label(f, text="Password", bg=CARD_BG, fg=TEXT_MUTED, font=("Segoe UI", 9, "bold")).pack(anchor="w", padx=10)
        e_pass = tk.Entry(f, textvariable=self.password_var, bg=INPUT_BG, fg=TEXT_COLOR, insertbackground=TEXT_COLOR, relief="flat", font=("Segoe UI", 10), show="•")
        e_pass.pack(fill="x", padx=10, pady=(2, 8), ipady=4)

        tk.Label(f, text="License Key", bg=CARD_BG, fg=TEXT_MUTED, font=("Segoe UI", 9, "bold")).pack(anchor="w", padx=10)
        e_key = tk.Entry(f, textvariable=self.license_var, bg=INPUT_BG, fg=TEXT_COLOR, insertbackground=TEXT_COLOR, relief="flat", font=("Segoe UI", 10))
        e_key.pack(fill="x", padx=10, pady=(2, 18), ipady=4)

        self.btn_register = tk.Button(f, text="REGISTER ACCOUNT", bg=ACCENT_COLOR, fg="#FFFFFF", activebackground=ACCENT_HOVER, activeforeground="#FFFFFF", font=("Segoe UI", 10, "bold"), relief="flat", cursor="hand2", command=self._handle_register)
        self.btn_register.pack(fill="x", padx=10, ipady=6)

    def _update_status(self, text, is_error=False, is_success=False):
        color = TEXT_MUTED
        if is_error:
            color = ERROR_COLOR
        elif is_success:
            color = SUCCESS_COLOR
        self.status_label.config(text=text, fg=color)

    def _get_dxa_client(self):
        app_name = self.app_name_var.get().strip()
        secret = self.secret_var.get().strip()
        version = self.version_var.get().strip()
        api_url = self.api_url_var.get().strip()
        print(f"[DXA SDK] Connecting to App: '{app_name}' | Secret: '{secret}' | Version: '{version}'")
        return DXA(name=app_name, secret=secret, version=version, api_url=api_url)

    def _handle_login(self):
        username = self.username_var.get().strip()
        password = self.password_var.get().strip()

        if not username or not password:
            self._update_status("Please enter username and password.", is_error=True)
            return

        self.btn_login.config(state="disabled", text="AUTHENTICATING...")
        self._update_status("Connecting to DXA authentication server...")

        def thread_target():
            dxa = self._get_dxa_client()
            success, message, user = dxa.login(username, password)

            def callback():
                self.btn_login.config(state="normal", text="LOG IN")
                if success and user:
                    self._update_status(message, is_success=True)
                    self._show_dashboard(user)
                else:
                    self._update_status(message, is_error=True)

            self.root.after(0, callback)

        threading.Thread(target=thread_target, daemon=True).start()

    def _handle_register(self):
        username = self.username_var.get().strip()
        password = self.password_var.get().strip()
        license_key = self.license_var.get().strip()

        if not username or not password or not license_key:
            self._update_status("Please enter username, password & license key.", is_error=True)
            return

        self.btn_register.config(state="disabled", text="REGISTERING...")
        self._update_status("Validating license key...")

        def thread_target():
            dxa = self._get_dxa_client()
            success, message = dxa.register(username, password, license_key)

            def callback():
                self.btn_register.config(state="normal", text="REGISTER ACCOUNT")
                if success:
                    self._update_status(message, is_success=True)
                    messagebox.showinfo("Registration Successful", f"Account '{username}' created successfully for App '{self.app_name_var.get()}'!\n\nYou can now log in.")
                    self.notebook.select(self.login_tab)
                else:
                    self._update_status(message, is_error=True)

            self.root.after(0, callback)

        threading.Thread(target=thread_target, daemon=True).start()

    def _show_dashboard(self, user):
        for child in self.card.winfo_children():
            child.destroy()

        dash = tk.Frame(self.card, bg=CARD_BG, pady=20, padx=15)
        dash.pack(fill="both", expand=True)

        tk.Label(dash, text="WELCOME BACK", font=("Segoe UI", 16, "bold"), fg=SUCCESS_COLOR, bg=CARD_BG).pack()
        tk.Label(dash, text=user.username.upper(), font=("Segoe UI", 14, "bold"), fg=TEXT_COLOR, bg=CARD_BG).pack(pady=(0, 15))

        grid_frame = tk.Frame(dash, bg=INPUT_BG, bd=1, relief="solid", padx=15, pady=15)
        grid_frame.pack(fill="x", pady=10)

        hwid = DXA.get_hwid()
        details = [
            ("Subscription:", user.subscription),
            ("Expiry Date:", user.expiry),
            ("Hardware ID:", hwid[:18] + "..."),
            ("Status:", "AUTHENTICATED ✅")
        ]

        for idx, (lbl, val) in enumerate(details):
            tk.Label(grid_frame, text=lbl, bg=INPUT_BG, fg=TEXT_MUTED, font=("Segoe UI", 9, "bold")).grid(row=idx, column=0, sticky="w", pady=4)
            tk.Label(grid_frame, text=val, bg=INPUT_BG, fg=TEXT_COLOR, font=("Segoe UI", 9)).grid(row=idx, column=1, sticky="e", padx=(10, 0), pady=4)

        grid_frame.columnconfigure(0, weight=1)
        grid_frame.columnconfigure(1, weight=1)

        logout_btn = tk.Button(dash, text="LOG OUT", bg=ERROR_COLOR, fg="#FFFFFF", activebackground="#DC2626", font=("Segoe UI", 10, "bold"), relief="flat", cursor="hand2", command=self._restart_app)
        logout_btn.pack(fill="x", side="bottom", ipady=6)

    def _restart_app(self):
        self.root.destroy()
        python = sys.executable
        os.execl(python, python, *sys.argv)

if __name__ == "__main__":
    root = tk.Tk()
    app = KeyAuthLoginApp(root)
    root.mainloop()
