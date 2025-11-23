from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch
from ..config import settings

class ClipService:
    def __init__(self):
        print("Loading CLIP model...")
        self.model = CLIPModel.from_pretrained(settings.CLIP_MODEL_ID)
        self.processor = CLIPProcessor.from_pretrained(settings.CLIP_MODEL_ID)
        print("CLIP model loaded.")

    def get_image_embedding(self, image_file):
        try:
            image = Image.open(image_file)
            inputs = self.processor(images=image, return_tensors="pt")
            with torch.no_grad():
                image_features = self.model.get_image_features(**inputs)
            # Normalize the features
            image_features = image_features / image_features.norm(p=2, dim=-1, keepdim=True)
            return image_features[0].tolist()
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return None

    def get_text_embedding(self, text):
        try:
            inputs = self.processor(text=[text], return_tensors="pt", padding=True)
            with torch.no_grad():
                text_features = self.model.get_text_features(**inputs)
            # Normalize
            text_features = text_features / text_features.norm(p=2, dim=-1, keepdim=True)
            return text_features[0].tolist()
        except Exception as e:
            print(f"Error generating text embedding: {e}")
            return None

clip_service = ClipService()
