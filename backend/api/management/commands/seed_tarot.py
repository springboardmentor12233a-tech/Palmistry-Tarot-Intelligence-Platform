import urllib.request
import json
from django.core.management.base import BaseCommand
from api.models import TarotCard

class Command(BaseCommand):
    help = 'Seeds the database with 78 Tarot cards including image URLs from Github'

    def handle(self, *args, **kwargs):
        self.stdout.write('Fetching tarot data (meanings) from tarotapi.dev...')
        try:
            req1 = urllib.request.urlopen("https://tarotapi.dev/api/v1/cards")
            meanings_data = json.loads(req1.read())['cards']
            
            self.stdout.write('Fetching tarot images from Github (metabismuth)...')
            req2 = urllib.request.urlopen("https://raw.githubusercontent.com/metabismuth/tarot-json/master/tarot-images.json")
            images_data = json.loads(req2.read())['cards']
            
            # Create a lookup map for images by card name
            image_map = {card['name'].lower(): card['img'] for card in images_data}
            
            TarotCard.objects.all().delete()
            
            count = 0
            for card_data in meanings_data:
                name = card_data.get('name')
                card_type = card_data.get('type')
                suit = card_data.get('suit')
                
                arcana = "Major Arcana" if card_type == "major" else "Minor Arcana"
                
                meaning_up = card_data.get('meaning_up', '')
                meaning_rev = card_data.get('meaning_rev', '')
                desc = card_data.get('desc', '')
                
                keywords = [k.strip(' ,;') for k in meaning_up.split()[:5] if len(k) > 2]
                
                # Match image by name, fallback to a placeholder if not found (though all 78 should match)
                img_filename = image_map.get(name.lower())
                if img_filename:
                    image_url = f"https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/{img_filename}"
                else:
                    image_url = f"/assets/tarot/{card_data.get('name_short')}.jpg"

                TarotCard.objects.create(
                    id=card_data.get('name_short'),
                    name=name,
                    arcana=arcana,
                    suit=suit,
                    number=card_data.get('value_int', 0),
                    image_url=image_url,
                    keywords=keywords,
                    upright_meaning=meaning_up,
                    reversed_meaning=meaning_rev,
                    general_meaning=desc,
                    relationship_meaning="Reflects the general meaning in relationship contexts.",
                    career_meaning="Reflects the general meaning in career contexts.",
                    personal_growth_meaning="Reflects the general meaning in personal growth contexts."
                )
                count += 1
                
            self.stdout.write(self.style.SUCCESS(f'Successfully seeded {count} tarot cards with images!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to seed: {e}'))
