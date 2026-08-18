import os
import sys
import uvicorn

if __name__ == "__main__":
    # Add backend directory to path
    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
    sys.path.insert(0, backend_dir)
    
    print("✨ Starting Mystic Palm & Tarot Full-Stack Application...")
    print("🔮 Server running at: http://127.0.0.1:8000")
    
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True, app_dir=backend_dir)
