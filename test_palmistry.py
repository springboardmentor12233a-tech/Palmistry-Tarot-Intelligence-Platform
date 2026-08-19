import sys
from pathlib import Path

# Get the project root
PROJECT_ROOT = Path(__file__).resolve().parent

# Add palmistry/code to Python's import path
PALMISTRY_CODE = PROJECT_ROOT / "palmistry" / "code"

sys.path.insert(0, str(PALMISTRY_CODE))

print("Testing Palmistry modules...")
print(f"Using code from: {PALMISTRY_CODE}")

from tools import *
from model import *
from rectification import *
from detection import *
from classification import *
from measurement import *

print("All Palmistry modules imported successfully!")