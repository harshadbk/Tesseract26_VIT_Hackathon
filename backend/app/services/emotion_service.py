def detect_emotion(user_input: str) -> str:
    text = (user_input or "").lower()

    angry_terms = ["angry", "furious", "outrageous", "ridiculous", "hate this"]
    frustrated_terms = ["frustrated", "upset", "annoyed", "disappointed", "worst", "again and again"]
    calm_terms = ["thanks", "thank you", "okay", "understood", "please"]

    if any(term in text for term in angry_terms):
        return "angry"
    if any(term in text for term in frustrated_terms):
        return "frustrated"
    if any(term in text for term in calm_terms):
        return "calm"
    return "calm"
