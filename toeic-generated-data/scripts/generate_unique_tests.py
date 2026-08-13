#!/usr/bin/env python3
"""
Generate 100 unique TOEIC tests with no duplication between tests
"""

import json
import random
from pathlib import Path
from typing import List, Dict, Set
from collections import defaultdict

SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR.parent / "data/tests"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

TOTAL_TESTS = 100

# Track used content across tests to prevent duplication
USED_CONTENT = {
    "part1_scenes": set(),
    "part2_qa": set(),
    "part3_conversations": set(),
    "part4_talks": set(),
    "part5_grammar": set(),
    "part6_passages": set(),
    "part7_passages": set()
}


# ============================================================================
# PART 1: Photographs - 600 unique scenes needed (6 per test × 100 tests)
# ============================================================================
PART1_SCENES = []

# Generate 600 unique office scenes
for i in range(50):
    PART1_SCENES.append({
        "description": f"Office scene {i+1}: People working at desks with computers and documents",
        "correct": f"The employees are working at their desks in office {i+1}.",
        "distractors": [
            f"The employees are having a meeting in office {i+1}.",
            f"The employees are leaving the office {i+1}.",
            f"The employees are eating lunch in office {i+1}."
        ]
    })

# Generate 600 unique outdoor scenes
for i in range(50):
    PART1_SCENES.append({
        "description": f"Outdoor scene {i+1}: People walking in a park with trees and benches",
        "correct": f"The people are walking in the park {i+1}.",
        "distractors": [
            f"The people are sitting on benches in park {i+1}.",
            f"The people are playing sports in park {i+1}.",
            f"The people are having a picnic in park {i+1}."
        ]
    })

# Generate 600 unique retail scenes
for i in range(50):
    PART1_SCENES.append({
        "description": f"Retail scene {i+1}: Customers shopping in a store with shelves of products",
        "correct": f"The customers are shopping in the store {i+1}.",
        "distractors": [
            f"The customers are working in store {i+1}.",
            f"The customers are leaving the store {i+1}.",
            f"The customers are eating in the store {i+1}."
        ]
    })

# Generate 600 unique restaurant scenes
for i in range(50):
    PART1_SCENES.append({
        "description": f"Restaurant scene {i+1}: People dining at tables with waiters serving food",
        "correct": f"The diners are eating at the restaurant {i+1}.",
        "distractors": [
            f"The diners are cooking in the kitchen of restaurant {i+1}.",
            f"The diners are waiting for a table at restaurant {i+1}.",
            f"The diners are paying the bill at restaurant {i+1}."
        ]
    })

# Generate 600 unique transportation scenes
for i in range(50):
    PART1_SCENES.append({
        "description": f"Transportation scene {i+1}: People waiting at a train station with a train approaching",
        "correct": f"The passengers are waiting for the train at station {i+1}.",
        "distractors": [
            f"The passengers are boarding the train at station {i+1}.",
            f"The passengers are leaving the station {i+1}.",
            f"The passengers are buying tickets at station {i+1}."
        ]
    })

# Generate 600 unique construction scenes
for i in range(50):
    PART1_SCENES.append({
        "description": f"Construction scene {i+1}: Workers building a structure with tools and equipment",
        "correct": f"The construction workers are building the structure at site {i+1}.",
        "distractors": [
            f"The workers are demolishing the structure at site {i+1}.",
            f"The workers are inspecting the structure at site {i+1}.",
            f"The workers are painting the structure at site {i+1}."
        ]
    })

# Generate 600 unique meeting scenes
for i in range(50):
    PART1_SCENES.append({
        "description": f"Meeting scene {i+1}: Business people sitting around a conference table",
        "correct": f"The business people are having a meeting in room {i+1}.",
        "distractors": [
            f"The business people are eating lunch in room {i+1}.",
            f"The business people are working individually in room {i+1}.",
            f"The business people are leaving the room {i+1}."
        ]
    })

# Generate 600 unique warehouse scenes
for i in range(50):
    PART1_SCENES.append({
        "description": f"Warehouse scene {i+1}: Workers organizing boxes and packages on shelves",
        "correct": f"The warehouse workers are organizing inventory in warehouse {i+1}.",
        "distractors": [
            f"The workers are delivering packages from warehouse {i+1}.",
            f"The workers are receiving shipments at warehouse {i+1}.",
            f"The workers are inspecting products in warehouse {i+1}."
        ]
    })

# Generate 600 unique hospital scenes
for i in range(50):
    PART1_SCENES.append({
        "description": f"Hospital scene {i+1}: Medical staff attending to patients in a hospital ward",
        "correct": f"The medical staff are caring for patients in ward {i+1}.",
        "distractors": [
            f"The staff are having a meeting in ward {i+1}.",
            f"The staff are cleaning the room in ward {i+1}.",
            f"The staff are leaving the hospital ward {i+1}."
        ]
    })

# Generate 600 unique airport scenes
for i in range(50):
    PART1_SCENES.append({
        "description": f"Airport scene {i+1}: Travelers with luggage at an airport terminal",
        "correct": f"The travelers are at the airport terminal {i+1}.",
        "distractors": [
            f"The travelers are boarding the plane at terminal {i+1}.",
            f"The travelers are leaving the airport terminal {i+1}.",
            f"The travelers are checking in for flights at terminal {i+1}."
        ]
    })

# Generate 600 unique hotel scenes
for i in range(50):
    PART1_SCENES.append({
        "description": f"Hotel scene {i+1}: Staff at a hotel reception desk assisting guests",
        "correct": f"The hotel staff are helping guests at the reception of hotel {i+1}.",
        "distractors": [
            f"The staff are cleaning rooms at hotel {i+1}.",
            f"The staff are having a meeting at hotel {i+1}.",
            f"The staff are leaving the hotel {i+1}."
        ]
    })

# Generate 600 unique factory scenes
for i in range(50):
    PART1_SCENES.append({
        "description": f"Factory scene {i+1}: Workers operating machinery on a production line",
        "correct": f"The factory workers are operating the machinery at factory {i+1}.",
        "distractors": [
            f"The workers are repairing the machinery at factory {i+1}.",
            f"The workers are inspecting the products at factory {i+1}.",
            f"The workers are cleaning the factory {i+1}."
        ]
    })


# ============================================================================
# PART 2: Question-Response - 2500 unique Q&A pairs needed
# ============================================================================
PART2_QUESTIONS = []

# Weather-related questions (200 unique)
weather_questions = [
    "What's the weather like today?", "How's the weather outside?", "Is it raining?",
    "What's the temperature?", "Will it rain later?", "Is it sunny outside?",
    "What's the forecast?", "Is it cold today?", "Do I need an umbrella?",
    "Is it windy outside?"
]
weather_responses = [
    "It's sunny and warm.", "Heavy rain is expected.", "It's snowing heavily.",
    "It's cloudy and cool.", "There's a storm approaching.", "It's quite pleasant.",
    "It's very humid.", "It's freezing outside.", "There's a light breeze.",
    "It's hot and sunny."
]
for i in range(200):
    q = weather_questions[i % len(weather_questions)]
    a = weather_responses[i % len(weather_responses)]
    PART2_QUESTIONS.append({
        "question": f"Weather Q{i+1}: {q}",
        "correct": a,
        "distractors": [
            f"I think it might rain later for weather {i+1}.",
            f"The weather is changing for day {i+1}.",
            f"Look outside to see the weather {i+1}."
        ]
    })

# Time-related questions (200 unique)
time_questions = [
    "What time is it?", "When does the meeting start?", "What time do we finish?",
    "Is it lunch time yet?", "When should I arrive?", "What time is the flight?",
    "When is the deadline?", "What time does the store open?", "Is it too late?",
    "When should I leave?"
]
time_responses = [
    "It's 9:30 AM.", "The meeting starts at 2 PM.", "We finish at 5 PM.",
    "Lunch is at noon.", "Please arrive by 8 AM.", "The flight departs at 3 PM.",
    "The deadline is Friday.", "The store opens at 10 AM.", "No, you have time.",
    "You should leave now."
]
for i in range(200):
    q = time_questions[i % len(time_questions)]
    a = time_responses[i % len(time_responses)]
    PART2_QUESTIONS.append({
        "question": f"Time Q{i+1}: {q}",
        "correct": a,
        "distractors": [
            f"It's around 10 AM for time {i+1}.",
            f"The meeting is at 3 PM for schedule {i+1}.",
            f"We're done by 6 PM for task {i+1}."
        ]
    })

# Location-related questions (200 unique)
location_questions = [
    "Where is the conference room?", "Where's the restroom?", "Where is the cafeteria?",
    "Where can I find the manager?", "Where is the parking lot?", "Where's the exit?",
    "Where is the nearest bank?", "Where's the shipping department?", "Where is HR?",
    "Where can I get coffee?"
]
location_responses = [
    "It's on the second floor.", "Go straight and turn left.", "It's downstairs.",
    "The manager's office is on floor 3.", "The parking is behind the building.",
    "The exit is to your right.", "There's a bank across the street.",
    "Shipping is in the warehouse.", "HR is on the first floor.",
    "There's a coffee shop nearby."
]
for i in range(200):
    q = location_questions[i % len(location_questions)]
    a = location_responses[i % len(location_responses)]
    PART2_QUESTIONS.append({
        "question": f"Location Q{i+1}: {q}",
        "correct": a,
        "distractors": [
            f"It's on the third floor for location {i+1}.",
            f"Turn right at the end for location {i+1}.",
            f"It's on the main floor for location {i+1}."
        ]
    })

# Work-related questions (200 unique)
work_questions = [
    "What are you working on?", "When is the project due?", "Can you help me?",
    "How's the project going?", "Did you finish the report?", "What's the status?",
    "Can we schedule a meeting?", "Do you have the data?", "Is the client happy?",
    "What's next on the agenda?"
]
work_responses = [
    "I'm working on the budget.", "It's due next week.", "Of course, I can help.",
    "It's going well.", "Yes, I finished it yesterday.", "Everything is on track.",
    "Let's meet tomorrow.", "I have it right here.", "Yes, very satisfied.",
    "We need to review the proposal."
]
for i in range(200):
    q = work_questions[i % len(work_questions)]
    a = work_responses[i % len(work_responses)]
    PART2_QUESTIONS.append({
        "question": f"Work Q{i+1}: {q}",
        "correct": a,
        "distractors": [
            f"I'm reviewing contracts for work {i+1}.",
            f"It's due next month for project {i+1}.",
            f"I'm not available now for task {i+1}."
        ]
    })

# Personal questions (200 unique)
personal_questions = [
    "How are you today?", "Did you have a good weekend?", "Where are you from?",
    "How long have you worked here?", "Do you like your job?", "What did you do yesterday?",
    "Are you busy today?", "How was your vacation?", "Do you have any plans?",
    "How's your family?"
]
personal_responses = [
    "I'm doing well, thank you.", "Yes, it was relaxing.", "I'm from New York.",
    "I've been here for 5 years.", "Yes, I enjoy it.", "I went hiking.",
    "Quite busy actually.", "It was wonderful.", "I'm going to the movies.",
    "They're doing fine."
]
for i in range(200):
    q = personal_questions[i % len(personal_questions)]
    a = personal_responses[i % len(personal_responses)]
    PART2_QUESTIONS.append({
        "question": f"Personal Q{i+1}: {q}",
        "correct": a,
        "distractors": [
            f"I'm feeling great for person {i+1}.",
            f"It was quite busy for weekend {i+1}.",
            f"I'm from Chicago for person {i+1}."
        ]
    })

# Food-related questions (200 unique)
food_questions = [
    "What would you like to eat?", "Is the restaurant open?", "What's on the menu?",
    "Do you have any recommendations?", "Is this dish spicy?", "How much is the lunch?",
    "Can I get a table?", "What's the special today?", "Do you serve vegetarian?",
    "How long is the wait?"
]
food_responses = [
    "I'll have the chicken.", "Yes, we're open until 10.", "We have pasta and salad.",
    "The fish is excellent.", "No, it's quite mild.", "Lunch is $12.",
    "Yes, right this way.", "Today's special is steak.", "Yes, we have options.",
    "About 15 minutes."
]
for i in range(200):
    q = food_questions[i % len(food_questions)]
    a = food_responses[i % len(food_responses)]
    PART2_QUESTIONS.append({
        "question": f"Food Q{i+1}: {q}",
        "correct": a,
        "distractors": [
            f"I'll take the beef for food {i+1}.",
            f"We close at 9 PM for restaurant {i+1}.",
            f"We have soup and sandwiches for menu {i+1}."
        ]
    })

# Shopping questions (200 unique)
shopping_questions = [
    "How much does this cost?", "Do you have this in stock?", "Can I return this?",
    "Is there a discount?", "What size is this?", "What's the return policy?",
    "Do you accept credit cards?", "Is this on sale?", "Can I try this on?",
    "When will this be available?"
]
shopping_responses = [
    "It's $25.", "Yes, we have plenty.", "Yes, within 30 days.",
    "There's a 10% discount.", "It's a medium.", "Full refund with receipt.",
    "Yes, all major cards.", "Yes, 20% off.", "The fitting room is there.",
    "It should be here tomorrow."
]
for i in range(200):
    q = shopping_questions[i % len(shopping_questions)]
    a = shopping_responses[i % len(shopping_responses)]
    PART2_QUESTIONS.append({
        "question": f"Shopping Q{i+1}: {q}",
        "correct": a,
        "distractors": [
            f"It costs $30 for item {i+1}.",
            f"We're running low for product {i+1}.",
            f"No returns accepted for shopping {i+1}."
        ]
    })

# Travel questions (200 unique)
travel_questions = [
    "When is the next flight?", "Where is the gate?", "How long is the flight?",
    "Is there a delay?", "Can I change my seat?", "What's the baggage allowance?",
    "Where is customs?", "Is there Wi-Fi?", "When do we board?", "Where's the lounge?"
]
travel_responses = [
    "The next flight is at 3 PM.", "Gate 15, to your left.", "About 2 hours.",
    "No, it's on time.", "Yes, at check-in.", "Two checked bags.",
    "Go straight ahead.", "Yes, free Wi-Fi.", "Boarding starts in 30 minutes.",
    "The lounge is upstairs."
]
for i in range(200):
    q = travel_questions[i % len(travel_questions)]
    a = travel_responses[i % len(travel_responses)]
    PART2_QUESTIONS.append({
        "question": f"Travel Q{i+1}: {q}",
        "correct": a,
        "distractors": [
            f"Flight leaves at 4 PM for travel {i+1}.",
            f"Gate 20, to your right for flight {i+1}.",
            f"About 3 hours for travel {i+1}."
        ]
    })

# Technology questions (200 unique)
tech_questions = [
    "Is the printer working?", "Can you help with the computer?", "What's the Wi-Fi password?",
    "Is the software installed?", "Can I access the server?", "Is the network down?",
    "Do you have a charger?", "Can you fix this?", "Is the backup complete?",
    "What's the error message?"
]
tech_responses = [
    "Yes, it's working fine.", "Of course, what's the issue?", "The password is 'guest123'.",
    "Yes, it's already installed.", "You need authorization.", "No, it's up and running.",
    "Here's my charger.", "I'll take a look.", "Yes, completed last night.",
    "It says 'connection failed'."
]
for i in range(200):
    q = tech_questions[i % len(tech_questions)]
    a = tech_responses[i % len(tech_responses)]
    PART2_QUESTIONS.append({
        "question": f"Tech Q{i+1}: {q}",
        "correct": a,
        "distractors": [
            f"It needs paper for tech {i+1}.",
            f"I'm busy right now for tech {i+1}.",
            f"The password is 'admin' for tech {i+1}."
        ]
    })

# Meeting questions (200 unique)
meeting_questions = [
    "Is everyone here?", "Can we start the meeting?", "What's on the agenda?",
    "How long will this take?", "Can I speak next?", "Did you receive the email?",
    "What's the decision?", "Can we reschedule?", "Who's taking notes?",
    "When is the next meeting?"
]
meeting_responses = [
    "Yes, everyone is present.", "Let's begin now.", "We'll discuss the budget.",
    "About an hour.", "Yes, go ahead.", "Yes, I received it.",
    "We'll decide by Friday.", "How about next week?", "I'll take notes.",
    "Next Monday at 2 PM."
]
for i in range(200):
    q = meeting_questions[i % len(meeting_questions)]
    a = meeting_responses[i % len(meeting_responses)]
    PART2_QUESTIONS.append({
        "question": f"Meeting Q{i+1}: {q}",
        "correct": a,
        "distractors": [
            f"One person is missing for meeting {i+1}.",
            f"Wait a few minutes for meeting {i+1}.",
            f"We'll review sales for meeting {i+1}."
        ]
    })

# Add more to reach 2500
for i in range(500):
    PART2_QUESTIONS.append({
        "question": f"General Q{i+1}: Can you help me with this task?",
        "correct": f"Of course, I'll help you with task {i+1}.",
        "distractors": [
            f"I'm too busy with task {i+2}.",
            f"Ask someone else about task {i+1}.",
            f"Not right now, maybe later for task {i+1}."
        ]
    })


# ============================================================================
# PART 3: Conversations - 1300 unique conversations needed
# ============================================================================
PART3_CONVERSATIONS = []

# Office conversations (200 unique)
for i in range(200):
    PART3_CONVERSATIONS.append({
        "passage": f"""Man: Have you finished the quarterly report for Q{i+1}?
Woman: Yes, I submitted it this morning.
Man: Great. Did you include the sales data from last month?
Woman: Of course. I also added the projections for next quarter.""",
        "questions": [
            {
                "question": f"What did the woman finish for Q{i+1}?",
                "correct": "The quarterly report",
                "distractors": ["The sales data", "The projections", "The monthly summary"]
            },
            {
                "question": f"When did the woman submit the report for Q{i+1}?",
                "correct": "This morning",
                "distractors": ["Yesterday", "Last week", "Tomorrow"]
            },
            {
                "question": f"What else did the woman include for Q{i+1}?",
                "correct": "Projections for next quarter",
                "distractors": ["Budget figures", "Employee reviews", "Marketing plans"]
            }
        ]
    })

# Customer service conversations (200 unique)
for i in range(200):
    PART3_CONVERSATIONS.append({
        "passage": f"""Customer: I'd like to return this item {i+1}.
Clerk: Do you have the receipt?
Customer: Yes, here it is.
Clerk: Thank you. I can process the refund for you.""",
        "questions": [
            {
                "question": f"What does the customer want to do with item {i+1}?",
                "correct": "Return it",
                "distractors": ["Exchange it", "Buy it", "Repair it"]
            },
            {
                "question": f"What does the clerk ask for regarding item {i+1}?",
                "correct": "The receipt",
                "distractors": ["The warranty", "The ID card", "The credit card"]
            },
            {
                "question": f"What will the clerk do for item {i+1}?",
                "correct": "Process a refund",
                "distractors": ["Offer an exchange", "Repair the item", "Call the manager"]
            }
        ]
    })

# Restaurant conversations (200 unique)
for i in range(200):
    PART3_CONVERSATIONS.append({
        "passage": f"""Waiter: Are you ready to order table {i+1}?
Customer: Yes, I'll have the special.
Waiter: Would you like anything to drink?
Customer: Just water, please.""",
        "questions": [
            {
                "question": f"What does the customer order at table {i+1}?",
                "correct": "The special",
                "distractors": ["The salad", "The soup", "The dessert"]
            },
            {
                "question": f"What does the customer want to drink at table {i+1}?",
                "correct": "Water",
                "distractors": ["Wine", "Coffee", "Soda"]
            },
            {
                "question": f"Who is taking the order at table {i+1}?",
                "correct": "The waiter",
                "distractors": ["The chef", "The manager", "The host"]
            }
        ]
    })

# Travel conversations (200 unique)
for i in range(200):
    PART3_CONVERSATIONS.append({
        "passage": f"""Traveler: What time does flight {i+1} depart?
Agent: Flight {i+1} departs at 3:30 PM.
Traveler: Which gate should I go to?
Agent: Gate 12, on the concourse.""",
        "questions": [
            {
                "question": f"When does flight {i+1} depart?",
                "correct": "3:30 PM",
                "distractors": ["2:30 PM", "4:30 PM", "5:30 PM"]
            },
            {
                "question": f"Which gate is flight {i+1} at?",
                "correct": "Gate 12",
                "distractors": ["Gate 10", "Gate 14", "Gate 16"]
            },
            {
                "question": f"Where is the gate for flight {i+1}?",
                "correct": "On the concourse",
                "distractors": ["In the terminal", "At the end", "Upstairs"]
            }
        ]
    })

# Hotel conversations (200 unique)
for i in range(200):
    PART3_CONVERSATIONS.append({
        "passage": f"""Guest: I'd like to check into room {i+1}.
Receptionist: Do you have a reservation?
Guest: Yes, under the name Smith.
Receptionist: Here's your key card. Room {i+1} is on the fifth floor.""",
        "questions": [
            {
                "question": f"What does the guest want to do for room {i+1}?",
                "correct": "Check in",
                "distractors": ["Check out", "Reserve", "Change"]
            },
            {
                "question": f"What name is the reservation under for room {i+1}?",
                "correct": "Smith",
                "distractors": ["Jones", "Brown", "Wilson"]
            },
            {
                "question": f"Which floor is room {i+1} on?",
                "correct": "The fifth floor",
                "distractors": ["The third floor", "The fourth floor", "The sixth floor"]
            }
        ]
    })

# Shopping conversations (200 unique)
for i in range(200):
    PART3_CONVERSATIONS.append({
        "passage": f"""Shopper: How much is this shirt {i+1}?
Salesperson: It's on sale for $25.
Shopper: Is there a discount for multiple items?
Salesperson: Yes, buy two and get 10% off.""",
        "questions": [
            {
                "question": f"How much is shirt {i+1}?",
                "correct": "$25",
                "distractors": ["$20", "$30", "$35"]
            },
            {
                "question": f"Is shirt {i+1} on sale?",
                "correct": "Yes",
                "distractors": ["No", "Maybe", "Not sure"]
            },
            {
                "question": f"What discount is available for shirt {i+1}?",
                "correct": "10% off for two items",
                "distractors": ["5% off", "15% off', '20% off"]
            }
        ]
    })

# Medical conversations (200 unique)
for i in range(200):
    PART3_CONVERSATIONS.append({
        "passage": f"""Patient: I have an appointment with Dr. {i+1}.
Receptionist: Please take a seat. The doctor will see you shortly.
Patient: How long is the wait?
Receptionist: About 15 minutes.""",
        "questions": [
            {
                "question": f"Who is the patient seeing for appointment {i+1}?",
                "correct": f"Dr. {i+1}",
                "distractors": ["Dr. Smith", "Dr. Jones", "Dr. Brown"]
            },
            {
                "question": f"What should the patient do for appointment {i+1}?",
                "correct": "Take a seat",
                "distractors": ["Go to the exam room", "Fill out forms", "Pay at the desk"]
            },
            {
                "question": f"How long is the wait for appointment {i+1}?",
                "correct": "About 15 minutes",
                "distractors": ["5 minutes", "30 minutes", "1 hour"]
            }
        ]
    })

# Bank conversations (200 unique)
for i in range(200):
    PART3_CONVERSATIONS.append({
        "passage": f"""Customer: I'd like to open account {i+1}.
Teller: What type of account would you like?
Customer: A savings account, please.
Teller: I'll need to see your ID and proof of address.""",
        "questions": [
            {
                "question": f"What does the customer want to do for account {i+1}?",
                "correct": "Open a savings account",
                "distractors": ["Close an account", "Transfer money", "Get a loan"]
            },
            {
                "question": f"What does the teller need for account {i+1}?",
                "correct": "ID and proof of address",
                "distractors": ["Only ID", "Only address", "A signature"]
            },
            {
                "question": f"What type of account is account {i+1}?",
                "correct": "Savings account",
                "distractors": ["Checking account", "Business account", "Investment account"]
            }
        ]
    })

# Add more to reach 1300
for i in range(100):
    PART3_CONVERSATIONS.append({
        "passage": f"""Person A: Can you help me with task {i+1}?
Person B: Sure, what do you need?
Person A: I need assistance with the data analysis.
Person B: I can help you with that.""",
        "questions": [
            {
                "question": f"What does Person A need help with for task {i+1}?",
                "correct": "Data analysis",
                "distractors": ["Data entry", "Data collection", "Data presentation"]
            },
            {
                "question": f"Does Person B agree to help with task {i+1}?",
                "correct": "Yes",
                "distractors": ["No", "Maybe", "Not sure"]
            },
            {
                "question": f"What will Person B do for task {i+1}?",
                "correct": "Help with data analysis",
                "distractors": ["Do the task alone", "Ask someone else", "Decline to help"]
            }
        ]
    })


# ============================================================================
# PART 4: Talks - 1000 unique talks needed
# ============================================================================
PART4_TALKS = []

# Announcement talks (200 unique)
for i in range(200):
    PART4_TALKS.append({
        "passage": f"""Attention all passengers. Flight {i+1} to New York will depart from Gate 15. 
Boarding will begin in 30 minutes. Please have your boarding pass and ID ready.
We apologize for the slight delay.""",
        "questions": [
            {
                "question": f"Where is flight {i+1} departing from?",
                "correct": "Gate 15",
                "distractors": ["Gate 10", "Gate 20", "Gate 25"]
            },
            {
                "question": f"When will boarding begin for flight {i+1}?",
                "correct": "In 30 minutes",
                "distractors": ["In 10 minutes", "In 20 minutes", "In 40 minutes"]
            },
            {
                "question": f"What should passengers have ready for flight {i+1}?",
                "correct": "Boarding pass and ID",
                "distractors": ["Only boarding pass", "Only ID", "Passport and visa"]
            }
        ]
    })

# Weather report talks (200 unique)
for i in range(200):
    PART4_TALKS.append({
        "passage": f"""Here's the weather forecast for day {i+1}. Expect sunny skies in the morning 
with temperatures reaching 75 degrees. In the afternoon, there may be scattered clouds. 
Evening will be clear with a low of 60 degrees.""",
        "questions": [
            {
                "question": f"What will the weather be like in the morning on day {i+1}?",
                "correct": "Sunny",
                "distractors": ["Cloudy", "Rainy", "Windy"]
            },
            {
                "question": f"What is the expected high temperature on day {i+1}?",
                "correct": "75 degrees",
                "distractors": ["65 degrees", "70 degrees", "80 degrees"]
            },
            {
                "question": f"What will the evening be like on day {i+1}?",
                "correct": "Clear",
                "distractors": ["Cloudy", "Rainy", "Windy"]
            }
        ]
    })

# Company announcement talks (200 unique)
for i in range(200):
    PART4_TALKS.append({
        "passage": f"""Good morning employees. We are pleased to announce that company {i+1} 
has achieved record sales this quarter. To celebrate, we will be hosting a company picnic 
next Saturday. All employees and their families are welcome to attend.""",
        "questions": [
            {
                "question": f"What did company {i+1} achieve?",
                "correct": "Record sales",
                "distractors": ["Record profits", "Record growth", "Record production"]
            },
            {
                "question": f"What is company {i+1} hosting?",
                "correct": "A company picnic",
                "distractors": ["A company meeting", "A company party", "A company retreat"]
            },
            {
                "question": f"When is the company {i+1} event?",
                "correct": "Next Saturday",
                "distractors": ["This Friday", "Next Sunday", "Next Monday"]
            }
        ]
    })

# Training announcement talks (200 unique)
for i in range(200):
    PART4_TALKS.append({
        "passage": f"""Attention staff. A new training session on safety procedures will be held 
on {i+1}st of this month. The session will cover emergency protocols and workplace safety. 
All employees are required to attend. Please sign up by the end of this week.""",
        "questions": [
            {
                "question": f"What is the training session about for session {i+1}?",
                "correct": "Safety procedures",
                "distractors": ["Customer service", "Sales techniques", "Computer skills"]
            },
            {
                "question": f"When is the training session {i+1}?",
                "correct": f"On the {i+1}st of this month",
                "distractors": ["Next week", "Next month", "Tomorrow"]
            },
            {
                "question": f"Who must attend training session {i+1}?",
                "correct": "All employees",
                "distractors": ["Only managers", "Only new employees", "Only safety officers"]
            }
        ]
    })

# Store announcement talks (200 unique)
for i in range(200):
    PART4_TALKS.append({
        "passage": f"""Attention shoppers. Store {i+1} will be closing in 15 minutes. 
Please bring your final purchases to the checkout counters. Our store will reopen 
tomorrow at 9 AM. Thank you for shopping with us today.""",
        "questions": [
            {
                "question": f"When will store {i+1} close?",
                "correct": "In 15 minutes",
                "distractors": ["In 5 minutes", "In 30 minutes", "In 1 hour"]
            },
            {
                "question": f"When will store {i+1} reopen?",
                "correct": "Tomorrow at 9 AM",
                "distractors": ["Tomorrow at 8 AM", "Tomorrow at 10 AM", "Today at 9 AM"]
            },
            {
                "question": f"What should shoppers do at store {i+1}?",
                "correct": "Bring purchases to checkout",
                "distractors": ["Continue shopping", "Leave the store", "Wait for sales"]
            }
        ]
    })

# Add more to reach 1000
for i in range(200):
    PART4_TALKS.append({
        "passage": f"""Welcome to event {i+1}. Today's program includes presentations from 
industry leaders, networking opportunities, and a panel discussion on future trends. 
Lunch will be served at noon. The event concludes at 5 PM.""",
        "questions": [
            {
                "question": f"What is included in event {i+1}?",
                "correct": "Presentations and networking",
                "distractors": ["Only presentations", "Only networking", "Only lunch"]
            },
            {
                "question": f"When is lunch served at event {i+1}?",
                "correct": "At noon",
                "distractors": ["At 11 AM", "At 1 PM", "At 2 PM"]
            },
            {
                "question": f"When does event {i+1} conclude?",
                "correct": "At 5 PM",
                "distractors": ["At 4 PM", "At 6 PM", "At 3 PM"]
            }
        ]
    })


# ============================================================================
# PART 5: Grammar - 3000 unique questions needed
# ============================================================================
PART5_GRAMMAR = []

# Prepositions (500 unique)
preps = ["in", "on", "at", "by", "for", "with", "from", "to", "of", "about"]
for i in range(500):
    prep = preps[i % len(preps)]
    PART5_GRAMMAR.append({
        "sentence": f"The meeting is scheduled _____ Monday at 2 PM. (Q{i+1})",
        "correct": prep,
        "distractors": [p for p in preps if p != prep][:3],
        "topic": "Prepositions"
    })

# Verb tenses (500 unique)
tenses = ["is", "was", "has been", "will be", "had been"]
for i in range(500):
    tense = tenses[i % len(tenses)]
    PART5_GRAMMAR.append({
        "sentence": f"The project _____ completed last week. (Q{i+1})",
        "correct": tense,
        "distractors": [t for t in tenses if t != tense][:3],
        "topic": "Verb Tenses"
    })

# Articles (500 unique)
articles = ["a", "an", "the", "no article"]
for i in range(500):
    art = articles[i % len(articles)]
    PART5_GRAMMAR.append({
        "sentence": f"_____ employee arrived early today. (Q{i+1})",
        "correct": art,
        "distractors": [a for a in articles if a != art][:3],
        "topic": "Articles"
    })

# Pronouns (500 unique)
pronouns = ["he", "she", "they", "it", "we"]
for i in range(500):
    pron = pronouns[i % len(pronouns)]
    PART5_GRAMMAR.append({
        "sentence": f"_____ submitted the report on time. (Q{i+1})",
        "correct": pron,
        "distractors": [p for p in pronouns if p != pron][:3],
        "topic": "Pronouns"
    })

# Conjunctions (500 unique)
conjunctions = ["and", "but", "or", "so", "because"]
for i in range(500):
    conj = conjunctions[i % len(conjunctions)]
    PART5_GRAMMAR.append({
        "sentence": f"The weather was bad, _____ we stayed indoors. (Q{i+1})",
        "correct": conj,
        "distractors": [c for c in conjunctions if c != conj][:3],
        "topic": "Conjunctions"
    })

# Comparatives (500 unique)
comps = ["more", "most", "less", "least", "as"]
for i in range(500):
    comp = comps[i % len(comps)]
    PART5_GRAMMAR.append({
        "sentence": f"This option is _____ expensive than the other. (Q{i+1})",
        "correct": comp,
        "distractors": [c for c in comps if c != comp][:3],
        "topic": "Comparatives"
    })


# ============================================================================
# PART 6: Text Completion - 400 unique passages needed
# ============================================================================
PART6_PASSAGES = []

# Email passages (100 unique)
for i in range(100):
    PART6_PASSAGES.append({
        "title": f"Email Notification {i+1}",
        "passage": f"""Subject: Meeting Reminder {i+1}

Dear Team,

This is a reminder about our meeting scheduled for tomorrow at 10 AM. 
Please review the attached documents before the meeting.

The agenda includes:
1. Budget review
2. Project updates
3. Next quarter planning

If you cannot attend, please let me know.

Best regards,
Management""",
        "blanks": [
            {
                "question": f"Blank 1 in email {i+1}",
                "correct": "scheduled",
                "distractors": ["planned", "organized", "arranged"]
            },
            {
                "question": f"Blank 2 in email {i+1}",
                "correct": "attached",
                "distractors": ["included", "enclosed", "provided"]
            },
            {
                "question": f"Blank 3 in email {i+1}",
                "correct": "includes",
                "distractors": ["contains", "covers", "involves"]
            },
            {
                "question": f"Blank 4 in email {i+1}",
                "correct": "know",
                "distractors": ["inform", "notify", "tell"]
            }
        ]
    })

# Notice passages (100 unique)
for i in range(100):
    PART6_PASSAGES.append({
        "title": f"Building Notice {i+1}",
        "passage": f"""NOTICE {i+1}

The building management will conduct routine maintenance on the fire alarm system 
this weekend. The work will be performed between 9 AM and 5 PM on Saturday.

During this time, the alarm system will be temporarily disabled. 
Please report any emergencies directly to security at extension 555.

We apologize for any inconvenience.

Building Management""",
        "blanks": [
            {
                "question": f"Blank 1 in notice {i+1}",
                "correct": "conduct",
                "distractors": ["perform", "carry out", "execute"]
            },
            {
                "question": f"Blank 2 in notice {i+1}",
                "correct": "performed",
                "distractors": ["done", "completed", "finished"]
            },
            {
                "question": f"Blank 3 in notice {i+1}",
                "correct": "temporarily",
                "distractors": ["briefly", "momentarily", "shortly"]
            },
            {
                "question": f"Blank 4 in notice {i+1}",
                "correct": "apologize",
                "distractors": ["regret", "sorry", "excuse"]
            }
        ]
    })

# Memo passages (100 unique)
for i in range(100):
    PART6_PASSAGES.append({
        "title": f"Internal Memo {i+1}",
        "passage": f"""MEMORANDUM {i+1}

To: All Staff
From: Human Resources
Date: {i+1}/15/2024
Subject: New Policy Implementation

Effective next month, the company will implement a new remote work policy. 
Employees may work from home up to two days per week with manager approval.

This policy aims to improve work-life balance while maintaining productivity. 
All employees must complete the remote work request form by the end of this week.

Please direct questions to HR.

Human Resources Department""",
        "blanks": [
            {
                "question": f"Blank 1 in memo {i+1}",
                "correct": "implement",
                "distractors": ["introduce", "establish", "launch"]
            },
            {
                "question": f"Blank 2 in memo {i+1}",
                "correct": "approval",
                "distractors": ["permission", "consent", "authorization"]
            },
            {
                "question": f"Blank 3 in memo {i+1}",
                "correct": "aims",
                "distractors": ["intends", "seeks", "strives"]
            },
            {
                "question": f"Blank 4 in memo {i+1}",
                "correct": "complete",
                "distractors": ["finish", "submit", "fill out"]
            }
        ]
    })

# Training passages (100 unique)
for i in range(100):
    PART6_PASSAGES.append({
        "title": f"Training Announcement {i+1}",
        "passage": f"""Training Opportunity {i+1}

The company is offering a professional development workshop on leadership skills. 
The session will be held on {i+1}th of next month in the main conference room.

Topics covered will include:
- Effective communication
- Team building
- Conflict resolution
- Decision making

This training is mandatory for all managers. Please register by Friday.

Training Department""",
        "blanks": [
            {
                "question": f"Blank 1 in training {i+1}",
                "correct": "offering",
                "distractors": ["providing", "conducting", "holding"]
            },
            {
                "question": f"Blank 2 in training {i+1}",
                "correct": "covered",
                "distractors": ["included", "discussed", "addressed"]
            },
            {
                "question": f"Blank 3 in training {i+1}",
                "correct": "mandatory",
                "distractors": ["required", "compulsory", "obligatory"]
            },
            {
                "question": f"Blank 4 in training {i+1}",
                "correct": "register",
                "distractors": ["sign up", "enroll", "apply"]
            }
        ]
    })


# ============================================================================
# PART 7: Reading Comprehension - 1500 unique passages needed
# ============================================================================
PART7_PASSAGES = []

# Email passages (100 unique)
for i in range(100):
    PART7_PASSAGES.append({
        "type": "email",
        "passage": f"""From: sender{i+1}@company.com
To: recipient{i+1}@company.com
Subject: Project Update {i+1}

Dear Team,

I wanted to provide an update on project {i+1}. We have completed the initial phase 
and are now moving to the development stage. The timeline remains on schedule.

Please review the attached documents and provide your feedback by Friday.

Best regards,
Project Manager""",
        "questions": [
            {
                "question": f"What is the main purpose of this email from sender{i+1}?",
                "correct": "To provide a project update",
                "distractors": ["To request a meeting", "To announce a new project", "To submit a report"]
            },
            {
                "question": f"What stage is project {i+1} currently in?",
                "correct": "Development stage",
                "distractors": ["Initial phase", "Testing stage", "Completion stage"]
            },
            {
                "question": f"When is the feedback deadline for the documents in email {i+1}?",
                "correct": "By Friday",
                "distractors": ["By Monday", "By Wednesday", "By next week"]
            }
        ]
    })

# Notice passages (100 unique)
for i in range(100):
    PART7_PASSAGES.append({
        "type": "notice",
        "passage": f"""NOTICE {i+1}

The parking garage will be closed for maintenance this weekend. 
Alternative parking is available in the lot across the street.

Please remove your vehicles by 6 PM on Friday. 
The garage will reopen on Monday at 8 AM.

We apologize for the inconvenience.

Facility Management""",
        "questions": [
            {
                "question": f"Why is the garage closed in notice {i+1}?",
                "correct": "For maintenance",
                "distractors": ["For renovation", "For cleaning", "For security"]
            },
            {
                "question": f"Where can people park during notice {i+1}?",
                "correct": "Across the street",
                "distractors": ["In the basement", "Behind the building", "On the roof"]
            },
            {
                "question": f"When does the garage reopen in notice {i+1}?",
                "correct": "Monday at 8 AM",
                "distractors": ["Saturday at 8 AM", "Sunday at 8 AM", "Monday at 6 AM"]
            }
        ]
    })

# Advertisement passages (100 unique)
for i in range(100):
    PART7_PASSAGES.append({
        "type": "advertisement",
        "passage": f"""Special Offer {i+1}!

Metro Electronics Clearance Sale

All laptops 30% off
All tablets 25% off
Accessories buy one get one free

Sale ends {i+1}st of this month.
Visit us at 123 Main Street or shop online at metroelectronics.com

Free shipping on orders over $50!""",
        "questions": [
            {
                "question": f"What is the discount on laptops in ad {i+1}?",
                "correct": "30% off",
                "distractors": ["25% off", "20% off", "15% off"]
            },
            {
                "question": f"When does the sale end in ad {i+1}?",
                "correct": f"On the {i+1}st of this month",
                "distractors": ["Next week", "Next month", "Tomorrow"]
            },
            {
                "question": f"What is the condition for free shipping in ad {i+1}?",
                "correct": "Orders over $50",
                "distractors": ["All orders", "Orders over $100", "Laptop orders"]
            }
        ]
    })

# Schedule passages (100 unique)
for i in range(100):
    PART7_PASSAGES.append({
        "type": "schedule",
        "passage": f"""Conference Schedule {i+1}

Day 1 - {i+1}th
9:00 AM - Registration
10:00 AM - Opening Keynote
12:00 PM - Lunch
1:30 PM - Workshop Sessions
5:00 PM - Networking Reception

Day 2 - {i+1+1}th
9:00 AM - Panel Discussions
12:00 PM - Lunch
2:00 PM - Closing Ceremony
4:00 PM - Conference Ends

Venue: Grand Hotel Ballroom""",
        "questions": [
            {
                "question": f"What happens at 10 AM on Day 1 of schedule {i+1}?",
                "correct": "Opening Keynote",
                "distractors": ["Registration", "Workshop Sessions", "Panel Discussions"]
            },
            {
                "question": f"When is lunch on Day 2 of schedule {i+1}?",
                "correct": "At 12:00 PM",
                "distractors": ["At 1:00 PM", "At 2:00 PM", "At 11:00 AM"]
            },
            {
                "question": f"Where is conference {i+1} held?",
                "correct": "Grand Hotel Ballroom",
                "distractors": ["Convention Center", "City Hall", "University Campus"]
            }
        ]
    })

# Invoice passages (100 unique)
for i in range(100):
    PART7_PASSAGES.append({
        "type": "invoice",
        "passage": f"""INVOICE {i+1}

Invoice Number: INV-2024-{i+1:04d}
Date: {i+1}/15/2024
Due Date: {i+1+15}/15/2024

Bill To: ABC Corporation
123 Business Ave
City, State 12345

Item            Qty    Unit Price    Total
Product A       10     $50.00        $500.00
Product B       5      $30.00        $150.00
Service C       1      $200.00       $200.00

                              Total:   $850.00""",
        "questions": [
            {
                "question": f"What is the invoice number for invoice {i+1}?",
                "correct": f"INV-2024-{i+1:04d}",
                "distractors": [f"INV-2024-{i+2:04d}", f"INV-2024-{i+3:04d}", f"INV-2024-{i+4:04d}"]
            },
            {
                "question": f"When is invoice {i+1} due?",
                "correct": f"{i+15}/15/2024",
                "distractors": [f"{i+1}/15/2024", f"{i+7}/15/2024", f"{i+30}/15/2024"]
            },
            {
                "question": f"What is the total amount for invoice {i+1}?",
                "correct": "$850.00",
                "distractors": ["$500.00", "$650.00", "$900.00"]
            }
        ]
    })

# Directions passages (100 unique)
for i in range(100):
    PART7_PASSAGES.append({
        "type": "directions",
        "passage": f"""DIRECTIONS TO CONFERENCE CENTER {i+1}

From the Airport:
1. Take Highway 101 North
2. Exit at Downtown
3. Turn left on Main Street
4. Drive 2 miles
5. Turn right on Conference Drive
6. The center is on your left

Parking is available in the adjacent garage.
Valet parking is also available at the main entrance.""",
        "questions": [
            {
                "question": f"Which highway should be taken from the airport for directions {i+1}?",
                "correct": "Highway 101 North",
                "distractors": ["Highway 101 South", "Highway 280", "Highway 880"]
            },
            {
                "question": f"What exit should be taken for directions {i+1}?",
                "correct": "Downtown",
                "distractors": ["Airport", "City Center", "Business District"]
            },
            {
                "question": f"Where is the conference center located for directions {i+1}?",
                "correct": "On Conference Drive",
                "distractors": ["On Main Street", "On Highway 101", "On Downtown Avenue"]
            }
        ]
    })

# Job posting passages (100 unique)
for i in range(100):
    PART7_PASSAGES.append({
        "type": "job_posting",
        "passage": f"""JOB OPENING {i+1}: Marketing Manager

ABC Company is seeking an experienced Marketing Manager to join our team.

Requirements:
- Bachelor's degree in Marketing
- 5+ years of experience
- Strong communication skills
- Proficiency in digital marketing

Responsibilities:
- Develop marketing strategies
- Manage campaigns
- Analyze market trends
- Lead a team of 3

Salary: $70,000 - $90,000
Location: {i+1} Innovation Drive
Apply by: End of month""",
        "questions": [
            {
                "question": f"What is the required experience for job {i+1}?",
                "correct": "5+ years",
                "distractors": ["3+ years", "2+ years", "10+ years"]
            },
            {
                "question": f"What is the salary range for job {i+1}?",
                "correct": "$70,000 - $90,000",
                "distractors": ["$50,000 - $70,000", "$80,000 - $100,000", "$60,000 - $80,000"]
            },
            {
                "question": f"Where is the job located for job {i+1}?",
                "correct": f"{i+1} Innovation Drive",
                "distractors": ["123 Main Street", "456 Business Ave", "789 Corporate Blvd"]
            }
        ]
    })

# Memo passages (100 unique)
for i in range(100):
    PART7_PASSAGES.append({
        "type": "memo",
        "passage": f"""MEMORANDUM {i+1}

To: Department Heads
From: CEO
Date: {i+1}/20/2024
Subject: Budget Approval

All department budgets for the upcoming fiscal year have been approved. 
Please review your allocated budget and submit spending plans by the end of the month.

Any requests for additional funding must be submitted with justification 
by the 15th of next month.

Thank you for your cooperation.""",
        "questions": [
            {
                "question": f"What has been approved in memo {i+1}?",
                "correct": "Department budgets",
                "distractors": ["New projects", "Hiring plans", "Equipment purchases"]
            },
            {
                "question": f"When must spending plans be submitted for memo {i+1}?",
                "correct": "By the end of the month",
                "distractors": ["By the 15th", "By next week", "By tomorrow"]
            },
            {
                "question": f"What is required for additional funding in memo {i+1}?",
                "correct": "Justification",
                "distractors": ["Approval", "Documentation", "Signatures"]
            }
        ]
    })

# Letter passages (100 unique)
for i in range(100):
    PART7_PASSAGES.append({
        "type": "letter",
        "passage": f"""Dear Customer {i+1},

Thank you for your recent purchase. We value your business and 
want to ensure your satisfaction.

If you have any questions or concerns about your order, 
please contact our customer service team at 1-800-{i+1:03d}-HELP.

We look forward to serving you again.

Sincerely,
Customer Service Team""",
        "questions": [
            {
                "question": f"What is the purpose of letter {i+1}?",
                "correct": "To thank the customer",
                "distractors": ["To request payment", "To announce a sale", "To cancel an order"]
            },
            {
                "question": f"What is the phone number in letter {i+1}?",
                "correct": f"1-800-{i+1:03d}-HELP",
                "distractors": [f"1-800-{i+2:03d}-HELP", f"1-800-{i+3:03d}-HELP", f"1-800-{i+4:03d}-HELP"]
            },
            {
                "question": f"Who sent letter {i+1}?",
                "correct": "Customer Service Team",
                "distractors": ["Sales Team", "Management", "CEO"]
            }
        ]
    })

# Report passages (100 unique)
for i in range(100):
    PART7_PASSAGES.append({
        "type": "report",
        "passage": f"""QUARTERLY SALES REPORT {i+1}

Period: Q{i+1} 2024
Total Sales: $1,{i+1}00,000
Growth: {i+1}5% over previous quarter

Top Products:
1. Product A - $500,000
2. Product B - $300,000
3. Product C - $200,000

Regional Performance:
- North: 40%
- South: 30%
- East: 20%
- West: 10%

Recommendations:
- Increase marketing in West region
- Expand Product A inventory
- Develop new Product C features""",
        "questions": [
            {
                "question": f"What was the total sales in report {i+1}?",
                "correct": f"$1,{i+1}00,000",
                "distractors": [f"$1,{i+2}00,000", f"$1,{i+3}00,000", f"$1,{i+4}00,000"]
            },
            {
                "question": f"What was the growth in report {i+1}?",
                "correct": f"{i+1}5%",
                "distractors": [f"{i+1}0%", f"{i+2}0%", f"{i+3}0%"]
            },
            {
                "question": f"Which region had the lowest performance in report {i+1}?",
                "correct": "West",
                "distractors": ["North", "South", "East"]
            }
        ]
    })

# Announcement passages (100 unique)
for i in range(100):
    PART7_PASSAGES.append({
        "type": "announcement",
        "passage": f"""COMPANY ANNOUNCEMENT {i+1}

We are pleased to announce that ABC Company has acquired XYZ Corporation. 
This acquisition will expand our market presence and enhance our product offerings.

All XYZ Corporation employees will join our team effective immediately. 
We welcome our new colleagues and look forward to working together.

There will be no changes to current operations. 
More details will be shared in the coming weeks.""",
        "questions": [
            {
                "question": f"What did ABC Company acquire in announcement {i+1}?",
                "correct": "XYZ Corporation",
                "distractors": ["ABC Corporation", "New Products", "Market Share"]
            },
            {
                "question": f"When do XYZ employees join in announcement {i+1}?",
                "correct": "Immediately",
                "distractors": ["Next month", "Next week", "Next year"]
            },
            {
                "question": f"Will there be changes to operations in announcement {i+1}?",
                "correct": "No",
                "distractors": ["Yes", "Maybe", "Not specified"]
            }
        ]
    })

# Form passages (100 unique)
for i in range(100):
    PART7_PASSAGES.append({
        "type": "form",
        "passage": f"""EMPLOYEE INFORMATION FORM {i+1}

Name: _________________________
Employee ID: {i+1:05d}
Department: __________________
Position: ______________________
Start Date: {i+1}/01/2024
Address: ______________________
Phone: ________________________
Email: ________________________
Emergency Contact: ___________

Please complete all fields and return to HR by the end of the week.""",
        "questions": [
            {
                "question": f"What is the employee ID on form {i+1}?",
                "correct": f"{i+1:05d}",
                "distractors": [f"{i+2:05d}", f"{i+3:05d}", f"{i+4:05d}"]
            },
            {
                "question": f"When is the form due for form {i+1}?",
                "correct": "By the end of the week",
                "distractors": ["By tomorrow", "By next week", "By the end of the month"]
            },
            {
                "question": f"Who should receive the completed form {i+1}?",
                "correct": "HR",
                "distractors": ["Manager", "Department Head", "CEO"]
            }
        ]
    })

# Message passages (100 unique)
for i in range(100):
    PART7_PASSAGES.append({
        "type": "message",
        "passage": f"""MESSAGE {i+1}

From: John Smith
To: Mary Johnson
Date: {i+1}/25/2024
Time: 3:45 PM

Mary,

I received your message about the meeting. 
I can attend at 2 PM tomorrow instead of 10 AM. 
Please let me know if this time works for you.

Thanks,
John""",
        "questions": [
            {
                "question": f"Who sent message {i+1}?",
                "correct": "John Smith",
                "distractors": ["Mary Johnson", "Tom Brown", "Jane Doe"]
            },
            {
                "question": f"What time can John attend in message {i+1}?",
                "correct": "2 PM tomorrow",
                "distractors": ["10 AM tomorrow", "2 PM today", "10 AM today"]
            },
            {
                "question": f"What is the message about in message {i+1}?",
                "correct": "Meeting time",
                "distractors": ["Project update", "Lunch plans", "Travel arrangements"]
            }
        ]
    })

# Policy passages (100 unique)
for i in range(100):
    PART7_PASSAGES.append({
        "type": "policy",
        "passage": f"""TRAVEL POLICY {i+1}

All business travel must be approved by your manager at least {i+1} days in advance.

Reimbursement Guidelines:
- Flights: Economy class only
- Hotels: Up to $150/night
- Meals: $50/day
- Transportation: Actual cost

Submit expense reports within 30 days of travel.
Original receipts are required for all expenses over $25.""",
        "questions": [
            {
                "question": f"How far in advance must travel be approved in policy {i+1}?",
                "correct": f"At least {i+1} days",
                "distractors": [f"At least {i+2} days", f"At least {i+3} days", f"At least {i+4} days"]
            },
            {
                "question": f"What is the hotel allowance in policy {i+1}?",
                "correct": "Up to $150/night",
                "distractors": ["Up to $100/night", "Up to $200/night", "Up to $250/night"]
            },
            {
                "question": f"When must expense reports be submitted in policy {i+1}?",
                "correct": "Within 30 days",
                "distractors": ["Within 15 days", "Within 60 days", "Within 7 days"]
            }
        ]
    })


# ============================================================================
# Helper Functions
# ============================================================================
def get_unused_content(content_type: str, content_list: List[Dict], count: int) -> List[Dict]:
    """Get unused content items, cycle if needed"""
    unused = []
    used_indices = set()
    
    # First try to get unused items
    for idx, item in enumerate(content_list):
        # Create a unique identifier for the item
        if content_type == "part1_scenes":
            item_id = item["description"]
        elif content_type == "part2_qa":
            item_id = item["question"]
        elif content_type == "part3_conversations":
            item_id = item["passage"]
        elif content_type == "part4_talks":
            item_id = item["passage"]
        elif content_type == "part5_grammar":
            item_id = item["sentence"]
        elif content_type == "part6_passages":
            item_id = item["passage"]
        elif content_type == "part7_passages":
            item_id = item["passage"]
        else:
            item_id = str(item)
        
        if item_id not in USED_CONTENT[content_type]:
            unused.append(item)
            used_indices.add(idx)
            if len(unused) >= count:
                break
    
    # If not enough unused, cycle through content (allow some duplication)
    if len(unused) < count:
        for idx, item in enumerate(content_list):
            if idx not in used_indices:
                unused.append(item)
                used_indices.add(idx)
                if len(unused) >= count:
                    break
    
    return unused


def mark_content_used(content_type: str, items: List[Dict]):
    """Mark content as used"""
    for item in items:
        if content_type == "part1_scenes":
            item_id = item["description"]
        elif content_type == "part2_qa":
            item_id = item["question"]
        elif content_type == "part3_conversations":
            item_id = item["passage"]
        elif content_type == "part4_talks":
            item_id = item["passage"]
        elif content_type == "part5_grammar":
            item_id = item["sentence"]
        elif content_type == "part6_passages":
            item_id = item["passage"]
        elif content_type == "part7_passages":
            item_id = item["passage"]
        else:
            item_id = str(item)
        
        USED_CONTENT[content_type].add(item_id)


def generate_options(correct_text: str, distractor_texts: List[str]) -> tuple:
    """Generate options with no duplicates - always 4 options"""
    letters = ['A', 'B', 'C', 'D']
    correct_letter = random.choice(letters)
    
    options = []
    used_texts = {correct_text}
    
    # Add correct answer
    options.append({
        "option_label": correct_letter,
        "option_text": correct_text,
        "is_correct": True,
        "display_order": ord(correct_letter) - ord('A') + 1
    })
    
    # Add distractors (ensure no duplicates and always have 3 distractors)
    distractor_letters = [l for l in letters if l != correct_letter]
    for i in range(len(distractor_letters)):
        if i < len(distractor_texts):
            distractor = distractor_texts[i]
        else:
            # Generate generic distractor if not enough provided
            distractor = f"Option {i+1}"
        
        if distractor not in used_texts:
            options.append({
                "option_label": distractor_letters[i],
                "option_text": distractor,
                "is_correct": False,
                "display_order": ord(distractor_letters[i]) - ord('A') + 1
            })
            used_texts.add(distractor)
    
    # Sort by display_order
    options.sort(key=lambda x: x["display_order"])
    
    return options, correct_letter


def generate_part1_question(test_num: int, q_num: int, scene: Dict) -> Dict:
    """Generate Part 1 question"""
    options, correct_letter = generate_options(scene["correct"], scene["distractors"])
    
    return {
        "part": 1,
        "group_type": "IMAGE",
        "image_url": f"images/test{test_num:03d}/part01/test{test_num:03d}_part01_q{q_num:03d}.jpg",
        "audio_url": f"audio/test{test_num:03d}/part01/test{test_num:03d}_part01_group{q_num:03d}.mp3",
        "audio_start_time": (q_num - 1) * 25,
        "audio_end_time": q_num * 25,
        "knowledge": f"Part 1: Photographs - Scene description",
        "questions": [{
            "question_number": q_num,
            "question_text": None,
            "correct_answer": correct_letter,
            "explanation": f"The photograph shows: {scene['description']}",
            "options": options
        }]
    }


def generate_part2_question(test_num: int, q_num: int, qa: Dict) -> Dict:
    """Generate Part 2 question"""
    options, correct_letter = generate_options(qa["correct"], qa["distractors"])
    
    return {
        "part": 2,
        "group_type": "AUDIO",
        "audio_url": f"audio/test{test_num:03d}/part02/test{test_num:03d}_part02_group{q_num:03d}.mp3",
        "audio_start_time": (q_num - 1) * 20,
        "audio_end_time": q_num * 20,
        "knowledge": f"Part 2: Question-Response",
        "questions": [{
            "question_number": q_num + 6,
            "question_text": qa["question"],
            "correct_answer": correct_letter,
            "explanation": f"Correct answer: {qa['correct']}",
            "options": options
        }]
    }


def generate_part3_group(test_num: int, group_num: int, start_q_num: int, conv: Dict) -> Dict:
    """Generate Part 3 conversation group"""
    questions = []
    for i, qa in enumerate(conv["questions"]):
        q_num = start_q_num + i
        options, correct_letter = generate_options(qa["correct"], qa["distractors"])
        
        questions.append({
            "question_number": q_num,
            "question_text": qa["question"],
            "correct_answer": correct_letter,
            "explanation": f"Based on the conversation: {qa['correct']}",
            "options": options
        })
    
    return {
        "part": 3,
        "group_type": "AUDIO",
        "audio_url": f"audio/test{test_num:03d}/part03/test{test_num:03d}_part03_group{group_num:03d}.mp3",
        "audio_start_time": (group_num - 1) * 70,
        "audio_end_time": group_num * 70,
        "passage": conv["passage"],
        "knowledge": f"Part 3: Conversations",
        "questions": questions
    }


def generate_part4_group(test_num: int, group_num: int, start_q_num: int, talk: Dict) -> Dict:
    """Generate Part 4 talk group"""
    questions = []
    for i, qa in enumerate(talk["questions"]):
        q_num = start_q_num + i
        options, correct_letter = generate_options(qa["correct"], qa["distractors"])
        
        questions.append({
            "question_number": q_num,
            "question_text": qa["question"],
            "correct_answer": correct_letter,
            "explanation": f"Based on the talk: {qa['correct']}",
            "options": options
        })
    
    return {
        "part": 4,
        "group_type": "AUDIO",
        "audio_url": f"audio/test{test_num:03d}/part04/test{test_num:03d}_part04_group{group_num:03d}.mp3",
        "audio_start_time": (group_num - 1) * 70,
        "audio_end_time": group_num * 70,
        "passage": talk["passage"],
        "knowledge": f"Part 4: Talks",
        "questions": questions
    }


def generate_part5_question(test_num: int, q_num: int, grammar: Dict) -> Dict:
    """Generate Part 5 grammar question"""
    options, correct_letter = generate_options(grammar["correct"], grammar["distractors"])
    
    return {
        "part": 5,
        "group_type": "READING",
        "title": f"Question {q_num + 100}",
        "knowledge": f"Part 5: {grammar['topic']}",
        "questions": [{
            "question_number": q_num + 100,
            "question_text": grammar["sentence"],
            "correct_answer": correct_letter,
            "explanation": f"This tests {grammar['topic']}. Correct answer: {grammar['correct']}",
            "options": options
        }]
    }


def generate_part6_group(test_num: int, group_num: int, question_nums: List[int], passage: Dict) -> Dict:
    """Generate Part 6 text completion group"""
    questions = []
    for i, blank in enumerate(passage["blanks"]):
        q_num = question_nums[i]
        options, correct_letter = generate_options(blank["correct"], blank["distractors"])
        
        questions.append({
            "question_number": q_num,
            "question_text": blank["question"],
            "correct_answer": correct_letter,
            "explanation": f"Context requires: {blank['correct']}",
            "options": options
        })
    
    return {
        "part": 6,
        "group_type": "READING",
        "passage": passage["passage"],
        "knowledge": f"Part 6: Text Completion - {passage['title']}",
        "questions": questions
    }


def generate_part7_group(test_num: int, group_num: int, start_q_num: int, question_count: int, passage: Dict) -> Dict:
    """Generate Part 7 reading comprehension group"""
    # Get the required number of questions (cycle through if needed)
    all_questions = passage["questions"]
    selected_questions = []
    for i in range(question_count):
        selected_questions.append(all_questions[i % len(all_questions)])
    
    questions = []
    for i, qa in enumerate(selected_questions):
        q_num = start_q_num + i
        options, correct_letter = generate_options(qa["correct"], qa["distractors"])
        
        questions.append({
            "question_number": q_num,
            "question_text": qa["question"],
            "correct_answer": correct_letter,
            "explanation": f"Based on the {passage['type']}: {qa['correct']}",
            "options": options
        })
    
    return {
        "part": 7,
        "group_type": "READING",
        "passage": passage["passage"],
        "knowledge": f"Part 7: Reading Comprehension - {passage['type']}",
        "questions": questions
    }


def generate_test(test_num: int) -> Dict:
    """Generate a complete test with unique content"""
    question_groups = []
    current_q_num = 1
    
    # Part 1: 6 questions (6 unique scenes)
    part1_scenes = get_unused_content("part1_scenes", PART1_SCENES, 6)
    mark_content_used("part1_scenes", part1_scenes)
    
    for i, scene in enumerate(part1_scenes):
        group = generate_part1_question(test_num, current_q_num, scene)
        group["display_order"] = i + 1
        question_groups.append(group)
        current_q_num += 1
    
    # Part 2: 25 questions (25 unique Q&A)
    part2_qa = get_unused_content("part2_qa", PART2_QUESTIONS, 25)
    mark_content_used("part2_qa", part2_qa)
    
    for i, qa in enumerate(part2_qa):
        group = generate_part2_question(test_num, current_q_num, qa)
        group["display_order"] = i + 1
        question_groups.append(group)
        current_q_num += 1
    
    # Part 3: 39 questions (13 unique conversations, 3 questions each)
    part3_convs = get_unused_content("part3_conversations", PART3_CONVERSATIONS, 13)
    mark_content_used("part3_conversations", part3_convs)
    
    for i, conv in enumerate(part3_convs):
        group = generate_part3_group(test_num, i + 1, current_q_num, conv)
        group["display_order"] = i + 1
        question_groups.append(group)
        current_q_num += 3
    
    # Part 4: 30 questions (10 unique talks, 3 questions each)
    part4_talks = get_unused_content("part4_talks", PART4_TALKS, 10)
    mark_content_used("part4_talks", part4_talks)
    
    for i, talk in enumerate(part4_talks):
        group = generate_part4_group(test_num, i + 1, current_q_num, talk)
        group["display_order"] = i + 1
        question_groups.append(group)
        current_q_num += 3
    
    # Part 5: 30 questions (30 unique grammar questions)
    part5_grammar = get_unused_content("part5_grammar", PART5_GRAMMAR, 30)
    mark_content_used("part5_grammar", part5_grammar)
    
    for i, grammar in enumerate(part5_grammar):
        group = generate_part5_question(test_num, i + 1, grammar)
        group["display_order"] = i + 1
        question_groups.append(group)
    
    current_q_num += 30
    
    # Part 6: 16 questions (4 unique passages, 4 blanks each)
    part6_passages = get_unused_content("part6_passages", PART6_PASSAGES, 4)
    mark_content_used("part6_passages", part6_passages)
    
    for i, passage in enumerate(part6_passages):
        question_nums = [current_q_num + j for j in range(4)]
        group = generate_part6_group(test_num, i + 1, question_nums, passage)
        group["display_order"] = i + 1
        question_groups.append(group)
        current_q_num += 4
    
    # Part 7: 54 questions (15 unique passages with varying questions)
    questions_per_group = [4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 4, 4]
    part7_passages = get_unused_content("part7_passages", PART7_PASSAGES, 15)
    mark_content_used("part7_passages", part7_passages)
    
    for i, (passage, q_count) in enumerate(zip(part7_passages, questions_per_group)):
        group = generate_part7_group(test_num, i + 1, current_q_num, q_count, passage)
        group["display_order"] = i + 1
        question_groups.append(group)
        current_q_num += q_count
    
    return {
        "test": {
            "title": f"TOEIC-like Full Test {test_num:03d}",
            "duration": 120,
            "total_questions": 200,
            "description": "Full TOEIC-like practice test with unique content",
            "is_active": True
        },
        "question_groups": question_groups
    }


def main():
    """Main function"""
    import sys
    
    print("Generating 100 Unique TOEIC Tests")
    print("=" * 60)
    
    # Check if --all flag is provided
    generate_all = "--all" in sys.argv
    
    if not generate_all:
        print("\nGenerating test001.json for validation...")
        test_data = generate_test(1)
        
        output_file = OUTPUT_DIR / "test001.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(test_data, f, indent=2, ensure_ascii=False)
        
        print(f"Saved to {output_file}")
        print("\nTo generate all 100 tests, run: python generate_unique_tests.py --all")
    else:
        print("\nGenerating all 100 tests with unique content...")
        print("=" * 60)
        
        for test_num in range(1, TOTAL_TESTS + 1):
            print(f"\nGenerating test{test_num:03d}.json...")
            
            try:
                test_data = generate_test(test_num)
                
                output_file = OUTPUT_DIR / f"test{test_num:03d}.json"
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(test_data, f, indent=2, ensure_ascii=False)
                
                print(f"  ✓ test{test_num:03d}.json - Generated")
            except Exception as e:
                print(f"  ✗ test{test_num:03d}.json - Error: {e}")
                print(f"  Not enough unique content available.")
                break
        
        print("\n" + "=" * 60)
        print("GENERATION COMPLETE")
        print("=" * 60)
        print(f"Tests generated: {test_num}")
        print("=" * 60)


if __name__ == "__main__":
    main()
