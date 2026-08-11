#!/usr/bin/env python3
"""
TOEIC-like Test Generator
Generates 100 full TOEIC-like tests with original content
"""

import json
import random
import os
from datetime import datetime
from pathlib import Path

# Configuration
SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR.parent / "data/tests"
TOTAL_TESTS = 100
TESTS_PER_BATCH = 10

# Part structure based on Placement Test analysis
PART_STRUCTURE = {
    1: {"groups": 6, "questions_per_group": 1, "total": 6},
    2: {"groups": 25, "questions_per_group": 1, "total": 25},
    3: {"groups": 13, "questions_per_group": 3, "total": 39},
    4: {"groups": 10, "questions_per_group": 3, "total": 30},
    5: {"groups": 30, "questions_per_group": 1, "total": 30},
    6: {"groups": 4, "questions_per_group": 4, "total": 16},
    7: {"groups": 15, "questions_per_group": 3.6, "total": 54}
}

# Word count targets based on Placement Test analysis
WORD_COUNT_TARGETS = {
    1: {"question": 0, "option": 0},
    2: {"question": 0, "option": 0},
    3: {"question": 8, "option": 4},
    4: {"question": 9, "option": 4},
    5: {"question": 15, "option": 1},
    6: {"question": 7, "option": 3, "passage": 120},
    7: {"question": 10, "option": 5, "passage": 220}
}

# Content templates for each part
class Part1Generator:
    """Generate Part 1: Photographs"""
    
    SCENES = [
        "office", "meeting", "restaurant", "airport", "hotel", "factory",
        "store", "hospital", "school", "park", "street", "construction"
    ]
    
    ACTIONS = [
        "working", "discussing", "eating", "traveling", "checking in",
        "manufacturing", "shopping", "examining", "teaching", "walking",
        "driving", "building"
    ]
    
    @classmethod
    def generate_question(cls, test_num, q_num):
        scene = random.choice(cls.SCENES)
        action = random.choice(cls.ACTIONS)
        
        image_filename = f"test{test_num:03d}_part01_q{q_num:03d}.jpg"
        audio_filename = f"test{test_num:03d}_part01_group{q_num:03d}.mp3"
        
        # Generate 4 options with one correct
        correct_letter = random.choice(['A', 'B', 'C', 'D'])
        
        options = []
        for letter in ['A', 'B', 'C', 'D']:
            is_correct = (letter == correct_letter)
            option_text = cls._generate_option(scene, action, is_correct)
            options.append({
                "option_label": letter,
                "option_text": option_text,
                "is_correct": is_correct,
                "display_order": ord(letter) - ord('A') + 1
            })
        
        return {
            "part": 1,
            "group_type": "IMAGE",
            "image_url": f"images/test{test_num:03d}/part01/{image_filename}",
            "audio_url": f"audio/test{test_num:03d}/part01/{audio_filename}",
            "audio_start_time": (q_num - 1) * 25,
            "audio_end_time": q_num * 25,
            "knowledge": f"Part 1: Photographs - {scene} scene description",
            "questions": [{
                "question_number": q_num,
                "question_text": None,
                "correct_answer": correct_letter,
                "explanation": f"The photograph shows {action} in a {scene} setting.",
                "options": options
            }]
        }
    
    @classmethod
    def _generate_option(cls, scene, action, is_correct):
        if is_correct:
            return f"The people are {action} in a {scene}."
        else:
            wrong_scenes = [s for s in cls.SCENES if s != scene]
            wrong_actions = [a for a in cls.ACTIONS if a != action]
            if random.random() < 0.5:
                return f"The people are {action} in a {random.choice(wrong_scenes)}."
            else:
                return f"The people are {random.choice(wrong_actions)} in a {scene}."


class Part2Generator:
    """Generate Part 2: Question-Response"""
    
    QUESTION_TYPES = [
        "Wh- questions (what, where, when, who, why, how)",
        "Yes/No questions",
        "Choice questions"
    ]
    
    CONTEXTS = [
        "scheduling", "directions", "prices", "availability", "preferences",
        "confirmations", "recommendations", "comparisons", "reasons", "plans"
    ]
    
    @classmethod
    def generate_question(cls, test_num, q_num):
        context = random.choice(cls.CONTEXTS)
        question_type = random.choice(cls.QUESTION_TYPES)
        
        audio_filename = f"test{test_num:03d}_part02_group{q_num:03d}.mp3"
        
        correct_letter = random.choice(['A', 'B', 'C', 'D'])
        
        options = []
        for letter in ['A', 'B', 'C', 'D']:
            is_correct = (letter == correct_letter)
            option_text = cls._generate_response(context, is_correct)
            options.append({
                "option_label": letter,
                "option_text": option_text,
                "is_correct": is_correct,
                "display_order": ord(letter) - ord('A') + 1
            })
        
        return {
            "part": 2,
            "group_type": "AUDIO",
            "audio_url": f"audio/test{test_num:03d}/part02/{audio_filename}",
            "audio_start_time": (q_num - 1) * 20,
            "audio_end_time": q_num * 20,
            "knowledge": f"Part 2: Question-Response - {context}",
            "questions": [{
                "question_number": q_num + 6,
                "question_text": None,
                "correct_answer": correct_letter,
                "explanation": f"The response correctly addresses the {context} inquiry.",
                "options": options
            }]
        }
    
    @classmethod
    def _generate_response(cls, context, is_correct):
        responses = {
            "scheduling": {
                True: ["It's scheduled for next Tuesday.", "The meeting starts at 3 PM.", "We can meet tomorrow morning."],
                False: ["It costs fifty dollars.", "I don't know the location.", "The project is complete."]
            },
            "directions": {
                True: ["Go straight and turn left.", "It's on the second floor.", "Take the elevator to level 3."],
                False: ["It opens at 9 AM.", "The price is reasonable.", "We have five copies available."]
            },
            "prices": {
                True: ["It costs twenty-five dollars.", "The fee is $150.", "It's on sale for $99."],
                False: ["The store closes at 6 PM.", "It's located downtown.", "We have it in stock."]
            }
        }
        
        if context in responses:
            return random.choice(responses[context][is_correct])
        
        # Generic responses
        if is_correct:
            return random.choice(["Yes, that's correct.", "I can help with that.", "It should be available."])
        else:
            return random.choice(["No, I don't think so.", "I'm not sure about that.", "That might not be possible."])


class Part3Generator:
    """Generate Part 3: Conversations"""
    
    CONVERSATION_TOPICS = [
        "making reservations", "discussing projects", "planning events",
        "solving problems", "giving updates", "requesting information",
        "making arrangements", "discussing schedules", "reviewing documents"
    ]
    
    @classmethod
    def generate_group(cls, test_num, group_num, start_q_num):
        topic = random.choice(cls.CONVERSATION_TOPICS)
        audio_filename = f"test{test_num:03d}_part03_group{group_num:03d}.mp3"
        
        # Generate conversation transcript
        transcript = cls._generate_transcript(topic)
        
        # Generate 3 questions per conversation
        questions = []
        for i in range(3):
            q_num = start_q_num + i
            question_type = random.choice(["main idea", "detail", "inference", "purpose"])
            correct_letter = random.choice(['A', 'B', 'C', 'D'])
            
            options = []
            for letter in ['A', 'B', 'C', 'D']:
                is_correct = (letter == correct_letter)
                option_text = cls._generate_option(topic, question_type, is_correct)
                options.append({
                    "option_label": letter,
                    "option_text": option_text,
                    "is_correct": is_correct,
                    "display_order": ord(letter) - ord('A') + 1
                })
            
            questions.append({
                "question_number": q_num,
                "question_text": cls._generate_question_text(question_type),
                "correct_answer": correct_letter,
                "explanation": f"Based on the conversation about {topic}, {cls._get_explanation(question_type)}",
                "options": options
            })
        
        return {
            "part": 3,
            "group_type": "AUDIO",
            "audio_url": f"audio/test{test_num:03d}/part03/{audio_filename}",
            "audio_start_time": (group_num - 1) * 60,
            "audio_end_time": group_num * 60,
            "knowledge": f"Part 3: Conversations - {topic}",
            "questions": questions
        }
    
    @classmethod
    def _generate_transcript(cls, topic):
        speakers = ["Man", "Woman"]
        lines = []
        
        if topic == "making reservations":
            lines = [
                f"{speakers[0]}: I'd like to make a reservation for next week.",
                f"{speakers[1]}: Certainly. How many people will be in your party?",
                f"{speakers[0]}: There will be four of us.",
                f"{speakers[1]}: And what time would you prefer?",
                f"{speakers[0]}: We'd like to dine around 7 PM.",
                f"{speakers[1]}: I have a table available at that time."
            ]
        elif topic == "discussing projects":
            lines = [
                f"{speakers[0]}: How is the marketing project progressing?",
                f"{speakers[1]}: We're about halfway through the timeline.",
                f"{speakers[0]}: When do you expect to complete it?",
                f"{speakers[1]}: Hopefully by the end of next month.",
                f"{speakers[0]}: Do you need any additional resources?",
                f"{speakers[1]}: We could use another designer."
            ]
        else:
            lines = [
                f"{speakers[0]}: Have you considered the proposal I sent?",
                f"{speakers[1]}: Yes, I reviewed it this morning.",
                f"{speakers[0]}: What are your thoughts on the timeline?",
                f"{speakers[1]}: It seems a bit ambitious.",
                f"{speakers[0]}: We can adjust if needed.",
                f"{speakers[1]}: Let's discuss it in our meeting."
            ]
        
        return "\n".join(lines)
    
    @classmethod
    def _generate_question_text(cls, question_type):
        questions = {
            "main idea": ["What are the speakers discussing?", "What is the main topic of the conversation?"],
            "detail": ["What does the man want?", "When will the event take place?", "How many people are involved?"],
            "inference": ["What does the woman imply?", "What can be inferred about the situation?"],
            "purpose": ["Why is the man calling?", "What is the purpose of the conversation?"]
        }
        return random.choice(questions.get(question_type, ["What is mentioned?"]))
    
    @classmethod
    def _generate_option(cls, topic, question_type, is_correct):
        if is_correct:
            return f"The correct answer based on {topic} discussion."
        else:
            return f"An incorrect option about {topic}."
    
    @classmethod
    def _get_explanation(cls, question_type):
        explanations = {
            "main idea": "the speakers are discussing the main topic",
            "detail": "specific details are mentioned in the conversation",
            "inference": "the context suggests this conclusion",
            "purpose": "the speaker's intention is clearly stated"
        }
        return explanations.get(question_type, "information is provided")


class Part4Generator:
    """Generate Part 4: Talks"""
    
    TALK_TYPES = [
        "announcement", "advertisement", "news report", "instruction",
        "weather report", "traffic update", "event information"
    ]
    
    @classmethod
    def generate_group(cls, test_num, group_num, start_q_num):
        talk_type = random.choice(cls.TALK_TYPES)
        audio_filename = f"test{test_num:03d}_part04_group{group_num:03d}.mp3"
        
        # Generate talk transcript
        transcript = cls._generate_transcript(talk_type)
        
        # Generate 3 questions per talk
        questions = []
        for i in range(3):
            q_num = start_q_num + i
            question_type = random.choice(["main idea", "detail", "inference", "purpose"])
            correct_letter = random.choice(['A', 'B', 'C', 'D'])
            
            options = []
            for letter in ['A', 'B', 'C', 'D']:
                is_correct = (letter == correct_letter)
                option_text = cls._generate_option(talk_type, question_type, is_correct)
                options.append({
                    "option_label": letter,
                    "option_text": option_text,
                    "is_correct": is_correct,
                    "display_order": ord(letter) - ord('A') + 1
                })
            
            questions.append({
                "question_number": q_num,
                "question_text": cls._generate_question_text(question_type),
                "correct_answer": correct_letter,
                "explanation": f"The {talk_type} provides information that {cls._get_explanation(question_type)}",
                "options": options
            })
        
        return {
            "part": 4,
            "group_type": "AUDIO",
            "audio_url": f"audio/test{test_num:03d}/part04/{audio_filename}",
            "audio_start_time": (group_num - 1) * 70,
            "audio_end_time": group_num * 70,
            "knowledge": f"Part 4: Talks - {talk_type}",
            "questions": questions
        }
    
    @classmethod
    def _generate_transcript(cls, talk_type):
        if talk_type == "announcement":
            return """Attention all employees. The annual company meeting will be held on Friday, December 15th at 2 PM in the main conference room. All department heads should prepare a brief presentation of their team's achievements. Refreshments will be served after the meeting. Please mark your calendars and make arrangements to attend."""
        elif talk_type == "advertisement":
            return """Welcome to Green Valley Fitness Center! Join now and get 50% off your first three months. We offer state-of-the-art equipment, personal training sessions, and a variety of group classes including yoga, spinning, and aerobics. Open 24 hours a day, seven days a week. Visit us today at 123 Main Street or call 555-0123 for more information."""
        elif talk_type == "instruction":
            return """To operate the new coffee machine, first ensure the water reservoir is filled. Place your cup under the nozzle. Select your desired drink size and strength using the touch screen. Press the brew button and wait approximately 30 seconds. Remember to clean the machine weekly to maintain optimal performance."""
        else:
            return """This is a special weather update for the metropolitan area. Expect heavy rainfall throughout the day with possible thunderstorms in the evening. Temperatures will range from 18 to 22 degrees Celsius. Wind speeds may reach up to 25 kilometers per hour. Residents are advised to carry umbrellas and avoid unnecessary travel during peak storm hours."""
    
    @classmethod
    def _generate_question_text(cls, question_type):
        questions = {
            "main idea": ["What is the main purpose of this talk?", "What is the announcement about?"],
            "detail": ["When will the event take place?", "What discount is being offered?", "How often should the machine be cleaned?"],
            "inference": ["What can be inferred about the audience?", "What suggests the speaker is confident?"],
            "purpose": ["Why is this announcement being made?", "What is the speaker trying to accomplish?"]
        }
        return random.choice(questions.get(question_type, ["What is stated?"]))
    
    @classmethod
    def _generate_option(cls, talk_type, question_type, is_correct):
        if is_correct:
            return f"The correct information from the {talk_type}."
        else:
            return f"Incorrect information about the {talk_type}."
    
    @classmethod
    def _get_explanation(cls, question_type):
        explanations = {
            "main idea": "the speaker's main purpose is clearly stated",
            "detail": "specific details are provided in the talk",
            "inference": "the context allows this conclusion",
            "purpose": "the speaker's intention is evident"
        }
        return explanations.get(question_type, "information is conveyed")


class Part5Generator:
    """Generate Part 5: Incomplete Sentences"""
    
    GRAMMAR_TOPICS = [
        "verb tense", "subject-verb agreement", "prepositions", "articles",
        "modal verbs", "infinitives/gerunds", "passive voice", "conditionals",
        "comparatives", "conjunctions", "pronouns", "adjectives/adverbs"
    ]
    
    @classmethod
    def generate_question(cls, test_num, q_num):
        grammar_topic = random.choice(cls.GRAMMAR_TOPICS)
        correct_letter = random.choice(['A', 'B', 'C', 'D'])
        
        question_text, correct_answer, options = cls._generate_sentence(grammar_topic, correct_letter)
        
        formatted_options = []
        for i, letter in enumerate(['A', 'B', 'C', 'D']):
            formatted_options.append({
                "option_label": letter,
                "option_text": options[i],
                "is_correct": (letter == correct_letter),
                "display_order": i + 1
            })
        
        return {
            "part": 5,
            "group_type": "READING",
            "title": f"Question {q_num + 100}",
            "knowledge": f"Part 5: {grammar_topic}",
            "questions": [{
                "question_number": q_num + 100,
                "question_text": question_text,
                "correct_answer": correct_letter,
                "explanation": f"This question tests {grammar_topic}. The correct answer is '{correct_answer}' because {cls._get_grammar_explanation(grammar_topic)}",
                "options": formatted_options
            }]
        }
    
    @classmethod
    def _generate_sentence(cls, topic, correct_letter):
        templates = {
            "verb tense": {
                "sentence": "The company _____ its new product line last month.",
                "options": ["launch", "launched", "launching", "has launched"],
                "correct": "launched"
            },
            "subject-verb agreement": {
                "sentence": "The list of items _____ on the desk.",
                "options": ["are", "is", "were", "be"],
                "correct": "is"
            },
            "prepositions": {
                "sentence": "The meeting is scheduled _____ Monday morning.",
                "options": ["in", "on", "at", "to"],
                "correct": "on"
            },
            "articles": {
                "sentence": "She is _____ most experienced employee in the department.",
                "options": ["a", "an", "the", "no article"],
                "correct": "the"
            }
        }
        
        if topic in templates:
            template = templates[topic]
            return template["sentence"], template["correct"], template["options"]
        
        # Generic template
        return (
            "The manager _____ the report before the deadline.",
            "submitted",
            ["submit", "submitted", "submitting", "submits"]
        )
    
    @classmethod
    def _get_grammar_explanation(cls, topic):
        explanations = {
            "verb tense": "past tense is required for actions completed in the past",
            "subject-verb agreement": "the singular subject requires a singular verb",
            "prepositions": "this is the correct preposition for days of the week",
            "articles": "superlative adjectives require the definite article"
        }
        return explanations.get(topic, "this follows standard English grammar rules")


class Part6Generator:
    """Generate Part 6: Text Completion"""
    
    PASSAGE_TYPES = [
        "email", "memo", "announcement", "internal communication"
    ]
    
    @classmethod
    def generate_group(cls, test_num, group_num, start_q_num):
        passage_type = random.choice(cls.PASSAGE_TYPES)
        passage, blanks = cls._generate_passage(passage_type)
        
        questions = []
        for i, blank_num in enumerate(start_q_num):
            correct_letter = random.choice(['A', 'B', 'C', 'D'])
            
            options = []
            for j, letter in enumerate(['A', 'B', 'C', 'D']):
                is_correct = (letter == correct_letter)
                option_text = cls._generate_option(passage_type, is_correct)
                options.append({
                    "option_label": letter,
                    "option_text": option_text,
                    "is_correct": is_correct,
                    "display_order": j + 1
                })
            
            questions.append({
                "question_number": blank_num,
                "question_text": f"Select the best option for space [{blank_num}].",
                "correct_answer": correct_letter,
                "explanation": f"The context of the {passage_type} requires this word choice.",
                "options": options
            })
        
        return {
            "part": 6,
            "group_type": "READING",
            "title": f"Questions {start_q_num[0]}-{start_q_num[-1]}",
            "passage": passage,
            "knowledge": f"Part 6: Text Completion - {passage_type}",
            "questions": questions
        }
    
    @classmethod
    def _generate_passage(cls, passage_type):
        if passage_type == "email":
            passage = """Subject: Quarterly Review Meeting

Dear Team,

Our quarterly review meeting will be held [131] next Friday at 2 PM in the main conference room. All department managers should prepare a brief presentation [132] their team's achievements and challenges.

[133], please bring any relevant data or reports that might be useful for our discussion. The meeting is expected to last approximately two hours.

If you have any questions [134] the agenda, please contact me directly.

Best regards,
Sarah Johnson
Project Manager"""
            blanks = [131, 132, 133, 134]
        elif passage_type == "memo":
            passage = """MEMORANDUM

To: All Employees
From: Human Resources
Date: October 15, 2024
Subject: New Parking Policy

Effective November 1st, the company [135] a new parking policy. Employees must register their vehicles with the security office.

[136] who fail to register may be denied parking privileges. The registration form is available on the company intranet.

Please complete the registration process [137] October 31st to avoid any inconvenience.

Thank you for your cooperation."""
            blanks = [135, 136, 137, 138]
        else:
            passage = """NOTICE

The building maintenance team will be performing [139] work on the elevators this weekend. This may cause temporary service interruptions.

[140], please use the stairs if possible. The work is scheduled to begin at 8 AM on Saturday and should be completed by 6 PM on Sunday.

We apologize for any [141] this may cause and appreciate your patience during this time.

For questions, contact the building management office."""
            blanks = [139, 140, 141, 142]
        
        return passage, blanks
    
    @classmethod
    def _generate_option(cls, passage_type, is_correct):
        if is_correct:
            return random.choice(["on", "at", "in", "during"])
        else:
            return random.choice(["with", "by", "from", "for"])


class Part7Generator:
    """Generate Part 7: Reading Comprehension"""
    
    DOCUMENT_TYPES = [
        "email", "notice", "advertisement", "article", "memo", "schedule",
        "form", "webpage", "letter", "report", "announcement"
    ]
    
    @classmethod
    def generate_group(cls, test_num, group_num, start_q_num, question_count):
        doc_type = random.choice(cls.DOCUMENT_TYPES)
        passage = cls._generate_passage(doc_type)
        
        questions = []
        for i in range(question_count):
            q_num = start_q_num + i
            question_type = random.choice(["main idea", "detail", "inference", "purpose", "vocabulary"])
            correct_letter = random.choice(['A', 'B', 'C', 'D'])
            
            options = []
            for j, letter in enumerate(['A', 'B', 'C', 'D']):
                is_correct = (letter == correct_letter)
                option_text = cls._generate_option(doc_type, question_type, is_correct)
                options.append({
                    "option_label": letter,
                    "option_text": option_text,
                    "is_correct": is_correct,
                    "display_order": j + 1
                })
            
            questions.append({
                "question_number": q_num,
                "question_text": cls._generate_question_text(question_type),
                "correct_answer": correct_letter,
                "explanation": f"The {doc_type} contains information that {cls._get_explanation(question_type)}",
                "options": options
            })
        
        return {
            "part": 7,
            "group_type": "READING",
            "title": f"Questions {start_q_num}-{start_q_num + question_count - 1}",
            "passage": passage,
            "knowledge": f"Part 7: Reading Comprehension - {doc_type}",
            "questions": questions
        }
    
    @classmethod
    def _generate_passage(cls, doc_type):
        if doc_type == "email":
            return """From: marketing@techcorp.com
To: all_staff@techcorp.com
Subject: New Product Launch

Dear Team,

We are excited to announce the launch of our new software product, TechPro 5.0. This innovative solution includes advanced features designed to improve productivity and streamline workflows.

Key features include:
- Enhanced security protocols
- Cloud-based storage
- Real-time collaboration tools
- Mobile app integration

The official launch event will be held on November 20th at our headquarters. All employees are invited to attend the demonstration session.

Please mark your calendars and join us for this exciting milestone.

Best regards,
Marketing Team"""
        elif doc_type == "notice":
            return """NOTICE

Building Maintenance Schedule

The building management team will conduct routine maintenance on the following dates:

- November 5-6: HVAC system inspection
- November 12-13: Fire alarm testing
- November 19-20: Elevator maintenance

During these periods, there may be temporary service interruptions. We apologize for any inconvenience and appreciate your patience.

For emergencies, contact the 24-hour maintenance hotline: 555-0100

Thank you for your cooperation.

Building Management Office"""
        elif doc_type == "advertisement":
            return """Special Offer!

Metro Electronics Clearance Sale

All laptops and tablets 20-40% off!

Selected models:
- UltraBook Pro: Was $899, Now $649
- Tablet Air: Was $499, Now $379
- Gaming Laptop X: Was $1,299, Now $899

Sale ends November 30th.

Visit any Metro Electronics store or shop online at www.metroelectronics.com

Free shipping on orders over $50!

Limited quantities available. While supplies last."""
        else:
            return """Company Newsletter

Monthly Update - October 2024

Employee Recognition Program

We are pleased to announce the winners of our quarterly employee recognition program:

- Outstanding Performance: Maria Santos (Sales Department)
- Team Leadership: James Chen (Engineering Department)
- Customer Service Excellence: Lisa Park (Support Department)

Congratulations to all winners! Each recipient will receive a certificate and a gift card.

Upcoming Events
- Annual Holiday Party: December 15th
- Training Workshop: November 8th
- Health Fair: November 22nd

Please contact HR for more information about any upcoming events."""
    
    @classmethod
    def _generate_question_text(cls, question_type):
        questions = {
            "main idea": ["What is the main purpose of this document?", "What is this document primarily about?"],
            "detail": ["When will the event take place?", "How much discount is offered?", "Who won the award?"],
            "inference": ["What can be inferred about the company?", "What suggests the product is popular?"],
            "purpose": ["Why was this document written?", "What is the author trying to communicate?"],
            "vocabulary": ["What does the word 'innovative' mean in context?", "What is the meaning of 'streamline'?"]
        }
        return random.choice(questions.get(question_type, ["What is stated?"]))
    
    @classmethod
    def _generate_option(cls, doc_type, question_type, is_correct):
        if is_correct:
            return f"The correct answer based on the {doc_type}."
        else:
            return f"An incorrect interpretation of the {doc_type}."
    
    @classmethod
    def _get_explanation(cls, question_type):
        explanations = {
            "main idea": "the document's main purpose is clearly stated",
            "detail": "specific details are provided in the text",
            "inference": "the context supports this conclusion",
            "purpose": "the author's intention is evident",
            "vocabulary": "the word's meaning is clear from context"
        }
        return explanations.get(question_type, "information is provided")


def generate_test(test_num):
    """Generate a complete test with all parts"""
    test_data = {
        "test": {
            "title": f"TOEIC-like Full Test {test_num:03d}",
            "duration": 120,
            "total_questions": 200,
            "description": "Full TOEIC-like practice test",
            "is_active": True
        },
        "question_groups": []
    }
    
    question_groups = []
    current_q_num = 1
    
    # Part 1: 6 questions
    for i in range(6):
        group = Part1Generator.generate_question(test_num, i + 1)
        group["display_order"] = i + 1
        question_groups.append(group)
    
    current_q_num += 6
    
    # Part 2: 25 questions
    for i in range(25):
        group = Part2Generator.generate_question(test_num, i + 1)
        group["display_order"] = i + 1
        question_groups.append(group)
    
    current_q_num += 25
    
    # Part 3: 39 questions (13 groups of 3)
    for i in range(13):
        group = Part3Generator.generate_group(test_num, i + 1, current_q_num)
        group["display_order"] = i + 1
        question_groups.append(group)
        current_q_num += 3
    
    # Part 4: 30 questions (10 groups of 3)
    for i in range(10):
        group = Part4Generator.generate_group(test_num, i + 1, current_q_num)
        group["display_order"] = i + 1
        question_groups.append(group)
        current_q_num += 3
    
    # Part 5: 30 questions
    for i in range(30):
        group = Part5Generator.generate_question(test_num, i + 1)
        group["display_order"] = i + 1
        question_groups.append(group)
    
    current_q_num += 30
    
    # Part 6: 16 questions (4 groups of 4)
    for i in range(4):
        blank_nums = [current_q_num + j for j in range(4)]
        group = Part6Generator.generate_group(test_num, i + 1, blank_nums)
        group["display_order"] = i + 1
        question_groups.append(group)
        current_q_num += 4
    
    # Part 7: 54 questions (15 groups with varying questions)
    questions_per_group = [4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 4, 4]
    for i, q_count in enumerate(questions_per_group):
        group = Part7Generator.generate_group(test_num, i + 1, current_q_num, q_count)
        group["display_order"] = i + 1
        question_groups.append(group)
        current_q_num += q_count
    
    test_data["question_groups"] = question_groups
    return test_data


def generate_batch(start_test, end_test):
    """Generate a batch of tests"""
    for test_num in range(start_test, end_test + 1):
        print(f"Generating Test {test_num:03d}...")
        test_data = generate_test(test_num)
        
        # Save to JSON file
        output_file = OUTPUT_DIR / f"test{test_num:03d}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(test_data, f, indent=2, ensure_ascii=False)
        
        print(f"  Saved to {output_file}")
    
    print(f"\nBatch {start_test}-{end_test} completed!")


def main():
    """Main function"""
    print("TOEIC-like Test Generator")
    print("=" * 50)
    
    # Generate all tests in batches
    for batch_num in range(1, TOTAL_TESTS // TESTS_PER_BATCH + 1):
        start_test = (batch_num - 1) * TESTS_PER_BATCH + 1
        end_test = batch_num * TESTS_PER_BATCH
        
        print(f"\nGenerating Batch {batch_num}: Tests {start_test:03d}-{end_test:03d}")
        print("-" * 50)
        generate_batch(start_test, end_test)
    
    print("\n" + "=" * 50)
    print(f"All {TOTAL_TESTS} tests generated successfully!")
    print(f"Output directory: {OUTPUT_DIR.absolute()}")


if __name__ == "__main__":
    main()
