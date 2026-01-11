"""
Wikipedia scraping service using BeautifulSoup.
Extracts article content, summary, sections, and text.
"""
import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
import re


class WikipediaScraper:
    """
    Scraper for Wikipedia articles.
    Extracts structured information from HTML.
    """
    
    def __init__(self, url: str):
        self.url = url
        self.soup = None
        self.raw_html = None
    
    def validate_url(self) -> bool:
        """
        Validate if URL is a Wikipedia article.
        Returns True if valid, raises ValueError otherwise.
        """
        if not self.url.startswith("https://en.wikipedia.org/wiki/"):
            raise ValueError("URL must be a Wikipedia article (https://en.wikipedia.org/wiki/...)")
        return True
    
    def fetch_page(self) -> BeautifulSoup:
        """
        Fetch and parse Wikipedia page HTML.
        """
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(self.url, headers=headers, timeout=10)
            response.raise_for_status()
            
            self.raw_html = response.text
            self.soup = BeautifulSoup(self.raw_html, 'html.parser')
            return self.soup
        
        except requests.RequestException as e:
            raise Exception(f"Failed to fetch Wikipedia page: {str(e)}")
    
    def extract_title(self) -> str:
        """
        Extract article title.
        """
        title_tag = self.soup.find('h1', {'id': 'firstHeading'})
        if title_tag:
            return title_tag.get_text().strip()
        return "Unknown Title"
    
    def extract_summary(self) -> str:
        """
        Extract article summary (first few paragraphs before table of contents).
        """
        content_div = self.soup.find('div', {'id': 'mw-content-text'})
        if not content_div:
            return ""
        
        paragraphs = []
        for element in content_div.find_all(['p'], limit=5):
            text = element.get_text().strip()
            # Skip empty paragraphs and coordinate references
            if text and len(text) > 50 and not text.startswith('Coordinates:'):
                paragraphs.append(text)
                if len(paragraphs) >= 3:  # Get first 3 meaningful paragraphs
                    break
        
        return ' '.join(paragraphs)
    
    def extract_sections(self) -> List[str]:
        """
        Extract section headings (h2, h3).
        """
        sections = []
        for heading in self.soup.find_all(['h2', 'h3']):
            section_text = heading.get_text().strip()
            # Clean up section text (remove [edit] links)
            section_text = re.sub(r'\[edit\]', '', section_text).strip()
            # Skip common non-content sections
            if section_text and section_text not in ['Contents', 'See also', 'References', 'External links', 'Notes']:
                sections.append(section_text)
        
        return sections[:15]  # Limit to 15 sections
    
    def extract_full_text(self) -> str:
        """
        Extract all paragraph text from the article.
        This is sent to the LLM for quiz generation.
        """
        content_div = self.soup.find('div', {'id': 'mw-content-text'})
        if not content_div:
            return ""
        
        paragraphs = []
        for p in content_div.find_all('p'):
            text = p.get_text().strip()
            if text and len(text) > 30:
                # Clean up Wikipedia artifacts
                text = re.sub(r'\[\d+\]', '', text)  # Remove citation numbers
                text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
                paragraphs.append(text)
        
        return '\n\n'.join(paragraphs)
    
    def scrape(self) -> Dict:
        """
        Main scraping method.
        Returns structured data from Wikipedia article.
        """
        self.validate_url()
        self.fetch_page()
        
        return {
            'title': self.extract_title(),
            'summary': self.extract_summary(),
            'sections': self.extract_sections(),
            'full_text': self.extract_full_text(),
            'raw_html': self.raw_html
        }
