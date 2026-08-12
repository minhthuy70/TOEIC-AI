#!/usr/bin/env python3
"""
TOEIC-like Test Generator with Real Content
Generates 100 full TOEIC-like tests with actual TOEIC-style content (no placeholders)
"""

import json
import random
from pathlib import Path
from typing import List, Dict, Tuple

SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR.parent / "data/tests"
TOTAL_TESTS = 100

# Real TOEIC content databases
PART1_SCENES = [
    {
        "description": "A man is working at a computer in an office cubicle.",
        "correct": "The man is working at his desk.",
        "distractors": [
            "The man is having a meeting with colleagues.",
            "The man is eating lunch in the cafeteria.",
            "The man is standing by the window."
        ]
    },
    {
        "description": "Two women are shaking hands in a conference room.",
        "correct": "The women are greeting each other.",
        "distractors": [
            "The women are arguing about a project.",
            "The women are packing boxes.",
            "The women are sitting at their desks."
        ]
    },
    {
        "description": "People are sitting at tables in a restaurant.",
        "correct": "The customers are dining at the restaurant.",
        "distractors": [
            "The people are working in an office.",
            "The people are waiting in a lobby.",
            "The people are shopping in a store."
        ]
    },
    {
        "description": "A woman is examining products on a store shelf.",
        "correct": "The woman is shopping for items.",
        "distractors": [
            "The woman is arranging merchandise.",
            "The woman is cleaning the shelves.",
            "The woman is leaving the store."
        ]
    },
    {
        "description": "Construction workers are wearing safety helmets at a building site.",
        "correct": "The workers are building a structure.",
        "distractors": [
            "The workers are having a picnic.",
            "The workers are in a hospital.",
            "The workers are swimming in a pool."
        ]
    },
    {
        "description": "Passengers are checking in at an airport counter.",
        "correct": "The travelers are preparing for their flight.",
        "distractors": [
            "The passengers are boarding a bus.",
            "The people are at a train station.",
            "The travelers are at a hotel reception."
        ]
    },
    {
        "description": "A chef is cooking in a restaurant kitchen.",
        "correct": "The chef is preparing food.",
        "distractors": [
            "The chef is serving customers.",
            "The chef is cleaning the kitchen.",
            "The chef is eating a meal."
        ]
    },
    {
        "description": "Students are sitting in a classroom with books open.",
        "correct": "The students are attending a class.",
        "distractors": [
            "The students are playing sports.",
            "The students are at a library.",
            "The students are having lunch."
        ]
    },
    {
        "description": "People are walking through a park with trees.",
        "correct": "The people are enjoying outdoor recreation.",
        "distractors": [
            "The people are shopping at a mall.",
            "The people are working in an office.",
            "The people are driving cars."
        ]
    },
    {
        "description": "A delivery person is carrying packages to a door.",
        "correct": "The delivery person is dropping off packages.",
        "distractors": [
            "The person is picking up mail.",
            "The person is cleaning the door.",
            "The person is fixing the lock."
        ]
    },
    {
        "description": "Doctors are examining a patient in a hospital room.",
        "correct": "The medical staff are treating a patient.",
        "distractors": [
            "The doctors are having a meeting.",
            "The people are at a restaurant.",
            "The staff are cleaning the room."
        ]
    },
    {
        "description": "Employees are arranging merchandise in a retail store.",
        "correct": "The workers are stocking shelves.",
        "distractors": [
            "The employees are shopping.",
            "The workers are cleaning the floor.",
            "The people are having a party."
        ]
    }
]

PART2_QUESTIONS = [
    {
        "question": "Where is the meeting being held?",
        "correct": "In the conference room on the third floor.",
        "distractors": [
            "At the hotel downtown.",
            "In the cafeteria at noon.",
            "At the client's office."
        ]
    },
    {
        "question": "When should the report be submitted?",
        "correct": "By Friday afternoon.",
        "distractors": [
            "Next Monday morning.",
            "Before the end of the day.",
            "At the beginning of next week."
        ]
    },
    {
        "question": "How many people will attend the training?",
        "correct": "About twenty-five participants.",
        "distractors": [
            "Only five employees.",
            "More than fifty people.",
            "Exactly ten staff members."
        ]
    },
    {
        "question": "Why is the office closed today?",
        "correct": "Due to the power outage.",
        "distractors": [
            "Because it's a holiday.",
            "For renovation work.",
            "The manager is sick."
        ]
    },
    {
        "question": "What time does the store open?",
        "correct": "At nine o'clock in the morning.",
        "distractors": [
            "At eight in the evening.",
            "Around noon.",
            "At midnight."
        ]
    },
    {
        "question": "Who is responsible for the project?",
        "correct": "Ms. Johnson from the marketing department.",
        "distractors": [
            "The IT department.",
            "Mr. Smith in accounting.",
            "The external consultant."
        ]
    },
    {
        "question": "How much does the product cost?",
        "correct": "Fifty dollars plus tax.",
        "distractors": [
            "It's completely free.",
            "Over two hundred dollars.",
            "The price hasn't been determined."
        ]
    },
    {
        "question": "Where should I send the document?",
        "correct": "To the email address listed in the message.",
        "distractors": [
            "By regular mail to the main office.",
            "Bring it to the reception desk.",
            "Fax it to the number on the website."
        ]
    },
    {
        "question": "What is the weather like today?",
        "correct": "It's sunny with a light breeze.",
        "distractors": [
            "Heavy rain is expected.",
            "It's snowing heavily.",
            "There's a severe storm warning."
        ]
    },
    {
        "question": "When will the package arrive?",
        "correct": "Within two business days.",
        "distractors": [
            "Next month.",
            "In about five minutes.",
            "It was delivered yesterday."
        ]
    }
]

PART3_CONVERSATIONS = [
    {
        "transcript": """Man: I need to schedule a meeting with the design team about the new product launch.
Woman: When were you thinking of having it?
Man: Sometime next week would be ideal. Maybe Tuesday or Wednesday afternoon.
Woman: Let me check their availability. I'll get back to you by the end of today.""",
        "questions": [
            {
                "question": "What does the man want to do?",
                "correct": "Arrange a meeting with the design team",
                "distractors": [
                    "Launch a new product",
                    "Check the team's availability",
                    "Review the design team's work"
                ]
            },
            {
                "question": "When does the man prefer to meet?",
                "correct": "Next week on Tuesday or Wednesday afternoon",
                "distractors": [
                    "This week on Friday",
                    "Next Monday morning",
                    "At the end of today"
                ]
            },
            {
                "question": "What will the woman do?",
                "correct": "Check the team's schedule",
                "distractors": [
                    "Attend the meeting herself",
                    "Cancel the meeting",
                    "Reschedule for next month"
                ]
            }
        ]
    },
    {
        "transcript": """Woman: Have you finished preparing the presentation for the client meeting?
Man: I'm almost done. I just need to add the sales figures from last quarter.
Woman: The meeting is at 2 PM, so you have about two hours.
Man: That should be plenty of time. I'll have it ready by noon.""",
        "questions": [
            {
                "question": "What is the man working on?",
                "correct": "A presentation for a client meeting",
                "distractors": [
                    "Sales figures for the quarter",
                    "A report for the client",
                    "Meeting arrangements"
                ]
            },
            {
                "question": "When is the client meeting scheduled?",
                "correct": "At 2 PM",
                "distractors": [
                    "In two hours",
                    "By noon",
                    "Next week"
                ]
            },
            {
                "question": "What does the man still need to add?",
                "correct": "Sales figures from the last quarter",
                "distractors": [
                    "Client information",
                    "Meeting notes",
                    "Quarterly projections"
                ]
            }
        ]
    },
    {
        "transcript": """Man: The printer in the main office isn't working properly.
Woman: Have you tried restarting it?
Man: Yes, but it still shows an error message.
Woman: I'll call technical support. They should be able to fix it.""",
        "questions": [
            {
                "question": "What is the problem?",
                "correct": "The printer is not functioning correctly",
                "distractors": [
                    "The computer is broken",
                    "Technical support is unavailable",
                    "The error message is unclear"
                ]
            },
            {
                "question": "What has the man already tried?",
                "correct": "Restarting the printer",
                "distractors": [
                    "Calling technical support",
                    "Reading the manual",
                    "Checking the connections"
                ]
            },
            {
                "question": "What will the woman do?",
                "correct": "Contact technical support",
                "distractors": [
                    "Fix the printer herself",
                    "Buy a new printer",
                    "Ask the man to try again"
                ]
            }
        ]
    },
    {
        "transcript": """Woman: I'm planning to order lunch for the team meeting.
Man: How many people will be there?
Woman: About twelve people are attending.
Man: You should order from the Italian restaurant. They have good group packages.""",
        "questions": [
            {
                "question": "What is the woman planning to do?",
                "correct": "Order food for a team meeting",
                "distractors": [
                    "Reserve a restaurant table",
                    "Plan a team outing",
                    "Organize a party"
                ]
            },
            {
                "question": "How many people will attend the meeting?",
                "correct": "Approximately twelve",
                "distractors": [
                    "Less than five",
                    "Exactly twenty",
                    "More than thirty"
                ]
            },
            {
                "question": "What restaurant does the man recommend?",
                "correct": "The Italian restaurant",
                "distractors": [
                    "A fast food place",
                    "The Chinese restaurant",
                    "A local café"
                ]
            }
        ]
    },
    {
        "transcript": """Man: The quarterly sales report shows a 15% increase compared to last year.
Woman: That's excellent news. Which region performed the best?
Man: The Asian market had the highest growth, followed by Europe.
Woman: We should focus more resources on these markets in the coming quarter.""",
        "questions": [
            {
                "question": "What does the sales report indicate?",
                "correct": "A 15% increase compared to last year",
                "distractors": [
                    "A decrease in sales",
                    "No change from last year",
                    "A 50% increase"
                ]
            },
            {
                "question": "Which region had the best performance?",
                "correct": "The Asian market",
                "distractors": [
                    "The European market",
                    "The North American market",
                    "The South American market"
                ]
            },
            {
                "question": "What does the woman suggest?",
                "correct": "Allocating more resources to successful markets",
                "distractors": [
                    "Reducing focus on Asia",
                    "Closing the European office",
                    "Changing the sales strategy"
                ]
            }
        ]
    }
]

PART4_TALKS = [
    {
        "transcript": """Good morning, everyone. I'd like to make an announcement about the upcoming company retreat. The retreat will be held at the Mountain View Resort from November 15th to 17th. All employees are encouraged to attend as it's a great opportunity for team building and strategic planning. The company will cover all expenses including accommodation, meals, and transportation. Please register by October 31st so we can finalize the arrangements. If you have any dietary restrictions or special requirements, please let HR know when you register. We're looking forward to a productive and enjoyable retreat.""",
        "questions": [
            {
                "question": "When will the company retreat take place?",
                "correct": "November 15th to 17th",
                "distractors": [
                    "October 15th to 17th",
                    "November 1st to 3rd",
                    "December 15th to 17th"
                ]
            },
            {
                "question": "Where will the retreat be held?",
                "correct": "At Mountain View Resort",
                "distractors": [
                    "At the company headquarters",
                    "At a beach resort",
                    "At a city hotel"
                ]
            },
            {
                "question": "What is the deadline for registration?",
                "correct": "October 31st",
                "distractors": [
                    "November 1st",
                    "October 15th",
                    "November 15th"
                ]
            }
        ]
    },
    {
        "transcript": """Attention shoppers. Today only, all electronics items in the store are 20% off. This includes laptops, tablets, smartphones, and accessories. Additionally, if you spend over $500, you'll receive a free wireless earbuds set. The sale ends at closing time at 9 PM. Don't miss this opportunity to save on your favorite tech products. Remember, this offer is valid only for in-store purchases and cannot be combined with other promotions. Thank you for shopping with us.""",
        "questions": [
            {
                "question": "What is being advertised?",
                "correct": "A 20% discount on electronics",
                "distractors": [
                    "Free earbuds for everyone",
                    "A store closing sale",
                    "Online shopping promotion"
                ]
            },
            {
                "question": "What additional benefit is mentioned?",
                "correct": "Free wireless earbuds for purchases over $500",
                "distractors": [
                    "Free shipping on all orders",
                    "50% off on accessories",
                    "A gift card with purchase"
                ]
            },
            {
                "question": "When does the sale end?",
                "correct": "At 9 PM today",
                "distractors": [
                    "Tomorrow at closing time",
                    "At midnight tonight",
                    "Next week"
                ]
            }
        ]
    },
    {
        "transcript": """This is a weather update for the metropolitan area. Expect clear skies throughout the day with temperatures reaching 25 degrees Celsius. Light winds from the northeast at 10 to 15 kilometers per hour. The evening will be pleasant with temperatures dropping to around 18 degrees. No precipitation is expected for the next 24 hours. Tomorrow, we may see some cloud cover with a slight chance of light rain in the afternoon. Overall, it's a great day for outdoor activities. Enjoy your day.""",
        "questions": [
            {
                "question": "What is the expected high temperature?",
                "correct": "25 degrees Celsius",
                "distractors": [
                    "18 degrees Celsius",
                    "30 degrees Celsius",
                    "20 degrees Celsius"
                ]
            },
            {
                "question": "What is the weather forecast for tomorrow?",
                "correct": "Cloudy with a chance of light rain",
                "distractors": [
                    "Sunny and clear",
                    "Heavy rain expected",
                    "Snow in the afternoon"
                ]
            },
            {
                "question": "What is the wind direction?",
                "correct": "From the northeast",
                "distractors": [
                    "From the southwest",
                    "From the northwest",
                    "From the southeast"
                ]
            }
        ]
    },
    {
        "transcript": """Welcome to the annual shareholders meeting. I'm pleased to report that our company has had a successful year. Revenue increased by 12% to reach $50 million, and net profit rose to $8 million. Our market share has grown from 15% to 18%. We've also launched three new products that have been well-received in the market. Looking ahead, we plan to expand into two new international markets next year. We're confident that our continued focus on innovation and customer satisfaction will drive further growth. Thank you for your continued support.""",
        "questions": [
            {
                "question": "What was the company's revenue?",
                "correct": "$50 million",
                "distractors": [
                    "$8 million",
                    "$12 million",
                    "$18 million"
                ]
            },
            {
                "question": "How much did the market share increase?",
                "correct": "From 15% to 18%",
                "distractors": [
                    "From 12% to 15%",
                    "From 10% to 18%",
                    "From 18% to 20%"
                ]
            },
            {
                "question": "What are the company's plans for next year?",
                "correct": "Expand into two new international markets",
                "distractors": [
                    "Launch five new products",
                    "Reduce market share",
                    "Decrease revenue targets"
                ]
            }
        ]
    },
    {
        "transcript": """This is an important safety announcement for all building occupants. Tomorrow morning, there will be a scheduled fire drill starting at 10 AM. The drill will last approximately 15 minutes. When the alarm sounds, please proceed to the nearest emergency exit and gather at the designated assembly point in the parking lot. Do not use the elevators during the drill. If you have any mobility issues, please inform building management so we can provide assistance. This drill is required by safety regulations and helps ensure everyone knows the proper evacuation procedures. Thank you for your cooperation.""",
        "questions": [
            {
                "question": "When will the fire drill take place?",
                "correct": "Tomorrow morning at 10 AM",
                "distractors": [
                    "This afternoon",
                    "Tomorrow at 2 PM",
                    "Next week"
                ]
            },
            {
                "question": "Where should people gather?",
                "correct": "At the assembly point in the parking lot",
                "distractors": [
                    "In the lobby",
                    "On the roof",
                    "In their offices"
                ]
            },
            {
                "question": "What should people NOT do during the drill?",
                "correct": "Use the elevators",
                "distractors": [
                    "Proceed to emergency exits",
                    "Follow evacuation procedures",
                    "Inform building management"
                ]
            }
        ]
    }
]

PART5_GRAMMAR = [
    {
        "sentence": "The company _____ its annual report last week.",
        "correct": "released",
        "distractors": ["release", "releasing", "releases"],
        "topic": "past tense"
    },
    {
        "sentence": "All employees _____ to attend the mandatory training session.",
        "correct": "are required",
        "distractors": ["require", "required", "requiring"],
        "topic": "passive voice"
    },
    {
        "sentence": "The new software is _____ user-friendly than the previous version.",
        "correct": "more",
        "distractors": ["most", "much", "many"],
        "topic": "comparatives"
    },
    {
        "sentence": "We look forward to _____ from you soon.",
        "correct": "hearing",
        "distractors": ["hear", "heard", "hears"],
        "topic": "gerunds"
    },
    {
        "sentence": "The meeting is scheduled _____ Monday at 2 PM.",
        "correct": "for",
        "distractors": ["in", "on", "at"],
        "topic": "prepositions"
    },
    {
        "sentence": "_____ the heavy rain, the event was held outdoors.",
        "correct": "Despite",
        "distractors": ["Although", "Though", "However"],
        "topic": "conjunctions"
    },
    {
        "sentence": "The manager, _____ has been with the company for 20 years, is retiring.",
        "correct": "who",
        "distractors": ["which", "that", "whom"],
        "topic": "relative clauses"
    },
    {
        "sentence": "If I _____ more time, I would have completed the project.",
        "correct": "had",
        "distractors": ["have", "would have", "had had"],
        "topic": "conditionals"
    },
    {
        "sentence": "The documents _____ on the desk belong to the accounting department.",
        "correct": "lying",
        "distractors": ["lay", "laid", "lie"],
        "topic": "confusing verbs"
    },
    {
        "sentence": "Neither the manager nor the employees _____ aware of the change.",
        "correct": "were",
        "distractors": ["was", "is", "are"],
        "topic": "subject-verb agreement"
    },
    {
        "sentence": "The proposal was _____ approved by the board of directors.",
        "correct": "unanimously",
        "distractors": ["unanimous", "unanimity", "unanimousness"],
        "topic": "adverbs"
    },
    {
        "sentence": "We need to _____ a decision by the end of the week.",
        "correct": "make",
        "distractors": ["do", "take", "get"],
        "topic": "collocations"
    },
    {
        "sentence": "The customer service representative was very _____ in handling the complaint.",
        "correct": "helpful",
        "distractors": ["help", "helping", "helplessly"],
        "topic": "adjectives"
    },
    {
        "sentence": "By the time you arrive, the meeting _____ already started.",
        "correct": "will have",
        "distractors": ["will", "has", "had"],
        "topic": "future perfect"
    },
    {
        "sentence": "The company's profits have increased _____ since the merger.",
        "correct": "significantly",
        "distractors": ["significant", "significance", "signify"],
        "topic": "word forms"
    },
    {
        "sentence": "It is important that everyone _____ on time for the meeting.",
        "correct": "be",
        "distractors": ["is", "are", "were"],
        "topic": "subjunctive"
    },
    {
        "sentence": "The report _____ several recommendations for improvement.",
        "correct": "contains",
        "distractors": ["containing", "contain", "contained"],
        "topic": "verb forms"
    },
    {
        "sentence": "_____ of the employees have completed the training.",
        "correct": "Most",
        "distractors": ["Much", "Many", "More"],
        "topic": "quantifiers"
    },
    {
        "sentence": "The project was completed _____ than expected.",
        "correct": "sooner",
        "distractors": ["soon", "soonest", "soon as"],
        "topic": "comparatives"
    },
    {
        "sentence": "We _____ to inform you that your application has been rejected.",
        "correct": "regret",
        "distractors": ["regretful", "regretting", "regrets"],
        "topic": "vocabulary"
    },
    {
        "sentence": "The new policy will _____ effect next month.",
        "correct": "take",
        "distractors": ["make", "do", "get"],
        "topic": "collocations"
    },
    {
        "sentence": "She is responsible _____ managing the department's budget.",
        "correct": "for",
        "distractors": ["to", "with", "at"],
        "topic": "prepositions"
    },
    {
        "sentence": "The equipment needs to _____ before use.",
        "correct": "be calibrated",
        "distractors": ["calibrate", "calibrating", "calibrated"],
        "topic": "passive voice"
    },
    {
        "sentence": "_____ the bad weather, we decided to postpone the event.",
        "correct": "Due to",
        "distractors": ["Because", "Since", "As"],
        "topic": "prepositions"
    },
    {
        "sentence": "The committee will meet _____ Friday to discuss the proposal.",
        "correct": "on",
        "distractors": ["in", "at", "by"],
        "topic": "prepositions"
    },
    {
        "sentence": "The company has _____ a new marketing strategy.",
        "correct": "implemented",
        "distractors": ["implement", "implementing", "implementation"],
        "topic": "verb forms"
    },
    {
        "sentence": "The results were _____ than we had anticipated.",
        "correct": "better",
        "distractors": ["good", "best", "well"],
        "topic": "comparatives"
    },
    {
        "sentence": "We appreciate your _____ in this matter.",
        "correct": "assistance",
        "distractors": ["assist", "assisting", "assisted"],
        "topic": "noun forms"
    },
    {
        "sentence": "The contract will _____ for one year.",
        "correct": "remain valid",
        "distractors": ["remain validity", "remaining valid", "remains valid"],
        "topic": "verb phrases"
    },
    {
        "sentence": "Please _____ the form and return it to HR.",
        "correct": "complete",
        "distractors": ["completing", "completion", "completed"],
        "topic": "verb forms"
    }
]

PART6_PASSAGES = [
    {
        "title": "Office Memo",
        "passage": """MEMORANDUM

To: All Staff
From: Human Resources
Date: October 15, 2024
Subject: New Parking Policy

Effective November 1st, the company will implement a new parking policy. All employees must register their vehicles with the security office to receive a parking permit. Permits will be issued on a first-come, first-served basis. Visitors will be required to use the designated visitor parking area. Employees who fail to comply with this policy may face disciplinary action. Please contact HR if you have any questions.""",
        "blanks": [
            {
                "position": 131,
                "correct": "implement",
                "distractors": ["implementing", "implementation", "implements"],
                "question": "The company will _____ a new parking policy."
            },
            {
                "position": 132,
                "correct": "receive",
                "distractors": ["receiving", "received", "receives"],
                "question": "Employees must register to _____ a parking permit."
            },
            {
                "position": 133,
                "correct": "required",
                "distractors": ["require", "requiring", "requires"],
                "question": "Visitors will be _____ to use visitor parking."
            },
            {
                "position": 134,
                "correct": "comply",
                "distractors": ["complying", "complied", "complies"],
                "question": "Employees must _____ with this policy."
            }
        ]
    },
    {
        "title": "Email Announcement",
        "passage": """From: management@company.com
To: all_employees@company.com
Subject: Holiday Schedule

Dear Team,

The office will be closed for the upcoming holiday season from December 24th through January 1st. Regular business operations will resume on January 2nd. Employees who need to work during this period must obtain prior approval from their supervisors. Please ensure all urgent projects are completed before the holiday break. We wish everyone a happy and safe holiday season.

Best regards,
Management Team""",
        "blanks": [
            {
                "position": 141,
                "correct": "closed",
                "distractors": ["close", "closing", "closes"],
                "question": "The office will be _____ for the holiday season."
            },
            {
                "position": 142,
                "correct": "resume",
                "distractors": ["resuming", "resumed", "resumes"],
                "question": "Business operations will _____ on January 2nd."
            },
            {
                "position": 143,
                "correct": "obtain",
                "distractors": ["obtaining", "obtained", "obtains"],
                "question": "Employees must _____ prior approval to work."
            },
            {
                "position": 144,
                "correct": "ensure",
                "distractors": ["ensuring", "ensured", "ensures"],
                "question": "Please _____ all projects are completed."
            }
        ]
    },
    {
        "title": "Building Notice",
        "passage": """NOTICE

The building management will conduct routine maintenance on the elevators this weekend. Work will begin at 8 AM on Saturday and continue until 6 PM on Sunday. During this period, one elevator will remain operational for emergency use. Please use the stairs if possible. We apologize for any inconvenience and appreciate your patience. For emergencies, contact the building superintendent at extension 555.""",
        "blanks": [
            {
                "position": 151,
                "correct": "conduct",
                "distractors": ["conducting", "conducted", "conducts"],
                "question": "Management will _____ maintenance on elevators."
            },
            {
                "position": 152,
                "correct": "remain",
                "distractors": ["remaining", "remained", "remains"],
                "question": "One elevator will _____ operational."
            },
            {
                "position": 153,
                "correct": "possible",
                "distractors": ["possibly", "possibility", "possibilities"],
                "question": "Use the stairs if _____."
            },
            {
                "position": 154,
                "correct": "appreciate",
                "distractors": ["appreciating", "appreciated", "appreciates"],
                "question": "We _____ your patience."
            }
        ]
    },
    {
        "title": "Training Announcement",
        "passage": """Training Opportunity

The company is offering a professional development workshop on effective communication skills. The workshop will be held on November 20th from 9 AM to 4 PM in the main conference room. This training is mandatory for all new employees and highly recommended for existing staff. Lunch will be provided. Please register by November 15th by sending an email to the training department. Space is limited to 30 participants.""",
        "blanks": [
            {
                "position": 161,
                "correct": "offering",
                "distractors": ["offer", "offered", "offers"],
                "question": "The company is _____ a workshop."
            },
            {
                "position": 162,
                "correct": "mandatory",
                "distractors": ["mandatorily", "mandate", "mandating"],
                "question": "Training is _____ for new employees."
            },
            {
                "position": 163,
                "correct": "provided",
                "distractors": ["provide", "providing", "provides"],
                "question": "Lunch will be _____."
            },
            {
                "position": 164,
                "correct": "limited",
                "distractors": ["limit", "limiting", "limits"],
                "question": "Space is _____ to 30 participants."
            }
        ]
    }
]

PART7_PASSAGES = [
    {
        "type": "email",
        "passage": """From: sarah.johnson@techcorp.com
To: team@techcorp.com
Subject: Project Update

Dear Team,

I'm pleased to announce that the software development project is progressing according to schedule. The beta testing phase has been completed successfully, and we have received positive feedback from our test users. Based on this feedback, we have made several improvements to the user interface and performance.

The official launch is scheduled for December 1st. The marketing team has already begun promotional activities, and initial customer interest has been strong. We expect to achieve our sales targets for the first quarter.

Please continue to work diligently on your assigned tasks. If you encounter any issues, don't hesitate to contact me directly.

Best regards,
Sarah Johnson
Project Manager""",
        "questions": [
            {
                "question": "What is the purpose of this email?",
                "correct": "To provide a project status update",
                "distractors": [
                    "To announce a new project",
                    "To request additional resources",
                    "To schedule a team meeting"
                ]
            },
            {
                "question": "When is the official launch scheduled?",
                "correct": "December 1st",
                "distractors": [
                    "November 1st",
                    "January 1st",
                    "December 15th"
                ]
            },
            {
                "question": "What has been completed successfully?",
                "correct": "The beta testing phase",
                "distractors": [
                    "The marketing campaign",
                    "The sales targets",
                    "The user interface design"
                ]
            },
            {
                "question": "What has the marketing team begun?",
                "correct": "Promotional activities",
                "distractors": [
                    "Customer surveys",
                    "Product development",
                    "Staff training"
                ]
            }
        ]
    },
    {
        "type": "notice",
        "passage": """NOTICE

Building Maintenance Schedule

The building management team will conduct routine maintenance on the following dates:

- November 5-6: HVAC system inspection
- November 12-13: Fire alarm testing
- November 19-20: Elevator maintenance
- November 26-27: Electrical system check

During these periods, there may be temporary service interruptions. We apologize for any inconvenience and appreciate your patience. For emergencies, contact the 24-hour maintenance hotline at 555-0100.

Thank you for your cooperation.

Building Management Office""",
        "questions": [
            {
                "question": "What is the purpose of this notice?",
                "correct": "To inform about scheduled maintenance",
                "distractors": [
                    "To announce building closure",
                    "To request maintenance fees",
                    "To report emergency procedures"
                ]
            },
            {
                "question": "When will the fire alarm testing occur?",
                "correct": "November 12-13",
                "distractors": [
                    "November 5-6",
                    "November 19-20",
                    "November 26-27"
                ]
            },
            {
                "question": "What should residents do during maintenance?",
                "correct": "Expect temporary service interruptions",
                "distractors": [
                    "Leave the building",
                    "Contact the police",
                    "Pay additional fees"
                ]
            }
        ]
    },
    {
        "type": "advertisement",
        "passage": """Special Offer!

Metro Electronics Clearance Sale

All laptops and tablets 20-40% off!

Selected models:
- UltraBook Pro: Was $899, Now $649
- Tablet Air: Was $499, Now $379
- Gaming Laptop X: Was $1,299, Now $899

Sale ends November 30th.

Visit any Metro Electronics store or shop online at www.metroelectronics.com

Free shipping on orders over $50!

Limited quantities available. While supplies last.""",
        "questions": [
            {
                "question": "What is being advertised?",
                "correct": "A clearance sale on electronics",
                "distractors": [
                    "A new product launch",
                    "A store opening",
                    "A repair service"
                ]
            },
            {
                "question": "What is the discounted price of the UltraBook Pro?",
                "correct": "$649",
                "distractors": [
                    "$899",
                    "$379",
                    "$899"
                ]
            },
            {
                "question": "When does the sale end?",
                "correct": "November 30th",
                "distractors": [
                    "November 15th",
                    "December 1st",
                    "December 31st"
                ]
            },
            {
                "question": "What is offered for orders over $50?",
                "correct": "Free shipping",
                "distractors": [
                    "Additional discount",
                    "Extended warranty",
                    "Free accessories"
                ]
            }
        ]
    },
    {
        "type": "memo",
        "passage": """MEMORANDUM

To: Department Managers
From: Finance Department
Date: October 20, 2024
Subject: Budget Review

All department managers are required to submit their quarterly budget reports by October 31st. Reports should include actual spending versus budgeted amounts for the previous quarter, along with projections for the next quarter.

A budget review meeting will be held on November 5th at 10 AM in Conference Room B. Please bring your reports and be prepared to discuss any significant variances.

If you need assistance with report preparation, contact the Finance Department at extension 234.""",
        "questions": [
            {
                "question": "What is the deadline for submitting budget reports?",
                "correct": "October 31st",
                "distractors": [
                    "October 20th",
                    "November 5th",
                    "November 1st"
                ]
            },
            {
                "question": "When will the budget review meeting be held?",
                "correct": "November 5th at 10 AM",
                "distractors": [
                    "October 31st at 2 PM",
                    "November 1st at 10 AM",
                    "November 5th at 2 PM"
                ]
            },
            {
                "question": "What should managers bring to the meeting?",
                "correct": "Their budget reports",
                "distractors": [
                    "Their department staff",
                    "Financial projections only",
                    "Previous year's reports"
                ]
            }
        ]
    },
    {
        "type": "article",
        "passage": """Company Newsletter

Monthly Update - October 2024

Employee Recognition Program

We are pleased to announce the winners of our quarterly employee recognition program:

- Outstanding Performance: Maria Santos (Sales Department)
- Team Leadership: James Chen (Engineering Department)
- Customer Service Excellence: Lisa Park (Support Department)

Congratulations to all winners! Each recipient will receive a certificate and a $500 gift card.

Upcoming Events
- Annual Holiday Party: December 15th
- Training Workshop: November 8th
- Health Fair: November 22nd

Please contact HR for more information about any upcoming events.""",
        "questions": [
            {
                "question": "Who won the Outstanding Performance award?",
                "correct": "Maria Santos",
                "distractors": [
                    "James Chen",
                    "Lisa Park",
                    "John Smith"
                ]
            },
            {
                "question": "What do the award recipients receive?",
                "correct": "A certificate and a $500 gift card",
                "distractors": [
                    "A promotion and bonus",
                    "A paid vacation",
                    "A company car"
                ]
            },
            {
                "question": "When is the Annual Holiday Party?",
                "correct": "December 15th",
                "distractors": [
                    "November 8th",
                    "November 22nd",
                    "December 1st"
                ]
            },
            {
                "question": "What is the purpose of this newsletter?",
                "correct": "To announce award winners and upcoming events",
                "distractors": [
                    "To request employee feedback",
                    "To announce company policies",
                    "To report financial results"
                ]
            }
        ]
    },
    {
        "type": "schedule",
        "passage": """Conference Schedule

Day 1 - November 10th
9:00 AM - Opening Ceremony
10:30 AM - Keynote Speech
12:00 PM - Lunch Break
1:30 PM - Workshop Session A
3:00 PM - Workshop Session B
4:30 PM - Networking Event

Day 2 - November 11th
9:00 AM - Panel Discussion
10:30 AM - Presentation Session
12:00 PM - Lunch Break
1:30 PM - Workshop Session C
3:00 PM - Closing Ceremony
4:00 PM - Conference Ends

All sessions will be held in the Main Auditorium. Please arrive 15 minutes early for each session.""",
        "questions": [
            {
                "question": "When does the conference begin?",
                "correct": "November 10th at 9:00 AM",
                "distractors": [
                    "November 11th at 9:00 AM",
                    "November 10th at 10:30 AM",
                    "November 11th at 10:30 AM"
                ]
            },
            {
                "question": "What happens on Day 1 at 1:30 PM?",
                "correct": "Workshop Session A",
                "distractors": [
                    "Keynote Speech",
                    "Panel Discussion",
                    "Networking Event"
                ]
            },
            {
                "question": "When does the conference end?",
                "correct": "November 11th at 4:00 PM",
                "distractors": [
                    "November 10th at 4:30 PM",
                    "November 11th at 3:00 PM",
                    "November 10th at 5:00 PM"
                ]
            }
        ]
    },
    {
        "type": "form",
        "passage": """EMPLOYEE ABSENCE REQUEST FORM

Employee Information
Name: _________________________
Department: ___________________
Employee ID: __________________

Absence Details
Type of Absence: [ ] Sick Leave [ ] Personal [ ] Vacation
Start Date: ____________________
End Date: ______________________
Total Days: ___________________

Reason for Absence:
_______________________________________________________________
_______________________________________________________________

Supervisor Approval
Signature: _____________________
Date: __________________________

HR Department Approval
Signature: _____________________
Date: __________________________

Submit this form to HR at least 3 days before the absence.""",
        "questions": [
            {
                "question": "What is this form used for?",
                "correct": "To request employee absence",
                "distractors": [
                    "To report attendance",
                    "To request overtime",
                    "To submit expenses"
                ]
            },
            {
                "question": "How many types of absence are listed?",
                "correct": "Three",
                "distractors": [
                    "Two",
                    "Four",
                    "Five"
                ]
            },
            {
                "question": "When should this form be submitted?",
                "correct": "At least 3 days before the absence",
                "distractors": [
                    "On the day of absence",
                    "After returning from absence",
                    "One week before absence"
                ]
            }
        ]
    },
    {
        "type": "message",
        "passage": """VOICEMAIL MESSAGE

"Hello, this is Michael Brown from Apex Solutions. I'm calling regarding the proposal we sent last week. I'd like to schedule a follow-up meeting to discuss the details and answer any questions you might have. Please give me a call back at your earliest convenience. My number is 555-0199. If I don't answer, please leave a message with your availability. Looking forward to hearing from you. Thank you.""",
        "questions": [
            {
                "question": "Why is Michael Brown calling?",
                "correct": "To schedule a follow-up meeting about a proposal",
                "distractors": [
                    "To deliver a new proposal",
                    "To cancel a meeting",
                    "To request payment"
                ]
            },
            {
                "question": "What should the recipient do?",
                "correct": "Call Michael Brown back",
                "distractors": [
                    "Send an email",
                    "Wait for another call",
                    "Ignore the message"
                ]
            },
            {
                "question": "What is Michael Brown's phone number?",
                "correct": "555-0199",
                "distractors": [
                    "555-0198",
                    "555-0190",
                    "555-0197"
                ]
            }
        ]
    },
    {
        "type": "letter",
        "passage": """Dear Customer,

Thank you for your recent purchase with our company. We value your business and want to ensure your complete satisfaction with our products.

If you experience any issues with your purchase, please contact our customer service department within 30 days of purchase. Our team is available Monday through Friday, 8 AM to 6 PM, to assist you with any concerns.

As a token of our appreciation, please find enclosed a 10% discount coupon for your next purchase. This coupon is valid for 60 days from the date of this letter.

We look forward to serving you again in the future.

Sincerely,
Customer Relations Team
ABC Corporation""",
        "questions": [
            {
                "question": "What is the purpose of this letter?",
                "correct": "To thank the customer and offer support",
                "distractors": [
                    "To request a review",
                    "To announce a sale",
                    "To collect payment"
                ]
            },
            {
                "question": "How long is the discount coupon valid?",
                "correct": "60 days",
                "distractors": [
                    "30 days",
                    "90 days",
                    "One year"
                ]
            },
            {
                "question": "When is customer service available?",
                "correct": "Monday through Friday, 8 AM to 6 PM",
                "distractors": [
                    "24 hours a day",
                    "Weekends only",
                    "9 AM to 5 PM daily"
                ]
            },
            {
                "question": "What is enclosed with the letter?",
                "correct": "A 10% discount coupon",
                "distractors": [
                    "A refund check",
                    "A product catalog",
                    "A warranty certificate"
                ]
            }
        ]
    },
    {
        "type": "report",
        "passage": """Quarterly Sales Report

Q3 2024 Performance Summary

Total Revenue: $2.5 million
Growth Rate: 12% compared to Q2 2024
Top Selling Products:
1. Product A: $800,000
2. Product B: $650,000
3. Product C: $450,000

Regional Performance:
- North America: $1.2 million
- Europe: $800,000
- Asia: $500,000

Key Achievements:
- Launched three new products
- Expanded distribution to 5 new markets
- Increased customer retention by 8%

Challenges:
- Supply chain delays affected delivery times
- Increased competition in Asian market

Outlook for Q4:
- Projected revenue: $2.8 million
- Focus on improving delivery times
- Strengthen market position in Asia""",
        "questions": [
            {
                "question": "What was the total revenue in Q3 2024?",
                "correct": "$2.5 million",
                "distractors": [
                    "$2.8 million",
                    "$2.0 million",
                    "$3.0 million"
                ]
            },
            {
                "question": "Which region had the highest revenue?",
                "correct": "North America",
                "distractors": [
                    "Europe",
                    "Asia",
                    "South America"
                ]
            },
            {
                "question": "What was the growth rate compared to Q2?",
                "correct": "12%",
                "distractors": [
                    "8%",
                    "15%",
                    "10%"
                ]
            },
            {
                "question": "What is the projected revenue for Q4?",
                "correct": "$2.8 million",
                "distractors": [
                    "$2.5 million",
                    "$3.0 million",
                    "$3.5 million"
                ]
            }
        ]
    },
    {
        "type": "announcement",
        "passage": """IMPORTANT ANNOUNCEMENT

Change in Office Hours

Effective November 1st, our office hours will be changing:

New Hours:
Monday - Friday: 8:30 AM - 5:30 PM
Saturday: 9:00 AM - 1:00 PM
Sunday: Closed

This change is being implemented to better serve our customers and provide more convenient hours. The Saturday hours are being added based on customer feedback requesting weekend availability.

All services will continue to be available during these new hours. Please update your records accordingly.

If you have any questions about this change, please contact our customer service department.

Thank you for your continued business.""",
        "questions": [
            {
                "question": "When will the new office hours take effect?",
                "correct": "November 1st",
                "distractors": [
                    "October 1st",
                    "December 1st",
                    "Immediately"
                ]
            },
            {
                "question": "What is the new Saturday schedule?",
                "correct": "9:00 AM - 1:00 PM",
                "distractors": [
                    "8:30 AM - 5:30 PM",
                    "10:00 AM - 2:00 PM",
                    "Closed all day"
                ]
            },
            {
                "question": "Why is this change being made?",
                "correct": "To better serve customers based on feedback",
                "distractors": [
                    "To reduce operating costs",
                    "Due to staff shortage",
                    "Because of new regulations"
                ]
            }
        ]
    },
    {
        "type": "invoice",
        "passage": """INVOICE

Invoice Number: INV-2024-1234
Date: October 15, 2024
Due Date: November 15, 2024

Bill To:
ABC Corporation
123 Business Street
City, State 12345

Item Description Quantity Unit Price Total
Product A 10 $50.00 $500.00
Product B 5 $75.00 $375.00
Service Fee 1 $100.00 $100.00

Subtotal: $975.00
Tax (8%): $78.00
Shipping: $25.00
TOTAL: $1,078.00

Payment Terms: Net 30
Payment Methods: Check, Bank Transfer, Credit Card

Please include invoice number on payment.""",
        "questions": [
            {
                "question": "When is the payment due?",
                "correct": "November 15, 2024",
                "distractors": [
                    "October 15, 2024",
                    "October 30, 2024",
                    "December 15, 2024"
                ]
            },
            {
                "question": "What is the total amount due?",
                "correct": "$1,078.00",
                "distractors": [
                    "$975.00",
                    "$1,053.00",
                    "$1,100.00"
                ]
            },
            {
                "question": "How many Product A items were ordered?",
                "correct": "10",
                "distractors": [
                    "5",
                    "15",
                    "20"
                ]
            }
        ]
    },
    {
        "type": "directions",
        "passage": """DIRECTIONS TO CONFERENCE CENTER

From the Airport:
1. Exit the airport and take Highway 101 North.
2. Continue for approximately 15 miles.
3. Take Exit 25 toward Downtown.
4. Turn right onto Main Street.
5. Continue for 2 miles.
6. Turn left onto Conference Drive.
7. The conference center will be on your right.

Parking is available in the main parking lot. The entrance is at the rear of the building.

Estimated travel time: 25-30 minutes
Contact: 555-CONFERENCE for assistance""",
        "questions": [
            {
                "question": "Which highway should be taken from the airport?",
                "correct": "Highway 101 North",
                "distractors": [
                    "Highway 101 South",
                    "Highway 25",
                    "Main Street"
                ]
            },
            {
                "question": "What exit should be taken?",
                "correct": "Exit 25",
                "distractors": [
                    "Exit 15",
                    "Exit 30",
                    "Exit 101"
                ]
            },
            {
                "question": "Where is the parking located?",
                "correct": "In the main parking lot",
                "distractors": [
                    "On the street",
                    "In the rear of the building",
                    "Across the street"
                ]
            }
        ]
    },
    {
        "type": "policy",
        "passage": """COMPANY TRAVEL POLICY

Domestic Travel:
- Economy class for flights under 4 hours
- Business class for flights over 4 hours
- Hotel allowance: $150 per night
- Meal allowance: $50 per day

International Travel:
- Business class for all flights
- Hotel allowance: $200 per night
- Meal allowance: $75 per day
- Additional allowance for visa and insurance

All travel must be approved by the department manager at least 2 weeks in advance. Receipts must be submitted within 30 days of travel for reimbursement.

Contact HR for the travel request form.""",
        "questions": [
            {
                "question": "What is the hotel allowance for domestic travel?",
                "correct": "$150 per night",
                "distractors": [
                    "$200 per night",
                    "$100 per night",
                    "$175 per night"
                ]
            },
            {
                "question": "How far in advance must travel be approved?",
                "correct": "At least 2 weeks",
                "distractors": [
                    "1 week",
                    "3 weeks",
                    "1 month"
                ]
            },
            {
                "question": "What class is required for international flights?",
                "correct": "Business class",
                "distractors": [
                    "Economy class",
                    "First class",
                    "Any class"
                ]
            }
        ]
    },
    {
        "type": "job_posting",
        "passage": """JOB OPENING: Marketing Manager

ABC Corporation is seeking an experienced Marketing Manager to join our team.

Requirements:
- Bachelor's degree in Marketing or related field
- 5+ years of marketing experience
- Strong leadership skills
- Excellent communication abilities
- Proficiency in digital marketing tools

Responsibilities:
- Develop and implement marketing strategies
- Manage marketing team of 5-7 people
- Oversee marketing budget
- Analyze market trends
- Collaborate with sales department

Benefits:
- Competitive salary ($80,000 - $100,000)
- Health insurance
- 401(k) retirement plan
- Paid vacation and holidays
- Professional development opportunities

To apply, send resume and cover letter to careers@abccorp.com by November 30th.""",
        "questions": [
            {
                "question": "What is the minimum years of experience required?",
                "correct": "5 years",
                "distractors": [
                    "3 years",
                    "7 years",
                    "10 years"
                ]
            },
            {
                "question": "What is the salary range?",
                "correct": "$80,000 - $100,000",
                "distractors": [
                    "$70,000 - $90,000",
                    "$90,000 - $120,000",
                    "$60,000 - $80,000"
                ]
            },
            {
                "question": "When is the application deadline?",
                "correct": "November 30th",
                "distractors": [
                    "November 15th",
                    "December 1st",
                    "December 15th"
                ]
            },
            {
                "question": "What should applicants send?",
                "correct": "Resume and cover letter",
                "distractors": [
                    "Resume only",
                    "Portfolio and references",
                    "Application form"
                ]
            }
        ]
    }
]


def generate_options(correct_text: str, distractor_texts: List[str]) -> List[Dict]:
    """Generate options with no duplicates"""
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
    
    # Add distractors (ensure no duplicates)
    distractor_letters = [l for l in letters if l != correct_letter]
    for i, distractor in enumerate(distractor_texts):
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


def generate_part1_question(test_num: int, q_num: int) -> Dict:
    """Generate Part 1 question with real content"""
    scene = random.choice(PART1_SCENES)
    
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


def generate_part2_question(test_num: int, q_num: int) -> Dict:
    """Generate Part 2 question with real content"""
    qa = random.choice(PART2_QUESTIONS)
    
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
            "explanation": f"The correct response to '{qa['question']}' is: {qa['correct']}",
            "options": options
        }]
    }


def generate_part3_group(test_num: int, group_num: int, start_q_num: int) -> Dict:
    """Generate Part 3 conversation group with real content"""
    conv = random.choice(PART3_CONVERSATIONS)
    
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
        "audio_start_time": (group_num - 1) * 60,
        "audio_end_time": group_num * 60,
        "knowledge": f"Part 3: Conversations",
        "questions": questions
    }


def generate_part4_group(test_num: int, group_num: int, start_q_num: int) -> Dict:
    """Generate Part 4 talk group with real content"""
    talk = random.choice(PART4_TALKS)
    
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
        "knowledge": f"Part 4: Talks",
        "questions": questions
    }


def generate_part5_question(test_num: int, q_num: int) -> Dict:
    """Generate Part 5 grammar question with real content"""
    grammar = random.choice(PART5_GRAMMAR)
    
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


def generate_part6_group(test_num: int, group_num: int, question_nums: List[int]) -> Dict:
    """Generate Part 6 text completion group with real content"""
    passage = random.choice(PART6_PASSAGES)
    
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
        "title": passage["title"],
        "passage": passage["passage"],
        "knowledge": f"Part 6: Text Completion - {passage['title']}",
        "questions": questions
    }


def generate_part7_group(test_num: int, group_num: int, start_q_num: int, question_count: int) -> Dict:
    """Generate Part 7 reading comprehension group with real content"""
    passage = random.choice(PART7_PASSAGES)
    
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
        "title": f"{passage['type'].title()} - Questions {start_q_num}-{start_q_num + question_count - 1}",
        "passage": passage["passage"],
        "knowledge": f"Part 7: Reading Comprehension - {passage['type']}",
        "questions": questions
    }


def generate_test(test_num: int) -> Dict:
    """Generate a complete test with real TOEIC content"""
    test_data = {
        "test": {
            "title": f"TOEIC-like Full Test {test_num:03d}",
            "duration": 120,
            "total_questions": 200,
            "description": "Full TOEIC-like practice test with real content",
            "is_active": True
        },
        "question_groups": []
    }
    
    question_groups = []
    current_q_num = 1
    
    # Part 1: 6 questions
    for i in range(6):
        group = generate_part1_question(test_num, i + 1)
        group["display_order"] = i + 1
        question_groups.append(group)
    
    current_q_num += 6
    
    # Part 2: 25 questions
    for i in range(25):
        group = generate_part2_question(test_num, i + 1)
        group["display_order"] = i + 1
        question_groups.append(group)
    
    current_q_num += 25
    
    # Part 3: 39 questions (13 groups of 3)
    for i in range(13):
        group = generate_part3_group(test_num, i + 1, current_q_num)
        group["display_order"] = i + 1
        question_groups.append(group)
        current_q_num += 3
    
    # Part 4: 30 questions (10 groups of 3)
    for i in range(10):
        group = generate_part4_group(test_num, i + 1, current_q_num)
        group["display_order"] = i + 1
        question_groups.append(group)
        current_q_num += 3
    
    # Part 5: 30 questions
    for i in range(30):
        group = generate_part5_question(test_num, i + 1)
        group["display_order"] = i + 1
        question_groups.append(group)
    
    current_q_num += 30
    
    # Part 6: 16 questions (4 groups of 4)
    for i in range(4):
        question_nums = [current_q_num + j for j in range(4)]
        group = generate_part6_group(test_num, i + 1, question_nums)
        group["display_order"] = i + 1
        question_groups.append(group)
        current_q_num += 4
    
    # Part 7: 54 questions (15 groups with varying questions)
    questions_per_group = [4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 4, 4]
    for i, q_count in enumerate(questions_per_group):
        group = generate_part7_group(test_num, i + 1, current_q_num, q_count)
        group["display_order"] = i + 1
        question_groups.append(group)
        current_q_num += q_count
    
    test_data["question_groups"] = question_groups
    return test_data


def validate_test(test_data: Dict) -> Dict:
    """Validate a test for quality issues"""
    issues = {
        "total_questions": 0,
        "total_groups": 0,
        "part_counts": {},
        "duplicate_options": 0,
        "placeholders": 0,
        "mismatched_correct_answer": 0,
        "multiple_correct": 0,
        "missing_correct": 0,
        "missing_data": 0
    }
    
    for group in test_data["question_groups"]:
        issues["total_groups"] += 1
        part = group["part"]
        # Count questions, not groups
        questions_in_group = len(group.get("questions", []))
        issues["part_counts"][part] = issues["part_counts"].get(part, 0) + questions_in_group
        
        for question in group["questions"]:
            issues["total_questions"] += 1
            
            # Check for missing data
            if not question.get("correct_answer"):
                issues["missing_correct"] += 1
            if not question.get("options"):
                issues["missing_data"] += 1
                continue
            
            options = question["options"]
            option_texts = [opt["option_text"] for opt in options]
            
            # Check for duplicates
            if len(option_texts) != len(set(option_texts)):
                issues["duplicate_options"] += 1
            
            # Check for placeholders
            for opt in options:
                text = opt["option_text"].lower()
                if "correct answer based on" in text or "incorrect option" in text or "incorrect information" in text:
                    issues["placeholders"] += 1
                    break
            
            # Check correct answer matches
            correct_answer = question["correct_answer"]
            correct_option = next((opt for opt in options if opt["is_correct"]), None)
            
            if not correct_option:
                issues["missing_correct"] += 1
            elif correct_option["option_label"] != correct_answer:
                issues["mismatched_correct_answer"] += 1
            
            # Check for multiple correct
            correct_count = sum(1 for opt in options if opt["is_correct"])
            if correct_count > 1:
                issues["multiple_correct"] += 1
            elif correct_count == 0:
                issues["missing_correct"] += 1
    
    return issues


def main():
    """Main function"""
    import sys
    
    print("Generating TOEIC Tests with Real Content")
    print("=" * 60)
    
    # Check if --all flag is provided
    generate_all = "--all" in sys.argv
    
    if not generate_all:
        # Generate test001 first for validation
        print("\nGenerating test001.json for validation...")
        test_data = generate_test(1)
        
        output_file = OUTPUT_DIR / "test001.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(test_data, f, indent=2, ensure_ascii=False)
        
        print(f"Saved to {output_file}")
        
        # Validate
        print("\nValidating test001.json...")
        issues = validate_test(test_data)
        
        print("\n" + "=" * 60)
        print("VALIDATION REPORT FOR TEST001")
        print("=" * 60)
        print(f"Total questions: {issues['total_questions']}")
        print(f"Total groups: {issues['total_groups']}")
        print(f"Questions per part:")
        for part in sorted(issues['part_counts'].keys()):
            print(f"  Part {part}: {issues['part_counts'][part]}")
        print(f"Duplicate options: {issues['duplicate_options']}")
        print(f"Placeholders found: {issues['placeholders']}")
        print(f"Mismatched correct answers: {issues['mismatched_correct_answer']}")
        print(f"Multiple correct answers: {issues['multiple_correct']}")
        print(f"Missing correct answers: {issues['missing_correct']}")
        print(f"Missing data: {issues['missing_data']}")
        print("=" * 60)
        
        # Check if validation passed
        if (issues['placeholders'] == 0 and 
            issues['duplicate_options'] == 0 and 
            issues['mismatched_correct_answer'] == 0 and 
            issues['multiple_correct'] == 0 and 
            issues['missing_correct'] == 0 and 
            issues['missing_data'] == 0 and
            issues['total_questions'] == 200):
            print("\n✅ VALIDATION PASSED - Ready to generate remaining tests")
            print("\nTo generate all 100 tests, run: python generate_toeic_tests_real.py --all")
            return True
        else:
            print("\n❌ VALIDATION FAILED - Please review issues above")
            return False
    else:
        # Generate all 100 tests
        print("\nGenerating all 100 tests...")
        print("=" * 60)
        
        total_issues = {
            "total_tests": 0,
            "passed": 0,
            "failed": 0,
            "total_questions": 0,
            "placeholders": 0,
            "duplicate_options": 0,
            "mismatched_correct": 0
        }
        
        for test_num in range(1, TOTAL_TESTS + 1):
            print(f"\nGenerating test{test_num:03d}.json...")
            test_data = generate_test(test_num)
            
            output_file = OUTPUT_DIR / f"test{test_num:03d}.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(test_data, f, indent=2, ensure_ascii=False)
            
            # Validate
            issues = validate_test(test_data)
            total_issues["total_tests"] += 1
            total_issues["total_questions"] += issues["total_questions"]
            total_issues["placeholders"] += issues["placeholders"]
            total_issues["duplicate_options"] += issues["duplicate_options"]
            total_issues["mismatched_correct"] += issues["mismatched_correct_answer"]
            
            if (issues['placeholders'] == 0 and 
                issues['duplicate_options'] == 0 and 
                issues['mismatched_correct_answer'] == 0 and 
                issues['multiple_correct'] == 0 and 
                issues['missing_correct'] == 0 and 
                issues['missing_data'] == 0 and
                issues['total_questions'] == 200):
                total_issues["passed"] += 1
                print(f"  ✓ test{test_num:03d}.json - PASSED")
            else:
                total_issues["failed"] += 1
                print(f"  ✗ test{test_num:03d}.json - FAILED")
        
        print("\n" + "=" * 60)
        print("FINAL VALIDATION SUMMARY")
        print("=" * 60)
        print(f"Total tests generated: {total_issues['total_tests']}")
        print(f"Tests passed: {total_issues['passed']}")
        print(f"Tests failed: {total_issues['failed']}")
        print(f"Total questions: {total_issues['total_questions']}")
        print(f"Total placeholders: {total_issues['placeholders']}")
        print(f"Total duplicate options: {total_issues['duplicate_options']}")
        print(f"Total mismatched correct answers: {total_issues['mismatched_correct']}")
        print("=" * 60)
        
        if total_issues["failed"] == 0:
            print("\n✅ ALL TESTS PASSED VALIDATION")
        else:
            print(f"\n❌ {total_issues['failed']} TESTS FAILED VALIDATION")
        
        return total_issues["failed"] == 0


if __name__ == "__main__":
    main()
