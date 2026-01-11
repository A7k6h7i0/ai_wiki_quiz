"""
Entity extraction service.
Extracts people, organizations, and locations from text.
Uses simple heuristics (can be enhanced with NER models).
"""
from typing import Dict, List
import re


class EntityExtractor:
    """
    Simple entity extractor using pattern matching.
    For production, consider using spaCy or other NER libraries.
    """
    
    @staticmethod
    def extract_entities(text: str, sections: List[str]) -> Dict[str, List[str]]:
        """
        Extract named entities from text.
        Returns dictionary with people, organizations, and locations.
        """
        entities = {
            'people': [],
            'organizations': [],
            'locations': []
        }
        
        # Extract capitalized phrases (potential entities)
        # This is a simple approach; production systems should use NER models
        capitalized_phrases = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text)
        
        # Common organization keywords
        org_keywords = ['University', 'Institute', 'Company', 'Corporation', 'Laboratory', 
                       'Organization', 'Association', 'Department', 'College', 'Agency']
        
        # Common location keywords
        location_keywords = ['United States', 'United Kingdom', 'Kingdom', 'Republic', 
                           'State', 'City', 'Country', 'London', 'Paris', 'Berlin']
        
        # Simple categorization based on keywords
        for phrase in set(capitalized_phrases[:50]):  # Limit to 50 unique phrases
            phrase_lower = phrase.lower()
            
            # Skip common words
            if phrase_lower in ['the', 'a', 'an', 'in', 'on', 'at', 'to', 'for']:
                continue
            
            # Categorize based on context
            if any(keyword in phrase for keyword in org_keywords):
                entities['organizations'].append(phrase)
            elif any(keyword in phrase for keyword in location_keywords):
                entities['locations'].append(phrase)
            elif len(phrase.split()) <= 3:  # Likely a person's name
                entities['people'].append(phrase)
        
        # Remove duplicates and limit results
        entities['people'] = list(set(entities['people']))[:10]
        entities['organizations'] = list(set(entities['organizations']))[:10]
        entities['locations'] = list(set(entities['locations']))[:10]
        
        return entities
