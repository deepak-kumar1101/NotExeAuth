# Deep X Auth - Python Login UI & SDK Client

A modern, dark-themed Python Desktop Login UI built with `tkinter` and a zero-dependency native Python SDK (`dxa.py`) for Deep X Auth.

## 📁 Directory Structure
```
LOGIN UI/
├── dxa.py           # Native Python SDK for Deep X Auth (Login, Register, HWID, Variables)
├── main.py          # Modern Dark-Themed GUI Application (Tkinter)
├── requirements.txt # Dependency guide (0 external pip libraries required!)
└── README.md        # Documentation
```

## 🚀 Quick Start

Run the Python application using standard Python 3:
```bash
python main.py
```

## 🔧 Features Included
- **Zero External Dependencies**: Works out-of-the-box with standard Python 3 `tkinter` & `urllib`.
- **Automatic Hardware ID (HWID) Detection**: Extracts Windows SID or MachineGUID to lock accounts to a single PC.
- **Login & Registration**: Full support for license registration and user login against your Deep X Auth backend (`https://deepxauth.pages.dev`).
- **Interactive Dashboard**: Displays authenticated user details (Subscription Rank, Expiry, HWID, App Variables) upon login.
