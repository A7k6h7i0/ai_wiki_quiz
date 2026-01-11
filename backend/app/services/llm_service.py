"""
LLM service using LangChain + Gemini API.
Generates quiz questions and related topics from Wikipedia content.
"""

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from app.config import settings
from typing import Dict, List, Any
import json
import re


class QuizGenerator:
    """
    Quiz generation service using Google Gemini via LangChain.
    """

    def __init__(self):
        """
        Initialize Gemini model.
        """
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash-lite",  # ✅ correct model for langchain-google-genai==0.0.9
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.7,
            max_output_tokens=2048,
        )

    # ================= PROMPTS ================= #

    def create_quiz_prompt(self) -> PromptTemplate:
        template = """
You are an expert educator creating a quiz based on a Wikipedia article.

ARTICLE TITLE:
{title}

ARTICLE CONTENT:
{content}

INSTRUCTIONS:
1. Generate EXACTLY {num_questions} multiple-choice questions.
2. Each question must include:
   - question
   - 4 options
   - correct answer
   - difficulty (easy / medium / hard)
   - explanation

RULES:
- Use ONLY the given article content
- Do NOT invent facts
- Mix difficulty levels
- Return VALID JSON ONLY

OUTPUT FORMAT:
[
  {{
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "answer": "B",
    "difficulty": "medium",
    "explanation": "..."
  }}
]
"""
        return PromptTemplate(
            input_variables=["title", "content", "num_questions"],
            template=template.strip(),
        )

    def create_topics_prompt(self) -> PromptTemplate:
        template = """
Based on the Wikipedia article below, suggest 5 related topics.

ARTICLE TITLE:
{title}

ARTICLE SUMMARY:
{summary}

Return ONLY a valid JSON array:
["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"]
"""
        return PromptTemplate(
            input_variables=["title", "summary"],
            template=template.strip(),
        )

    # ================= HELPERS ================= #

    def parse_json_response(self, response: str) -> Any:
        """
        Safely parse JSON returned by the LLM.
        """
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            match = re.search(r"\[.*\]", response, re.DOTALL)
            if match:
                return json.loads(match.group())
            raise ValueError("Invalid JSON returned by LLM")

    # ================= MAIN METHODS ================= #

    def generate_quiz(
        self, title: str, content: str, num_questions: int = 7
    ) -> List[Dict]:

        # Prevent token overflow
        if len(content) > 15000:
            content = content[:15000]

        prompt = self.create_quiz_prompt()
        chain = prompt | self.llm  # ✅ modern LangChain style

        response = chain.invoke(
            {
                "title": title,
                "content": content,
                "num_questions": num_questions,
            }
        )

        if not response.content:
            raise Exception("LLM returned empty response")

        questions = self.parse_json_response(response.content)

        validated_questions = []
        for q in questions:
            if all(
                k in q
                for k in ["question", "options", "answer", "difficulty", "explanation"]
            ):
                if q["difficulty"] not in ["easy", "medium", "hard"]:
                    q["difficulty"] = "medium"
                validated_questions.append(q)

        return validated_questions[:num_questions]

    def generate_related_topics(self, title: str, summary: str) -> List[str]:
        prompt = self.create_topics_prompt()
        chain = prompt | self.llm  # ✅ modern style

        response = chain.invoke(
            {
                "title": title,
                "summary": summary,
            }
        )

        if not response.content:
            return []

        topics = self.parse_json_response(response.content)
        return topics[:5] if isinstance(topics, list) else []
