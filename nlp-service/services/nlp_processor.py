import spacy
import re
from datetime import datetime, timedelta

try:
    nlp = spacy.load("en_core_web_sm")
except:
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

TASK_KEYWORDS = [
    "need to", "have to", "must", "should", "will", "going to",
    "plan to", "want to", "study", "complete", "finish", "work on",
    "prepare", "review", "practice", "submit", "attend", "meet"
]

PRIORITY_HIGH = ["urgent", "important", "critical", "asap", "immediately", "today"]
PRIORITY_LOW = ["maybe", "eventually", "later", "someday", "if possible"]

CATEGORY_MAP = {
    "study": ["study", "learn", "read", "practice", "exam", "class", "lecture", "assignment"],
    "work": ["work", "meeting", "project", "deadline", "client", "report", "presentation"],
    "health": ["exercise", "gym", "run", "walk", "doctor", "medicine", "yoga", "workout"],
    "travel": ["go to", "travel", "visit", "drive", "commute", "trip"],
    "social": ["meet", "call", "party", "dinner", "friend", "family"]
}

TIME_PATTERNS = {
    "morning": "08:00",
    "afternoon": "14:00",
    "evening": "18:00",
    "night": "21:00",
    "noon": "12:00",
    "midnight": "00:00"
}

def extract_tasks_from_text(text: str) -> dict:
    doc = nlp(text)
    tasks = []
    locations = []
    travel_mentioned = False
    study_topics = []
    
    sentences = [sent.text.strip() for sent in doc.sents]
    
    for sent in sentences:
        sent_lower = sent.lower()
        
        if any(keyword in sent_lower for keyword in TASK_KEYWORDS):
            task = extract_task_from_sentence(sent, sent_lower)
            if task:
                tasks.append(task)
        
        if any(word in sent_lower for word in ["travel", "go to", "visit", "trip", "drive to"]):
            travel_mentioned = True
    
    for ent in doc.ents:
        if ent.label_ in ["GPE", "LOC", "FAC"]:
            locations.append(ent.text)
        if ent.label_ in ["ORG", "WORK_OF_ART"] and any(
            w in text.lower() for w in ["study", "learn", "read"]
        ):
            study_topics.append(ent.text)
    
    return {
        "tasks": tasks[:10],
        "locations": list(set(locations)),
        "travelMentioned": travel_mentioned or len(locations) > 0,
        "studyTopics": study_topics,
        "goals": extract_goals(text)
    }

def extract_task_from_sentence(sentence: str, sent_lower: str) -> dict:
    priority = "medium"
    if any(w in sent_lower for w in PRIORITY_HIGH):
        priority = "high"
    elif any(w in sent_lower for w in PRIORITY_LOW):
        priority = "low"
    
    category = "other"
    for cat, keywords in CATEGORY_MAP.items():
        if any(k in sent_lower for k in keywords):
            category = cat
            break
    
    scheduled_time = None
    for time_word, time_val in TIME_PATTERNS.items():
        if time_word in sent_lower:
            today = datetime.now()
            h, m = time_val.split(":")
            scheduled_time = today.replace(hour=int(h), minute=int(m)).isoformat()
            break
    
    time_match = re.search(r'\b(\d{1,2}):?(\d{2})?\s*(am|pm)?\b', sent_lower)
    if time_match and not scheduled_time:
        hour = int(time_match.group(1))
        minute = int(time_match.group(2) or 0)
        period = time_match.group(3)
        if period == "pm" and hour != 12:
            hour += 12
        today = datetime.now()
        scheduled_time = today.replace(hour=hour, minute=minute).isoformat()
    
    clean_sentence = sentence
    for keyword in TASK_KEYWORDS:
        clean_sentence = re.sub(rf'\b{keyword}\b', '', clean_sentence, flags=re.IGNORECASE)
    
    title = clean_sentence.strip()[:100]
    if len(title) < 3:
        return None
    
    duration = 60
    duration_match = re.search(r'(\d+)\s*(hour|hr|minute|min)', sent_lower)
    if duration_match:
        amount = int(duration_match.group(1))
        unit = duration_match.group(2)
        duration = amount * 60 if "hour" in unit or "hr" in unit else amount
    
    return {
        "title": title,
        "priority": priority,
        "category": category,
        "scheduledTime": scheduled_time,
        "duration": duration,
        "tags": [category]
    }

def extract_goals(text: str) -> list:
    goal_patterns = [
        r"goal.*?(?:is|to)\s+(.+?)(?:\.|$)",
        r"want to\s+(.+?)(?:\.|$)",
        r"aiming to\s+(.+?)(?:\.|$)"
    ]
    goals = []
    for pattern in goal_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        goals.extend(matches[:2])
    return goals