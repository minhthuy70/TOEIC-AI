--
-- PostgreSQL database dump
--

\restrict ZvVZYhDhnfzUhtEVtYBasyIXepHMSs6exjwYtswIkQVLb1UQdDQWq8O2TQp1It7

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    "fullName" text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: UserProfile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserProfile" (
    id integer NOT NULL,
    "currentScore" integer,
    "targetScore" integer,
    "examDate" timestamp(3) without time zone,
    "dailyStudyTime" integer,
    "firstLoginCompleted" boolean DEFAULT false NOT NULL,
    "userId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserProfile" OWNER TO postgres;

--
-- Name: UserProfile_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."UserProfile_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."UserProfile_id_seq" OWNER TO postgres;

--
-- Name: UserProfile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."UserProfile_id_seq" OWNED BY public."UserProfile".id;


--
-- Name: UserVocabulary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserVocabulary" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "vocabularyWordId" integer NOT NULL,
    "reviewStage" integer DEFAULT 0 NOT NULL,
    "nextReviewDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastReviewDate" timestamp(3) without time zone,
    "reviewCount" integer DEFAULT 0 NOT NULL,
    "memoryStrength" double precision DEFAULT 0 NOT NULL,
    "correctCount" integer DEFAULT 0 NOT NULL,
    "incorrectCount" integer DEFAULT 0 NOT NULL,
    "isLearned" boolean DEFAULT false NOT NULL,
    "isMastered" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserVocabulary" OWNER TO postgres;

--
-- Name: UserVocabulary_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."UserVocabulary_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."UserVocabulary_id_seq" OWNER TO postgres;

--
-- Name: UserVocabulary_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."UserVocabulary_id_seq" OWNED BY public."UserVocabulary".id;


--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: VocabularyReview; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."VocabularyReview" (
    id integer NOT NULL,
    "userVocabularyId" integer NOT NULL,
    "isCorrect" boolean NOT NULL,
    "responseTime" integer,
    "reviewType" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."VocabularyReview" OWNER TO postgres;

--
-- Name: VocabularyReview_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."VocabularyReview_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."VocabularyReview_id_seq" OWNER TO postgres;

--
-- Name: VocabularyReview_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."VocabularyReview_id_seq" OWNED BY public."VocabularyReview".id;


--
-- Name: VocabularyWord; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."VocabularyWord" (
    id integer NOT NULL,
    word text NOT NULL,
    type text NOT NULL,
    meaning text NOT NULL,
    example text NOT NULL,
    "exampleTranslation" text NOT NULL,
    synonyms text[],
    phrases text[],
    level text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VocabularyWord" OWNER TO postgres;

--
-- Name: VocabularyWord_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."VocabularyWord_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."VocabularyWord_id_seq" OWNER TO postgres;

--
-- Name: VocabularyWord_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."VocabularyWord_id_seq" OWNED BY public."VocabularyWord".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.options (
    id integer NOT NULL,
    question_id integer,
    option_label character(1),
    option_text text,
    display_order integer
);


ALTER TABLE public.options OWNER TO postgres;

--
-- Name: options_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.options_id_seq OWNER TO postgres;

--
-- Name: options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.options_id_seq OWNED BY public.options.id;


--
-- Name: question_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question_groups (
    id integer NOT NULL,
    test_id integer,
    part integer,
    title text,
    passage text,
    image_url text,
    audio_url text,
    display_order integer,
    group_type character varying(30),
    audio_start_time integer,
    audio_end_time integer
);


ALTER TABLE public.question_groups OWNER TO postgres;

--
-- Name: question_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.question_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_groups_id_seq OWNER TO postgres;

--
-- Name: question_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.question_groups_id_seq OWNED BY public.question_groups.id;


--
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.questions (
    id integer NOT NULL,
    group_id integer,
    question_number integer,
    question_text text,
    correct_answer character(1),
    explanation text,
    display_order integer
);


ALTER TABLE public.questions OWNER TO postgres;

--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.questions_id_seq OWNER TO postgres;

--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.questions_id_seq OWNED BY public.questions.id;


--
-- Name: tests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tests (
    id integer NOT NULL,
    title character varying(100),
    duration integer,
    total_questions integer,
    created_at timestamp without time zone DEFAULT now(),
    description text,
    is_active boolean DEFAULT true
);


ALTER TABLE public.tests OWNER TO postgres;

--
-- Name: tests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tests_id_seq OWNER TO postgres;

--
-- Name: tests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tests_id_seq OWNED BY public.tests.id;


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: UserProfile id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserProfile" ALTER COLUMN id SET DEFAULT nextval('public."UserProfile_id_seq"'::regclass);


--
-- Name: UserVocabulary id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserVocabulary" ALTER COLUMN id SET DEFAULT nextval('public."UserVocabulary_id_seq"'::regclass);


--
-- Name: VocabularyReview id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."VocabularyReview" ALTER COLUMN id SET DEFAULT nextval('public."VocabularyReview_id_seq"'::regclass);


--
-- Name: VocabularyWord id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."VocabularyWord" ALTER COLUMN id SET DEFAULT nextval('public."VocabularyWord_id_seq"'::regclass);


--
-- Name: options id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.options ALTER COLUMN id SET DEFAULT nextval('public.options_id_seq'::regclass);


--
-- Name: question_groups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_groups ALTER COLUMN id SET DEFAULT nextval('public.question_groups_id_seq'::regclass);


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.questions_id_seq'::regclass);


--
-- Name: tests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tests ALTER COLUMN id SET DEFAULT nextval('public.tests_id_seq'::regclass);


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, "fullName", email, password, "createdAt") FROM stdin;
1	user1	user1@gmail.com	$2b$10$wQblVvUA0v.4gJ9ejghpPenYmfIaFVNgdyr1U./i6HZ4Qa7qXR53u	2026-07-24 06:16:24.669
\.


--
-- Data for Name: UserProfile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserProfile" (id, "currentScore", "targetScore", "examDate", "dailyStudyTime", "firstLoginCompleted", "userId", "createdAt", "updatedAt") FROM stdin;
1	100	648	2030-10-11 00:00:00	120	t	1	2026-07-24 06:16:24.669	2026-07-24 06:16:55.605
\.


--
-- Data for Name: UserVocabulary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserVocabulary" (id, "userId", "vocabularyWordId", "reviewStage", "nextReviewDate", "lastReviewDate", "reviewCount", "memoryStrength", "correctCount", "incorrectCount", "isLearned", "isMastered", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: VocabularyReview; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."VocabularyReview" (id, "userVocabularyId", "isCorrect", "responseTime", "reviewType", "createdAt") FROM stdin;
\.


--
-- Data for Name: VocabularyWord; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."VocabularyWord" (id, word, type, meaning, example, "exampleTranslation", synonyms, phrases, level, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
8bbaa831-edb0-4303-a639-b9c8ab25f978	a7a477bb41773bf1b31a8cdb9a2c0049d223a69d211a1221bb72fc878dcd0424	2026-07-23 16:52:20.053178+07	20260723095220_add_vocabulary_tables	\N	\N	2026-07-23 16:52:20.036786+07	1
\.


--
-- Data for Name: options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.options (id, question_id, option_label, option_text, display_order) FROM stdin;
1	32	A	To request a ticket change	1
2	32	B	To make a dinner reservation	2
3	32	C	To order merchandise	3
4	32	D	To plan a vacation	4
5	33	A	An event was canceled.	1
6	33	B	A line is very long.	2
7	33	C	A payment option is unavailable.	3
8	33	D	A computer program is not working.	4
9	34	A	A meal voucher	1
10	34	B	Some free souvenirs	2
11	34	C	An increase in price	3
12	34	D	A refund policy	4
13	35	A	A job fair	1
14	35	B	A film screening	2
15	35	C	A lunch	3
16	35	D	A conference	4
17	36	A	To suggest inquiring about a ride	1
18	36	B	To express surprise at a coworker's choice of vehicle	2
19	36	C	To explain why a coworker was late	3
20	36	D	To clarify that a coworker helped him move	4
21	37	A	Reschedule an event	1
22	37	B	Talk to another coworker	2
23	37	C	Request time off	3
24	37	D	Make a phone call	4
25	38	A	At a grocery store	1
26	38	B	At a shipping facility	2
27	38	C	At a restaurant	3
28	38	D	At a doctor's office	4
29	39	A	Fuel prices	1
30	39	B	Her work hours	2
31	39	C	A staff shortage	3
32	39	D	An inventory process	4
33	40	A	Complete a training program	1
34	40	B	Order extra equipment	2
35	40	C	Hire a consultant	3
36	40	D	Take time to make a decision	4
37	41	A	Her taxi never arrived.	1
38	41	B	Her luggage is missing.	2
39	41	C	Her train was canceled.	3
40	41	D	Her ticket is lost.	4
41	42	A	An awards ceremony	1
42	42	B	A trade show	2
43	42	C	An art exhibit opening	3
44	42	D	A building inspection	4
45	43	A	A partial discount	1
46	43	B	Vouchers for future travel	2
47	43	C	A full refund	3
48	43	D	A better seat	4
49	44	A	At a distribution center	1
50	44	B	At a conference center	2
51	44	C	At a car dealership	3
52	44	D	At a real estate agency	4
53	45	A	Confusion about the intended recipients	1
54	45	B	A delay in message delivery	2
55	45	C	An incorrectly typed word	3
56	45	D	Lack of information	4
57	46	A	Arrange a meeting	1
58	46	B	Make a phone call	2
59	46	C	Speak to her employees	3
60	46	D	Review an invoice	4
61	47	A	A policy change	1
62	47	B	A product launch	2
63	47	C	Some customer feedback	3
64	47	D	A scheduled maintenance visit	4
65	48	A	Exploring publicity options	1
66	48	B	Finding a new vendor	2
67	48	C	Assembling a sales team	3
68	48	D	Negotiating a monthly fee	4
69	49	A	Customers have complained.	1
70	49	B	Price estimates are high.	2
71	49	C	Some changes require approval.	3
72	49	D	A plan may be delayed.	4
73	50	A	An interview	1
74	50	B	A food delivery	2
75	50	C	A special event	3
76	50	D	An inspection	4
77	51	A	Some flower arrangements	1
78	51	B	Some gifts for attendees	2
79	51	C	Some audio equipment	3
80	51	D	Some tables and chairs	4
81	52	A	Review a guest list	1
82	52	B	Meet with a photographer	2
83	52	C	Take a break	3
84	52	D	Taste some food	4
85	53	A	A bank opening	1
86	53	B	A contest	2
87	53	C	A business conference	3
88	53	D	A company anniversary	4
89	54	A	He finally fully understands a problem.	1
90	54	B	The woman should expect a bill in the mail.	2
91	54	C	The woman's assumption is incorrect.	3
92	54	D	A schedule needs to be adjusted.	4
93	55	A	Using an outdoor area	1
94	55	B	Arranging technical support	2
95	55	C	Confirming a catering menu	3
96	55	D	Interviewing some job applicants	4
97	56	A	Medicine	1
98	56	B	Music	2
99	56	C	Publishing	3
100	56	D	Finance	4
101	57	A	It is less expensive than similar products.	1
102	57	B	It makes information more accessible.	2
103	57	C	It reduces environmental impact.	3
104	57	D	It comes with customer support.	4
105	58	A	Contact some service providers	1
106	58	B	Sign a release form	2
107	58	C	Check some financial information	3
108	58	D	Repair some equipment	4
109	59	A	Proposing a business merger	1
110	59	B	Relocating a company's headquarters	2
111	59	C	Developing additional products	3
112	59	D	Hiring more employees	4
113	60	A	A profit margin will decrease.	1
114	60	B	Additional equipment will be needed.	2
115	60	C	There are not enough job applicants.	3
116	60	D	There are delays in production.	4
117	61	A	Contact a facility manager	1
118	61	B	Adjust a budget	2
119	61	C	Change a work schedule	3
120	61	D	Research a product	4
121	62	A	It offers a chance to see migrating birds.	1
122	62	B	Water conditions are likely to be favorable.	2
123	62	C	A guest chef is preparing lunch.	3
124	62	D	Someone special will be guiding the tour.	4
125	63	A	At 9 A.M.	1
126	63	B	At 10 A.M.	2
127	63	C	At 11 A.M.	3
128	63	D	At 12 P.M.	4
129	64	A	Return to her hotel	1
130	64	B	Visit a café	2
131	64	C	Call a friend	3
132	64	D	Store her bags in a locker	4
133	65	A	A conference session is full.	1
134	65	B	An elevator is not working.	2
135	65	C	A workshop has changed locations.	3
136	65	D	Parking is not free.	4
137	66	A	Area 1	1
138	66	B	Area 2	2
139	66	C	Area 3	3
140	66	D	Area 4	4
141	67	A	A workshop is starting soon.	1
142	67	B	A parking pass is about to expire.	2
143	67	C	A shuttle is running late.	3
144	67	D	A friend is waiting outside.	4
145	68	A	She wants to request a refund.	1
146	68	B	She is unable to place an order online.	2
147	68	C	She wants to extend a deadline.	3
148	68	D	She is unhappy with a product purchased recently.	4
149	69	A	$169.99	1
150	69	B	$149.99	2
151	69	C	$129.99	3
152	69	D	$179.99	4
153	70	A	Update a Web site	1
154	70	B	Search a storage area	2
155	70	C	Contact another store location	3
156	70	D	Check an incoming shipment	4
277	71	A	The quality of its food	1
278	71	B	The extended hours it is open	2
279	71	C	The style of its decor	3
280	71	D	The affordable prices it offers	4
281	72	A	Go on a tour	1
282	72	B	Get a free gift	2
283	72	C	Talk to an actor	3
284	72	D	Watch some movies	4
285	73	A	Arrive early	1
286	73	B	Use public transportation	2
287	73	C	Order tickets in advance	3
288	73	D	Purchase a membership	4
289	74	A	Request shuttle service	1
290	74	B	Extend a hotel stay	2
291	74	C	Change a room assignment	3
292	74	D	Cancel a reservation	4
293	75	A	To express approval for a room design	1
294	75	B	To explain why a hotel is successful	2
295	75	C	To indicate his disbelief	3
296	75	D	To deny the listener's request	4
297	76	A	Some warm clothes	1
298	76	B	Some swimwear	2
299	76	C	A credit card	3
300	76	D	A copy of a key	4
301	77	A	An archaeologist	1
302	77	B	A marine biologist	2
303	77	C	A conservation expert	3
304	77	D	An athletic trainer	4
305	78	A	Take a water bottle	1
306	78	B	Consult a site map	2
307	78	C	Apply sunscreen regularly	3
308	78	D	Write careful notes	4
309	79	A	Answer some questions	1
310	79	B	Demonstrate a process	2
311	79	C	Introduce a colleague	3
312	79	D	Take the listeners to lunch	4
313	80	A	To inspect a factory	1
314	80	B	To repair a product	2
315	80	C	To perform in a concert	3
316	80	D	To attend a workshop	4
317	81	A	A seating arrangement is wrong.	1
318	81	B	A company credit card was not charged.	2
319	81	C	Some meal tickets were not sent.	3
320	81	D	Her taxi driver is unable to find a hotel.	4
321	82	A	Send an e-mail	1
322	82	B	Meet at an office	2
323	82	C	Confirm a schedule	3
324	82	D	Look up an account number	4
325	83	A	Keep a gate closed	1
326	83	B	Return equipment to a shed	2
327	83	C	Check a list of supplies	3
328	83	D	Select a free gift	4
329	84	A	A garden plot	1
330	84	B	A volunteer opportunity	2
331	84	C	A gardening workshop	3
332	84	D	A farmers market table	4
333	85	A	By signing up for a newsletter	1
334	85	B	By joining a membership program	2
335	85	C	By looking at a Web site	3
336	85	D	By attending weekly meetings	4
337	86	A	Financial planning	1
338	86	B	Digital marketing	2
339	86	C	Real estate sales	3
340	86	D	International shipping	4
341	87	A	It has several local offices.	1
342	87	B	It offers a money-back guarantee.	2
343	87	C	Its employees have industry certification.	3
344	87	D	Its employees work one-on-one with clients.	4
345	88	A	By sending an e-mail	1
346	88	B	By calling customer service	2
347	88	C	By filling out a questionnaire	3
348	88	D	By sending a text message	4
349	89	A	Marine biologists	1
350	89	B	Museum directors	2
351	89	C	Rare-book librarians	3
352	89	D	Agricultural engineers	4
353	90	A	An opportunity is unlikely to occur.	1
354	90	B	An award is impressive.	2
355	90	C	A decision will take longer than usual.	3
356	90	D	A competitor has been very successful.	4
357	91	A	Additional funds are needed.	1
358	91	B	Some special training is required.	2
359	91	C	An application has to be approved.	3
360	91	D	Some equipment needs to be ordered.	4
361	92	A	To recognize outstanding achievements	1
362	92	B	To introduce new products to the public	2
363	92	C	To announce a manager's retirement	3
364	92	D	To provide new employees with information	4
365	93	A	At a banquet hall	1
366	93	B	At a government building	2
367	93	C	At a factory	3
368	93	D	At a construction site	4
369	94	A	She needs to reschedule a meeting.	1
370	94	B	She will not be with the listeners in the afternoon.	2
371	94	C	A customer has just placed a large order.	3
372	94	D	A marketing campaign will begin soon.	4
373	95	A	To place an order	1
374	95	B	To dispute a charge	2
375	95	C	To arrange a meeting	3
376	95	D	To check a store's inventory	4
377	96	A	SG-200	1
378	96	B	SG-250	2
379	96	C	XG-300	3
380	96	D	XG-350	4
381	97	A	A warranty	1
382	97	B	A return process	2
383	97	C	A delivery fee	3
384	97	D	Product availability	4
385	98	A	Marketing experts	1
386	98	B	Product testers	2
387	98	C	Product designers	3
388	98	D	Audio engineers	4
389	99	A	40 percent	1
390	99	B	50 percent	2
391	99	C	60 percent	3
392	99	D	80 percent	4
393	100	A	A competitor is making a similar product.	1
394	100	B	A product will be offered for sale soon.	2
395	100	C	A product will be introduced at a trade show.	3
396	100	D	The cost of a product's materials will rise soon.	4
397	101	A	encourage	1
398	101	B	is encouraging	2
399	101	C	encouraged	3
400	101	D	was encouraged	4
401	102	A	for	1
402	102	B	about	2
403	102	C	to	3
404	102	D	at	4
405	103	A	his	1
406	103	B	him	2
407	103	C	himself	3
408	103	D	he	4
409	104	A	allow	1
410	104	B	manage	2
411	104	C	succeed	3
412	104	D	finish	4
413	105	A	safety	1
414	105	B	safe	2
415	105	C	safeness	3
416	105	D	safely	4
417	106	A	arranged	1
418	106	B	ready	2
419	106	C	available	3
420	106	D	qualified	4
421	107	A	Attendance	1
422	107	B	Attend	2
423	107	C	Attends	3
424	107	D	Attended	4
425	108	A	tightly	1
426	108	B	occasionally	2
427	108	C	vaguely	3
428	108	D	realistically	4
429	109	A	who	1
430	109	B	around	2
431	109	C	that	3
432	109	D	therefore	4
433	110	A	however	1
434	110	B	furthermore	2
435	110	C	as if	3
436	110	D	such as	4
437	111	A	improve	1
438	111	B	improved	2
439	111	C	improving	3
440	111	D	improvement	4
441	112	A	issue	1
442	112	B	alert	2
443	112	C	claim	3
444	112	D	member	4
445	113	A	remark	1
446	113	B	remarked	2
447	113	C	remarking	3
448	113	D	remarkable	4
449	114	A	rarely	1
450	114	B	honestly	2
451	114	C	doubtfully	3
452	114	D	directly	4
453	115	A	their	1
454	115	B	they	2
455	115	C	them	3
456	115	D	themselves	4
457	116	A	participate	1
458	116	B	consider	2
459	116	C	grant	3
460	116	D	make	4
461	117	A	active	1
462	117	B	actively	2
463	117	C	activate	3
464	117	D	activity	4
465	118	A	renew	1
466	118	B	consume	2
467	118	C	identify	3
468	118	D	resemble	4
469	119	A	protect	1
470	119	B	protects	2
471	119	C	protective	3
472	119	D	protectively	4
473	120	A	security	1
474	120	B	bracket	2
475	120	C	connector	3
476	120	D	merger	4
477	121	A	confide	1
478	121	B	confidential	2
479	121	C	confidentially	3
480	121	D	confidentiality	4
481	122	A	memories	1
482	122	B	varieties	2
483	122	C	trends	3
484	122	D	rehearsals	4
485	123	A	inspect	1
486	123	B	inspected	2
487	123	C	are inspecting	3
488	123	D	are inspected	4
489	124	A	brief	1
490	124	B	loyal	2
491	124	C	strict	3
492	124	D	careful	4
493	125	A	invest	1
494	125	B	investing	2
495	125	C	invested	3
496	125	D	investments	4
497	126	A	accessible	1
498	126	B	formal	2
499	126	C	reasonable	3
500	126	D	likely	4
501	127	A	controlling	1
502	127	B	consequently	2
503	127	C	beneath	3
504	127	D	even though	4
505	128	A	around	1
506	128	B	until	2
507	128	C	despite	3
508	128	D	past	4
509	129	A	will equip	1
510	129	B	to equip	2
511	129	C	has been equipped	3
512	129	D	is equipping	4
513	130	A	Because of	1
514	130	B	Instead of	2
515	130	C	Whenever	3
516	130	D	Although	4
517	131	A	locate	1
518	131	B	located	2
519	131	C	locates	3
520	131	D	location	4
521	132	A	The results will be announced later this month.	1
522	132	B	We are proud to serve our community with excellence.	2
523	132	C	Pat and Kenny's shop excelled in all four categories.	3
524	132	D	Please call in advance to schedule an appointment.	4
525	133	A	I	1
526	133	B	We	2
527	133	C	They	3
528	133	D	He	4
529	134	A	While	1
530	134	B	Despite	2
531	134	C	Even	3
532	134	D	Yet	4
533	135	A	economy	1
534	135	B	economics	2
535	135	C	economize	3
536	135	D	economical	4
537	136	A	below	1
538	136	B	finally	2
539	136	C	sometimes	3
540	136	D	hourly	4
541	137	A	Come again very soon.	1
542	137	B	It is warmer in the store.	2
543	137	C	Do not take it inside.	3
544	137	D	The tank is prefilled.	4
545	138	A	model	1
546	138	B	version	2
547	138	C	heater	3
548	138	D	replacement	4
549	139	A	experience	1
550	139	B	experienced	2
551	139	C	experiencing	3
552	139	D	experiential	4
553	140	A	either	1
554	140	B	both	2
555	140	C	rather	3
556	140	D	each	4
557	141	A	Therefore	1
558	141	B	Regardless	2
559	141	C	For example	3
560	141	D	Moreover	4
561	142	A	We also need to inform you that your payment is five days past due.	1
562	142	B	We recommend that you purchase all related accessories in our retail store.	2
563	142	C	If you get an error message, disconnect from the Internet and try again.	3
564	142	D	If you cannot find what you need online, simply call our support number.	4
565	143	A	enlarged	1
566	143	B	discontinued	2
567	143	C	accessible	3
568	143	D	refreshed	4
569	144	A	sharing	1
570	144	B	but	2
571	144	C	except	3
572	144	D	as well as	4
573	145	A	routes	1
574	145	B	responses	2
575	145	C	software	3
576	145	D	careers	4
577	146	A	People often use credit cards to purchase meals during the flight.	1
578	146	B	Many people like public transportation because it is inexpensive.	2
579	146	C	The durable cards are made from recycled materials.	3
580	146	D	There was a small price increase last month.	4
581	147	A	It provides materials for students.	1
582	147	B	It has stores in multiple locations.	2
583	147	C	It is celebrating an anniversary.	3
584	147	D	It provides free shipping for online orders.	4
585	148	A	Box of ten cards	1
586	148	B	Box of five invitations	2
587	148	C	Wireless mouse	3
588	148	D	Desk lamp	4
589	149	A	To inquire about leasing a vehicle	1
590	149	B	To inform a customer of required car maintenance	2
591	149	C	To announce the release of a new car	3
592	149	D	To register a used car for an extended warranty	4
593	150	A	It performs the servicing of its company vehicles.	1
594	150	B	It has a new project beginning March 1.	2
595	150	C	It provides leased cars to some employees.	3
596	150	D	It will soon begin a construction project for Toshi Auto Group.	4
597	151	A	To promote a new line of cookware	1
598	151	B	To advertise an orchestra concert	2
599	151	C	To announce a new series of books	3
600	151	D	To provide a calendar of local events	4
601	152	A	An awards ceremony	1
602	152	B	The publication of a life story	2
603	152	C	The release of a new album	3
604	152	D	The launch of a celebrity's restaurant	4
605	153	A	Its record-breaking sales	1
606	153	B	Its roots in Manchester	2
607	153	C	Its focus on fiction and poetry	3
608	153	D	Its broad range of authors	4
609	154	A	Some new employees are absent.	1
610	154	B	Some boxes are incorrectly labeled.	2
611	154	C	A package delivery is delayed.	3
612	154	D	An access door is malfunctioning.	4
613	155	A	An electrician has arrived at a work site.	1
614	155	B	Some equipment is operating smoothly.	2
615	155	C	Trainees can help with some shipments.	3
616	155	D	Ms. Sadauskas is well suited for her job.	4
617	156	A	An image is not displaying clearly.	1
618	156	B	A projector needs to be set up.	2
619	156	C	Audio is not functioning properly.	3
620	156	D	A microphone needs to be repaired.	4
621	157	A	Visit a client site.	1
622	157	B	Deliver a product.	2
623	157	C	Create an online video.	3
624	157	D	Give a presentation.	4
625	158	A	2:00 P.M.	1
626	158	B	2:15 P.M.	2
627	158	C	2:30 P.M.	3
628	158	D	3:00 P.M.	4
629	159	A	Marketing	1
630	159	B	Finance	2
631	159	C	Advertising	3
632	159	D	Executive management	4
633	160	A	To summarize a previous meeting	1
634	160	B	To explain a promotional campaign	2
635	160	C	To provide information about a budget	3
636	160	D	To review recently approved documents	4
637	161	A	She accepts Mr. Seidal's offer.	1
638	161	B	She agrees that Mr. Iverman should attend the meeting at 3:00 P.M.	2
639	161	C	She is pleased with the proposed budget.	3
640	161	D	She is happy that a project has been completed.	4
641	162	A	He informed her of a job opening.	1
642	162	B	He will require a professional reference.	2
643	162	C	He would make a good business partner.	3
644	162	D	He is considering resigning from his position.	4
645	163	A	transport	1
646	163	B	communicate	2
647	163	C	recommend	3
648	163	D	adapt	4
649	164	A	She wants a higher salary for her efforts.	1
650	164	B	She wants to work with a more experienced team.	2
651	164	C	She wants more opportunities for advancement.	3
652	164	D	She wants a role that inspires her more.	4
653	165	A	To request a placement in a particular country	1
654	165	B	To discuss how she came to acquire strategic industry contacts	2
655	165	C	To explain how she became aware of certain world issues	3
656	165	D	To emphasize her experience with people of different backgrounds	4
717	166	A	Medical supplies	1
718	166	B	Farming equipment	2
719	166	C	Cabinets and furniture	3
720	166	D	Glass laboratory equipment	4
721	167	A	It reorganized a client's laboratory.	1
722	167	B	It converted its vehicles to use biofuels.	2
723	167	C	It expanded staffing at its production facility.	3
724	167	D	It helped a client organize a trade show.	4
725	168	A	By e-mail	1
726	168	B	By phone	2
727	168	C	By instant message	3
728	168	D	By an online form	4
729	169	A	Cook	1
730	169	B	Cashier	2
731	169	C	Interior designer	3
732	169	D	Event planner	4
733	170	A	Respond to a survey	1
734	170	B	Arrange for an interview	2
735	170	C	Submit a recording	3
736	170	D	Provide references	4
737	171	A	[1]	1
738	171	B	[2]	2
739	171	C	[3]	3
740	171	D	[4]	4
741	172	A	To promote a technology show	1
742	172	B	To introduce a product	2
743	172	C	To interview smartphone users	3
744	172	D	To announce a recall of a device	4
745	173	A	£39	1
746	173	B	£59	2
747	173	C	£79	3
748	173	D	£100	4
749	174	A	The screen size	1
750	174	B	The camera resolution	2
751	174	C	The price	3
752	174	D	The charger	4
753	175	A	[1]	1
754	175	B	[2]	2
755	175	C	[3]	3
756	175	D	[4]	4
757	176	A	It provides mobile phones to some employees.	1
758	176	B	Its employees value confidentiality.	2
759	176	C	It has recently changed its phone system.	3
760	176	D	It offers technology training to employees.	4
761	177	A	periodic	1
762	177	B	orderly	2
763	177	C	customary	3
764	177	D	legitimate	4
765	178	A	In a weekly managers' meeting	1
766	178	B	In a work order	2
767	178	C	In a phone call	3
768	178	D	In a personal voice mail	4
769	179	A	By agreeing to everything Ms. Xi asked for	1
770	179	B	By resetting the password on Ms. Xi's phone	2
771	179	C	By referring the matter to another technician	3
772	179	D	By proposing to fulfill only part of Ms. Xi's request	4
773	180	A	Make the needed changes to her voice-mail system	1
774	180	B	Attend training about the new voice-mail system	2
775	180	C	Confirm that she wants him to change her voice-mail system	3
776	180	D	Provide a clear description of the problem with her voice-mail system	4
777	181	A	He coordinates a game development team.	1
778	181	B	He is convinced that Titan Adventure is overpriced.	2
779	181	C	He is a new employee at Rimerko Games.	3
780	181	D	He will leave on a business trip on October 10.	4
781	182	A	It is a major competitor of Titan Adventure.	1
782	182	B	It features an open-world format.	2
783	182	C	It is the first video game in a series.	3
784	182	D	It is Rimerko's most challenging game.	4
785	183	A	She wrote the script for Neptune's Voyage.	1
786	183	B	She successfully addressed Mr. Merson's concern.	2
787	183	C	She won an award for game design.	3
788	183	D	She is a project manager.	4
789	184	A	It has players act in the role of Neptune.	1
790	184	B	It uses lighting to show players where to navigate.	2
791	184	C	It introduces a completely new set of characters.	3
792	184	D	It lets players explore new features without guidance.	4
793	185	A	On September 4	1
794	185	B	On October 10	2
795	185	C	On April 1	3
796	185	D	On May 5	4
797	186	A	The advertising manager at a radio station	1
798	186	B	The host of a community news program	2
799	186	C	The music director at Wonder Ridge Radio	3
800	186	D	The host of a sports radio program	4
801	187	A	To express praise for the radio station	1
802	187	B	To ask about job opportunities	2
803	187	C	To request more sports talk show programming	3
804	187	D	To inquire about the name of a song	4
805	188	A	Between 6 A.M. and noon	1
806	188	B	Between noon and 4 P.M.	2
807	188	C	Between 4 P.M. and 7 P.M.	3
808	188	D	Between 7 P.M. and 10 P.M.	4
809	189	A	A willingness to travel	1
810	189	B	Familiarity with computers	2
811	189	C	A degree in communications	3
812	189	D	Extensive experience in the radio industry	4
813	190	A	Coffee Break	1
814	190	B	Afternoon Jazz	2
815	190	C	Folk Frenzy	3
816	190	D	Josie's Joint	4
817	191	A	They can be made only on certain days.	1
818	191	B	They can be made only online.	2
819	191	C	They can be filed only by authorized personnel.	3
820	191	D	They can be filed only after a fee is paid.	4
821	192	A	To add information to a Web portal	1
822	192	B	To help his company advise the city	2
823	192	C	To identify an accounting error	3
824	192	D	To learn how an agency is structured	4
825	193	A	Go through a security screening	1
826	193	B	Get a parking permit	2
827	193	C	Present some identification	3
828	193	D	Sign a logbook	4
829	194	A	An itemized statement of fees	1
830	194	B	A letter from his company	2
831	194	C	A phone call from a city official	3
832	194	D	A password for the Web portal	4
833	195	A	Room 100	1
834	195	B	Room 101	2
835	195	C	Room 102	3
836	195	D	Room 103	4
837	196	A	He enjoys his work as a director.	1
838	196	B	He has been a mentor to many young people.	2
839	196	C	He is a well-known actor.	3
840	196	D	He has written many books.	4
841	197	A	In Sweden	1
842	197	B	In France	2
843	197	C	In Italy	3
844	197	D	In the United Kingdom	4
845	198	A	To go on a vacation	1
846	198	B	To interview for a new job	2
847	198	C	To attend an international film festival	3
848	198	D	To speak at a conference	4
849	199	A	To reserve a hotel room	1
850	199	B	To confirm meeting arrangements	2
851	199	C	To discuss an idea for a movie	3
852	199	D	To ask for transportation	4
853	200	A	He hopes to write for a British news site.	1
854	200	B	He just hired a new assistant.	2
855	200	C	He was pleased with Ms. Joshi's review of his book.	3
856	200	D	He frequently cooks special meals.	4
\.


--
-- Data for Name: question_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.question_groups (id, test_id, part, title, passage, image_url, audio_url, display_order, group_type, audio_start_time, audio_end_time) FROM stdin;
1	1	1	\N	\N	images/part1/1.jpg	\N	1	IMAGE	\N	\N
2	1	1	\N	\N	images/part1/2.jpg	\N	2	IMAGE	\N	\N
3	1	1	\N	\N	images/part1/3.jpg	\N	3	IMAGE	\N	\N
4	1	1	\N	\N	images/part1/4.jpg	\N	4	IMAGE	\N	\N
5	1	1	\N	\N	images/part1/5.jpg	\N	5	IMAGE	\N	\N
6	1	1	\N	\N	images/part1/6.jpg	\N	6	IMAGE	\N	\N
7	1	2	\N	\N	\N	audio/placement-test.mp3	7	AUDIO	\N	\N
8	1	2	\N	\N	\N	audio/placement-test.mp3	8	AUDIO	\N	\N
9	1	2	\N	\N	\N	audio/placement-test.mp3	9	AUDIO	\N	\N
10	1	2	\N	\N	\N	audio/placement-test.mp3	10	AUDIO	\N	\N
11	1	2	\N	\N	\N	audio/placement-test.mp3	11	AUDIO	\N	\N
12	1	2	\N	\N	\N	audio/placement-test.mp3	12	AUDIO	\N	\N
13	1	2	\N	\N	\N	audio/placement-test.mp3	13	AUDIO	\N	\N
14	1	2	\N	\N	\N	audio/placement-test.mp3	14	AUDIO	\N	\N
15	1	2	\N	\N	\N	audio/placement-test.mp3	15	AUDIO	\N	\N
16	1	2	\N	\N	\N	audio/placement-test.mp3	16	AUDIO	\N	\N
17	1	2	\N	\N	\N	audio/placement-test.mp3	17	AUDIO	\N	\N
18	1	2	\N	\N	\N	audio/placement-test.mp3	18	AUDIO	\N	\N
19	1	2	\N	\N	\N	audio/placement-test.mp3	19	AUDIO	\N	\N
20	1	2	\N	\N	\N	audio/placement-test.mp3	20	AUDIO	\N	\N
21	1	2	\N	\N	\N	audio/placement-test.mp3	21	AUDIO	\N	\N
22	1	2	\N	\N	\N	audio/placement-test.mp3	22	AUDIO	\N	\N
23	1	2	\N	\N	\N	audio/placement-test.mp3	23	AUDIO	\N	\N
24	1	2	\N	\N	\N	audio/placement-test.mp3	24	AUDIO	\N	\N
25	1	2	\N	\N	\N	audio/placement-test.mp3	25	AUDIO	\N	\N
26	1	2	\N	\N	\N	audio/placement-test.mp3	26	AUDIO	\N	\N
27	1	2	\N	\N	\N	audio/placement-test.mp3	27	AUDIO	\N	\N
28	1	2	\N	\N	\N	audio/placement-test.mp3	28	AUDIO	\N	\N
29	1	2	\N	\N	\N	audio/placement-test.mp3	29	AUDIO	\N	\N
30	1	2	\N	\N	\N	audio/placement-test.mp3	30	AUDIO	\N	\N
31	1	2	\N	\N	\N	audio/placement-test.mp3	31	AUDIO	\N	\N
32	1	3	\N	\N	\N	audio/placement-test.mp3	1	AUDIO	\N	\N
33	1	3	\N	\N	\N	audio/placement-test.mp3	2	AUDIO	\N	\N
34	1	3	\N	\N	\N	audio/placement-test.mp3	3	AUDIO	\N	\N
35	1	3	\N	\N	\N	audio/placement-test.mp3	4	AUDIO	\N	\N
36	1	3	\N	\N	\N	audio/placement-test.mp3	5	AUDIO	\N	\N
37	1	3	\N	\N	\N	audio/placement-test.mp3	6	AUDIO	\N	\N
38	1	3	\N	\N	\N	audio/placement-test.mp3	7	AUDIO	\N	\N
39	1	3	\N	\N	\N	audio/placement-test.mp3	8	AUDIO	\N	\N
40	1	3	\N	\N	\N	audio/placement-test.mp3	9	AUDIO	\N	\N
41	1	3	\N	\N	\N	audio/placement-test.mp3	10	AUDIO	\N	\N
43	1	3	\N	\N	images/part3/43.jpg	audio/placement-test.mp3	12	AUDIO	\N	\N
44	1	3	\N	\N	images/part3/44.jpg	audio/placement-test.mp3	13	AUDIO	\N	\N
42	1	3	\N	\N	images/part3/42.jpg	audio/placement-test.mp3	11	AUDIO	\N	\N
45	1	4	\N	\N	\N	audio/placement-test.mp3	1	AUDIO	0	0
46	1	4	\N	\N	\N	audio/placement-test.mp3	2	AUDIO	0	0
47	1	4	\N	\N	\N	audio/placement-test.mp3	3	AUDIO	0	0
48	1	4	\N	\N	\N	audio/placement-test.mp3	4	AUDIO	0	0
49	1	4	\N	\N	\N	audio/placement-test.mp3	5	AUDIO	0	0
50	1	4	\N	\N	\N	audio/placement-test.mp3	6	AUDIO	0	0
51	1	4	\N	\N	\N	audio/placement-test.mp3	7	AUDIO	0	0
52	1	4	\N	\N	\N	audio/placement-test.mp3	8	AUDIO	0	0
53	1	4	\N	\N	images/part4/95_97.jpg	audio/placement-test.mp3	9	AUDIO	0	0
54	1	4	\N	\N	images/part4/98_100.jpg	audio/placement-test.mp3	10	AUDIO	0	0
55	1	5	Question 101	\N	\N	\N	1	READING	0	0
56	1	5	Question 102	\N	\N	\N	2	READING	0	0
57	1	5	Question 103	\N	\N	\N	3	READING	0	0
58	1	5	Question 104	\N	\N	\N	4	READING	0	0
59	1	5	Question 105	\N	\N	\N	5	READING	0	0
60	1	5	Question 106	\N	\N	\N	6	READING	0	0
61	1	5	Question 107	\N	\N	\N	7	READING	0	0
62	1	5	Question 108	\N	\N	\N	8	READING	0	0
63	1	5	Question 109	\N	\N	\N	9	READING	0	0
64	1	5	Question 110	\N	\N	\N	10	READING	0	0
65	1	5	Question 111	\N	\N	\N	11	READING	0	0
66	1	5	Question 112	\N	\N	\N	12	READING	0	0
67	1	5	Question 113	\N	\N	\N	13	READING	0	0
68	1	5	Question 114	\N	\N	\N	14	READING	0	0
69	1	5	Question 115	\N	\N	\N	15	READING	0	0
70	1	5	Question 116	\N	\N	\N	16	READING	0	0
71	1	5	Question 117	\N	\N	\N	17	READING	0	0
72	1	5	Question 118	\N	\N	\N	18	READING	0	0
73	1	5	Question 119	\N	\N	\N	19	READING	0	0
74	1	5	Question 120	\N	\N	\N	20	READING	0	0
75	1	5	Question 121	\N	\N	\N	21	READING	0	0
76	1	5	Question 122	\N	\N	\N	22	READING	0	0
77	1	5	Question 123	\N	\N	\N	23	READING	0	0
78	1	5	Question 124	\N	\N	\N	24	READING	0	0
79	1	5	Question 125	\N	\N	\N	25	READING	0	0
80	1	5	Question 126	\N	\N	\N	26	READING	0	0
81	1	5	Question 127	\N	\N	\N	27	READING	0	0
82	1	5	Question 128	\N	\N	\N	28	READING	0	0
83	1	5	Question 129	\N	\N	\N	29	READING	0	0
84	1	5	Question 130	\N	\N	\N	30	READING	0	0
85	1	6	Questions 131-134	Local Barbershop Wins State Competition\n\nBy Miranda Warren\n\nMALENDA COUNTY (January 12)—Pat and Kenny's Barbershop, [131] at 3949 Grand Street, has been named the best barbershop in the state by the Barber and Hairdresser's Coalition. The criteria for selection include reputation, affordability, professionalism, and accreditations.\n\n[132].\n\nFounders and owners Kenneth Webber and Patrick Miller have been best friends since childhood. [133] opened the shop 34 years ago. [134] the shop retains its old-fashioned charm, the barbers have mastered the latest styles, not just the more traditional ones. People of all ages seeking a haircut or a new style should try Pat and Kenny's Barbershop.	\N	\N	31	READING	0	0
86	1	6	Questions 135-138	Gasgo Propane Tank Exchange\n\nYou have chosen a safe and [135] way to obtain fuel for your stoves, grills, heaters, fireplaces, or other devices. Simply follow the directions [136].\n\nWhen your tank runs out of propane, take it to our store and leave it on one of the clearly marked green shelves outside the store. [137]. Then, pay the cashier inside the store for a fresh tank of propane. Next, the cashier or another staff member will accompany you to the outdoor exchange area. The staff person will give you a full tank to take home and provide help if you have multiple tanks to carry. Follow the instructions on the tank to connect it to your device.\n\nBe sure to visit us again when you need a [138].	\N	\N	32	READING	0	0
87	1	6	Questions 139-142	To: Technicarn Enterprises Customers\nFrom: Technicarn Enterprises Customer Service\nDate: 10 September\nSubject: Serving You\n\nDear Valued Customer:\n\nWe want your [139] with Technicarn Enterprises to be easy and enjoyable. To that end, we are pleased to announce our newly designed Web site, with enhanced customer-friendly features.\n\nOur new Web site provides answers to your questions 24 hours a day, every day of the year.\n\nOn our home page, you can get information about system setup, or you can troubleshoot by visiting [140] the Internet Issues or TV and Streaming Issues pages. [141], you can find detailed information concerning account management, access, billing, and payment.\n\n[142]. Please explore the new Web site at your earliest convenience: www.technicarnenterprises.com. As always, thank you for allowing us to serve you.\n\nBest regards,\n\nThe Technicarn Enterprises Customer Service Team	\N	\N	33	READING	0	0
88	1	6	Questions 143-146	Garner City Transport Cares About the Environment\n\nBeginning May 1, the sale and use of paper tickets and transit passes will be [143] on all Garner City Transport bus and subway lines. This change applies to single-ride tickets [144] to weekly and monthly passes. Eliminating paper benefits the environment and leads to less litter.\n\nRiders can download the free Garner City Transport app. With the app, they can add money their accounts, purchase tickets, plan [145], and track arrival and departure times.\n\nAlternatively, passengers can purchase a rechargeable transit card at any station. [146]. Value can be added to the card via the Garner City Transport Web site at www.garnercitytransport.org.	\N	\N	34	READING	0	0
89	1	7	Questions 147-148	Advertisement\n\nHarbis Stationery Store Clearance Sale\n\nPrices indicated are for in-store purchases only.\n\n500 Pinstone Street / SHEFFIELD / S12HN\n\nSeasonal items\n\n• Box of ten preprinted seasonal cards (25% off) ........ £8.99\n• Box of five customizable seasonal cards or invitations (50% off) ........ £11.99\n\nAll school supplies 10% off\n\n• Box of 24 pens ........ £1.79\n• Desk lamp ........ £19.99\n• Wireless mouse ........ £17.99\n• Backpack ........ £29.99\n\nVisit Harbis Stationery at www.harbisstationery.uk	\N	\N	1	READING	0	0
90	1	7	Questions 149-150	E-Mail\n\nTo: Wenbin Peng <wpeng@chenconstruction.com>\nFrom: Toshi Auto Group <cs@toshiautogroup.com>\nDate: February 26\nSubject: Your leased vehicle\n\nDear Mr. Peng:\n\nAs you know, Toshi Auto Group handles all the service needs for cars leased by employees of Chen Construction. According to our records, you took possession of your leased car on March 1 of last year. Your car is now due for its required annual service and maintenance check. To book your appointment, please call us at (215) 555-0109 or visit us online at www.toshiautogroup.com/serviceappointments.\n\nSincerely,\n\nToshi Auto Group\nCustomer Service	\N	\N	2	READING	0	0
91	1	7	Questions 151-153	Article\n\nLONDON (2 February)—On Thursday, Tillford Press announced the launch of its new imprint, Tillford Exalt. This new series will feature books promoting healthy lifestyles, memoirs with uplifting messages, and volumes that provide guidance for special occasions such as birthdays and weddings. Tillford Exalt will also publish calendars and greeting cards that complement the main products.\n\nAlready contracted to write memoirs are award-winning actress Alexia Leoz, award-winning conductor and composer Seung-Hyun Bae, and celebrity cook Lain Lai. Ms. Lai's story of her life and career will be the first to be launched. It is set for release in December.\n\nTillford vice president Frederick Bissett said the company saw a need for books that celebrated accomplishments and life events from multiple perspectives. "We wanted authors from a wide variety of cultural backgrounds, and we think we're off to a great start," he said. He noted that Tillford Exalt's authors were not always famous; the books will be exploring their beginnings, their everyday lives, their first jobs, their marriages—and their achievements.\n\nTillford Press is based in Manchester. It has offices in New York, Toronto, and Sydney, but its publications are sold throughout the world.	\N	\N	3	READING	0	0
92	1	7	Questions 154-155	Text-message chain\n\nGreg Skagen (8:58 A.M.): Hi, Brenda. I'm here in the warehouse. All of my trainees have arrived, but I noticed the power door at Loading Dock B is acting up.\n\nBrenda Sadauskas (8:59 A.M.): Again?\n\nGreg Skagen (8:59 A.M.): When I push the button to open it, it raises all the way up but then drops back down to the closed position after about 30 seconds.\n\nBrenda Sadauskas (9:00 A.M.): I'll come down with the maintenance technicians. Why don't you bring your trainees to my area? You can teach them how to create shipping labels and then have them pack and label this morning's shipments.\n\nGreg Skagen (9:02 A.M.): Yes, that works.\n\nBrenda Sadauskas (9:03 A.M.): Thanks. Then you could show them the loading dock operations in the afternoon.	\N	\N	4	READING	0	0
93	1	7	Questions 156-157	Service Request Form\n\nComplete all fields and deliver to Technology Services (room 412).\n\nRequester Name: Elenor Deckow\n\nRequester Office: Room 718\n\nRequester Phone: Ext. 5709\n\nService Location: Room 500\n\nService Type (choose one): Repair\n\nDescription of Request\n\nThere is a problem with the television audio. When I played an online video, the image was fine, but I could not hear anything. I checked all the settings, and I was able to hear the same video on other televisions with no problem.\n\nI'm supposed to deliver a product demonstration for a client in room 500 next Monday, so I would greatly appreciate it if the issue can be fixed by this Friday.	\N	\N	5	READING	0	0
94	1	7	Questions 158-161	Text-message chain\n\nElla Glatt (11:34 A.M.)\nHi. I know this is a busy day, but I wanted to know whether anyone from the finance team could come to the marketing meeting.\n\nStef Goldberg (11:35 A.M.)\nHi, Ella. I wish I could, but it starts at 2:00. I need to be at a different meeting at 2:30.\n\nElla Glatt (11:36 A.M.)\nOh, right. I forgot you were going to the executive board meeting.\n\nDaniel Seidal (11:36 A.M.)\nI'm also supposed to go to the 2:30 meeting. Is it essential that one of us attend the marketing meeting?\n\nElla Glatt (11:37 A.M.)\nWell, it would be helpful to have someone from the finance department there at least for 15 minutes or so.\n\nBill Iverman (11:38 A.M.)\nThe quarterly reports just came in, and Daniel, Stef, and I need to review them by the end of the day.\n\nElla Glatt (11:39 A.M.)\nYou all have plenty to do.\n\nDaniel Seidal (11:41 A.M.)\nThat's true! But I could come from 2:00 to 2:15. That's all I can commit to.\n\nElla Glatt (11:43 A.M.)\nSounds great. We just need one of you to clarify a few quick points about the budget for the next advertising campaign.	\N	\N	6	READING	0	0
95	1	7	Questions 162-165	E-Mail\n\nTo: amal.abboud@bunzifoundation.org\nFrom: maria_mcfarland@myemail.com\nDate: Thursday, August 22\nSubject: Project Coordinator Position\nAttachment: résumé_m.mcfarland.pdf\n\nDear Mr. Abboud,\n\nMy friend Josiah Wilkins told me that you are seeking a project coordinator for your company. I have a degree in business administration and am attaching my résumé as I think I am an excellent fit for your needs. As you will see, I have experience using several cloud-based project-management programs. Furthermore, my organizational skills enable me to coordinate multiple activities simultaneously, and I can convey expectations clearly to team members involved in each phase of a project.\n\nMy current role as project coordinator for an international engineering firm, where I have worked for the past five years, has also afforded me ample experience managing teams, schedules, and budgets. While I enjoy the kind of work I do, it has become clear to me that I need motivation from a strong mission. The goal of your company to create sustainable housing projects is something that I strongly support and would be delighted to work on.\n\nThrough my work and volunteer activities, I have spent many months abroad in various countries throughout Asia and the Middle East. This seems particularly relevant to mention, as I am comfortable leading geographically and culturally diverse teams.\n\nThank you for your attention, and I look forward to speaking with you soon.\n\nKind regards,\n\nMaria McFarland	\N	\N	7	READING	0	0
96	1	7	Questions 166-168	Web Page\n\nhttps://trexdale.com/aboutus\n\nAbout Our Company\n\nTrexdale Supply specializes in designing, producing, and installing furniture for all types of scientific laboratories. We provide a range of fully assembled cabinets, workstations, benches, and more, all made exclusively at our production facility in Dallas, Texas. Our lab furniture is available in a wide variety of sizes and configurations to match the needs of any research application.\n\nOur business offers products as well as design-consulting services. For start-up labs, we have a team of consulting specialists available to evaluate your facility's specific needs and assist you in arranging your space and choosing the most suitable furniture. Recently, for example, we were chosen by a major producer of biofuels to provide expert help in changing the layout of a research laboratory to maximize available space. As a result of this project, this client has realized substantial savings by reducing energy usage in the lab.\n\nPlease visit the "Lab Planning" section of this Web site if you are interested in learning more about building or renovating a laboratory facility. There, you can fill out an interest form to contact one of our consultants about your next project.	\N	\N	8	READING	0	0
97	1	7	Questions 169-171	Job Advertisement\n\nPRODUCT DEMONSTRATORS NEEDED!\n\nAre you outgoing and enthusiastic? -- [1] --. Do you enjoy talking to all types of people? Put your personality and communication skills to work! -- [2] --. BBD Staffing is seeking to hire in-store product demonstrators to promote our clients' merchandise to shoppers. -- [3] --. As a member of our team, you will demonstrate a wide range of small kitchen appliances and tools in grocery stores and other retail venues.\n\nFor some products, you will be required to prepare simple recipes. You will also need to answer shoppers' questions. Thus, it is essential that you can become familiar with clients' products and provide key information to consumers. Because many of the demonstrations require working with food, candidates must have a Professional Food Handler certificate. -- [4] --.\n\nTo apply, upload a video of no more than one minute in length telling us why you would be a successful product demonstrator at www.bbdstaffing.com/applications.	\N	\N	9	READING	0	0
98	1	7	Questions 172-175	Article\n\nGorman Unveils Newest Smartphone Model\n\nLONDON (20 April)—Gorman Mobile unveiled its newest smartphone to an eager reception at the annual Technobrit Conference. The Pro Phone 4, which includes 512 GB of storage, a 7-inch screen display, and an optional stylus pen, will hit the shelves on 11 June. Unlike its predecessor—the Pro Phone 3—it features a larger screen, an ultrawide camera lens, and 8K-resolution filming capability.\n\n-- [1] --. The £999 starting price is £100 more than that of the previous model. Add-ons, such as the stylus pen, protective case, and wireless headphones, cost an additional £39, £59, and £79, respectively.\n\nGorman Product Manager Ian Hill doesn't believe the price increase will dissuade customers. -- [2] --.\n\n"The Pro Phone 4 is a game changer in terms of its picture quality and sleek design," said Hill. "Improvements were based on direct customer feedback, which cited the poor camera functionality as the biggest drawback of prior models. Our clients spoke, and we listened and adapted accordingly."\n\n-- [3] --.\n\n"One similarity that the Pro Phone 4 has with previous models is the charger. Going against the trend of competing wireless companies, Gorman is instead focusing on convenience.\n\n"We want to afford our customers the ability to reuse elements of the other Gorman devices they've already purchased," said Hill. "Why add to the overload of cables already in circulation?" -- [4] --.	\N	\N	10	READING	0	0
99	1	7	Questions 176-180	Work Order\n\nWORK ORDER: 7549\n\nRequester: Xi, Gina\nDate Entered: Wednesday, 9 April\nDate Due: Thursday, 10 April\nType: Technology end-user request\nSummary: Voice-mail security settings\nTechnician Assigned: Arnold, Sam\nComputer Workstation ID: HYS31\n\nDescription:\n\nIs it possible to remove the new layers of security on my voice mail in the new phone system? I really don't want to use a password, and I certainly don't want to change it every month. I don't need a high degree of security because my work is not confidential. If someone else gained access to my messages, it wouldn't do much harm.\n\nE-Mail\n\nTo: Gina Xi\nFrom: Sam Arnold\nDate: Thursday, 10 April\nSubject: Tech support request 7549\n\nHello, Ms. Xi,\n\nThis is in reference to your work order 7549 related to the new phone system. I am happy to help you with that. I understand that you do not feel that a high degree of security is needed for your voice-mail settings, but the new system does require you to have a password to retrieve your voice mail. However, company policy allows me to change the settings for employees who do not work with confidential material. I can reduce the security settings so that you do not have to reset the password on a regular basis.\n\nI want to make sure that you understand the risk involved with a lower level of security. Anyone who gains access to your voice-mail account can do more than simply listen to your messages. They would be able to delete messages, change your greeting, or change your password so that you would lose access to your own voice mail (at least until someone here at IT could override the password change). If you still feel comfortable with that level of risk, let me know, and I will change the settings so that your password never expires.\n\nSam Arnold\n\nTech Support Associate	\N	\N	11	READING	0	0
100	1	7	Questions 181-185	E-Mail\n\nTo: Linda Hanshu\nFrom: Cliff Merson\nSubject: Lighting Issue\nDate: September 4, 10:12 A.M.\n\nHi, Ms. Hanshu:\n\nI want to check on the issue we discussed about lighting in the latest chapter of Titan Adventure. In past versions of the game, getting the reflections and lighting in green and blue areas correct has been a particular challenge, and it was a problem that kept arising. As the new release, Neptune's Voyage, is primarily an underwater adventure, addressing this problem is crucial. You said you would take charge of this, and I hope to hear that you have found a solution to the problem. The team was hoping to have one last rendering of the lighting for the game by October 10 for a preliminary run-through. Will the final version of the lighting be ready by then?\n\nAll other aspects of the game are on schedule. Please send me an update about the lighting at your earliest convenience.\n\nRegards,\n\nCliff Merson\nProject Manager, Rimerko Games\n\nReview\n\nReview of Titan Adventure: Neptune's Voyage\nBy Leo Weber, April 1\n\nThis new installment of Titan Adventure will surprise and delight both new players and old aficionados long familiar with the series. Though open-world formats have been widespread in recent years, Neptune's Voyage brings something new to the format. By stripping down instructional guides, the game gives users the opportunity to discover new areas and devices. In Neptune's Voyage, you wake up as Thetis, a dolphin that is tasked with rescuing Neptune from an underwater cave. Users then climb, run, ride, sail, and fly through the world of the game, encountering new towns, ruins, and other creatures along the way. Some of these creatures will be familiar to longtime fans, but there is plenty of novelty as well. This newest version also corrects the green and blue image rendering that was sometimes a problem in earlier installments of Titan Adventure.\n\nNeptune's Voyage launches May 5 on Rimerko Clutch and FS5. It is available in English, Korean, Japanese, French, and Spanish.	\N	\N	12	READING	0	0
101	1	7	Questions 186-190	Wonder Ridge Radio Broadcast Schedule, Monday–Friday\n\n6 A.M.–Noon\nCOFFEE BREAK\nLocal news and interviews with community members\nHost: Felice Finney\n\nNoon–4 P.M.\nAFTERNOON JAZZ\nMusic from traditional jazz to jazz fusion\nHost: Malachi Mzee\n\n4 P.M.–7 P.M.\nFOLK FRENZY\nFolk music from around the world\nHost: Penny Ariza\n\n7 P.M.–10 P.M.\nJOSIE'S JOINT\nModern sounds selected by our station's own music director\nHost: Josie Jones\n\nE-Mail\n\nTo: feedback@wonderridgeradio.org\nFrom: pfabre@sendmail.net\nSubject: My new radio station!\nDate: October 22\n\nTo the folks at Wonder Ridge Radio:\n\nAs I was driving last week, I got tired of listening to sports talk and turned the dial. Suddenly, my car was filled with a song that I hadn't heard in many years. It was a traditional music from France, where my grandmother was born. She used to play that song when I was a child. I never expected to hear it on the radio here in Wonder Ridge. Thanks for this experience and for all your great programs.\n\nYour new fan,\n\nPierre Fabre\n\nWonder Ridge Radio Job Opening: Programming Assistant\n\nPosted November 2\n\nJob Description\n\nThe programming assistant reports to the director of programming and supports the radio station by performing a variety of research and communication functions. This role is an entry-level, part-time position.\n\nResponsibilities\n\n• Conducting background research on interviewees\n• Keeping up-to-date on news and news makers in order to suggest potential topics and guests for on-air interviews\n• Updating the station's Web site and program host biography pages\n• Using scheduling software to update the broadcast schedule\n• Communicating with listeners, especially via e-mail and social media\n\nTo apply, e-mail a résumé and cover letter to hiring@wonderridgeradio.org.	\N	\N	13	READING	0	0
102	1	7	Questions 191-195	Instructions for Requesting Records\n\nThank you for your interest in official records and documents maintained by the City of Abilene. To file a request for public information, please follow these steps.\n\n1. Create an account in the Records Center Web portal. Currently, all requests must be made through the portal.\n\n2. Use the drop-down menu to locate the department from which you are seeking information and submit your request. You will receive a confirmation e-mail with a reference number.\n\n3. The department staff will locate the requested records and contact you when they are available. You can have the records delivered to you, or you can pick them up in person. If you prefer to pick them up in person, you must make an appointment with the department staff.\n\n4. If there are any fees associated with your request, you will receive an itemized statement detailing the services provided and the charges for those specific services.\n\nE-Mail Message\n\nTo: Joo-Hee Park <jhpark@coa.net>\nFrom: Keith Brandenberg <kbrandenberg@mailcurrent.com>\nDate: May 3\nSubject: RE: Reference number W2486\n\nDear Ms. Park,\n\nThank you for confirming that my documents are available. I would like to pick them up in person as soon as possible. Do you have any appointments available this week?\n\nI have a question about the fee. Apparently, I am being charged $300 for my documents. I do not understand why the fee is so high, and there was no explanation included in your e-mail. I have requested records several times in the past in my role with RJ Environmental Engineering and have never paid such a high fee. In this case, I am only requesting two maps of the city's underground pipelines, which will inform our firm's current work advising the city on wastewater management.\n\nPlease clarify this for me, and let me know if I can pick up my documents this week.\n\nThank you.\n\nBest regards,\n\nKeith Brandenberg\n\nCity of Abilene Administrative Building\n\nVisitors must sign in prior to entering this facility.\nPlease enter your name and the room you will visit in the logbook.\n\nFirst-Floor Directory:\nIT Services — Room 100\nParks and Recreation — Room 101\nTransportation — Room 102\nWastewater — Room 103	\N	\N	14	READING	0	0
103	1	7	Questions 196-200	Famous Actor, First Book\n\nLONDON (25 February)—Fans of Simon Eklund will be delighted with his autobiography, The Theatre Lights Dimmed, the first book he has written in his storied career as an actor. It provides wonderful insight into his career, starting with his first roles in cinema in his native Sweden, moving into his work in France and Italy, and finishing with his recent theatre work in the U.K.\n\nIn his book, Mr. Eklund dedicates a fair amount of text to discussing his mentor, Charles Gunnarsson, who helped him develop his skills early on in Stockholm. He also describes the difficulty of transitioning into different types of roles, especially from comedic to dramatic acting. He includes several funny anecdotes about his first attempts at acting onstage here in London. He describes them as disastrous, but anyone who saw his recent performance in Life and Games would say just the opposite.\n\nMr. Eklund has long been a captivating actor on stage and screen, and now he is a thoroughly engaging author.\n\n—Uma Joshi\n\nE-Mail\n\nTo: Edith Hocking\nFrom: Uma Joshi\nDate: 2 March\nSubject: RE: Opportunity\n\nDear Edith,\n\nThank you for agreeing to arrange an interview with Mr. Eklund for me. I think this will be a great follow-up to my recent piece.\n\nIn a helpful coincidence, I will be visiting his home country next month to address a journalists' convention. I am the featured speaker and will discuss the benefits of diversity in journalism. I'm sure we can set up something with Mr. Eklund just before or after my speech.\n\nBest,\n\nUma Joshi\nArts and Culture Editor\nTop News U.K.\n\nE-Mail\n\nTo: Uma Joshi <ujoshi@topnews.co.uk>\nFrom: Maria Cazalla <mcazalla@zephyrmail.se>\nDate: 20 March\nSubject: RE: Information\n\nDear Ms. Joshi,\n\nWe are all very excited about your interview next month with Mr. Eklund. He enjoys all your writing for Top News U.K.—the news stories, interviews, and, of course, your recent article about The Theatre Lights Dimmed!\n\nI just wanted to finalize a few details with you. We have arranged transportation for you from your hotel to Mr. Eklund's house and then back to the hotel. Please let me know how many people there will be in your group, because Mr. Eklund would like you all to stay for lunch.\n\nSincerely,\n\nMaria Cazalla	\N	\N	15	READING	0	0
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.questions (id, group_id, question_number, question_text, correct_answer, explanation, display_order) FROM stdin;
1	1	1	\N	D	\N	1
2	2	2	\N	C	\N	1
3	3	3	\N	B	\N	1
4	4	4	\N	C	\N	1
5	5	5	\N	D	\N	1
6	6	6	\N	A	\N	1
7	7	7	\N	B	\N	1
8	8	8	\N	A	\N	1
9	9	9	\N	B	\N	1
10	10	10	\N	C	\N	1
11	11	11	\N	A	\N	1
12	12	12	\N	B	\N	1
13	13	13	\N	A	\N	1
14	14	14	\N	C	\N	1
15	15	15	\N	A	\N	1
16	16	16	\N	C	\N	1
17	17	17	\N	B	\N	1
18	18	18	\N	B	\N	1
19	19	19	\N	C	\N	1
20	20	20	\N	A	\N	1
21	21	21	\N	C	\N	1
22	22	22	\N	C	\N	1
23	23	23	\N	B	\N	1
24	24	24	\N	A	\N	1
25	25	25	\N	B	\N	1
26	26	26	\N	A	\N	1
27	27	27	\N	C	\N	1
28	28	28	\N	A	\N	1
29	29	29	\N	C	\N	1
30	30	30	\N	B	\N	1
31	31	31	\N	B	\N	1
32	32	32	Why is the woman calling?	A	\N	1
33	32	33	Why does the man apologize?	D	\N	2
34	32	34	What does the man remind the woman about?	C	\N	3
35	33	35	What event will the speakers be attending later today?	C	\N	1
36	33	36	Why does the man say, "she has a van"?	A	\N	2
37	33	37	What will the woman most likely do next?	B	\N	3
38	34	38	Where do the speakers work?	A	\N	1
39	34	39	What does the woman say she is concerned about?	B	\N	2
40	34	40	What does the man suggest that the woman do?	D	\N	3
41	35	41	Why is the woman calling?	C	\N	1
42	35	42	What event is the woman planning to attend?	B	\N	2
43	35	43	What does the man give the woman as an apology?	D	\N	3
44	36	44	Where does the woman work?	C	\N	1
45	36	45	What problem with some e-mails does the man mention?	D	\N	2
46	36	46	What will the woman most likely do next?	B	\N	3
47	37	47	What is the conversation mainly about?	B	\N	1
48	37	48	What does the woman say people at the company are currently working on?	A	\N	2
49	37	49	Why is the man concerned?	D	\N	3
50	38	50	What are the speakers preparing for?	C	\N	1
51	38	51	What does the woman say will be delivered in an hour?	D	\N	2
52	38	52	What will the speakers most likely do next?	A	\N	3
53	39	53	What event are the speakers discussing?	C	\N	1
54	39	54	What does the man mean when he says, "there's a lot of damage"?	C	\N	2
55	39	55	What does the woman recommend?	A	\N	3
56	40	56	What industry do the speakers most likely work in?	A	\N	1
57	40	57	According to the man, why has a software program become popular?	B	\N	2
58	40	58	What might Marion still need to do?	A	\N	3
59	41	59	What are the speakers discussing?	C	\N	1
60	41	60	What challenge does Stan mention?	B	\N	2
61	41	61	What does Pedro say he will do?	A	\N	3
62	42	62	According to the man, why is today's Sea-Ride Special tour popular?	A	\N	2
63	42	63	Look at the graphic. What time will the woman depart on a tour?	D	\N	1
64	42	64	What will the woman most likely do next?	B	\N	3
65	43	65	Why does the woman apologize?	D	\N	1
66	43	66	Look at the graphic. Which location does the woman recommend?	C	\N	2
67	43	67	Why is the man in a hurry?	A	\N	3
68	44	68	Why does the woman call?	B	\N	1
69	44	69	Look at the graphic. What is the price of the item the woman wants to buy?	D	\N	2
70	44	70	What will the man most likely do tomorrow?	D	\N	3
71	45	71	What feature of a business does the speaker emphasize?	C	\N	1
72	45	72	What can attendees do at the grand opening event?	D	\N	2
73	45	73	What does the speaker advise event attendees to do?	B	\N	3
74	46	74	What does the listener want to do?	C	\N	1
75	46	75	Why does the speaker say, "those rooms are always booked far in advance"?	D	\N	2
76	46	76	According to the speaker, what should the listener bring?	B	\N	3
77	47	77	Who most likely is the speaker?	C	\N	1
78	47	78	What does the speaker advise the listeners to do?	A	\N	2
79	47	79	What does the speaker say she is going to do next?	B	\N	3
80	48	80	Why will the speaker be traveling?	D	\N	1
81	48	81	Why is the speaker concerned?	C	\N	2
82	48	82	What does the speaker ask the listener to do?	A	\N	3
83	49	83	What does the speaker remind the listeners to do?	D	\N	1
84	49	84	According to the speaker, what can the listeners apply for?	A	\N	2
85	49	85	How can the listeners get information about future events?	A	\N	3
86	50	86	What service does the business offer?	B	\N	1
87	50	87	According to the speaker, how is the business different from its competitors?	D	\N	2
88	50	88	How can the listeners make an appointment?	C	\N	3
89	51	89	Who most likely are the listeners?	A	\N	1
90	51	90	What does the speaker mean when he says, "they received over 200 applications"?	B	\N	2
91	51	91	Why does the speaker say that work cannot begin right away?	D	\N	3
92	52	92	What is the purpose of the talk?	D	\N	1
93	52	93	Where is the talk taking place?	C	\N	2
94	52	94	What does the speaker mean when she says, "I have a consultation with a client"?	B	\N	3
95	53	95	What is the main purpose of the call?	A	\N	1
96	53	96	Look at the graphic. Which model does the speaker prefer?	D	\N	2
97	53	97	What does the speaker ask about?	C	\N	3
98	54	98	Who most likely are the listeners?	C	\N	1
99	54	99	Look at the graphic. What was the approval rating of the feature that will be improved?	B	\N	2
100	54	100	According to the speaker, why is a revision urgent?	B	\N	3
101	55	101	When she held her last meeting, Ms. Toba ------- her sales staff to perform even better next quarter.	C	\N	1
102	56	102	All staff have been informed ------- the proposed partnership with ERI Finance.	B	\N	1
103	57	103	On Friday, Mr. Nakamura will discuss ------- ideas for supporting busy waiters.	A	\N	1
104	58	104	The Forestry Commission was created to ------- the state's natural resources and wildlife.	B	\N	1
105	59	105	By following established guidelines, construction workers will be able to complete their tasks -------.	D	\N	1
106	60	106	With her numerous credentials, Dr. Kwan is highly ------- to teach medieval history at Maston University.	D	\N	1
107	61	107	------- at the annual technology conference is mandatory for all engineers at the Treemont Corporation.	A	\N	1
108	62	108	The café ------- features poets, folk singers, and drama groups on its stage.	B	\N	1
109	63	109	Before the seminar began, attendees were assured ------- all scheduled presenters would appear.	C	\N	1
110	64	110	Forever Pet has been a leader in bringing new products, ------- Fun Bone and Chew Right, to the market.	D	\N	1
111	65	111	Ms. Turner is in charge of ------- the organization of records in the human services department.	C	\N	1
112	66	112	Sheefon Bank clients always receive an e-mail or text ------- following any change to their account password.	B	\N	1
113	67	113	A drop in consumer demand has led to a ------- decrease in the production of large pickup trucks.	D	\N	1
114	68	114	After coating the potatoes in flour and spices, chefs should place them ------- into the deep fryer.	D	\N	1
115	69	115	Several banks have released applications that allow ------- customers to pay bills easily by phone.	A	\N	1
116	70	116	The personnel department will ------- only those applicants who have five or more years of experience for the position.	B	\N	1
117	71	117	Employees of Belfore Electronics Ltd. are ------- involved in community-assistance programs.	B	\N	1
118	72	118	The executives at Macalter Equipment decided they would not ------- the contract without major changes.	A	\N	1
119	73	119	Wet suits are made with a ------- layer of rubber that traps heat and keeps divers warm.	C	\N	1
120	74	120	Newcamp Services managers will meet to discuss the proposed ------- of three smaller branches into one large branch.	D	\N	1
121	75	121	At Yarzen Technology, clients' records are ------- and can only be accessed by a small group of fund managers.	B	\N	1
122	76	122	The featured panel at the NHJ Medical Conference will discuss recent ------- in online health-care services.	C	\N	1
123	77	123	All of Millville's restaurants ------- several times a year by the city health department.	D	\N	1
124	78	124	Sweet Sunlight Bakery has steadily built a ------- base of customers with its delicious cookies and cakes.	B	\N	1
125	79	125	According to financial analysts, ------- in medical technology companies are expected to increase in value.	D	\N	1
126	80	126	The city's harbor is ------- to container ships and fishing vessels of all sizes.	A	\N	1
127	81	127	Maya's Dancewear expanded its advertising markets, and sales have ------- increased.	B	\N	1
128	82	128	Dobson Ice Cream will not introduce any new flavors ------- the customer survey results are analyzed.	B	\N	1
129	83	129	The renovated company gym ------- with free weights and exercise machines.	C	\N	1
130	84	130	------- driving their cars, workers who travel to the town center should use the bus lines.	B	\N	1
131	85	131	Select the best option for space [131].	B	\N	1
132	85	132	Select the best option for space [132].	C	\N	2
133	85	133	Select the best option for space [133].	C	\N	3
134	85	134	Select the best option for space [134].	A	\N	4
135	86	135	Select the best option for space [135].	D	\N	1
136	86	136	Select the best option for space [136].	A	\N	2
137	86	137	Select the best option for space [137].	C	\N	3
138	86	138	Select the best option for space [138].	D	\N	4
139	87	139	Select the best option for space [139].	A	\N	1
140	87	140	Select the best option for space [140].	A	\N	2
141	87	141	Select the best option for space [141].	D	\N	3
142	87	142	Select the best option for space [142].	D	\N	4
143	88	143	Select the best option for space [143].	B	\N	1
144	88	144	Select the best option for space [144].	D	\N	2
145	88	145	Select the best option for space [145].	A	\N	3
146	88	146	Select the best option for space [146].	C	\N	4
147	89	147	What is indicated about Harbis Stationery Store?	A	The advertisement states that all school supplies are 10% off, indicating that the store sells materials for students.	1
148	89	148	What item is discounted by the greatest percentage?	B	The box of five customizable seasonal cards or invitations is discounted by 50%, which is the greatest discount mentioned.	2
149	90	149	What is the purpose of the e-mail?	B	The e-mail reminds Mr. Peng that his leased vehicle is due for its required annual service and maintenance check.	1
150	90	150	What is indicated about Chen Construction?	C	The e-mail states that Toshi Auto Group handles the service needs for cars leased by employees of Chen Construction, indicating that some employees are provided with leased cars.	2
151	91	151	What is the main purpose of the article?	C	The article announces the launch of Tillford Exalt, a new imprint that will publish a series of books.	1
152	91	152	What is planned for December?	B	The article states that Lain Lai's memoir, telling the story of her life and career, will be released in December.	2
153	91	153	What does Frederick Bissett emphasize about Tillford Exalt?	D	Frederick Bissett emphasizes that the imprint features authors from a wide variety of cultural backgrounds.	3
154	92	154	What problem does Mr. Skagen mention?	D	Mr. Skagen explains that the power door at Loading Dock B opens but closes again after about 30 seconds, indicating that the access door is malfunctioning.	1
155	92	155	At 9:02 A.M., what does Mr. Skagen most likely mean when he writes, "Yes, that works"?	C	He agrees with Brenda's suggestion that the trainees create shipping labels and pack shipments before learning loading dock operations in the afternoon.	2
156	93	156	Why was the form submitted?	C	The requester explains that the television displays video correctly but has no sound, so the audio is not functioning properly.	1
157	93	157	What is Ms. Deckow planning to do next week?	D	She states that she is supposed to deliver a product demonstration for a client next Monday, which means she will give a presentation.	2
158	94	158	At what time will the executive board meeting begin?	C	Stef says he needs to be at a different meeting at 2:30, and Ella identifies it as the executive board meeting.	1
159	94	159	In what area does Mr. Iverman most likely work?	B	Bill says the quarterly reports need to be reviewed and refers to the finance team, indicating that he most likely works in Finance.	2
160	94	160	Why does Ms. Glatt want a colleague to attend a meeting?	C	She explains that someone from the finance department is needed to clarify a few points about the budget.	3
161	94	161	At 11:43 A.M., what does Ms. Glatt most likely mean when she writes, "Sounds great"?	A	She is responding positively to Daniel Seidal's offer to attend the marketing meeting from 2:00 to 2:15.	4
162	95	162	What does Ms. McFarland mention about Mr. Wilkins?	A	\N	1
163	95	163	The word "convey" in paragraph 1, line 5, is closest in meaning to	B	\N	2
164	95	164	Why does Ms. McFarland want to leave her current position?	D	\N	3
165	95	165	Why does Ms. McFarland mention her travels?	D	\N	4
166	96	166	What does Trexdale Supply make?	C	\N	1
167	96	167	What did Trexdale Supply do in a recent project?	A	\N	2
168	96	168	What method of communicating with Trexdale Supply is mentioned?	D	\N	3
169	97	169	What work experience would best qualify a candidate for the position?	A	\N	1
170	97	170	According to the advertisement, what should people interested in applying do next?	C	\N	2
171	97	171	In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? "Many of the world's best-known brands rely on our product demonstrators to generate positive impressions of their products."	B	\N	3
172	98	172	What is the purpose of the article?	B	\N	1
173	98	173	How much do the Gorman Pro Phone 4 wireless headphones cost?	C	\N	2
174	98	174	What does the Pro Phone 4 have in common with prior models?	D	\N	3
175	98	175	In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? "These upgrades do come at a cost."	A	\N	4
176	99	176	What does Ms. Xi's request indicate about the company?	C	\N	1
177	99	177	In the e-mail, the word "regular" in paragraph 1, line 6, is closest in meaning to	A	\N	2
178	99	178	Where did Mr. Arnold learn about the details of Ms. Xi's request?	B	\N	3
179	99	179	How does Mr. Arnold try to satisfy Ms. Xi's request?	D	\N	4
180	99	180	What does Mr. Arnold ask Ms. Xi to do?	C	\N	5
181	100	181	In the e-mail, what is suggested about Mr. Merson?	A	\N	1
182	100	182	In the review, what is indicated about Neptune's Voyage?	B	\N	2
183	100	183	What can be concluded about Ms. Hanshu?	B	\N	3
184	100	184	What does Mr. Weber find exciting about Neptune's Voyage?	D	\N	4
185	100	185	When will Neptune's Voyage be available?	D	\N	5
186	101	186	According to the schedule, who is Ms. Jones?	C	\N	1
187	101	187	What is the purpose of the e-mail?	A	\N	2
188	101	188	When did Mr. Fabre most likely first listen to Wonder Ridge Radio?	C	\N	3
189	101	189	What does the job advertisement suggest applicants must have?	B	\N	4
190	101	190	What radio program will probably receive the most support from the programming assistant?	A	\N	5
191	102	191	What do the instructions indicate about records requests?	B	\N	1
192	102	192	According to the e-mail, how does Mr. Brandenberg plan to use some public information?	B	\N	2
193	102	193	What does the sign indicate visitors must do before entering a building?	D	\N	3
194	102	194	What was Mr. Brandenberg expecting to receive?	A	\N	4
195	102	195	What room will Mr. Brandenberg most likely visit?	D	\N	5
196	103	196	What does the review mention about Mr. Eklund?	C	\N	1
197	103	197	Where most likely will Ms. Joshi meet Mr. Eklund?	A	\N	2
198	103	198	According to the first e-mail, what is one reason Ms. Joshi will travel in April?	D	\N	3
199	103	199	What is the purpose of the second e-mail?	B	\N	4
200	103	200	What can be concluded about Mr. Eklund?	C	\N	5
\.


--
-- Data for Name: tests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tests (id, title, duration, total_questions, created_at, description, is_active) FROM stdin;
1	TOEIC Placement Test	120	200	2026-07-24 11:32:34.91731	Bài kiểm tra đầu vào	t
\.


--
-- Name: UserProfile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."UserProfile_id_seq"', 2, true);


--
-- Name: UserVocabulary_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."UserVocabulary_id_seq"', 1, false);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 1, true);


--
-- Name: VocabularyReview_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."VocabularyReview_id_seq"', 1, false);


--
-- Name: VocabularyWord_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."VocabularyWord_id_seq"', 1, false);


--
-- Name: options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.options_id_seq', 856, true);


--
-- Name: question_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.question_groups_id_seq', 103, true);


--
-- Name: questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.questions_id_seq', 200, true);


--
-- Name: tests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tests_id_seq', 1, true);


--
-- Name: UserProfile UserProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserProfile"
    ADD CONSTRAINT "UserProfile_pkey" PRIMARY KEY (id);


--
-- Name: UserVocabulary UserVocabulary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserVocabulary"
    ADD CONSTRAINT "UserVocabulary_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: VocabularyReview VocabularyReview_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."VocabularyReview"
    ADD CONSTRAINT "VocabularyReview_pkey" PRIMARY KEY (id);


--
-- Name: VocabularyWord VocabularyWord_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."VocabularyWord"
    ADD CONSTRAINT "VocabularyWord_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: options options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.options
    ADD CONSTRAINT options_pkey PRIMARY KEY (id);


--
-- Name: question_groups question_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_groups
    ADD CONSTRAINT question_groups_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: tests tests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_pkey PRIMARY KEY (id);


--
-- Name: UserProfile_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserProfile_userId_key" ON public."UserProfile" USING btree ("userId");


--
-- Name: UserVocabulary_userId_vocabularyWordId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserVocabulary_userId_vocabularyWordId_key" ON public."UserVocabulary" USING btree ("userId", "vocabularyWordId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: VocabularyWord_word_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "VocabularyWord_word_key" ON public."VocabularyWord" USING btree (word);


--
-- Name: UserProfile UserProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserProfile"
    ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserVocabulary UserVocabulary_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserVocabulary"
    ADD CONSTRAINT "UserVocabulary_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."UserProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserVocabulary UserVocabulary_vocabularyWordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserVocabulary"
    ADD CONSTRAINT "UserVocabulary_vocabularyWordId_fkey" FOREIGN KEY ("vocabularyWordId") REFERENCES public."VocabularyWord"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: VocabularyReview VocabularyReview_userVocabularyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."VocabularyReview"
    ADD CONSTRAINT "VocabularyReview_userVocabularyId_fkey" FOREIGN KEY ("userVocabularyId") REFERENCES public."UserVocabulary"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: options options_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.options
    ADD CONSTRAINT options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id);


--
-- Name: question_groups question_groups_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_groups
    ADD CONSTRAINT question_groups_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id);


--
-- Name: questions questions_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.question_groups(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict ZvVZYhDhnfzUhtEVtYBasyIXepHMSs6exjwYtswIkQVLb1UQdDQWq8O2TQp1It7

