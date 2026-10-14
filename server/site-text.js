'use strict';
/* Жария сайт мәтіндері (kk / ru / en) */
module.exports = {
  kk: {
    lang_name: 'Қазақша', home_title: 'AI-bolat — 1–11 сыныпқа ойын-сабақтар, ҰБТ, PISA және AI көмекші',
    home_desc: 'AI-bolat — қазақ, орыс және ағылшын тілдеріндегі тегін оқу платформасы: 20 пән бойынша 1598 тақырыпқа ойын-сабақтар, ҰБТ · PISA · олимпиада тесттері, 3D зертханалар, мұғалімге сынып пен тапсырмалар, AI көмекші Болат.',
    nav_subjects: 'Пәндер', nav_exams: 'ҰБТ · PISA · Олимпиада', nav_login: 'Кіру', nav_start: 'Тегін бастау', nav_app: 'Қосымшаны ашу',
    hero_h1: 'Ойын арқылы оқитын мектеп платформасы', hero_kicker: 'AI-bolat · 1–11 сынып · 3 тіл',
    hero_lead: 'Әр тақырып — қысқа түсіндірме, мысалдар және 8 түрлі ойын. Оқушы XP жинап, деңгей көтереді; мұғалім сынып құрып, тапсырма береді және нәтижені бірден көреді.',
    cta_student: 'Оқушы ретінде бастау', cta_teacher: 'Мұғалім ретінде тіркелу', cta_play: 'Google Play-ден жүктеу', cta_install: 'Қосымша ретінде орнату',
    stats: ['пән', 'тақырып', 'тест сұрағы', 'тіл'],
    feat_h: 'Не бар?',
    feats: [
      ['🎮', 'Ойын-сабақтар', 'Сәйкестендіру, сұрыптау, уақытқа жарыс, шындық/жалған және т.б. — 1–11 сыныптың мемлекеттік бағдарламасына сай тақырыптар.'],
      ['🎯', 'ҰБТ · PISA · Олимпиада', 'Нақты форматтағы тесттер: мәтінмен жұмыс, бірнеше жауап, уақыт, толық шешімдер және AI жасаған жаңа сұрақтар.'],
      ['🤖', 'AI көмекші Болат', 'Тапсырманы қадамдап түсіндіреді, фотодағы есепті талдайды, жауапты бірден айтпай, ойлануға үйретеді.'],
      ['🧑‍🏫', 'Мұғалімге ыңғайлы', 'Сынып коды, тапсырмалар мен мерзімдер, хабарландырулар, оқушылармен чат, үлгерім статистикасы.'],
      ['🔬', '3D зертханалар', 'Физика, химия, биология, геометрия және ғарыш бойынша интерактивті 3D тәжірибелер.'],
      ['🌐', 'Үш тіл', 'Интерфейс пен сабақтар қазақ, орыс және ағылшын тілдерінде. Қазақ тілі — бірінші орында.']
    ],
    how_h: 'Қалай бастайды?',
    how: [['1', 'Тіркелу', 'Телефон нөмірі және SMS-код арқылы 1 минутта. Мұғалім немесе оқушы.'], ['2', 'Сынып', 'Мұғалім сынып құрып, 6 таңбалы кодты оқушыларға береді.'], ['3', 'Оқу', 'Оқушы тақырыпты ашып, ойнап, XP жинайды — мұғалім нәтижені көреді.']],
    subj_h: 'Пәндер', subj_lead: 'Әр пән бойынша сыныптарға бөлінген тақырыптар тізімі.', grades: 'сынып', topics_word: 'тақырып',
    faq_h: 'Жиі қойылатын сұрақтар',
    faq: [
      ['AI-bolat тегін бе?', 'Иә, оқушылар мен мұғалімдер үшін тегін. Жарнама жоқ.'],
      ['Қандай құрылғыда жұмыс істейді?', 'Кез келген браузерде (компьютер, планшет, телефон) және Android қосымшасы ретінде. Сайтты «Орнату» батырмасымен қосымша ретінде қоюға болады.'],
      ['Сабақтарды кім жасайды?', 'Тақырыптар тізімі мектеп бағдарламасына сай; түсіндірмелер мен ойын сұрақтарын жасанды интеллект жасайды. AI қателесуі мүмкін — күмәнді жауапқа «Шағым» батырмасы арқылы хабарлаңыз.'],
      ['Деректерім қауіпсіз бе?', 'Біз тек жұмысқа қажетті деректерді сақтаймыз (аты, телефон, оқу нәтижелері, хабарламалар). Аккаунтты кез келген уақытта жоюға болады. Толығырақ — құпиялылық саясатында.']
    ],
    ai_note: 'Сабақ мазмұны мен Болаттың жауаптарын жасанды интеллект жасайды және олар қате болуы мүмкін.',
    foot_privacy: 'Құпиялылық саясаты', foot_terms: 'Пайдалану шарттары', foot_delete: 'Аккаунтты жою', foot_contact: 'Байланыс',
    subj_page_title: (s) => `${s} — 1–11 сынып тақырыптары, ойын-сабақтар | AI-bolat`,
    subj_page_desc: (s, n, g) => `${s}: ${g} сыныптар бойынша ${n} тақырып. Әр тақырыпқа қысқа түсіндірме, мысалдар және ойындар — AI-bolat платформасында тегін.`,
    grade_h: (g) => `${g}-сынып`, open_topic: 'Сабақты ашу', back_subjects: '← Барлық пәндер',
    exams_title: 'ҰБТ, PISA және олимпиада тесттері онлайн — AI-bolat', exams_desc: 'ҰБТ форматындағы тесттер, PISA тапсырмалары және олимпиада есептері: уақытпен, шешімдерімен, қазақ тілінде. Мұғалім сыныпқа тапсырма ретінде бере алады.',
    exams_h1: 'ҰБТ · PISA · Олимпиада', exams_lead: 'Банкте нақты форматтағы сұрақтар бар; AI қосымша жаңа сұрақтар жасай алады.', exams_sample: 'Мысал сұрақтар', exams_note: 'Сұрақтар қазақ тілінде.',
    kind: { ubt: 'ҰБТ', pisa: 'PISA', olymp: 'Олимпиада' }, questions: 'сұрақ', try_now: 'Тестті бастау',
    nf_title: 'Бет табылмады', nf_text: 'Сұраған бет жоқ немесе көшірілген.', nf_home: 'Басты бетке',
    updated: 'Соңғы жаңарту', lang_label: 'Тіл'
  },
  ru: {
    lang_name: 'Русский', home_title: 'AI-bolat — уроки-игры для 1–11 классов, ЕНТ, PISA и AI-помощник',
    home_desc: 'AI-bolat — бесплатная учебная платформа на казахском, русском и английском: уроки-игры по 1598 темам 20 предметов, тесты ЕНТ · PISA · олимпиады, 3D-лаборатории, классы и задания для учителя, AI-помощник Болат.',
    nav_subjects: 'Предметы', nav_exams: 'ЕНТ · PISA · Олимпиада', nav_login: 'Войти', nav_start: 'Начать бесплатно', nav_app: 'Открыть приложение',
    hero_h1: 'Школьная платформа, где учатся через игру', hero_kicker: 'AI-bolat · 1–11 классы · 3 языка',
    hero_lead: 'Каждая тема — короткое объяснение, примеры и 8 видов игр. Ученик набирает XP и повышает уровень; учитель создаёт класс, выдаёт задания и сразу видит результаты.',
    cta_student: 'Начать как ученик', cta_teacher: 'Регистрация для учителя', cta_play: 'Скачать в Google Play', cta_install: 'Установить как приложение',
    stats: ['предметов', 'тем', 'тестовых вопросов', 'языка'],
    feat_h: 'Что внутри?',
    feats: [
      ['🎮', 'Уроки-игры', 'Сопоставление, сортировка, гонка на время, правда/ложь и другие — темы по государственной программе 1–11 классов.'],
      ['🎯', 'ЕНТ · PISA · Олимпиада', 'Тесты в реальном формате: работа с текстом, несколько ответов, таймер, подробные решения и новые вопросы от AI.'],
      ['🤖', 'AI-помощник Болат', 'Объясняет задачу по шагам, разбирает задачу по фото и учит думать, а не просто даёт ответ.'],
      ['🧑‍🏫', 'Удобно учителю', 'Код класса, задания и сроки, объявления, чат с учениками, статистика успеваемости.'],
      ['🔬', '3D-лаборатории', 'Интерактивные 3D-опыты по физике, химии, биологии, геометрии и астрономии.'],
      ['🌐', 'Три языка', 'Интерфейс и уроки на казахском, русском и английском. Казахский — в приоритете.']
    ],
    how_h: 'Как начать?',
    how: [['1', 'Регистрация', 'По номеру телефона и SMS-коду за минуту. Учитель или ученик.'], ['2', 'Класс', 'Учитель создаёт класс и даёт ученикам 6-значный код.'], ['3', 'Учёба', 'Ученик открывает тему, играет и набирает XP — учитель видит результаты.']],
    subj_h: 'Предметы', subj_lead: 'Списки тем по каждому предмету, разделённые по классам.', grades: 'классы', topics_word: 'тем',
    faq_h: 'Частые вопросы',
    faq: [
      ['AI-bolat бесплатный?', 'Да, бесплатно для учеников и учителей. Без рекламы.'],
      ['На каких устройствах работает?', 'В любом браузере (компьютер, планшет, телефон) и как Android-приложение. Сайт можно установить как приложение кнопкой «Установить».'],
      ['Кто создаёт уроки?', 'Список тем соответствует школьной программе; объяснения и игровые вопросы генерирует искусственный интеллект. AI может ошибаться — сообщите о сомнительном ответе кнопкой «Пожаловаться».'],
      ['Мои данные в безопасности?', 'Мы храним только необходимое для работы (имя, телефон, результаты, сообщения). Аккаунт можно удалить в любой момент. Подробнее — в политике конфиденциальности.']
    ],
    ai_note: 'Содержание уроков и ответы Болата создаются искусственным интеллектом и могут содержать ошибки.',
    foot_privacy: 'Политика конфиденциальности', foot_terms: 'Условия использования', foot_delete: 'Удаление аккаунта', foot_contact: 'Контакты',
    subj_page_title: (s) => `${s} — темы 1–11 классов, уроки-игры | AI-bolat`,
    subj_page_desc: (s, n, g) => `${s}: ${n} тем для ${g} классов. К каждой теме — краткое объяснение, примеры и игры — бесплатно на AI-bolat.`,
    grade_h: (g) => `${g} класс`, open_topic: 'Открыть урок', back_subjects: '← Все предметы',
    exams_title: 'Тесты ЕНТ, PISA и олимпиадные задачи онлайн — AI-bolat', exams_desc: 'Тесты в формате ЕНТ, задания PISA и олимпиадные задачи: с таймером и решениями. Учитель может выдать тест классу как задание.',
    exams_h1: 'ЕНТ · PISA · Олимпиада', exams_lead: 'В банке — вопросы в реальном формате; AI может создавать дополнительные новые вопросы.', exams_sample: 'Примеры вопросов', exams_note: 'Вопросы банка — на казахском языке.',
    kind: { ubt: 'ЕНТ', pisa: 'PISA', olymp: 'Олимпиада' }, questions: 'вопросов', try_now: 'Начать тест',
    nf_title: 'Страница не найдена', nf_text: 'Такой страницы нет или она перемещена.', nf_home: 'На главную',
    updated: 'Последнее обновление', lang_label: 'Язык'
  },
  en: {
    lang_name: 'English', home_title: 'AI-bolat — game-based lessons for grades 1–11, UNT, PISA and an AI tutor',
    home_desc: 'AI-bolat is a free learning platform in Kazakh, Russian and English: game-based lessons for 1,598 topics in 20 subjects, UNT · PISA · olympiad tests, 3D labs, classes and assignments for teachers, and the AI tutor Bolat.',
    nav_subjects: 'Subjects', nav_exams: 'UNT · PISA · Olympiad', nav_login: 'Sign in', nav_start: 'Start free', nav_app: 'Open the app',
    hero_h1: 'A school platform where students learn by playing', hero_kicker: 'AI-bolat · grades 1–11 · 3 languages',
    hero_lead: 'Every topic comes with a short explanation, examples and 8 kinds of games. Students earn XP and level up; teachers create classes, give assignments and see results instantly.',
    cta_student: 'Start as a student', cta_teacher: 'Sign up as a teacher', cta_play: 'Get it on Google Play', cta_install: 'Install as an app',
    stats: ['subjects', 'topics', 'test questions', 'languages'],
    feat_h: 'What is inside?',
    feats: [
      ['🎮', 'Game lessons', 'Matching, sorting, time races, true/false and more — topics follow the national curriculum for grades 1–11.'],
      ['🎯', 'UNT · PISA · Olympiad', 'Real-format tests: reading passages, multiple answers, timers, full solutions and fresh AI-generated questions.'],
      ['🤖', 'AI tutor Bolat', 'Explains problems step by step, analyses a photo of homework and teaches thinking instead of just giving answers.'],
      ['🧑‍🏫', 'Built for teachers', 'Class codes, assignments with deadlines, announcements, chat with students and progress statistics.'],
      ['🔬', '3D labs', 'Interactive 3D experiments in physics, chemistry, biology, geometry and astronomy.'],
      ['🌐', 'Three languages', 'Interface and lessons in Kazakh, Russian and English, with Kazakh first.']
    ],
    how_h: 'How to start',
    how: [['1', 'Sign up', 'With a phone number and SMS code in a minute. Teacher or student.'], ['2', 'Class', 'The teacher creates a class and shares a 6-character code.'], ['3', 'Learn', 'Students open a topic, play and earn XP — the teacher sees the results.']],
    subj_h: 'Subjects', subj_lead: 'Topic lists for every subject, split by grade.', grades: 'grades', topics_word: 'topics',
    faq_h: 'FAQ',
    faq: [
      ['Is AI-bolat free?', 'Yes, it is free for students and teachers. No ads.'],
      ['Which devices are supported?', 'Any modern browser (computer, tablet, phone) and an Android app. You can also install the website as an app with the “Install” button.'],
      ['Who creates the lessons?', 'Topic lists follow the school curriculum; explanations and game questions are generated by AI. AI can make mistakes — report a doubtful answer with the “Report” button.'],
      ['Is my data safe?', 'We store only what the service needs (name, phone, learning results, messages). You can delete your account at any time. See the privacy policy for details.']
    ],
    ai_note: 'Lesson content and Bolat’s answers are generated by artificial intelligence and may contain mistakes.',
    foot_privacy: 'Privacy policy', foot_terms: 'Terms of use', foot_delete: 'Delete account', foot_contact: 'Contact',
    subj_page_title: (s) => `${s} — topics for grades 1–11, game lessons | AI-bolat`,
    subj_page_desc: (s, n, g) => `${s}: ${n} topics for grades ${g}. Each topic has a short explanation, examples and games — free on AI-bolat.`,
    grade_h: (g) => `Grade ${g}`, open_topic: 'Open lesson', back_subjects: '← All subjects',
    exams_title: 'UNT, PISA and olympiad practice tests online — AI-bolat', exams_desc: 'UNT-format tests, PISA tasks and olympiad problems with timers and solutions. Teachers can assign a test to a class.',
    exams_h1: 'UNT · PISA · Olympiad', exams_lead: 'The bank holds real-format questions; AI can generate additional new ones.', exams_sample: 'Sample questions', exams_note: 'Bank questions are in Kazakh.',
    kind: { ubt: 'UNT', pisa: 'PISA', olymp: 'Olympiad' }, questions: 'questions', try_now: 'Start a test',
    nf_title: 'Page not found', nf_text: 'This page does not exist or has moved.', nf_home: 'Home',
    updated: 'Last updated', lang_label: 'Language'
  }
};
