--
-- PostgreSQL database dump
--

\restrict cRBe940TSdSBQmCsxSNuUzfPY0BdUK8hvW0Rd0HQmxaOakg1OIp75FZhmAvVzpi

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
-- Name: user_vocabulary_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_vocabulary_progress (
    id integer NOT NULL,
    user_id integer NOT NULL,
    vocabulary_id integer NOT NULL,
    learned_at timestamp without time zone,
    review_count integer DEFAULT 0,
    next_review timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    status character varying(20) DEFAULT 'NEW'::character varying NOT NULL,
    review_level smallint DEFAULT 0 NOT NULL,
    last_review timestamp without time zone,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_vocabulary_progress OWNER TO postgres;

--
-- Name: user_vocabulary_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_vocabulary_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_vocabulary_progress_id_seq OWNER TO postgres;

--
-- Name: user_vocabulary_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_vocabulary_progress_id_seq OWNED BY public.user_vocabulary_progress.id;


--
-- Name: vocabulary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vocabulary (
    id integer NOT NULL,
    english character varying(255) NOT NULL,
    type character varying(50),
    vietnamese text,
    pronounce character varying(255),
    explain text,
    example text,
    example_vietnamese text,
    image_url text,
    audio_url text,
    topic character varying(255),
    topic_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    stage smallint DEFAULT 1 NOT NULL,
    CONSTRAINT vocabulary_stage_check CHECK (((stage >= 1) AND (stage <= 5)))
);


ALTER TABLE public.vocabulary OWNER TO postgres;

--
-- Name: vocabulary_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vocabulary_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vocabulary_id_seq OWNER TO postgres;

--
-- Name: vocabulary_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vocabulary_id_seq OWNED BY public.vocabulary.id;


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: UserProfile id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserProfile" ALTER COLUMN id SET DEFAULT nextval('public."UserProfile_id_seq"'::regclass);


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
-- Name: user_vocabulary_progress id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_vocabulary_progress ALTER COLUMN id SET DEFAULT nextval('public.user_vocabulary_progress_id_seq'::regclass);


--
-- Name: vocabulary id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vocabulary ALTER COLUMN id SET DEFAULT nextval('public.vocabulary_id_seq'::regclass);


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
-- Data for Name: user_vocabulary_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_vocabulary_progress (id, user_id, vocabulary_id, learned_at, review_count, next_review, created_at, status, review_level, last_review, updated_at) FROM stdin;
\.


--
-- Data for Name: vocabulary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vocabulary (id, english, type, vietnamese, pronounce, explain, example, example_vietnamese, image_url, audio_url, topic, topic_url, created_at, stage) FROM stdin;
189	disperse	v.	Giải tán, tan tác	/dis'pə:s/	to move apart and go away in different directions	Police dispersed the protesters with tear gas.	Cảnh sát giải tán người biểu tình bằng hơi cay.	https://audio.tflat.vn/data/images_example/300x225/p/o/police_dis_ex1_56248d167f8b9a040dc661ec.jpg	https://audio.tflat.vn/audio/d/i/disperse.mp3	Movies	https://tienganhtflat.com/blog/toeic-words-movies	2026-07-24 17:22:34.132489	1
655	inventory	noun	hàng tồn kho	/ˈɪnvəntɔːri/	goods kept in stock	Inventory levels are low.	Mức tồn kho đang thấp.	\N	\N	Warehouse	\N	2026-07-24 17:36:44.573617	1
607	look forward to	\N	Mong đợi, mong chờ, trông mong	\N	to anticipate	My mother look forward to seeing me after the war is over.	Mẹ tôi mong đợi được gặp tôi sau khi chiến tranh kết thúc. 	https://audio.tflat.vn/data/cache/images/300x225/l/o/look_forward_to1.jpg	https://audio.tflat.vn/audio/l/o/look_forward_to.mp3	Promotions, Pensions & Award	https://tienganhtflat.com/blog/toeic-words-promotions-pensions-award	2026-07-24 17:22:34.132489	1
124	busy	adj.	Bận rộn	/ˈbɪzi/	having a lot to do	I’m very busy now.	Hiện tôi rất bận.	https://audio.tflat.vn/data/cache/images/300x225/b/u/busy1.png	https://audio.tflat.vn/audio/b/u/busy.mp3	Car Rentals	https://tienganhtflat.com/blog/toeic-words-car-rentals	2026-07-24 17:22:34.132489	1
61	stock	v.	Trữ hàng	/stɒk/	a supply of goods that is available for sale	The employees stocked the shelves on a weekly basis.	Các nhân viên trữ hàng lên kệ căn cứ theo mỗi tuần.	https://audio.tflat.vn/data/cache/images/300x225/s/t/stock1.png	https://audio.tflat.vn/audio/s/t/stock.mp3	Office Technology	https://tienganhtflat.com/blog/toeic-words-office-technology	2026-07-24 17:22:34.132489	1
457	broaden	v.	Mở rộng	/ˈbrɔːdən/	to become wider	You will appreciate music more if you broaden your tastes and listen to several types of music.	Bạn sẽ biết thưởng thức âm nhạc hơn nếu bạn mở rộng thị hiếu của mình và lắng nghe vài loại âm nhạc.	https://audio.tflat.vn/data/cache/images/300x225/b/r/broaden1.jpg	https://audio.tflat.vn/audio/b/r/broaden.mp3	Music	https://tienganhtflat.com/blog/toeic-words-music	2026-07-24 17:22:34.132489	1
460	divide	v.	Chia ra, chia	/dɪˈvaɪd/	to separate or make something separate into parts	The English Channel divides England from France.	Kênh Anh chia nước Anh khỏi Pháp.	https://audio.tflat.vn/data/cache/images/300x225/d/i/divide2.png	https://audio.tflat.vn/audio/d/i/divide.mp3	Music	https://tienganhtflat.com/blog/toeic-words-music	2026-07-24 17:22:34.132489	1
823	introduce	verb	giới thiệu	/ˌɪntrəˈduːs/	to present for the first time	The company introduced a new product.	Công ty đã giới thiệu sản phẩm mới.	\N	\N	Marketing	\N	2026-07-24 17:44:13.10333	1
665	workshop	noun	hội thảo	/ˈwɜːrkʃɑːp/	a training session	Employees attended the workshop.	Nhân viên đã tham dự hội thảo.	\N	\N	Training	\N	2026-07-24 17:36:44.573617	1
709	subsidy	noun	trợ cấp	/ˈsʌbsədi/	financial support	The government offered subsidies.	Chính phủ đã cung cấp trợ cấp.	\N	\N	Finance	\N	2026-07-24 17:39:02.670694	1
207	theme	n.	Đề tài, chủ đề	/θi:m/	the subject or main idea in a talk, piece of writing, or work of art	North American literature is the main theme of this year's festival.	Văn học Bắc Mỹ là chủ đề chính của lễ hội năm nay.	https://audio.tflat.vn/data/cache/images/300x225/t/h/theme1.jpg	https://audio.tflat.vn/audio/t/h/theme.mp3	Cooking As A Career	https://tienganhtflat.com/blog/toeic-words-cooking-as-a-career	2026-07-24 17:22:34.132489	1
43	incur	v.	Gánh chịu,bị	/in'kə:/	to become subject to	I incurred substantial expenses that my health plan does not cover.	Tôi phải gánh những chi phí phát sinh mà dự án chăm sóc sức khỏe của tôi không bao gồm.	https://audio.tflat.vn/data/cache/images/300x225/i/n/incur1.png	https://audio.tflat.vn/audio/i/n/incur.mp3	Health	https://tienganhtflat.com/blog/toeic-words-health	2026-07-24 17:22:34.132489	1
725	acknowledge	verb	xác nhận	/əkˈnɑːlɪdʒ/	to recognize or confirm	Please acknowledge receipt of this email.	Vui lòng xác nhận đã nhận email này.	\N	\N	Communication	\N	2026-07-24 17:41:11.759836	1
934	notification	noun	thông báo	/ˌnoʊtɪfɪˈkeɪʃn/	official information	You will receive a notification.	Bạn sẽ nhận được thông báo.	\N	\N	Technology	\N	2026-07-24 18:01:26.486905	1
732	align	verb	điều chỉnh	/əˈlaɪn/	to bring into agreement	Our goals are aligned.	Các mục tiêu của chúng tôi đã được thống nhất.	\N	\N	Business	\N	2026-07-24 17:41:11.759836	1
84	source	n.	Nguồn, nguồn gốc	/sɔ:s/	a place, person, or thing that you get something from	He got this information from different sources.	Anh ta nhận được thông tin này từ các nguồn khác nhau.	https://audio.tflat.vn/data/images_example/300x225/h/e/he_got_thi_ex1_56248d017f8b9afc0c298321.jpg	https://audio.tflat.vn/audio/s/o/source.mp3	Ordering Supplies	https://tienganhtflat.com/blog/toeic-words-ordering-supplies	2026-07-24 17:22:34.132489	1
398	general	adj.	Chung, tổng quát	/'dʤenərəl/	affecting all or most people, places, or things	We have a general idea of how many guests will attend.	Chúng tôi có một hình dung chung chung về việc có bao nhiêu vị khách sẽ tham dự.	https://audio.tflat.vn/data/cache/images/300x225/g/e/general-clone11.jpg	https://audio.tflat.vn/audio/g/e/general-clone1.mp3	Events	https://tienganhtflat.com/blog/toeic-words-events	2026-07-24 17:22:34.132489	1
834	adopt	verb	áp dụng	/əˈdɑːpt/	to begin using	The company adopted a new system.	Công ty đã áp dụng hệ thống mới.	\N	\N	Technology	\N	2026-07-24 17:59:36.547339	1
585	interaction	n.	‹sự› tương tác, ảnh hưởng lẫn nhau, tác động qua lại	/,intər'ækʃn/	communicate with somebody, especially while you work, play or spend time with them	My pharmacist was concerned about the interaction of the two medications I was prescribed.	Dược sĩ của tôi lo lắng về sự tương tác của 2 loại thuốc mà tôi được kê toa.	https://audio.tflat.vn/data/cache/images/300x225/i/n/interaction.jpg	https://audio.tflat.vn/audio/i/n/interaction.mp3	Pharmacy	https://tienganhtflat.com/blog/toeic-words-pharmacy	2026-07-24 17:22:34.132489	1
692	inspect	verb	kiểm tra	/ɪnˈspekt/	to examine carefully	Inspect the equipment before use.	Kiểm tra thiết bị trước khi sử dụng.	\N	\N	Manufacturing	\N	2026-07-24 17:39:02.670694	1
407	accomplishment	n.	Thành tựu, thành tích; sự hoàn thành, sự làm xong	/ə'kɔmpliʃmənt/	an impressive thing that is done or achieved after a lot of work	The success of the company was based on its early accomplishments.	Sự thành công của công ty được dựa trên những thành tựu trước đó của nó.	https://audio.tflat.vn/data/cache/images/300x225/a/c/accomplishment2.jpg	https://audio.tflat.vn/audio/a/c/accomplishment.mp3	Job Ads & Recruitment	https://tienganhtflat.com/blog/toeic-words-job-ads-recruitment	2026-07-24 17:22:34.132489	1
565	secure	adj.	Chắc chắn, an toàn	/sɪˈkjʊər/	\N	At last they were able to feel secure about the future.	Cuối cùng, họ đã có thể cảm thấy chắc chắn về tương lai.	https://audio.tflat.vn/data/images_example/300x225/a/t/at_last_th_ex2_587727aa7f8b9a01308b4617.jpg	https://audio.tflat.vn/audio/s/e/secure.mp3	Selecting A Restaurant	https://tienganhtflat.com/blog/toeic-words-selecting-a-restaurant	2026-07-24 17:22:34.132489	1
311	asset	n.	Tài sản, của cải	/'æset/	a person or thing that is valuable or useful to someone or something.	The company's asset are worth millions of dollars.	Tài sản của công ty trị giá hàng triệu đô-la.	https://audio.tflat.vn/data/cache/images/300x225/a/s/asset1.png	https://audio.tflat.vn/audio/a/s/asset.mp3	Accounting	https://tienganhtflat.com/blog/toeic-words-accounting	2026-07-24 17:22:34.132489	1
82	quality	n.	Chất lượng, phẩm chất	/'kwɔliti/	the standard of something when it is compared to other things like it; how good or bad something is	The quality of their clothes has fallen ever since they started using cheaper fabrics to make them.	Chất lượng quần áo của họ đã bị sa sút kể từ khi họ bắt đầu dùng các loại vải rẻ tiền hơn để làm ra chúng.	https://audio.tflat.vn/data/cache/images/300x225/q/u/quality1.jpg	https://audio.tflat.vn/audio/q/u/quality.mp3	Ordering Supplies	https://tienganhtflat.com/blog/toeic-words-ordering-supplies	2026-07-24 17:22:34.132489	1
818	illustrate	verb	minh họa	/ˈɪləstreɪt/	to explain with examples	The graph illustrates sales growth.	Biểu đồ minh họa sự tăng trưởng doanh số.	\N	\N	Business	\N	2026-07-24 17:44:13.10333	1
621	commute	verb	đi làm	/kəˈmjuːt/	to travel regularly between home and work	He commutes by train every day.	Anh ấy đi làm bằng tàu hỏa mỗi ngày.	\N	\N	Daily Life	\N	2026-07-24 17:36:44.573617	1
701	preliminary	adjective	sơ bộ	/prɪˈlɪməneri/	coming before the main part	The report is preliminary.	Đây là báo cáo sơ bộ.	\N	\N	Business	\N	2026-07-24 17:39:02.670694	1
117	fashion	adj.	Thời trang, mốt	/ˈfæʃn/	a popular style of clothes, hair, etc. at a particular time or place	The museum's classical architecture has never gone out of fashion.	Kiến trúc cổ điển của viện bảo tàng không bao giờ lỗi thời.	https://audio.tflat.vn/data/cache/images/300x225/f/a/fashion1.png	https://audio.tflat.vn/audio/f/a/fashion.mp3	Museums	https://tienganhtflat.com/blog/toeic-words-museums	2026-07-24 17:22:34.132489	1
88	compare	v.	So sánh	/kəm'peə/	to examine people or things to see how they are similar and how they are different	Some parents want to compare their children with others’.	Nhiều bậc cha mẹ thích so sánh con của họ với con của người khác.	https://audio.tflat.vn/data/cache/images/300x225/c/o/compare1.png	https://audio.tflat.vn/audio/c/o/compare.mp3	Marketing	https://tienganhtflat.com/blog/toeic-words-marketing	2026-07-24 17:22:34.132489	1
337	fall to	v.	Trở thành trách nhiệm của	/fɔːl tuː/	to become one's responsibilities	The tasks of preparing the meal fall to the assistant chef when the chief chef was ill.	Nhiệm vụ nấu ăn rơi vào tay của phụ bếp khi mà người đầu bếp bị bệnh.	https://audio.tflat.vn/data/cache/images/300x225/f/a/fall_to1.jpg	https://audio.tflat.vn/audio/f/a/fall_to.mp3	Ordering Lunch	https://tienganhtflat.com/blog/toeic-words-ordering-lunch	2026-07-24 17:22:34.132489	1
123	spectrum	n.	Sự phân bổ theo tính chất	/'spektrəm/	a complete or wide range of related qualities, ideas, etc.	Red and violet are at opposite ends of the spectrum.	Màu đỏ và tím được phân bổ ở hai đầu của quang phổ. 	https://audio.tflat.vn/data/cache/images/300x225/s/p/spectrum1.png	https://audio.tflat.vn/audio/s/p/spectrum.mp3	Museums	https://tienganhtflat.com/blog/toeic-words-museums	2026-07-24 17:22:34.132489	1
64	hire	v.	Thuê, mướn; tiền trả công	/'haiə/	to give somebody a job	She was hired after her third interview.	Cô ta đã được thuê sau lần phỏng vấn thứ ba.	https://audio.tflat.vn/data/cache/images/300x225/h/i/hire1.jpg	https://audio.tflat.vn/audio/h/i/hire.mp3	Hiring and Training	https://tienganhtflat.com/blog/toeic-words-hiring-and-training	2026-07-24 17:22:34.132489	1
790	authorize	verb	phê chuẩn	/ˈɔːθəraɪz/	to give official permission	The director authorized the payment.	Giám đốc đã phê chuẩn khoản thanh toán.	\N	\N	Finance	\N	2026-07-24 17:44:13.10333	1
789	attentive	adjective	chú ý	/əˈtentɪv/	paying close attention	The staff was attentive.	Nhân viên rất chu đáo.	\N	\N	Customer Service	\N	2026-07-24 17:44:13.10333	1
878	enterprise	noun	doanh nghiệp	/ˈentərpraɪz/	a business organization	The enterprise expanded rapidly.	Doanh nghiệp phát triển nhanh chóng.	\N	\N	Business	\N	2026-07-24 17:59:36.547339	1
570	crucial	adj.	Cốt yếu, chủ yếu, có tính quyết định	/'kru:ʃjəl/	extremely important, because it will affect other things	Inventory is a crucial process and must be taken seriously by all staff.	Kiểm kê là một quá trình cốt yếu và phải được thực hiện nghiêm túc bởi mọi nhân viên.	https://audio.tflat.vn/data/cache/images/300x225/c/r/crucial1.png	https://audio.tflat.vn/audio/c/r/crucial.mp3	Inventory	https://tienganhtflat.com/blog/toeic-words-inventory	2026-07-24 17:22:34.132489	1
740	authenticate	verb	xác thực	/ɔːˈθentɪkeɪt/	to verify identity	Please authenticate your account.	Vui lòng xác thực tài khoản.	\N	\N	Technology	\N	2026-07-24 17:41:11.759836	1
2	benefit	n.	Lợi ích	/'benifit/	an advantage that something gives you	The discovery of oil brought many benefits to the country.	Việc phát hiện ra dầu hỏa mang đến nhiều lợi ích cho đất nước đó.	https://audio.tflat.vn/data/images_example/300x225/t/h/the_discov_ex1_56248d157f8b9a040dc65ecc.jpg	https://audio.tflat.vn/audio/b/e/benefit.mp3	Salaries & Benefits	https://tienganhtflat.com/blog/toeic-words-salaries-benefits	2026-07-24 17:22:34.132489	1
819	immediate	adjective	ngay lập tức	/ɪˈmiːdiət/	happening at once	Immediate action is required.	Cần hành động ngay lập tức.	\N	\N	Business	\N	2026-07-24 17:44:13.10333	1
241	promise	v.	Hứa hẹn	/ˈprɒmɪs/	to tell somebody that you will definitely do or not do something	Please promise not to tell anyone!	Xin hãy hứa là không nói với ai!	https://audio.tflat.vn/data/cache/images/300x225/p/r/promise1.jpg	https://audio.tflat.vn/audio/p/r/promise.mp3	Warranties	https://tienganhtflat.com/blog/toeic-words-warranties	2026-07-24 17:22:34.132489	1
726	acquisition	noun	sự mua lại	/ˌækwɪˈzɪʃn/	the act of obtaining a company	The acquisition expanded the business.	Việc mua lại đã mở rộng doanh nghiệp.	\N	\N	Business	\N	2026-07-24 17:41:11.759836	1
643	reimburse	verb	hoàn trả	/ˌriːɪmˈbɜːrs/	to pay back expenses	The company reimbursed travel costs.	Công ty hoàn trả chi phí đi lại.	\N	\N	Finance	\N	2026-07-24 17:36:44.573617	1
765	designate	verb	chỉ định	/ˈdezɪɡneɪt/	to officially appoint	She was designated team leader.	Cô ấy được chỉ định làm trưởng nhóm.	\N	\N	Management	\N	2026-07-24 17:41:11.759836	1
806	dependable	adjective	đáng tin cậy	/dɪˈpendəbl/	reliable	He is a dependable employee.	Anh ấy là một nhân viên đáng tin cậy.	\N	\N	Employment	\N	2026-07-24 17:44:13.10333	1
662	refund	noun	hoàn tiền	/ˈriːfʌnd/	money returned	Customers requested a refund.	Khách hàng yêu cầu hoàn tiền.	\N	\N	Customer Service	\N	2026-07-24 17:36:44.573617	1
938	ongoing	adjective	đang diễn ra	/ˈɑːnɡoʊɪŋ/	continuing	The project is ongoing.	Dự án vẫn đang được thực hiện.	\N	\N	Project	\N	2026-07-24 18:01:26.486905	1
907	indicator	noun	chỉ số	/ˈɪndɪkeɪtər/	a sign of condition	Economic indicators improved.	Các chỉ số kinh tế đã cải thiện.	\N	\N	Economy	\N	2026-07-24 18:01:26.486905	1
20	lease	n,v.	Khế ước, hợp đồng cho thuê	/li:s/	a legal agreement that allows you to use a car, a building	They decided to lease the property rather than buy it.	Họ đã quyết định đi thuê tài sản thay vì mua nó.	https://audio.tflat.vn/data/cache/images/300x225/l/e/lease1.jpg	https://audio.tflat.vn/audio/l/e/lease.mp3	Renting and Leasing	https://tienganhtflat.com/blog/toeic-words-renting-and-leasing	2026-07-24 17:22:34.132489	1
153	confidence	n.	Sự tin tưởng, sự tin cậy	/'kɔnfidəns/	the feeling that you can trust, believe in and be sure about the abilities or good qualities of somebody / something	I have confidence in Mai because she is my close friend.	Tôi tin tưởng Mai vì cô ấy là bạn thân của tôi.	https://audio.tflat.vn/data/cache/images/300x225/c/o/confidence1.jpg	https://audio.tflat.vn/audio/c/o/confidence.mp3	Apply and Interviewing	https://tienganhtflat.com/blog/toeic-words-apply-and-interviewing	2026-07-24 17:22:34.132489	1
857	contemporary	adjective	đương đại	/kənˈtempəreri/	modern	The office has a contemporary design.	Văn phòng có thiết kế hiện đại.	\N	\N	Architecture	\N	2026-07-24 17:59:36.547339	1
506	accept	v.	Nhận, chấp nhận	/ək'sept/	to say “yes” to an offer, invitation, etc.	She accepts the gift with a big smile, and thanks her boyfriend several times.	Cô ấy chấp nhận món quà với nụ cười lớn và cảm ơn bạn trai nhiều lần. 	https://audio.tflat.vn/data/cache/images/300x225/a/c/accept1.png	https://audio.tflat.vn/audio/a/c/accept.mp3	Banking	https://tienganhtflat.com/blog/toeic-words-banking	2026-07-24 17:22:34.132489	1
671	broker	noun	môi giới	/ˈbroʊkər/	a person who arranges deals	The broker found a buyer.	Người môi giới đã tìm được người mua.	\N	\N	Finance	\N	2026-07-24 17:39:02.670694	1
816	highlight	verb	làm nổi bật	/ˈhaɪlaɪt/	to emphasize	The report highlights key issues.	Báo cáo làm nổi bật các vấn đề chính.	\N	\N	Business	\N	2026-07-24 17:44:13.10333	1
7	negotiate	v.	Thương lượng, đàm phán, điều đình	/ni'gouʃieit/	to try to reach an agreement by formal discussion	You must know what you want and what you can accept when you negotiate a salary.	Anh phải biết mình muốn gì và mình có thể chấp nhận gì khi thương lượng về lương bổng.	https://audio.tflat.vn/data/cache/images/300x225/n/e/negotiate1.png	https://audio.tflat.vn/audio/n/e/negotiate.mp3	Salaries & Benefits	https://tienganhtflat.com/blog/toeic-words-salaries-benefits	2026-07-24 17:22:34.132489	1
275	goal	n.	Mục đích, mục tiêu	/goul/	purpose	Employees are expected to analyze and evaluate their annual goals.	Các nhân viên được yêu cầu phân tích và đánh giá các mục tiêu hàng năm của họ.	https://audio.tflat.vn/data/cache/images/300x225/g/o/goal2.png	https://audio.tflat.vn/audio/g/o/goal.mp3	Board Meeting & Committees	https://tienganhtflat.com/blog/toeic-words-board-meeting-committees	2026-07-24 17:22:34.132489	1
149	apply	v.	Nộp, ứng tuyển	/ə'plai/	to make a formal request, usually in writing, for something such as a job, a place at college, university	The college graduate applied for three jobs and received three offers.	Người tốt nghiệp cao đẳng đã xin việc ở 3 nơi và nhận được 3 lời mời chào.	https://audio.tflat.vn/data/cache/images/300x225/a/p/apply1.jpg	https://audio.tflat.vn/audio/a/p/apply.mp3	Apply and Interviewing	https://tienganhtflat.com/blog/toeic-words-apply-and-interviewing	2026-07-24 17:22:34.132489	1
259	catch up	v.	Làm kịp, kịp thời gian	/katʃ ʌp/	to bring up to date	The dental assistant was able to catch up on her paperwork in between patients.	Người trợ tá nha sĩ đã kịp làm công việc giấy tờ của mình giữa các lần khám bệnh nhân.	https://audio.tflat.vn/data/cache/images/300x225/c/a/catch_up1.jpg	https://audio.tflat.vn/audio/c/a/catch_up.mp3	Dentist's Office	https://tienganhtflat.com/blog/toeic-words-dentist-s-office	2026-07-24 17:22:34.132489	1
903	imply	verb	ám chỉ	/ɪmˈplaɪ/	to suggest indirectly	His comments implied approval.	Nhận xét của anh ấy ngụ ý sự đồng ý.	\N	\N	Communication	\N	2026-07-24 18:01:26.486905	1
350	excursion	n.	Cuộc đi tham quan, cuộc đi chơi tập thể	/iks'kə:ʃn/	a short trip made for pleasur	There are regular weekend excursions throughout the summer.	Có chuyến du ngoạn cuối tuần thường xuyên trong suốt mùa hè.	https://audio.tflat.vn/data/cache/images/300x225/e/x/excursion1.png	https://audio.tflat.vn/audio/e/x/excursion.mp3	Airlines	https://tienganhtflat.com/blog/toeic-words-airlines	2026-07-24 17:22:34.132489	1
437	explore	v.	Khảo sát, thăm dò, khám phá	/iks'plɔ:/	to examine something completely or carefully to find out more about it	Reading history books is like exploring the past.	Đọc cuốn sách lịch sử là như khám phá quá khứ.	https://audio.tflat.vn/data/cache/images/300x225/e/x/explore1.jpg	https://audio.tflat.vn/audio/e/x/explore.mp3	Shopping	https://tienganhtflat.com/blog/toeic-words-shopping	2026-07-24 17:22:34.132489	1
361	integral	adj.	Cần thiết, không thể thiếu	/'intigrəl/	being an essential part of something	The battery is an integral part of a watch and without it you would not know the time.	Pin là một phần không thể thiếu của đồng hồ và nếu không có nó bạn sẽ không biết được thời gian.	https://audio.tflat.vn/data/images_example/300x225/t/h/the_batter_ex1_56248d157f8b9a040dc65f3c.jpg	https://audio.tflat.vn/audio/i/n/integral.mp3	Shipping	https://tienganhtflat.com/blog/toeic-words-shipping	2026-07-24 17:22:34.132489	1
845	cease	verb	chấm dứt	/siːs/	to stop	Operations ceased temporarily.	Hoạt động tạm thời chấm dứt.	\N	\N	Business	\N	2026-07-24 17:59:36.547339	1
57	provider	n.	Nhà cung cấp 	/prəˈvaɪdə(r)/	a person or an organization that supplies somebody with something they need	The department was extremely pleased with the service they received from the phone provider.	Bộ phận hết sức hài lòng với dịch vụ mà họ nhận được từ nhà cung cấp dịch vụ điện thoại.	https://audio.tflat.vn/data/cache/images/300x225/p/r/provider1.png	https://audio.tflat.vn/audio/p/r/provider.mp3	Office Technology	https://tienganhtflat.com/blog/toeic-words-office-technology	2026-07-24 17:22:34.132489	1
687	fulfillment	noun	hoàn tất đơn hàng	/fʊlˈfɪlmənt/	completion of an order	Order fulfillment takes two days.	Việc hoàn tất đơn hàng mất hai ngày.	\N	\N	Logistics	\N	2026-07-24 17:39:02.670694	1
640	overdue	adjective	quá hạn	/ˌoʊvərˈduː/	not paid on time	Your payment is overdue.	Khoản thanh toán của bạn đã quá hạn.	\N	\N	Finance	\N	2026-07-24 17:36:44.573617	1
286	constitute	v.	Cấu thành, tạo thành, thành lập	/'kɔnstitju:t/	to be considered to be something	What constitutes success?	Điều gì tạo nên thành công?	https://audio.tflat.vn/data/cache/images/300x225/c/o/constitute1.png	https://audio.tflat.vn/audio/c/o/constitute.mp3	Media	https://tienganhtflat.com/blog/toeic-words-media	2026-07-24 17:22:34.132489	1
656	merchandise	noun	hàng hóa	/ˈmɜːrtʃəndaɪs/	goods for sale	New merchandise arrived today.	Hàng hóa mới đã đến hôm nay.	\N	\N	Retail	\N	2026-07-24 17:36:44.573617	1
644	renovation	noun	cải tạo	/ˌrenəˈveɪʃn/	repairing or improving a building	The office is under renovation.	Văn phòng đang được cải tạo.	\N	\N	Construction	\N	2026-07-24 17:36:44.573617	1
427	itinerary	n.	Lộ trình	/aɪˈtɪnərəri/	a plan of a trip, including the route and the places that you visit	I had to change my itinerary when I decided to add two more countries to my vacation.	Tôi đã phải đổi lộ trình khi tôi đã quyết định thêm vào 2 quốc gia nữa cho kỳ nghỉ của tôi.	https://audio.tflat.vn/data/images_example/300x225/t/h/the_tour_o_ex2_56248cfc7f8b9afa0cb17f4c.jpg	https://audio.tflat.vn/audio/i/t/itinerary.mp3	General Travel	https://tienganhtflat.com/blog/toeic-words-general-travel	2026-07-24 17:22:34.132489	1
675	consolidate	verb	hợp nhất	/kənˈsɑːlɪdeɪt/	to combine into one	The company consolidated its offices.	Công ty đã hợp nhất các văn phòng.	\N	\N	Business	\N	2026-07-24 17:39:02.670694	1
712	turnover	noun	doanh thu	/ˈtɜːrnoʊvər/	the amount of business done	Annual turnover increased significantly.	Doanh thu hàng năm tăng đáng kể.	\N	\N	Business	\N	2026-07-24 17:39:02.670694	1
24	subject to	adj.	Lệ thuộc vào, tùy theo	/ˈsʌbdʒɛkt tuː/	under legal power, dependent	This contract is subject to all the laws and regulations of the state.	Hợp đồng này tuân thủ mọi luật lệ và nguyên tắc của nhà nước.	https://audio.tflat.vn/data/cache/images/300x225/s/u/subject_to1.jpg	https://audio.tflat.vn/audio/s/u/subject_to.mp3	Renting and Leasing	https://tienganhtflat.com/blog/toeic-words-renting-and-leasing	2026-07-24 17:22:34.132489	1
515	signature	n.	Chữ ký, ký hiệu, dấu hiệu	/'signitʃə/	your name as you usually write it, for example at the end of a letter	The customer's signature was kept on file for identification purposes.	Chữ ký của khách hàng được lưu trên file nhằm mục đích nhận dạng.	https://audio.tflat.vn/data/cache/images/300x225/s/i/signature1.jpg	https://audio.tflat.vn/audio/s/i/signature.mp3	Banking	https://tienganhtflat.com/blog/toeic-words-banking	2026-07-24 17:22:34.132489	1
841	balance	noun	số dư	/ˈbæləns/	amount remaining	Check your account balance.	Kiểm tra số dư tài khoản.	\N	\N	Banking	\N	2026-07-24 17:59:36.547339	1
782	adequate	adjective	đầy đủ	/ˈædɪkwət/	enough for a purpose	The budget is adequate.	Ngân sách là đầy đủ.	\N	\N	Business	\N	2026-07-24 17:44:13.10333	1
231	select	v.	Chọn lựa, chọn lọc	/si'lekt/	to choose somebody / something from a group	They were selected to match her clothes.	Chúng đã được chọn để hợp với trang phục của cô ấy.	https://audio.tflat.vn/data/cache/images/300x225/s/e/select1.png	https://audio.tflat.vn/audio/s/e/select.mp3	Conference	https://tienganhtflat.com/blog/toeic-words-conference	2026-07-24 17:22:34.132489	1
591	volunteer	n.	Người tình nguyện, tình nguyện viên	/ˌvɒlənˈtɪə(r)/	to offer to do something without being forced to do it	I've worked as a volunteer at a special school twice since I finished Grade 10.	Tôi đã làm tình nguyện viên ở một trường học đặc biệt hai lần kể từ khi tôi học xong lớp 10.	https://audio.tflat.vn/data/cache/images/300x225/v/o/volunteer1.png	https://audio.tflat.vn/audio/v/o/volunteer.mp3	Pharmacy	https://tienganhtflat.com/blog/toeic-words-pharmacy	2026-07-24 17:22:34.132489	1
406	abundant	adj.	Nhiều, phong phú, thừa	/ə'bʌndənt/	more than engouh	The computer analyst was glad to have chosen a field in which jobs were abundant.	Người phân tích máy tính hài lòng vì đã chọn một lãnh vực mà trong đó việc làm rất nhiều.	https://audio.tflat.vn/data/cache/images/300x225/a/b/abundant1.jpg	https://audio.tflat.vn/audio/a/b/abundant.mp3	Job Ads & Recruitment	https://tienganhtflat.com/blog/toeic-words-job-ads-recruitment	2026-07-24 17:22:34.132489	1
200	demand	n.	Nhu cầu	/dɪˈmɑːnd/	\N	Higher prices reduce demand.	Giá cao hơn làm giảm nhu cầu.	https://audio.tflat.vn/data/cache/images/300x225/d/e/demand1.jpg	https://audio.tflat.vn/audio/d/e/demand.mp3	Cooking As A Career	https://tienganhtflat.com/blog/toeic-words-cooking-as-a-career	2026-07-24 17:22:34.132489	1
270	adhere to	v.	Tuân thủ, giữ vững	/ədˈhɪə(r) tə/	to follow, to pay attention to	The chairman never wants to adhere to his own rules.	Vị chủ tịch chẳng bao giờ muốn giữ vững những quy tắc của riêng ông ta.	https://audio.tflat.vn/data/cache/images/300x225/a/d/adhere_to1.png	https://audio.tflat.vn/audio/a/d/adhere_to.mp3	Board Meeting & Committees	https://tienganhtflat.com/blog/toeic-words-board-meeting-committees	2026-07-24 17:22:34.132489	1
901	hinder	verb	cản trở	/ˈhɪndər/	to make difficult	Heavy traffic hindered delivery.	Giao thông đông cản trở việc giao hàng.	\N	\N	Logistics	\N	2026-07-24 18:01:26.486905	1
256	supervisor	n.	Người giám sát	/'sju:pəvaizə/	an daministrator in charge	I have a meeting with my supervisor about my research topic.	Tôi có một cuộc họp với người giám sát của tôi về chủ đề nghiên cứu.	https://audio.tflat.vn/data/cache/images/300x225/s/u/supervisor2.png	https://audio.tflat.vn/audio/s/u/supervisor.mp3	Product Development	https://tienganhtflat.com/blog/toeic-words-product-development	2026-07-24 17:22:34.132489	1
281	waste	v.	Lãng phí	/weɪst/	to use more of something than is necessary or useful	Don't waste your money on that game.	Đừng lãng phí tiền của bạn vào trò chơi đó.	https://audio.tflat.vn/data/cache/images/300x225/w/a/waste2.png	https://audio.tflat.vn/audio/w/a/waste.mp3	Board Meeting & Committees	https://tienganhtflat.com/blog/toeic-words-board-meeting-committees	2026-07-24 17:22:34.132489	1
479	remainder	n.	Phần còn lại, số dư	/ri'meində/	the remaining people, things, or time	The Alaskan frontier has train service in the summer, but for the remainder of the year the tracks are impassable.	Biên giới ở Alaska có dịch vụ xe lửa vào mùa hè, nhưng vào lúc còn lại của năm thì đường ray không thể đi qua được (do bị đóng băng).	https://audio.tflat.vn/data/cache/images/300x225/r/e/remainder1.png	https://audio.tflat.vn/audio/r/e/remainder.mp3	Trains	https://tienganhtflat.com/blog/toeic-words-trains	2026-07-24 17:22:34.132489	1
773	eliminate	verb	loại bỏ	/ɪˈlɪmɪneɪt/	to remove completely	The new system eliminated errors.	Hệ thống mới đã loại bỏ lỗi.	\N	\N	Technology	\N	2026-07-24 17:41:11.759836	1
372	creative	adj.	Sáng tạo	/kriˈeɪtɪv/	involving the use of skill and the imagination to produce something new or a work of art	You are so creative! I have never seen any pictures like this before.	Cậu thật là sáng tạo! Tớ chưa bao giờ nhìn thấy bức tranh nào như này trước đây cả.	https://audio.tflat.vn/data/cache/images/300x225/c/r/creative1.png	https://audio.tflat.vn/audio/c/r/creative.mp3	Theater	https://tienganhtflat.com/blog/toeic-words-theater	2026-07-24 17:22:34.132489	1
885	facsimile	noun	bản sao	/fækˈsɪməli/	an exact copy of a document	Please send a facsimile of the contract.	Vui lòng gửi bản sao của hợp đồng.	\N	\N	Office	\N	2026-07-24 18:01:26.486905	1
781	adapt	verb	thích nghi	/əˈdæpt/	to adjust to new conditions	Employees adapted quickly.	Nhân viên đã thích nghi nhanh chóng.	\N	\N	Business	\N	2026-07-24 17:44:13.10333	1
109	spouse	n.	Chồng, vợ	/spauz/	a husband or wife	My spouse prepares the tax return for both of us.	Vợ/chồng tôi chuẩn bị bản khai báo thuế cho cả hai chúng tôi.	https://audio.tflat.vn/data/cache/images/300x225/s/p/spouse2.png	https://audio.tflat.vn/audio/s/p/spouse.mp3	Taxes	https://tienganhtflat.com/blog/toeic-words-taxes	2026-07-24 17:22:34.132489	1
196	successive	adj.	Kế tiếp, liên tiếp	/sək'sesiv/	following immediately one after the other	This was their fourth successive win.	Đây là chiến thắng thứ tư liên tiếp của họ.	https://audio.tflat.vn/data/images_example/300x225/t/h/this_was_t_ex1_56248d167f8b9a040dc661fc.jpg	https://audio.tflat.vn/audio/s/u/successive.mp3	Movies	https://tienganhtflat.com/blog/toeic-words-movies	2026-07-24 17:22:34.132489	1
423	claim	v.	Đòi, đòi quyền, nhận là, tự cho là	/kleɪm/	to say that something is true	I don't claim to be an expert.	Tôi không tự cho là một chuyên gia.	https://audio.tflat.vn/data/images_example/300x225/_/i/_i_dont_cl_ex1_56248d027f8b9afc0c29844d.png	https://audio.tflat.vn/audio/c/l/claim.mp3	General Travel	https://tienganhtflat.com/blog/toeic-words-general-travel	2026-07-24 17:22:34.132489	1
146	randomly	adv.	Ngẫu nhiên, tình cờ	/['rændəmli]/	done, without somebody deciding in advance what is going to happen, or without any regular pattern	We randomly made our selections from the menu.	Chúng tôi chọn đại (các món ăn) từ thực đơn.	https://audio.tflat.vn/data/cache/images/300x225/r/a/randomly1.png	https://audio.tflat.vn/audio/r/a/randomly.mp3	Eating Out	https://tienganhtflat.com/blog/toeic-words-eating-out	2026-07-24 17:22:34.132489	1
317	outstanding	adj.	Còn tồn tại, chưa giải quyết xong, chưa trả nợ	/aut'stændiɳ/	extremely good; excellent	She has outstanding debts of over £500.	Cô ấy còn khoản nợ hơn 500 triệu bảng Anh.	https://audio.tflat.vn/data/cache/images/300x225/o/u/outstanding1.jpg	https://audio.tflat.vn/audio/o/u/outstanding.mp3	Accounting	https://tienganhtflat.com/blog/toeic-words-accounting	2026-07-24 17:22:34.132489	1
179	out of	adj.	Hết, không còn	/aʊt əv/	no longer having	The presenter ran out of time before he reached his conclusion.	Người dẫn chương trình đã hết thời gian trước khi anh ta đi đến kết luận.	https://audio.tflat.vn/data/cache/images/300x225/o/u/out_of2.jpg	https://audio.tflat.vn/audio/o/u/out_of.mp3	Office Procedures	https://tienganhtflat.com/blog/toeic-words-office-procedures	2026-07-24 17:22:34.132489	1
513	mortgage	v.	Cấm cố, thế chấp	/ˈmɔːɡɪdʒ/	to give a bank, etc. the legal right to own your house, land, etc. if you do not pay the money back that you have borrowed from the bank to buy the house or land	Hiram mortgaged his home to get extra money to invest in his business.	Hiram thế chấp nhà mình để nhận một khoản tiền phụ thêm để đầu tư cho công việc.	https://audio.tflat.vn/data/cache/images/300x225/m/o/mortgage1.png	https://audio.tflat.vn/audio/m/o/mortgage.mp3	Banking	https://tienganhtflat.com/blog/toeic-words-banking	2026-07-24 17:22:34.132489	1
40	aspect	n.	Khía cạnh	/ˈæspekt/	a particular part or feature of a situation, an idea, a problem	She felt she had looked at the problem from every aspect.	Cô ấy cảm thấy rằng cô ấy đã nhìn nhận vấn đề từ mọi khía cạnh.	https://audio.tflat.vn/data/cache/images/300x225/a/s/aspect1.jpg	https://audio.tflat.vn/audio/a/s/aspect.mp3	Health	https://tienganhtflat.com/blog/toeic-words-health	2026-07-24 17:22:34.132489	1
846	clientele	noun	khách hàng	/ˌkliːɑːnˈtel/	customers collectively	The hotel serves wealthy clientele.	Khách sạn phục vụ nhóm khách hàng giàu có.	\N	\N	Customer Service	\N	2026-07-24 17:59:36.547339	1
589	sample	n.	Mẫu, mẫu vật	/ˈsæmpl/	a small amount of a substance taken from a larger amount and tested in order to obtain information about the substance	It is necessary to give the students some samples.	Việc cung cấp cho sinh viên một số mẫu là cần thiết.	https://audio.tflat.vn/data/cache/images/300x225/s/a/sample1.jpg	https://audio.tflat.vn/audio/s/a/sample.mp3	Pharmacy	https://tienganhtflat.com/blog/toeic-words-pharmacy	2026-07-24 17:22:34.132489	1
239	frequently	adv.	Thường xuyên, một cách thường xuyên	/ˈfriːkwəntli/	often	Appliances frequently come with a one-year warranty.	Trang thiết bị thường có bảo hành một năm.	https://audio.tflat.vn/data/cache/images/300x225/f/r/frequently1.jpeg	https://audio.tflat.vn/audio/f/r/frequently.mp3	Warranties	https://tienganhtflat.com/blog/toeic-words-warranties	2026-07-24 17:22:34.132489	1
333	burden	n.	Gánh nặng	/'bə:dn/	a duty, responsibility, etc. that causes worry, difficulty, or hard work	I never consider looking after my elderly parents as a burden, but a token of gratitude.	Tôi không bao giờ coi việc chăm sóc bố mẹ già là một gánh nặng, mà coi đó là biểu hiện của lòng biết ơn.	https://audio.tflat.vn/data/cache/images/300x225/b/u/burden2.jpg	https://audio.tflat.vn/audio/b/u/burden.mp3	Ordering Lunch	https://tienganhtflat.com/blog/toeic-words-ordering-lunch	2026-07-24 17:22:34.132489	1
362	minimize	v.	Giảm thiểu, tối thiểu hóa	/'minimaiz/	to reduce something, especially something bad, to the lowest possible level	The authority must find urgent solutions to minimize pollution.	Chính quyền phải tìm giải pháp cấp bách để giảm thiểu tối đa ô nhiễm.	https://audio.tflat.vn/data/images_example/300x225/t/h/the_author_ex1_56248cfb7f8b9afa0cb17e28.jpg	https://audio.tflat.vn/audio/m/i/minimize.mp3	Shipping	https://tienganhtflat.com/blog/toeic-words-shipping	2026-07-24 17:22:34.132489	1
365	remember	v.	Nhớ, ghi nhớ	/ri'membə/	to have or keep an image in your memory of an event, a person, a place, etc. from the past	Please remember to turn off the light before you go home.	Hãy nhớ tắt đèn trước khi bạn về nhà.	https://audio.tflat.vn/data/images_example/300x225/p/l/please_rem_ex1_56248ced7f8b9af60c142c87.jpeg	https://audio.tflat.vn/audio/r/e/remember.mp3	Shipping	https://tienganhtflat.com/blog/toeic-words-shipping	2026-07-24 17:22:34.132489	1
192	range	n.	Phạm vi	/reɪndʒ/	a variety of things of a particular type	The range of the director's vision is impressive.	Tầm nhìn của đạo diễn là đầy ấn tượng.	https://audio.tflat.vn/data/cache/images/300x225/r/a/range1.png	https://audio.tflat.vn/audio/r/a/range.mp3	Movies	https://tienganhtflat.com/blog/toeic-words-movies	2026-07-24 17:22:34.132489	1
332	revise	v.	Đọc lại, xem lại, duyệt lại, sửa lại (bản in thử, đạo luật...)	/ri'vaiz/	to change something, such as a book or an estimate to correct or improve it	The brochure was revised several times before it was sent to the printer.	Tờ bướm được duyệt lại vài lần trước khi nó được gửi đi in.	https://audio.tflat.vn/data/cache/images/300x225/r/e/revise1.png	https://audio.tflat.vn/audio/r/e/revise.mp3	Correspondence	https://tienganhtflat.com/blog/toeic-words-correspondence	2026-07-24 17:22:34.132489	1
401	plan	n.	Kế hoạch, dự án	/plæn/	to make detailed arrangements for something you want to do in the future	Do you have any plans for the summer?	Bạn có kế hoạch nào cho mùa hè không?	https://audio.tflat.vn/data/cache/images/300x225/p/l/plan1.jpg	https://audio.tflat.vn/audio/p/l/plan.mp3	Events	https://tienganhtflat.com/blog/toeic-words-events	2026-07-24 17:22:34.132489	1
335	delivery	n.	Sự giao hàng, sự phân phối	/dɪˈlɪvəri/	the act of taking goods, letters, etc. to the people they have been sent to	The caterer hired a courier to make the delivery.	Nhà cung cấp thực phẩm đã thuê một người đưa tin để thực hiện việc giao hàng.	https://audio.tflat.vn/data/cache/images/300x225/d/e/delivery1.png	https://audio.tflat.vn/audio/d/e/delivery.mp3	Ordering Lunch	https://tienganhtflat.com/blog/toeic-words-ordering-lunch	2026-07-24 17:22:34.132489	1
564	rely	v.	Dựa vào, tin cậy	/ri'lai/	to need or depend on someone or something	I seldom rely on the restaurant reviews in the paper when choosing a restaurant.	Tôi hiếm khi tin vào bài đánh giá nhà hàng ở trên báo mỗi khi chọn lựa một nhà hàng.	https://audio.tflat.vn/data/cache/images/300x225/r/e/rely1.png	https://audio.tflat.vn/audio/r/e/rely.mp3	Selecting A Restaurant	https://tienganhtflat.com/blog/toeic-words-selecting-a-restaurant	2026-07-24 17:22:34.132489	1
641	payroll	noun	bảng lương	/ˈpeɪroʊl/	list of employees and salaries	Payroll is processed monthly.	Bảng lương được xử lý hàng tháng.	\N	\N	Human Resources	\N	2026-07-24 17:36:44.573617	1
767	deteriorate	verb	xấu đi	/dɪˈtɪriəreɪt/	to become worse	The economy deteriorated rapidly.	Nền kinh tế xấu đi nhanh chóng.	\N	\N	Economy	\N	2026-07-24 17:41:11.759836	1
429	valid	adj.	Có giá trị, có hiệu lực	/'vælid/	that is legally or officially acceptable	I need to make certain that my passport is valid if we plan to go overseas this December.	Tôi cần biết chắc rằng hộ chiếu của tôi có giá trị nếu chúng tôi dự tính xuất ngoại tháng 12 này.	https://audio.tflat.vn/data/cache/images/300x225/v/a/valid1.jpeg	https://audio.tflat.vn/audio/v/a/valid.mp3	General Travel	https://tienganhtflat.com/blog/toeic-words-general-travel	2026-07-24 17:22:34.132489	1
580	consult	v.	Tham khảo, hỏi ý kiến, quan tâm	/kən'sʌlt/	to go to someone for information or advice	If the pain continues, consult your doctor.	Nếu cơn đau vẫn tiếp tục, thì bạn tham khảo ý kiến bác sĩ của bạn.	https://audio.tflat.vn/data/cache/images/300x225/c/o/consult1.png	https://audio.tflat.vn/audio/c/o/consult.mp3	Pharmacy	https://tienganhtflat.com/blog/toeic-words-pharmacy	2026-07-24 17:22:34.132489	1
188	description	n.	‹sự› diễn tả, mô tả; diện mạo, hình dạng	/dis'kripʃn/	a piece of writing or speech that says what someone or something is like; the act of writing or saying in words what someone or something is like	This is the description of our new house.	Đây là mô tả của ngôi nhà mới của chúng tôi.	https://audio.tflat.vn/data/cache/images/300x225/d/e/description2.jpg	https://audio.tflat.vn/audio/d/e/description.mp3	Movies	https://tienganhtflat.com/blog/toeic-words-movies	2026-07-24 17:22:34.132489	1
600	risk	n.	Nguy cơ, sự nguy hiểm, sự rủi ro	/rɪsk/	the possibility of something bad happening at some time in the future	The primary risk for most start-up businesses is insufficient capital.	Nguy cơ lớn nhất đối với hầu hết các cuộc khởi nghiệp là thiếu vốn.	https://audio.tflat.vn/data/cache/images/300x225/r/i/risk1.png	https://audio.tflat.vn/audio/r/i/risk.mp3	Business Planning	https://tienganhtflat.com/blog/toeic-words-business-planning	2026-07-24 17:22:34.132489	1
584	factor	n.	Nhân tố, yếu tố	/'fæktə/	one of several things that cause or influence something	The result will depend on a number of different factors.	Kết quả sẽ phụ thuộc vào một số lượng những nhân tố khác nhau.	https://audio.tflat.vn/data/cache/images/300x225/f/a/factor1.png	https://audio.tflat.vn/audio/f/a/factor.mp3	Pharmacy	https://tienganhtflat.com/blog/toeic-words-pharmacy	2026-07-24 17:22:34.132489	1
467	urge	v.	Thúc giục, khuyến cáo	/ə:dʒ/	to advise or try hard to persuade someone to do something	His mother urged him to study the piano.	Mẹ anh ta đã thúc giục anh ta học đàn piano.	https://audio.tflat.vn/data/cache/images/300x225/u/r/urge1.png	https://audio.tflat.vn/audio/u/r/urge.mp3	Music	https://tienganhtflat.com/blog/toeic-words-music	2026-07-24 17:22:34.132489	1
449	impose	v.	Bắt chịu, bắt gánh vác	/im'pouz/	to introduce a new law, rule, tax, etc.; to order that a rule, punishment, etc. be used	The company will impose a surcharge for any items returned.	Công ty phải chịu một khoản phí tổn thêm với bất kỳ sản phẩm nào bị trả lại.	https://audio.tflat.vn/data/cache/images/300x225/i/m/impose1.png	https://audio.tflat.vn/audio/i/m/impose.mp3	Invoice	https://tienganhtflat.com/blog/toeic-words-invoice	2026-07-24 17:22:34.132489	1
234	characteristic	n.	Đặc trưng, đặc điểm, đặc thù, cá biệt	/,kæriktə'ristik/	very typical of something or of somebody's character.	One characteristic of the store is that it is slow in mailing refund checks.	Một đặc điểm của cửa hàng là nó chậm chạp trong việc gửi hóa đơn hoàn trả.	https://audio.tflat.vn/data/images_example/300x225/o/n/one_charac_ex1_580de3767f8b9a3e688b456d.jpg	https://audio.tflat.vn/audio/c/h/characteristic.mp3	Warranties	https://tienganhtflat.com/blog/toeic-words-warranties	2026-07-24 17:22:34.132489	1
670	bid	noun	giá dự thầu	/bɪd/	an offer to perform work	The company submitted a bid.	Công ty đã nộp hồ sơ dự thầu.	\N	\N	Business	\N	2026-07-24 17:39:02.670694	1
842	beneficial	adjective	có lợi	/ˌbenɪˈfɪʃl/	helpful	Exercise is beneficial to health.	Tập thể dục có lợi cho sức khỏe.	\N	\N	General	\N	2026-07-24 17:59:36.547339	1
347	distinguish	v.	Phân biệt, nhận ra, nhận biết; phân thành, chia thành, xếp thành loại	/dis'tiɳgwiʃ/	to recognize the difference between two people or things	We must distinguish between two kinds of holidays.	Chúng ta phải phân biệt giữa hai loại lễ.	https://audio.tflat.vn/data/cache/images/300x225/d/i/distinguish2.jpg	https://audio.tflat.vn/audio/d/i/distinguish.mp3	Airlines	https://tienganhtflat.com/blog/toeic-words-airlines	2026-07-24 17:22:34.132489	1
879	estimate	verb	ước tính	/ˈestɪmeɪt/	to roughly calculate	We estimated the expenses.	Chúng tôi đã ước tính chi phí.	\N	\N	Finance	\N	2026-07-24 17:59:36.547339	1
44	personnel	n.	Nhân viên	/,pə:sə'nel/	the people who work for an organization	The employee went to see the director of personnel about taking an extended leave of absence.	Người nhân viên đi gặp giám đốc nhân sự về việc xin gia hạn thời gian nghỉ phép.	https://audio.tflat.vn/data/cache/images/300x225/p/e/personnel1.png	https://audio.tflat.vn/audio/p/e/personnel.mp3	Health	https://tienganhtflat.com/blog/toeic-words-health	2026-07-24 17:22:34.132489	1
466	taste	n.	Vị giác, nếm, sở thích, thị hiếu	/teist/	a person's ability to choose things that people recognize as being of good quality or appropriate	He has very good taste in music.	Anh ấy rất biết thưởng thức âm nhạc.	https://audio.tflat.vn/data/cache/images/300x225/t/a/taste1.png	https://audio.tflat.vn/audio/t/a/taste.mp3	Music	https://tienganhtflat.com/blog/toeic-words-music	2026-07-24 17:22:34.132489	1
791	availability	noun	sự sẵn có	/əˌveɪləˈbɪləti/	state of being available	Check product availability.	Kiểm tra tình trạng còn hàng.	\N	\N	Retail	\N	2026-07-24 17:44:13.10333	1
26	conform	v.	Làm cho phù hợp, làm cho thích hợp	/kən'fɔ:m/	to behave and think in the same way as most other people in a group or society	Our safety standards conform to those established by the government.	Các tiêu chuẩn an toàn của chúng tôi phù hợp với những tiêu chuẩn được thiết lập bởi chính phủ.	https://audio.tflat.vn/data/cache/images/300x225/c/o/conform1.png	https://audio.tflat.vn/audio/c/o/conform.mp3	Quality Control	https://tienganhtflat.com/blog/toeic-words-quality-control	2026-07-24 17:22:34.132489	1
645	shipment	noun	lô hàng	/ˈʃɪpmənt/	goods being transported	The shipment arrived yesterday.	Lô hàng đã đến hôm qua.	\N	\N	Logistics	\N	2026-07-24 17:36:44.573617	1
481	disk	n.	Đĩa (vi tính, thể thao, đĩa hát...)	/disk/	a device for storing information on a computer	Rewritable compact disks are more expensive than read-only CDs.	Đĩa quang có khả năng ghi thì đắt hơn nhiều đĩa CD chỉ đọc.	https://audio.tflat.vn/data/cache/images/300x225/d/i/disk1.png	https://audio.tflat.vn/audio/d/i/disk.mp3	Electronics	https://tienganhtflat.com/blog/toeic-words-electronics-3	2026-07-24 17:22:34.132489	1
840	attitude	noun	thái độ	/ˈætɪtuːd/	a way of thinking	A positive attitude improves teamwork.	Thái độ tích cực giúp cải thiện tinh thần đồng đội.	\N	\N	HR	\N	2026-07-24 17:59:36.547339	1
908	inevitable	adjective	không thể tránh khỏi	/ɪnˈevɪtəbl/	certain to happen	Change is inevitable.	Sự thay đổi là điều không thể tránh khỏi.	\N	\N	Business	\N	2026-07-24 18:01:26.486905	1
560	familiar	adj.	Quen thuộc, thông thường	/fə'miljə/	well known to you	It's nice to see some familiar items on the menu.	Thật là hay khi thấy vài món ăn quen thuộc trong thực đơn.	https://audio.tflat.vn/data/cache/images/300x225/f/a/familiar2.jpg	https://audio.tflat.vn/audio/f/a/familiar.mp3	Selecting A Restaurant	https://tienganhtflat.com/blog/toeic-words-selecting-a-restaurant	2026-07-24 17:22:34.132489	1
349	equivalent	adj.	Tương đương	/i'kwivələnt/	equal in value, amount, meaning, importance, etc.	The food the airline serves in business class is equivalent to that served in first class.	Đồ ăn mà hãng hàng không phục vụ cho vé hạng thường thì tương đương với đồ ăn được phục vụ cho vé hạng nhất.	https://audio.tflat.vn/data/images_example/300x225/t/h/the_food_t_ex1_56248d167f8b9a040dc66170.png	https://audio.tflat.vn/audio/e/q/equivalent.mp3	Airlines	https://tienganhtflat.com/blog/toeic-words-airlines	2026-07-24 17:22:34.132489	1
459	disparate	adj.	Hoàn toàn khác nhau	/'dispərit/	made up of parts or people that are very different from each other	Religious song cut across disparate categories of music.	Bài hát tôn giáo (thánh ca) tách hẳn ra làm thể loại âm nhạc khác biệt.	https://audio.tflat.vn/data/cache/images/300x225/d/i/disparate1.png	https://audio.tflat.vn/audio/d/i/disparate.mp3	Music	https://tienganhtflat.com/blog/toeic-words-music	2026-07-24 17:22:34.132489	1
100	deadline	n.	Thời hạn chót	/ˈdedlaɪn/	a point in time by which something must be done	The deadline for paying this years's taxes is just two weeks away.	Hạn chót cho việc nộp thuế cho năm nay chỉ còn cách 2 tuần.	https://audio.tflat.vn/data/cache/images/300x225/d/e/deadline1.png	https://audio.tflat.vn/audio/d/e/deadline.mp3	Taxes	https://tienganhtflat.com/blog/toeic-words-taxes	2026-07-24 17:22:34.132489	1
422	board	v.	Lên tàu / máy bay / xe lửa	/bɔ:d/	to get on a ship, train, plane, bus, etc	Passengers are waiting to board.	Các hành khách đang chờ để lên máy bay.	https://audio.tflat.vn/data/cache/images/300x225/b/o/board-clone11.jpg	https://audio.tflat.vn/audio/b/o/board-clone1.mp3	General Travel	https://tienganhtflat.com/blog/toeic-words-general-travel	2026-07-24 17:22:34.132489	1
760	coordination	noun	sự phối hợp	/koʊˌɔːrdɪˈneɪʃn/	organized cooperation	Good coordination improved efficiency.	Sự phối hợp tốt đã nâng cao hiệu quả.	\N	\N	Management	\N	2026-07-24 17:41:11.759836	1
226	get in touch	v.	Liên lạc với 	/ɡɛt ɪn tʌtʃ/	to communicate / contact with somebody	As soon as we arrive at the hotel, we will get in touch with the manager about the unexpected guests.	Ngay khi chúng tôi đến khách sạn, chúng tôi sẽ liên hệ với giám đốc về những vị khách không mời mà đến.	https://audio.tflat.vn/data/cache/images/300x225/g/e/get_in_touch2.jpg	https://audio.tflat.vn/audio/g/e/get_in_touch.mp3	Conference	https://tienganhtflat.com/blog/toeic-words-conference	2026-07-24 17:22:34.132489	1
288	disseminate	v.	Truyền bá; phổ biến, gieo rắc (khắp nơi)	/di'semineit/	to spread information, knowledge, etc. so that it reaches many people	The media disseminates news across the world.	Truyền thông đại chúng phổ biến tin tức đi khắp thế giới.	https://audio.tflat.vn/data/cache/images/300x225/d/i/disseminate.gif	https://audio.tflat.vn/audio/d/i/disseminate.mp3	Media	https://tienganhtflat.com/blog/toeic-words-media	2026-07-24 17:22:34.132489	1
216	figure out	v.	Đoán ra, giải ra	/ˈfɪɡə/	to calculate an amount or the cost	By examining all of the errors, the technicians were able to figure out how to fix the problem.	Bằng cách xem xét mọi lỗi, các kỹ thuật viên đã có thể tìm ra cách để sửa chữa các sự cố.	https://audio.tflat.vn/data/cache/images/300x225/f/i/figure_out.jpg	https://audio.tflat.vn/audio/f/i/figure_out.mp3	Computers and the Internet	https://tienganhtflat.com/blog/toeic-words-computers-and-the-internet	2026-07-24 17:22:34.132489	1
376	occur	v.	Xảy ra	/əˈkɜː/	to happen	The tsunami occurred at about 3.30 p.m.	Vụ sóng thần xảy ra vào lúc khoảng 3:30 chiều.	https://audio.tflat.vn/data/cache/images/300x225/o/c/occur1.jpg	https://audio.tflat.vn/audio/o/c/occur.mp3	Theater	https://tienganhtflat.com/blog/toeic-words-theater	2026-07-24 17:22:34.132489	1
359	fulfill	v.	Thực hiện, thi hành; hoàn thành, làm tròn	/ful'fil/	to do or achieve what was hoped for or expected	I fulfilled my promise to treat him to dinner.	Tôi đã thực hiện lời hứa của mình là đãi cậu ấy bữa tối. 	https://audio.tflat.vn/data/images_example/300x225/i/_/i_fulfille_ex1_580de4697f8b9a84688b45a1.jpg	https://audio.tflat.vn/audio/f/u/fulfill.mp3	Shipping	https://tienganhtflat.com/blog/toeic-words-shipping	2026-07-24 17:22:34.132489	1
92	currently	adv.	Hiện tại, lúc này	/ˈkʌrəntli/	at the present time	Currently, customers are demanding big discounts for bulk orders.	Hiện nay, khách hàng đang đòi hỏi những khoản giảm giá nhiều cho những đơn hàng lớn.	https://audio.tflat.vn/data/images_example/300x225/c/u/currently__ex1_56248d0c7f8b9a000de3d039.jpg	https://audio.tflat.vn/audio/c/u/currently.mp3	Marketing	https://tienganhtflat.com/blog/toeic-words-marketing	2026-07-24 17:22:34.132489	1
227	hold	v.	Chứa, đựng, tổ chức 	/hould/	to have a meeting	This meeting room holds at least 80 people comfortably.	Phòng họp này chứa được thoải mái ít nhất 80 người.	https://audio.tflat.vn/data/images_example/300x225/t/h/this_meeti_ex1_56248d157f8b9a040dc65de8.jpg	https://audio.tflat.vn/audio/h/o/hold.mp3	Conference	https://tienganhtflat.com/blog/toeic-words-conference	2026-07-24 17:22:34.132489	1
440	merchandise	n.	Hàng hóa	/'mə:tʃəndaiz/	goods that are bought or sold; goods that are for sale in a shop / store	I am very impressed with the selection of merchandise at this store.	Tôi rất có ấn tượng với sự tuyển chọn hàng hóa tại cửa hàng này.	https://audio.tflat.vn/data/cache/images/300x225/m/e/merchandise1.jpg	https://audio.tflat.vn/audio/m/e/merchandise.mp3	Shopping	https://tienganhtflat.com/blog/toeic-words-shopping	2026-07-24 17:22:34.132489	1
812	flexible	adjective	linh hoạt	/ˈfleksəbl/	able to change easily	The schedule is flexible.	Lịch trình rất linh hoạt.	\N	\N	Office	\N	2026-07-24 17:44:13.10333	1
763	defer	verb	hoãn lại	/dɪˈfɜːr/	to delay	The decision was deferred.	Quyết định đã được hoãn lại.	\N	\N	Management	\N	2026-07-24 17:41:11.759836	1
852	conceal	verb	che giấu	/kənˈsiːl/	to hide	Do not conceal important information.	Đừng che giấu thông tin quan trọng.	\N	\N	Legal	\N	2026-07-24 17:59:36.547339	1
608	look to	v.	Tin vào, trông cậy vào, mong đợi ở (ai)	/lʊk tuː/	to depend on, to rely on	They look to their supervisor for guidance and direction.	Họ trông cậy vào người giám sát của họ về sự chỉ đạo và hướng dẫn.	https://audio.tflat.vn/data/cache/images/300x225/l/o/look_to1.jpg	https://audio.tflat.vn/audio/l/o/look_to.mp3	Promotions, Pensions & Award	https://tienganhtflat.com/blog/toeic-words-promotions-pensions-award	2026-07-24 17:22:34.132489	1
483	network	v.	Kết nối, liên kết	/'netwə:k/	a number of computers and other devices that are connected together	More and more PCs are networked together.	Ngày càng nhiều máy tính được kết nối với nhau.	https://audio.tflat.vn/data/cache/images/300x225/n/e/network1.jpg	https://audio.tflat.vn/audio/n/e/network.mp3	Electronics	https://tienganhtflat.com/blog/toeic-words-electronics-3	2026-07-24 17:22:34.132489	1
387	manage	v.	Quán lý, điều hành	/'mænidʤ/	to succeed in doing something, especially something difficult	I managed to pass the exams.	Tôi đã xoay sở vượt qua được các kỳ thi.	https://audio.tflat.vn/data/cache/images/300x225/m/a/manage1.png	https://audio.tflat.vn/audio/m/a/manage.mp3	Doctor's Office	https://tienganhtflat.com/blog/toeic-words-doctor-s-office	2026-07-24 17:22:34.132489	1
780	accumulate	verb	tích lũy	/əˈkjuːmjəleɪt/	to collect over time	The company accumulated profits.	Công ty đã tích lũy lợi nhuận.	\N	\N	Finance	\N	2026-07-24 17:44:13.10333	1
880	exceed	verb	vượt quá	/ɪkˈsiːd/	to go beyond	Sales exceeded expectations.	Doanh số vượt kỳ vọng.	\N	\N	Sales	\N	2026-07-24 17:59:36.547339	1
855	consist	verb	bao gồm	/kənˈsɪst/	to be made up of	The package consists of five items.	Gói hàng gồm năm món.	\N	\N	Business	\N	2026-07-24 17:59:36.547339	1
339	individual	adj.	Cá nhân, riêng biệt	/,indi'vidjuəl/	considered separately rather than as part of a group	We had the delivery man mark the contents of each individual order.	Chúng tôi đã được người giao hàng đánh dấu nội dung cho mỗi đơn hàng riêng biệt.	https://audio.tflat.vn/data/cache/images/300x225/i/n/individual1.png	https://audio.tflat.vn/audio/i/n/individual.mp3	Ordering Lunch	https://tienganhtflat.com/blog/toeic-words-ordering-lunch	2026-07-24 17:22:34.132489	1
581	control	v.	Điều khiển, chỉ đạo	/kən'troul/	the ability to make someone or something do what you want	His every action is controlled by the manager.	Mọi hành động của anh ta đều do giám đốc chỉ đạo.	https://audio.tflat.vn/data/cache/images/300x225/c/o/control1.png	https://audio.tflat.vn/audio/c/o/control.mp3	Pharmacy	https://tienganhtflat.com/blog/toeic-words-pharmacy	2026-07-24 17:22:34.132489	1
222	accommodate	v.	Làm cho phù hợp	/ə'kɔmədeit/	to provide somebody with a room or place to sleep, live or sit	The meeting room was large enough to accommodate the various needs of the groups using it.	Phòng họp đủ lớn để phù hợp với nhiều nhu cầu khác nhau của các nhóm sử dụng nó.	https://audio.tflat.vn/data/cache/images/300x225/a/c/accommodate2.jpg	https://audio.tflat.vn/audio/a/c/accommodate.mp3	Conference	https://tienganhtflat.com/blog/toeic-words-conference	2026-07-24 17:22:34.132489	1
561	guide	n.	Hướng dẫn viên, sách hướng dẫn	/gaɪd/	a person who shows other people the way to a place	I don't know where to go, so why don't we consult the guide.	Tôi không biết đi đâu, vậy thì sao chúng ta không hỏi ý kiến hướng dẫn viên.	https://audio.tflat.vn/data/cache/images/300x225/g/u/guide1.png	https://audio.tflat.vn/audio/g/u/guide.mp3	Selecting A Restaurant	https://tienganhtflat.com/blog/toeic-words-selecting-a-restaurant	2026-07-24 17:22:34.132489	1
142	judge	v.	Phán xét, đánh giá	/dʒʌdʒ/	to form an opinion about somebody / something	You shouldn’t judge someone by their appearance alone.	Bạn không nên đánh giá ai đó chỉ qua vẻ bề ngoài của họ.	https://audio.tflat.vn/data/cache/images/300x225/j/u/judge1.jpg	https://audio.tflat.vn/audio/j/u/judge.mp3	Eating Out	https://tienganhtflat.com/blog/toeic-words-eating-out	2026-07-24 17:22:34.132489	1
510	deduct	v.	Lấy đi, trừ đi, khấu trừ	/di'dʌkt/	to take away money, points, etc., from a total amount	By deducting the monthly fee from her checking account, Yi was able to make her account balance.	Do việc khấu trừ tiền thù lao hàng tháng vào tài khoản vãng lai, Yi đã có thể thực hiện cân bằng thu chi tài khoản của mình.	https://audio.tflat.vn/data/cache/images/300x225/d/e/deduct1.png	https://audio.tflat.vn/audio/d/e/deduct.mp3	Banking	https://tienganhtflat.com/blog/toeic-words-banking	2026-07-24 17:22:34.132489	1
711	terminate	verb	chấm dứt	/ˈtɜːrmɪneɪt/	to end officially	The contract was terminated.	Hợp đồng đã bị chấm dứt.	\N	\N	Legal	\N	2026-07-24 17:39:02.670694	1
864	dedicate	verb	cống hiến	/ˈdedɪkeɪt/	to devote	He dedicated his career to education.	Anh ấy cống hiến sự nghiệp cho giáo dục.	\N	\N	HR	\N	2026-07-24 17:59:36.547339	1
623	contractor	noun	nhà thầu	/ˈkɑːntræktər/	a person or company hired for work	The contractor completed the project.	Nhà thầu đã hoàn thành dự án.	\N	\N	Construction	\N	2026-07-24 17:36:44.573617	1
568	adjustment	n.	Điều chỉnh, chỉnh lý	/ə'dʤʌstmənt/	a small change made to something in order to correct or improve it	I've made a few adjustments to the design.	Tôi đã thực hiện một vài điều chỉnh để thiết kế.	https://audio.tflat.vn/data/cache/images/300x225/a/d/adjustment1.png	https://audio.tflat.vn/audio/a/d/adjustment.mp3	Inventory	https://tienganhtflat.com/blog/toeic-words-inventory	2026-07-24 17:22:34.132489	1
181	practice	v.	Thực hành, rèn luyện 	/'præktis/	action rather than ideas	Bill practiced answering the telephone until he was satisfied.	Bill thực tập trả lời điện thoại cho đến khi anh ta cảm thấy hài lòng.	https://audio.tflat.vn/data/cache/images/300x225/p/r/practice1.jpeg	https://audio.tflat.vn/audio/p/r/practice.mp3	Office Procedures	https://tienganhtflat.com/blog/toeic-words-office-procedures	2026-07-24 17:22:34.132489	1
178	glimpse	n.	Cái nhìn lướt qua	/ɡlɪmps/	a look at somebody / something for a very short time	The secretary caught a glimpse of her new boss as she was leaving the office.	Cô thư ký bắt gặp ánh mắt lướt qua của người chủ mới khi cô ấy rời khỏi văn phòng.	https://audio.tflat.vn/data/cache/images/300x225/g/l/glimpse1.jpg	https://audio.tflat.vn/audio/g/l/glimpse.mp3	Office Procedures	https://tienganhtflat.com/blog/toeic-words-office-procedures	2026-07-24 17:22:34.132489	1
475	offset	v.	Bù lại, đền bù	/'ɔ:fset/	to use one cost, payment, or situation in order to cancel or reduce the effect of another	The high cost of the hotel room offset the savings we made by taking the train instead of the plane.	Chi phí cao của khách sạn bù lại khoản tiết kiệm mà chúng tôi đã có bằng cách đi xe lửa thay vì máy bay.	https://audio.tflat.vn/data/cache/images/300x225/o/f/offset1.jpg	https://audio.tflat.vn/audio/o/f/offset.mp3	Trains	https://tienganhtflat.com/blog/toeic-words-trains	2026-07-24 17:22:34.132489	1
837	annual	adjective	hằng năm	/ˈænjuəl/	occurring every year	The annual report is complete.	Báo cáo thường niên đã hoàn thành.	\N	\N	Business	\N	2026-07-24 17:59:36.547339	1
137	complete	v.	Hoàn thành	/kəmˈpliːt/	to finish making or doing something	We ordered some dessert to complete our meal.	Chúng tôi gọi một ít món tráng miệng để trọn vẹn bữa ăn của mình.	https://audio.tflat.vn/data/images_example/300x225/w/e/we_ordered_ex1_56248cf37f8b9af80c011d81.jpg	https://audio.tflat.vn/audio/c/o/complete.mp3	Eating Out	https://tienganhtflat.com/blog/toeic-words-eating-out	2026-07-24 17:22:34.132489	1
528	resource	n.	Nguồn, nguồn lực	/rɪˈsɔːs/	\N	The most important factor for developing the economy is human resources.	Yếu tố quan trọng nhất để phát triển kinh tế là nguồn nhân lực.	https://audio.tflat.vn/data/cache/images/300x225/r/e/resource1.jpg	https://audio.tflat.vn/audio/r/e/resource.mp3	Investment	https://tienganhtflat.com/blog/toeic-words-investment	2026-07-24 17:22:34.132489	1
730	affiliate	noun	chi nhánh	/əˈfɪlieɪt/	a company connected with another	The affiliate opened a new office.	Chi nhánh đã mở văn phòng mới.	\N	\N	Business	\N	2026-07-24 17:41:11.759836	1
849	compel	verb	buộc	/kəmˈpel/	to force	The weather compelled us to stay inside.	Thời tiết buộc chúng tôi phải ở trong nhà.	\N	\N	General	\N	2026-07-24 17:59:36.547339	1
698	occupancy	noun	tỷ lệ lấp đầy	/ˈɑːkjəpənsi/	use of available space	Hotel occupancy is high.	Tỷ lệ lấp đầy khách sạn cao.	\N	\N	Hospitality	\N	2026-07-24 17:39:02.670694	1
489	skill	n.	Kỹ năng, kỹ xảo	/skil/	the ability to do something well	The software developer has excellent technical skills and would be an asset to our software programming team.	Người phát triển phần mềm có những kỹ năng chuyên môn xuất săc và là một vốn quý đối với đội ngũ lập trình phần mềm của chúng tôi.	https://audio.tflat.vn/data/cache/images/300x225/s/k/skill1.jpg	https://audio.tflat.vn/audio/s/k/skill.mp3	Electronics	https://tienganhtflat.com/blog/toeic-words-electronics-3	2026-07-24 17:22:34.132489	1
212	delete	v.	Xóa đi, bỏ đi	/di'li:t/	to remove something that has been written or printed	The technicians deleted all the data on the disk accidentally.	Kỹ thuật viên đã vô tình xóa mọi dữ liệu trên đĩa.	https://audio.tflat.vn/data/cache/images/300x225/d/e/delete2.jpg	https://audio.tflat.vn/audio/d/e/delete.mp3	Computers and the Internet	https://tienganhtflat.com/blog/toeic-words-computers-and-the-internet	2026-07-24 17:22:34.132489	1
305	result	n.	Kết quả, đáp số	/ri'zʌlt/	a thing that is caused or produced because of something else	The scientific results prove that the new procedure is not significantly safer than the traditional one.	Các kết quả khoa học đã chứng minh rằng thủ tục mới không an toàn hơn đáng kể so với thủ tục truyền thống.	https://audio.tflat.vn/data/cache/images/300x225/r/e/result1.png	https://audio.tflat.vn/audio/r/e/result.mp3	Hospitals	https://tienganhtflat.com/blog/toeic-words-hospitals	2026-07-24 17:22:34.132489	1
455	music	n.	Âm nhạc	/ˈmjuːzɪk/	\N	The poem has been set to music.	Bài thơ đã được phổ nhạc.	https://audio.tflat.vn/data/cache/images/300x225/m/u/music1.jpg	https://audio.tflat.vn/audio/m/u/music.mp3	Music	https://tienganhtflat.com/blog/toeic-words-music	2026-07-24 17:22:34.132489	1
39	alternative	adj.	Xen kẽ, thay thế, luân phiên	/ɔ:l'tə:nətiv/	that can be used instead of something else	Have you thought of an alternative plan?	Bạn đã nghĩ đến kế hoạch thay thế chưa?	https://audio.tflat.vn/data/cache/images/300x225/a/l/alternative.jpg	https://audio.tflat.vn/audio/a/l/alternative.mp3	Health	https://tienganhtflat.com/blog/toeic-words-health	2026-07-24 17:22:34.132489	1
67	mentor	n.	Thầy hướng dẫn	/'mentɔ:/	a person who gives a younger or less experienced person help and advice over a period of time, especially at work or school	She is a friend and mentor to many children.	Cô ấy là một người bạn và người hướng dẫn của nhiều đứa trẻ.	https://audio.tflat.vn/data/cache/images/300x225/m/e/mentor1.png	https://audio.tflat.vn/audio/m/e/mentor.mp3	Hiring and Training	https://tienganhtflat.com/blog/toeic-words-hiring-and-training	2026-07-24 17:22:34.132489	1
512	down payment	n.	Phần tiền trả trước ban đầu	/daʊn ˈpeɪmənt/	an initial partial payment	By making a large down payment, the couple saved a great deal in mortgage interest.	Bằng việc trả trước một phần lớn, đôi vợ chồng tiết kiệm được một khoản lãi cầm cố cao.	https://audio.tflat.vn/data/cache/images/300x225/d/o/down_payment1.png	https://audio.tflat.vn/audio/d/o/down_payment.mp3	Banking	https://tienganhtflat.com/blog/toeic-words-banking	2026-07-24 17:22:34.132489	1
71	success	n.	‹sự/người› thành công, thành đạt, thắng lợi	/sək'ses/	the fact that you have achieved something that you want and have been trying to do	The director's success came after years of hiring the right people at the right time.	Thành công của giám đốc đã đến sau hàng năm trời thuê đúng người vào đúng thời điểm.	https://audio.tflat.vn/data/cache/images/300x225/s/u/success1.jpg	https://audio.tflat.vn/audio/s/u/success.mp3	Hiring and Training	https://tienganhtflat.com/blog/toeic-words-hiring-and-training	2026-07-24 17:22:34.132489	1
428	prohibit	v.	Cấm, ngăn cấm	/prə(ʊ)ˈhɪbɪt/	to stop something from being done or used, especially by law	Smoking is prohibited here.	Hút thuốc bị cấm ở đây.	https://audio.tflat.vn/data/cache/images/300x225/p/r/prohibit1.jpg	https://audio.tflat.vn/audio/p/r/prohibit.mp3	General Travel	https://tienganhtflat.com/blog/toeic-words-general-travel	2026-07-24 17:22:34.132489	1
132	optional	adj.	Tùy ý lựa chọn, không bắt buộc	/ˈɒpʃ(ə)n(ə)l/	that you can choose to do or have if you want to	This exercise is optional; you don't have to do it.	Bài tập này là tùy chọn; bạn không cần phải làm điều đó.	https://audio.tflat.vn/data/cache/images/300x225/o/p/optional1.jpg	https://audio.tflat.vn/audio/o/p/optional.mp3	Car Rentals	https://tienganhtflat.com/blog/toeic-words-car-rentals	2026-07-24 17:22:34.132489	1
228	location	n.	Vị trí	/lou'keiʃn/	a place where something happens or exists	The location of the meeting was changed from the Red Room to the Green Room.	Vị trí họp đã được thay đổi từ phòng Đỏ sang phòng Xanh.	https://audio.tflat.vn/data/cache/images/300x225/l/o/location1.png	https://audio.tflat.vn/audio/l/o/location.mp3	Conference	https://tienganhtflat.com/blog/toeic-words-conference	2026-07-24 17:22:34.132489	1
103	give up	v.	Bỏ, từ bỏ, thôi; tạm dừng; đầu hàng	\N	to quit, to stop	Ms. Gomez is so optimistic that she never wants to give up.	Cô Gomez lạc quan đến nỗi chưa bao giờ muốn bỏ cuộc.	https://audio.tflat.vn/data/cache/images/300x225/g/i/give_up1.png	https://audio.tflat.vn/audio/g/i/give_up.mp3	Taxes	https://tienganhtflat.com/blog/toeic-words-taxes	2026-07-24 17:22:34.132489	1
235	consequence	n.	Kết quả, hậu quả, hệ quả; tầm quan trọng, tính trọng đại	/'kɔnsikwəns/	a result of something that has happened	As a consequence of not having seen a dentist for several years, Lydia had several cavities.	Hậu quả của việc không đi khám nha sĩ trong vài năm, Lydia đã bị vài răng sâu.	https://audio.tflat.vn/data/images_example/300x225/a/s/as_a_conse_ex1_580de3767f8b9a3e688b456f.jpg	https://audio.tflat.vn/audio/c/o/consequence.mp3	Warranties	https://tienganhtflat.com/blog/toeic-words-warranties	2026-07-24 17:22:34.132489	1
577	subtract	v.	Trừ đi, khấu trừ; loại ra, lấy ra khỏi	/səb'trækt/	to take a number or an amount away from another number or amount	6 subtracted from 9 is 3.	9 trừ 6 được 3.	https://audio.tflat.vn/data/cache/images/300x225/s/u/subtract1.png	https://audio.tflat.vn/audio/s/u/subtract.mp3	Inventory	https://tienganhtflat.com/blog/toeic-words-inventory	2026-07-24 17:22:34.132489	1
557	arrive	v.	Đến	/ə'raiv/	to reach a destination	What time do you arrive at the airport?	Khi nào bạn đến sân bay?\n	https://audio.tflat.vn/data/cache/images/300x225/a/r/arrive1.jpeg	https://audio.tflat.vn/audio/a/r/arrive.mp3	Selecting A Restaurant	https://tienganhtflat.com/blog/toeic-words-selecting-a-restaurant	2026-07-24 17:22:34.132489	1
654	forecast	noun	dự báo	/ˈfɔːrkæst/	prediction of future events	The sales forecast is positive.	Dự báo doanh số rất khả quan.	\N	\N	Business	\N	2026-07-24 17:36:44.573617	1
536	determine	v.	Xác định, định rõ	/di'tə:min/	to discover the facts about something	After reading the contract, I was still unable to determine if our company was liable for back wages.	Sau khi đọc hợp đồng, tôi vẫn không thể biết được liệu rằng công ty của chúng tôi có phải chịu trách nhiệm hoàn trả lại lương không.	https://audio.tflat.vn/data/cache/images/300x225/d/e/determine1.png	https://audio.tflat.vn/audio/d/e/determine.mp3	Contracts	https://tienganhtflat.com/blog/toeic-words-contracts	2026-07-24 17:22:34.132489	1
194	representation	n.	Đại diện, sự diễn tả	/,reprizen'teiʃn/	the act of presenting someone or something in a particular way	The film's representation of world poverty through the character of the hungry child was quite moving.	Sự diễn tả của bộ phim về thế giới bần cùng thông qua nhân vật đứa trẻ đói khát thì khá là thương tâm.	https://audio.tflat.vn/data/cache/images/300x225/r/e/representation.jpg	https://audio.tflat.vn/audio/r/e/representation.mp3	Movies	https://tienganhtflat.com/blog/toeic-words-movies	2026-07-24 17:22:34.132489	1
839	assess	verb	đánh giá	/əˈses/	to evaluate	Managers assess employee performance.	Các quản lý đánh giá hiệu suất nhân viên.	\N	\N	HR	\N	2026-07-24 17:59:36.547339	1
6	flexibly	adv.	‹một cách› mềm dẻo, linh hoạt, linh động	/ˈfleksəbl/	able to change to suit new conditions or situations	My manager thinks flexibly, enabling herself to solve many sticky problems.	Trưởng phòng của tôi suy nghĩ linh hoạt, cho phép bà tự giải quyết nhiều vấn đề khó chịu.	https://audio.tflat.vn/data/cache/images/300x225/f/l/flexibly.jpg	https://audio.tflat.vn/audio/f/l/flexibly.mp3	Salaries & Benefits	https://tienganhtflat.com/blog/toeic-words-salaries-benefits	2026-07-24 17:22:34.132489	1
915	inventorying	noun	kiểm kê	/ˈɪnvənˌtɔːriɪŋ/	the act of checking stock	Inventorying takes place monthly.	Việc kiểm kê diễn ra hàng tháng.	\N	\N	Warehouse	\N	2026-07-24 18:01:26.486905	1
517	transaction	n.	Sự giao dịch, công việc kinh doanh	/træn'zækʃn/	a piece of business that is done between people, especially an act of buying or selling	Banking transaction will appear on your monthly statement.	Giao dịch ngân hàng sẽ xuất hiện trong thông báo tài khoản ngân hàng mỗi tháng.	https://audio.tflat.vn/data/cache/images/300x225/t/r/transaction1.jpg	https://audio.tflat.vn/audio/t/r/transaction.mp3	Banking	https://tienganhtflat.com/blog/toeic-words-banking	2026-07-24 17:22:34.132489	1
562	majority	n.	Phần lớn, đa số	/mə'dʤɔriti/	the largest part of a group of people or things	The majority of the group wanted to try the new Chinese restaurant.	Phần lớn nhóm muốn đi ăn thử ở nhà hàng Trung Quốc mới.	https://audio.tflat.vn/data/cache/images/300x225/m/a/majority1.png	https://audio.tflat.vn/audio/m/a/majority.mp3	Selecting A Restaurant	https://tienganhtflat.com/blog/toeic-words-selecting-a-restaurant	2026-07-24 17:22:34.132489	1
491	store	v.	Lưu giữ, tích trữ	/stɔ:/	to keep	You can store more data on a zip drive.	Anh có thể lưu trữ dữ liệu nhiều hơn trên ổ đĩa nén.	https://audio.tflat.vn/data/cache/images/300x225/s/t/store-lưu_giữ1.jpg	https://audio.tflat.vn/audio/s/t/store-lưu_giữ.mp3	Electronics	https://tienganhtflat.com/blog/toeic-words-electronics-3	2026-07-24 17:22:34.132489	1
895	gradual	adjective	dần dần	/ˈɡrædʒuəl/	happening slowly	The company achieved gradual growth.	Công ty đạt được sự tăng trưởng dần dần.	\N	\N	Business	\N	2026-07-24 18:01:26.486905	1
266	overview	n.	Nhìn tồng quát, miêu tả chung, ngắn gọn	/´ouvə¸vju:/	a general description something	I did a quick overview of your teeth and they look in good shape.	Tôi đã khám tổng quát nhanh hàm răng của cô và chúng trông có vẻ tốt.	https://audio.tflat.vn/data/images_example/300x225/i/_/i_did_a_qu_ex1_56248d167f8b9a040dc66278.jpg	https://audio.tflat.vn/audio/o/v/overview.mp3	Dentist's Office	https://tienganhtflat.com/blog/toeic-words-dentist-s-office	2026-07-24 17:22:34.132489	1
667	audit	noun	kiểm toán	/ˈɔːdɪt/	an official examination of accounts	The company passed the audit.	Công ty đã vượt qua cuộc kiểm toán.	\N	\N	Finance	\N	2026-07-24 17:39:02.670694	1
280	progress	n.	Sự tiến bộ, sự tiến triển	/ˈprəʊɡrɛs/	the process of improving or developing	The doctor said that he was making good progress after the surgery.	Bác sỹ nói rằng anh ấy đang có tiến triển tốt sau cuộc phẫu thuật.	https://audio.tflat.vn/data/cache/images/300x225/p/r/progress2.png	https://audio.tflat.vn/audio/p/r/progress.mp3	Board Meeting & Committees	https://tienganhtflat.com/blog/toeic-words-board-meeting-committees	2026-07-24 17:22:34.132489	1
240	imply	v.	Ngụ ý, hàm ý, ẩn ý, ý nói	/im'plai/	to suggest that something is true without saying so directly	The guarantees on the Walkman imply that all damages were covered under warranty for one year.	Giấy bảo đảm theo máy nghe nhạc Walkman đã ngụ ý rằng mọi hư hỏng đều được bao gồm trong thời hạn bảo hành là 1 năm.	https://audio.tflat.vn/data/cache/images/300x225/i/m/imply2.jpg	https://audio.tflat.vn/audio/i/m/imply.mp3	Warranties	https://tienganhtflat.com/blog/toeic-words-warranties	2026-07-24 17:22:34.132489	1
292	link	n.	Liên kết, chỗ nối	/liɳk/	a connection between two or more people or things	Police suspect there may be a link between the two murders.	Cảnh sát nghi ngờ có thể có một mối liên kết giữa hai vụ giết người.	https://audio.tflat.vn/data/cache/images/300x225/l/i/link1.png	https://audio.tflat.vn/audio/l/i/link.mp3	Media	https://tienganhtflat.com/blog/toeic-words-media	2026-07-24 17:22:34.132489	1
211	compatible	adj.	Tương thích, hợp nhau 	/kəm'pætəbl/	able to be used together	Because my girlfriend and I listen to the same music artists, we have compatible tastes in music.	Vì tôi và bạn gái tôi cùng nghe nhạc của những nghệ sĩ giống nhau, nên chúng tôi hợp nhau về thị hiếu âm nhạc.	https://audio.tflat.vn/data/images_example/300x225/b/e/because_my_ex1_56248d157f8b9a040dc65e00.jpg	https://audio.tflat.vn/audio/c/o/compatible.mp3	Computers and the Internet	https://tienganhtflat.com/blog/toeic-words-computers-and-the-internet	2026-07-24 17:22:34.132489	1
877	enforce	verb	thực thi	/ɪnˈfɔːrs/	to make obey	The law is strictly enforced.	Luật được thực thi nghiêm ngặt.	\N	\N	Legal	\N	2026-07-24 17:59:36.547339	1
10	wage	n.	Tiền công, tiền lương (thường trả theo giờ)	/weidʤ/	a regular amount of money that you earn, usually every week, for work	Hourly wages have increase by 20 percent over the last two years.	Tiền công theo giờ đã tăng 20% qua 2 năm vừa rồi.	https://audio.tflat.vn/data/cache/images/300x225/w/a/wage1.png	https://audio.tflat.vn/audio/w/a/wage.mp3	Salaries & Benefits	https://tienganhtflat.com/blog/toeic-words-salaries-benefits	2026-07-24 17:22:34.132489	1
375	experience	n.	Kinh nghiệm	/ɪkˈspɪriəns/	the knowledge and skill that you have gained through doing something for a period of time	Do you have any experience in teaching children?	Bạn có kinh nghiệm dạy trẻ con không?	https://audio.tflat.vn/data/cache/images/300x225/e/x/experience1.jpg	https://audio.tflat.vn/audio/e/x/experience.mp3	Theater	https://tienganhtflat.com/blog/toeic-words-theater	2026-07-24 17:22:34.132489	1
386	instrument	n.	Dụng cụ, công cụ	/'instrumənt/	a tool or device used for a particular task	The senior physician carried his instruments in a black leather bag.	Người thầy thuốc thâm niên mang những dụng cụ của mình trong một cái túi da màu đen.	https://audio.tflat.vn/data/images_example/300x225/t/h/the_senior_ex1_56248d167f8b9a040dc6624c.jpg	https://audio.tflat.vn/audio/i/n/instrument.mp3	Doctor's Office	https://tienganhtflat.com/blog/toeic-words-doctor-s-office	2026-07-24 17:22:34.132489	1
315	client	n.	Khách, khách hàng	/'klaiənt/	a customer	We must provide excellent services for our clients, otherwise we will lose them to our competition.	Chúng ta phải cung cấp các dịch vụ xuất sắc cho khách hàng của mình, bằng không chúng ta sẽ để mất họ vào tay đối thủ.	https://audio.tflat.vn/data/cache/images/300x225/c/l/client1.jpg	https://audio.tflat.vn/audio/c/l/client.mp3	Accounting	https://tienganhtflat.com/blog/toeic-words-accounting	2026-07-24 17:22:34.132489	1
630	enroll	verb	đăng ký	/ɪnˈroʊl/	to register officially	She enrolled in a TOEIC course.	Cô ấy đăng ký khóa học TOEIC.	\N	\N	Education	\N	2026-07-24 17:36:44.573617	1
611	obviously	adv.	‹một cách› rõ ràng, hiển nhiên (clearly, evidently)	/ˈɒbviəsli/	used when giving infor that you expect other people to know already	Her tardiness was obviously resented by her coworkers.	Sự chậm chạp của cô ta rõ ràng là bị đồng nghiệp bực bội.	https://audio.tflat.vn/data/cache/images/300x225/o/b/obviously1.jpg	https://audio.tflat.vn/audio/o/b/obviously.mp3	Promotions, Pensions & Award	https://tienganhtflat.com/blog/toeic-words-promotions-pensions-award	2026-07-24 17:22:34.132489	1
925	mandatory	adjective	bắt buộc	/ˈmændətɔːri/	required	Attendance is mandatory.	Việc tham dự là bắt buộc.	\N	\N	HR	\N	2026-07-24 18:01:26.486905	1
747	circulate	verb	lưu hành	/ˈsɜːrkjəleɪt/	to distribute	The memo was circulated today.	Bản ghi nhớ đã được phát hôm nay.	\N	\N	Office	\N	2026-07-24 17:41:11.759836	1
5	eligible	adj.	Thích hợp, đủ tư cách, đủ tiêu chuẩn; có thể chọn được	/ˈɛlɪdʒɪb(ə)l/	able to practicipate in something, qualified	Who is eligible to become president?	Ai sẽ đủ tiêu chuẩn để trở thành tổng thống?	https://audio.tflat.vn/data/cache/images/300x225/e/l/eligible2.jpg	https://audio.tflat.vn/audio/e/l/eligible.mp3	Salaries & Benefits	https://tienganhtflat.com/blog/toeic-words-salaries-benefits	2026-07-24 17:22:34.132489	1
723	abrupt	adjective	đột ngột	/əˈbrʌpt/	sudden and unexpected	There was an abrupt change in the schedule.	Đã có một sự thay đổi đột ngột trong lịch trình.	\N	\N	Office	\N	2026-07-24 17:41:11.759836	1
708	specification	noun	thông số kỹ thuật	/ˌspesɪfɪˈkeɪʃn/	detailed description	Read the product specifications.	Hãy đọc thông số kỹ thuật của sản phẩm.	\N	\N	Engineering	\N	2026-07-24 17:39:02.670694	1
797	confirmation	noun	xác nhận	/ˌkɑːnfərˈmeɪʃn/	proof that something is true	We received your confirmation.	Chúng tôi đã nhận được xác nhận của bạn.	\N	\N	Communication	\N	2026-07-24 17:44:13.10333	1
31	perceptive	adj.	Nhận thức được, cảm giác được, cảm thụ được	/pə'septiv/	having or showing the ability to see or understand things quickly, especially things that are not obvious	It takes a perceptive person to be a good manager.	Phải là một người có khả năng cảm nhận mới trở thành một nhà quản lý tốt.	https://audio.tflat.vn/data/cache/images/300x225/p/e/perceptive2.png	https://audio.tflat.vn/audio/p/e/perceptive.mp3	Quality Control	https://tienganhtflat.com/blog/toeic-words-quality-control	2026-07-24 17:22:34.132489	1
264	illuminate	v.	Chiếu sáng, làm sáng tỏ	/i'ju:mineit/	to shine light on something	Let me turn on more lights to properly illuminate the back teeth.	Để tôi bật thêm đèn để chiếu sáng đúng mức hàm răng đen.	https://audio.tflat.vn/data/cache/images/300x225/i/l/illuminate1.png	https://audio.tflat.vn/audio/i/l/illuminate.mp3	Dentist's Office	https://tienganhtflat.com/blog/toeic-words-dentist-s-office	2026-07-24 17:22:34.132489	1
219	shut down	v.	Tắt máy, ngừng hoạt động	/ʃʌt/	it stops being often for bussiness	Please shut down the computer before you leave.	Vui lòng tắt máy trước khi bạn ngừng làm việc.	https://audio.tflat.vn/data/cache/images/300x225/s/h/shut_down2.jpg	https://audio.tflat.vn/audio/s/h/shut_down.mp3	Computers and the Internet	https://tienganhtflat.com/blog/toeic-words-computers-and-the-internet	2026-07-24 17:22:34.132489	1
509	cautiously	adv.	‹một cách› thận trọng, cẩn thận	/ˈkɔːʃəsli/	being careful about what you say or do	Act cautiously when signing contracts and read them thoroughly first.	Hành động thận trọng khi ký các hợp đồng và trước hết hãy đọc chúng kỹ lưỡng.	https://audio.tflat.vn/data/cache/images/300x225/c/a/cautiously1.png	https://audio.tflat.vn/audio/c/a/cautiously.mp3	Banking	https://tienganhtflat.com/blog/toeic-words-banking	2026-07-24 17:22:34.132489	1
402	proximity	n.	Sắp xỉ, sự gần gũi	/prɔk´simiti/	the state of being near someone or something in distance or time	The fans were worried by the proximity of the storm clouds.	Những người hâm mộ lo lắng bởi đám mây báo bão đến gần.	https://audio.tflat.vn/data/cache/images/300x225/p/r/proximity1.jpg	https://audio.tflat.vn/audio/p/r/proximity.mp3	Events	https://tienganhtflat.com/blog/toeic-words-events	2026-07-24 17:22:34.132489	1
793	brief	adjective	ngắn gọn	/briːf/	lasting a short time	The meeting was brief.	Cuộc họp diễn ra ngắn gọn.	\N	\N	Office	\N	2026-07-24 17:44:13.10333	1
850	complement	verb	bổ sung	/ˈkɑːmplɪment/	to complete	The software complements our system.	Phần mềm bổ sung cho hệ thống của chúng tôi.	\N	\N	Technology	\N	2026-07-24 17:59:36.547339	1
409	candidate	n.	Ứng cử viên, thí sinh, người dự tuyển	/'kændidit/	a person who is trying to be elected or is applying for a job	All of the candidates were ready for the competition.	Tất cả các ứng cử viên đã sẵn sàng cho cuộc thi.	https://audio.tflat.vn/data/cache/images/300x225/c/a/candidate1.jpg	https://audio.tflat.vn/audio/c/a/candidate.mp3	Job Ads & Recruitment	https://tienganhtflat.com/blog/toeic-words-job-ads-recruitment	2026-07-24 17:22:34.132489	1
881	exclusive	adjective	độc quyền	/ɪkˈskluːsɪv/	limited to selected people	The store sells exclusive products.	Cửa hàng bán các sản phẩm độc quyền.	\N	\N	Retail	\N	2026-07-24 17:59:36.547339	1
224	association	n.	Hội, hiệp hội	/ə,sousi'eiʃn/	an officcial group of people who have joined together for a particular purpose	I know that ASEAN stands for the Association of Southeast Asian Nations.	Tôi biết rằng ASEAN là viết tắt của Hiệp Hội Các Nước Đông Nam Á.	https://audio.tflat.vn/data/images_example/300x225/i/_/i_know_tha_ex1_580de37b7f8b9a3e688b4579.jpg	https://audio.tflat.vn/audio/a/s/association.mp3	Conference	https://tienganhtflat.com/blog/toeic-words-conference	2026-07-24 17:22:34.132489	1
890	formulate	verb	xây dựng	/ˈfɔːrmjəleɪt/	to develop systematically	The team formulated a strategy.	Nhóm đã xây dựng một chiến lược.	\N	\N	Management	\N	2026-07-24 18:01:26.486905	1
81	prerequisite	adj.	(điều/điều kiện) tiên quyết, cần trước hết, đòi hỏi trước hết	/'pri:'rekwizit/	something that must exist or happen before something else can happen or be done	Here are the prerequisites that you need to purchase before coming to class.	Đây là những thứ đòi hỏi trước hết mà bạn cần phải sắm trước khi vào lớp học.	https://audio.tflat.vn/data/images_example/300x225/h/e/here_are_t_ex1_580de4687f8b9a84688b459f.jpg	https://audio.tflat.vn/audio/p/r/prerequisite.mp3	Ordering Supplies	https://tienganhtflat.com/blog/toeic-words-ordering-supplies	2026-07-24 17:22:34.132489	1
487	revolution	n.	Cuộc cách mạng	/,revə'lu:ʃn/	a great change in conditions, ways of working, beliefs, etc. ..that affects large numbers of people	We see a revolution in the computer field almost every day.	Chúng ta thấy một cuộc cách mạng trong lãnh vực máy tính hầu như mỗi ngày.	https://audio.tflat.vn/data/cache/images/300x225/r/e/revolution1.png	https://audio.tflat.vn/audio/r/e/revolution.mp3	Electronics	https://tienganhtflat.com/blog/toeic-words-electronics-3	2026-07-24 17:22:34.132489	1
366	ship	v.	Vận chuyển	/ʃip/	to send	Eva shipped the package carefully, since she knew the contents were made of glass.	Eva đã chuyển hàng một cách cẩn thận, bởi vì cô biết bên trong được làm bằng thủy tinh.	https://audio.tflat.vn/data/images_example/300x225/e/v/eva_shippe_ex1_56248d157f8b9a040dc65f44.jpg	https://audio.tflat.vn/audio/s/h/ship.mp3	Shipping	https://tienganhtflat.com/blog/toeic-words-shipping	2026-07-24 17:22:34.132489	1
420	beverage	n.	Đồ uống	/'bəvəridʤ/	any type of drink except water	The flight attendant offered all passengers a cold beverage during the flight.	Tiếp viên hành không đã mời mọi hành khách một thức uống lạnh trong suốt chuyển bay.	https://audio.tflat.vn/data/cache/images/300x225/b/e/beverage1.png	https://audio.tflat.vn/audio/b/e/beverage.mp3	General Travel	https://tienganhtflat.com/blog/toeic-words-general-travel	2026-07-24 17:22:34.132489	1
369	action	n.	Hành động, hoạt động	/ˈækʃn/	the events in a story, play, etc	I like action films.	Tôi thích phim hành động.	https://audio.tflat.vn/data/cache/images/300x225/a/c/action1.png	https://audio.tflat.vn/audio/a/c/action.mp3	Theater	https://tienganhtflat.com/blog/toeic-words-theater	2026-07-24 17:22:34.132489	1
108	refund	n, v.	(n) sự trả lại tiền	/ri:'fʌnd/	a sum of money that is paid back to you, especially because you paid too much or because you returned goods to a store	With the tax refund, we bought two plane tickets.	Với số thuế được hoàn, chúng tôi đã mua hai vé máy bay.	https://audio.tflat.vn/data/cache/images/300x225/r/e/refund2.png	https://audio.tflat.vn/audio/r/e/refund-2.mp3	Taxes	https://tienganhtflat.com/blog/toeic-words-taxes	2026-07-24 17:22:34.132489	1
856	consultant	noun	chuyên gia tư vấn	/kənˈsʌltənt/	an expert adviser	The consultant recommended improvements.	Chuyên gia tư vấn đã đề xuất cải tiến.	\N	\N	Business	\N	2026-07-24 17:59:36.547339	1
785	anonymous	adjective	ẩn danh	/əˈnɑːnɪməs/	without a name	The survey was anonymous.	Cuộc khảo sát được thực hiện ẩn danh.	\N	\N	Office	\N	2026-07-24 17:44:13.10333	1
414	qualification	n.	Năng lực, trình độ (để làm cái gì)	/,kwɔlifi'keiʃn/	a skill or type of experience that you need for a particular job or activity	It is easy for him to find a good job with such good qualifications.	Rất dễ dàng cho anh ta để tìm một công việc tốt với trình độ tốt như vậy.	https://audio.tflat.vn/data/cache/images/300x225/q/u/qualification.jpg	https://audio.tflat.vn/audio/q/u/qualification.mp3	Job Ads & Recruitment	https://tienganhtflat.com/blog/toeic-words-job-ads-recruitment	2026-07-24 17:22:34.132489	1
405	stage	n.	Trình diễn, dàn cảnh; sắp xếp, tổ chức	/steɪdʒ/	a period or state that something or someone passes through	A historic house can be the perfect site to stage a small reception.	Một ngôi nhà lịch sử có thể là một nơi lý tưởng để tổ chức một cuộc chiêu đãi nhỏ.	https://audio.tflat.vn/data/cache/images/300x225/s/t/stage1.jpg	https://audio.tflat.vn/audio/s/t/stage.mp3	Events	https://tienganhtflat.com/blog/toeic-words-events	2026-07-24 17:22:34.132489	1
587	monitor	v.	Quan sát, theo dõi	/'mɔnitə/	to watch and check something over a period of time	The patient had weekly appointments so that the doctor could monitor their progress.	Người bệnh có các cuộc hẹn hàng tuần để cho bác sĩ có thể theo dõi tiến triển của họ.	https://audio.tflat.vn/data/images_example/300x225/t/h/the_patien_ex1_56248d177f8b9a040dc662d0.jpg	https://audio.tflat.vn/audio/m/o/monitor.mp3	Pharmacy	https://tienganhtflat.com/blog/toeic-words-pharmacy	2026-07-24 17:22:34.132489	1
719	capital	noun	vốn	/ˈkæpɪtl/	money used for business	The company raised more capital.	Công ty đã huy động thêm vốn.	\N	\N	Finance	\N	2026-07-24 17:39:02.670694	1
463	prefer	v.	Thích hơn	/prɪˈfɜ:r/	to like one thing or person better than another	I prefer reading a book to watching TV.	Tôi thích đọc sách hơn xem TV.	https://audio.tflat.vn/data/cache/images/300x225/p/r/prefer1.png	https://audio.tflat.vn/audio/p/r/prefer.mp3	Music	https://tienganhtflat.com/blog/toeic-words-music	2026-07-24 17:22:34.132489	1
357	accurately	adv.	‹một cách› chính xác, đúng đắn, xác đáng	/ˈækjərət/	correct and true in every detail	The teacher evaluates student's ability accurately.	Giáo viên đánh giá chính xác khả năng của học sinh. 	https://audio.tflat.vn/data/images_example/300x225/t/h/the_teache_ex1_56248d157f8b9a040dc65f30.jpg	https://audio.tflat.vn/audio/a/c/accurately.mp3	Shipping	https://tienganhtflat.com/blog/toeic-words-shipping	2026-07-24 17:22:34.132489	1
937	offset	verb	bù đắp	/ˈɔːfset/	to balance	Higher sales offset the losses.	Doanh số cao đã bù đắp các khoản lỗ.	\N	\N	Finance	\N	2026-07-24 18:01:26.486905	1
593	avoid	v.	Tránh, tránh khỏi; hủy bỏ, bác bỏ	/ə'vɔid/	to prevent something bad from happening	To avoid going out of business, owners should prepare a proper business plan.	Nhằm tránh lụn bại việc làm ăn, những người chủ nên chuẩn bị một kế hoạch kinh doanh phù hợp.	https://audio.tflat.vn/data/cache/images/300x225/a/v/avoid1.png	https://audio.tflat.vn/audio/a/v/avoid.mp3	Business Planning	https://tienganhtflat.com/blog/toeic-words-business-planning	2026-07-24 17:22:34.132489	1
833	activate	verb	kích hoạt	/ˈæktɪveɪt/	to make active	Please activate your account.	Vui lòng kích hoạt tài khoản của bạn.	\N	\N	Technology	\N	2026-07-24 17:59:36.547339	1
524	invest	v.	Đầu tư	/in'vest/	to buy property, shares in a company, etc. in the hope of making a profit.	Don't invest all of your time in just one project.	Đừng đầu tư tất cả thời gian của bạn vào chỉ một dự án.	https://audio.tflat.vn/data/cache/images/300x225/i/n/invest1.jpg	https://audio.tflat.vn/audio/i/n/invest.mp3	Investment	https://tienganhtflat.com/blog/toeic-words-investment	2026-07-24 17:22:34.132489	1
121	significant	adj.	Có tầm quan trọng, đáng kể	/sig'nifikənt/	large or important enough to have an effect or to be noticed	There has been a significant increase in the number of women students in recent years.	Số lượng sinh viên nữ đã tăng đáng kể trong những năm gần đây.	https://audio.tflat.vn/data/cache/images/300x225/s/i/significant1.png	https://audio.tflat.vn/audio/s/i/significant.mp3	Museums	https://tienganhtflat.com/blog/toeic-words-museums	2026-07-24 17:22:34.132489	1
848	compartment	noun	ngăn	/kəmˈpɑːrtmənt/	a separate section	Store documents in this compartment.	Cất tài liệu vào ngăn này.	\N	\N	Office	\N	2026-07-24 17:59:36.547339	1
77	everyday	adj.	Hàng ngày, thường ngày, thông thường	/'evridei/	routine, common	This everyday routine of having to check inventory is boring.	Công việc thường ngày phải kiểm tra hàng tồn kho thì thật chán.	https://audio.tflat.vn/data/cache/images/300x225/e/v/everyday1.jpg	https://audio.tflat.vn/audio/e/v/everyday.mp3	Ordering Supplies	https://tienganhtflat.com/blog/toeic-words-ordering-supplies	2026-07-24 17:22:34.132489	1
555	yield	v.	Sinh lợi	/jiːld/	the total amount of crops, profits	The company's investment yielded high returns.	Việc đầu tư của công ty đã mang lại tiền lãi cao hơn.	https://audio.tflat.vn/data/cache/images/300x225/y/i/yield2.png	https://audio.tflat.vn/audio/y/i/yield.mp3	Financial Statements	https://tienganhtflat.com/blog/toeic-words-financial-statements	2026-07-24 17:22:34.132489	1
273	conclude	v.	Kết luận, quyết định	/kən'klu:d/	to decide or believe something as a result of what you have heard or seen.	After long discussions, the board has concluded that the project has to be canceled.	Sau những cuộc tranh luận dài, ủy ban đã kết luận rằng dự án phải bị hủy bỏ.	https://audio.tflat.vn/data/images_example/300x225/a/f/after_long_ex1_56248d167f8b9a040dc66060.jpg	https://audio.tflat.vn/audio/c/o/conclude.mp3	Board Meeting & Committees	https://tienganhtflat.com/blog/toeic-words-board-meeting-committees	2026-07-24 17:22:34.132489	1
899	hardship	noun	khó khăn	/ˈhɑːrdʃɪp/	a difficult condition	Many businesses faced hardship.	Nhiều doanh nghiệp gặp khó khăn.	\N	\N	Business	\N	2026-07-24 18:01:26.486905	1
504	reservation	n.	Sự dành trước, sự đặt chổ trước	/,rezə'veiʃn/	an arrangement for a seat on a plane or train, a room in a hotel, etc. to be kept for you	I know I made a reservation for tonight, but the hotel staff has no record of it in the system.	Tôi biết rằng tôi đã đặt chỗ tối nay, nhưng nhân viên khách sạn không lưu nó vào hệ thống.	https://audio.tflat.vn/data/cache/images/300x225/r/e/reservation.jpg	https://audio.tflat.vn/audio/r/e/reservation.mp3	Hotels	https://tienganhtflat.com/blog/toeic-words-hotels	2026-07-24 17:22:34.132489	2
932	neglect	verb	bỏ bê	/nɪˈɡlekt/	to fail to care	Do not neglect customer feedback.	Đừng bỏ qua phản hồi của khách hàng.	\N	\N	Customer Service	\N	2026-07-24 18:01:26.486905	2
445	customer	n.	Khách hàng (người mua hàng hóa hoặc dịch vụ)	/'kʌstəmə/	a person or an organization that buys something from a store or business	Let's make sure all invoices sent to customers are kept in alphabetical order.	Chúng ta phải chắc rằng mọi hóa đơn gửi cho khách hàng được giữ theo thứ tự ABC.	https://audio.tflat.vn/data/cache/images/300x225/c/u/customer1.jpg	https://audio.tflat.vn/audio/c/u/customer.mp3	Invoice	https://tienganhtflat.com/blog/toeic-words-invoice	2026-07-24 17:22:34.132489	2
363	inventory	n.	‹sự/bản› kiểm kê hàng hóa 	/in'ventri/	a written list of all the objects, furniture, etc. in a particular building	The store closes one day a year so that the staff can take inventory of the stockroom.	Cửa hàng đóng cửa 1 ngày mỗi năm để cho nhân viên có thể thực hiện kiểm kê kho hàng.	https://audio.tflat.vn/data/cache/images/300x225/i/n/inventory1.jpg	https://audio.tflat.vn/audio/i/n/inventory.mp3	Shipping	https://tienganhtflat.com/blog/toeic-words-shipping	2026-07-24 17:22:34.132489	2
345	deal with	v.	Giải quyết, đối phó, xử lý; bàn về cái gì, thỏa thuận về cái gì	/diːl wɪð/	to attend to go, to manage	Ticket agents must courteously deal with irate customers.	Đại lý bán vé phải đối xử nhã nhặn với những khách hàng nổi giận.	https://audio.tflat.vn/data/cache/images/300x225/d/e/deal_with1.jpg	https://audio.tflat.vn/audio/d/e/deal_with.mp3	Airlines	https://tienganhtflat.com/blog/toeic-words-airlines	2026-07-24 17:22:34.132489	2
60	stay on top of	v.	Nắm bắt tình hình 	/steɪ ɒn tɒp əv/	Have the newest informatiion	In this industry, you must stay on top of current developments.	Trong ngành công nghiệp này, anh phải nắm bắt được tình hình về các diễn biến hiện tại.	https://audio.tflat.vn/data/cache/images/300x225/s/t/stay_on_top_of2.jpg	https://audio.tflat.vn/audio/s/t/stay_on_top_of.mp3	Office Technology	https://tienganhtflat.com/blog/toeic-words-office-technology	2026-07-24 17:22:34.132489	2
676	consultancy	noun	công ty tư vấn	/kənˈsʌltənsi/	a consulting business	She works for a consultancy.	Cô ấy làm việc cho một công ty tư vấn.	\N	\N	Business	\N	2026-07-24 17:39:02.670694	2
204	outlet	n.	Chỗ thoát ra, lối ra	/'autlet/	a way of expressing or making good use of strong feelings, ideas, or energy	Many people find cooking to be a hands-on outlet for their creativity.	Nhiều người xem nấu ăn là một phương tiện thực hành để thỏa mãn óc sáng tạo của mình.	https://audio.tflat.vn/data/cache/images/300x225/o/u/outlet1.png	https://audio.tflat.vn/audio/o/u/outlet.mp3	Cooking As A Career	https://tienganhtflat.com/blog/toeic-words-cooking-as-a-career	2026-07-24 17:22:34.132489	2
135	tier	n.	Tầng, lớp, hạng	/'taiə/	one of several levels in an organization or a system	If you are on a budget, I suggest you think about renting a car from our lowest tier.	Nếu anh chỉ có một số tiền nhỏ, tôi đề nghị anh hãy suy nghĩ về việc thuê một chiếc xe thuộc hạng thấp nhất của chúng tôi.	https://audio.tflat.vn/data/cache/images/300x225/t/i/tier1.png	https://audio.tflat.vn/audio/t/i/tier.mp3	Car Rentals	https://tienganhtflat.com/blog/toeic-words-car-rentals	2026-07-24 17:22:34.132489	2
214	duplicate	v.	Sao lại, nhân đôi	/'dju:plikit/	to make an extract copy of something	I think the new word processing program will duplicate the success of the one introduced last year.	Tôi nghĩ rằng chương trình xử lý văn bản mới sẽ thành công gấp đôi so với chương trình được giới thiệu hồi năm ngoái.	https://audio.tflat.vn/data/cache/images/300x225/d/u/duplicate2.jpg	https://audio.tflat.vn/audio/d/u/duplicate.mp3	Computers and the Internet	https://tienganhtflat.com/blog/toeic-words-computers-and-the-internet	2026-07-24 17:22:34.132489	2
746	capacity	noun	sức chứa	/kəˈpæsəti/	maximum amount possible	The hall has a capacity of 500.	Hội trường có sức chứa 500 người.	\N	\N	Facilities	\N	2026-07-24 17:41:11.759836	3
141	ingredient	n.	Thành phần, nguyên liệu	/in'gri:djənt/	one of the things from which something is made, especially one of the foods	We want to make a special cake. To do that, we need to buy all the ingredients.	Chúng tôi muốn làm một chiếc bánh đặc biệt. Để làm được điều đó, chúng tôi cần mua đầy đủ các nguyên liệu.	https://audio.tflat.vn/data/cache/images/300x225/i/n/ingredient1.png	https://audio.tflat.vn/audio/i/n/ingredient.mp3	Eating Out	https://tienganhtflat.com/blog/toeic-words-eating-out	2026-07-24 17:22:34.132489	2
779	accomplish	verb	hoàn thành	/əˈkɑːmplɪʃ/	to achieve successfully	She accomplished all her tasks.	Cô ấy đã hoàn thành tất cả nhiệm vụ.	\N	\N	Business	\N	2026-07-24 17:44:13.10333	2
913	interaction	noun	sự tương tác	/ˌɪntərˈækʃn/	communication between people	Customer interaction is essential.	Sự tương tác với khách hàng rất quan trọng.	\N	\N	Customer Service	\N	2026-07-24 18:01:26.486905	2
411	commensurate	adj.	(+with) xứng với, tương xứng với	/kə'menʃərit/	matching something in size, importance, quality	Generally the first year's salary is commensurate with experience and education level.	Nói chung thì tiền lương năm đầu tiên tương xứng với kinh nghiệm và trình độ học vấn.	https://audio.tflat.vn/data/cache/images/300x225/c/o/commensurate.jpg	https://audio.tflat.vn/audio/c/o/commensurate.mp3	Job Ads & Recruitment	https://tienganhtflat.com/blog/toeic-words-job-ads-recruitment	2026-07-24 17:22:34.132489	2
180	outdated	adj.	Hết hạn; lỗi thời, lạc hậu, cổ, hiện nay không còn dùng (obsolete)	/aut'deitid/	not currently in use	Before you do a mailing, make sure that none of the addresses is outdated.	Trước khi anh gửi thư, hãy bảo đảm rằng không có địa chỉ nào hiện không còn sử dụng	https://audio.tflat.vn/data/cache/images/300x225/o/u/outdated1.jpg	https://audio.tflat.vn/audio/o/u/outdated.mp3	Office Procedures	https://tienganhtflat.com/blog/toeic-words-office-procedures	2026-07-24 17:22:34.132489	2
668	authorize	verb	ủy quyền	/ˈɔːθəraɪz/	to give official permission	Only managers can authorize refunds.	Chỉ quản lý mới được phép phê duyệt hoàn tiền.	\N	\N	Business	\N	2026-07-24 17:39:02.670694	2
752	comply	verb	tuân thủ	/kəmˈplaɪ/	to obey rules	All employees must comply.	Tất cả nhân viên phải tuân thủ.	\N	\N	Legal	\N	2026-07-24 17:41:11.759836	2
523	fund	n.	Quỹ (tiết kiệm hoặc dùng cho một hoạt động cụ thể)	/fʌnd/	\N	We subscribe to the charity fund.	Chúng tôi quyên góp cho quỹ từ thiện.	https://audio.tflat.vn/data/cache/images/300x225/f/u/fund1.jpg	https://audio.tflat.vn/audio/f/u/fund.mp3	Investment	https://tienganhtflat.com/blog/toeic-words-investment	2026-07-24 17:22:34.132489	2
777	accessible	adjective	có thể tiếp cận	/əkˈsesəbl/	easy to reach or use	The information is accessible online.	Thông tin có thể được truy cập trực tuyến.	\N	\N	Technology	\N	2026-07-24 17:44:13.10333	2
169	open to	adj.	Gánh chịu, bị 	/ˈəʊpən tə /	\N	Since the junior executive was still on probation, he was open to much scrutiny and criticism.	Bởi vì người nhân viên điều hành cấp thấp vẫn còn trong thời gian tập sự, anh hay bị săm soi và chỉ trích.	https://audio.tflat.vn/data/cache/images/300x225/o/p/open_to1.png	https://audio.tflat.vn/audio/o/p/open_to.mp3	Property & Departments	https://tienganhtflat.com/blog/toeic-words-property-departments	2026-07-24 17:22:34.132489	2
330	proof	n.	Bằng chứng, chứng cớ	/proof/	information, documents, etc. that show something is true	These results are a further proof of his ability.	Những kết quả này là một bằng chứng nữa về khả năng của ông.	https://audio.tflat.vn/data/cache/images/300x225/p/r/proof1.png	https://audio.tflat.vn/audio/p/r/proof.mp3	Correspondence	https://tienganhtflat.com/blog/toeic-words-correspondence	2026-07-24 17:22:34.132489	2
122	specialize	v.	Chuyên môn hóa, chuyên về	/ˈspɛʃəˌlaɪz/	to become an expert in a particular area of work	He specialized in criminal law.	Anh ấy chuyên về pháp luật hình sự.	https://audio.tflat.vn/data/cache/images/300x225/s/p/specialize1.jpg	https://audio.tflat.vn/audio/s/p/specialize.mp3	Museums	https://tienganhtflat.com/blog/toeic-words-museums	2026-07-24 17:22:34.132489	2
750	compensate	verb	bồi thường	/ˈkɑːmpenseɪt/	to repay for loss	The company compensated customers.	Công ty đã bồi thường cho khách hàng.	\N	\N	Customer Service	\N	2026-07-24 17:41:11.759836	2
685	facilitate	verb	tạo điều kiện	/fəˈsɪlɪteɪt/	to make easier	Technology facilitates communication.	Công nghệ tạo điều kiện cho việc giao tiếp.	\N	\N	Business	\N	2026-07-24 17:39:02.670694	2
163	conducive	adj.	Có ích, có lợi	/kənˈdjuːsɪv/	making it easy, possible, or likely for something to happen	The soft lights and music were conducive to a relaxed atmosphere.	Các đèn chiếu sáng nhẹ và nhạc sẽ có ích cho một bầu không khí thoải mái.	https://audio.tflat.vn/data/images_example/300x225/t/h/the_soft_l_ex1_56248d167f8b9a040dc66044.jpg	https://audio.tflat.vn/audio/c/o/conducive.mp3	Property & Departments	https://tienganhtflat.com/blog/toeic-words-property-departments	2026-07-24 17:22:34.132489	2
628	dispatch	verb	gửi đi	/dɪˈspætʃ/	to send something	The package was dispatched today.	Gói hàng đã được gửi hôm nay.	\N	\N	Logistics	\N	2026-07-24 17:36:44.573617	2
118	leisure	n.	Thời gian nhàn rỗi	/ˈliːʒər/	time that is spent doing what you enjoy	We can go to the permanent collection at our leisure.	Chúng tôi có thể đi góp nhặt/sưu tập thường xuyên vào lúc chúng tôi rảnh rỗi.	https://audio.tflat.vn/data/cache/images/300x225/l/e/leisure1.png	https://audio.tflat.vn/audio/l/e/leisure.mp3	Museums	https://tienganhtflat.com/blog/toeic-words-museums	2026-07-24 17:22:34.132489	2
232	session	n.	Kỳ họp, buổi họp	/'seʃn/	a period of time that is spent doing a particular activity	The morning sessions tend to fill up first, so sign up early.	Các phiên họp sáng có khuynh hướng kín chỗ trước hết, vì vậy hãy đăng ký sớm.	https://audio.tflat.vn/data/cache/images/300x225/s/e/session1.png	https://audio.tflat.vn/audio/s/e/session.mp3	Conference	https://tienganhtflat.com/blog/toeic-words-conference	2026-07-24 17:22:34.132489	2
569	automatically	adv.	‹một cách› tự động	/ˌɔːtəˈmætɪkli/	having controls that work without needing a person to operate them	The door opens automatically.	Cửa mở một cách tự động.	https://audio.tflat.vn/data/cache/images/300x225/a/u/automatically1.jpg	https://audio.tflat.vn/audio/a/u/automatically.mp3	Inventory	https://tienganhtflat.com/blog/toeic-words-inventory	2026-07-24 17:22:34.132489	2
195	separately	adv.	Một cách riêng biệt	/'seprətli/	as a separate person or thing; not together	The theater was very crowded so we had to sit separately.	Rạp hát rất đông nên chúng tôi phải ngồi riêng rẽ.	https://audio.tflat.vn/data/cache/images/300x225/s/e/separately1.png	https://audio.tflat.vn/audio/s/e/separately.mp3	Movies	https://tienganhtflat.com/blog/toeic-words-movies	2026-07-24 17:22:34.132489	2
921	lengthy	adjective	dài	/ˈleŋθi/	taking a long time	The discussion was lengthy.	Cuộc thảo luận kéo dài.	\N	\N	Office	\N	2026-07-24 18:01:26.486905	3
242	protect	v.	Bảo vệ, bảo hộ, che chở	/prəˈtekt/	to make sure that somebody / something is not harmed, injured	Consumer laws are designed to protect the public against unscrupulous vendors.	Luật tiêu dùng được thiết kế để bảo vệ công chúng trước những kẻ bán hàng vô lương tâm.	https://audio.tflat.vn/data/cache/images/300x225/p/r/protect1.png	https://audio.tflat.vn/audio/p/r/protect.mp3	Warranties	https://tienganhtflat.com/blog/toeic-words-warranties	2026-07-24 17:22:34.132489	2
164	disruption	n.	‹sự› gián đoạn	/dis'rʌpʃn/	to make it difficult for something to continue in the normal way	The accident on the main road through town is causing widespread disruption for motorists.	Vụ tai nạn trên đường chính qua thị trấn đang gây ra sự gián đoạn trên diện rộng cho người lái xe.	https://audio.tflat.vn/data/cache/images/300x225/d/i/disruption2.png	https://audio.tflat.vn/audio/d/i/disruption.mp3	Property & Departments	https://tienganhtflat.com/blog/toeic-words-property-departments	2026-07-24 17:22:34.132489	2
91	convince	v.	Thuyết phục	/kən'vins/	to make somebody / yourselft believe that something is true	He convinced me that he was right.	Anh ấy đã thuyết phục tôi rằng anh ấy đã đúng.	https://audio.tflat.vn/data/cache/images/300x225/c/o/convince1.png	https://audio.tflat.vn/audio/c/o/convince.mp3	Marketing	https://tienganhtflat.com/blog/toeic-words-marketing	2026-07-24 17:22:34.132489	2
356	system	n.	Hệ thống, chế độ	/ˈsɪstəm/	an organized set of ideas or theories	The airline system covers the entire world with flights.	Hệ thống hàng không trải ra/bao trùm toàn bộ thế giới bằng các chuyến bay.	https://audio.tflat.vn/data/images_example/300x225/t/h/the_airlin_ex1_56248d167f8b9a040dc6618c.jpg	https://audio.tflat.vn/audio/s/y/system.mp3	Airlines	https://tienganhtflat.com/blog/toeic-words-airlines	2026-07-24 17:22:34.132489	2
312	audit	v.	Kiểm toán	/'ɔ:dit/	to officially examine the financial accounts of a company.	The independent accountants audited the company's books.	Những kế toán viên độc lập đã kiểm toán sổ sách kế toán của công ty.\n	https://audio.tflat.vn/data/cache/images/300x225/a/u/audit1.png	https://audio.tflat.vn/audio/a/u/audit.mp3	Accounting	https://tienganhtflat.com/blog/toeic-words-accounting	2026-07-24 17:22:34.132489	2
666	allocate	verb	phân bổ	/ˈæləkeɪt/	to distribute resources	The budget was allocated wisely.	Ngân sách đã được phân bổ hợp lý.	\N	\N	Business	\N	2026-07-24 17:39:02.670694	2
16	due to	perp.	Bởi, vì, do, tại, nhờ có	/djuː tuː/	because of	Due to the low interest rates, good office space is difficult to find.	Vì mức lợi nhuận thấp, địa điểm văn phòng tốt rất khó tìm ra.	https://audio.tflat.vn/data/cache/images/300x225/d/u/due_to1.jpg	https://audio.tflat.vn/audio/d/u/due_to.mp3	Renting and Leasing	https://tienganhtflat.com/blog/toeic-words-renting-and-leasing	2026-07-24 17:22:34.132489	2
283	assignment	n.	‹sự› giao việc, phân công; quy là, cho là	/ə'sainmənt/	a task or piece of work that someone is given to do	This assignment has to be turned in before midnight.	Công việc được giao này phải được thực hiện trước nửa đêm.	https://audio.tflat.vn/data/cache/images/300x225/a/s/assignment-n11.jpg	https://audio.tflat.vn/audio/a/s/assignment-n1.mp3	Media	https://tienganhtflat.com/blog/toeic-words-media	2026-07-24 17:22:34.132489	2
615	value	v.	Đánh giá, định giá	/'vælju:/	to think that somebody / something is important	The expert valued the text at $7,000.	Chuyên gia đã định giá nguyên bản/cuốn sách là 7 ngàn đô-la.	https://audio.tflat.vn/data/cache/images/300x225/v/a/value1.jpg	https://audio.tflat.vn/audio/v/a/value.mp3	Promotions, Pensions & Award	https://tienganhtflat.com/blog/toeic-words-promotions-pensions-award	2026-07-24 17:22:34.132489	2
202	influx	n.	Sự chảy vào, sự tràn vào	/'inflʌks/	the fact of a lot of people, money, or things arriving somewhere	Due to the rise in popularity of cooking as a career, cooking schools report an influx of applications.	Vì việc gia tăng sự phổ biến của nghề nấu ăn, các trường dạy nấu ăn báo cáo một dòng chảy các đơn xin nhập học.	https://audio.tflat.vn/data/cache/images/300x225/i/n/influx1.png	https://audio.tflat.vn/audio/i/n/influx.mp3	Cooking As A Career	https://tienganhtflat.com/blog/toeic-words-cooking-as-a-career	2026-07-24 17:22:34.132489	2
690	hire	verb	thuê	/ˈhaɪər/	to employ someone	The company hired new engineers.	Công ty đã tuyển kỹ sư mới.	\N	\N	Employment	\N	2026-07-24 17:39:02.670694	2
426	embarkation	n.	‹sự/quá trình› lên tàu, cho lên tàu	/em'bɑ:'keiʃn/	the act of getting onto a ship	The flight creaw must check the passengers's documents before embarkation.	Phi hành đoàn phải kiểm tra giấy tờ của hành khách trước khi cho lên máy bay.	https://audio.tflat.vn/data/cache/images/300x225/e/m/embarkation.jpg	https://audio.tflat.vn/audio/e/m/embarkation.mp3	General Travel	https://tienganhtflat.com/blog/toeic-words-general-travel	2026-07-24 17:22:34.132489	2
677	contingency	noun	tình huống dự phòng	/kənˈtɪndʒənsi/	a possible future event	We prepared a contingency plan.	Chúng tôi đã chuẩn bị kế hoạch dự phòng.	\N	\N	Management	\N	2026-07-24 17:39:02.670694	2
417	time-consuming	adj.	Tốn nhiều thời gian, dài dòng	/tʌɪm kənˈsjuːmɪŋ/	take up a lot of time	Playing computer games is time-consuming.	Chơi các trò chơi máy tính tốn nhiều thời gian.	https://audio.tflat.vn/data/cache/images/300x225/t/i/time-consuming.jpg	https://audio.tflat.vn/audio/t/i/time-consuming.mp3	Job Ads & Recruitment	https://tienganhtflat.com/blog/toeic-words-job-ads-recruitment	2026-07-24 17:22:34.132489	2
37	health	n.	Sức khỏe	/hɛlθ/	\N	Exhaust fumes are bad for your health.	Khí thải có hại cho sức khỏe của bạn.	https://audio.tflat.vn/data/images_example/300x225/e/x/exhaust_fu_ex2_581c093f7f8b9a24318b45fe.jpg	https://audio.tflat.vn/audio/h/e/health.mp3	Health	https://tienganhtflat.com/blog/toeic-words-health	2026-07-24 17:22:34.132489	2
327	layout	n.	Sự bố trí trang giấy	/ˈleɪaʊt/	the way in which the parts of something such as the page of a book, a garden or a building are arranged	There is no single correct layout for business letters.	Trong thư thương mại thì không có bổ cục nào là chuẩn hoàn toàn hết cả.	https://audio.tflat.vn/data/cache/images/300x225/l/a/layout1.png	https://audio.tflat.vn/audio/l/a/layout.mp3	Correspondence	https://tienganhtflat.com/blog/toeic-words-correspondence	2026-07-24 17:22:34.132489	2
929	minimize	verb	giảm thiểu	/ˈmɪnɪmaɪz/	to reduce	We minimized production costs.	Chúng tôi đã giảm thiểu chi phí sản xuất.	\N	\N	Management	\N	2026-07-24 18:01:26.486905	2
155	expert	n.	Chuyên gia	/'ekspə:t/	a person with special knowledge, skill	Do you have any questions for our computer expert today?	Các bạn có câu hỏi gì cho chuyên gia máy tính hôm nay không?	https://audio.tflat.vn/data/cache/images/300x225/e/x/expert1.png	https://audio.tflat.vn/audio/e/x/expert.mp3	Apply and Interviewing	https://tienganhtflat.com/blog/toeic-words-apply-and-interviewing	2026-07-24 17:22:34.132489	2
741	automate	verb	tự động hóa	/ˈɔːtəmeɪt/	to make automatic	The factory automated production.	Nhà máy đã tự động hóa sản xuất.	\N	\N	Technology	\N	2026-07-24 17:41:11.759836	3
609	loyal	adj.	Trung thành, trung nghĩa, trung kiên	/'lɔiəl/	remaining faithful to somebody / something and supporting them or it	Even though your assistant is loyal, you have to question his job performance.	Dù là trợ lý của anh trung thành, anh vẫn phải đặt vấn đề về kết quả công việc của hắn.	https://audio.tflat.vn/data/cache/images/300x225/l/o/loyal1.png	https://audio.tflat.vn/audio/l/o/loyal.mp3	Promotions, Pensions & Award	https://tienganhtflat.com/blog/toeic-words-promotions-pensions-award	2026-07-24 17:22:34.132489	2
143	mix-up	n.	Hỗn độn, lộn xộn	/'miks'ʌp/	a situation that is full of confusion, especially because somebody has made a mistake	There was a mix-up about the ingredients and the dish was ruined.	Đã có một sự lộn xộn về các thành phần và món ăn đã bị hỏng.	https://audio.tflat.vn/data/cache/images/300x225/m/i/mix-up1.jpg	https://audio.tflat.vn/audio/m/i/mix-up.mp3	Eating Out	https://tienganhtflat.com/blog/toeic-words-eating-out	2026-07-24 17:22:34.132489	2
604	achievement	n.	Thành tích, thành tựu	/ə'tʃi:vmənt/	a thing that somebody has done successfully, especially using their own effort and skill	He has gained a lot of achievements in the last year.	Anh ấy đã đạt được khá nhiều thành tích trong năm vừa qua.	https://audio.tflat.vn/data/cache/images/300x225/a/c/achievement1.png	https://audio.tflat.vn/audio/a/c/achievement.mp3	Promotions, Pensions & Award	https://tienganhtflat.com/blog/toeic-words-promotions-pensions-award	2026-07-24 17:22:34.132489	2
659	productivity	noun	năng suất	/ˌprɑːdʌkˈtɪvəti/	efficiency of production	Productivity increased this quarter.	Năng suất tăng trong quý này.	\N	\N	Business	\N	2026-07-24 17:36:44.573617	2
745	cancellation	noun	sự hủy bỏ	/ˌkænsəˈleɪʃn/	the act of canceling	Flight cancellation caused delays.	Việc hủy chuyến bay gây chậm trễ.	\N	\N	Travel	\N	2026-07-24 17:41:11.759836	2
25	brand	n.	Nhãn hiệu, nhãn hàng, chi nhánh	/brænd/	a type of product made by a particular company	All brands of aspirin are the same.	Mọi nhãn hiệu về thuốc giảm đau aspirin là như nhau.	https://audio.tflat.vn/data/cache/images/300x225/b/r/brand2.png	https://audio.tflat.vn/audio/b/r/brand.mp3	Quality Control	https://tienganhtflat.com/blog/toeic-words-quality-control	2026-07-24 17:22:34.132489	2
495	chain	n.	Dây xích, chuỗi	/tʃein/	a group of stores or hotels owned by the same company	Budget-priced hotel chains have made a huge impact in the industry.	Chuỗi khách sạn giá rẻ đã tạo ra một tác động to lớn cho nền công nghiệp.	https://audio.tflat.vn/data/images_example/300x225/b/u/budget-pri_ex1_56248d167f8b9a040dc661b0.jpg	https://audio.tflat.vn/audio/c/h/chain.mp3	Hotels	https://tienganhtflat.com/blog/toeic-words-hotels	2026-07-24 17:22:34.132489	2
898	handling	noun	việc xử lý	/ˈhændlɪŋ/	the process of managing	Proper handling prevents damage.	Xử lý đúng cách giúp tránh hư hỏng.	\N	\N	Logistics	\N	2026-07-24 18:01:26.486905	2
811	expiration	noun	hạn sử dụng	/ˌekspəˈreɪʃn/	the end of a valid period	Check the expiration date.	Hãy kiểm tra hạn sử dụng.	\N	\N	Retail	\N	2026-07-24 17:44:13.10333	2
287	decision	n.	Quyết định	/di'siʤn/	a choice or judgment that you make after thinking	It is time for me to make a very important decision which can change my life.	Đã đến lúc để tôi đưa ra một quyết định quan trọng có thể thay đổi cả cuộc sống của tôi.	https://audio.tflat.vn/data/cache/images/300x225/d/e/decision1.png	https://audio.tflat.vn/audio/d/e/decision.mp3	Media	https://tienganhtflat.com/blog/toeic-words-media	2026-07-24 17:22:34.132489	2
340	list	n.	Danh sách	/list/	a series of names, items, figures, etc., especially when they are written or printed	I have to buy the food on the list.	Tôi phải mua thực phẩm trong danh sách.	https://audio.tflat.vn/data/cache/images/300x225/l/i/list1.jpg	https://audio.tflat.vn/audio/l/i/list.mp3	Ordering Lunch	https://tienganhtflat.com/blog/toeic-words-ordering-lunch	2026-07-24 17:22:34.132489	2
624	convention	noun	hội nghị	/kənˈvenʃn/	a large formal meeting	She attended the annual convention.	Cô ấy tham dự hội nghị thường niên.	\N	\N	Business	\N	2026-07-24 17:36:44.573617	2
652	compliance	noun	sự tuân thủ	/kəmˈplaɪəns/	following rules	Compliance is mandatory.	Việc tuân thủ là bắt buộc.	\N	\N	Legal	\N	2026-07-24 17:36:44.573617	2
448	estimate	v.	Ước lượng	/ˈestɪmət/	to form an idea of the cost, size, value etc. of something, but without calculating it exactly	We estimated our losses this year at about five thousand dollars.	Chúng tôi ước tính thua lỗ trong năm nay của chúng tôi là vào khoảng 5 ngàn đô-la.	https://audio.tflat.vn/data/cache/images/300x225/e/s/estimate1.png	https://audio.tflat.vn/audio/e/s/estimate.mp3	Invoice	https://tienganhtflat.com/blog/toeic-words-invoice	2026-07-24 17:22:34.132489	2
199	culinary	adj.	Việc bếp núc	/'kʌlinəri/	connected with cooking or food	The chef was widely known for his culinary artistry.	Người đầu biết được biết đến rộng rãi về nghệ thuật thuật ẩm thực của ông ấy.	https://audio.tflat.vn/data/cache/images/300x225/c/u/culinary1.png	https://audio.tflat.vn/audio/c/u/culinary.mp3	Cooking As A Career	https://tienganhtflat.com/blog/toeic-words-cooking-as-a-career	2026-07-24 17:22:34.132489	2
48	salary	n.	Lương hàng tháng	/ˈsæləri/	money that employees receive for doing their job	The technician was pleased to have a raise in salary after only six months on the job.	Người kỹ thuật viên đã hài lòng khi có sự tăng lương chỉ sau 6 tháng làm việc.	https://audio.tflat.vn/data/cache/images/300x225/s/a/salary1.png	https://audio.tflat.vn/audio/s/a/salary.mp3	Health	https://tienganhtflat.com/blog/toeic-words-health	2026-07-24 17:22:34.132489	2
416	submit	v.	Trình, đệ trình; biện hộ	/səb'mit/	to present for consideration	Please submit your résumé to the human resources department.	Hãy nộp sơ yếu lý lịch của anh cho bộ phận nhân sự (bộ phận nguồn nhân lực).	https://audio.tflat.vn/data/cache/images/300x225/s/u/submit1.png	https://audio.tflat.vn/audio/s/u/submit.mp3	Job Ads & Recruitment	https://tienganhtflat.com/blog/toeic-words-job-ads-recruitment	2026-07-24 17:22:34.132489	2
461	favor	v.	Thích, thiện cảm	/'feivə/	to prefer one plan, way of doing something, ect to another	Sam enjoys the works of several composers but he tends to favor Mozart.	Sam thưởng thức các tác phẩm của vài nhà soạn nhạc nhưng anh có khuynh hướng thiên về Mozart hơn.	https://audio.tflat.vn/data/cache/images/300x225/f/a/favor-v1.jpg	https://audio.tflat.vn/audio/f/a/favor-v.mp3	Music	https://tienganhtflat.com/blog/toeic-words-music	2026-07-24 17:22:34.132489	2
389	recommendation	n.	Lời dặn dò, đề nghị 	/,rekəmen'deiʃn/	an official suggestion about the best thing to do	It is important to follow the doctor's recommendations if you want to improve your health.	Thật quan trọng để làm theo những dặn dò của bác sĩ nếu bạn muốn cải thiện sức khỏe.	https://audio.tflat.vn/data/cache/images/300x225/r/e/recommendation.png	https://audio.tflat.vn/audio/r/e/recommendation.mp3	Doctor's Office	https://tienganhtflat.com/blog/toeic-words-doctor-s-office	2026-07-24 17:22:34.132489	2
596	evaluate	v.	Đánh giá, định giá; ước lượng	/i'væljueit/	to form an opinion of amount, value or quality of something	It's important to evaluate your competition when making a business plan.	Đánh giá sức cạnh tranh của bạn là việc quan trọng khi lập một kế hoạch kinh doanh.	https://audio.tflat.vn/data/cache/images/300x225/e/v/evaluate1.png	https://audio.tflat.vn/audio/e/v/evaluate.mp3	Business Planning	https://tienganhtflat.com/blog/toeic-words-business-planning	2026-07-24 17:22:34.132489	2
203	method	n.	Phương pháp, cách thức	/ˈmeθəd/	a particular way of doing something	Gloria perfected a simple method for making croissants.	Gloria đã hoàn thành một phương pháp đơn giản để làm bánh sừng bò.	https://audio.tflat.vn/data/cache/images/300x225/m/e/method1.jpg	https://audio.tflat.vn/audio/m/e/method.mp3	Cooking As A Career	https://tienganhtflat.com/blog/toeic-words-cooking-as-a-career	2026-07-24 17:22:34.132489	2
150	background	n.	Kiến thức, kinh nghiệm	/'bækgraund/	the details of a person's familly, education, experience	Your background in the publishing industry is a definite asset for this job.	Kiến thức của anh trong công nghiệp xuất bản là một vốn quý rõ ràng cho công việc này.	https://audio.tflat.vn/data/cache/images/300x225/b/a/background1.jpg	https://audio.tflat.vn/audio/b/a/background.mp3	Apply and Interviewing	https://tienganhtflat.com/blog/toeic-words-apply-and-interviewing	2026-07-24 17:22:34.132489	2
613	promote	v.	Khuyến khích, đẩy mạnh, làm tăng thêm	/prəˈməʊt/	to move somebody to a higher rank or more senior job	The youth club in my neighbourhood works to promote awareness of the dangers that threaten our environment.	Câu lạc bộ thanh niên ở vùng tôi hoạt động để tăng thêm nhận thức về những nguy hiểm đe dọa môi trường của chúng ta.	https://audio.tflat.vn/data/images_example/300x225/t/h/the_youth__ex1_56248d157f8b9a040dc65ef4.jpg	https://audio.tflat.vn/audio/p/r/promote.mp3	Promotions, Pensions & Award	https://tienganhtflat.com/blog/toeic-words-promotions-pensions-award	2026-07-24 17:22:34.132489	2
430	shopping	n.	Mua sắm	/ˈʃɒpɪŋ/	\N	Let's go shopping.	Nào cùng nhau đi mua sắm.	https://audio.tflat.vn/data/cache/images/300x225/s/h/shopping11.jpg	https://audio.tflat.vn/audio/s/h/shopping1.mp3	Shopping	https://tienganhtflat.com/blog/toeic-words-shopping	2026-07-24 17:22:34.132489	2
588	potential	adj.	Tiềm năng, tiềm tàng	/pəˈtenʃl/	that can develop into something or be developed in the future	They will select potential matches and help the two people meet face to face.	Họ sẽ chọn những người phù hợp có tiềm năng và giúp hai người gặp mặt trực tiếp.	https://audio.tflat.vn/data/cache/images/300x225/p/o/potential1.png	https://audio.tflat.vn/audio/p/o/potential.mp3	Pharmacy	https://tienganhtflat.com/blog/toeic-words-pharmacy	2026-07-24 17:22:34.132489	2
870	detect	verb	phát hiện	/dɪˈtekt/	to discover	The system detected an error.	Hệ thống đã phát hiện lỗi.	\N	\N	Technology	\N	2026-07-24 17:59:36.547339	2
127	contact	v.	Tiếp xúc, liên hệ	/ˈkɒntækt/	to get in touch with	Manuel contacted at least a dozen car rental agencies to get the best deal.	Manuel đã tiếp xúc với ít nhất một tá đại lý đại lý cho thuê xe để được giao dịch tốt nhất.	https://audio.tflat.vn/data/cache/images/300x225/c/o/contact1.png	https://audio.tflat.vn/audio/c/o/contact.mp3	Car Rentals	https://tienganhtflat.com/blog/toeic-words-car-rentals	2026-07-24 17:22:34.132489	2
444	compile	v.	Soạn, biên soạn, soạn thảo	/kəmˈpaɪl/	to produce a book, list, report, etc. by bringing together different items, articles, songs, etc.	The clerk is responsible for compiling the orders at the end of the day.	Người nhân viên chịu trách nhiệm soạn các đơn đặt hàng vào cuối ngày.	https://audio.tflat.vn/data/cache/images/300x225/c/o/compile1.png	https://audio.tflat.vn/audio/c/o/compile.mp3	Invoice	https://tienganhtflat.com/blog/toeic-words-invoice	2026-07-24 17:22:34.132489	2
595	develop	v.	Phát triển	/di'veləp/	to gradually grow or become bigger, more advanced	This job can give you an opportunity to develop new skills.	Công việc này có thể cho bạn cơ hội phát triển các kỹ năng mới.	https://audio.tflat.vn/data/cache/images/300x225/d/e/develop1.jpg	https://audio.tflat.vn/audio/d/e/develop.mp3	Business Planning	https://tienganhtflat.com/blog/toeic-words-business-planning	2026-07-24 17:22:34.132489	2
627	delegate	verb	ủy quyền	/ˈdelɪɡeɪt/	to assign responsibility	The director delegated the task.	Giám đốc đã giao nhiệm vụ.	\N	\N	Management	\N	2026-07-24 17:36:44.573617	2
646	stakeholder	noun	bên liên quan	/ˈsteɪkhoʊldər/	a person with an interest	Stakeholders approved the proposal.	Các bên liên quan đã phê duyệt đề xuất.	\N	\N	Business	\N	2026-07-24 17:36:44.573617	2
619	collaborate	verb	hợp tác	/kəˈlæbəreɪt/	to work together	Our teams collaborated successfully.	Các nhóm của chúng tôi đã hợp tác thành công.	\N	\N	Business	\N	2026-07-24 17:36:44.573617	2
23	option	n.	Sự chọn lựa, quyền lựa chọn	/'ɔpʃn/	something that you can choose to have or do	With the real estate market so tight right now, you don't have that many options.	Với thị trường BĐS khan hiếm đến vậy vào lúc này, anh không có nhiều chọn lựa đến vậy.	https://audio.tflat.vn/data/cache/images/300x225/o/p/option2.jpg	https://audio.tflat.vn/audio/o/p/option.mp3	Renting and Leasing	https://tienganhtflat.com/blog/toeic-words-renting-and-leasing	2026-07-24 17:22:34.132489	2
45	policy	n.	Chính sách, hợp đồng, khế ước	/'pɔlisi/	a plan of action agreed or chosen by a political party, a business, etc.	The company's insurance policy did not cover cosmetic surgery.	Chính sách bảo hiểm của công ty không bao gồm phẫu thuật thẩm mỹ.	https://audio.tflat.vn/data/cache/images/300x225/p/o/policy1.png	https://audio.tflat.vn/audio/p/o/policy.mp3	Health	https://tienganhtflat.com/blog/toeic-words-health	2026-07-24 17:22:34.132489	2
571	discrepancy	n.	‹sự› khác nhau, trái ngược nhau	/dis'krepənsi/	a difference between two or more things that should be the same	We easily explained the discrepancy between the two destiny.	Chúng tôi dễ dàng giải thích sự khác nhau giữa 2 số phận. 	https://audio.tflat.vn/data/cache/images/300x225/d/i/discrepancy1.jpg	https://audio.tflat.vn/audio/d/i/discrepancy.mp3	Inventory	https://tienganhtflat.com/blog/toeic-words-inventory	2026-07-24 17:22:34.132489	2
843	calculate	verb	tính toán	/ˈkælkjuleɪt/	to determine mathematically	Please calculate the total cost.	Vui lòng tính tổng chi phí.	\N	\N	Accounting	\N	2026-07-24 17:59:36.547339	2
755	consecutive	adjective	liên tiếp	/kənˈsekjətɪv/	following one after another	Sales increased for three consecutive months.	Doanh số tăng ba tháng liên tiếp.	\N	\N	Business	\N	2026-07-24 17:41:11.759836	2
771	disclose	verb	tiết lộ	/dɪsˈkloʊz/	to reveal information	Do not disclose confidential data.	Không được tiết lộ dữ liệu bảo mật.	\N	\N	Legal	\N	2026-07-24 17:41:11.759836	2
505	service	n.	Dịch vụ	/ˈsɜːvɪs/	useful function	The food was good but the service was very slow.	Thức ăn thì rất ngon nhưng dịch vụ thì quá tồi.	https://audio.tflat.vn/data/cache/images/300x225/s/e/service1.jpeg	https://audio.tflat.vn/audio/s/e/service.mp3	Hotels	https://tienganhtflat.com/blog/toeic-words-hotels	2026-07-24 17:22:34.132489	3
354	situation	n.	Tình hình, vị thế	/,sitju'eiʃn/	all the circumstances and things that are happening at a particular time and in a particular place	The airline suggested I check with the State Department regarding the political situation in the country I'm flying to.	Hãng hàng không đã đề nghị tôi kiểm tra với Bộ Ngoại giao Mỹ về tình hình chính trị ở quốc gia mà tôi đang bay đến.	https://audio.tflat.vn/data/cache/images/300x225/s/i/situation1.png	https://audio.tflat.vn/audio/s/i/situation.mp3	Airlines	https://tienganhtflat.com/blog/toeic-words-airlines	2026-07-24 17:22:34.132489	2
916	justify	verb	biện minh	/ˈdʒʌstɪfaɪ/	to show good reason	Please justify the expenses.	Vui lòng giải trình các khoản chi.	\N	\N	Accounting	\N	2026-07-24 18:01:26.486905	2
871	diminish	verb	giảm bớt	/dɪˈmɪnɪʃ/	to become smaller	Costs diminished over time.	Chi phí giảm dần theo thời gian.	\N	\N	Finance	\N	2026-07-24 17:59:36.547339	2
171	scrutiny	n.	 xem xét/kiểm tra kỹ lưỡng	/'skru:tini/	careful and thorough examination	Jim left his old job because he found it difficult to work under the close scrutiny of his boss.	Jim đã rời bỏ công việc cũ vì anh thấy khó làm việc dưới sự săm sõi kỹ lưỡng của sếp.	https://audio.tflat.vn/data/cache/images/300x225/s/c/scrutiny2.png	https://audio.tflat.vn/audio/s/c/scrutiny.mp3	Property & Departments	https://tienganhtflat.com/blog/toeic-words-property-departments	2026-07-24 17:22:34.132489	2
353	prospective	adj.	(thuộc) tương lai, triển vọng; về sau, sắp tới	/prəˈspektɪv/	expected to do something or to become something	I narrowed my list of prospective destinations to my three top choices.	Tôi rút gọn danh sách các điểm đến triển vọng đối với tôi xuống còn 3 chọn lựa.	https://audio.tflat.vn/data/cache/images/300x225/p/r/prospective.jpg	https://audio.tflat.vn/audio/p/r/prospective.mp3	Airlines	https://tienganhtflat.com/blog/toeic-words-airlines	2026-07-24 17:22:34.132489	2
65	keep up with	v.	Theo kịp, bắt kịp, đạt cho bằng được	/kiːp ʌp wɪð/	to stay equal with	Employees are encouraged to take courses in order to keep up with new developments.	Nhân viên được khuyến khích tham dự các khóa đào tạo để theo kịp sự phát triển mới.	https://audio.tflat.vn/data/cache/images/300x225/k/e/keep_up_with.jpg	https://audio.tflat.vn/audio/k/e/keep_up_with.mp3	Hiring and Training	https://tienganhtflat.com/blog/toeic-words-hiring-and-training	2026-07-24 17:22:34.132489	2
433	behaviour	n.	Thái độ, hành vi, cách cư xử, cách đối xử, cách ăn ở	/bi'heivjə/	the way that somebody behaves, especially towards other people	Suspicious behaviour in a department store will draw the attention of the security guards.	Thái độ khả nghi ở trong cửa hàng bách hóa sẽ thu hút sự chú ý của nhân viên an ninh.	https://audio.tflat.vn/data/images_example/300x225/s/u/suspicious_ex1_580de4657f8b9a84688b4597.png	https://audio.tflat.vn/audio/b/e/behaviour.mp3	Shopping	https://tienganhtflat.com/blog/toeic-words-shopping	2026-07-24 17:22:34.132489	2
221	conference	n.	Hội nghị	/ˈkɒnf(ə)r(ə)n/	\N	That room is used for exhibitions, conferences and social events.	Căn phòng đó được dùng cho triển lãm, hội nghị và các sự kiện xã hội.	https://audio.tflat.vn/data/cache/images/300x225/c/o/conference1.jpg	https://audio.tflat.vn/audio/c/o/conference.mp3	Conference	https://tienganhtflat.com/blog/toeic-words-conference	2026-07-24 17:22:34.132489	2
249	examine	v.	Khảo sát, nghiên cứu	/ig'zæmin/	to consider or study an idea, a subject, etc. very carefully	These ideas will be examined in more detail in Chapter 10.	Những ý tưởng này sẽ được xem xét chi tiết hơn trong Chương 10.	https://audio.tflat.vn/data/cache/images/300x225/e/x/examine2.png	https://audio.tflat.vn/audio/e/x/examine.mp3	Product Development	https://tienganhtflat.com/blog/toeic-words-product-development	2026-07-24 17:22:34.132489	2
762	criterion	noun	tiêu chí	/kraɪˈtɪriən/	a standard for judgment	Price is an important criterion.	Giá cả là một tiêu chí quan trọng.	\N	\N	Business	\N	2026-07-24 17:41:11.759836	2
51	as needed	adv.	Lúc cần thiết	/az niːdɪd/	In need	The service contract states that repairs will be made on a basis as needed.	Hợp đồng dịch vụ nói rằng việc sửa chữa sẽ được thực hiện dựa trên cơ sở lúc cần thiết.	https://audio.tflat.vn/data/cache/images/300x225/a/s/as_needed2.jpg	https://audio.tflat.vn/audio/a/s/as_needed.mp3	Office Technology	https://tienganhtflat.com/blog/toeic-words-office-technology	2026-07-24 17:22:34.132489	2
404	site	n.	Địa điểm	/saɪt/	a place where a building, town, etc. was, is, or will be located	This is one of the historic and cultural sites of Vietnam.	Đây là một trong những địa điểm văn hóa và lịch sử của Việt Nam.	https://audio.tflat.vn/data/cache/images/300x225/s/i/site1.jpg	https://audio.tflat.vn/audio/s/i/site.mp3	Events	https://tienganhtflat.com/blog/toeic-words-events	2026-07-24 17:22:34.132489	2
583	detect	v.	Tìm ra, khám phá ra, nhận thấy	/di'tekt/	to discover something	The tests are designed to detect the disease early.	Các xét nghiệm này được thiết kế để phát hiện bệnh sớm.	https://audio.tflat.vn/data/cache/images/300x225/d/e/detect1.png	https://audio.tflat.vn/audio/d/e/detect.mp3	Pharmacy	https://tienganhtflat.com/blog/toeic-words-pharmacy	2026-07-24 17:22:34.132489	2
801	cooperate	verb	hợp tác	/koʊˈɑːpəreɪt/	to work together	Departments cooperated effectively.	Các phòng ban đã hợp tác hiệu quả.	\N	\N	Business	\N	2026-07-24 17:44:13.10333	2
559	daringly	adv.	Táo bạo, cả gan, phiêu lưu, dũng cảm (bravely)	/ˈdeərɪŋli/	brave; willing to do dangerous	We daringly ordered the raw squid.	Chúng tôi cả gan gọi món mực sống.	https://audio.tflat.vn/data/images_example/300x225/w/e/we_daringl_ex1_580ec4a47f8b9a0e898b4567.jpg	https://audio.tflat.vn/audio/d/a/daringly.mp3	Selecting A Restaurant	https://tienganhtflat.com/blog/toeic-words-selecting-a-restaurant	2026-07-24 17:22:34.132489	2
41	concern	n.	Mối quan tâm, lo lắng	/kənˈsɜːn/	a feeling of worry	Whenever I have health concerns, I call my doctor.	Hễ khi nào tôi có lo ngại về sức khỏe, tôi gọi cho bác sĩ của mình.	https://audio.tflat.vn/data/images_example/300x225/w/h/whenever_i_ex1_56248cfc7f8b9afa0cb17fd8.jpg	https://audio.tflat.vn/audio/c/o/concern.mp3	Health	https://tienganhtflat.com/blog/toeic-words-health	2026-07-24 17:22:34.132489	2
729	advisory	adjective	mang tính tư vấn	/ədˈvaɪzəri/	giving advice	The advisory committee met yesterday.	Ủy ban tư vấn đã họp hôm qua.	\N	\N	Business	\N	2026-07-24 17:41:11.759836	2
507	balance	v.	Quyết toán	/'bæləns/	to show that in an account the total money spent is equal to the total money received	It took him over an hour to balance his checkbook.	Nó lấy mất của anh hơn một tiếng đồng hồ để quyết toán tập chi phiếu.	https://audio.tflat.vn/data/cache/images/300x225/b/a/balance1.png	https://audio.tflat.vn/audio/b/a/balance.mp3	Banking	https://tienganhtflat.com/blog/toeic-words-banking	2026-07-24 17:22:34.132489	2
576	scan	v.	Xem lướt, xem qua	/skæn/	to look at every part of something carefully, especially because you are looking for a particular thing or person	He scanned through the newspaper over breakfast.	Anh ấy đã xem qua tờ báo trong lúc ăn sáng.	https://audio.tflat.vn/data/images_example/300x225/h/e/he_scanned_ex1_56248d157f8b9a040dc65f84.png	https://audio.tflat.vn/audio/s/c/scan.mp3	Inventory	https://tienganhtflat.com/blog/toeic-words-inventory	2026-07-24 17:22:34.132489	2
110	withhold	v.	Giấu, kìm lại, giữ lại	/wi 'hould/	to refuse to give something to someone	Do not withhold any information from your accountant or he will not be able to prepare your tax form correctly.	Đừng giấu diếm bất kỳ thông tin nào với người kế toán của bạn kẻo không anh ta không thể chuẩn bị biểu mẫu thuế cho bạn chính xác được.	https://audio.tflat.vn/data/cache/images/300x225/w/i/withhold1.png	https://audio.tflat.vn/audio/w/i/withhold.mp3	Taxes	https://tienganhtflat.com/blog/toeic-words-taxes	2026-07-24 17:22:34.132489	2
792	booklet	noun	cuốn sổ tay	/ˈbʊklət/	a small book	Read the instruction booklet.	Hãy đọc cuốn sổ tay hướng dẫn.	\N	\N	Office	\N	2026-07-24 17:44:13.10333	2
469	comprehensive	adj.	Bao hàm, toàn diện	/,kɔmpri'hensiv/	including all, or almost all, the items, details, facts, information, etc., that may be concerned	Our travel agent gave us a comprehensive travel package, including rail passes.	Người đại lý du lịch của chúng tôi trao cho một gói du lịch toàn diện, kể cả đi tàu lửa.	https://audio.tflat.vn/data/cache/images/300x225/c/o/comprehensive2.jpg	https://audio.tflat.vn/audio/c/o/comprehensive.mp3	Trains	https://tienganhtflat.com/blog/toeic-words-trains	2026-07-24 17:22:34.132489	2
759	convey	verb	truyền đạt	/kənˈveɪ/	to communicate	The report conveys important information.	Báo cáo truyền đạt thông tin quan trọng.	\N	\N	Communication	\N	2026-07-24 17:41:11.759836	2
34	throw out	v.	Vứt bỏ, đuổi đi	/θrəʊ aʊt/	\N	You'll be thrown out if you don't pay the rent.	Bạn sẽ được đuổi ra nếu bạn không trả tiền thuê nhà.	https://audio.tflat.vn/data/cache/images/300x225/t/h/throw_out1.png	https://audio.tflat.vn/audio/t/h/throw_out.mp3	Quality Control	https://tienganhtflat.com/blog/toeic-words-quality-control	2026-07-24 17:22:34.132489	2
390	record	n.	Hồ sơ, sổ sách, biên bản	/´rekərd/	a written account of something that is kept so that it can be looked at and used in the future	You should keep a record of your expenses.	Bạn nên lưu trữ lại hồ sơ lưu trữ chi phí khám bệnh của bạn.	https://audio.tflat.vn/data/images_example/300x225/y/o/you_should_ex1_56248cf57f8b9af80c0121ad.jpg	https://audio.tflat.vn/audio/r/e/record.mp3	Doctor's Office	https://tienganhtflat.com/blog/toeic-words-doctor-s-office	2026-07-24 17:22:34.132489	2
744	boost	verb	thúc đẩy	/buːst/	to increase	Advertising boosted sales.	Quảng cáo đã thúc đẩy doanh số.	\N	\N	Marketing	\N	2026-07-24 17:41:11.759836	2
42	emphasize	v.	Nhấn mạnh, làm nổi bật	/ˈɛmfəˌsaɪz/	to give special importance to something	The nurse emphasized the importance of eating a balanced diet.	Người y tá nhấn mạnh tầm quan trọng của việc ăn uống theo chế độ cân bằng.	https://audio.tflat.vn/data/images_example/300x225/t/h/the_nurse__ex1_56248d167f8b9a040dc66284.png	https://audio.tflat.vn/audio/e/m/emphasize.mp3	Health	https://tienganhtflat.com/blog/toeic-words-health	2026-07-24 17:22:34.132489	2
276	lengthy	adj.	Lâu, dài, dài dòng	/'leɳθi/	very long, and often too long, in time or size	After lengthy discussions, the chairperson was reelected for another term.	Sau những cuộc tranh luận dài, vị chủ tịch đã được bầu lại một nhiệm kỳ nữa.	https://audio.tflat.vn/data/cache/images/300x225/l/e/lengthy2.png	https://audio.tflat.vn/audio/l/e/lengthy.mp3	Board Meeting & Committees	https://tienganhtflat.com/blog/toeic-words-board-meeting-committees	2026-07-24 17:22:34.132489	2
248	assume	v.	Đảm đương, gánh vác	/ə'sju:m/	to take or begin to have power or responsibility	It is generally assumed that stress is caused by too much work.	Nhiều người tin rằng sự căng thẳng gây ra bởi quá nhiều công việc.	https://audio.tflat.vn/data/cache/images/300x225/a/s/assume1.png	https://audio.tflat.vn/audio/a/s/assume.mp3	Product Development	https://tienganhtflat.com/blog/toeic-words-product-development	2026-07-24 17:22:34.132489	2
853	conclude	verb	kết luận	/kənˈkluːd/	to finish	The meeting concluded at noon.	Cuộc họp kết thúc vào buổi trưa.	\N	\N	Office	\N	2026-07-24 17:59:36.547339	2
886	favorable	adjective	thuận lợi	/ˈfeɪvərəbl/	showing approval or advantage	Market conditions are favorable.	Điều kiện thị trường đang thuận lợi.	\N	\N	Business	\N	2026-07-24 18:01:26.486905	2
28	enhance	v.	Nâng cao, tăng cường	/in'hɑ:ns/	to increase or further improve the good quality, value, or status of someone or something	This is an opportunity to enhance the reputation of the company.	Đây là cơ hội để nâng cao danh tiếng của công ty.	https://audio.tflat.vn/data/cache/images/300x225/e/n/enhance2.png	https://audio.tflat.vn/audio/e/n/enhance.mp3	Quality Control	https://tienganhtflat.com/blog/toeic-words-quality-control	2026-07-24 17:22:34.132489	2
494	advanced	adj.	Tiên tiến	/ədˈvɑːnst/	having the most modern and recently developed ideas, methods, etc.	Since the hotel installed an advanced computer system, all operations have been functioning more smoothly.	Bởi vì khách sạn đã lắp đặt một hệ thống máy tính tiên tiến, mọi hoạt động đang được vận hành trơn tru.	https://audio.tflat.vn/data/cache/images/300x225/a/d/advanced1.jpg	https://audio.tflat.vn/audio/a/d/advanced.mp3	Hotels	https://tienganhtflat.com/blog/toeic-words-hotels	2026-07-24 17:22:34.132489	2
728	administer	verb	quản lý	/ədˈmɪnɪstər/	to manage or supervise	She administers the training program.	Cô ấy quản lý chương trình đào tạo.	\N	\N	Management	\N	2026-07-24 17:41:11.759836	2
338	impress	v.	Gây ấn tượng, để lại ấn tượng	/ɪmˈpres/	if a person or thing impresses you, you feel admiration for them or it	She was really impressed by the beauty of the city at night.	Cô ấy đã thực sự bị ấn tượng bởi vẻ đẹp của thành phố về đêm.	https://audio.tflat.vn/data/images_example/300x225/s/h/she_was_re_ex1_56248cff7f8b9afc0c297ffd.jpg	https://audio.tflat.vn/audio/i/m/impress.mp3	Ordering Lunch	https://tienganhtflat.com/blog/toeic-words-ordering-lunch	2026-07-24 17:22:34.132489	2
152	call in	v.	Yêu cầu, mời tới	/A/	to ask to come, to beckon	The HR manager called in all the qualified applicants for a 2nd interview.	Giám đốc nhân sự mời tất cả các ứng viên đủ điều kiện cho một cuộc phỏng vấn lần 2.	https://audio.tflat.vn/data/cache/images/300x225/c/a/call_in.jpg	https://audio.tflat.vn/audio/c/a/call_in.mp3	Apply and Interviewing	https://tienganhtflat.com/blog/toeic-words-apply-and-interviewing	2026-07-24 17:22:34.132489	2
704	recruit	verb	tuyển dụng	/rɪˈkruːt/	to hire employees	The company recruits graduates.	Công ty tuyển dụng sinh viên mới tốt nghiệp.	\N	\N	Human Resources	\N	2026-07-24 17:39:02.670694	2
210	allocate	v.	Cấp cho, phân phối	/ˈæləkeɪt/	to give something officially to somebody / something for a particular purpose	The office manager did not allocate enough money to purchase software.	Người quản lý văn phòng không cấp đủ tiền để mua sắm phần mềm.	https://audio.tflat.vn/data/cache/images/300x225/a/l/allocate1.png	https://audio.tflat.vn/audio/a/l/allocate.mp3	Computers and the Internet	https://tienganhtflat.com/blog/toeic-words-computers-and-the-internet	2026-07-24 17:22:34.132489	2
176	code	n.	Quy tắc, luật lệ	/koud/	a set moral principles or rules of behaviour	Even the most traditional companies are changing their dress code to something less formal.	Thậm chí hầu hết các công ty theo lối cổ cũng đang thay đổi quy tắc ăn mặc của họ sao cho bớt trịnh trọng đi.	https://audio.tflat.vn/data/images_example/300x225/e/v/even_the_m_ex1_56248d157f8b9a040dc65e38.jpg	https://audio.tflat.vn/audio/c/o/code.mp3	Office Procedures	https://tienganhtflat.com/blog/toeic-words-office-procedures	2026-07-24 17:22:34.132489	2
434	checkout	n.	Thanh toán, quầy thanh toán (ở siêu thị, ks...)	/tʃɛk aʊt/	the place where you pay for the things that you are buying in a supermarket	The line at this checkout is too long, so let's look for another.	Hàng chờ tại quầy tính tiền này dài quá, vậy chúng ta hãy đi tìm hàng khác.	https://audio.tflat.vn/data/cache/images/300x225/c/h/checkout_n2.jpg	https://audio.tflat.vn/audio/c/h/checkout_n.mp3	Shopping	https://tienganhtflat.com/blog/toeic-words-shopping	2026-07-24 17:22:34.132489	2
136	basis	n.	Cơ bản, cơ sở	/ˈbeɪsɪs/	the reason why people make a particular choice	She was chosen for the job on the basis of her qualifications.	Cô đã được lựa chọn cho công việc trên cơ sở trình độ của cô.	https://audio.tflat.vn/data/cache/images/300x225/b/a/basis-clone13.jpg	https://audio.tflat.vn/audio/b/a/basis-clone1.mp3	Eating Out	https://tienganhtflat.com/blog/toeic-words-eating-out	2026-07-24 17:22:34.132489	2
860	credible	adjective	đáng tin cậy	/ˈkredəbl/	believable	The source is credible.	Nguồn thông tin đáng tin cậy.	\N	\N	Business	\N	2026-07-24 17:59:36.547339	2
693	installment	noun	trả góp	/ɪnˈstɔːlmənt/	one payment of several	He paid in monthly installments.	Anh ấy thanh toán theo từng đợt hàng tháng.	\N	\N	Finance	\N	2026-07-24 17:39:02.670694	2
831	absorb	verb	tiếp thu	/əbˈzɔːrb/	to take in	The training helped employees absorb new skills.	Khóa đào tạo giúp nhân viên tiếp thu kỹ năng mới.	\N	\N	Training	\N	2026-07-24 17:59:36.547339	2
766	determine	verb	xác định	/dɪˈtɜːrmɪn/	to decide or find out	We determined the cause.	Chúng tôi đã xác định nguyên nhân.	\N	\N	Business	\N	2026-07-24 17:41:11.759836	2
4	delicately	adv.	‹một cách› tinh vi, tế nhị, lịch thiệp	/ˈdelɪkət/	easily damaged or broken	The manager delicately asked about the health of his client.	Người trưởng phòng tế nhị hỏi thăm sức khỏe khách hàng của anh ta.	https://audio.tflat.vn/data/cache/images/300x225/d/e/delicately1.jpg	https://audio.tflat.vn/audio/d/e/delicately.mp3	Salaries & Benefits	https://tienganhtflat.com/blog/toeic-words-salaries-benefits	2026-07-24 17:22:34.132489	2
436	expand	v.	Mở rộng, phát triển	/iks'pænd/	to become greater in size, number or importance	The telephone networks in rural areas should be expanded.	Mạng lưới điện thoại ở các vùng sâu vùng xa nên được mở rộng.	https://audio.tflat.vn/data/cache/images/300x225/e/x/expand1.jpg	https://audio.tflat.vn/audio/e/x/expand.mp3	Shopping	https://tienganhtflat.com/blog/toeic-words-shopping	2026-07-24 17:22:34.132489	2
314	build up	v.	Xây dựng dần lên	/'bildʌp/	to increase over time.	The firm has to build up a solid reputation for itself.	Công ty phải xây dựng dần lên danh tiếng vững chắc cho chính mình.	https://audio.tflat.vn/data/cache/images/300x225/b/u/build_up1.jpg	https://audio.tflat.vn/audio/b/u/build_up.mp3	Accounting	https://tienganhtflat.com/blog/toeic-words-accounting	2026-07-24 17:22:34.132489	2
493	hotel	n.	Khách sạn	/həʊˈtel/	\N	I live near Horison hotel.	Tôi sống gần khách sạn Horison.	https://audio.tflat.vn/data/images_example/300x225/i/_/i_live_nea_ex1_58243d057f8b9aa1078b45b3.png	https://audio.tflat.vn/audio/h/o/hotel.mp3	Hotels	https://tienganhtflat.com/blog/toeic-words-hotels	2026-07-24 17:22:34.132489	2
933	nominee	noun	người được đề cử	/ˌnɑːməˈniː/	a person selected	The nominee accepted the award.	Người được đề cử đã nhận giải.	\N	\N	HR	\N	2026-07-24 18:01:26.486905	2
727	adjourn	verb	hoãn	/əˈdʒɜːrn/	to suspend a meeting	The meeting was adjourned until Monday.	Cuộc họp được hoãn đến thứ Hai.	\N	\N	Office	\N	2026-07-24 17:41:11.759836	2
554	typically	adv.	Tiêu biểu, điển hình	/ˈtɪpɪkli/	used to say that something usually happens in the way that you are stating	Office expenses typically include such things as salaries, rent, and office supplies.	Các chi phí văn phòng bao gồm tiêu biểu những thứ như là: tiền lương, tiền thuê và đồ dùng dự trữ văn phòng.	https://audio.tflat.vn/data/cache/images/300x225/t/y/typically1.png	https://audio.tflat.vn/audio/t/y/typically.mp3	Financial Statements	https://tienganhtflat.com/blog/toeic-words-financial-statements	2026-07-24 17:22:34.132489	2
815	hesitate	verb	do dự	/ˈhezɪteɪt/	to pause before acting	Do not hesitate to ask questions.	Đừng ngần ngại đặt câu hỏi.	\N	\N	Communication	\N	2026-07-24 17:44:13.10333	2
844	capture	verb	thu hút	/ˈkæptʃər/	to attract	The advertisement captured attention.	Quảng cáo đã thu hút sự chú ý.	\N	\N	Marketing	\N	2026-07-24 17:59:36.547339	2
399	ideally	adv.	Một cách lý tưởng	/ai'diəli/	perfect; most suitable	The location for the concert would ideally have plenty of parking.	Chỗ địa điểm cho buổi hòa nhạc lý tưởng nên có nhiều chỗ đậu xe.	https://audio.tflat.vn/data/cache/images/300x225/i/d/ideally1.jpg	https://audio.tflat.vn/audio/i/d/ideally.mp3	Events	https://tienganhtflat.com/blog/toeic-words-events	2026-07-24 17:22:34.132489	2
277	matter	n.	Chủ đề, vấn đề, việc, chuyện	/'mætə/	a subject or situation that you must consider or deal with	What's the matter with you?	Có chuyện gì với bạn vậy?	https://audio.tflat.vn/data/cache/images/300x225/m/a/matter3.png	https://audio.tflat.vn/audio/m/a/matter.mp3	Board Meeting & Committees	https://tienganhtflat.com/blog/toeic-words-board-meeting-committees	2026-07-24 17:22:34.132489	2
800	convert	verb	chuyển đổi	/kənˈvɜːrt/	to change into another form	The file was converted to PDF.	Tệp đã được chuyển sang PDF.	\N	\N	Technology	\N	2026-07-24 17:44:13.10333	2
160	adjacent	adj.	Kế bên, liền kề, sát cạnh	/ə'dʤeizənt/	next to or near something	My office is adjacent to the receptionist area on the third floor.	Văn phòng của tôi ở bên cạnh khu vực tiếp tân ở tầng ba.	https://audio.tflat.vn/data/cache/images/300x225/a/d/adjacent2.png	https://audio.tflat.vn/audio/a/d/adjacent.mp3	Property & Departments	https://tienganhtflat.com/blog/toeic-words-property-departments	2026-07-24 17:22:34.132489	2
582	convenient	adj.	Thuận tiện	/kənˈviːniənt/	useful, easy, or quick to do; not causing problems	Living here is so convenient – everything I need is just 5 minutes away.	Sống ở đây thật thuận tiện – mọi thứ mình cần chỉ cách 5 phút.	https://audio.tflat.vn/data/cache/images/300x225/c/o/convenient1.jpg	https://audio.tflat.vn/audio/c/o/convenient.mp3	Pharmacy	https://tienganhtflat.com/blog/toeic-words-pharmacy	2026-07-24 17:22:34.132489	2
917	landmark	noun	cột mốc	/ˈlændmɑːrk/	an important achievement	The agreement was a landmark.	Thỏa thuận là một cột mốc quan trọng.	\N	\N	Business	\N	2026-07-24 18:01:26.486905	2
684	escalate	verb	leo thang	/ˈeskəleɪt/	to become more serious	The issue quickly escalated.	Vấn đề nhanh chóng trở nên nghiêm trọng.	\N	\N	Management	\N	2026-07-24 17:39:02.670694	2
572	disturb	v.	Quấy rầy, làm phiền	/dis'tə:b/	to interrupt somebody when they are trying to work	Let's see how many products we can count in advance of inventory so we disturb fewer customers.	Hãy xem có bao nhiêu sản phẩm chúng ta có thể đếm trước khi kiểm kê để cho chúng ta làm phiền khách hàng ít hơn.	https://audio.tflat.vn/data/cache/images/300x225/d/i/disturb1.png	https://audio.tflat.vn/audio/d/i/disturb.mp3	Inventory	https://tienganhtflat.com/blog/toeic-words-inventory	2026-07-24 17:22:34.132489	2
482	facilitate	v.	Làm cho dễ dàng, làm cho thuận tiện	/fə'siliteit/	to make an action possible or easier	The computer program facilitated the scheduling of appointments.	Chương trình máy tính làm cho việc lập lịch các buổi hẹn được thuận tiện.	https://audio.tflat.vn/data/cache/images/300x225/f/a/facilitate1.png	https://audio.tflat.vn/audio/f/a/facilitate.mp3	Electronics	https://tienganhtflat.com/blog/toeic-words-electronics-3	2026-07-24 17:22:34.132489	2
516	take out	v.	Rút (tiền)	/A/	remove	When can I take money out of bank?	Khi nào tôi có thể rút tiền khỏi ngân hàng	https://audio.tflat.vn/data/cache/images/300x225/t/a/take_out1.jpg	https://audio.tflat.vn/audio/t/a/take_out.mp3	Banking	https://tienganhtflat.com/blog/toeic-words-banking	2026-07-24 17:22:34.132489	2
867	depart	verb	khởi hành	/dɪˈpɑːrt/	to leave	The train departs at 8 a.m.	Tàu khởi hành lúc 8 giờ sáng.	\N	\N	Travel	\N	2026-07-24 17:59:36.547339	2
699	oversee	verb	giám sát	/ˌoʊvərˈsiː/	to supervise	She oversees the project.	Cô ấy giám sát dự án.	\N	\N	Management	\N	2026-07-24 17:39:02.670694	2
710	subscription	noun	đăng ký thuê bao	/səbˈskrɪpʃn/	regular payment for a service	My subscription expires soon.	Gói thuê bao của tôi sắp hết hạn.	\N	\N	Technology	\N	2026-07-24 17:39:02.670694	2
650	benchmark	noun	tiêu chuẩn đánh giá	/ˈbentʃmɑːrk/	a standard for comparison	Sales exceeded the benchmark.	Doanh số vượt tiêu chuẩn.	\N	\N	Business	\N	2026-07-24 17:36:44.573617	2
252	logical	adj.	Có lô-gic, hợp lý	/ˈlɒdʒɪk(ə)l/	seeming natural, reasonable. or sensible	Your argument is not logical at all.	Lập luận của bạn là không hợp lý ở tất cả.	https://audio.tflat.vn/data/cache/images/300x225/l/o/logical2.png	https://audio.tflat.vn/audio/l/o/logical.mp3	Product Development	https://tienganhtflat.com/blog/toeic-words-product-development	2026-07-24 17:22:34.132489	2
826	obtain	verb	đạt được	/əbˈteɪn/	to get	You must obtain approval first.	Bạn phải xin phê duyệt trước.	\N	\N	Business	\N	2026-07-24 17:44:13.10333	2
148	ability	n.	Năng lực, khả năng, tài năng	/ə'biliti/	the fact that somebody / something able to do something	The designer's ability was obvious from her porfolio.	Năng lực của người thiết kế đã rõ ràng từ cặp hồ sơ (thiết kế) của cô ta.	https://audio.tflat.vn/data/cache/images/300x225/a/b/ability1.jpg	https://audio.tflat.vn/audio/a/b/ability.mp3	Apply and Interviewing	https://tienganhtflat.com/blog/toeic-words-apply-and-interviewing	2026-07-24 17:22:34.132489	2
79	maintain	v.	Duy trì	/men'tein/	to make something continue at the same level, standard, etc.	Combining physical activity with a healthy diet is the best way to maintain a healthy body weight.	Kết hợp hoạt động thể chất với chế độ ăn uống lành mạnh là cách tốt nhất để duy trì trọng lượng cơ thể khỏe mạnh.	https://audio.tflat.vn/data/cache/images/300x225/m/a/maintain2.jpg	https://audio.tflat.vn/audio/m/a/maintain.mp3	Ordering Supplies	https://tienganhtflat.com/blog/toeic-words-ordering-supplies	2026-07-24 17:22:34.132489	2
866	dense	adjective	dày đặc	/dens/	closely packed	Traffic was dense this morning.	Giao thông rất đông sáng nay.	\N	\N	Transportation	\N	2026-07-24 17:59:36.547339	2
889	forecasting	noun	dự báo	/ˈfɔːrkæstɪŋ/	the process of predicting	Sales forecasting is important.	Dự báo doanh số rất quan trọng.	\N	\N	Business	\N	2026-07-24 18:01:26.486905	2
295	hospital	n.	Bệnh viện	/ˈhɒspɪt(ə)l/	\N	This hospital is very large.	Bệnh viện này là rất lớn.	https://audio.tflat.vn/data/cache/images/300x225/h/o/hospitals1.jpg	https://audio.tflat.vn/audio/h/o/hospital.mp3	Hospitals	https://tienganhtflat.com/blog/toeic-words-hospitals	2026-07-24 17:22:34.132489	2
549	perspective	n.	Góc nhìn, khía cạnh	/pə'spektiv/	a way of thinking about something	Parents and children usually see things from different perspectives.	Cha mẹ và con cái thường quan sát sự vật, sự việc từ góc nhìn khác nhau.	https://audio.tflat.vn/data/images_example/300x225/p/a/parents_an_ex1_580de47b7f8b9a84688b45c0.jpg	https://audio.tflat.vn/audio/p/e/perspective.mp3	Financial Statements	https://tienganhtflat.com/blog/toeic-words-financial-statements	2026-07-24 17:22:34.132489	2
868	derive	verb	thu được	/dɪˈraɪv/	to obtain	The company derived profits from exports.	Công ty thu lợi nhuận từ xuất khẩu.	\N	\N	Business	\N	2026-07-24 17:59:36.547339	2
533	agreement	n.	Sự đồng ý, thỏa thuận với nhau	/ə'gri:mənt/	an arrangement, a promise or a contract made with somebody	According to the agreement, the caterer will also supply the flowers for the event.	Theo như thỏa thuận, nhà cung cấp lương thực thực phẩm cũng sẽ cung cấp hoa cho sự kiện.	https://audio.tflat.vn/data/cache/images/300x225/a/g/agreement1.png	https://audio.tflat.vn/audio/a/g/agreement.mp3	Contracts	https://tienganhtflat.com/blog/toeic-words-contracts	2026-07-24 17:22:34.132489	2
138	excite	v.	Kích thích, kích động	/ik'sait/	to make someone feel very pleased, interested or enthusiastic	Exotic flavor always excite me.	Những hương vị lạ/ngoại nhập luôn luôn kích thích tôi.	https://audio.tflat.vn/data/cache/images/300x225/e/x/excite1.png	https://audio.tflat.vn/audio/e/x/excite.mp3	Eating Out	https://tienganhtflat.com/blog/toeic-words-eating-out	2026-07-24 17:22:34.132489	2
472	duration	n.	Khoảng thời gian	/djuə'reiʃn/	the length of time that something lasts or continues	Mother lent me her spare jacket for the duration of the trip.	Mẹ đã cho tôi mượn chiếc áo khoác để dành của bà cho suốt thời gian chuyến đi (của tôi).	https://audio.tflat.vn/data/cache/images/300x225/d/u/duration2.jpg	https://audio.tflat.vn/audio/d/u/duration.mp3	Trains	https://tienganhtflat.com/blog/toeic-words-trains	2026-07-24 17:22:34.132489	2
500	notify	v.	Thông báo	/ˈnəʊtɪfaɪ/	to formally or officially tell someone about something	They notified the hotel that they had been delayed in traffic and would be arriving late.	Họ đã thông báo với khách sạn rằng họ đã bị chậm trễ trong giao thông và sẽ đến muộn.	https://audio.tflat.vn/data/cache/images/300x225/n/o/notify1.jpg	https://audio.tflat.vn/audio/n/o/notify.mp3	Hotels	https://tienganhtflat.com/blog/toeic-words-hotels	2026-07-24 17:22:34.132489	2
298	designate	v.	Chỉ rõ, định rõ	/'dezignit/	a person or group of people or vehicles that travels with someone or something in order to protect or guard them	This floor has been designated a no-smoking area.	Tầng này được chỉ định cấm hút thuốc.	https://audio.tflat.vn/data/cache/images/300x225/d/e/designate1.png	https://audio.tflat.vn/audio/d/e/designate.mp3	Hospitals	https://tienganhtflat.com/blog/toeic-words-hospitals	2026-07-24 17:22:34.132489	2
636	logistics	noun	hậu cần	/ləˈdʒɪstɪks/	management of transportation	Logistics costs increased this year.	Chi phí hậu cần tăng trong năm nay.	\N	\N	Logistics	\N	2026-07-24 17:36:44.573617	2
534	assurance	n.	Sự cam đoan, bảo đảm	/ə'ʃuərəns/	a statement that something will certainly be true or will certainly happen	The sales associate gave his assurance that the missing keyboard would be replaced the next day.	Đối tác bán hàng cam đoan rằng ngày mai bàn phím lỗi sẽ được thay.	https://audio.tflat.vn/data/cache/images/300x225/a/s/assurance1.png	https://audio.tflat.vn/audio/a/s/assurance.mp3	Contracts	https://tienganhtflat.com/blog/toeic-words-contracts	2026-07-24 17:22:34.132489	2
768	devise	verb	lập ra	/dɪˈvaɪz/	to invent or plan	They devised a new strategy.	Họ đã lập ra một chiến lược mới.	\N	\N	Business	\N	2026-07-24 17:41:11.759836	2
526	portfolio	n.	Danh mục đầu tư, danh sách vốn đầu tư (của 1 cty, ngân hàng...)	/pɔ:t'fouljou/	the range of products or services offered by a particular company or organization.	Investors are advised to have diverse portfolios.	Nhà đầu tư được khuyên nên có nhiều danh mục đầu tư khác nhau.	https://audio.tflat.vn/data/cache/images/300x225/p/o/portfolio1.png	https://audio.tflat.vn/audio/p/o/portfolio.mp3	Investment	https://tienganhtflat.com/blog/toeic-words-investment	2026-07-24 17:22:34.132489	2
888	fluctuate	verb	dao động	/ˈflʌktʃueɪt/	to rise and fall irregularly	Prices fluctuate every month.	Giá cả dao động mỗi tháng.	\N	\N	Finance	\N	2026-07-24 18:01:26.486905	2
301	mission	n.	Sứ mệnh, nhiệm vụ	/ˈmɪʃən/	an important official job that a person or group of people is given to do	The nurse explained that the mission of everyone in the unit was to make sure the patients got well as soon as possible.	Người y tá đã giải thích rằng nhiệm vụ của mọi người trong khoa là phải đảm bảo rằng các bệnh nhân khỏi bệnh càng sớm càng tốt.	https://audio.tflat.vn/data/images_example/300x225/t/h/the_nurse__ex1_56248d0e7f8b9a000de3d2b1.jpg	https://audio.tflat.vn/audio/m/i/mission.mp3	Hospitals	https://tienganhtflat.com/blog/toeic-words-hospitals	2026-07-24 17:22:34.132489	2
128	disappoint	v.	Làm thất vọng	/,disə'pɔint/	to make someone feel sad because something that they hope for or expect to happen does not happen	Leila was disappointed to discover that no rental cars were available the weekend she wished to travel.	Leila thất vọng khi phát hiện ra rằng không có xe thuê vào dịp cuối tuần mà cô muốn đi du lịch.	https://audio.tflat.vn/data/cache/images/300x225/d/i/disappoint1.png	https://audio.tflat.vn/audio/d/i/disappoint.mp3	Car Rentals	https://tienganhtflat.com/blog/toeic-words-car-rentals	2026-07-24 17:22:34.132489	2
156	follow up	v, n.	(v) theo sau, bám riết	\N	to continue, to take additional steps	Always follow up an interview with a thank-you note	Luôn bám sát một cuộc phỏng vấn với một lá thư cám ơn ngắn.	https://audio.tflat.vn/data/cache/images/300x225/f/o/follow_up3.jpg	https://audio.tflat.vn/audio/f/o/follow_up.mp3	Apply and Interviewing	https://tienganhtflat.com/blog/toeic-words-apply-and-interviewing	2026-07-24 17:22:34.132489	2
691	incur	verb	phát sinh	/ɪnˈkɜːr/	to become subject to	Late payment may incur fees.	Thanh toán trễ có thể phát sinh phí.	\N	\N	Finance	\N	2026-07-24 17:39:02.670694	2
575	run	v.	Chạy, vận hành	/rʌn/	to operate or function	As long as the computer is running, you can keep adding new data.	Trong khi máy tính đang chạy, bạn có thể thực hiện việc bổ sung thêm dữ liệu mới.	https://audio.tflat.vn/data/cache/images/300x225/r/u/run1.png	https://audio.tflat.vn/audio/r/u/run.mp3	Inventory	https://tienganhtflat.com/blog/toeic-words-inventory	2026-07-24 17:22:34.132489	2
415	recruit	n.	Lính mới, nhân viên mới, thành viên mới	/ri'kru:t/	\N	The new recruits spent the entire day in training.	Những nhân viên mới đã dành ra cả ngày để rèn luyện.	https://audio.tflat.vn/data/cache/images/300x225/r/e/recruit1.jpg	https://audio.tflat.vn/audio/r/e/recruit.mp3	Job Ads & Recruitment	https://tienganhtflat.com/blog/toeic-words-job-ads-recruitment	2026-07-24 17:22:34.132489	2
279	priority	n.	Quyền ưu tiên	/praɪˈɒrəti/	something that you think is more important than other things and should be dealt with first	My top priority now is to win a place at the university.	Điều ưu tiên lớn nhất của tôi bây giờ là đỗ đại học.	https://audio.tflat.vn/data/cache/images/300x225/p/r/priority2.png	https://audio.tflat.vn/audio/p/r/priority.mp3	Board Meeting & Committees	https://tienganhtflat.com/blog/toeic-words-board-meeting-committees	2026-07-24 17:22:34.132489	2
637	maintenance	noun	bảo trì	/ˈmeɪntənəns/	keeping equipment in good condition	Regular maintenance is required.	Cần bảo trì định kỳ.	\N	\N	Engineering	\N	2026-07-24 17:36:44.573617	2
751	compile	verb	biên soạn	/kəmˈpaɪl/	to collect information	She compiled the report.	Cô ấy đã biên soạn báo cáo.	\N	\N	Office	\N	2026-07-24 17:41:11.759836	2
383	assess	v.	Đánh giá, ước lượng 	/ə'ses/	to make a judgment about the nature or quality of someone or something	The insurance rate Mr. Victor was assessed went up this year after he admitted that he had started smoking again.	Mức phí bảo hiểm mà ông Victor được định giá tăng lên sau khi ông thú nhận đã bắt đầu hút thuốc trở lại.	https://audio.tflat.vn/data/cache/images/300x225/a/s/assess1.png	https://audio.tflat.vn/audio/a/s/assess.mp3	Doctor's Office	https://tienganhtflat.com/blog/toeic-words-doctor-s-office	2026-07-24 17:22:34.132489	2
22	occupy	v.	Chiếm giữ, ở, cư ngụ	/'ɔkjupai/	to fill or use a space, an area, or an amount of time	Our company has occupied this office for more than five years.	Công ty chúng tôi đã ở văn phòng này hơn 5 năm.	https://audio.tflat.vn/data/cache/images/300x225/o/c/occupy1.jpg	https://audio.tflat.vn/audio/o/c/occupy.mp3	Renting and Leasing	https://tienganhtflat.com/blog/toeic-words-renting-and-leasing	2026-07-24 17:22:34.132489	2
821	indicate	verb	chỉ ra	/ˈɪndɪkeɪt/	to show	The figures indicate growth.	Các số liệu cho thấy sự tăng trưởng.	\N	\N	Business	\N	2026-07-24 17:44:13.10333	2
456	available	adj.	Có sẵn, sẵn sàng	/əˈveɪləbl/	that you can get, buy, or find	This was the only room available.	Đây là căn phòng duy nhất có sẵn.	https://audio.tflat.vn/data/images_example/300x225/t/h/this_was_t_ex1_56248d007f8b9afc0c298119.jpg	https://audio.tflat.vn/audio/a/v/available.mp3	Music	https://tienganhtflat.com/blog/toeic-words-music	2026-07-24 17:22:34.132489	2
703	recipient	noun	người nhận	/rɪˈsɪpiənt/	a person receiving something	The recipient signed the form.	Người nhận đã ký vào biểu mẫu.	\N	\N	Office	\N	2026-07-24 17:39:02.670694	2
260	distraction	n.	‹sự› sao nhãng, lãng trí, rối trí; sự giải trí, trò tiêu khiển	/dis'trækʃn/	a thing that takes your attention away from what you are doing	To provide a distraction from the noise, Luisa's dentist offered her a pair of earphones.	Để tránh khỏi tiếng ồn, nha sĩ của Luisa đã đưa ra cho cô một cặp tai nghe.	https://audio.tflat.vn/data/cache/images/300x225/d/i/distraction.jpg	https://audio.tflat.vn/audio/d/i/distraction.mp3	Dentist's Office	https://tienganhtflat.com/blog/toeic-words-dentist-s-office	2026-07-24 17:22:34.132489	2
318	profitably	adv.	Có lợi, có ích, sinh lãi, sinh lợi	/ˌprɒfɪtəˈbɪləti/	that makes or is likely to make money.	We invested in the stock market profitably.	Công ty đã đầu tư sinh lợi vào thị trường chứng khoán.	https://audio.tflat.vn/data/cache/images/300x225/p/r/profitably1.jpg	https://audio.tflat.vn/audio/p/r/profitably.mp3	Accounting	https://tienganhtflat.com/blog/toeic-words-accounting	2026-07-24 17:22:34.132489	2
186	combine	v.	Kết hợp, phối hợp	/'kɔmbain/	to come together to form a single thing or group	The director combined two previously separate visual techniques.	Đạo diễn đã kết hợp 2 kỹ xảo hình ảnh riêng biệt trước đây lại với nhau.	https://audio.tflat.vn/data/cache/images/300x225/c/o/combine1.png	https://audio.tflat.vn/audio/c/o/combine.mp3	Movies	https://tienganhtflat.com/blog/toeic-words-movies	2026-07-24 17:22:34.132489	2
892	fulfill	verb	hoàn thành	/fʊlˈfɪl/	to complete successfully	We fulfilled all customer orders.	Chúng tôi đã hoàn thành tất cả đơn hàng.	\N	\N	Logistics	\N	2026-07-24 18:01:26.486905	2
431	bargain	n.	Món hời, cơ hội tốt (buôn bán)	/bɑːɡən/	to discuss prices, with somebody in order to reach an agreement that is acceptable	Lois compared the sweaters carefully to determine which was a better bargain.	Lois so sánh cẩn thận những chiếc áo len để xác định cái nào là món hời hơn.	https://audio.tflat.vn/data/cache/images/300x225/b/a/bargain1.jpg	https://audio.tflat.vn/audio/b/a/bargain.mp3	Shopping	https://tienganhtflat.com/blog/toeic-words-shopping	2026-07-24 17:22:34.132489	2
8	retire	v.	Nghỉ hưu	/ri'taiə/	to stop doing your job, especially because you have reached a particular age	She was forced to retire early from teaching because of ill health.	Cô bị buộc phải nghỉ hưu sớm trong việc giảng dạy vì lý do sức khỏe.	https://audio.tflat.vn/data/cache/images/300x225/r/e/retire1.png	https://audio.tflat.vn/audio/r/e/retire.mp3	Salaries & Benefits	https://tienganhtflat.com/blog/toeic-words-salaries-benefits	2026-07-24 17:22:34.132489	2
197	accustom to	v.	Làm cho quen, tập cho quen	/əˈkʌstəm tu:/	to become familiar with	Chefs must accustom themselves to working long hours.	Các đầu bếp phải tự làm quen với việc nấu nướng trong nhiều giờ.	https://audio.tflat.vn/data/cache/images/300x225/a/c/accustom_to1.jpg	https://audio.tflat.vn/audio/a/c/accustom_to.mp3	Cooking As A Career	https://tienganhtflat.com/blog/toeic-words-cooking-as-a-career	2026-07-24 17:22:34.132489	2
253	research	v.	Nghiên cứu	/ri'sə:tʃ/	a careful study of a subject	They're researching into ways of improving people's diet.	Họ đang nghiên cứu về cách cải thiện chế độ ăn uống của người dân.	https://audio.tflat.vn/data/cache/images/300x225/r/e/research2.png	https://audio.tflat.vn/audio/r/e/research.mp3	Product Development	https://tienganhtflat.com/blog/toeic-words-product-development	2026-07-24 17:22:34.132489	2
635	invoice	noun	hóa đơn	/ˈɪnvɔɪs/	a bill for goods or services	Please pay the invoice promptly.	Vui lòng thanh toán hóa đơn đúng hạn.	\N	\N	Finance	\N	2026-07-24 17:36:44.573617	2
161	collaboration	n.	Sự cộng tác, hợp tác	/kə,læbə'reiʃn/	the act of working with another person or group of people to create or produce something.	We believe that it was our collaboration that enabled us to achieve such favorable results.	Chúng ta tin rằng sự hợp tác của chúng ta cho phép đạt được những kết quả có lợi đến thế.	https://audio.tflat.vn/data/cache/images/300x225/c/o/collaboration2.png	https://audio.tflat.vn/audio/c/o/collaboration.mp3	Property & Departments	https://tienganhtflat.com/blog/toeic-words-property-departments	2026-07-24 17:22:34.132489	2
803	decline	verb	giảm sút	/dɪˈklaɪn/	to become less	Sales declined last month.	Doanh số đã giảm vào tháng trước.	\N	\N	Sales	\N	2026-07-24 17:44:13.10333	2
352	extend	v.	Gia hạn, kéo dài (thời hạn...)	/iks'tend/	to make something longer or larger	There are plans to extend the subway line in this city.	Có kế hoạch để mở rộng đường tàu điện ngầm trong thành phố này.	https://audio.tflat.vn/data/cache/images/300x225/e/x/extend1.png	https://audio.tflat.vn/audio/e/x/extend.mp3	Airlines	https://tienganhtflat.com/blog/toeic-words-airlines	2026-07-24 17:22:34.132489	2
511	dividend	n.	Tiền lãi cổ phần, tiền được cuộc, cái bị chia, số bị chia (toán)	/'dividend/	an amount of the profits that a company pays to people who own shares in the company	The dividend was calculated and distributed to the group.	Cổ tức được tính toán và phân bổ theo nhóm.	https://audio.tflat.vn/data/cache/images/300x225/d/i/dividend1.png	https://audio.tflat.vn/audio/d/i/dividend.mp3	Banking	https://tienganhtflat.com/blog/toeic-words-banking	2026-07-24 17:22:34.132489	2
820	improvement	noun	sự cải thiện	/ɪmˈpruːvmənt/	a positive change	Sales showed improvement.	Doanh số đã có sự cải thiện.	\N	\N	Business	\N	2026-07-24 17:44:13.10333	3
86	marketing	n.	Ngành tiếp thị	/ˈmɑːkɪtɪŋ/	\N	She works in sales and marketing.	Cô ấy bán hàng và tiếp thị.	https://audio.tflat.vn/data/cache/images/300x225/m/a/marketing1.jpg	https://audio.tflat.vn/audio/m/a/marketing.mp3	Marketing	https://tienganhtflat.com/blog/toeic-words-marketing	2026-07-24 17:22:34.132489	3
810	expand	verb	mở rộng	/ɪkˈspænd/	to become larger	The business expanded overseas.	Doanh nghiệp đã mở rộng ra nước ngoài.	\N	\N	Business	\N	2026-07-24 17:44:13.10333	3
379	review	n.	Bài đánh giá, lời đánh giá	/rɪˈvjuː/	an examination of something, with the intention of changing it if necessary	The film received generally positive reviews.	Bộ phim nhìn chung đã nhận được nhiều lời đánh giá tích cực.	https://audio.tflat.vn/data/cache/images/300x225/r/e/review1.jpeg	https://audio.tflat.vn/audio/r/e/review.mp3	Theater	https://tienganhtflat.com/blog/toeic-words-theater	2026-07-24 17:22:34.132489	3
700	portfolio	noun	danh mục	/pɔːrtˈfoʊlioʊ/	a collection of investments	His portfolio is diversified.	Danh mục đầu tư của anh ấy rất đa dạng.	\N	\N	Finance	\N	2026-07-24 17:39:02.670694	3
553	translation	n.	Bản dịch, bài dịch	/træns'leiʃn/	the process of changing something that is written or spoken into another language.	The translation of the statement from Japanese into English was very helpful.	Bản dịch báo cáo từ tiếng Nhật sang tiếng Anh là rất có ích.	https://audio.tflat.vn/data/cache/images/300x225/t/r/translation2.png	https://audio.tflat.vn/audio/t/r/translation.mp3	Financial Statements	https://tienganhtflat.com/blog/toeic-words-financial-statements	2026-07-24 17:22:34.132489	3
290	in-depth	adj.	Cẩn thận, tỉ mỉ, chu đáo, chi tiết	/ɪn dɛpθ/	very thorough and detailed	The newspaper gave in-depth coverage of the tragic bombing.	Tờ báo đưa tin chi tiết về vụ ném bom bi thảm.	https://audio.tflat.vn/data/cache/images/300x225/i/n/in-depth.jpg	https://audio.tflat.vn/audio/i/n/in-depth.mp3	Media	https://tienganhtflat.com/blog/toeic-words-media	2026-07-24 17:22:34.132489	3
83	smooth	adj.	Hòa nhã, lễ độ	/smu:ð/	completely flat and even, without any lumps, holes, or rough areas	Her smooth manner won her the appreciation of the manager but not her colleagues.	Thái độ hòa nhã của cô ta đã thu được sự đánh giá cao của giám đốc, nhưng không (thu phục) được đồng nghiệp.	https://audio.tflat.vn/data/cache/images/300x225/s/m/smooth1.jpg	https://audio.tflat.vn/audio/s/m/smooth.mp3	Ordering Supplies	https://tienganhtflat.com/blog/toeic-words-ordering-supplies	2026-07-24 17:22:34.132489	3
133	tempt	v.	Xúi giục, cám dỗ	/tempt/	to attract someone or make someone want to do or have something	I am tempted by the idea of driving across the country instead of flying.	Tôi bị cám dỗ bởi ý tưởng lái xe xuyên qua đất nước thay vì đi máy bay.	https://audio.tflat.vn/data/cache/images/300x225/t/e/tempt1.png	https://audio.tflat.vn/audio/t/e/tempt.mp3	Car Rentals	https://tienganhtflat.com/blog/toeic-words-car-rentals	2026-07-24 17:22:34.132489	3
131	nervously	adj.	Bồn chồn, lo lắng	/ˈnɜːvəsli/	anxious about something or afraid of something	As we approached the city Lonnie started driving nervously, so I volunteered to drive that part of the trip.	Lúc mà chúng tôi đến thành phố thì Lonnie bắt đầu lái xe rất căng thẳng, vì vậy tôi tình nguyện lái đoạn đường đó của cuộc hành trình.	https://audio.tflat.vn/data/cache/images/300x225/n/e/nervously1.png	https://audio.tflat.vn/audio/n/e/nervously.mp3	Car Rentals	https://tienganhtflat.com/blog/toeic-words-car-rentals	2026-07-24 17:22:34.132489	3
541	provision	n.	Dự phòng, điều khoản	/prəˈvɪʒn/	a condition or an arrangement in a legal document	The father made provision for his children through his will.	Người cha đã truyền lại di chúc cho những đứa con của mình.	https://audio.tflat.vn/data/cache/images/300x225/p/r/provision1.png	https://audio.tflat.vn/audio/p/r/provision.mp3	Contracts	https://tienganhtflat.com/blog/toeic-words-contracts	2026-07-24 17:22:34.132489	3
432	bear	v.	Chịu đựng, cam chịu	/beə/	to be able to accept and deal with something unpleasant	Moya doesn't like crowds so she cannot bear shopping during the holiday rush.	Moya không thích đám đông vì thế cô không chịu đi mua sắm trong kỳ đổ xô đi sắm dịp lễ.	https://audio.tflat.vn/data/cache/images/300x225/b/e/bear1.jpg	https://audio.tflat.vn/audio/b/e/bear.mp3	Shopping	https://tienganhtflat.com/blog/toeic-words-shopping	2026-07-24 17:22:34.132489	3
140	forget	v.	Quên	/fərˈɡet/	to be unable to remember something	The waiter forgets bringing the rolls, annoying the customer.	Anh nhân viên phục vụ quên mang các ổ bánh mì, gây bực mình cho người khách.	https://audio.tflat.vn/data/cache/images/300x225/f/o/forget1.png	https://audio.tflat.vn/audio/f/o/forget.mp3	Eating Out	https://tienganhtflat.com/blog/toeic-words-eating-out	2026-07-24 17:22:34.132489	3
107	preparation	n.	‹sự› chuẩn bị, sửa soạn	/,prepə'reiʃn/	the act or process of getting ready for something or making something ready	They are making preparations for war.	Họ đang chuẩn bị cho chiến tranh.	https://audio.tflat.vn/data/cache/images/300x225/p/r/preparation.jpg	https://audio.tflat.vn/audio/p/r/preparation.mp3	Taxes	https://tienganhtflat.com/blog/toeic-words-taxes	2026-07-24 17:22:34.132489	3
170	opt	v.	Chọn, chọn lựa; quyết định	/ɔpt/	to choose, to decide on	The operations manager opted for the less expensive office design.	Trưởng phòng tác nghiệp đã chọn bản thiết kế văn phòng ít tốn kém.	https://audio.tflat.vn/data/cache/images/300x225/o/p/opt1.png	https://audio.tflat.vn/audio/o/p/opt.mp3	Property & Departments	https://tienganhtflat.com/blog/toeic-words-property-departments	2026-07-24 17:22:34.132489	3
602	strong	adj.	Khỏe, mạnh, tốt, bền, kiên cố; đanh thép, kiên quyết; sôi nổi, nhiệt tình...	/strɔɳ/	having a lot of physical power	That boy is very strong.	Cậu bé đó là rất mạnh mẽ.	https://audio.tflat.vn/data/cache/images/300x225/s/t/strong1.jpg	https://audio.tflat.vn/audio/s/t/strong.mp3	Business Planning	https://tienganhtflat.com/blog/toeic-words-business-planning	2026-07-24 17:22:34.132489	3
378	rehearse	v.	Diễn tập	/rɪˈhɜːs/	to practice or make people practice a play, piece of music, etc. in preparation for a public performance	Today, we'll just rehearse the final scene.	Hôm nay, chúng tôi sẽ chỉ tập luyện cảnh cuối cùng.	https://audio.tflat.vn/data/cache/images/300x225/r/e/rehearse1.png	https://audio.tflat.vn/audio/r/e/rehearse.mp3	Theater	https://tienganhtflat.com/blog/toeic-words-theater	2026-07-24 17:22:34.132489	3
673	clarify	verb	làm rõ	/ˈklærəfaɪ/	to make something clear	Please clarify your request.	Vui lòng làm rõ yêu cầu của bạn.	\N	\N	Communication	\N	2026-07-24 17:39:02.670694	3
198	apprentice	n.	Người học việc, người mới vào nghề	/ə'prentis/	young person who works for an employer for a fixed period of time in order to learn the particular skills needed in their job	The cooking school has an apprentice program that places students in restaurants to gain work experience.	Trường dạy nấu ăn có một chương trình học nghề là đưa học viên đến các nhà hàng để lấy kinh nghiệm làm việc.	https://audio.tflat.vn/data/cache/images/300x225/a/p/apprentice1.png	https://audio.tflat.vn/audio/a/p/apprentice.mp3	Cooking As A Career	https://tienganhtflat.com/blog/toeic-words-cooking-as-a-career	2026-07-24 17:22:34.132489	3
328	mention	v.	Nói đến, đề cập đếm, đề xuất	/'menʃn/	an act of refering to somebody / something in speech or writing	You should mention in the letter that we can arrange for mailing the brochures as well as printing them.	Anh nên đề cập trong thư rằng chúng ta có thể thu xếp gửi (thư) tờ bướm cũng như là in ấn chúng.	https://audio.tflat.vn/data/cache/images/300x225/m/e/mention1.jpg	https://audio.tflat.vn/audio/m/e/mention.mp3	Correspondence	https://tienganhtflat.com/blog/toeic-words-correspondence	2026-07-24 17:22:34.132489	3
261	encouragement	n.	Khuyến khích, cổ vũ, niềm động viên	/in'kʌridʤmənt/	the act of encouraging someone to do something	Let me offer you some encouragement about your crooked teeth.	Để tôi sẵn sàng cho anh vài sự động viên về hàm răng lệch lạc của anh.	https://audio.tflat.vn/data/cache/images/300x225/e/n/encouragement2.jpg	https://audio.tflat.vn/audio/e/n/encouragement.mp3	Dentist's Office	https://tienganhtflat.com/blog/toeic-words-dentist-s-office	2026-07-24 17:22:34.132489	3
382	appointment	n.	Cuộc hẹn, sự hẹn gặp	/ə'pɔintmənt/	a formal arrangement to meet or visit someone at a particular time	I've got a dentist appointment at 3 o'clock.	Tôi đã có một cuộc hẹn với nha sĩ lúc 03:00.	https://audio.tflat.vn/data/cache/images/300x225/a/p/appointment2.jpg	https://audio.tflat.vn/audio/a/p/appointment.mp3	Doctor's Office	https://tienganhtflat.com/blog/toeic-words-doctor-s-office	2026-07-24 17:22:34.132489	3
632	headquarters	noun	trụ sở chính	/ˈhedˌkwɔːrtərz/	main office of a company	The headquarters is in Tokyo.	Trụ sở chính ở Tokyo.	\N	\N	Business	\N	2026-07-24 17:36:44.573617	3
97	productive	adj.	Có năng suất, hiệu quả 	/prəˈdʌktɪv/	making goods or growing crops, especially in large quantities	The managers had a very productive meeting and were able to solve many of the problems.	Người trưởng phòng có một cuộc họp rất hiệu quả và đã có thể làm sáng tỏ nhiều vấn đề.	https://audio.tflat.vn/data/cache/images/300x225/p/r/productive1.png	https://audio.tflat.vn/audio/p/r/productive.mp3	Marketing	https://tienganhtflat.com/blog/toeic-words-marketing	2026-07-24 17:22:34.132489	3
909	infrastructure	noun	cơ sở hạ tầng	/ˈɪnfrəstrʌktʃər/	basic facilities	The city improved its infrastructure.	Thành phố đã cải thiện cơ sở hạ tầng.	\N	\N	Construction	\N	2026-07-24 18:01:26.486905	3
540	party	n.	Đảng, phái, nhóm	/'pɑ:ti/	one of the people or groups of people involved in a legal agreemen	The parties agreed to settlement in their contract dispute.	Các bên đã nhất trí đi đến một thỏa thuận trong hợp đồng gây tranh cãi của họ.	https://audio.tflat.vn/data/images_example/300x225/t/h/the_partie_ex1_56248cf37f8b9af80c011dc1.jpg	https://audio.tflat.vn/audio/p/a/party.mp3	Contracts	https://tienganhtflat.com/blog/toeic-words-contracts	2026-07-24 17:22:34.132489	3
778	accompany	verb	đi cùng	/əˈkʌmpəni/	to go with someone	A receipt must accompany the package.	Biên lai phải đi kèm với gói hàng.	\N	\N	Office	\N	2026-07-24 17:44:13.10333	3
182	reinforce	v.	Tăng cường, củng cố	/,ri:in'fɔ:s/	to make a feeling, an idea, etc. stronger	Employees reinforced their learning with practice in the workplace.	Các nhân viên củng cố kiến thức của mình bằng việc thực hành ở nơi làm việc.	https://audio.tflat.vn/data/images_example/300x225/e/m/employees__ex1_56248d157f8b9a040dc65e44.jpg	https://audio.tflat.vn/audio/r/e/reinforce.mp3	Office Procedures	https://tienganhtflat.com/blog/toeic-words-office-procedures	2026-07-24 17:22:34.132489	3
874	economical	adjective	tiết kiệm	/ˌiːkəˈnɑːmɪkl/	cost-effective	This printer is economical.	Máy in này rất tiết kiệm.	\N	\N	Office	\N	2026-07-24 17:59:36.547339	3
341	multiple	adj.	Nhiều, bội số	/'mʌltipl/	many in number; involving many different people or things	a house in multiple ownership/occupancy (= owned/occupied by several different people or families)	căn nhà thuộc nhiều người sở hữu	https://audio.tflat.vn/data/cache/images/300x225/m/u/multiple1.png	https://audio.tflat.vn/audio/m/u/multiple.mp3	Ordering Lunch	https://tienganhtflat.com/blog/toeic-words-ordering-lunch	2026-07-24 17:22:34.132489	3
535	cancellation	n.	Sự bãi bỏ, hủy bỏ	/,kænse'leiʃn/	a decision to stop something that has already been arranged from happening	The cancellation of her flight caused her problems for the rest of the week.	Việc hủy chuyến bay đã gây cho cô ấy nhiều vấn đề trong những ngày còn lại của tuần.	https://audio.tflat.vn/data/cache/images/300x225/c/a/cancellation.jpg	https://audio.tflat.vn/audio/c/a/cancellation.mp3	Contracts	https://tienganhtflat.com/blog/toeic-words-contracts	2026-07-24 17:22:34.132489	3
289	impact	n.	Sự tác động mạnh, ảnh hưởng mạnh	/ˈɪmpakt/	the powerful effect that something has on someone or something	The story of the presidential scandal had a huge impact on the public.	Bài báo về vụ bê bối của tổng thống đã có tác động to lớn đến công chúng.	https://audio.tflat.vn/data/cache/images/300x225/i/m/impact1.png	https://audio.tflat.vn/audio/i/m/impact.mp3	Media	https://tienganhtflat.com/blog/toeic-words-media	2026-07-24 17:22:34.132489	3
18	get out of	v.	Thôi, mất, bỏ, từ bỏ, rời bỏ, tránh né, thoát khỏi	/ɡɛt aʊt ɒv/	to exit, escape	The company wanted to get out of the area before property values declined even further.	Công ty muốn từ bỏ khu vực trước khi giá trị tài sản suy sụp thậm chí còn nhiều hơn nữa.	https://audio.tflat.vn/data/cache/images/300x225/g/e/get_out_of1.jpg	https://audio.tflat.vn/audio/g/e/get_out_of.mp3	Renting and Leasing	https://tienganhtflat.com/blog/toeic-words-renting-and-leasing	2026-07-24 17:22:34.132489	3
626	customize	verb	tùy chỉnh	/ˈkʌstəmaɪz/	to modify for specific needs	Customers can customize the product.	Khách hàng có thể tùy chỉnh sản phẩm.	\N	\N	Technology	\N	2026-07-24 17:36:44.573617	3
293	subscribe	v.	Đặt mua một cái gì đó định kỳ, đăng ký	/səbˈskraɪb/	to pay an amount of money regularly in order to receive or use something	We subscribe to several sports channels (= on TV).	Chúng tôi đăng ký vào một số kênh thể thao (trên TV).	https://audio.tflat.vn/data/cache/images/300x225/s/u/subscribe1.jpg	https://audio.tflat.vn/audio/s/u/subscribe.mp3	Media	https://tienganhtflat.com/blog/toeic-words-media	2026-07-24 17:22:34.132489	3
742	bankrupt	adjective	phá sản	/ˈbæŋkrʌpt/	unable to pay debts	The company went bankrupt.	Công ty đã phá sản.	\N	\N	Finance	\N	2026-07-24 17:41:11.759836	3
618	certificate	noun	chứng chỉ	/sərˈtɪfɪkət/	an official document proving something	She received a training certificate.	Cô ấy nhận được chứng chỉ đào tạo.	\N	\N	Education	\N	2026-07-24 17:36:44.573617	3
478	relatively	adv.	Tương đối	/'relətivli/	to a fairly large degree	The train is relatively empty for this time of day.	Đoàn tàu hơi vắng khách vào lúc này trong ngày.	https://audio.tflat.vn/data/images_example/300x225/t/h/the_train__ex1_56248d167f8b9a040dc661a8.jpg	https://audio.tflat.vn/audio/r/e/relatively.mp3	Trains	https://tienganhtflat.com/blog/toeic-words-trains	2026-07-24 17:22:34.132489	3
154	constantly	adj.	Luôn luôn, liên tục, liên miên	/'kɔnstəntli/	all the time; repeatedly	The company is constantly looking for highly trained employees.	Công ty không ngừng tìm kiếm những nhân viên được đào tạo tốt.	https://audio.tflat.vn/data/cache/images/300x225/c/o/constantly1.jpg	https://audio.tflat.vn/audio/c/o/constantly.mp3	Apply and Interviewing	https://tienganhtflat.com/blog/toeic-words-apply-and-interviewing	2026-07-24 17:22:34.132489	3
29	garment	n.	Quần áo	/'gɑ:mənt/	a piece of clothing	Portland garment factory was established in 2008.	Nhà máy may ở Portland (tiểu bang của Mỹ) đã được thành lập năm 2008.	https://audio.tflat.vn/data/cache/images/300x225/g/a/garment2.png	https://audio.tflat.vn/audio/g/a/garment.mp3	Quality Control	https://tienganhtflat.com/blog/toeic-words-quality-control	2026-07-24 17:22:34.132489	3
538	establish	v.	Thành lập, thiết lập	/is'tæbliʃ/	to start or create an organization, a system	This company was established in 2010.	Công ty này được thành lập vào năm 2010.	https://audio.tflat.vn/data/cache/images/300x225/e/s/establish1.png	https://audio.tflat.vn/audio/e/s/establish.mp3	Contracts	https://tienganhtflat.com/blog/toeic-words-contracts	2026-07-24 17:22:34.132489	3
364	on hand	adj.	Có thể dùng được, có sẵn	/ɒn hænd/	available	Do you have any aspirin on hand?	Bạn có sẵn viên thuốc aspirin nào không vậy?	https://audio.tflat.vn/data/images_example/300x225/d/o/do_you_hav_ex1_580ecade7f8b9ae3898b4589.jpg	https://audio.tflat.vn/audio/o/n/on_hand.mp3	Shipping	https://tienganhtflat.com/blog/toeic-words-shipping	2026-07-24 17:22:34.132489	3
757	consult	verb	tham khảo	/kənˈsʌlt/	to seek advice	Consult your supervisor first.	Hãy tham khảo ý kiến cấp trên trước.	\N	\N	Office	\N	2026-07-24 17:41:11.759836	3
883	expense	noun	chi phí	/ɪkˈspens/	money spent	Travel expenses will be reimbursed.	Chi phí đi lại sẽ được hoàn trả.	\N	\N	Finance	\N	2026-07-24 17:59:36.547339	3
501	preclude	v.	Ngăn ngừa, loại trừ	/pri'klu:d/	to prevent something from happening or someone from doing something; to make something impossible	The horrible rainstorm precluded us from traveling any further.	Cơn mưa giông kinh khủng đã ngăn chúng tôi du hành thêm nữa.	https://audio.tflat.vn/data/cache/images/300x225/p/r/preclude2.jpg	https://audio.tflat.vn/audio/p/r/preclude.mp3	Hotels	https://tienganhtflat.com/blog/toeic-words-hotels	2026-07-24 17:22:34.132489	3
651	briefing	noun	buổi phổ biến	/ˈbriːfɪŋ/	a meeting for information	Attend the morning briefing.	Hãy tham dự buổi phổ biến buổi sáng.	\N	\N	Office	\N	2026-07-24 17:36:44.573617	3
47	regardless	adv.	Không quan tâm, bất chấp	/ri'gɑ:dlis/	paying no attention, even if the situation is bad or there are difficulties	Regardless of the cost, we all need health insurance.	Bất chấp phí tổn, tất cả chúng tôi đều cần bảo hiểm y tế.	https://audio.tflat.vn/data/cache/images/300x225/r/e/regardless1.png	https://audio.tflat.vn/audio/r/e/regardless.mp3	Health	https://tienganhtflat.com/blog/toeic-words-health	2026-07-24 17:22:34.132489	3
408	bring together	v.	Gom lại, nhóm lại, họp lại	/brɪŋ təˈɡɛðə/	to join, to gather	Our goal this year is to bring together the most creative group we can find.	Mục tiêu của chúng tôi trong năm nay họp thành một sáng tạo nhất.	https://audio.tflat.vn/data/cache/images/300x225/b/r/bring_together.png	https://audio.tflat.vn/audio/b/r/bring_together.mp3	Job Ads & Recruitment	https://tienganhtflat.com/blog/toeic-words-job-ads-recruitment	2026-07-24 17:22:34.132489	3
201	incorporate	v.	Kết hợp chặt chẽ; hợp thành tổ chức/đoàn thể	/in'kɔ:pərit/	to include something so that it forms a part of something	Here are the fresh greens for you to incorporate into a salad.	Đây là rau tươi cho anh để kết hợp thành một món salad (rau trộn).	https://audio.tflat.vn/data/cache/images/300x225/i/n/incorporate2.png	https://audio.tflat.vn/audio/i/n/incorporate.mp3	Cooking As A Career	https://tienganhtflat.com/blog/toeic-words-cooking-as-a-career	2026-07-24 17:22:34.132489	3
268	regularly	adv.	Thường xuyên	/ˈreɡjələli/	at regular intervals or times	Doing physical exercise regularly will make you healthy.	Tập thể dục thường xuyên sẽ làm cho bạn khỏe mạnh.	https://audio.tflat.vn/data/cache/images/300x225/r/e/regularly1.png	https://audio.tflat.vn/audio/r/e/regularly.mp3	Dentist's Office	https://tienganhtflat.com/blog/toeic-words-dentist-s-office	2026-07-24 17:22:34.132489	3
743	barrier	noun	rào cản	/ˈbæriər/	something preventing progress	Language is a barrier.	Ngôn ngữ là một rào cản.	\N	\N	Business	\N	2026-07-24 17:41:11.759836	3
694	liability	noun	khoản nợ	/ˌlaɪəˈbɪləti/	legal responsibility or debt	The liability increased this year.	Khoản nợ tăng trong năm nay.	\N	\N	Accounting	\N	2026-07-24 17:39:02.670694	3
817	identify	verb	xác định	/aɪˈdentɪfaɪ/	to recognize	We identified the problem.	Chúng tôi đã xác định vấn đề.	\N	\N	Management	\N	2026-07-24 17:44:13.10333	3
827	participate	verb	tham gia	/pɑːrˈtɪsɪpeɪt/	to take part	Many employees participated.	Nhiều nhân viên đã tham gia.	\N	\N	Office	\N	2026-07-24 17:44:13.10333	3
157	hesitant	adj.	Do dự, lưỡng lự, ngập ngừng	/'hezitənt/	slow to speak or act because you feel uncertain	Marla was hesitant about negotiating a higher salary.	Marla lưỡng lự về việc thương lượng một mức lương cao hơn.	https://audio.tflat.vn/data/cache/images/300x225/h/e/hesitant1.png	https://audio.tflat.vn/audio/h/e/hesitant.mp3	Apply and Interviewing	https://tienganhtflat.com/blog/toeic-words-apply-and-interviewing	2026-07-24 17:22:34.132489	3
470	deluxe	adj.	Sang trọng, chất lượng cao	/di'luks ; di'lʌks/	luxurious	My parents decided to splurge on deluxe accommodations for their trip.	Cha mẹ tôi đã quyết định tiêu tiền thoải mái vào tiện nghi xa hoa cho chuyến đi của họ.	https://audio.tflat.vn/data/cache/images/300x225/d/e/deluxe1.jpg	https://audio.tflat.vn/audio/d/e/deluxe.mp3	Trains	https://tienganhtflat.com/blog/toeic-words-trains	2026-07-24 17:22:34.132489	3
601	strategy	n.	Chiến lược, sự vạch kế hoạch hành động	/ˈstrætədʒi/	a plan that is intended to achieve a particular purpose	A business plan is a strategy for running a business and avoiding problems.	Một kế hoạch kinh doanh là một chiến lược để vận hành công việc và tránh các rắc rối.	https://audio.tflat.vn/data/cache/images/300x225/s/t/strategy1.jpg	https://audio.tflat.vn/audio/s/t/strategy.mp3	Business Planning	https://tienganhtflat.com/blog/toeic-words-business-planning	2026-07-24 17:22:34.132489	3
590	sense	n.	Giác quan, tri giác, cảm giác	/sens/	a feeling about something important	How many senses do you have?	Bạn có bao nhiêu giác quan?	https://audio.tflat.vn/data/cache/images/300x225/s/e/sense1.png	https://audio.tflat.vn/audio/s/e/sense.mp3	Pharmacy	https://tienganhtflat.com/blog/toeic-words-pharmacy	2026-07-24 17:22:34.132489	3
384	diagnose	v.	Chuẩn đoán	/´daiəg¸nouz/	to say exactly what an illness or the cause of a problem is	After considering the patient's symptoms and looking at his test results, the doctor diagnosed the lump as benign.	Sau khi cân nhắc các triệu chứng của bệnh nhân và xem kết quả xét nghiệm của anh ta, vị bác sĩ đã chẩn đoán khối u là u lành.	https://audio.tflat.vn/data/cache/images/300x225/d/i/diagnose1.png	https://audio.tflat.vn/audio/d/i/diagnose.mp3	Doctor's Office	https://tienganhtflat.com/blog/toeic-words-doctor-s-office	2026-07-24 17:22:34.132489	3
696	milestone	noun	cột mốc	/ˈmaɪlstoʊn/	an important stage	We reached an important milestone.	Chúng tôi đã đạt một cột mốc quan trọng.	\N	\N	Project	\N	2026-07-24 17:39:02.670694	3
556	appeal	n.	Sức hấp dẫn, lôi cuốn	/əˈpiːl/	the ability to attract	A restaurant with good food and reasonable prices has a lot of appeal.	Một nhà hàng có thức ăn ngon và giá cả phải chăng có sức hút rất mạnh.	https://audio.tflat.vn/data/images_example/300x225/a/_/a_restaura_ex1_56248d127f8b9a020d261a00.jpg	https://audio.tflat.vn/audio/a/p/appeal.mp3	Selecting A Restaurant	https://tienganhtflat.com/blog/toeic-words-selecting-a-restaurant	2026-07-24 17:22:34.132489	3
545	detail	v.	Chi tiết, tỉ mỉ	/'di:teil/	to give a list of facts or all the available information	Give me more details of the plan.	Hãy cho tôi biết thêm chi tiết của kế hoạch.	https://audio.tflat.vn/data/cache/images/300x225/d/e/detail2.png	https://audio.tflat.vn/audio/d/e/detail.mp3	Financial Statements	https://tienganhtflat.com/blog/toeic-words-financial-statements	2026-07-24 17:22:34.132489	3
213	display	v.	Hiển thị, trình bày 	/dis'plei/	to put something in a place where people can see it easily	The accounting program displays a current balance when opened.	Chương trình kế toán hiển thị một con số cân bằng thu chi khi mở (chương trình đó) ra.	https://audio.tflat.vn/data/cache/images/300x225/d/i/display1.jpg	https://audio.tflat.vn/audio/d/i/display.mp3	Computers and the Internet	https://tienganhtflat.com/blog/toeic-words-computers-and-the-internet	2026-07-24 17:22:34.132489	3
598	offer	n.	Đề xuất, đề nghị, chào mời, chào hàng	/'ɔfə/	to say that you are willing to do something for somebody	Devon accepted our offer to write the business plan.	Devon đã chuấp thuận đề nghị của chúng tôi để viết một bản kế hoạch kinh doanh.	https://audio.tflat.vn/data/cache/images/300x225/o/f/offer1.png	https://audio.tflat.vn/audio/o/f/offer.mp3	Business Planning	https://tienganhtflat.com/blog/toeic-words-business-planning	2026-07-24 17:22:34.132489	3
499	housekeeper	n.	Quản gia; người coi nhà, người giữ nhà	/'haus,ki:pə/	a person, usually a woman, whose job is to manage the shopping, cooking, cleaning, etc. in a house or an institution	Eloise's first job at the hotel was as a housekeeper and now she is the manager.	Công việc đầu tiên của Eloise ở khách sạn là người trực buồng và bây giờ cô đã là người quản lý.	https://audio.tflat.vn/data/cache/images/300x225/h/o/housekeeper.jpg	https://audio.tflat.vn/audio/h/o/housekeeper.mp3	Hotels	https://tienganhtflat.com/blog/toeic-words-hotels	2026-07-24 17:22:34.132489	3
119	respond	v.	Hồi âm, phúc đáp	/rɪˈspɒnd/	to give a spoken or written answer to someone or something	How did they respond to the news?	Họ phản ứng lại với tin tức đó như thế nào?	https://audio.tflat.vn/data/cache/images/300x225/r/e/respond1.jpg	https://audio.tflat.vn/audio/r/e/respond.mp3	Museums	https://tienganhtflat.com/blog/toeic-words-museums	2026-07-24 17:22:34.132489	3
62	conduct	v.	Tiến hành, cư xử	/'kɔndəkt/	to organize and / or do a particular activity	Interviews were conducted over a period of three weeks.	Các cuộc phỏng vấn được tổ chức trong suốt giai đoạn kéo dài 3 tuần.	https://audio.tflat.vn/data/cache/images/300x225/c/o/conduct1.jpg	https://audio.tflat.vn/audio/c/o/conduct.mp3	Hiring and Training	https://tienganhtflat.com/blog/toeic-words-hiring-and-training	2026-07-24 17:22:34.132489	3
473	entitle	v.	Cho phép làm cái gì	/ɪnˈtaɪt(ə)l/	to give someone the right to have or to do something	During the holiday rush, a train ticket entitled the passenger to a ride, but not necessarily a seat.	Trong suốt mùa cao điểm nghỉ lễ, vé xe lửa cho phép hành khách lên tàu tàu, nhưng không nhất thiết có một chỗ ngồi.	https://audio.tflat.vn/data/images_example/300x225/d/u/during_the_ex1_56248d007f8b9afc0c2980c9.jpg	https://audio.tflat.vn/audio/e/n/entitle.mp3	Trains	https://tienganhtflat.com/blog/toeic-words-trains	2026-07-24 17:22:34.132489	3
439	mandatory	adj.	(thuộc) lệnh, bắt buộc	/'mændətəri/	required by law	The jewelry store has a mandatory policy of showing customers only one item at a time.	Cửa hàng nữ trang có một chính sách bắt buộc là chỉ cho khách xem mỗi lúc một món đồ.	https://audio.tflat.vn/data/images_example/300x225/t/h/the_jewelr_ex1_56248d157f8b9a040dc65f0c.jpg	https://audio.tflat.vn/audio/m/a/mandatory.mp3	Shopping	https://tienganhtflat.com/blog/toeic-words-shopping	2026-07-24 17:22:34.132489	3
748	coincide	verb	trùng hợp	/ˌkoʊɪnˈsaɪd/	to happen at the same time	The events coincided perfectly.	Các sự kiện diễn ra cùng lúc.	\N	\N	Business	\N	2026-07-24 17:41:11.759836	3
374	element	n.	Yếu tố	/'elimənt/	a necessary or typical part of something	The audience is an essential element of live theater.	Khán giả là một yếu tố thiết yếu của nhà hát sống (nhà hát trực tiếp).	https://audio.tflat.vn/data/images_example/300x225/_/t/_the_audie_ex1_56248d167f8b9a040dc66204.jpg	https://audio.tflat.vn/audio/e/l/element.mp3	Theater	https://tienganhtflat.com/blog/toeic-words-theater	2026-07-24 17:22:34.132489	3
566	subjective	adj.	Chủ quan	/səb'dʤektiv/	based on your own ideas or opinions rather than facts, and therefore sometimes unfair	The reviews in this guidebook are highly subjective, but fun to read.	Những bài đánh giá trong sách hướng dẫn này rất là chủ quan, nhưng đọc cũng vui.	https://audio.tflat.vn/data/cache/images/300x225/s/u/subjective1.jpg	https://audio.tflat.vn/audio/s/u/subjective.mp3	Selecting A Restaurant	https://tienganhtflat.com/blog/toeic-words-selecting-a-restaurant	2026-07-24 17:22:34.132489	3
544	desire	v.	Thèm muốn, khao khát, ao ước	/di'zaiə/	strongly wish for or want something	We desire to have our own home.	Chúng tôi ao ước có ngôi nhà riêng.	https://audio.tflat.vn/data/cache/images/300x225/d/e/desire1.png	https://audio.tflat.vn/audio/d/e/desire.mp3	Financial Statements	https://tienganhtflat.com/blog/toeic-words-financial-statements	2026-07-24 17:22:34.132489	3
464	reason	n.	Lý do	/'ri:zn/	a cause or an explanation for something that has happened	Give me one good reason why I should help you.	Cho tôi một lí do tại sao tôi nên giúp bạn.	https://audio.tflat.vn/data/cache/images/300x225/r/e/reason1.jpg	https://audio.tflat.vn/audio/r/e/reason.mp3	Music	https://tienganhtflat.com/blog/toeic-words-music	2026-07-24 17:22:34.132489	3
342	narrow	v.	Thu hẹp, co lại	/'nærou/	to become or make something narrower	This restaurant delivers only pizza and sandwiches, so that certainly narrows down the choices.	Nhà hàng này chỉ giao hàng pizza và sandwich, hẳn nhiên là đã làm thu hẹp các chọn lựa.	https://audio.tflat.vn/data/cache/images/300x225/n/a/narrow1.png	https://audio.tflat.vn/audio/n/a/narrow.mp3	Ordering Lunch	https://tienganhtflat.com/blog/toeic-words-ordering-lunch	2026-07-24 17:22:34.132489	3
104	joint	adj.	Chung, cùng	/dʒɔint/	involving two or more people together	They were joint owners of the house (= they owned it together).	Họ là chủ sở hữu chung của ngôi nhà (= họ sở hữu nó với nhau).	https://audio.tflat.vn/data/cache/images/300x225/j/o/joint1.png	https://audio.tflat.vn/audio/j/o/joint.mp3	Taxes	https://tienganhtflat.com/blog/toeic-words-taxes	2026-07-24 17:22:34.132489	3
58	recur	v.	Tái diễn, lặp đi lặp lại	/ri'kə:/	to happen again	The managers did not want that particular error to recur.	Các trưởng phòng không muốn những lỗi cá biệt đó lại tái diễn.	https://audio.tflat.vn/data/cache/images/300x225/r/e/recur2.jpg	https://audio.tflat.vn/audio/r/e/recur.mp3	Office Technology	https://tienganhtflat.com/blog/toeic-words-office-technology	2026-07-24 17:22:34.132489	3
697	nominate	verb	đề cử	/ˈnɑːmɪneɪt/	to officially suggest	She was nominated for the award.	Cô ấy được đề cử giải thưởng.	\N	\N	Office	\N	2026-07-24 17:39:02.670694	3
370	approach	v.	Tiếp cận, tiến lại gần	/əˈproʊtʃ/	to come near to someone or something in distance or time	If you look out of the window, you will see the sun approaching.	Nếu bạn nhìn ra cửa sổ, bạn sẽ thấy mặt trời đang tiến lại gần.	https://audio.tflat.vn/data/cache/images/300x225/a/p/approach1.png	https://audio.tflat.vn/audio/a/p/approach.mp3	Theater	https://tienganhtflat.com/blog/toeic-words-theater	2026-07-24 17:22:34.132489	3
764	deficit	noun	thâm hụt	/ˈdefɪsɪt/	an amount lacking	The budget showed a deficit.	Ngân sách bị thâm hụt.	\N	\N	Finance	\N	2026-07-24 17:41:11.759836	3
76	essentially	adv.	Về cơ bản	/ɪˈsenʃəli/	when you think about the true, important, or basic nature of someone or something	He was, essentially, a teacher, not a manager.	Về cơ bản thì anh ấy như là 1 giáo viên chứ không phải người quản lý.	https://audio.tflat.vn/data/cache/images/300x225/e/s/essentially1.jpg	https://audio.tflat.vn/audio/e/s/essentially.mp3	Ordering Supplies	https://tienganhtflat.com/blog/toeic-words-ordering-supplies	2026-07-24 17:22:34.132489	3
829	postpone	verb	hoãn	/poʊstˈpoʊn/	to delay until later	The event was postponed.	Sự kiện đã được hoãn lại.	\N	\N	Office	\N	2026-07-24 17:44:13.10333	3
825	motivate	verb	tạo động lực	/ˈmoʊtɪveɪt/	to encourage	Bonuses motivate employees.	Tiền thưởng tạo động lực cho nhân viên.	\N	\N	Human Resources	\N	2026-07-24 17:44:13.10333	3
162	concentrate	v.	Tập trung	/'kɔnsentreit/	to give all your attention to something and not think about anything else	I can’t concentrate because it’s very noisy.	Tớ không thể tập trung được vì quá ồn.	https://audio.tflat.vn/data/cache/images/300x225/c/o/concentrate2.png	https://audio.tflat.vn/audio/c/o/concentrate.mp3	Property & Departments	https://tienganhtflat.com/blog/toeic-words-property-departments	2026-07-24 17:22:34.132489	3
688	grant	verb	cấp	/ɡrænt/	to officially give	The bank granted the loan.	Ngân hàng đã cấp khoản vay.	\N	\N	Finance	\N	2026-07-24 17:39:02.670694	3
873	duration	noun	khoảng thời gian	/duˈreɪʃn/	length of time	The course duration is six weeks.	Khóa học kéo dài sáu tuần.	\N	\N	Education	\N	2026-07-24 17:59:36.547339	3
102	fill out	v.	Hoàn tất, hoàn thành; điền vào (cho đầy đủ)	/A/	to complete	I usually ask someone to help me fill out my tax form.	Tôi thường đề nghị ai đó giúp tôi điền vào các biểu mẫu thuế cho tôi.	https://audio.tflat.vn/data/cache/images/300x225/f/i/fill_out1.jpg	https://audio.tflat.vn/audio/f/i/fill_out.mp3	Taxes	https://tienganhtflat.com/blog/toeic-words-taxes	2026-07-24 17:22:34.132489	3
622	consent	noun	sự đồng ý	/kənˈsent/	permission or agreement	We need your written consent.	Chúng tôi cần sự đồng ý bằng văn bản của bạn.	\N	\N	Legal	\N	2026-07-24 17:36:44.573617	3
255	solve	v.	Giải quyết, tìm giải pháp	/sɔlv/	to find a way of dealing with a problem or difficult situation	You can't solve anything by just running away.	Cậu không thể giải quyết vấn đề bằng cách bỏ chạy được.	https://audio.tflat.vn/data/cache/images/300x225/s/o/solve2.png	https://audio.tflat.vn/audio/s/o/solve.mp3	Product Development	https://tienganhtflat.com/blog/toeic-words-product-development	2026-07-24 17:22:34.132489	3
682	downsize	verb	cắt giảm nhân sự	/ˈdaʊnsaɪz/	to reduce workforce	The company downsized last year.	Công ty đã cắt giảm nhân sự năm ngoái.	\N	\N	Human Resources	\N	2026-07-24 17:39:02.670694	3
125	coincide	v.	Trùng hợp	/,kouin'said/	to take place at the same time	My cousin's wedding coincided with a holiday weekend, so it was a perfect time to rent a car and go for a drive.	Đám cưới của người anh/em bà con của tôi trùng với kỳ nghỉ lễ cuối tuần, vậy nó là một dịp lý tưởng để thuê ô-tô và đi chơi bằng xe.	https://audio.tflat.vn/data/cache/images/300x225/c/o/coincide1.png	https://audio.tflat.vn/audio/c/o/coincide.mp3	Car Rentals	https://tienganhtflat.com/blog/toeic-words-car-rentals	2026-07-24 17:22:34.132489	3
923	liaison	noun	liên lạc	/liˈeɪzɑːn/	communication between groups	She acts as a liaison.	Cô ấy đóng vai trò là người liên lạc.	\N	\N	Communication	\N	2026-07-24 18:01:26.486905	3
522	conservative	adj.	Bảo thủ	/kən'sə:vətiv/	opposed to great or sudden social change; showing that you prefer traditional styles and values.	My brother is the most conservative person in my family. He always thinks that his idea is right.	Em trai của tôi là người bảo thủ nhất trong gia đình. Em ấy lúc nào cũng nghĩ rằng quan điểm của em ấy là đúng.	https://audio.tflat.vn/data/cache/images/300x225/c/o/conservative1.png	https://audio.tflat.vn/audio/c/o/conservative.mp3	Investment	https://tienganhtflat.com/blog/toeic-words-investment	2026-07-24 17:22:34.132489	3
796	concentrate	verb	tập trung	/ˈkɑːnsntreɪt/	to focus attention	Please concentrate on your work.	Hãy tập trung vào công việc.	\N	\N	Office	\N	2026-07-24 17:44:13.10333	3
875	eligible	adjective	đủ điều kiện	/ˈelɪdʒəbl/	qualified	Only members are eligible.	Chỉ thành viên mới đủ điều kiện.	\N	\N	HR	\N	2026-07-24 17:59:36.547339	3
882	exhibit	verb	trưng bày	/ɪɡˈzɪbɪt/	to display	The company exhibited new technology.	Công ty đã trưng bày công nghệ mới.	\N	\N	Exhibition	\N	2026-07-24 17:59:36.547339	3
147	remind	v.	Nhắc nhở	/rɪˈmaɪnd/	to help someone remember something	He is so hard-working that he has never been reminded of homework.	Anh ấy chăm chỉ đến nỗi anh ấy không bao giờ bị nhắc nhở về việc làm bài tập về nhà.	https://audio.tflat.vn/data/cache/images/300x225/r/e/remind1.jpg	https://audio.tflat.vn/audio/r/e/remind.mp3	Eating Out	https://tienganhtflat.com/blog/toeic-words-eating-out	2026-07-24 17:22:34.132489	3
229	overcrowded	adj.	Chật ních, đông nghịt	/əʊvəˈkraʊdɪd/	with too many people or things	Too many poor people are living in overcrowded conditions.	Có quá nhiều người nghèo đang sống trong điều kiện chật chội.	https://audio.tflat.vn/data/cache/images/300x225/o/v/overcrowded1.jpg	https://audio.tflat.vn/audio/o/v/overcrowded.mp3	Conference	https://tienganhtflat.com/blog/toeic-words-conference	2026-07-24 17:22:34.132489	3
269	restore	v.	Hồi phục, khôi phục lại	/ris´tɔ:/	to bring back a situation or feeling that existed before	The cleaning restored the whiteness of my teeth.	Việc làm sạch răng đã phục hồi độ trắng của hàm răng tôi.	https://audio.tflat.vn/data/cache/images/300x225/r/e/restore1.png	https://audio.tflat.vn/audio/r/e/restore.mp3	Dentist's Office	https://tienganhtflat.com/blog/toeic-words-dentist-s-office	2026-07-24 17:22:34.132489	3
296	admit	v.	Thừa nhận, cho vào	/ədˈmɪt/	to permit to enter	She admits being strict with her children.	Cô ấy thừa nhận đã nghiêm khắc với con cái.	https://audio.tflat.vn/data/images_example/300x225/s/h/she_admits_ex1_56248d117f8b9a020d261804.jpg	https://audio.tflat.vn/audio/a/d/admit.mp3	Hospitals	https://tienganhtflat.com/blog/toeic-words-hospitals	2026-07-24 17:22:34.132489	3
33	take back	v.	Lấy lại, mang trở lại	/teɪk bæk/	to return something	The quality inspector took the shoddy work back to the assembly line to confront the workers.	Thanh tra chất lượng đem sản phẩm xấu trở lại dây chuyền lắp ráp để đối chất với công nhân.	https://audio.tflat.vn/data/cache/images/300x225/t/a/take_back1.png	https://audio.tflat.vn/audio/t/a/take_back.mp3	Quality Control	https://tienganhtflat.com/blog/toeic-words-quality-control	2026-07-24 17:22:34.132489	3
715	withdrawal	noun	rút tiền	/wɪðˈdrɔːəl/	taking money from an account	ATM withdrawals are limited.	Việc rút tiền ATM bị giới hạn.	\N	\N	Banking	\N	2026-07-24 17:39:02.670694	3
904	impose	verb	áp đặt	/ɪmˈpoʊz/	to force officially	The government imposed new regulations.	Chính phủ đã áp đặt quy định mới.	\N	\N	Legal	\N	2026-07-24 18:01:26.486905	3
74	diversify	v.	Đa dạng hóa, thay đổi	/dai'və:sifai/	to develop a wider range of products, interests, skills	The consultant that we hired recommends that we don't diversify at this time.	Nhà tư vấn mà chúng tôi thuê khuyên rằng chúng tôi không được thay đổi vào lúc này.	https://audio.tflat.vn/data/cache/images/300x225/d/i/diversify1.jpg	https://audio.tflat.vn/audio/d/i/diversify.mp3	Ordering Supplies	https://tienganhtflat.com/blog/toeic-words-ordering-supplies	2026-07-24 17:22:34.132489	3
230	register	v.	Đăng ký	/'redʤistə/	to record somebody / something name on a list	You can register this mail for an additional $2.2.	Anh ấy có thể gửi đảm bảo thư này với một khoản 2.2 đô-la phí bổ sung.	https://audio.tflat.vn/data/cache/images/300x225/r/e/register1.jpg	https://audio.tflat.vn/audio/r/e/register.mp3	Conference	https://tienganhtflat.com/blog/toeic-words-conference	2026-07-24 17:22:34.132489	3
599	primarily	adv.	Trước hết, đầu tiên; chính, chủ yếu, quan trọng nhất	/'praimərili/	mainly	The developers are thinking primarily of how to enter the South American market.	Những nhà phát triển quan tâm nhất đến việc làm sao để xâm nhập thị trường Nam Mỹ.	https://audio.tflat.vn/data/cache/images/300x225/p/r/primarily1.jpg	https://audio.tflat.vn/audio/p/r/primarily.mp3	Business Planning	https://tienganhtflat.com/blog/toeic-words-business-planning	2026-07-24 17:22:34.132489	3
502	quote	v.	Trích dẫn	/kwout/	to repeat the exact words that another person has said or written	Can I quote you on that?	Mình có thể trích ý kiến của bạn về vấn đề đó được không?	https://audio.tflat.vn/data/cache/images/300x225/q/u/quote.jpg	https://audio.tflat.vn/audio/q/u/quote.mp3	Hotels	https://tienganhtflat.com/blog/toeic-words-hotels	2026-07-24 17:22:34.132489	3
30	inspect	v.	Thanh tra, kiểm tra, xem xét kỹ	/in'spekt/	to look closely at something or someone, especially to check that everything is as it should be.	Children's car seats are thoroughly inspected and tested for safety before being put on the market.	Chổ ngồi trên xe ô-tô của trẻ em được kiểm tra và kiểm nghiệm kỹ lưỡng trước khi có mặt trên thị trường.	https://audio.tflat.vn/data/images_example/300x225/c/h/childrens__ex1_580ec4117f8b9ae2888b457f.png	https://audio.tflat.vn/audio/i/n/inspect.mp3	Quality Control	https://tienganhtflat.com/blog/toeic-words-quality-control	2026-07-24 17:22:34.132489	3
664	warehouse	noun	kho hàng	/ˈwerhaʊs/	building for storing goods	The warehouse is full.	Kho hàng đã đầy.	\N	\N	Logistics	\N	2026-07-24 17:36:44.573617	3
648	workforce	noun	lực lượng lao động	/ˈwɜːrkfɔːrs/	all employees	The workforce continues to grow.	Lực lượng lao động tiếp tục tăng.	\N	\N	Human Resources	\N	2026-07-24 17:36:44.573617	3
309	accountant	n.	Kế toán viên	/əˈkaʊnt(ə)nt/	A person whose job is to keep or inspect financial accounts.	He is not sure if he owes tax on this, but is meeting his accountant this week to discuss the issue.	Ông ấy không chắc nếu ông nợ thuế về điều này, nhưng sẽ gặp kế toán của mình trong tuần này để thảo luận về vấn đề này.	https://audio.tflat.vn/data/cache/images/300x225/a/c/accountant1.jpg	https://audio.tflat.vn/audio/a/c/accountant.mp3	Accounting	https://tienganhtflat.com/blog/toeic-words-accounting	2026-07-24 17:22:34.132489	3
185	attainment	n.	Sự đạt được, thành tựu	/ə'teinmənt/	something that you achieved	The attainment of his ambitions was still a dream.	Việc đạt được những tham vọng của ông vẫn còn là một giấc mơ.	https://audio.tflat.vn/data/cache/images/300x225/a/t/attainment1.png	https://audio.tflat.vn/audio/a/t/attainment.mp3	Movies	https://tienganhtflat.com/blog/toeic-words-movies	2026-07-24 17:22:34.132489	3
424	delay	v.	Trì hoãn, hoãn lại	/di'lei/	to not do something until a later time or to make something happen at a later time	He delayed telling her the news, waiting for the right moment.	Anh trì hoãn nói cho cô ấy tin, chờ đợi đúng thời điểm.	https://audio.tflat.vn/data/cache/images/300x225/d/e/delay1.jpg	https://audio.tflat.vn/audio/d/e/delay.mp3	General Travel	https://tienganhtflat.com/blog/toeic-words-general-travel	2026-07-24 17:22:34.132489	3
403	regulate	v.	Điều chỉnh	/ˈregjʊleɪt/	to control something by means of rules	The activities of credit companies are regulated by law.	Các hoạt động của các công ty tín dụng được điều chỉnh bởi pháp luật.	https://audio.tflat.vn/data/cache/images/300x225/r/e/regulate1.jpg	https://audio.tflat.vn/audio/r/e/regulate.mp3	Events	https://tienganhtflat.com/blog/toeic-words-events	2026-07-24 17:22:34.132489	3
344	settle	v.	Ngồi, đậu, bố trí, định cư, làm ăn sinh sống; giải quyết, hòa giải, dàn xếp	/'setl/	to put an end to an argument or a disagreement	We settle the bill with the cashier.	Chúng tôi thanh toán hóa đơn với người thủ quỹ.	https://audio.tflat.vn/data/cache/images/300x225/s/e/settle2.jpg	https://audio.tflat.vn/audio/s/e/settle.mp3	Ordering Lunch	https://tienganhtflat.com/blog/toeic-words-ordering-lunch	2026-07-24 17:22:34.132489	3
705	redeem	verb	đổi	/rɪˈdiːm/	to exchange	Customers can redeem coupons.	Khách hàng có thể đổi phiếu giảm giá.	\N	\N	Retail	\N	2026-07-24 17:39:02.670694	3
660	promotion	noun	thăng chức	/prəˈmoʊʃn/	advancement in position	She earned a promotion.	Cô ấy được thăng chức.	\N	\N	Employment	\N	2026-07-24 17:36:44.573617	3
397	exact	adj.	Chính xác, đúng dắn	/ig'zækt/	correct in every detail	We will need an exact head count by noon tomorrow.	Chúng tôi cần biết tổng số đầu người chính xác trước trưa ngày mai.	https://audio.tflat.vn/data/cache/images/300x225/e/x/exact1.png	https://audio.tflat.vn/audio/e/x/exact.mp3	Events	https://tienganhtflat.com/blog/toeic-words-events	2026-07-24 17:22:34.132489	3
869	desirable	adjective	đáng mong muốn	/dɪˈzaɪərəbl/	worth having	Experience is desirable.	Kinh nghiệm là điều đáng mong muốn.	\N	\N	Employment	\N	2026-07-24 17:59:36.547339	3
537	engage	v.	Thu hút (sự chú ý…), giành được (tình cảm…)	/in'geidʤ/	to become involved in, to participate	He really wants to engage his classmates, but he doesn't know how to do that.	Cậu ấy thực sự muốn giành được cảm tình của các bạn cùng lớp, nhưng cậu ấy không biết cách làm thế nào.	https://audio.tflat.vn/data/cache/images/300x225/e/n/engage.jpg	https://audio.tflat.vn/audio/e/n/engage.mp3	Contracts	https://tienganhtflat.com/blog/toeic-words-contracts	2026-07-24 17:22:34.132489	3
278	periodically	adv.	Định kỳ, thường kỳ, chu kỳ	/ˌpɪəriˈɒdɪkli/	happening fairly often and regularly	The group tried to meet periodically.	Nhóm đã cố gắng gặp gỡ định kỳ.	https://audio.tflat.vn/data/cache/images/300x225/p/e/periodically1.jpg	https://audio.tflat.vn/audio/p/e/periodically.mp3	Board Meeting & Committees	https://tienganhtflat.com/blog/toeic-words-board-meeting-committees	2026-07-24 17:22:34.132489	3
579	verify	v.	Kiểm tra lại, thẩm tra, xác minh	/'verifai/	to check that something is true or accurate	We have no way of verifying his story.	Chúng tôi không có cách nào để xác minh câu chuyện của anh ấy.	https://audio.tflat.vn/data/cache/images/300x225/v/e/verify1.png	https://audio.tflat.vn/audio/v/e/verify.mp3	Inventory	https://tienganhtflat.com/blog/toeic-words-inventory	2026-07-24 17:22:34.132489	3
299	escort	n.ph.	Người hộ tống	/'esko:t/	a person or group of people or vehicles that travels with someone or something in order to protect or guard them	You cannot leave the unit on your own; you'll have to wait for an escort.	Anh không thể rời đơn vị (khoa...) một mình, anh phải chờ một người dẫn đường.	https://audio.tflat.vn/data/cache/images/300x225/e/s/escort1.png	https://audio.tflat.vn/audio/e/s/escort.mp3	Hospitals	https://tienganhtflat.com/blog/toeic-words-hospitals	2026-07-24 17:22:34.132489	3
215	failure	n.	Trượt, thất bại 	/'feiljə/	lack of success in doing or achieving something	The success or failure of the plan depends on you.	Kế hoạch thành công hay thất bại là phụ thuộc vào bạn.	https://audio.tflat.vn/data/cache/images/300x225/f/a/failure1.png	https://audio.tflat.vn/audio/f/a/failure.mp3	Computers and the Internet	https://tienganhtflat.com/blog/toeic-words-computers-and-the-internet	2026-07-24 17:22:34.132489	3
165	hamper	v.	Cản trở, gây trở ngại	/'hæmpə/	to prevent someone from easily doing or achieving something	The lack of supplies hampered our ability to finish on schedule.	Việc thiếu đồ dự trữ đã gây trở ngại cho khả năng hoàn thành đúng thời gian của chúng tôi.	https://audio.tflat.vn/data/cache/images/300x225/h/a/hamper2.png	https://audio.tflat.vn/audio/h/a/hamper.mp3	Property & Departments	https://tienganhtflat.com/blog/toeic-words-property-departments	2026-07-24 17:22:34.132489	3
419	announcement	n.	‹sự/lời› thông báo	/ə'naunsmənt/	a spoken or written statement that informs people about something	Did you hear an announcement about our new departure time?	Anh đã nghe thông báo về giờ khởi hành mới của chúng ta chưa?	https://audio.tflat.vn/data/cache/images/300x225/a/n/announcement.jpg	https://audio.tflat.vn/audio/a/n/announcement.mp3	General Travel	https://tienganhtflat.com/blog/toeic-words-general-travel	2026-07-24 17:22:34.132489	3
658	orientation	noun	buổi định hướng	/ˌɔːriənˈteɪʃn/	introduction for newcomers	Orientation starts Monday.	Buổi định hướng bắt đầu vào thứ Hai.	\N	\N	Employment	\N	2026-07-24 17:36:44.573617	3
265	irritate	v.	Kích thích, làm tấy lên, làm rát	/'iriteit/	to annoy someone, especially by something you continuously do	Aspirin irritates my stomach.	Aspirin kích ứng dạ dày của tôi.	https://audio.tflat.vn/data/images_example/300x225/a/s/aspirin_ir_ex1_56248d167f8b9a040dc66274.jpg	https://audio.tflat.vn/audio/i/r/irritate.mp3	Dentist's Office	https://tienganhtflat.com/blog/toeic-words-dentist-s-office	2026-07-24 17:22:34.132489	3
75	enterprise	n.	Hãng, công ty, xí nghiệp	/'entəpraiz/	a company or business	The new enterprise quickly established an account with the office supply store.	Công ty mới thiết lập một cách nhanh chóng bản thanh toán với cửa hàng đồ dùng văn phòng (bàn ghế, văn phòng phẩm, máy fax...).	https://audio.tflat.vn/data/cache/images/300x225/e/n/enterprise1.jpg	https://audio.tflat.vn/audio/e/n/enterprise.mp3	Ordering Supplies	https://tienganhtflat.com/blog/toeic-words-ordering-supplies	2026-07-24 17:22:34.132489	3
485	process	n.	Quá trình	/ˈprəʊses/	a series of something that are done in order to achieve a particular result	Singing contests usually have the same process: auditions, semi-finals, and finals.	Các cuộc thi ca hát thường có quá trình giống nhau: thử giọng, bán kết, và chung kết.	https://audio.tflat.vn/data/cache/images/300x225/p/r/process1.png	https://audio.tflat.vn/audio/p/r/process.mp3	Electronics	https://tienganhtflat.com/blog/toeic-words-electronics-3	2026-07-24 17:22:34.132489	3
772	duplicate	verb	sao chép	/ˈduːplɪkeɪt/	to make an exact copy	Please duplicate this document.	Vui lòng sao chép tài liệu này.	\N	\N	Office	\N	2026-07-24 17:41:11.759836	3
567	suggestion	n.	Lời đề nghị, sự gợi ý	/səˈdʒestʃən/	an idea or a plan that you mention for someone else to think about	Thank you so much for your suggestion.	Cảm ơn bạn rất nhiều về đề nghị của bạn.	https://audio.tflat.vn/data/cache/images/300x225/s/u/suggestion1.jpg	https://audio.tflat.vn/audio/s/u/suggestion.mp3	Selecting A Restaurant	https://tienganhtflat.com/blog/toeic-words-selecting-a-restaurant	2026-07-24 17:22:34.132489	3
638	manufacture	verb	sản xuất	/ˌmænjuˈfæktʃər/	to make goods	The factory manufactures cars.	Nhà máy sản xuất ô tô.	\N	\N	Manufacturing	\N	2026-07-24 17:36:44.573617	3
246	anxious	adj.	Lo lắng, băn khoăn	/'æɳkʃəs/	feeling worried or nervous	He seemed anxious about the meeting.	Anh ta có vẻ lo lắng về cuộc họp.	https://audio.tflat.vn/data/cache/images/300x225/a/n/anxious1.png	https://audio.tflat.vn/audio/a/n/anxious.mp3	Product Development	https://tienganhtflat.com/blog/toeic-words-product-development	2026-07-24 17:22:34.132489	3
113	admire	v.	Ngưỡng mộ	/ədˈmaɪə(r)/	to respect someone for what they are or for what they have done	What she did makes me admire her greatly.	Những gì cô ấy làm khiến tôi rất ngưỡng mộ cô ấy.	https://audio.tflat.vn/data/cache/images/300x225/a/d/admire1.png	https://audio.tflat.vn/audio/a/d/admire.mp3	Museums	https://tienganhtflat.com/blog/toeic-words-museums	2026-07-24 17:22:34.132489	3
808	emphasize	verb	nhấn mạnh	/ˈemfəsaɪz/	to give special importance	The speaker emphasized safety.	Diễn giả nhấn mạnh vấn đề an toàn.	\N	\N	Communication	\N	2026-07-24 17:44:13.10333	3
647	warranty	noun	bảo hành	/ˈwɔːrənti/	a written guarantee	The product has a two-year warranty.	Sản phẩm có bảo hành hai năm.	\N	\N	Sales	\N	2026-07-24 17:36:44.573617	3
906	incorporate	verb	kết hợp	/ɪnˈkɔːrpəreɪt/	to include	The design incorporates new features.	Thiết kế kết hợp các tính năng mới.	\N	\N	Technology	\N	2026-07-24 18:01:26.486905	3
27	defect	n.	Khuyết điểm, sai sót	/di'fekt/	a fault in something	Because of a defect in cable, the phone was returned.	Vì một lỗi ở dây cáp nên chiếc điện thoại đã được trả lại. 	https://audio.tflat.vn/data/images_example/300x225/b/e/because_of_ex1_580ec40d7f8b9ae2888b4579.jpg	https://audio.tflat.vn/audio/d/e/defect.mp3	Quality Control	https://tienganhtflat.com/blog/toeic-words-quality-control	2026-07-24 17:22:34.132489	3
208	draw	v.	Thu hút, lôi cuốn	/drɔ:/	to attract or interest someone	Matthew was drawn to a career in cooking.	Matthew đã bị lôi cuốn với công việc nấu ăn.	https://audio.tflat.vn/data/cache/images/300x225/d/r/draw-v2.jpg	https://audio.tflat.vn/audio/d/r/draw-v.mp3	Cooking As A Career	https://tienganhtflat.com/blog/toeic-words-cooking-as-a-career	2026-07-24 17:22:34.132489	3
617	applicant	noun	người ứng tuyển	/ˈæplɪkənt/	a person applying for a job	Each applicant submitted a resume.	Mỗi ứng viên đã nộp một bản sơ yếu lý lịch.	\N	\N	Employment	\N	2026-07-24 17:36:44.573617	3
518	investment	n.	Sự đầu tư	/ɪnˈvest mənt/	\N	Stocks are regarded as good long-term investments.	Cổ phiếu được coi là khoản đầu tư dài hạn tốt.	https://audio.tflat.vn/data/cache/images/300x225/i/n/investment1.jpg	https://audio.tflat.vn/audio/i/n/investment.mp3	Investment	https://tienganhtflat.com/blog/toeic-words-investment	2026-07-24 17:22:34.132489	3
531	contract	n.	Hợp đồng	/kənˈtrakt/	\N	Are you going to break the contract?	Bạn đang định phá vỡ hợp đồng phải không?	https://audio.tflat.vn/data/cache/images/300x225/c/o/contracts1.jpg	https://audio.tflat.vn/audio/c/o/contract.mp3	Contracts	https://tienganhtflat.com/blog/toeic-words-contracts	2026-07-24 17:22:34.132489	3
458	category	n.	Loại, hạng	/ˈkætəɡɔːri/	group of people or things with particular features in common	We have various categories of goods here.	Chúng tôi có nhiều loại hàng hóa khác nhau ở đây.	https://audio.tflat.vn/data/images_example/300x225/w/e/we_have_va_ex1_56248d017f8b9afc0c2982b5.jpg	https://audio.tflat.vn/audio/c/a/category.mp3	Music	https://tienganhtflat.com/blog/toeic-words-music	2026-07-24 17:22:34.132489	3
3	compensate	v.	Bù, đền bù, bồi thường	/'kɔmpenseit/	to provide something good to balance or reduce the bad effects of damage, loss	If you are injured in a traffic accident, you can be compensated for your losses.	Nếu bạn bị thương trong một tai nạn giao thông, bạn có thể được bồi thường mọi thiệt hại. 	https://audio.tflat.vn/data/cache/images/300x225/c/o/compensate1.png	https://audio.tflat.vn/audio/c/o/compensate.mp3	Salaries & Benefits	https://tienganhtflat.com/blog/toeic-words-salaries-benefits	2026-07-24 17:22:34.132489	3
805	demonstrate	verb	chứng minh	/ˈdemənstreɪt/	to show clearly	The results demonstrate success.	Kết quả chứng minh sự thành công.	\N	\N	Business	\N	2026-07-24 17:44:13.10333	3
734	appraisal	noun	đánh giá	/əˈpreɪzl/	an evaluation	The annual appraisal is next week.	Buổi đánh giá hằng năm diễn ra vào tuần sau.	\N	\N	Human Resources	\N	2026-07-24 17:41:11.759836	3
680	discontinue	verb	ngừng sản xuất	/ˌdɪskənˈtɪnjuː/	to stop making something	The product was discontinued.	Sản phẩm đã ngừng sản xuất.	\N	\N	Business	\N	2026-07-24 17:39:02.670694	3
558	compromise	n.	Sự thoả hiệp	/'kɔmprəmaiz/	an agreement made between two people or groups in which each side gives up some of the things they want so that both sides are happy at the end	After lengthy talks the two sides finally reached a compromise.	Sau cuộc đàm phán kéo dài hai bên cuối cùng đã đạt đến một thỏa hiệp.	https://audio.tflat.vn/data/cache/images/300x225/c/o/compromise2.jpg	https://audio.tflat.vn/audio/c/o/compromise.mp3	Selecting A Restaurant	https://tienganhtflat.com/blog/toeic-words-selecting-a-restaurant	2026-07-24 17:22:34.132489	3
52	be in charge of	v.	Chịu trách nhiệm về 	/bi: ɪn tʃɑːdʒ əv/	be responsible for	He appointed someone to be in charge of maintaining a supply of paper in the fax machine.	Ông ấy chọn người nào đó chịu trách nhiệm duy trì việc cung cấp giấy cho máy fax.	https://audio.tflat.vn/data/cache/images/300x225/b/e/be_in_charge_of1.png	https://audio.tflat.vn/audio/b/e/be_in_charge_of.mp3	Office Technology	https://tienganhtflat.com/blog/toeic-words-office-technology	2026-07-24 17:22:34.132489	3
381	annually	adv.	Hàng năm, từng nằm, thường niên (yearly)	/'ænjuəli/	once a year	Everyone should get a physical exam annually.	Mọi người nên đi khám sức khỏe hàng năm.	https://audio.tflat.vn/data/cache/images/300x225/a/n/annually2.jpg	https://audio.tflat.vn/audio/a/n/annually.mp3	Doctor's Office	https://tienganhtflat.com/blog/toeic-words-doctor-s-office	2026-07-24 17:22:34.132489	3
367	sufficiently	adv.	Đủ, có đủ	/səˈfɪʃnt/	enough for a particular purpose; as much as you need	Two stars are sufficiently close together.	Hai ngôi sao đủ gần nhau. 	https://audio.tflat.vn/data/images_example/300x225/t/w/two_stars__ex1_580de46a7f8b9a84688b45a4.jpg	https://audio.tflat.vn/audio/s/u/sufficiently.mp3	Shipping	https://tienganhtflat.com/blog/toeic-words-shipping	2026-07-24 17:22:34.132489	3
490	software	n.	Phần mềm, chương trình máy tính	/ˈsɒftweə(r)/	the programs, etc....used to operate a computer	Many computers come pre-loaded with software.	Nhiều máy tính đã có sẵn phần mềm.	https://audio.tflat.vn/data/cache/images/300x225/s/o/software1.jpg	https://audio.tflat.vn/audio/s/o/software.mp3	Electronics	https://tienganhtflat.com/blog/toeic-words-electronics-3	2026-07-24 17:22:34.132489	3
243	reputation	n.	Danh tiếng, thanh danh, tiếng (tốt của nhân vật)	/,repju:'teiʃn/	the opinion that people have about what s.b/s.th is like, based on what has happened in the past	Hogwarts is a school with an excellent reputation.	Hogwarts là một trường học với một danh tiếng xuất sắc.	https://audio.tflat.vn/data/cache/images/300x225/r/e/reputation1.jpg	https://audio.tflat.vn/audio/r/e/reputation.mp3	Warranties	https://tienganhtflat.com/blog/toeic-words-warranties	2026-07-24 17:22:34.132489	3
661	quota	noun	chỉ tiêu	/ˈkwoʊtə/	required amount	The sales quota was achieved.	Chỉ tiêu doanh số đã hoàn thành.	\N	\N	Sales	\N	2026-07-24 17:36:44.573617	3
498	expect	v.	Mong đợi	/ɪkˈspekt/	to think or believe that something will happen	She expects to see her new baby girl.	Cô ấy mong đợi được gặp con gái bé nhỏ của cô. 	https://audio.tflat.vn/data/cache/images/300x225/e/x/expect1.png	https://audio.tflat.vn/audio/e/x/expect.mp3	Hotels	https://tienganhtflat.com/blog/toeic-words-hotels	2026-07-24 17:22:34.132489	3
55	initiative	n.	Bước khởi đầu, sự khởi xướng	/i'niʃiətiv/	the ability to decide and act on your own without waiting for somebody to tell you what to do	Take the initiative and engage your classmates in friendly conversation.	Hãy khởi xướng và thu hút các bạn cùng lớp tham gia vào một cuộc nói chuyện thân thiện.	https://audio.tflat.vn/data/images_example/300x225/t/a/take_the_i_ex1_56248d127f8b9a020d261a10.jpg	https://audio.tflat.vn/audio/i/n/initiative.mp3	Office Technology	https://tienganhtflat.com/blog/toeic-words-office-technology	2026-07-24 17:22:34.132489	3
304	procedure	n.	Thủ tục, các bước tiến hành 	/prəˈsidʒər/	a way of doing something, especially the usual or correct way	Call the hospital to schedule this procedure for tomorrow.	Hãy gọi cho bệnh viện để sắp lịch cho thủ tục này vào ngày mai.	https://audio.tflat.vn/data/cache/images/300x225/p/r/procedure1.png	https://audio.tflat.vn/audio/p/r/procedure.mp3	Hospitals	https://tienganhtflat.com/blog/toeic-words-hospitals	2026-07-24 17:22:34.132489	3
438	item	n.	Khoản, món, mục, mặt hàng	/'aitem/	one thing on a list of things to buy, do, talk about, etc	Do you think I can get all these items into one bag?	Cô có nghĩ rằng tôi có thể để tất cả món đồ này vào một cái túi không?	https://audio.tflat.vn/data/cache/images/300x225/i/t/item1.png	https://audio.tflat.vn/audio/i/t/item.mp3	Shopping	https://tienganhtflat.com/blog/toeic-words-shopping	2026-07-24 17:22:34.132489	3
291	investigate	v.	Điều tra, nghiên cứu	/in'vestigeit/	to carefully examine the facts of a situation, an event, a crime, etc	Reporters need to thoroughly investigate the facts before publishing their stories.	Các phóng viên cần phải điều tra kỹ lưỡng về sự kiện trước khi công bố bài báo về chúng.	https://audio.tflat.vn/data/cache/images/300x225/i/n/investigate2.jpg	https://audio.tflat.vn/audio/i/n/investigate.mp3	Media	https://tienganhtflat.com/blog/toeic-words-media	2026-07-24 17:22:34.132489	3
134	thrill	n.	Sự rùng rợn, ly kỳ, sự hưng phấn	/θril/	a strong feeling of excitement or pleasure	Just taking a vacation is thrill enough, even if we are driving instead of flying.	Hãy thực hiện một kỳ nghỉ có đủ sự rộn ràng lên, cho dù ta đang lái xe thay vì đi máy bay.	https://audio.tflat.vn/data/cache/images/300x225/t/h/thrill1.png	https://audio.tflat.vn/audio/t/h/thrill.mp3	Car Rentals	https://tienganhtflat.com/blog/toeic-words-car-rentals	2026-07-24 17:22:34.132489	3
822	inspection	noun	sự kiểm tra	/ɪnˈspekʃn/	official examination	The inspection begins tomorrow.	Cuộc kiểm tra bắt đầu vào ngày mai.	\N	\N	Quality	\N	2026-07-24 17:44:13.10333	3
425	depart	v.	Khởi hành, rời khỏi	/di'pɑ:t/	to leave a place, especially to start a trip	Flights for Rome depart from Terminal 3.	Chuyến bay đi Rome khởi hành tại Trạm 3.	https://audio.tflat.vn/data/cache/images/300x225/d/e/depart1.png	https://audio.tflat.vn/audio/d/e/depart.mp3	General Travel	https://tienganhtflat.com/blog/toeic-words-general-travel	2026-07-24 17:22:34.132489	3
674	consignment	noun	lô hàng ký gửi	/kənˈsaɪnmənt/	goods sent to someone	The consignment arrived safely.	Lô hàng ký gửi đã đến an toàn.	\N	\N	Logistics	\N	2026-07-24 17:39:02.670694	3
377	perform	v.	Biểu diễn, trình diễn	/pəˈfɔːm/	to do something, such as a piece of work, task, or duty	A water puppet show is performed in a pool.	Chương trình múa rối nước được biểu diễn trong một cái bể nước.	https://audio.tflat.vn/data/images_example/300x225/a/_/a_water_pu_ex1_56248cf57f8b9af80c012359.jpg	https://audio.tflat.vn/audio/p/e/perform.mp3	Theater	https://tienganhtflat.com/blog/toeic-words-theater	2026-07-24 17:22:34.132489	3
130	license	n.	Giấy phép, chứng chỉ, bằng	/'laisəns/	to give somebody official permission to do, own, or use something	A driver's license allows you to operate a motor vehicle legally.	Giấy phép lái xe hạng A cho phép bạn lái xe mô tô một cách hợp pháp.	https://audio.tflat.vn/data/cache/images/300x225/l/i/license1.jpg	https://audio.tflat.vn/audio/l/i/license.mp3	Car Rentals	https://tienganhtflat.com/blog/toeic-words-car-rentals	2026-07-24 17:22:34.132489	3
343	pick up	phr.v.	Đón (ai đó)	/'pikʌp/	to take on passengers or freight	I'll pick you up at five o'clock.	Tôi sẽ đón bạn lúc 5 giờ.	https://audio.tflat.vn/data/cache/images/300x225/p/i/pick_up1.jpg	https://audio.tflat.vn/audio/p/i/pick_up.mp3	Ordering Lunch	https://tienganhtflat.com/blog/toeic-words-ordering-lunch	2026-07-24 17:22:34.132489	3
441	strictly	adv.	‹một cách› nghiêm ngặt, nghiêm khắc	/ˈstrɪktli/	with a lot of control and rules that must be obeyed	Our store strictly enforces its return policy.	Cửa hàng chúng tôi thực thi nghiêm ngặt chính sách hoàn trả hàng của mình.	https://audio.tflat.vn/data/cache/images/300x225/s/t/strictly1.png	https://audio.tflat.vn/audio/s/t/strictly.mp3	Shopping	https://tienganhtflat.com/blog/toeic-words-shopping	2026-07-24 17:22:34.132489	3
799	contribute	verb	đóng góp	/kənˈtrɪbjuːt/	to give or add	Everyone contributed ideas.	Mọi người đều đóng góp ý tưởng.	\N	\N	Business	\N	2026-07-24 17:44:13.10333	3
739	attribute	verb	quy cho	/əˈtrɪbjuːt/	to regard as caused by	Success was attributed to teamwork.	Thành công được cho là nhờ tinh thần đồng đội.	\N	\N	Business	\N	2026-07-24 17:41:11.759836	3
488	sharp	adj.	 thông minh, láu lỉnh	/ʃɑ:p/	sudden and rapid, especially of a change in something	The new employee proved how sharp she was when she mastered the new program in a few days.	Nhân viên mới đã chứng tỏ được cô ấy thông minh đến thế nào khi mà cô đã làm chủ được chương trình mới trong vài ngày.	https://audio.tflat.vn/data/cache/images/300x225/s/h/sharp2.jpg	https://audio.tflat.vn/audio/s/h/sharp.mp3	Electronics	https://tienganhtflat.com/blog/toeic-words-electronics-3	2026-07-24 17:22:34.132489	3
297	authorize	v.	Uỷ quyền, cho phép, cho quyền	/´ɔ:θə¸raiz/	to give official permission for something	We cannot share the test results with you until we have been authorized to do so by your doctor.	Chúng tôi không thể chia sẻ kết quả xét nghiệm với anh cho đến khi chúng tôi được cho phép làm như vậy bởi bác sĩ của anh.	https://audio.tflat.vn/data/cache/images/300x225/a/u/authorize1.jpg	https://audio.tflat.vn/audio/a/u/authorize.mp3	Hospitals	https://tienganhtflat.com/blog/toeic-words-hospitals	2026-07-24 17:22:34.132489	3
70	set up	v.	Thiết lập, tạo dựng	/'setʌp/	to establish, to arrange	You should set up a time and place for the meeting and then inform everyone who is involved.	Bạn nên thiết lập một thời gian và địa điểm cho cuộc họp và sau đó thông báo cho tất cả những người có liên quan.	https://audio.tflat.vn/data/cache/images/300x225/s/e/set_up.jpg	https://audio.tflat.vn/audio/s/e/set_up.mp3	Hiring and Training	https://tienganhtflat.com/blog/toeic-words-hiring-and-training	2026-07-24 17:22:34.132489	3
550	project	v.	Kế hoạch, đồ án, dự án	/ˈprɒdʒekt/	to plan an activity, a project etc, for a time in the future	The director projects that the company will need to hire ten new employees his year.	Người giám đốc lập kế hoạch là công ty sẽ cần phải thuê 10 nhân viên mới trong năm nay.	https://audio.tflat.vn/data/cache/images/300x225/p/r/project2.png	https://audio.tflat.vn/audio/p/r/project.mp3	Financial Statements	https://tienganhtflat.com/blog/toeic-words-financial-statements	2026-07-24 17:22:34.132489	3
471	directory	n.	Sách hướng dẫn, danh bạ	/dɪˈrektəri/	a book containing lists of information, usually in alphabetical order	We consulted the directory to see where the train station was located.	Chúng tôi đã tham khảo danh bạ điện thoại để xem ga xe lửa nằm ở chỗ nào.	https://audio.tflat.vn/data/cache/images/300x225/d/i/directory2.png	https://audio.tflat.vn/audio/d/i/directory.mp3	Trains	https://tienganhtflat.com/blog/toeic-words-trains	2026-07-24 17:22:34.132489	3
236	consider	v.	Xem như	/kən'sidə/	to think about something carefully	You shouldn't consider marrying a man for his money.	Bạn không nên nghĩ rằng lấy một người đàn ông vì tiền của anh ta.	https://audio.tflat.vn/data/images_example/300x225/y/o/you_should_ex1_56248d147f8b9a040dc65dc0.png	https://audio.tflat.vn/audio/c/o/consider.mp3	Warranties	https://tienganhtflat.com/blog/toeic-words-warranties	2026-07-24 17:22:34.132489	3
594	demonstrate	v.	Bày tỏ, biểu lộ, cho thấy; chứng minh, giải thích	/'demənstreit/	to show something clearly by giving proof or evidence	Let me demonstrate to you some of the difficulties we are facing.	Hãy để tôi trình bày cho bạn một số khó khăn mà chúng ta đang phải đối mặt.	https://audio.tflat.vn/data/cache/images/300x225/d/e/demonstrate.jpg	https://audio.tflat.vn/audio/d/e/demonstrate.mp3	Business Planning	https://tienganhtflat.com/blog/toeic-words-business-planning	2026-07-24 17:22:34.132489	4
173	be made of	v.	Làm bằng (cái gì)	/bi: meɪd əv/	be produced of	This job will really test what you are made of.	Công việc này sẽ thật sự kiểm tra xem anh là người thế nào.	https://audio.tflat.vn/data/cache/images/300x225/b/e/be_made_of2.jpg	https://audio.tflat.vn/audio/b/e/be_made_of.mp3	Office Procedures	https://tienganhtflat.com/blog/toeic-words-office-procedures	2026-07-24 17:22:34.132489	4
17	fluctuate	v.	Dao động, thay đổi bất thường	/´flʌktʃu¸eit/	to change frequently in size, amount, quality, etc., especially from one extreme to another	No one is very comfortable making a large investment while the currency values fluctuate almost daily.	Không ai thấy thật yên tâm thực hiện một đầu tư lớn trong khi giá trị tiền tệ dao động như cơm bữa.	https://audio.tflat.vn/data/cache/images/300x225/f/l/fluctuate2.jpg	https://audio.tflat.vn/audio/f/l/fluctuate.mp3	Renting and Leasing	https://tienganhtflat.com/blog/toeic-words-renting-and-leasing	2026-07-24 17:22:34.132489	4
716	workload	noun	khối lượng công việc	/ˈwɜːrkloʊd/	amount of work	Her workload has increased.	Khối lượng công việc của cô ấy đã tăng.	\N	\N	Office	\N	2026-07-24 17:39:02.670694	4
918	leaseholder	noun	người thuê	/ˈliːshoʊldər/	a person renting property	The leaseholder renewed the contract.	Người thuê đã gia hạn hợp đồng.	\N	\N	Real Estate	\N	2026-07-24 18:01:26.486905	4
223	arrangement	n.	Sự sắp xếp	/ə'reindʤmənt/	a plan or preparation that you make so that something	The travel arrangements were taken care of by Sara, Mr. Billing's capable assistant.	Việc thu xếp chuyến đi được chịu trách nhiệm bởi Sara, trợ lý có năng lực của ông Billing.	https://audio.tflat.vn/data/cache/images/300x225/a/r/arrangement2.jpg	https://audio.tflat.vn/audio/a/r/arrangement.mp3	Conference	https://tienganhtflat.com/blog/toeic-words-conference	2026-07-24 17:22:34.132489	4
87	attract	v.	Hấp dẫn, lôi cuốn, thu hút	/ə'trækt/	to draw by appeal	The display attracted a number of people at the convention.	Việc trưng bày đã thu hút được một số người tại hội nghị.	https://audio.tflat.vn/data/cache/images/300x225/a/t/attract1.png	https://audio.tflat.vn/audio/a/t/attract.mp3	Marketing	https://tienganhtflat.com/blog/toeic-words-marketing	2026-07-24 17:22:34.132489	4
388	prevent	v.	Ngăn ngừa, phòng ngừa	/prɪˈvent/	to stop someone from doing something	This vaccine can prevent having some common childhood diseases.	Loại vắc-xin này có thể phòng ngừa một số loại bệnh thường gặp ở trẻ nhỏ.	https://audio.tflat.vn/data/cache/images/300x225/p/r/prevent1.png	https://audio.tflat.vn/audio/p/r/prevent.mp3	Doctor's Office	https://tienganhtflat.com/blog/toeic-words-doctor-s-office	2026-07-24 17:22:34.132489	4
679	depreciation	noun	khấu hao	/dɪˌpriːʃiˈeɪʃn/	loss in value over time	Depreciation affects asset value.	Khấu hao ảnh hưởng đến giá trị tài sản.	\N	\N	Accounting	\N	2026-07-24 17:39:02.670694	4
294	thorough	adj.	Kỹ lưỡng, tỉ mỉ	/'θʌrə/	done completely; with great attention to detail	The story was the result of thorough research.	Bài báo là kết quả của sự nghiên cứu kỹ lưỡng.	https://audio.tflat.vn/data/cache/images/300x225/t/h/thorough1.png	https://audio.tflat.vn/audio/t/h/thorough.mp3	Media	https://tienganhtflat.com/blog/toeic-words-media	2026-07-24 17:22:34.132489	4
391	refer	v.	Quy vào, nói đến	/ri'fə:/	to mention or speak about someone or something	As soon as Agnes referred to the failed treatment, everyone's mood soured.	Ngay khi Agnes quy cho việc thất bại là do điều trị, tâm trạng của mọi người đã tỏ ra cáu kỉnh.	https://audio.tflat.vn/data/cache/images/300x225/r/e/refer1.png	https://audio.tflat.vn/audio/r/e/refer.mp3	Doctor's Office	https://tienganhtflat.com/blog/toeic-words-doctor-s-office	2026-07-24 17:22:34.132489	4
421	blanket	v.	Phủ lên	/ˈblæŋkɪt/	to cover something completely with a thick layer	The snow blanketed the windshield making it difficult to see the roads.	Tuyết bao phủ kính chắn gió, khiến cho việc nhìn thấy đường sá rất khó.	https://audio.tflat.vn/data/images_example/300x225/t/h/the_snow_b_ex1_56248d007f8b9afc0c2980bd.jpg	https://audio.tflat.vn/audio/b/l/blanket.mp3	General Travel	https://tienganhtflat.com/blog/toeic-words-general-travel	2026-07-24 17:22:34.132489	4
861	customary	adjective	theo thông lệ	/ˈkʌstəmeri/	usual	It is customary to confirm appointments.	Theo thông lệ cần xác nhận lịch hẹn.	\N	\N	Office	\N	2026-07-24 17:59:36.547339	4
99	calculation	n.	‹sự/kết quả› tính, tính toán; ‹sự› dự tính, trù liệu	/,kælkju'leiʃn/	the act or process of using numbers to find out an amount	According to my calculations, I'll owe less money on my income taxes this year.	Theo tính toán của tôi, tôi sẽ chịu tiền thuế thu nhập ít hơn trong năm nay.	https://audio.tflat.vn/data/cache/images/300x225/c/a/calculation.jpg	https://audio.tflat.vn/audio/c/a/calculation.mp3	Taxes	https://tienganhtflat.com/blog/toeic-words-taxes	2026-07-24 17:22:34.132489	4
116	express	v.	Biểu lộ, diễn đạt	/iks'pres/	to show or make known a feeling, an opinion, etc. by words, looks, or actions	The photograph expresses a range of emotions.	Bức ảnh biểu lộ đủ loại cảm xúc.	https://audio.tflat.vn/data/cache/images/300x225/e/x/express-v1.jpg	https://audio.tflat.vn/audio/e/x/express-v.mp3	Museums	https://tienganhtflat.com/blog/toeic-words-museums	2026-07-24 17:22:34.132489	4
306	statement	n.	Sự trình bày, bản kê	/'steitmənt/	a document setting out items of debit and credit between a bank or other organization and a customer	My bank sends me monthly statement.	Ngân hàng gởi cho tôi bản trình bày vào mỗi tháng.	https://audio.tflat.vn/data/cache/images/300x225/s/t/statement1.png	https://audio.tflat.vn/audio/s/t/statement.mp3	Hospitals	https://tienganhtflat.com/blog/toeic-words-hospitals	2026-07-24 17:22:34.132489	4
209	access	n.	Quyền truy cập, sự tiếp cận 	/ˈækses/	the opportunity or right to use something	I cannot easily get access to the Internet.	Tôi không thể dễ dàng có được quyền truy cập vào Internet.	https://audio.tflat.vn/data/cache/images/300x225/a/c/access1.jpg	https://audio.tflat.vn/audio/a/c/access.mp3	Computers and the Internet	https://tienganhtflat.com/blog/toeic-words-computers-and-the-internet	2026-07-24 17:22:34.132489	4
95	market	n.	Thị trường, chợ, nơi mua bán sản phẩm...	/'mɑ:kit/	An area in which commercial dealings are conducted	My mother goes to the market every morning.	Mẹ tôi đi vào chợ mỗi buổi sáng.	https://audio.tflat.vn/data/cache/images/300x225/m/a/market1.png	https://audio.tflat.vn/audio/m/a/market.mp3	Marketing	https://tienganhtflat.com/blog/toeic-words-marketing	2026-07-24 17:22:34.132489	4
539	obligate	v.	Bắt buộc, ép buộc	/'ɔbligeit/	to bind legally or morally	The contractor was obligated by the contract to work 40 hours a week.	Nhà thầu buộc phải làm việc 40 tiếng mỗi tuần.	https://audio.tflat.vn/data/cache/images/300x225/o/b/obligate1.png	https://audio.tflat.vn/audio/o/b/obligate.mp3	Contracts	https://tienganhtflat.com/blog/toeic-words-contracts	2026-07-24 17:22:34.132489	4
78	function	n.	Chức năng, nhiệm vụ	/fʌŋkʃn/	a special activity or purpose of a person or thing	What is the function of this device?	Chức năng của thiết bị này là gì?	https://audio.tflat.vn/data/cache/images/300x225/f/u/function1.png	https://audio.tflat.vn/audio/f/u/function.mp3	Ordering Supplies	https://tienganhtflat.com/blog/toeic-words-ordering-supplies	2026-07-24 17:22:34.132489	4
218	search	n.	Cuộc tìm kiếm, thăm dò	/sə:tʃ/	an attemp to find somebody / something, especially by looking acrefully for them /it	Our search of the database produced very little information.	Việc tìm kiếm trong cơ sở dữ liệu của chúng tôi đã đem lại rất ít thông tin.	https://audio.tflat.vn/data/cache/images/300x225/s/e/search1.png	https://audio.tflat.vn/audio/s/e/search.mp3	Computers and the Internet	https://tienganhtflat.com/blog/toeic-words-computers-and-the-internet	2026-07-24 17:22:34.132489	4
272	bring up	phr. v.	Đưa ra	/brɪŋ ʌp/	to introduce a topic	Can you bring up the main menu again?	Bạn có thể đưa lại thực đơn cho tôi xem được không ?	https://audio.tflat.vn/data/cache/images/300x225/b/r/bring_up1.png	https://audio.tflat.vn/audio/b/r/bring_up.mp3	Board Meeting & Committees	https://tienganhtflat.com/blog/toeic-words-board-meeting-committees	2026-07-24 17:22:34.132489	4
66	look up to	v.	Tôn kính, kính trọng, khâm phục	/lʊk ʌp tuː/	to admire	Staff members look up to the director because he has earned their respect over the years.	Tập thể nhân viên tôn kính người giám đốc vì ông đã được hưởng sự kính trọng của họ suốt những năm qua.	https://audio.tflat.vn/data/cache/images/300x225/l/o/look_up_to.jpg	https://audio.tflat.vn/audio/l/o/look_up_to.mp3	Hiring and Training	https://tienganhtflat.com/blog/toeic-words-hiring-and-training	2026-07-24 17:22:34.132489	4
190	entertainment	n.	‹sự› giải trí, tiêu khiển	/,entə'teinmənt/	movies, music, etc. used to entertain people	There was not entertainment for children of guests at the hotel.	Không có trò giải trí nào cho những vị khách trẻ em ở khách sạn.	https://audio.tflat.vn/data/cache/images/300x225/e/n/entertainment2.jpg	https://audio.tflat.vn/audio/e/n/entertainment.mp3	Movies	https://tienganhtflat.com/blog/toeic-words-movies	2026-07-24 17:22:34.132489	4
547	level	n.	Cấp, cấp bậc, trình độ	/'levl/	the amount of something that exists in a particular situation at a particular time	We have never had an accountant work at such a sophisticated level before.	Trước đây chúng tôi không bao giờ có một nhân viên kế toán làm với trình độ tinh vi đến thế.	https://audio.tflat.vn/data/cache/images/300x225/l/e/level1.png	https://audio.tflat.vn/audio/l/e/level.mp3	Financial Statements	https://tienganhtflat.com/blog/toeic-words-financial-statements	2026-07-24 17:22:34.132489	4
884	expertise	noun	chuyên môn	/ˌekspɜːrˈtiːz/	special skill	Her expertise is marketing.	Chuyên môn của cô ấy là marketing.	\N	\N	Business	\N	2026-07-24 17:59:36.547339	4
733	anticipate	verb	dự đoán	/ænˈtɪsɪpeɪt/	to expect	We anticipate strong sales.	Chúng tôi dự đoán doanh số cao.	\N	\N	Sales	\N	2026-07-24 17:41:11.759836	4
847	commuter	noun	người đi làm	/kəˈmjuːtər/	a person traveling to work	Many commuters use the subway.	Nhiều người đi làm sử dụng tàu điện ngầm.	\N	\N	Transportation	\N	2026-07-24 17:59:36.547339	4
85	stationery	n.	Đồ dùng văn phòng (giấy để viết và bao thư)	/'steiʃnəri/	﻿ materials for writing and for using in an office, for example paper, pens, and envelopes	We do not have enough stationery, so please order some more.	Chúng ta không có đủ giấy và bao thư, vậy hãy đặt hàng thêm một ít nữa.	https://audio.tflat.vn/data/cache/images/300x225/s/t/stationery1.png	https://audio.tflat.vn/audio/s/t/stationery.mp3	Ordering Supplies	https://tienganhtflat.com/blog/toeic-words-ordering-supplies	2026-07-24 17:22:34.132489	4
308	accounting	n.	Công việc kế toán	/ə'kauntiɳ/	the process or work of keeping financial accounts.	Good accounting is needed in all businesses.	Việc kế toán tốt là cần thiết cho mọi công việc làm ăn.	https://audio.tflat.vn/data/cache/images/300x225/a/c/accounting1.jpg	https://audio.tflat.vn/audio/a/c/accounting.mp3	Accounting	https://tienganhtflat.com/blog/toeic-words-accounting	2026-07-24 17:22:34.132489	4
206	relinquish	v.	Từ bỏ, buông thả	/ri'liɳkwiʃ/	to stop having something, especially when this happens unwillingly	After Claude married Kiki, he had to relinquish his exclusive hold on the kitchen and learn to share the joys of cooking.	Sau khi Claude lấy Kiki, anh ta đã phải từ bỏ độc quyền nắm giữ nhà bếp và biết chia sẻ niềm vui nấu nướng.	https://audio.tflat.vn/data/cache/images/300x225/r/e/relinquish1.jpg	https://audio.tflat.vn/audio/r/e/relinquish.mp3	Cooking As A Career	https://tienganhtflat.com/blog/toeic-words-cooking-as-a-career	2026-07-24 17:22:34.132489	4
503	rate	n.	Mức giá, tỉ lệ	/reɪt/	a measurement of the speed at which something happens	The sign in the lobby lists the seasonal rates.	Biển hiệu ở trong hành lang liệt kê các mức giá theo từng mùa.	https://audio.tflat.vn/data/cache/images/300x225/r/a/rate1.jpg	https://audio.tflat.vn/audio/r/a/rate.mp3	Hotels	https://tienganhtflat.com/blog/toeic-words-hotels	2026-07-24 17:22:34.132489	4
346	destination	n.	Nơi đến, nơi tới, đích đến, mục đích	/,desti'neiʃn/	a place to which someone or something is going or being sent	The next destination is Ha Long bay.	Điểm đến tiếp theo là vịnh Hạ Long.	https://audio.tflat.vn/data/cache/images/300x225/d/e/destination.jpg	https://audio.tflat.vn/audio/d/e/destination.mp3	Airlines	https://tienganhtflat.com/blog/toeic-words-airlines	2026-07-24 17:22:34.132489	4
465	relaxation	n.	Thư giãn, giải trí	/,ri:læk'seiʃn/	ways of resting and enjoying yourself	These powerful relaxation techniques will help you relieve stress.	Những phương pháp thư giãn tuyệt vời này sẽ giúp bạn bớt căng thẳng.	https://audio.tflat.vn/data/cache/images/300x225/r/e/relaxation1.png	https://audio.tflat.vn/audio/r/e/relaxation.mp3	Music	https://tienganhtflat.com/blog/toeic-words-music	2026-07-24 17:22:34.132489	4
418	agent	n.	Đại lý	/ˈeɪdʒənt/	representative of a company	A travel agent can usually find you the best deals on tickets and hotels.	Đại lý du lịch thường có thể tìm cho bạn những giao dịch tốt nhất vè vé và khách sạn.	https://audio.tflat.vn/data/images_example/300x225/a/_/a_travel_a_ex1_56248d167f8b9a040dc66154.jpg	https://audio.tflat.vn/audio/a/g/agent.mp3	General Travel	https://tienganhtflat.com/blog/toeic-words-general-travel	2026-07-24 17:22:34.132489	4
360	catalog	v.	Phân thành từng mục	/ˈkat(ə)lɒg/	\N	Ellen cataloged the complaints according to severity.	Ellen chia thành từng mục các lời phàn nàn tùy theo tính nghiêm trọng.	https://audio.tflat.vn/data/images_example/300x225/e/l/ellen_cata_ex1_56248d157f8b9a040dc65f38.jpg	https://audio.tflat.vn/audio/c/a/catalog.mp3	Shipping	https://tienganhtflat.com/blog/toeic-words-shipping	2026-07-24 17:22:34.132489	4
159	weakly	adv.	Một cách yếu ớt, yếu, ốm yếu	/'wi:kli/	in a weak way	Her hands trembled and she spoke weakly at the interview.	Tay cô ta run và cô ta nói giọng yếu ớt tại buổi phỏng vấn.	https://audio.tflat.vn/data/cache/images/300x225/w/e/weakly1.png	https://audio.tflat.vn/audio/w/e/weakly.mp3	Apply and Interviewing	https://tienganhtflat.com/blog/toeic-words-apply-and-interviewing	2026-07-24 17:22:34.132489	4
435	comfort	n.	Sự thoải mái, dễ dàng	/'kʌmfət/	the state of being physically relaxed or having a pleant life	I like to dress for comfort if I'm spending the day shopping.	Tôi thích ăn mặc thoải mái (không gò bó) nếu tôi bỏ ra cả ngày đi mua sắm.	https://audio.tflat.vn/data/cache/images/300x225/c/o/comfort1.png	https://audio.tflat.vn/audio/c/o/comfort.mp3	Shopping	https://tienganhtflat.com/blog/toeic-words-shopping	2026-07-24 17:22:34.132489	4
310	accumulate	v.	Tích lũy, tích góp, gom góp	/ə'kju:mjuleit/	to gradually get more and more of something over a period of time.	They have accumulated more than enough information.	Họ đã tích lũy nhiều hơn mức thông tin đủ dùng.	https://audio.tflat.vn/data/cache/images/300x225/a/c/accumulate1.png	https://audio.tflat.vn/audio/a/c/accumulate.mp3	Accounting	https://tienganhtflat.com/blog/toeic-words-accounting	2026-07-24 17:22:34.132489	4
770	diploma	noun	bằng tốt nghiệp	/dɪˈploʊmə/	an educational certificate	She earned a business diploma.	Cô ấy nhận bằng tốt nghiệp ngành kinh doanh.	\N	\N	Education	\N	2026-07-24 17:41:11.759836	4
442	trend	n.	Xu hướng	/trend/	a general diretion in which a situation is changing or developing	The youth try to keep up with the fashion trend.	Giới trẻ cố gắng bắt kịp xu hướng thời trang.	https://audio.tflat.vn/data/cache/images/300x225/t/r/trend1.jpg	https://audio.tflat.vn/audio/t/r/trend.mp3	Shopping	https://tienganhtflat.com/blog/toeic-words-shopping	2026-07-24 17:22:34.132489	4
59	reduction	n.	Sự giảm, thu nhỏ	/ri'dʌkʃn/	an act of making something less or smaller	The outlet store gave a 20 percent reduction in the price of the shelves and bookcases.	Cửa hàng tiêu thụ đã giảm giá 20% với các kệ sách và tủ sách.	https://audio.tflat.vn/data/cache/images/300x225/r/e/reduction1.jpg	https://audio.tflat.vn/audio/r/e/reduction.mp3	Office Technology	https://tienganhtflat.com/blog/toeic-words-office-technology	2026-07-24 17:22:34.132489	4
798	construct	verb	xây dựng	/kənˈstrʌkt/	to build	The company constructed a new factory.	Công ty đã xây dựng một nhà máy mới.	\N	\N	Construction	\N	2026-07-24 17:44:13.10333	4
371	audience	n.	Khán giả	/ˈɔːdiəns/	people who have gathered to watch or listen to something (a play, concert, someone speaking, etc.)	Millions of audiences all over the world enjoy this programme.	Hàng triệu khán giả trên toàn thế giới yêu thích chương trình này.	https://audio.tflat.vn/data/cache/images/300x225/a/u/audience1.jpg	https://audio.tflat.vn/audio/a/u/audience.mp3	Theater	https://tienganhtflat.com/blog/toeic-words-theater	2026-07-24 17:22:34.132489	4
175	casually	adv.	Bình thường, không trịnh trọng	/ˈkæʒuəli/	not showing much care or throught	On Fridays, most employees dress casually.	Vào các thứ Sáu, phần lớn nhân viên ăn mặc tùy ý (không mặc đồng phục).	https://audio.tflat.vn/data/cache/images/300x225/c/a/casually1.png	https://audio.tflat.vn/audio/c/a/casually.mp3	Office Procedures	https://tienganhtflat.com/blog/toeic-words-office-procedures	2026-07-24 17:22:34.132489	4
443	charge	v.	Tính phí	/tʃɑːdʒ/	to ask an amount of money for goods or a service	What did they charge for the repairs?	Họ đã tính phí gì cho việc sửa chữa?	https://audio.tflat.vn/data/cache/images/300x225/c/h/charge1.png	https://audio.tflat.vn/audio/c/h/charge.mp3	Invoice	https://tienganhtflat.com/blog/toeic-words-invoice	2026-07-24 17:22:34.132489	4
851	compromise	noun	thỏa hiệp	/ˈkɑːmprəmaɪz/	an agreement	Both sides reached a compromise.	Hai bên đã đạt được thỏa hiệp.	\N	\N	Business	\N	2026-07-24 17:59:36.547339	4
205	profession	n.	Nghề nghiệp	/prəˈfeʃən/	a type of job that needs special training or skill, especially one that needs a high level of education	Cooking is considered as much a profession as law or medicine.	Nấu ăn được xem là một nghề nghiệp cũng như là nghề luật hay nghề y.	https://audio.tflat.vn/data/cache/images/300x225/p/r/profession1.jpg	https://audio.tflat.vn/audio/p/r/profession.mp3	Cooking As A Career	https://tienganhtflat.com/blog/toeic-words-cooking-as-a-career	2026-07-24 17:22:34.132489	4
543	specific	adj.	Cụ thể, rõ ràng, rành mạch	/spəˈsɪfɪk/	detailed abd exact	The customer's specific complaint was not addressed in his e-mail.	Khiếu nại cụ thể của khách hàng đã không được giải quyết trong Email gửi anh ấy.	https://audio.tflat.vn/data/cache/images/300x225/s/p/specific1.png	https://audio.tflat.vn/audio/s/p/specific.mp3	Contracts	https://tienganhtflat.com/blog/toeic-words-contracts	2026-07-24 17:22:34.132489	4
324	courier	n.	Người đưa thư, người chuyển phát	/'kuriə/	a person or company whose job is to take packages or papers somewhere	We hired a courier to deliver the package.	Chúng tôi đã thuê một người đưa thư để phân phát các kiện hàng.	https://audio.tflat.vn/data/cache/images/300x225/c/o/courier1.png	https://audio.tflat.vn/audio/c/o/courier.mp3	Correspondence	https://tienganhtflat.com/blog/toeic-words-correspondence	2026-07-24 17:22:34.132489	4
920	legitimate	adjective	hợp pháp	/ləˈdʒɪtɪmət/	lawful	The transaction is legitimate.	Giao dịch này là hợp pháp.	\N	\N	Legal	\N	2026-07-24 18:01:26.486905	4
859	convenience	noun	sự tiện lợi	/kənˈviːniəns/	ease of use	Online banking offers convenience.	Ngân hàng trực tuyến mang lại sự tiện lợi.	\N	\N	Banking	\N	2026-07-24 17:59:36.547339	4
271	agenda	n.	Đề tài thảo luận, chương trình nghị sự	/ə´dʒendə/	\N	Newspapers have been accused of trying to set the agenda for the government.	Báo chí đã bị buộc tội cố gắng thiết lập chương trình nghị sự của chính phủ.	https://audio.tflat.vn/data/cache/images/300x225/a/g/agenda1.png	https://audio.tflat.vn/audio/a/g/agenda.mp3	Board Meeting & Committees	https://tienganhtflat.com/blog/toeic-words-board-meeting-committees	2026-07-24 17:22:34.132489	4
893	fundamental	adjective	cơ bản	/ˌfʌndəˈmentl/	forming a necessary base	Communication is fundamental to success.	Giao tiếp là nền tảng của thành công.	\N	\N	Business	\N	2026-07-24 18:01:26.486905	4
247	ascertain	v.	Biết chắc, xác định rõ ràng	/,æsə'tein/	\N	A necessary part of product development is to ascertain whether the product is safe.	Một việc cần thiết cho sự phát triển sản phẩm là biết chắc sản phẩm có an toàn hay không.	https://audio.tflat.vn/data/cache/images/300x225/a/s/ascertain1.png	https://audio.tflat.vn/audio/a/s/ascertain.mp3	Product Development	https://tienganhtflat.com/blog/toeic-words-product-development	2026-07-24 17:22:34.132489	4
911	inspectional	adjective	thuộc kiểm tra	/ɪnˈspekʃənl/	related to inspection	Inspectional procedures were updated.	Các quy trình kiểm tra đã được cập nhật.	\N	\N	Quality	\N	2026-07-24 18:01:26.486905	4
53	capacity	n.	Sức chứa, dung tích	/kə'pæsiti/	the number of things or people that a container or space can hold	The new conference room is much larger and has a capacity of one hundred people.	Phòng họp mới thì lớn hơn nhiều (phòng cũ) và có khả năng chứa được một trăm người.	https://audio.tflat.vn/data/images_example/300x225/t/h/the_new_co_ex1_56248d0b7f8b9a000de3cf4d.jpg	https://audio.tflat.vn/audio/c/a/capacity.mp3	Office Technology	https://tienganhtflat.com/blog/toeic-words-office-technology	2026-07-24 17:22:34.132489	4
233	take part in	v.	Tham dự, tham gia	/teɪk pɑːt ɪn/	to be involved in something	We could not get enough people to take part in the meeting, so we canceled it.	Chúng tôi không có đủ người tham dự cuộc họp, vì vậy chúng tôi hủy bỏ nó.	https://audio.tflat.vn/data/cache/images/300x225/t/a/take_part_in2.jpg	https://audio.tflat.vn/audio/t/a/take_part_in.mp3	Conference	https://tienganhtflat.com/blog/toeic-words-conference	2026-07-24 17:22:34.132489	4
446	discount	n.	Sự giảm giá	/ˈdɪskaʊnt/	an amount of money that is taken off the usual cost of something	Do you get a discount if you pay in cash?	Bạn có được sự giảm giá nếu trả bằng tiền mặt không?	https://audio.tflat.vn/data/cache/images/300x225/d/i/discount-n1.jpg	https://audio.tflat.vn/audio/d/i/discount-n.mp3	Invoice	https://tienganhtflat.com/blog/toeic-words-invoice	2026-07-24 17:22:34.132489	4
453	rectify	v.	Sửa cho đúng, sửa cho ngay	/'rektifai/	to put right something that is wrong	Embarrassed at his behavior, he rectified the situation by writing a letter of apology.	Xấu hổ về thái độ của mình, anh ta đã sửa chữa tình huống bằng cách viết thư tạ lỗi.	https://audio.tflat.vn/data/cache/images/300x225/r/e/rectify1.png	https://audio.tflat.vn/audio/r/e/rectify.mp3	Invoice	https://tienganhtflat.com/blog/toeic-words-invoice	2026-07-24 17:22:34.132489	4
184	movie	n.	Phim, điện ảnh	/'mu:vi/	\N	I like watching movies very much.	Tôi thích xem phim rất nhiều.	https://audio.tflat.vn/data/cache/images/300x225/m/o/movie2.jpg	https://audio.tflat.vn/audio/m/o/movie.mp3	Movies	https://tienganhtflat.com/blog/toeic-words-movies	2026-07-24 17:22:34.132489	4
912	integrate	verb	tích hợp	/ˈɪntɪɡreɪt/	to combine into one	The software integrates multiple systems.	Phần mềm tích hợp nhiều hệ thống.	\N	\N	Technology	\N	2026-07-24 18:01:26.486905	4
672	catalog	noun	danh mục	/ˈkætəlɔːɡ/	a list of products	Our new catalog is available online.	Danh mục sản phẩm mới đã có trực tuyến.	\N	\N	Sales	\N	2026-07-24 17:39:02.670694	4
787	archive	verb	lưu trữ	/ˈɑːrkaɪv/	to store records	Please archive these files.	Vui lòng lưu trữ các tập tin này.	\N	\N	Office	\N	2026-07-24 17:44:13.10333	4
731	agenda	noun	chương trình nghị sự	/əˈdʒendə/	a list of meeting topics	The agenda was sent yesterday.	Chương trình họp đã được gửi hôm qua.	\N	\N	Office	\N	2026-07-24 17:41:11.759836	4
897	gross	adjective	tổng	/ɡroʊs/	before deductions	Gross income increased this year.	Tổng thu nhập đã tăng trong năm nay.	\N	\N	Finance	\N	2026-07-24 18:01:26.486905	4
174	bring in	\N	Tuyển dụng, dẫn tới	/brɪŋ ɪn/	to hire or recruit	The company brings in new team of project planners.	Công ty thuê một đội mới cho các nhà hoạch định dự án.	https://audio.tflat.vn/data/cache/images/300x225/b/r/bring_in2.jpg	https://audio.tflat.vn/audio/b/r/bring_in.mp3	Office Procedures	https://tienganhtflat.com/blog/toeic-words-office-procedures	2026-07-24 17:22:34.132489	4
927	mediation	noun	hòa giải	/ˌmiːdiˈeɪʃn/	conflict resolution	The dispute ended in mediation.	Tranh chấp kết thúc bằng hòa giải.	\N	\N	Legal	\N	2026-07-24 18:01:26.486905	4
46	portion	n.	Chia phần, số phận	/'pɔ:ʃn/	one part of something larger	A portion of my benefits is my health care coverage.	Một phần phúc lợi của tôi là bảo hiểm chăm sóc sức khỏe.	https://audio.tflat.vn/data/cache/images/300x225/p/o/portion1.jpg	https://audio.tflat.vn/audio/p/o/portion.mp3	Health	https://tienganhtflat.com/blog/toeic-words-health	2026-07-24 17:22:34.132489	4
935	obligation	noun	nghĩa vụ	/ˌɑːblɪˈɡeɪʃn/	a duty	Employees have legal obligations.	Nhân viên có các nghĩa vụ pháp lý.	\N	\N	Legal	\N	2026-07-24 18:01:26.486905	4
657	negotiate	verb	đàm phán	/nɪˈɡoʊʃieɪt/	to discuss terms	They negotiated a better deal.	Họ đã đàm phán một thỏa thuận tốt hơn.	\N	\N	Business	\N	2026-07-24 17:36:44.573617	4
144	patron	n.	Khách hàng quen, người bảo trợ	/'peitrən/	a person who gives money and support to artists and writers	This restaurant has many loyal patrons.	Nhà hàng này có nhiều người khách hàng quen rất trung thành.	https://audio.tflat.vn/data/cache/images/300x225/p/a/patron1.jpg	https://audio.tflat.vn/audio/p/a/patron.mp3	Eating Out	https://tienganhtflat.com/blog/toeic-words-eating-out	2026-07-24 17:22:34.132489	4
642	procurement	noun	mua sắm	/prəˈkjʊrmənt/	the process of obtaining goods	The procurement team negotiated prices.	Bộ phận mua sắm đã thương lượng giá.	\N	\N	Business	\N	2026-07-24 17:36:44.573617	4
193	release	v.	Phát hành	/rɪˈliːs/	to let someone or something come out of a place where they have been kept	She is trying to release her album as planned.	Cô ấy đang cố gắng để phát hành đĩa nhạc của mình như đã dự định.	https://audio.tflat.vn/data/images_example/300x225/s/h/she_is_try_ex1_56248d0b7f8b9a000de3cfa9.jpg	https://audio.tflat.vn/audio/r/e/release.mp3	Movies	https://tienganhtflat.com/blog/toeic-words-movies	2026-07-24 17:22:34.132489	4
447	efficient	adj.	Có hiệu quả, có hiệu suất, có năng suất (cao)	/i'fiʃənt/	doing something well and thoroughly with no waste of time, money, or energy	The accountant was so efficient in processing the customer receipts that she had the job done before lunch.	Nhân viên kế toán làm việc hiệu quả trong việc xử lý các hóa đơn khách hàng đến nỗi cô ta đã hoàn tất công việc trước bữa trưa.	https://audio.tflat.vn/data/cache/images/300x225/e/f/efficient1.png	https://audio.tflat.vn/audio/e/f/efficient.mp3	Invoice	https://tienganhtflat.com/blog/toeic-words-invoice	2026-07-24 17:22:34.132489	4
139	flavor	n.	Hương vị, mùi thơm	/ˈfleɪvər/	a substance added to food or drink to give it a particular flavour	The cook changed the flavor of the soup with a unique blend of herbs.	Người nấu bếp thay đổi mùi vị món súp bằng một sự pha trộn các loại cây cỏ độc đáo.	https://audio.tflat.vn/data/cache/images/300x225/f/l/flavor1.jpg	https://audio.tflat.vn/audio/f/l/flavor.mp3	Eating Out	https://tienganhtflat.com/blog/toeic-words-eating-out	2026-07-24 17:22:34.132489	4
302	permit	v.	Cho phép	/pəˈmɪt/	to allow someone to do something or to allow something to happen	Smoking is not permitted anywhere inside the hospital.	Hút thuốc bị cấm ở bất kỳ đâu bên trong bệnh viện.	https://audio.tflat.vn/data/cache/images/300x225/p/e/permit1.jpg	https://audio.tflat.vn/audio/p/e/permit.mp3	Hospitals	https://tienganhtflat.com/blog/toeic-words-hospitals	2026-07-24 17:22:34.132489	4
813	generate	verb	tạo ra	/ˈdʒenəreɪt/	to produce	The campaign generated interest.	Chiến dịch đã tạo ra sự quan tâm.	\N	\N	Marketing	\N	2026-07-24 17:44:13.10333	4
63	generate	v.	Làm ra, tạo ra, phát ra	/'dʤenəreit/	to produce or create something	The new training program generated a lot of interest among employees.	Chương trình huấn luyện mới đã tạo ra nhiều lợi ích cho mỗi nhân viên.	https://audio.tflat.vn/data/cache/images/300x225/g/e/generate1.png	https://audio.tflat.vn/audio/g/e/generate.mp3	Hiring and Training	https://tienganhtflat.com/blog/toeic-words-hiring-and-training	2026-07-24 17:22:34.132489	4
663	vendor	noun	nhà cung cấp	/ˈvendər/	a seller or supplier	The vendor delivered the equipment.	Nhà cung cấp đã giao thiết bị.	\N	\N	Procurement	\N	2026-07-24 17:36:44.573617	4
454	terms	n.	Điều kiện, điều khoản	/tɜːmz/	the conditions that people offer, demand, or accept when they make an agreement, an arrangement, or a contract	The terms of payment were clearly listed at the bottom of the invoice.	Các điều kiện thanh toán đã được liệt kê rõ ràng ở bên dưới hóa đơn.	https://audio.tflat.vn/data/cache/images/300x225/t/e/terms1.png	https://audio.tflat.vn/audio/t/e/terms.mp3	Invoice	https://tienganhtflat.com/blog/toeic-words-invoice	2026-07-24 17:22:34.132489	4
713	vacancy	noun	vị trí tuyển dụng	/ˈveɪkənsi/	an available job	There is a vacancy in marketing.	Có một vị trí tuyển dụng ở phòng marketing.	\N	\N	Employment	\N	2026-07-24 17:39:02.670694	4
151	be ready for	v.	Sẵn sàng cho	\N	\N	Thanks to her careful research, the applicant felt that she was ready for the interview with the director of the program.	Nhờ sự nghiên cứu cẩn thận của mình, người xin việc thấy rằng cô ta đã sẵn sàng cho cuộc phỏng vấn với người giám đốc của chương trình.	https://audio.tflat.vn/data/cache/images/300x225/b/e/be_ready_for.jpg	https://audio.tflat.vn/audio/b/e/be_ready_for.mp3	Apply and Interviewing	https://tienganhtflat.com/blog/toeic-words-apply-and-interviewing	2026-07-24 17:22:34.132489	4
13	apprehensive	adj.	Sợ hãi, e sợ; hiểu rõ, cảm thấy rõ, tiếp thu nhanh	/,æpri'hensiv/	worried or frightened that something unpleasant may happen	The mortgage lender was apprehensive about the company's ability to pay.	Người cho vay thế chấp e ngại về khả năng thanh toán của công ty.	https://audio.tflat.vn/data/cache/images/300x225/a/p/apprehensive2.jpg	https://audio.tflat.vn/audio/a/p/apprehensive.mp3	Renting and Leasing	https://tienganhtflat.com/blog/toeic-words-renting-and-leasing	2026-07-24 17:22:34.132489	4
930	monitoring	noun	giám sát	/ˈmɑːnɪtərɪŋ/	continuous observation	Monitoring improves quality.	Giám sát giúp nâng cao chất lượng.	\N	\N	Quality	\N	2026-07-24 18:01:26.486905	4
774	encounter	verb	gặp phải	/ɪnˈkaʊntər/	to experience	We encountered unexpected problems.	Chúng tôi gặp phải những vấn đề ngoài dự kiến.	\N	\N	Business	\N	2026-07-24 17:41:11.759836	4
625	credential	noun	chứng nhận	/krəˈdenʃl/	proof of qualifications	His credentials impressed the employer.	Chứng nhận của anh ấy gây ấn tượng với nhà tuyển dụng.	\N	\N	Employment	\N	2026-07-24 17:36:44.573617	4
89	competition	n.	Cuộc thi	/,kɔmpi'tiʃn/	a situation in which people or organizations compete with each other for something that not everyone can have	Which team do you think will win that tug of war competition?	Bạn nghĩ đội nào sẽ thắng cuộc thi kéo co đó?	https://audio.tflat.vn/data/cache/images/300x225/c/o/competition.jpg	https://audio.tflat.vn/audio/c/o/competition.mp3	Marketing	https://tienganhtflat.com/blog/toeic-words-marketing	2026-07-24 17:22:34.132489	4
168	move up	v.	Tiến lên, thăng tiến	/muːv ʌp /	to advance, improve position	In order to move up in the company, employees had to demonstrate their loyalty.	Nhằm để thăng tiến trong công ty, các nhân viên phải biểu lộ lòng trung thành của họ.	https://audio.tflat.vn/data/cache/images/300x225/m/o/move_up1.png	https://audio.tflat.vn/audio/m/o/move_up.mp3	Property & Departments	https://tienganhtflat.com/blog/toeic-words-property-departments	2026-07-24 17:22:34.132489	4
492	technically	adv.	Nói đến/nói về mặt kỹ thuật; một cách chuyên môn/nghiêm túc	/ˈteknɪkli/	in a way that is connected with the skills needed for a particular job	Technically speaking, the virus infected only script files.	Nói về mặt kỹ thuật thì virus chỉ tác động lên các tập tin script (tập tin kịch bản thi hành).	https://audio.tflat.vn/data/cache/images/300x225/t/e/technically.jpg	https://audio.tflat.vn/audio/t/e/technically.mp3	Electronics	https://tienganhtflat.com/blog/toeic-words-electronics-3	2026-07-24 17:22:34.132489	4
111	museum	n.	Viện bảo tàng	/mju:'ziːəm/	\N	We can walk to the museum. It’s not far from here.	Chúng ta có thể đi bộ tới viện bảo tàng, nó cách đây không xa lắm.	https://audio.tflat.vn/data/cache/images/300x225/m/u/museums1.jpg	https://audio.tflat.vn/audio/m/u/museum.mp3	Museums	https://tienganhtflat.com/blog/toeic-words-museums	2026-07-24 17:22:34.132489	4
1	basis	n.	Nền tảng, cơ sở, căn cứ	/'beisis/	the reason why people take a particular action	The manager didn't have any basis for firing the employee.	Người trưởng phòng không có bất kỳ cơ sở nào cho việc sa thải người nhân viên.	https://audio.tflat.vn/data/cache/images/300x225/b/a/basis.jpg	https://audio.tflat.vn/audio/b/a/basis.mp3	Salaries & Benefits	https://tienganhtflat.com/blog/toeic-words-salaries-benefits	2026-07-24 17:22:34.132489	4
616	amend	verb	sửa đổi	/əˈmend/	to make changes to a document	The manager amended the contract.	Người quản lý đã sửa đổi hợp đồng.	\N	\N	Business	\N	2026-07-24 17:36:44.573617	4
400	lead time	n.	Khoảng thời gian ở giữa sự bắt đầu và sự hoàn thành của một quá trình	/ˈliːdtʌɪm/	the time between starting and completing a production process	The lead time for reservations is unrealistic.	Khoảng thời gian cho quá trình đặt chỗ diễn ra là phi thực tế.	https://audio.tflat.vn/data/cache/images/300x225/l/e/lead_time1.jpg	https://audio.tflat.vn/audio/l/e/lead_time.mp3	Events	https://tienganhtflat.com/blog/toeic-words-events	2026-07-24 17:22:34.132489	4
258	aware	adj.	Biết, nhận thức	/ə'weə/	knowing or realizing something	My dentist made me aware that I should have an appointment twice a year.	Nha sĩ của tôi làm cho tôi biết rằng tôi nên hẹn gặp 2 lần mỗi năm.	https://audio.tflat.vn/data/images_example/300x225/m/y/my_dentist_ex1_56248d167f8b9a040dc66260.jpg	https://audio.tflat.vn/audio/a/w/aware.mp3	Dentist's Office	https://tienganhtflat.com/blog/toeic-words-dentist-s-office	2026-07-24 17:22:34.132489	4
597	gather	v.	Tập hợp, tụ thập, thu thập; kết luận, suy ra	/'gæðə/	to come together, or bring people together	We gathered information for our plan from many sources.	Chúng tôi thu thập thông tin cho bản kế hoạch của mình từ nhiều nguồn.	https://audio.tflat.vn/data/cache/images/300x225/g/a/gather1.jpg	https://audio.tflat.vn/audio/g/a/gather.mp3	Business Planning	https://tienganhtflat.com/blog/toeic-words-business-planning	2026-07-24 17:22:34.132489	4
320	turnover	n.	Doanh số, doanh thu	/ˈtɜːnəʊvə(r)/	the total amount of goods or services sold by a company during a particular period of time.	An annual turnover of $75 million.	Doanh thu hàng năm là $ 75.000.000.	https://audio.tflat.vn/data/cache/images/300x225/t/u/turnover1.jpg	https://audio.tflat.vn/audio/t/u/turnover.mp3	Accounting	https://tienganhtflat.com/blog/toeic-words-accounting	2026-07-24 17:22:34.132489	4
355	substantially	adv.	Về thực chất, về bản chất, về cơ bản; lớn lao, đáng kể	/səb'stænʃəli/	very much; a lot	The airline I work for had a substantially higher rating for customer satisfaction than our competitors had.	Hãng hàng không mà tôi đang làm việc có thứ hạng về sự hài lòng của khách hàng cao hơn đáng kể thứ hạng mà các đối thủ có.	https://audio.tflat.vn/data/cache/images/300x225/s/u/substantially2.jpg	https://audio.tflat.vn/audio/s/u/substantially.mp3	Airlines	https://tienganhtflat.com/blog/toeic-words-airlines	2026-07-24 17:22:34.132489	4
21	lock into	v.	Ràng buộc chặt, không thể thay đổi	/lɒk ˈɪntʊ/	to commit, to be unable to change	Before you lock yourself into something, check all your options.	Trước khi bạn tự ràng buộc mình vào cái gì, hãy xem xét mọi chọn lựa của mình.	https://audio.tflat.vn/data/cache/images/300x225/l/o/lock_into1.png	https://audio.tflat.vn/audio/l/o/lock_into.mp3	Renting and Leasing	https://tienganhtflat.com/blog/toeic-words-renting-and-leasing	2026-07-24 17:22:34.132489	4
838	appoint	verb	bổ nhiệm	/əˈpɔɪnt/	to assign a position	They appointed a new director.	Họ đã bổ nhiệm một giám đốc mới.	\N	\N	Management	\N	2026-07-24 17:59:36.547339	4
496	check-in	n.	Sự nhận phòng	//	\N	Do you know your check-in time ?	Bạn có biết thời gian nhận phòng không?	https://audio.tflat.vn/data/cache/images/300x225/c/h/check-in2.jpg	https://audio.tflat.vn/audio/c/h/check-in.mp3	Hotels	https://tienganhtflat.com/blog/toeic-words-hotels	2026-07-24 17:22:34.132489	4
244	require	v.	Đòi hỏi, yêu cầu	/ri'kwaiə/	to need something; to depend on s.b / s.th	The law requires that each item clearly display the warranty information.	Luật pháp yêu cầu mỗi món hàng trình bày rõ ràng thông tin về bảo hành.	https://audio.tflat.vn/data/cache/images/300x225/r/e/require1.jpg	https://audio.tflat.vn/audio/r/e/require.mp3	Warranties	https://tienganhtflat.com/blog/toeic-words-warranties	2026-07-24 17:22:34.132489	4
606	dedication	n.	‹sự› cống hiến, hiến dâng, tận tâm, tận tụy	/,dedi'keiʃn/	the hard work and effort that somebody puts into an activity or purpose	The director's dedication to a high-quality product has motivated many of his employees.	Sự cống hiến của giám đốc cho một sản phẩm chất lượng cao đã thúc đẩy nhiều nhân viên.	https://audio.tflat.vn/data/cache/images/300x225/d/e/dedication1.jpg	https://audio.tflat.vn/audio/d/e/dedication.mp3	Promotions, Pensions & Award	https://tienganhtflat.com/blog/toeic-words-promotions-pensions-award	2026-07-24 17:22:34.132489	4
573	liability	n.	Nguy cơ, điều gây khó khăn trở ngại	/,laiə'biliti/	the state of being legally responsible for something	The slippery steps were a terrible liability for the store.	Những bậc thềm trơn trượt là một nguy cơ tệ hại cho cửa hàng.	https://audio.tflat.vn/data/cache/images/300x225/l/i/liability1.png	https://audio.tflat.vn/audio/l/i/liability.mp3	Inventory	https://tienganhtflat.com/blog/toeic-words-inventory	2026-07-24 17:22:34.132489	4
530	wisely	adj.	Khôn ngoan, từng trải, thông thái, uyên bác	/waɪz/	able to make sensible decisions and give good advice because of the experience.	If you invest wisely, you will be able to retire early.	Nếu anh đầu tư khôn ngoan, anh sẽ có thể về hưu sớm.	https://audio.tflat.vn/data/cache/images/300x225/w/i/wisely1.png	https://audio.tflat.vn/audio/w/i/wisely.mp3	Investment	https://tienganhtflat.com/blog/toeic-words-investment	2026-07-24 17:22:34.132489	4
334	commonly	adv.	Thường thường, thông thường	/'kɔmənli/	usually; very often; by most people	The restaurants in this area commonly serve office workers and are only open during the week.	Nhà hàng trong khu này thường phục vụ nhân viên văn phòng và thường mở cửa suốt tuần.	https://audio.tflat.vn/data/cache/images/300x225/c/o/commonly1.jpg	https://audio.tflat.vn/audio/c/o/commonly.mp3	Ordering Lunch	https://tienganhtflat.com/blog/toeic-words-ordering-lunch	2026-07-24 17:22:34.132489	4
769	dimension	noun	khía cạnh	/daɪˈmenʃn/	an aspect or measurement	Quality is one dimension of success.	Chất lượng là một khía cạnh của thành công.	\N	\N	Business	\N	2026-07-24 17:41:11.759836	4
413	profile	n.	Tiểu sử sơ lược, bản tóm lược các đặc tính	/ˈprəʊfaɪl/	a group of characteristics or traits	The recruiter told him that, unfortunately, he did not fit the job profile.	Người tuyển dụng nói rằng, thật không may, anh ta không hợp với bản tóm lược công việc.	https://audio.tflat.vn/data/cache/images/300x225/p/r/profile1.png	https://audio.tflat.vn/audio/p/r/profile.mp3	Job Ads & Recruitment	https://tienganhtflat.com/blog/toeic-words-job-ads-recruitment	2026-07-24 17:22:34.132489	4
783	advocate	verb	ủng hộ	/ˈædvəkeɪt/	to support publicly	The manager advocated change.	Người quản lý đã ủng hộ sự thay đổi.	\N	\N	Management	\N	2026-07-24 17:44:13.10333	4
497	confirm	v.	Xác nhận	/kənˈfɜː(r)m/	to state or show that something is definitely true or correct,	Please write to confirm your reservation.	Xin vui lòng viết xác nhận cho việc đặt phòng của bạn.	https://audio.tflat.vn/data/cache/images/300x225/c/o/confirm1.jpg	https://audio.tflat.vn/audio/c/o/confirm.mp3	Hotels	https://tienganhtflat.com/blog/toeic-words-hotels	2026-07-24 17:22:34.132489	4
794	certify	verb	chứng nhận	/ˈsɜːrtɪfaɪ/	to confirm officially	The inspector certified the equipment.	Thanh tra đã chứng nhận thiết bị.	\N	\N	Quality	\N	2026-07-24 17:44:13.10333	4
15	condition	n.	Điều kiện, tình trạng	/kənˈdɪʃən/	the state that something is in	Except for some minor repairs, the building is in very good condition.	Trừ một vài tu chữa nhỏ, tòa nhà đang ở trong tình trạng rất tốt.	https://audio.tflat.vn/data/cache/images/300x225/c/o/condition1.png	https://audio.tflat.vn/audio/c/o/condition.mp3	Renting and Leasing	https://tienganhtflat.com/blog/toeic-words-renting-and-leasing	2026-07-24 17:22:34.132489	4
166	inconsiderately	adv.	Thiếu thận trọng, sơ suất	/ˌɪnkənˈsɪdərətli/	not giving enough thought to other people''s feeling or needs	The manager inconsiderately scheduled the meeting for late Friday afternoon.	Người giám đốc sơ suất lên lịch họp vào cuối buổi chiều thứ Sáu.	https://audio.tflat.vn/data/cache/images/300x225/i/n/inconsiderately.jpg	https://audio.tflat.vn/audio/i/n/inconsiderately.mp3	Property & Departments	https://tienganhtflat.com/blog/toeic-words-property-departments	2026-07-24 17:22:34.132489	4
776	accelerate	verb	tăng tốc	/əkˈseləreɪt/	to increase speed	The company accelerated production.	Công ty đã tăng tốc sản xuất.	\N	\N	Business	\N	2026-07-24 17:44:13.10333	4
795	competitive	adjective	cạnh tranh	/kəmˈpetətɪv/	strong compared to others	Our prices are competitive.	Giá của chúng tôi rất cạnh tranh.	\N	\N	Marketing	\N	2026-07-24 17:44:13.10333	4
326	fold	v.	Gập, gấp	/fould/	to bend something, especially paper or cloth	You should fold the omelette in half.	Bạn nên gập trứng rán làm đôi.	https://audio.tflat.vn/data/images_example/300x225/y/o/you_should_ex1_56248d157f8b9a040dc65e74.jpg	https://audio.tflat.vn/audio/f/o/fold.mp3	Correspondence	https://tienganhtflat.com/blog/toeic-words-correspondence	2026-07-24 17:22:34.132489	4
120	schedule	n.	Chương trình, lịch trình	/ˈskedʒuːl/	to arrange for something to happen at a particular time	The TV schedules are filled with interesting films.	Lịch trình trên TV toàn là những phim hấp dẫn.	https://audio.tflat.vn/data/cache/images/300x225/s/c/schedule1.png	https://audio.tflat.vn/audio/s/c/schedule.mp3	Museums	https://tienganhtflat.com/blog/toeic-words-museums	2026-07-24 17:22:34.132489	4
267	position	n.	Vị trí	/pəˈzɪʃn/	the place where someone or something is located	I'm writing to apply for the position of a volunteer guide.	Tôi viết thư để ứng tuyển vị trí hướng dẫn viên tình nguyện.	https://audio.tflat.vn/data/images_example/300x225/i/m/im_writing_ex1_56248cfb7f8b9afa0cb17d50.jpg	https://audio.tflat.vn/audio/p/o/position.mp3	Dentist's Office	https://tienganhtflat.com/blog/toeic-words-dentist-s-office	2026-07-24 17:22:34.132489	4
380	sell out	v.	Hết vé	/'selaut/	to sell all the tickets	The tickets sold out within hours.	Các vé đã được bán hết trong vài giờ.	https://audio.tflat.vn/data/cache/images/300x225/s/e/sell_out1.jpg	https://audio.tflat.vn/audio/s/e/sell_out.mp3	Theater	https://tienganhtflat.com/blog/toeic-words-theater	2026-07-24 17:22:34.132489	4
629	efficiency	noun	hiệu quả	/ɪˈfɪʃənsi/	the ability to work well	Automation improves efficiency.	Tự động hóa cải thiện hiệu quả.	\N	\N	Business	\N	2026-07-24 17:36:44.573617	4
542	resolve	v.	Giải quyết	/ri'zɔlv/	to find an acceptable solution to a problem	The manager resolved to clean out all the files at the end of the week.	Cuối tuần, người quản lý đã giải quyết bằng cách xóa sạch tất cả các dữ liệu.	https://audio.tflat.vn/data/cache/images/300x225/r/e/resolve1.png	https://audio.tflat.vn/audio/r/e/resolve.mp3	Contracts	https://tienganhtflat.com/blog/toeic-words-contracts	2026-07-24 17:22:34.132489	4
529	return	n.	Tiền lãi, tiền lời	/ri'tə:n/	a mount of profit that you get from something	Some investors are satisfied with a 15 percent return, while others want to see a much larger return.	Một số nhà đầu tư hài lòng với một khoản lãi 15%, trong khi những người khác thì muốn thấy mức lãi nhiều hơn.	https://audio.tflat.vn/data/cache/images/300x225/r/e/return1.png	https://audio.tflat.vn/audio/r/e/return.mp3	Investment	https://tienganhtflat.com/blog/toeic-words-investment	2026-07-24 17:22:34.132489	4
348	economize	v.	Tiết kiệm, giảm chi	/i:'kɔnəmaiz/	to use less money, time, etc. than you normally use	My travel agent knows I like to economize and always looks out for the best prices for me.	Người đại lý du lịch của tôi biết tôi thích tiết kiệm và luôn tìm cho tôi giá tốt nhất.	https://audio.tflat.vn/data/cache/images/300x225/e/c/economize1.png	https://audio.tflat.vn/audio/e/c/economize.mp3	Airlines	https://tienganhtflat.com/blog/toeic-words-airlines	2026-07-24 17:22:34.132489	4
639	outsource	verb	thuê ngoài	/ˌaʊtˈsɔːrs/	to hire another company	The firm outsourced IT services.	Công ty thuê ngoài dịch vụ CNTT.	\N	\N	Business	\N	2026-07-24 17:36:44.573617	4
919	legislation	noun	luật pháp	/ˌledʒɪˈsleɪʃn/	laws collectively	New legislation was introduced.	Luật mới đã được ban hành.	\N	\N	Legal	\N	2026-07-24 18:01:26.486905	4
322	beforehand	adv.	Có sẵn, trước	/bi'fɔ:hænd/	earlier; before something else happens	To speed up the mailing, we should prepare the labels beforehand.	Để tăng tốc gửi thư, chúng ta nên chuẩn bị nhãn trước.	https://audio.tflat.vn/data/cache/images/300x225/b/e/beforehand1.jpg	https://audio.tflat.vn/audio/b/e/beforehand.mp3	Correspondence	https://tienganhtflat.com/blog/toeic-words-correspondence	2026-07-24 17:22:34.132489	4
902	implementer	noun	người triển khai	/ˈɪmplɪmentər/	a person who carries out plans	The implementer completed the project.	Người triển khai đã hoàn thành dự án.	\N	\N	Project	\N	2026-07-24 18:01:26.486905	4
508	borrow	v.	Mượn, vay	/'bɔrou/	to take and use something that belongs to someone else, and return it to them at a later time	Can I borrow your mobile phone for a while? I have lost mine on the train.	Bạn có thể cho tôi mượn điện thoại một chút được không? Tôi vừa đánh mất điện thoại trên tàu.	https://audio.tflat.vn/data/cache/images/300x225/b/o/borrow1.png	https://audio.tflat.vn/audio/b/o/borrow.mp3	Banking	https://tienganhtflat.com/blog/toeic-words-banking	2026-07-24 17:22:34.132489	4
896	graphic	noun	đồ họa	/ˈɡræfɪk/	a visual image	The report includes several graphics.	Báo cáo bao gồm nhiều hình đồ họa.	\N	\N	Technology	\N	2026-07-24 18:01:26.486905	4
368	supply	n.	‹sự/đồ/nguồn/_› dự trữ, tiếp tế cấp	/sə'plai/	an amount of something that is provided or available to be used.	By making better use of our supply, we can avoid ordering until next month.	Bằng cách dùng tốt hơn đồ dự trữ của mình, chúng tôi khỏi phải đặt hàng cho đến tháng tới.	https://audio.tflat.vn/data/images_example/300x225/b/y/by_making__ex1_56248d157f8b9a040dc65f4c.jpg	https://audio.tflat.vn/audio/s/u/supply.mp3	Shipping	https://tienganhtflat.com/blog/toeic-words-shipping	2026-07-24 17:22:34.132489	4
126	confusion	n.	Sự bối rối, sự nhầm lẫn	/kən'fju:ʤn/	a state of not being certain about what is happening	To avoid any confusion about renting the car, Yolanda asked her travel agent to make the arrangements on her behalf.	Để tránh bất kỳ nhầm lẫn nào trong việc thuê xe, Yolanda đã yêu cầu người đại lý du lịch thực hiện dàn xếp thay mặt cho cô ấy.	https://audio.tflat.vn/data/cache/images/300x225/c/o/confusion1.png	https://audio.tflat.vn/audio/c/o/confusion.mp3	Car Rentals	https://tienganhtflat.com/blog/toeic-words-car-rentals	2026-07-24 17:22:34.132489	4
931	mutual	adjective	lẫn nhau	/ˈmjuːtʃuəl/	shared by both	The agreement provides mutual benefits.	Thỏa thuận mang lại lợi ích cho cả hai bên.	\N	\N	Business	\N	2026-07-24 18:01:26.486905	4
926	margin	noun	biên lợi nhuận	/ˈmɑːrdʒɪn/	difference between cost and price	Profit margins increased.	Biên lợi nhuận đã tăng.	\N	\N	Finance	\N	2026-07-24 18:01:26.486905	4
718	asset	noun	tài sản	/ˈæset/	something valuable owned	The company owns valuable assets.	Công ty sở hữu nhiều tài sản có giá trị.	\N	\N	Accounting	\N	2026-07-24 17:39:02.670694	4
761	correspondence	noun	thư từ	/ˌkɔːrəˈspɑːndəns/	written communication	Business correspondence should be formal.	Thư từ kinh doanh nên trang trọng.	\N	\N	Office	\N	2026-07-24 17:41:11.759836	4
303	pertinent	adj.	Thích hợp, thích đáng, có liên quan	/'pɔ:tinənt/	appropriate to a particular situation	He should speak a pertinent problem.	Anh ất nên nói thẳng vào vấn đề của anh ấy.	https://audio.tflat.vn/data/cache/images/300x225/p/e/pertinent1.png	https://audio.tflat.vn/audio/p/e/pertinent.mp3	Hospitals	https://tienganhtflat.com/blog/toeic-words-hospitals	2026-07-24 17:22:34.132489	4
238	expiration	n.	Sự mãn hạn, sự hết hạn, sự kết thúc	/,ekspaiə'reiʃn/	an ending of the period of time when an official document can be used	Have you checked the expiration date on this yogurt?	Anh đã kiểm tra hạn sử dụng của món sữa chua này chưa?	https://audio.tflat.vn/data/cache/images/300x225/e/x/expiration1.png	https://audio.tflat.vn/audio/e/x/expiration.mp3	Warranties	https://tienganhtflat.com/blog/toeic-words-warranties	2026-07-24 17:22:34.132489	4
316	debt	n.	Nợ, món nợ	/det/	a sum of money that someone owes.	The banks are worried about your increasing debt.	Các ngân hàng lo lắng về khoản nợ đang gia tăng của anh.	https://audio.tflat.vn/data/cache/images/300x225/d/e/debt1.jpg	https://audio.tflat.vn/audio/d/e/debt.mp3	Accounting	https://tienganhtflat.com/blog/toeic-words-accounting	2026-07-24 17:22:34.132489	4
274	go ahead	n.	Sự được phép (làm gì)	/ɡəʊ əˈhed /	permission for somebody to start doing something.	The manager was just waiting for the go ahead from her boss before mailing the report.	Người trưởng phòng đang chờ sự cho phép từ sếp của cô ta trước khi gửi báo cáo.	https://audio.tflat.vn/data/cache/images/300x225/g/o/go_ahead1.png	https://audio.tflat.vn/audio/g/o/go_ahead.mp3	Board Meeting & Committees	https://tienganhtflat.com/blog/toeic-words-board-meeting-committees	2026-07-24 17:22:34.132489	4
68	on track	n.	Theo dõi, đi tìm	/ɒn trak/	an experienced person who advises and helps somebody with less experience	They're on track to make record profits	Họ đi tìm cách để tạo ra lợi nhuận đột phá.	https://audio.tflat.vn/data/cache/images/300x225/o/n/on_track.jpg	https://audio.tflat.vn/audio/o/n/on_track.mp3	Hiring and Training	https://tienganhtflat.com/blog/toeic-words-hiring-and-training	2026-07-24 17:22:34.132489	4
551	realistic	adj.	Hiện thực, thực tế	/riə'listik/	accepting in a sensible way what it is actually possible to do or achieve in a particular situation	Stefano found that an accurate accounting gave him a realistic idea of his business's financial direction.	Stefano thấy rằng công việc kế toán chính xác đã cho anh một ý niệm thực tế về việc quản trị tài chính trong công việc của mình.	https://audio.tflat.vn/data/images_example/300x225/t/h/the_realis_ex2_56248d157f8b9a040dc66024.jpg	https://audio.tflat.vn/audio/r/e/realistic.mp3	Financial Statements	https://tienganhtflat.com/blog/toeic-words-financial-statements	2026-07-24 17:22:34.132489	4
217	ignore	v.	Bỏ qua, phớt lờ	/ig'nɔ:/	to pay no attention to something	He ignored all the things she said.	Anh ấy phớt lờ tất cả những gì cô ấy nói.	https://audio.tflat.vn/data/cache/images/300x225/i/g/ignore1.jpg	https://audio.tflat.vn/audio/i/g/ignore.mp3	Computers and the Internet	https://tienganhtflat.com/blog/toeic-words-computers-and-the-internet	2026-07-24 17:22:34.132489	4
721	equity	noun	vốn chủ sở hữu	/ˈekwəti/	ownership interest	Investors increased their equity.	Các nhà đầu tư đã tăng vốn chủ sở hữu.	\N	\N	Finance	\N	2026-07-24 17:39:02.670694	4
72	training	n.	‹sự› rèn luyện, tập luyện, huấn luyện, dạy dỗ, đào tạo	/'treiniɳ/	the process of learning the skills that you need to do a job	The new hire received such good training that, within a week, she was as productive as the other workers.	Người nhân viên mới nhận được sự huấn luyện tốt đến nỗi, trong vòng một tuần, cô đã có năng suất như là các công nhân khác.	https://audio.tflat.vn/data/cache/images/300x225/t/r/training1.png	https://audio.tflat.vn/audio/t/r/training.mp3	Hiring and Training	https://tienganhtflat.com/blog/toeic-words-hiring-and-training	2026-07-24 17:22:34.132489	4
50	affordable	adj.	Có đủ điều kiện tiền bạc	/əˈfɔːdəbəl/	cheap enough for most people to buy	The company's first priority was to find an affordable phone system.	Ưu tiên trước hết của công ty là tìm một hệ thống điện thoại có đủ khả năng (hoạt động).	https://audio.tflat.vn/data/cache/images/300x225/a/f/affordable1.jpg	https://audio.tflat.vn/audio/a/f/affordable.mp3	Office Technology	https://tienganhtflat.com/blog/toeic-words-office-technology	2026-07-24 17:22:34.132489	4
385	effective	adj.	Có hiệu quả, có tác dụng	/ɪˈfektɪv/	producing the result that is wanted or intended	Howard was pleased to find that the diet recommended by his doctor was quite effective.	Howard đã đã cảm thấy hài lòng khi chế độ ăn kiêng được bác sĩ dặn đã hoàn toàn có hiệu quả.	https://audio.tflat.vn/data/cache/images/300x225/e/f/effective1.jpg	https://audio.tflat.vn/audio/e/f/effective.mp3	Doctor's Office	https://tienganhtflat.com/blog/toeic-words-doctor-s-office	2026-07-24 17:22:34.132489	4
115	criticism	n.	Sự phê bình, chỉ trích	/'kritisizm/	the act of expressing disapproval of someone or something and opinions about their faults or bad qualities	The revered artist's criticism of the piece was particularly insightful.	Lời phê bình về tác phẩm của một họa sĩ được kính trọng là đặc biệt sâu sắc.	https://audio.tflat.vn/data/cache/images/300x225/c/r/criticism1.png	https://audio.tflat.vn/audio/c/r/criticism.mp3	Museums	https://tienganhtflat.com/blog/toeic-words-museums	2026-07-24 17:22:34.132489	4
54	durable	adj.	Bền, lâu	/ˈdjʊərəbl/	likely to last for a long time	These chairs are more durable than the first ones we looked at.	Những cái ghế này bền hơn nhiều những cái ghế đầu tiên mà chúng ta đã thấy.	https://audio.tflat.vn/data/images_example/300x225/t/h/these_chai_ex1_56248d157f8b9a040dc65e1c.jpg	https://audio.tflat.vn/audio/d/u/durable.mp3	Office Technology	https://tienganhtflat.com/blog/toeic-words-office-technology	2026-07-24 17:22:34.132489	4
924	literacy	noun	khả năng đọc viết	/ˈlɪtərəsi/	ability to read and write	Digital literacy is essential.	Kỹ năng số rất cần thiết.	\N	\N	Education	\N	2026-07-24 18:01:26.486905	4
313	budget	n.	Ngân sách, ngân quỹ	/ˈbʌdʒɪt/	the money that is available to a person or an organization and a plan of how it will be spent over a period of time.	The company will have to prepare bigger budget for this department next year.	Công ty sẽ phải dự thảo ngân sách nhiều hơn cho bộ phận này vào năm sau.	https://audio.tflat.vn/data/cache/images/300x225/b/u/budget1.jpg	https://audio.tflat.vn/audio/b/u/budget.mp3	Accounting	https://tienganhtflat.com/blog/toeic-words-accounting	2026-07-24 17:22:34.132489	4
707	retailer	noun	nhà bán lẻ	/ˈriːteɪlər/	a business selling goods	The retailer launched a campaign.	Nhà bán lẻ đã triển khai chiến dịch.	\N	\N	Retail	\N	2026-07-24 17:39:02.670694	4
633	implement	verb	triển khai	/ˈɪmplɪment/	to put into action	The company implemented a new policy.	Công ty đã triển khai chính sách mới.	\N	\N	Business	\N	2026-07-24 17:36:44.573617	4
649	affordable	adjective	giá phải chăng	/əˈfɔːrdəbl/	reasonably priced	The apartments are affordable.	Các căn hộ có giá phải chăng.	\N	\N	Business	\N	2026-07-24 17:36:44.573617	4
251	experiment	n.	Cuộc thí nghiệm	/ɪkˈsperɪmənt/	a scientific test that is done in order to study what happens and to gain new knowledge	Some people believe that experiments on animals should be banned.	Một số người cho rằng những thí nghiệm trên động vật nên bị cấm.	https://audio.tflat.vn/data/cache/images/300x225/e/x/experiment2.png	https://audio.tflat.vn/audio/e/x/experiment.mp3	Product Development	https://tienganhtflat.com/blog/toeic-words-product-development	2026-07-24 17:22:34.132489	4
183	verbally	adv.	Bằng miệng, bằng lời nói	/'və:bəli/	in spoken words and not in writing or actions	The guarantee was made only verbally.	Sự bảo đảm được cam kết chỉ bằng lời.	https://audio.tflat.vn/data/cache/images/300x225/v/e/verbally1.jpg	https://audio.tflat.vn/audio/v/e/verbally.mp3	Office Procedures	https://tienganhtflat.com/blog/toeic-words-office-procedures	2026-07-24 17:22:34.132489	4
451	order	n.	Đơn đặt hàng	/'ɔ:də/	a request to make or supply goods	The customer placed an order for ten new chairs.	Người khách hàng đưa đơn đặt hàng 10 cái ghế mới.	https://audio.tflat.vn/data/images_example/300x225/t/h/the_custom_ex1_56248cf37f8b9af80c011edd.jpg	https://audio.tflat.vn/audio/o/r/order.mp3	Invoice	https://tienganhtflat.com/blog/toeic-words-invoice	2026-07-24 17:22:34.132489	5
546	forecast	v.	Dự báo, dự đoán, đoán trước	/fɔ:'kɑ:st/	to predict or to estimate (a future event or trend)	Analysts forecast a strong economic outlook.	Các nhà phân tích dự báo một viễn cảnh kinh tế sung sức.	https://audio.tflat.vn/data/cache/images/300x225/f/o/forecast1.png	https://audio.tflat.vn/audio/f/o/forecast.mp3	Financial Statements	https://tienganhtflat.com/blog/toeic-words-financial-statements	2026-07-24 17:22:34.132489	4
262	evident	adj.	Hiển nhiên, rõ ràng	/'evidənt/	clear; easily seen	The presence of a wisdom tooth was not evident until the dentist started to examine the patient.	Sự có mặt của cái răng khôn thì không rõ ràng cho đến khi nha sĩ bắt đầu khám bệnh nhân.	https://audio.tflat.vn/data/cache/images/300x225/e/v/evident1.png	https://audio.tflat.vn/audio/e/v/evident.mp3	Dentist's Office	https://tienganhtflat.com/blog/toeic-words-dentist-s-office	2026-07-24 17:22:34.132489	4
520	attitude	n.	Thái độ	/'ætitju:d/	the way that you think and feel about somebody/something.	Each person has his or her own attitude towards life.	Mỗi người có thái độ sống riêng.	https://audio.tflat.vn/data/cache/images/300x225/a/t/attitude1.jpg	https://audio.tflat.vn/audio/a/t/attitude.mp3	Investment	https://tienganhtflat.com/blog/toeic-words-investment	2026-07-24 17:22:34.132489	4
468	train	n.	Tàu hỏa	/treɪn/	\N	We love travelling by train.	Chúng tôi thích đi du lịch bằng tàu hỏa.	https://audio.tflat.vn/data/cache/images/300x225/t/r/train2.jpg	https://audio.tflat.vn/audio/t/r/train.mp3	Trains	https://tienganhtflat.com/blog/toeic-words-trains	2026-07-24 17:22:34.132489	4
631	franchise	noun	nhượng quyền	/ˈfræntʃaɪz/	a business operating under a brand	They opened a restaurant franchise.	Họ mở một cửa hàng nhượng quyền.	\N	\N	Business	\N	2026-07-24 17:36:44.573617	4
574	reflection	n.	‹sự› phản chiếu, phản xạ, hình ảnh	/rɪˈflekʃn/	a sign that shows the state or nature of something	She saw her reflection in the mirror.	Cô ấy nhìn ảnh của mình ở trong gương.	https://audio.tflat.vn/data/cache/images/300x225/r/e/reflection2.jpg	https://audio.tflat.vn/audio/r/e/reflection.mp3	Inventory	https://tienganhtflat.com/blog/toeic-words-inventory	2026-07-24 17:22:34.132489	5
824	maintain	verb	duy trì	/meɪnˈteɪn/	to keep in good condition	Maintain accurate records.	Hãy duy trì hồ sơ chính xác.	\N	\N	Office	\N	2026-07-24 17:44:13.10333	5
486	replace	v.	Thay thế	/ri'pleis/	to be used instead of something / somebody else	My father replaced the old plug with a new one.	Ba tôi thay thế cái nắp cũ bằng cái mới.	https://audio.tflat.vn/data/cache/images/300x225/r/e/replace1.png	https://audio.tflat.vn/audio/r/e/replace.mp3	Electronics	https://tienganhtflat.com/blog/toeic-words-electronics-3	2026-07-24 17:22:34.132489	5
329	petition	n.	 đơn kiến nghị, đơn thỉnh cầu	\N	a written document signed by a large people that asks somebody to change something	The petition was photocopied and distributed to workers who will collect the neccessary signatures	Đơn kiến nghị được photocopy và phân phát đến những công nhân nào sẽ thu thập chữ ký cần thiết.	https://audio.tflat.vn/data/cache/images/300x225/p/e/petition-n1.jpg	https://audio.tflat.vn/audio/p/e/petition-n.mp3	Correspondence	https://tienganhtflat.com/blog/toeic-words-correspondence	2026-07-24 17:22:34.132489	5
681	distributor	noun	nhà phân phối	/dɪˈstrɪbjətər/	a company supplying goods	The distributor covers Asia.	Nhà phân phối phụ trách khu vực châu Á.	\N	\N	Trade	\N	2026-07-24 17:39:02.670694	5
914	interruption	noun	sự gián đoạn	/ˌɪntəˈrʌpʃn/	a temporary stop	Power interruption affected production.	Việc mất điện làm gián đoạn sản xuất.	\N	\N	Manufacturing	\N	2026-07-24 18:01:26.486905	5
112	acquire	v.	Đạt được, thu được	/ə'kwaiə/	to gain something by your own efforts	He has acquired a good knowledge of English.	Cậu ấy đã đạt được một kiến thức tốt về tiếng Anh.	https://audio.tflat.vn/data/cache/images/300x225/a/c/acquire1.png	https://audio.tflat.vn/audio/a/c/acquire.mp3	Museums	https://tienganhtflat.com/blog/toeic-words-museums	2026-07-24 17:22:34.132489	5
717	yield	verb	mang lại	/jiːld/	to produce or generate	The investment yielded profits.	Khoản đầu tư đã mang lại lợi nhuận.	\N	\N	Finance	\N	2026-07-24 17:39:02.670694	5
12	raise	v.	Nâng lên, đưa lên	/reiz/	n: an increase in salary; v: to move up	The government plans to raise taxes.	Chính phủ đang có kế hoạch tăng mức thuế.	https://audio.tflat.vn/data/cache/images/300x225/r/a/raise1.png	https://audio.tflat.vn/audio/r/a/raise.mp3	Salaries & Benefits	https://tienganhtflat.com/blog/toeic-words-salaries-benefits	2026-07-24 17:22:34.132489	5
129	intend	v.	Có ý định, có mục đích	/in'tend/	to have a plan, result, or purpose in your mind	Do you intend to return the car to this location or to another location?	Anh định quay xe về chỗ này hay là chạy đến chỗ khác?	https://audio.tflat.vn/data/cache/images/300x225/i/n/intend1.jpg	https://audio.tflat.vn/audio/i/n/intend.mp3	Car Rentals	https://tienganhtflat.com/blog/toeic-words-car-rentals	2026-07-24 17:22:34.132489	5
321	assemble	v.	Thu thập, tập hợp, lắp ráp	/ə'sembl/	to bring people or things together as a group	All the students were asked to assemble in the main hall.	Tất cả các sinh viên được yêu cầu tập hợp ở hội trường chính.	https://audio.tflat.vn/data/cache/images/300x225/a/s/assemble1.png	https://audio.tflat.vn/audio/a/s/assemble.mp3	Correspondence	https://tienganhtflat.com/blog/toeic-words-correspondence	2026-07-24 17:22:34.132489	5
737	attain	verb	đạt được	/əˈteɪn/	to achieve	She attained her sales target.	Cô ấy đã đạt chỉ tiêu doanh số.	\N	\N	Business	\N	2026-07-24 17:41:11.759836	5
323	complication	n.	Sự phức tạp, sự rắc rối	/ˌkɑːmplɪˈkeɪʃn/	a complex combination of elements or things.	She will have to spend two more days in the hospital due to complications during the surgery.	Cô sẽ phải mất hai ngày nữa trong bệnh viện do biến chứng trong khi phẫu thuật.	https://audio.tflat.vn/data/cache/images/300x225/c/o/complication.jpg	https://audio.tflat.vn/audio/c/o/complication.mp3	Correspondence	https://tienganhtflat.com/blog/toeic-words-correspondence	2026-07-24 17:22:34.132489	5
905	incentivize	verb	khuyến khích	/ɪnˈsentɪvaɪz/	to motivate with rewards	The company incentivized employees.	Công ty đã khuyến khích nhân viên bằng phần thưởng.	\N	\N	HR	\N	2026-07-24 18:01:26.486905	5
336	elegance	n.	Tính thanh lịch, tính tao nhã	/'eligəns/	attractive and showing a good sense of style	The elegance of the restaurant made it a pleasant place to eat.	Sự thanh lịch của nhà hàng khiến nó là một nơi thú vị để ăn uống.	https://audio.tflat.vn/data/cache/images/300x225/e/l/elegance1.jpg	https://audio.tflat.vn/audio/e/l/elegance.mp3	Ordering Lunch	https://tienganhtflat.com/blog/toeic-words-ordering-lunch	2026-07-24 17:22:34.132489	5
830	abolish	verb	bãi bỏ	/əˈbɑːlɪʃ/	to officially end something	The company abolished outdated policies.	Công ty đã bãi bỏ các chính sách lỗi thời.	\N	\N	Business	\N	2026-07-24 17:59:36.547339	5
738	attendee	noun	người tham dự	/əˌtenˈdiː/	a person attending	All attendees received certificates.	Tất cả người tham dự đều nhận chứng chỉ.	\N	\N	Conference	\N	2026-07-24 17:41:11.759836	5
158	present	v.	Đưa ra, bày tỏ, giới thiệu	/pri'zent/	to give something to somebody, especially formally at a ceremony	He presented the report to his colleagues at the meeting.	Anh ta đã trình bày bản báo cáo của mình với đồng nghiệp ở cuộc họp.	https://audio.tflat.vn/data/images_example/300x225/h/e/he_present_ex1_56248cf47f8b9af80c011f8d.jpg	https://audio.tflat.vn/audio/p/r/present.mp3	Apply and Interviewing	https://tienganhtflat.com/blog/toeic-words-apply-and-interviewing	2026-07-24 17:22:34.132489	5
669	backlog	noun	công việc tồn đọng	/ˈbæklɔːɡ/	unfinished work	We need to clear the backlog.	Chúng ta cần giải quyết công việc tồn đọng.	\N	\N	Office	\N	2026-07-24 17:39:02.670694	5
586	limit	n.	Giới hạn, hết hạn dùng	/'limit/	a point at which something stops being possible or existing	We were reaching the limits of civilization.	Chúng tôi đã đạt đến giới hạn của nền văn minh.	https://audio.tflat.vn/data/cache/images/300x225/l/i/limit1.png	https://audio.tflat.vn/audio/l/i/limit.mp3	Pharmacy	https://tienganhtflat.com/blog/toeic-words-pharmacy	2026-07-24 17:22:34.132489	5
610	merit	n.	Công lao, công trạng	/'merit/	the quality of being good and of deserving praise	Employees are evaluated on their merit and not on seniority.	Nhân viên được đánh giá theo công lao của họ và không theo thâm niên.	https://audio.tflat.vn/data/cache/images/300x225/m/e/merit1.jpg	https://audio.tflat.vn/audio/m/e/merit.mp3	Promotions, Pensions & Award	https://tienganhtflat.com/blog/toeic-words-promotions-pensions-award	2026-07-24 17:22:34.132489	5
749	commence	verb	bắt đầu	/kəˈmens/	to begin	Construction commenced in June.	Việc xây dựng bắt đầu vào tháng Sáu.	\N	\N	Construction	\N	2026-07-24 17:41:11.759836	5
452	promptly	adv.	Mau lẹ, nhanh chóng, ngay lập tức, tức thời	/ˈprɒmptli/	without delay	We always reply promptly to customers' letters.	Chúng tôi luôn hồi âm nhanh chóng các lá thư của khách hàng.	https://audio.tflat.vn/data/cache/images/300x225/p/r/promptly1.png	https://audio.tflat.vn/audio/p/r/promptly.mp3	Invoice	https://tienganhtflat.com/blog/toeic-words-invoice	2026-07-24 17:22:34.132489	5
285	constantly	adj.	Luôn luôn, liên tục, liên miên	/'kɔnstəntli/	all the time; repeatedly	The company is constantly looking for highly trained employees.	Công ty không ngừng tìm kiếm những nhân viên được đào tạo tốt.	https://audio.tflat.vn/data/cache/images/300x225/c/o/constantly1.jpg	https://audio.tflat.vn/audio/c/o/constantly.mp3	Media	https://tienganhtflat.com/blog/toeic-words-media	2026-07-24 17:22:34.132489	5
172	appreciation	n.	Sự cảm kích	/ə,pri:ʃi'eiʃn/	pleasure that you have when you recognize good qualities	She shows little appreciation of good music.	Cô ấy cho thấy một chút sự đánh giá cao về thẩm mỹ âm nhạc tốt.	https://audio.tflat.vn/data/cache/images/300x225/a/p/appreciation2.jpg	https://audio.tflat.vn/audio/a/p/appreciation.mp3	Office Procedures	https://tienganhtflat.com/blog/toeic-words-office-procedures	2026-07-24 17:22:34.132489	5
36	wrinkle	n.	‹vếp/nếp› nhăn, nhàu	/'riɳkl/	a line or small fold in your skin, especially on your face, that forms as you get older	A wrinkle in the finish can be repaired more economically before a sale than after.	Một vết nhăn trong (sản phẩm) hoàn chỉnh thì có thể sửa chữa trước khi bán có giá hơn là sau đó.	https://audio.tflat.vn/data/cache/images/300x225/w/r/wrinkle2.png	https://audio.tflat.vn/audio/w/r/wrinkle.mp3	Quality Control	https://tienganhtflat.com/blog/toeic-words-quality-control	2026-07-24 17:22:34.132489	5
532	abide by	v.	Tôn trọng, tuân theo, giữ (lời)	/ə'baid/	to accept and act according to a law, an agreement	The two parties agreed to abide by the judge's decision.	Hai bên đã đồng ý tuân theo quyết định của tòa án.	https://audio.tflat.vn/data/cache/images/300x225/a/b/abide_by.jpg	https://audio.tflat.vn/audio/a/b/abide_by.mp3	Contracts	https://tienganhtflat.com/blog/toeic-words-contracts	2026-07-24 17:22:34.132489	5
69	reject	n.	Đồ thừa, đồ bỏ, phế phẩm	/'ri:dʤekt/	to refuse to accept or consider something	We put the rejects in this box.	Chúng tôi để những phế phẩm vào trong hộp này.	https://audio.tflat.vn/data/images_example/300x225/w/e/we_put_the_ex1_56248d157f8b9a040dc65eb8.jpg	https://audio.tflat.vn/audio/r/e/reject.mp3	Hiring and Training	https://tienganhtflat.com/blog/toeic-words-hiring-and-training	2026-07-24 17:22:34.132489	5
394	assist	v.	Giúp đỡ, có mặt	/ə'sist/	to help someone to do something	Bonnie hired a secretary to assist her with the many details of the event.	Bonnie đã thuê một thư ký để trợ giúp cô về rất nhiều chi tiết của sự kiện.	https://audio.tflat.vn/data/cache/images/300x225/a/s/assist1.png	https://audio.tflat.vn/audio/a/s/assist.mp3	Events	https://tienganhtflat.com/blog/toeic-words-events	2026-07-24 17:22:34.132489	5
38	allow	v.	Cho phép, chấp nhận	/ə'lau/	to let someone or something	My insurance does not allow choosing my own hospital.	Hợp đồng bảo hiểm của tôi không cho lựa chọn bệnh viện theo ý riêng của tôi. 	https://audio.tflat.vn/data/cache/images/300x225/a/l/allow1.jpg	https://audio.tflat.vn/audio/a/l/allow.mp3	Health	https://tienganhtflat.com/blog/toeic-words-health	2026-07-24 17:22:34.132489	5
804	dedication	noun	sự cống hiến	/ˌdedɪˈkeɪʃn/	devotion to work	Her dedication inspired everyone.	Sự cống hiến của cô ấy truyền cảm hứng cho mọi người.	\N	\N	Human Resources	\N	2026-07-24 17:44:13.10333	5
106	penalty	n.	Khoản tiền phạt	/'penlti/	a punishment for breaking a law, rule, or contract	The penalty for travelling without a ticket is $200.	Hình phạt cho việc đi du lịch mà không có vé là 200 đô.	https://audio.tflat.vn/data/cache/images/300x225/p/e/penalty-n1.png	https://audio.tflat.vn/audio/p/e/penalty-n.mp3	Taxes	https://tienganhtflat.com/blog/toeic-words-taxes	2026-07-24 17:22:34.132489	5
786	approve	verb	phê duyệt	/əˈpruːv/	to officially accept	The budget was approved.	Ngân sách đã được phê duyệt.	\N	\N	Management	\N	2026-07-24 17:44:13.10333	5
93	fad	n.	Mốt nhất thời 	/fæd/	something that people are interested in for only a short period of time.	The mini dress was a fad once thought to be finished, but now it is making a comeback.	Váy ngắn là mốt tạm thời mỗi khi ý tưởng bị hết, nhưng hiện giờ nó đang quay trở lại.	https://audio.tflat.vn/data/cache/images/300x225/f/a/fad1.png	https://audio.tflat.vn/audio/f/a/fad.mp3	Marketing	https://tienganhtflat.com/blog/toeic-words-marketing	2026-07-24 17:22:34.132489	5
578	tedious	adj.	Chán ngắt, tẻ nhạt, nhạt nhẽo, buồn tẻ	/'ti:djəs/	lasting or taking too long and not interesting	Counting merchandise all weekend is the most tedious job I can imagine.	Kiểm đếm hàng suốt kỳ nghỉ cuối tuần là một công việc tẻ nhạt nhất tôi có thể hình dung.	https://audio.tflat.vn/data/cache/images/300x225/t/e/tedious1.png	https://audio.tflat.vn/audio/t/e/tedious.mp3	Inventory	https://tienganhtflat.com/blog/toeic-words-inventory	2026-07-24 17:22:34.132489	5
832	abundant	adjective	dồi dào	/əˈbʌndənt/	available in large quantities	The region has abundant resources.	Khu vực này có nguồn tài nguyên dồi dào.	\N	\N	Business	\N	2026-07-24 17:59:36.547339	5
393	event	n.	Sự kiện	/ɪˈvent/	\N	What is the event in the Sports programme today?	Sự kiện trong chương trình thể thao hôm nay là gì?	https://audio.tflat.vn/data/images_example/300x225/w/h/what_is_th_ex1_56248cf47f8b9af80c011f5d.png	https://audio.tflat.vn/audio/e/v/event.mp3	Events	https://tienganhtflat.com/blog/toeic-words-events	2026-07-24 17:22:34.132489	5
928	merit	noun	giá trị	/ˈmerɪt/	quality deserving praise	The proposal has merit.	Đề xuất này có giá trị.	\N	\N	Business	\N	2026-07-24 18:01:26.486905	5
177	expose	v.	Phơi bày, bộc lộ	/iks'pouz/	to show something that is usually hidden	He did not want to expose his fears and insecurity to anyone.	Anh ấy không muốn để lộ sự sợ hãi và bất an của mình cho bất cứ ai.	https://audio.tflat.vn/data/images_example/300x225/h/e/he_did_not_ex1_56248d157f8b9a040dc65e3c.png	https://audio.tflat.vn/audio/e/x/expose.mp3	Office Procedures	https://tienganhtflat.com/blog/toeic-words-office-procedures	2026-07-24 17:22:34.132489	5
35	uniformly	adv.	Đồng đều thống nhất, không thay đổi	/ˈjuːnɪfɔːmli/	the same in all parts and at all times	The principles were applied uniformly across all the departments.	Các nguyên tắc được áp dụng thống nhất trên tất cả các phòng ban.	https://audio.tflat.vn/data/cache/images/300x225/u/n/uniformly2.png	https://audio.tflat.vn/audio/u/n/uniformly.mp3	Quality Control	https://tienganhtflat.com/blog/toeic-words-quality-control	2026-07-24 17:22:34.132489	5
689	guideline	noun	hướng dẫn	/ˈɡaɪdlaɪn/	an official instruction	Please follow the guidelines.	Vui lòng tuân theo hướng dẫn.	\N	\N	Office	\N	2026-07-24 17:39:02.670694	5
754	confidential	adjective	bảo mật	/ˌkɑːnfɪˈdenʃl/	private and secret	This document is confidential.	Tài liệu này là bảo mật.	\N	\N	Office	\N	2026-07-24 17:41:11.759836	5
678	courier	noun	người giao hàng	/ˈkʊriər/	a delivery service	The courier delivered the package.	Người giao hàng đã giao bưu kiện.	\N	\N	Logistics	\N	2026-07-24 17:39:02.670694	5
865	deliberate	verb	cân nhắc	/dɪˈlɪbəreɪt/	to consider carefully	The committee deliberated for hours.	Ủy ban đã cân nhắc trong nhiều giờ.	\N	\N	Management	\N	2026-07-24 17:59:36.547339	5
872	disposal	noun	xử lý	/dɪˈspoʊzl/	the act of getting rid of	Waste disposal is regulated.	Việc xử lý chất thải được quản lý.	\N	\N	Environment	\N	2026-07-24 17:59:36.547339	5
114	collection	n.	Sự sưu tầm, bộ sưu tập	/kəˈlekʃn/	a group of objects, often of the same sort, that have been collected	He won the fashion award for the best collection.	Ông ấy đã giành giải thưởng thời trang cho bộ sưu tập tốt nhất.	https://audio.tflat.vn/data/cache/images/300x225/c/o/collection1.png	https://audio.tflat.vn/audio/c/o/collection.mp3	Museums	https://tienganhtflat.com/blog/toeic-words-museums	2026-07-24 17:22:34.132489	5
94	inspiration	n.	Cảm hứng	/,inspə'reiʃn/	a thing or person that arouses a feeling	Nature is a source of inspiration for inventors.	Thiên nhiên là nguồn cảm hứng cho các nhà phát minh.	https://audio.tflat.vn/data/cache/images/300x225/i/n/inspiration2.jpg	https://audio.tflat.vn/audio/i/n/inspiration.mp3	Marketing	https://tienganhtflat.com/blog/toeic-words-marketing	2026-07-24 17:22:34.132489	5
634	incentive	noun	khuyến khích	/ɪnˈsentɪv/	something motivating	Employees received performance incentives.	Nhân viên nhận được khoản khuyến khích.	\N	\N	Human Resources	\N	2026-07-24 17:36:44.573617	5
98	satisfaction	n.	Sự hài lòng, sự thỏa mãn,	/,sætis'fækʃn/	the good feeling that you have when you have achieved something	Your satisfaction is guaranteed or you'll get your money back.	Sự hài lòng của bạn được bảo đảm, hoặc là bạn sẽ được nhận lại tiền của mình.	https://audio.tflat.vn/data/cache/images/300x225/s/a/satisfaction2.jpg	https://audio.tflat.vn/audio/s/a/satisfaction.mp3	Marketing	https://tienganhtflat.com/blog/toeic-words-marketing	2026-07-24 17:22:34.132489	5
519	aggressively	adv.	Hung hăng, hùng hổ	/əˈɡresɪv/	acting with force and determination in order to succeed.	His ideas were not well received because he spoke so aggressively.	Ý kiến của anh ta không được đón nhận nhiều vì anh ta nói quá hùng hổ.	https://audio.tflat.vn/data/cache/images/300x225/a/g/aggressively1.jpg	https://audio.tflat.vn/audio/a/g/aggressively.mp3	Investment	https://tienganhtflat.com/blog/toeic-words-investment	2026-07-24 17:22:34.132489	5
891	foundation	noun	nền tảng	/faʊnˈdeɪʃn/	a basic structure	Trust is the foundation of teamwork.	Niềm tin là nền tảng của làm việc nhóm.	\N	\N	Business	\N	2026-07-24 18:01:26.486905	5
191	influence	v.	Ảnh hưởng 	/ˈɪnfluəns/	\N	My father was the biggest influence on my character.	Bố tôi là người ảnh hưởng lớn nhất tới tính cách tôi.	https://audio.tflat.vn/data/cache/images/300x225/i/n/influence-v1.jpg	https://audio.tflat.vn/audio/i/n/influence-v.mp3	Movies	https://tienganhtflat.com/blog/toeic-words-movies	2026-07-24 17:22:34.132489	5
802	coverage	noun	phạm vi bảo hiểm	/ˈkʌvərɪdʒ/	extent of protection	The insurance coverage is sufficient.	Phạm vi bảo hiểm là đầy đủ.	\N	\N	Insurance	\N	2026-07-24 17:44:13.10333	5
480	remote	adj.	Xa xôi, hẻo lánh	/rɪˈməʊt/	far away from places where other people live	We took the train out of the city and found a remote hotel in the country for the weekend.	Chúng tôi đón xe lửa ra khỏi thành phố và tìm một khách sạn cách biệt ở miền quê vào dịp cuối tuần.	https://audio.tflat.vn/data/cache/images/300x225/r/e/remote2.png	https://audio.tflat.vn/audio/r/e/remote.mp3	Trains	https://tienganhtflat.com/blog/toeic-words-trains	2026-07-24 17:22:34.132489	5
702	priority	noun	ưu tiên	/praɪˈɔːrəti/	something most important	Safety is our priority.	An toàn là ưu tiên hàng đầu.	\N	\N	Office	\N	2026-07-24 17:39:02.670694	5
854	confer	verb	tham khảo ý kiến	/kənˈfɜːr/	to discuss	The managers conferred before deciding.	Các quản lý đã thảo luận trước khi quyết định.	\N	\N	Management	\N	2026-07-24 17:59:36.547339	5
245	variety	n.	Sự đa dạng, trạng thái muôn màu	/və'raiəti/	different sorts of the same thing	Thanks to the development of the media, people have more chances to see a variety of programs.	Nhờ sự phát triển của các phương tiện truyền thông, người dân có nhiều cơ hội hơn để xem một loạt các chương trình.	https://audio.tflat.vn/data/cache/images/300x225/v/a/variety1.jpg	https://audio.tflat.vn/audio/v/a/variety.mp3	Warranties	https://tienganhtflat.com/blog/toeic-words-warranties	2026-07-24 17:22:34.132489	5
250	decade	n.	Thập kỷ, thời kỳ mười năm	/ˈdekeɪd/	a period of ten years, especially a period such as 1910–1919 or 1990–1999	She has been very famous for a few decades.	Cô ấy đã rất nổi tiếng trong một vài thập kỷ.	https://audio.tflat.vn/data/cache/images/300x225/d/e/decade2.png	https://audio.tflat.vn/audio/d/e/decade.mp3	Product Development	https://tienganhtflat.com/blog/toeic-words-product-development	2026-07-24 17:22:34.132489	5
784	amendment	noun	sự sửa đổi	/əˈmendmənt/	a change to a document	The amendment was approved.	Bản sửa đổi đã được phê duyệt.	\N	\N	Legal	\N	2026-07-24 17:44:13.10333	5
410	come up with	\N	Đưa ra, phát hiện, khám phá, ý định	/kʌm ʌp wɪð/	to plan, to invent	In order for that small business to succeed, it needs to come up with a new strategy.	Để những doanh nghiệp nhỏ có thể thành công thì nó cần đưa ra một chiến lược mới.	https://audio.tflat.vn/data/cache/images/300x225/c/o/come_up_with2.jpg	https://audio.tflat.vn/audio/c/o/come_up_with.mp3	Job Ads & Recruitment	https://tienganhtflat.com/blog/toeic-words-job-ads-recruitment	2026-07-24 17:22:34.132489	5
263	habit	n.	Thói quen	/ˈhæbɪt/	a thing that you do often and almost without thinking	Negative thinking can become a habit.	Suy nghĩ tiêu cực có thể trở thành một thói quen.	https://audio.tflat.vn/data/cache/images/300x225/h/a/habit1.png	https://audio.tflat.vn/audio/h/a/habit.mp3	Dentist's Office	https://tienganhtflat.com/blog/toeic-words-dentist-s-office	2026-07-24 17:22:34.132489	5
325	express	adj.	Nhanh, hỏa tốc, tốc hành.	/iks'pres/	fast and direct	It's important that this document be there tomorrow, so please send it express mail.	Việc tài liệu này phải có ở chổ ngày mai vì nó rất quan trọng, do đó nên hãy gửi thư chuyển phát nhanh.	https://audio.tflat.vn/data/cache/images/300x225/e/x/express1.png	https://audio.tflat.vn/audio/e/x/express.mp3	Correspondence	https://tienganhtflat.com/blog/toeic-words-correspondence	2026-07-24 17:22:34.132489	5
11	be aware of	v.	Am hiểu, biết	/bi: ə'weə əv/	to be conscious of	Are you aware of the new employee's past work history?	Anh có biết về lịch sử làm việc trước đây của người nhân viên mới không?	https://audio.tflat.vn/data/cache/images/300x225/b/e/be_aware_of.jpg	https://audio.tflat.vn/audio/b/e/be_aware_of.mp3	Salaries & Benefits	https://tienganhtflat.com/blog/toeic-words-salaries-benefits	2026-07-24 17:22:34.132489	5
758	contaminate	verb	làm ô nhiễm	/kənˈtæmɪneɪt/	to make impure	The chemicals contaminated the water.	Hóa chất làm ô nhiễm nguồn nước.	\N	\N	Environment	\N	2026-07-24 17:41:11.759836	5
828	persuade	verb	thuyết phục	/pərˈsweɪd/	to convince	She persuaded the customer.	Cô ấy đã thuyết phục khách hàng.	\N	\N	Sales	\N	2026-07-24 17:44:13.10333	5
876	endorsement	noun	sự chứng thực	/ɪnˈdɔːrsmənt/	official approval	The product received endorsement.	Sản phẩm đã nhận được sự chứng thực.	\N	\N	Marketing	\N	2026-07-24 17:59:36.547339	5
525	long-term	adj.	Dài hạn, dài ngày, lâu dài	/'lɔɳtə:m/	involing long time period.	The CEO's long-term goal was to increase the return on investment.	Mục tiêu dài hạn của giám đốc điều hành (CEO) là gia tăng tiền lãi thu về từ việc đầu tư.	https://audio.tflat.vn/data/cache/images/300x225/l/o/long-term1.png	https://audio.tflat.vn/audio/l/o/long-term.mp3	Investment	https://tienganhtflat.com/blog/toeic-words-investment	2026-07-24 17:22:34.132489	5
300	identify	v.	Nhận diện, nhận biết, xác định	/aɪˈdentɪfaɪ/	to recognize someone or something and be able to say who or what they are	The tiny bracelets identified each baby in the nursery.	Những cái vòng tay bé xíu nhận diện từng em bé ở trong phòng dành riêng cho trẻ nhỏ.	https://audio.tflat.vn/data/images_example/300x225/t/h/the_tiny_b_ex1_56248cf57f8b9af80c01238d.jpg	https://audio.tflat.vn/audio/i/d/identify.mp3	Hospitals	https://tienganhtflat.com/blog/toeic-words-hospitals	2026-07-24 17:22:34.132489	5
720	dividend	noun	cổ tức	/ˈdɪvɪdend/	profit paid to shareholders	The dividend was paid quarterly.	Cổ tức được chi trả hàng quý.	\N	\N	Finance	\N	2026-07-24 17:39:02.670694	5
936	occupy	verb	chiếm	/ˈɑːkjupaɪ/	to take up space	The boxes occupy too much space.	Các thùng hàng chiếm quá nhiều diện tích.	\N	\N	Warehouse	\N	2026-07-24 18:01:26.486905	5
351	expense	n.	Chi phí	/iks'pens/	the money that you spend on something	Buying a new house needs a lot of expense.	Mua một ngôi nhà mới cần rất nhiều chi phí.	https://audio.tflat.vn/data/cache/images/300x225/e/x/expense1.png	https://audio.tflat.vn/audio/e/x/expense.mp3	Airlines	https://tienganhtflat.com/blog/toeic-words-airlines	2026-07-24 17:22:34.132489	5
807	efficiently	adverb	một cách hiệu quả	/ɪˈfɪʃəntli/	in an efficient way	The system operates efficiently.	Hệ thống hoạt động hiệu quả.	\N	\N	Business	\N	2026-07-24 17:44:13.10333	5
319	reconcile	v.	Chỉnh lý, làm cho phù hợp/nhất trí, hòa giải	/'rekənsail/	to find an acceptable way of dealing with two or more ideas, needs, etc. that seem to be opposed to each other.	The accountant found the error when she reconcile the account.	Nhân viên kế toán tìm ra lỗi khi cô ấy chỉnh lý tài khoản (sửa lại tài khoản cho đúng).	https://audio.tflat.vn/data/cache/images/300x225/r/e/reconcile1.jpg	https://audio.tflat.vn/audio/r/e/reconcile.mp3	Accounting	https://tienganhtflat.com/blog/toeic-words-accounting	2026-07-24 17:22:34.132489	5
514	restricted	adj.	Bị hạn chế, bị giới hạn	/ris'triktid/	limited or small in size or amount	Access to the safe deposit box vault is restricted to key holders.	Việc vào hầm két bạc được hạn chế trong những người giữ chìa khóa.	https://audio.tflat.vn/data/cache/images/300x225/r/e/restricted1.png	https://audio.tflat.vn/audio/r/e/restricted.mp3	Banking	https://tienganhtflat.com/blog/toeic-words-banking	2026-07-24 17:22:34.132489	5
714	verify	verb	xác minh	/ˈverɪfaɪ/	to confirm accuracy	Please verify your identity.	Vui lòng xác minh danh tính.	\N	\N	Office	\N	2026-07-24 17:39:02.670694	5
521	commit	v.	Gửi, giao, giao phó, ủy nhiệm, ủy thác	/kə'mit/	to promise sincerely that you will definitely do something.	It is a good idea to commit a certain percentage of your income to investments.	Ý tưởng tốt là đem một vài % nào đó thu nhập của bạn để đầu tư.	https://audio.tflat.vn/data/cache/images/300x225/c/o/commit2.jpg	https://audio.tflat.vn/audio/c/o/commit.mp3	Investment	https://tienganhtflat.com/blog/toeic-words-investment	2026-07-24 17:22:34.132489	5
900	hazard	noun	mối nguy hiểm	/ˈhæzərd/	a source of danger	Workers must report hazards.	Người lao động phải báo cáo các mối nguy hiểm.	\N	\N	Safety	\N	2026-07-24 18:01:26.486905	5
862	deadline	noun	hạn chót	/ˈdedlaɪn/	the final date	Meet the project deadline.	Đáp ứng hạn chót của dự án.	\N	\N	Project	\N	2026-07-24 17:59:36.547339	5
887	feasibility	noun	tính khả thi	/ˌfiːzəˈbɪləti/	the possibility of being done	We conducted a feasibility study.	Chúng tôi đã thực hiện nghiên cứu tính khả thi.	\N	\N	Project	\N	2026-07-24 18:01:26.486905	5
187	continue	v.	Tiếp tục, duy trì	/kənˈtɪnjuː/	happening without stopping	He continued to ignore everything I was saying.	Anh ta tiếp tục bỏ qua tất cả những gì tôi nói.	https://audio.tflat.vn/data/images_example/300x225/h/e/he_continu_ex1_56248cef7f8b9af60c1430bb.jpg	https://audio.tflat.vn/audio/c/o/continue.mp3	Movies	https://tienganhtflat.com/blog/toeic-words-movies	2026-07-24 17:22:34.132489	5
477	punctually	adv.	Đúng giờ, không chậm trễ	/'pʌɳktjuəli/	happening at the arranged or correct time	Please be on time; the train leaves punctually at noon.	Hãy đến kịp giờ; xe lửa rời ga đúng giờ vào buổi trưa.	https://audio.tflat.vn/data/cache/images/300x225/p/u/punctually2.jpg	https://audio.tflat.vn/audio/p/u/punctually.mp3	Trains	https://tienganhtflat.com/blog/toeic-words-trains	2026-07-24 17:22:34.132489	5
605	contribute	v.	Đóng góp	/kən'tribju:t/	to give something, especially money or goods, to help somebody	Do you contribute anything to this charity?	Bạn có đóng góp gì cho buổi từ thiện này không?	https://audio.tflat.vn/data/cache/images/300x225/c/o/contribute1.jpg	https://audio.tflat.vn/audio/c/o/contribute.mp3	Promotions, Pensions & Award	https://tienganhtflat.com/blog/toeic-words-promotions-pensions-award	2026-07-24 17:22:34.132489	5
683	endorse	verb	chứng thực	/ɪnˈdɔːrs/	to approve publicly	The manager endorsed the proposal.	Quản lý đã chấp thuận đề xuất.	\N	\N	Business	\N	2026-07-24 17:39:02.670694	5
450	mistake	n.	Lỗi, sai, nhầm	/mis'teik/	an action or an opinion that is not correct	I made a mistake in adding up your bill and we overcharged you twenty dollars.	Tôi đã nhầm lẫn khi tính tổng hóa đơn của anh và chúng tôi đã tính quá của anh 20 đô-la.	https://audio.tflat.vn/data/cache/images/300x225/m/i/mistake1.png	https://audio.tflat.vn/audio/m/i/mistake.mp3	Invoice	https://tienganhtflat.com/blog/toeic-words-invoice	2026-07-24 17:22:34.132489	5
257	systematically	adv.	Có hệ thống, có phương pháp (methodically)	/ˌsɪstəˈmætɪkli/	done according to a system or plan	While creative thinking is necessary, analyzing a problem systematically is indispensable.	Trong khi mà sự suy nghĩ sáng tạo là cần thiết, thì việc phân tích một vấn đề một cách có hệ thống là không thể thiếu được.	https://audio.tflat.vn/data/cache/images/300x225/s/y/systematically1.png	https://audio.tflat.vn/audio/s/y/systematically.mp3	Product Development	https://tienganhtflat.com/blog/toeic-words-product-development	2026-07-24 17:22:34.132489	5
836	alternate	adjective	luân phiên	/ˈɔːltərnət/	every other	Meetings are held on alternate weeks.	Các cuộc họp được tổ chức cách tuần.	\N	\N	Office	\N	2026-07-24 17:59:36.547339	5
653	deduct	verb	khấu trừ	/dɪˈdʌkt/	to subtract	Taxes will be deducted.	Thuế sẽ được khấu trừ.	\N	\N	Finance	\N	2026-07-24 17:36:44.573617	5
835	allocate	verb	phân phối	/ˈæləkeɪt/	to assign resources	Funds were allocated fairly.	Nguồn vốn được phân bổ công bằng.	\N	\N	Finance	\N	2026-07-24 17:59:36.547339	5
620	commodity	noun	hàng hóa	/kəˈmɑːdəti/	a product that can be traded	Rice is an important commodity.	Gạo là một mặt hàng quan trọng.	\N	\N	Trade	\N	2026-07-24 17:36:44.573617	5
373	dialogue	n.	Cuộc đối thoại	/'daiəlɔg/	conversations in a book, play, or movie	The actors performed the dialogue without using scripts.	Các diễn viên trình diễn cuộc đối thoại mà không dùng kịch bản.	https://audio.tflat.vn/data/cache/images/300x225/d/i/dialogue1.png	https://audio.tflat.vn/audio/d/i/dialogue.mp3	Theater	https://tienganhtflat.com/blog/toeic-words-theater	2026-07-24 17:22:34.132489	5
814	guarantee	verb	đảm bảo	/ˌɡærənˈtiː/	to promise	We guarantee customer satisfaction.	Chúng tôi đảm bảo sự hài lòng của khách hàng.	\N	\N	Customer Service	\N	2026-07-24 17:44:13.10333	5
686	feasible	adjective	khả thi	/ˈfiːzəbl/	possible to do	The plan is feasible.	Kế hoạch này khả thi.	\N	\N	Planning	\N	2026-07-24 17:39:02.670694	5
735	arbitrary	adjective	tùy ý	/ˈɑːrbətreri/	based on personal choice	The decision seemed arbitrary.	Quyết định có vẻ mang tính tùy ý.	\N	\N	Business	\N	2026-07-24 17:41:11.759836	5
331	register	v.	Đăng ký	/'redʤistə/	to record somebody / something name on a list	You can register this mail for an additional $2.2.	Anh ấy có thể gửi đảm bảo thư này với một khoản 2.2 đô-la phí bổ sung.	https://audio.tflat.vn/data/cache/images/300x225/r/e/register1.jpg	https://audio.tflat.vn/audio/r/e/register.mp3	Correspondence	https://tienganhtflat.com/blog/toeic-words-correspondence	2026-07-24 17:22:34.132489	5
19	indicator	n.	Người chỉ, vật chỉ thị	/'indikeitə/	a sign that shows you what something is like or how a situation is changing	If the economy is an accurate indicator, rental prices will increase rapidly in the next six months.	Nếu nền kinh tế là chỉ báo chính xác, tiền thuê (nhà) sẽ tăng nhanh chóng trong 6 tháng tới.	https://audio.tflat.vn/data/cache/images/300x225/i/n/indicator2.jpg	https://audio.tflat.vn/audio/i/n/indicator.mp3	Renting and Leasing	https://tienganhtflat.com/blog/toeic-words-renting-and-leasing	2026-07-24 17:22:34.132489	5
14	circumstance	n.	Trường hợp, hoàn cảnh, tình huống	/'sə:kəmstəns/	the conditions and facts that are connected with and affect a situation, an event, or an action	Under the current economic circumstances, they will not be able to purchase the property.	Trong tình cảnh kinh tế hiện tại, họ không có khả năng mua sắm tài sản.	https://audio.tflat.vn/data/cache/images/300x225/c/i/circumstance2.png	https://audio.tflat.vn/audio/c/i/circumstance.mp3	Renting and Leasing	https://tienganhtflat.com/blog/toeic-words-renting-and-leasing	2026-07-24 17:22:34.132489	5
474	fare	n.	Tiền vé	/feə/	the money that you pay to travel by bus, plane, taxi, etc.	Pay your fare at the ticket office and you will get a ticket to board the train.	Thanh toán cước phí của anh tại phòng vé và anh sẽ nhận được một vé lên tàu.	https://audio.tflat.vn/data/cache/images/300x225/f/a/fare1.png	https://audio.tflat.vn/audio/f/a/fare.mp3	Trains	https://tienganhtflat.com/blog/toeic-words-trains	2026-07-24 17:22:34.132489	5
552	target	n.	Mục tiêu, mục đích	/'tɑ:git/	an aim	The airport terminal was the target of a bomb.	Trạm đến sân bay là mục tiêu của quả bom.	https://audio.tflat.vn/data/cache/images/300x225/t/a/target2.png	https://audio.tflat.vn/audio/t/a/target.mp3	Financial Statements	https://tienganhtflat.com/blog/toeic-words-financial-statements	2026-07-24 17:22:34.132489	5
858	contrary	adjective	trái ngược	/ˈkɑːntreri/	opposite	His opinion was contrary to ours.	Ý kiến của anh ấy trái ngược với chúng tôi.	\N	\N	Communication	\N	2026-07-24 17:59:36.547339	5
462	instinct	n.	Bản năng, năng khiếu	/in'stiɳkt/	a natural tendency for people and animals to behave in a	The child's ability to play the cello was so natural, it seemed an instinct.	Khả năng chơi đàn cello của cậu bé này quả là trời cho, nó dường như là 1 bản năng.	https://audio.tflat.vn/data/cache/images/300x225/i/n/instinct1.png	https://audio.tflat.vn/audio/i/n/instinct.mp3	Music	https://tienganhtflat.com/blog/toeic-words-music	2026-07-24 17:22:34.132489	5
809	encourage	verb	khuyến khích	/ɪnˈkɜːrɪdʒ/	to give support	Managers encourage teamwork.	Các quản lý khuyến khích làm việc nhóm.	\N	\N	Management	\N	2026-07-24 17:44:13.10333	5
282	media	n.	Truyền thông	/ˈmiːdɪə/	\N	He became a media star for his part in the protests.	Ông ấy đã trở thành một ngôi sao truyền thông bởi sự tham gia của ông trong các cuộc biểu tình.	https://audio.tflat.vn/data/cache/images/300x225/m/e/media1.jpg	https://audio.tflat.vn/audio/m/e/media.mp3	Media	https://tienganhtflat.com/blog/toeic-words-media	2026-07-24 17:22:34.132489	5
392	serious	adj.	Nghiêm túc	/'siəriəs/	bad or dangerous	We are always serious when working.	Chúng tôi luôn nghiêm túc khi làm việc.	https://audio.tflat.vn/data/cache/images/300x225/s/e/serious1.png	https://audio.tflat.vn/audio/s/e/serious.mp3	Doctor's Office	https://tienganhtflat.com/blog/toeic-words-doctor-s-office	2026-07-24 17:22:34.132489	5
614	recognition	n.	Sự ghi nhận, sự công nhận	/,rekəg'niʃn/	the act of accepting that something exists, is true or is official	She received recognition for her work.	Cô ấy đã có được sự ghi nhận cho những việc cô ấy đã làm.	https://audio.tflat.vn/data/cache/images/300x225/r/e/recognition1.jpg	https://audio.tflat.vn/audio/r/e/recognition.mp3	Promotions, Pensions & Award	https://tienganhtflat.com/blog/toeic-words-promotions-pensions-award	2026-07-24 17:22:34.132489	5
722	abide	verb	tuân thủ	/əˈbaɪd/	to follow or accept rules	Employees must abide by company policies.	Nhân viên phải tuân thủ các chính sách của công ty.	\N	\N	Business	\N	2026-07-24 17:41:11.759836	5
548	overall	adj.	Toàn bộ, toàn thể, tất cả; nói chung	/'ouvərɔ:l/	general	The person with overall responsibility for the project.	Người chịu trách nhiệm toàn bộ cho dự án.	https://audio.tflat.vn/data/cache/images/300x225/o/v/overall1.png	https://audio.tflat.vn/audio/o/v/overall.mp3	Financial Statements	https://tienganhtflat.com/blog/toeic-words-financial-statements	2026-07-24 17:22:34.132489	5
603	substitution	n.	Sự đổi, sự thay thế	/,sʌbsti'tju:ʃn/	to take the place of somebody / something else	Your substitution of fake names for real ones makes the document seem insincere.	Việc anh lấy tên giả thay cho tên thật khiến cho tài liệu có vẻ như không thành thật.	https://audio.tflat.vn/data/cache/images/300x225/s/u/substitution.jpg	https://audio.tflat.vn/audio/s/u/substitution.mp3	Business Planning	https://tienganhtflat.com/blog/toeic-words-business-planning	2026-07-24 17:22:34.132489	5
395	coordinate	v.	Kết hợp	/kou'ɔ:dneit/	to organize the different parts of an activity and the people	You should coordinate your activities with those of other groups.	Em nên kết hợp hoạt động của các em với hoạt động của các nhóm khác.	https://audio.tflat.vn/data/cache/images/300x225/c/o/coordinate1.png	https://audio.tflat.vn/audio/c/o/coordinate.mp3	Events	https://tienganhtflat.com/blog/toeic-words-events	2026-07-24 17:22:34.132489	5
484	popularity	n.	‹tính/sự› đại chúng, phổ biến, nổi tiếng	/,pɔpju'læriti/	the state of being liked by a large number of people	This brand of computers was at the height of its popularity.	Thương hiệu máy tính này từng nổi tiếng rất nhiều.	https://audio.tflat.vn/data/cache/images/300x225/p/o/popularity1.png	https://audio.tflat.vn/audio/p/o/popularity.mp3	Electronics	https://tienganhtflat.com/blog/toeic-words-electronics-3	2026-07-24 17:22:34.132489	5
527	pull-out	n.	Rút ra, rút khỏi	/ˈpʊl aʊt/	\N	The pull-out of the bank has left the company without financing.	Sự rút lui của ngân hàng đã để mặc cho công ty không còn tài chính.	https://audio.tflat.vn/data/cache/images/300x225/p/u/pull_out1.png	https://audio.tflat.vn/audio/p/u/pull_out.mp3	Investment	https://tienganhtflat.com/blog/toeic-words-investment	2026-07-24 17:22:34.132489	5
476	operate	v.	Vận hành, làm cho hoạt động	/'ɔpəreit/	to work in a particular way	The train only operates in this area at the height of the tourist season.	Xe lửa chỉ chạy trong khu vực này vào lúc cao điểm của mùa du lịch.	https://audio.tflat.vn/data/cache/images/300x225/o/p/operate1.png	https://audio.tflat.vn/audio/o/p/operate.mp3	Trains	https://tienganhtflat.com/blog/toeic-words-trains	2026-07-24 17:22:34.132489	5
56	physically	adv.	Về thân thể, thể chất 	/ˈfɪzɪkli /	in a way that is connected with a person's body rather than their mind	The computer screen is making her physically sick.	Màn hình máy tính khiến cho cô ta khó chịu về mặt thể chất.	https://audio.tflat.vn/data/cache/images/300x225/p/h/physically2.jpg	https://audio.tflat.vn/audio/p/h/physically.mp3	Office Technology	https://tienganhtflat.com/blog/toeic-words-office-technology	2026-07-24 17:22:34.132489	5
788	assurance	noun	sự đảm bảo	/əˈʃʊrəns/	a promise or guarantee	We provide quality assurance.	Chúng tôi đảm bảo chất lượng.	\N	\N	Business	\N	2026-07-24 17:44:13.10333	5
284	choose	v.	Chọn, chọn lựa	/tʃuːz/	\N	It took her a long time to choose a hat.	Cô ấy phải mất một thời gian dài để chọn một cái mũ.	https://audio.tflat.vn/data/images_example/300x225/i/t/it_took_he_ex1_58213ca37f8b9a91078b4567.png	https://audio.tflat.vn/audio/c/h/choose-l6.mp3	Media	https://tienganhtflat.com/blog/toeic-words-media	2026-07-24 17:22:34.132489	5
563	mix	n,v.	(n.) hỗn hợp; (v.) hợp vào, trộn lẫn	/miks/	if two or more substances mix or you mix them, they combine, usually in a way that means they cannot easily be separated	The mix of bright colors on the plate was very pleasing.	Sự pha trộn các màu sáng ở trên đĩa thì rất thú vị.	https://audio.tflat.vn/data/images_example/300x225/t/h/the_mix_of_ex1_56248d167f8b9a040dc660ec.jpg	https://audio.tflat.vn/audio/m/i/mix.mp3	Selecting A Restaurant	https://tienganhtflat.com/blog/toeic-words-selecting-a-restaurant	2026-07-24 17:22:34.132489	5
396	dimension	n.	Kích thước, khổ	/di'menʃn/	a measurement in space, for example the height, width, or length of something	What are the dimensions of the ballroom?	Kích thước của phòng nhảy ra sao?	https://audio.tflat.vn/data/cache/images/300x225/d/i/dimension1.png	https://audio.tflat.vn/audio/d/i/dimension.mp3	Events	https://tienganhtflat.com/blog/toeic-words-events	2026-07-24 17:22:34.132489	5
73	update	v.	Cập nhật	/'ʌpdeit/	to make something more modern by adding new parts	The personnel officer updated the employees on the latest personnel changes.	Thư ký văn phòng cập nhật cho nhân viên biết những thay đổi nhân sự mới nhất.	https://audio.tflat.vn/data/cache/images/300x225/u/p/update1.jpg	https://audio.tflat.vn/audio/u/p/update.mp3	Hiring and Training	https://tienganhtflat.com/blog/toeic-words-hiring-and-training	2026-07-24 17:22:34.132489	5
412	match	n.	Người ngang tài ngang sức	/mætʃ/	a fit, a similarity	It is difficult to make a decision when both candidates seem to be a perfect match.	Thật là khó đưa ra quyết định khi mà cả 2 ứng viên dường như ngang sức ngang tài.	https://audio.tflat.vn/data/cache/images/300x225/m/a/match-n1.jpg	https://audio.tflat.vn/audio/m/a/match-n.mp3	Job Ads & Recruitment	https://tienganhtflat.com/blog/toeic-words-job-ads-recruitment	2026-07-24 17:22:34.132489	5
736	assemble	verb	lắp ráp	/əˈsembl/	to put together	Workers assembled the equipment.	Công nhân đã lắp ráp thiết bị.	\N	\N	Manufacturing	\N	2026-07-24 17:41:11.759836	5
612	productive	adj.	Có năng suất, hiệu quả 	/prəˈdʌktɪv/	making goods or growing crops, especially in large quantities	The managers had a very productive meeting and were able to solve many of the problems.	Người trưởng phòng có một cuộc họp rất hiệu quả và đã có thể làm sáng tỏ nhiều vấn đề.	https://audio.tflat.vn/data/cache/images/300x225/p/r/productive1.png	https://audio.tflat.vn/audio/p/r/productive.mp3	Promotions, Pensions & Award	https://tienganhtflat.com/blog/toeic-words-promotions-pensions-award	2026-07-24 17:22:34.132489	5
863	decisive	adjective	quyết đoán	/dɪˈsaɪsɪv/	able to decide quickly	She is a decisive leader.	Cô ấy là một nhà lãnh đạo quyết đoán.	\N	\N	Management	\N	2026-07-24 17:59:36.547339	5
753	comprehensive	adjective	toàn diện	/ˌkɑːmprɪˈhensɪv/	complete and thorough	The guide is comprehensive.	Hướng dẫn rất toàn diện.	\N	\N	Education	\N	2026-07-24 17:41:11.759836	5
49	suit	v.	Phù hợp với, thích hợp với	/sju:t/	to be convenient or useful for somebody	I have finally found a health plan that suits my needs.	Rốt cuộc thì tôi đã tìm ra một dự án chăm sóc sức khỏe (mà) phù hợp với nhu cầu của tôi.	https://audio.tflat.vn/data/cache/images/300x225/s/u/suit1.png	https://audio.tflat.vn/audio/s/u/suit.mp3	Health	https://tienganhtflat.com/blog/toeic-words-health	2026-07-24 17:22:34.132489	5
894	furnish	verb	cung cấp	/ˈfɜːrnɪʃ/	to provide	Please furnish the requested documents.	Vui lòng cung cấp các tài liệu được yêu cầu.	\N	\N	Office	\N	2026-07-24 18:01:26.486905	5
724	accommodate	verb	đáp ứng	/əˈkɑːmədeɪt/	to provide what is needed	The hotel can accommodate 300 guests.	Khách sạn có thể phục vụ 300 khách.	\N	\N	Hospitality	\N	2026-07-24 17:41:11.759836	5
706	reschedule	verb	dời lịch	/ˌriːˈskedʒuːl/	to arrange a new time	The meeting was rescheduled.	Cuộc họp đã được dời lịch.	\N	\N	Office	\N	2026-07-24 17:39:02.670694	5
90	consume	v.	Tiêu thụ, tiêu dùng	/kən'sju:m/	to use something, especially fuel, engery or time	People consume a good deal of sugar in drinks.	Mọi người tiêu dùng một lượng đường lớn trong đồ uống.	https://audio.tflat.vn/data/cache/images/300x225/c/o/consume1.png	https://audio.tflat.vn/audio/c/o/consume.mp3	Marketing	https://tienganhtflat.com/blog/toeic-words-marketing	2026-07-24 17:22:34.132489	5
910	initiative	noun	sáng kiến	/ɪˈnɪʃətɪv/	a new plan	The manager launched a new initiative.	Quản lý đã khởi xướng một sáng kiến mới.	\N	\N	Management	\N	2026-07-24 18:01:26.486905	5
32	repel	v.	Làm khó chịu	/ri'pel/	to make somebody feel horror or disgust	Faulty products repel repeat customers.	Những sản phẩm lỗi lại gây khó chịu cho khách hàng.	https://audio.tflat.vn/data/cache/images/300x225/r/e/repel2.png	https://audio.tflat.vn/audio/r/e/repel.mp3	Quality Control	https://tienganhtflat.com/blog/toeic-words-quality-control	2026-07-24 17:22:34.132489	5
167	lobby	n.	Hành lang, sảnh chờ	/'lɔbi/	a large area inside the entrance of a public building where people can meet and wait	The reception area was moved from the lobby of the building to the third floor.	Khu vực tiếp tân đã được chuyển từ hành lang của tòa nhà lên tầng ba.	https://audio.tflat.vn/data/cache/images/300x225/l/o/lobby1.png	https://audio.tflat.vn/audio/l/o/lobby_=_foyer.mp3	Property & Departments	https://tienganhtflat.com/blog/toeic-words-property-departments	2026-07-24 17:22:34.132489	5
922	leverage	verb	tận dụng	/ˈlevərɪdʒ/	to use effectively	We leveraged new technology.	Chúng tôi tận dụng công nghệ mới.	\N	\N	Business	\N	2026-07-24 18:01:26.486905	5
756	constraint	noun	sự hạn chế	/kənˈstreɪnt/	a limitation	Budget constraints delayed the project.	Hạn chế ngân sách làm chậm dự án.	\N	\N	Project	\N	2026-07-24 17:41:11.759836	5
358	carrier	n.	‹người/công ty› vận chuyển, vận tải	/'kæriə/	a company that carries goods or passengers from one place to another, especially by air	Lou, our favorite carrier, takes extra care of our boxes marked 'fragile'.	Lou, người vận chuyển ưa thich của chúng tôi, đã phải cẩn thận hơn thường lệ với những cái hộp của chúng tôi có dán nhãn Dễ vỡ.	https://audio.tflat.vn/data/images_example/300x225/l/o/lou_our_fa_ex1_56248d157f8b9a040dc65f34.jpg	https://audio.tflat.vn/audio/c/a/carrier.mp3	Shipping	https://tienganhtflat.com/blog/toeic-words-shipping	2026-07-24 17:22:34.132489	5
775	evaluate	verb	đánh giá	/ɪˈvæljueɪt/	to assess quality	Managers evaluate employee performance.	Các quản lý đánh giá hiệu suất của nhân viên.	\N	\N	Human Resources	\N	2026-07-24 17:41:11.759836	5
145	predict	v.	Dự báo, dự đoán trước	/prɪˈdɪkt/	to say that something will happen in the future	He predicts that the trend will continue.	Anh ta dự đoán rằng xu hướng này sẽ tiếp tục.	https://audio.tflat.vn/data/cache/images/300x225/p/r/predict1.png	https://audio.tflat.vn/audio/p/r/predict.mp3	Eating Out	https://tienganhtflat.com/blog/toeic-words-eating-out	2026-07-24 17:22:34.132489	5
695	merger	noun	sáp nhập	/ˈmɜːrdʒər/	combining two companies	The merger was successful.	Thương vụ sáp nhập thành công.	\N	\N	Business	\N	2026-07-24 17:39:02.670694	5
80	obtain	v.	Giành được, kiếm được (to acquire)	/əb'tein/	to get something, especially by making an effort	In the second experiment they obtained a very clear result.	Ở thí nghiệm thứ hai, họ đạt được kết quả rất rõ ràng.	https://audio.tflat.vn/data/cache/images/300x225/o/b/obtain1.png	https://audio.tflat.vn/audio/o/b/obtain.mp3	Ordering Supplies	https://tienganhtflat.com/blog/toeic-words-ordering-supplies	2026-07-24 17:22:34.132489	5
96	persuasion	n.	Sự thuyết phục, làm cho tin (chú ý: persuade > convince)	/pə'sweiʤn/	the power to influence, a deep conviction or belief.	The seminar teaches techniques of persuasion to increase sales.	Hội thảo giảng dạy những kỹ thuật thuyết phục để gia tăng doanh số.	https://audio.tflat.vn/data/cache/images/300x225/p/e/persuasion1.png	https://audio.tflat.vn/audio/p/e/persuasion.mp3	Marketing	https://tienganhtflat.com/blog/toeic-words-marketing	2026-07-24 17:22:34.132489	5
592	address	v.	Nhằm vào, trình bày	/ə'dres/	a formal speech that is made in front of an audience	Marco's business plan addresses the needs of small business owners.	Kế hoạch kinh doanh của Marco nhằm vào nhu cầu của những chủ doanh nghiệp nhỏ.	https://audio.tflat.vn/data/images_example/300x225/m/a/marcos_bus_ex1_56248cf37f8b9af80c011d69.jpg	https://audio.tflat.vn/audio/a/d/address.mp3	Business Planning	https://tienganhtflat.com/blog/toeic-words-business-planning	2026-07-24 17:22:34.132489	5
101	file	v.	Sắp xếp, sắp đặt	/fail/	to present something so that it can be officially recorded and dealt with	to file a claim / complaint / petition / lawsuit (How to File a Lawsuit)	nộp đơn yêu cầu / khiếu nại / kiến nghị / kiện (Cách Nộp một vụ kiện)	https://audio.tflat.vn/data/cache/images/300x225/f/i/file2.png	https://audio.tflat.vn/audio/f/i/file.mp3	Taxes	https://tienganhtflat.com/blog/toeic-words-taxes	2026-07-24 17:22:34.132489	5
220	warning	n.	Sự cảnh báo 	/'wɔ:niɳ/	a statement, an event, etc. telling somebody that something bad or unpleasant	The red flashing light gives a warning to users that the battery is low.	Ánh sáng nhấp nháy màu đỏ đưa ra sự cảnh báo với người dùng rằng pin bị cạn.	https://audio.tflat.vn/data/images_example/300x225/t/h/the_red_fl_ex1_56248d157f8b9a040dc65e14.jpg	https://audio.tflat.vn/audio/w/a/warning.mp3	Computers and the Internet	https://tienganhtflat.com/blog/toeic-words-computers-and-the-internet	2026-07-24 17:22:34.132489	5
105	owe	v.	Nợ, mắc nợ, mang ơn	/ou/	return money that you have borrowed	I owe Janet ten pounds.	Tôi nợ Janet 10 bảng.	https://audio.tflat.vn/data/cache/images/300x225/o/w/owe1.png	https://audio.tflat.vn/audio/o/w/owe.mp3	Taxes	https://tienganhtflat.com/blog/toeic-words-taxes	2026-07-24 17:22:34.132489	5
237	cover	v.	Che, phủ, trùm, bọc; bao gồm	/'kʌvə/	to include something; to deal with something	The passport is covered with leather.	Quyển hộ chiếu được bọc bằng da.	https://audio.tflat.vn/data/cache/images/300x225/c/o/cover1.jpg	https://audio.tflat.vn/audio/c/o/cover.mp3	Warranties	https://tienganhtflat.com/blog/toeic-words-warranties	2026-07-24 17:22:34.132489	5
225	attend	v.	Tham dự, có mặt	/ə'tend/	to be present at an even	We expect more than 100 members to attend the annual meeting.	Chúng tôi hy vọng hơn 100 thành viên đến tham dự cuộc họp thường niên.	https://audio.tflat.vn/data/cache/images/300x225/a/t/attend1.jpg	https://audio.tflat.vn/audio/a/t/attend.mp3	Conference	https://tienganhtflat.com/blog/toeic-words-conference	2026-07-24 17:22:34.132489	5
9	vested	adj.	Được trao, được ban	/'vestid/	to give somebody the legal right or power to do something	The day that Ms. Weng became fully vested in the retirement plan, she gave her two weeks' notice.	Ngày mà bà Weng được trao đầy đủ kế hoạch nghỉ hưu, bà đã nhận thông báo trước 2 tuần.	https://audio.tflat.vn/data/cache/images/300x225/v/e/vested1.jpg	https://audio.tflat.vn/audio/v/e/vested.mp3	Salaries & Benefits	https://tienganhtflat.com/blog/toeic-words-salaries-benefits	2026-07-24 17:22:34.132489	5
307	usually	adv.	Thường thường, thường xuyên	/'ju:ʒuəli/	in the way that is usual or normal; most often	I'm usually home by 6 o'clock.	Tôi thường về nhà lúc 6 giờ.	https://audio.tflat.vn/data/cache/images/300x225/u/s/usually1.png	https://audio.tflat.vn/audio/u/s/usually.mp3	Hospitals	https://tienganhtflat.com/blog/toeic-words-hospitals	2026-07-24 17:22:34.132489	5
254	responsibility	n.	Trách nhiệm, bổn phận	/ris,pɔnsə'biliti/	a duty to deal with or take care of someone or something, so that it is your fault if something goes wrong	The product development department has a huge responsibility to be sure that the product is safe, even if used improperly.	Bộ phận phát triển sản phẩm có một trách nhiệm to lớn là phải chắc rằng sản phẩm là an toàn, cho dù là sử dụng không đúng cách.	https://audio.tflat.vn/data/images_example/300x225/t/h/the_produc_ex1_580ec4197f8b9ae2888b458a.jpg	https://audio.tflat.vn/audio/r/e/responsibility.mp3	Product Development	https://tienganhtflat.com/blog/toeic-words-product-development	2026-07-24 17:22:34.132489	5
\.


--
-- Name: UserProfile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."UserProfile_id_seq"', 2, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 1, true);


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
-- Name: user_vocabulary_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_vocabulary_progress_id_seq', 1, false);


--
-- Name: vocabulary_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vocabulary_id_seq', 938, true);


--
-- Name: UserProfile UserProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserProfile"
    ADD CONSTRAINT "UserProfile_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


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
-- Name: user_vocabulary_progress user_vocabulary_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_vocabulary_progress
    ADD CONSTRAINT user_vocabulary_progress_pkey PRIMARY KEY (id);


--
-- Name: user_vocabulary_progress user_vocabulary_progress_user_id_vocabulary_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_vocabulary_progress
    ADD CONSTRAINT user_vocabulary_progress_user_id_vocabulary_id_key UNIQUE (user_id, vocabulary_id);


--
-- Name: vocabulary vocabulary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vocabulary
    ADD CONSTRAINT vocabulary_pkey PRIMARY KEY (id);


--
-- Name: UserProfile_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserProfile_userId_key" ON public."UserProfile" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: UserProfile UserProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserProfile"
    ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


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

\unrestrict cRBe940TSdSBQmCsxSNuUzfPY0BdUK8hvW0Rd0HQmxaOakg1OIp75FZhmAvVzpi

