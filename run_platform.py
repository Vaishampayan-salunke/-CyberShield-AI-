"""
CyberShield AI V2 — Quick Launch Server
=======================================
Run:
    python run_platform.py
"""
import os
import sys
import uvicorn

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

if __name__ == "__main__":
    print("=" * 60)
    print("Starting CyberShield AI V2 Platform")
    print("AI-Powered Cybersecurity & Digital Safety SOC Platform")
    print("=" * 60)
    print("• Unified Web UI & Backend: http://localhost:8000")
    print("• Swagger API Documentation: http://localhost:8000/docs")
    print("=" * 60)

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=False)
