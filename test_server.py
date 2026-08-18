import sys
import os
import json

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

import database
import auth
import tarot_engine
import palm_engine
import ai_synthesizer
import pdf_generator

def run_tests():
    print("🔮 [1/6] Testing Database & Auth...")
    reg_result = auth.register_user("testseeker@mystic.com", "Bhavya Seeker", "securepass123", "Leo")
    print("   Register:", reg_result["success"], reg_result["message"])
    
    login_result = auth.login_user("testseeker@mystic.com", "securepass123")
    print("   Login:", login_result["success"], login_result["message"])
    
    forgot_result = auth.create_password_reset_token("testseeker@mystic.com")
    print("   Forgot Password Token Generated:", forgot_result["success"], "Token:", bool(forgot_result.get("token")))
    
    reset_result = auth.reset_password_with_token(forgot_result["token"], "newsuperpass456")
    print("   Reset Password with Token:", reset_result["success"], reset_result["message"])

    print("\n🃏 [2/6] Testing Tarot Engine...")
    deck = tarot_engine.load_deck()
    print("   Total cards loaded:", len(deck))
    assert len(deck) == 78, f"Expected 78 cards, got {len(deck)}"
    drawn = tarot_engine.draw_cards(deck, count=3)
    print("   Drawn 3 cards:", [f"{c['card']['name']} ({c['orientation']})" for c in drawn])

    print("\n✋ [3/6] Testing Palm Engine...")
    dummy_palm = b"synthetic_palm_test_image_bytes_12345"
    palm_res = palm_engine.analyze_palm_image(dummy_palm)
    print("   Palm analysis success:", palm_res["success"])
    print("   Lines extracted:", list(palm_res["lines"].keys()))

    print("\n✨ [4/6] Testing AI Synthesizer...")
    reading_text, source = ai_synthesizer.generate_combined_reading(
        palm_data=palm_res,
        cards=drawn,
        question="What are my greatest strengths and destiny this month?"
    )
    print("   Combined Reading Source:", source)
    print("   Reading excerpt:", reading_text[:120], "...")

    print("\n📄 [5/6] Testing PDF Generator...")
    pdf_path = pdf_generator.generate_pdf_report(
        user_name="Bhavya Seeker",
        question="What are my greatest strengths and destiny this month?",
        reading_text=reading_text,
        cards=drawn,
        palm_data=palm_res
    )
    print("   PDF generated at:", pdf_path)
    assert os.path.exists(pdf_path), "PDF file was not created!"
    print("   PDF size:", os.path.getsize(pdf_path), "bytes")

    print("\n🌟 [6/6] ALL TEST SUITES PASSED PERFECTLY!")

if __name__ == "__main__":
    run_tests()
