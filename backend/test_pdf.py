import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Reading
from api.services.pdf_service import pdf_service

print("Testing PDF Generation...")
reading = Reading.objects.last()
print(f"Reading ID: {reading.id}")
try:
    path = pdf_service.generate_report(reading)
    print(f"Success! Path: {path}")
except Exception as e:
    import traceback
    traceback.print_exc()
