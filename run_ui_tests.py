import os
import sys
import time
import subprocess
import urllib.request
import signal

def wait_for_service(url, timeout=30):
    start = time.time()
    while time.time() - start < timeout:
        try:
            with urllib.request.urlopen(url, timeout=2) as resp:
                if resp.status in (200, 304, 404):
                    return True
        except Exception:
            time.sleep(0.5)
    return False

def main():
    root_dir = os.path.abspath(os.path.dirname(__file__))
    frontend_dir = os.path.join(root_dir, "frontend")

    print("[1/4] Starting backend FastAPI service on port 8000...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=root_dir,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    print("[2/4] Starting frontend Vite preview server on port 3000...")
    # Use npm run preview or npx vite preview
    frontend_cmd = "npm run preview" if os.name != "nt" else "cmd.exe /c npm run preview"
    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=frontend_dir,
        shell=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    ret_code = 1
    try:
        print("[3/4] Waiting for services to become available...")
        frontend_ready = wait_for_service("http://127.0.0.1:3000", timeout=30)
        if not frontend_ready:
            print("ERROR: Frontend service did not respond on port 3000 within 30 seconds.")
            return 1
        print("✓ Frontend service is LIVE on http://localhost:3000")

        backend_ready = wait_for_service("http://127.0.0.1:8000/docs", timeout=10)
        if backend_ready:
            print("✓ Backend API is LIVE on http://localhost:8000")
        else:
            print("ℹ Backend API did not respond on /docs; frontend fallback mode will serve mock data.")

        print("[4/4] Executing Selenium UI automated test suite with pytest...")
        ret_code = subprocess.call([sys.executable, "-m", "pytest", "tests_ui/", "-v", "-s", "--color=yes"], cwd=root_dir)

    finally:
        print("\nStopping background test services...")
        try:
            if os.name == "nt":
                subprocess.call(["taskkill", "/F", "/T", "/PID", str(backend_proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                subprocess.call(["taskkill", "/F", "/T", "/PID", str(frontend_proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                backend_proc.terminate()
                frontend_proc.terminate()
        except Exception as e:
            print(f"Error terminating services: {e}")

    return ret_code

if __name__ == "__main__":
    sys.exit(main())
