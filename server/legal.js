'use strict';
/* Құпиялылық саясаты, пайдалану шарттары, аккаунтты жою — kk / ru / en.
   c = { org, email, ai, sms, loc, url, updated } — мәндер env-тен (server/site.js). */
const L = {};
L.kk = {
  privacy_title: 'Құпиялылық саясаты', terms_title: 'Пайдалану шарттары', delete_title: 'Аккаунтты және деректерді жою',
  privacy: (c) => `
<p>Бұл саясат ${c.org} (бұдан әрі — «біз», «Оператор») басқаратын AI-bolat веб-сайты мен Android қосымшасының (${c.url}) пайдаланушылар туралы қандай деректерді жинайтынын, не үшін және қалай өңдейтінін түсіндіреді. Біз Қазақстан Республикасының «Дербес деректер және оларды қорғау туралы» Заңын басшылыққа аламыз.</p>
<h2>1. Қандай деректерді жинаймыз</h2>
<ul>
<li><b>Аккаунт деректері:</b> рөл (мұғалім/оқушы), аты (немесе лақап аты), ұялы телефон нөмірі, сынып, интерфейс тілі, аватар-эмодзи. Құпиясөз тек қайтымсыз хеш түрінде (bcrypt) сақталады.</li>
<li><b>Растау деректері:</b> SMS-кодтың хеші, сұраныс уақыты және IP-мекенжай (теріс пайдаланудан қорғау үшін, қысқа мерзімге).</li>
<li><b>Оқу деректері:</b> сабақ пен тест нәтижелері, XP, серия (streak), зертхана тапсырмалары, мұғалім берген тапсырмалар мен мерзімдер.</li>
<li><b>Хабарламалар:</b> мұғалім мен оқушы арасындағы чат, сынып хабарландырулары.</li>
<li><b>AI көмекші Болатпен сөйлесулер:</b> сіз жазған мәтін және жүктеген суреттер (мысалы, есептің фотосы), AI жауаптары.</li>
<li><b>Шағымдар:</b> AI мазмұнына шағым жіберсеңіз — шағым мәтіні және сілтемесі.</li>
<li><b>Техникалық деректер:</b> сессия cookie файлы (кіруді сақтау үшін), сервер журналдары (IP, уақыт, қателер). Біз жарнама, аналитика немесе бақылау (tracking) cookie файлдарын қолданбаймыз, геолокация жинамаймыз.</li>
</ul>
<h2>2. Не үшін қолданамыз</h2>
<ul><li>Аккаунт жасау, кіру және құпиясөзді қалпына келтіру (SMS-код).</li><li>Оқу мазмұнын көрсету, прогресті сақтау, мұғалімге сынып үлгерімін көрсету.</li>
<li>Мұғалім мен оқушы арасындағы байланыс.</li><li>AI арқылы сабақ, тест сұрақтарын және түсіндірмелер жасау.</li><li>Қауіпсіздік: спам, шабуыл және теріс пайдаланудан қорғау.</li></ul>
<p>Деректерді сатпаймыз, жарнамаға бермейміз және профиль құру (профилинг) арқылы заңды салдары бар автоматты шешімдер қабылдамаймыз.</p>
<h2>3. Жасанды интеллект (AI) арқылы өңдеу</h2>
<p>Сабақтар, тест сұрақтары және Болаттың жауаптары сыртқы AI қызметі арқылы жасалады: <b>${c.ai}</b>. Ол үшін сұраныс мәтіні (тақырып, сіздің сұрағыңыз, жүктеген суретіңіз) AI провайдеріне жіберіледі; аты мен телефон нөміріңіз жіберілмейді. AI провайдерінің серверлері Қазақстаннан тыс орналасуы мүмкін — тіркелу кезінде сіз (немесе ата-анаңыз) осы трансшекаралық беруге келісім бересіз. Чатқа жеке деректерді (толық аты-жөні, мекенжай, телефон, басқа адамдардың суреттері) жазбауыңызды сұраймыз. AI жауаптары қате болуы мүмкін; күмәнді немесе орынсыз жауапқа «Шағым» батырмасы арқылы хабарлаңыз.</p>
<h2>4. Кімге беріледі</h2>
<ul><li><b>Хостинг:</b> деректер базасы ${c.loc} орналасқан серверде сақталады.</li><li><b>SMS провайдері:</b> ${c.sms} — тек телефон нөмірі және растау коды бар SMS мәтіні.</li>
<li><b>AI провайдері:</b> ${c.ai} — 3-бөлімде сипатталғандай.</li><li><b>Мұғалім:</b> оқушының сыныбындағы мұғалімі оның атын, нәтижелерін, тапсырмаларын және өзімен чатын көреді. Басқа оқушылар сіздің телефон нөміріңізді көрмейді.</li>
<li>Заңда көзделген жағдайда — уәкілетті мемлекеттік органдарға.</li></ul>
<h2>5. Балалар</h2>
<p>AI-bolat — мектеп оқушыларына арналған білім беру қызметі. 18 жасқа толмаған оқушы тек ата-анасының (заңды өкілінің) келісімімен немесе мұғалім/мектеп ұйымдастырған жағдайда тіркеледі. Ата-ана баласының деректерін көруді, түзетуді немесе жоюды ${c.email} арқылы сұрай алады. Біз балаларға жарнама көрсетпейміз және олардың деректерін коммерциялық мақсатта пайдаланбаймыз.</p>
<h2>6. Сақтау мерзімі</h2>
<p>Аккаунт деректері аккаунт бар болғанша сақталады. SMS-кодтар бірнеше сағат ішінде жарамсыз болады. Аккаунт жойылғанда онымен байланысты деректер (нәтижелер, чаттар, суреттер, хабарламалар) бірден өшіріледі; резервтік көшірмелерден ${c.backup_days} күн ішінде толық кетеді.</p>
<h2>7. Қауіпсіздік</h2>
<p>Байланыс HTTPS арқылы шифрланады, құпиясөздер хештеледі, сессия cookie файлы HttpOnly/Secure, кіру және AI сұраныстарына шектеулер бар, әкімші қолжетімділігі шектелген.</p>
<h2>8. Сіздің құқықтарыңыз</h2>
<p>Сіз деректеріңізді көруге, түзетуге (Профиль бетінде), жоюға (Профиль → «Аккаунтты жою» немесе <a href="${c.delete_url}">осы бет</a>), келісімді кері қайтарып алуға және уәкілетті органға шағымдануға құқылысыз. Сұраныстарыңызды ${c.email} мекенжайына жіберіңіз — 10 жұмыс күні ішінде жауап береміз.</p>
<h2>9. Өзгерістер және байланыс</h2>
<p>Саясат өзгерсе, осы бетте жаңа нұсқасы мен күні жарияланады. Оператор: ${c.org}. Байланыс: <a href="mailto:${c.email}">${c.email}</a>.</p>`,
  terms: (c) => `
<p>AI-bolat қызметін (${c.url}) пайдалану арқылы сіз осы шарттармен келісесіз. Қызметті ${c.org} ұсынады.</p>
<h2>1. Қызмет</h2><p>AI-bolat — мектеп бағдарламасы бойынша ойын-сабақтар, тесттер, сыныптар мен AI көмекшісі бар тегін білім беру платформасы. Қызмет «бар күйінде» ұсынылады; біз оны үзіліссіз және қатесіз жұмыс істейді деп кепілдік бермейміз.</p>
<h2>2. Аккаунт</h2><p>Тіркелу үшін жарамды телефон нөмірі қажет. Құпиясөзіңізді ешкімге бермеңіз. 18 жасқа толмаған пайдаланушылар ата-анасының (заңды өкілінің) келісімімен пайдаланады. Мұғалім аккаунты оқушылардың деректерін тек оқу мақсатында қолдануы тиіс.</p>
<h2>3. AI мазмұны</h2><p>Сабақтар мен жауаптардың бір бөлігін жасанды интеллект жасайды және олар қате, толық емес немесе ескірген болуы мүмкін. Маңызды шешімдер (емтихан, баға) үшін мұғаліммен және ресми оқулықтармен тексеріңіз. Орынсыз мазмұнды «Шағым» батырмасы арқылы хабарлаңыз — біз оны қарап, түзетеміз немесе өшіреміз.</p>
<h2>4. Тыйым салынады</h2><ul><li>қорлау, қорқыту, буллинг, жеккөрушілік, ересектерге арналған немесе заңсыз мазмұн жіберу;</li><li>басқа адамдардың жеке деректерін немесе суреттерін олардың келісімінсіз жариялау;</li><li>жүйені бұзуға, шектеулерді айналып өтуге, автоматты түрде көп сұраныс жіберуге әрекет ету;</li><li>AI-ды зиянды немесе оқуға қатысы жоқ мазмұн жасауға мәжбүрлеу.</li></ul>
<p>Ережені бұзған аккаунтты ескертусіз шектеуге немесе жоюға құқылымыз.</p>
<h2>5. Зияткерлік меншік</h2><p>Платформаның коды, дизайны және логотипі Операторға тиесілі. Сіз жазған мәтіндер сізге тиесілі; оларды қызметті көрсету үшін ғана өңдейміз.</p>
<h2>6. Жауапкершілікті шектеу</h2><p>Заң рұқсат еткен шекте Оператор қызметті пайдаланудан туындаған жанама залал үшін жауап бермейді.</p>
<h2>7. Аккаунтты жою</h2><p>Аккаунтыңызды кез келген уақытта жоя аласыз: Профиль → «Аккаунтты жою» немесе <a href="${c.delete_url}">осы нұсқаулық</a>.</p>
<h2>8. Қолданылатын құқық</h2><p>Осы шарттарға Қазақстан Республикасының заңнамасы қолданылады. Байланыс: <a href="mailto:${c.email}">${c.email}</a>.</p>`,
  delete: (c) => `
<p>AI-bolat аккаунтыңызды және онымен байланысты деректерді кез келген уақытта тегін жоя аласыз.</p>
<h2>1-тәсіл: қосымшада (бірден)</h2><ol><li>AI-bolat-қа кіріңіз (сайт немесе Android қосымшасы).</li><li><b>Профиль</b> бетін ашыңыз.</li><li>Төмендегі <b>«Аккаунтты жою»</b> батырмасын басып, құпиясөзіңізді енгізіңіз.</li></ol>
<p><a class="btn" href="/app/#/profile">Профильді ашу →</a></p>
<h2>2-тәсіл: хат арқылы</h2><p>Құпиясөзді ұмытсаңыз немесе кіре алмасаңыз, тіркелген телефон нөміріңізді көрсетіп, <a href="mailto:${c.email}?subject=AI-bolat%20account%20deletion">${c.email}</a> мекенжайына хат жазыңыз. Нөмірдің сізге тиесілі екенін SMS арқылы тексеріп, 10 жұмыс күні ішінде жоямыз. Ата-ана баласының аккаунтын жоюды сұрай алады.</p>
<h2>Не жойылады</h2><ul><li>аккаунт (аты, телефон, құпиясөз хеші, баптаулар);</li><li>сабақ/тест нәтижелері, XP, прогресс, зертхана деректері;</li><li>Болатпен барлық чаттар және жүктелген суреттер;</li><li>сіздің хабарламаларыңыз және шағымдарыңыз;</li><li>мұғалім болсаңыз — сіздің сыныптарыңыз, тапсырмаларыңыз және хабарландыруларыңыз (оқушылардың өз аккаунттары сақталады).</li></ul>
<h2>Не сақталуы мүмкін</h2><p>Резервтік көшірмелер ${c.backup_days} күн ішінде автоматты түрде ауыстырылады. Аты-жөні жоқ, жалпы (агрегат) статистика және AI жасаған, жеке деректері жоқ жалпы сабақ мәтіндері сақталуы мүмкін.</p>`
};
module.exports = L;
L.ru = {
  privacy_title: 'Политика конфиденциальности', terms_title: 'Условия использования', delete_title: 'Удаление аккаунта и данных',
  privacy: (c) => `
<p>Эта политика объясняет, какие данные пользователей собирают веб-сайт и Android-приложение AI-bolat (${c.url}), которыми управляет ${c.org} (далее — «мы», «Оператор»), зачем и как они обрабатываются. Мы руководствуемся Законом Республики Казахстан «О персональных данных и их защите».</p>
<h2>1. Какие данные мы собираем</h2>
<ul>
<li><b>Данные аккаунта:</b> роль (учитель/ученик), имя (или псевдоним), номер мобильного телефона, класс, язык интерфейса, аватар-эмодзи. Пароль хранится только в виде необратимого хеша (bcrypt).</li>
<li><b>Данные подтверждения:</b> хеш SMS-кода, время запроса и IP-адрес (для защиты от злоупотреблений, кратковременно).</li>
<li><b>Учебные данные:</b> результаты уроков и тестов, XP, серии (streak), задания лабораторий, задания и сроки от учителя.</li>
<li><b>Сообщения:</b> чат между учителем и учеником, объявления класса.</li>
<li><b>Диалоги с AI-помощником Болатом:</b> ваш текст и загруженные изображения (например, фото задачи), ответы AI.</li>
<li><b>Жалобы:</b> если вы пожаловались на AI-контент — текст жалобы и ссылка.</li>
<li><b>Технические данные:</b> сессионный cookie (чтобы вы оставались в системе), журналы сервера (IP, время, ошибки). Мы не используем рекламные, аналитические или трекинговые cookie и не собираем геолокацию.</li>
</ul>
<h2>2. Зачем мы их используем</h2>
<ul><li>Создание аккаунта, вход и восстановление пароля (SMS-код).</li><li>Показ учебного контента, сохранение прогресса, отображение успеваемости класса учителю.</li><li>Связь между учителем и учеником.</li>
<li>Генерация уроков, тестовых вопросов и объяснений с помощью AI.</li><li>Безопасность: защита от спама, атак и злоупотреблений.</li></ul>
<p>Мы не продаём данные, не передаём их для рекламы и не принимаем автоматизированных решений с юридическими последствиями на основе профилирования.</p>
<h2>3. Обработка искусственным интеллектом (AI)</h2>
<p>Уроки, тестовые вопросы и ответы Болата генерируются внешним AI-сервисом: <b>${c.ai}</b>. Для этого текст запроса (тема, ваш вопрос, загруженное изображение) передаётся AI-провайдеру; ваше имя и номер телефона не передаются. Серверы AI-провайдера могут находиться за пределами Казахстана — при регистрации вы (или ваш родитель) даёте согласие на такую трансграничную передачу. Просим не писать в чат персональные данные (ФИО, адрес, телефон, фото других людей). Ответы AI могут быть ошибочными; сообщайте о сомнительных или неуместных ответах кнопкой «Пожаловаться».</p>
<h2>4. Кому передаются данные</h2>
<ul><li><b>Хостинг:</b> база данных хранится на сервере, расположенном ${c.loc_ru}.</li><li><b>SMS-провайдер:</b> ${c.sms} — только номер телефона и текст SMS с кодом.</li>
<li><b>AI-провайдер:</b> ${c.ai} — как описано в разделе 3.</li><li><b>Учитель:</b> учитель класса ученика видит его имя, результаты, задания и переписку с собой. Другие ученики не видят ваш номер телефона.</li>
<li>Уполномоченным государственным органам — в случаях, предусмотренных законом.</li></ul>
<h2>5. Дети</h2>
<p>AI-bolat — образовательный сервис для школьников. Ученик младше 18 лет регистрируется только с согласия родителя (законного представителя) или при организации учителем/школой. Родитель может запросить просмотр, исправление или удаление данных ребёнка по адресу ${c.email}. Мы не показываем детям рекламу и не используем их данные в коммерческих целях.</p>
<h2>6. Срок хранения</h2>
<p>Данные аккаунта хранятся, пока существует аккаунт. SMS-коды становятся недействительными в течение нескольких часов. При удалении аккаунта связанные данные (результаты, чаты, изображения, сообщения) удаляются сразу; из резервных копий — в течение ${c.backup_days} дней.</p>
<h2>7. Безопасность</h2>
<p>Соединение шифруется по HTTPS, пароли хешируются, сессионный cookie — HttpOnly/Secure, действуют ограничения на вход и AI-запросы, доступ администраторов ограничен.</p>
<h2>8. Ваши права</h2>
<p>Вы можете просматривать, исправлять (страница «Профиль»), удалять данные (Профиль → «Удалить аккаунт» или <a href="${c.delete_url}">эта страница</a>), отозвать согласие и обратиться с жалобой в уполномоченный орган. Запросы направляйте на ${c.email} — ответим в течение 10 рабочих дней.</p>
<h2>9. Изменения и контакты</h2>
<p>При изменении политики новая редакция и дата публикуются на этой странице. Оператор: ${c.org}. Контакт: <a href="mailto:${c.email}">${c.email}</a>.</p>`,
  terms: (c) => `
<p>Используя сервис AI-bolat (${c.url}), вы соглашаетесь с этими условиями. Сервис предоставляет ${c.org}.</p>
<h2>1. Сервис</h2><p>AI-bolat — бесплатная образовательная платформа с уроками-играми по школьной программе, тестами, классами и AI-помощником. Сервис предоставляется «как есть»; мы не гарантируем его бесперебойную и безошибочную работу.</p>
<h2>2. Аккаунт</h2><p>Для регистрации нужен действующий номер телефона. Не передавайте пароль другим. Пользователи младше 18 лет пользуются сервисом с согласия родителя (законного представителя). Учитель обязан использовать данные учеников только в учебных целях.</p>
<h2>3. AI-контент</h2><p>Часть уроков и ответов создаётся искусственным интеллектом и может быть ошибочной, неполной или устаревшей. Для важных решений (экзамены, оценки) сверяйтесь с учителем и официальными учебниками. Сообщайте о неуместном контенте кнопкой «Пожаловаться» — мы рассмотрим, исправим или удалим его.</p>
<h2>4. Запрещено</h2><ul><li>оскорбления, угрозы, буллинг, разжигание ненависти, контент для взрослых или незаконный контент;</li><li>публикация персональных данных или фото других людей без их согласия;</li><li>попытки взлома, обхода ограничений, автоматизированной массовой отправки запросов;</li><li>принуждение AI к созданию вредного или не связанного с учёбой контента.</li></ul>
<p>Мы вправе без предупреждения ограничить или удалить аккаунт, нарушающий правила.</p>
<h2>5. Интеллектуальная собственность</h2><p>Код, дизайн и логотип платформы принадлежат Оператору. Ваши тексты принадлежат вам; мы обрабатываем их только для оказания сервиса.</p>
<h2>6. Ограничение ответственности</h2><p>В пределах, допускаемых законом, Оператор не несёт ответственности за косвенный ущерб от использования сервиса.</p>
<h2>7. Удаление аккаунта</h2><p>Вы можете удалить аккаунт в любой момент: Профиль → «Удалить аккаунт» или <a href="${c.delete_url}">по этой инструкции</a>.</p>
<h2>8. Применимое право</h2><p>К условиям применяется законодательство Республики Казахстан. Контакт: <a href="mailto:${c.email}">${c.email}</a>.</p>`,
  delete: (c) => `
<p>Вы можете бесплатно удалить аккаунт AI-bolat и связанные с ним данные в любой момент.</p>
<h2>Способ 1: в приложении (сразу)</h2><ol><li>Войдите в AI-bolat (сайт или Android-приложение).</li><li>Откройте страницу <b>«Профиль»</b>.</li><li>Нажмите <b>«Удалить аккаунт»</b> внизу и введите пароль.</li></ol>
<p><a class="btn" href="/app/#/profile">Открыть профиль →</a></p>
<h2>Способ 2: по e-mail</h2><p>Если вы забыли пароль или не можете войти, напишите на <a href="mailto:${c.email}?subject=AI-bolat%20account%20deletion">${c.email}</a>, указав номер телефона аккаунта. Мы подтвердим владение номером по SMS и удалим аккаунт в течение 10 рабочих дней. Родитель может запросить удаление аккаунта ребёнка.</p>
<h2>Что удаляется</h2><ul><li>аккаунт (имя, телефон, хеш пароля, настройки);</li><li>результаты уроков/тестов, XP, прогресс, данные лабораторий;</li><li>все чаты с Болатом и загруженные изображения;</li><li>ваши сообщения и жалобы;</li><li>для учителя — ваши классы, задания и объявления (собственные аккаунты учеников сохраняются).</li></ul>
<h2>Что может сохраниться</h2><p>Резервные копии автоматически перезаписываются в течение ${c.backup_days} дней. Могут сохраняться обезличенная сводная статистика и общие тексты уроков, созданные AI без персональных данных.</p>`
};
L.en = {
  privacy_title: 'Privacy policy', terms_title: 'Terms of use', delete_title: 'Delete your account and data',
  privacy: (c) => `
<p>This policy explains what data the AI-bolat website and Android app (${c.url}), operated by ${c.org} (“we”, the “Operator”), collect about users, why, and how the data is processed. We follow the Law of the Republic of Kazakhstan “On Personal Data and Its Protection”.</p>
<h2>1. Data we collect</h2>
<ul>
<li><b>Account data:</b> role (teacher/student), name (or nickname), mobile phone number, grade, interface language, avatar emoji. Passwords are stored only as an irreversible hash (bcrypt).</li>
<li><b>Verification data:</b> a hash of the SMS code, request time and IP address (short-term, to prevent abuse).</li>
<li><b>Learning data:</b> lesson and test results, XP, streaks, lab tasks, assignments and deadlines set by teachers.</li>
<li><b>Messages:</b> chat between teachers and students, class announcements.</li>
<li><b>Conversations with the AI tutor Bolat:</b> the text you write and images you upload (for example, a photo of a problem), and AI replies.</li>
<li><b>Reports:</b> if you report AI content — the report text and reference.</li>
<li><b>Technical data:</b> a session cookie (to keep you signed in) and server logs (IP, time, errors). We do not use advertising, analytics or tracking cookies and do not collect location.</li>
</ul>
<h2>2. How we use it</h2>
<ul><li>Creating accounts, signing in and resetting passwords (SMS code).</li><li>Showing learning content, saving progress and showing class progress to the teacher.</li><li>Communication between teachers and students.</li>
<li>Generating lessons, test questions and explanations with AI.</li><li>Security: protection against spam, attacks and abuse.</li></ul>
<p>We do not sell data, do not share it for advertising and do not make automated decisions with legal effects based on profiling.</p>
<h2>3. Processing by artificial intelligence (AI)</h2>
<p>Lessons, test questions and Bolat’s replies are generated by an external AI service: <b>${c.ai}</b>. The request text (topic, your question, an uploaded image) is sent to the AI provider; your name and phone number are not sent. The AI provider’s servers may be located outside Kazakhstan — when signing up, you (or your parent) consent to this cross-border transfer. Please do not type personal data (full name, address, phone, photos of other people) in the chat. AI replies may be wrong; report doubtful or inappropriate replies with the “Report” button.</p>
<h2>4. Who receives data</h2>
<ul><li><b>Hosting:</b> the database is stored on a server located ${c.loc_en}.</li><li><b>SMS provider:</b> ${c.sms} — only the phone number and the SMS text with the code.</li>
<li><b>AI provider:</b> ${c.ai} — as described in section 3.</li><li><b>Teacher:</b> a student’s class teacher sees the student’s name, results, assignments and their chat with that teacher. Other students do not see your phone number.</li>
<li>Competent authorities — where required by law.</li></ul>
<h2>5. Children</h2>
<p>AI-bolat is an educational service for school students. Students under 18 sign up only with the consent of a parent (legal guardian) or when organised by their teacher/school. A parent can ask to view, correct or delete their child’s data at ${c.email}. We do not show ads to children and do not use their data for commercial purposes.</p>
<h2>6. Retention</h2>
<p>Account data is kept while the account exists. SMS codes expire within hours. When an account is deleted, its data (results, chats, images, messages) is deleted immediately and disappears from backups within ${c.backup_days} days.</p>
<h2>7. Security</h2>
<p>Traffic is encrypted with HTTPS, passwords are hashed, the session cookie is HttpOnly/Secure, sign-in and AI requests are rate-limited, and administrator access is restricted.</p>
<h2>8. Your rights</h2>
<p>You can view and correct your data (Profile page), delete it (Profile → “Delete account” or <a href="${c.delete_url}">this page</a>), withdraw consent and complain to the competent authority. Send requests to ${c.email} — we reply within 10 business days.</p>
<h2>9. Changes and contact</h2>
<p>If this policy changes, the new version and date will be published on this page. Operator: ${c.org}. Contact: <a href="mailto:${c.email}">${c.email}</a>.</p>`,
  terms: (c) => `
<p>By using AI-bolat (${c.url}) you agree to these terms. The service is provided by ${c.org}.</p>
<h2>1. The service</h2><p>AI-bolat is a free educational platform with curriculum-based game lessons, tests, classes and an AI tutor. It is provided “as is”; we do not guarantee uninterrupted or error-free operation.</p>
<h2>2. Accounts</h2><p>A valid phone number is required to sign up. Do not share your password. Users under 18 use the service with the consent of a parent (legal guardian). Teachers must use students’ data for educational purposes only.</p>
<h2>3. AI content</h2><p>Some lessons and replies are generated by AI and may be wrong, incomplete or outdated. For important decisions (exams, grades) check with your teacher and official textbooks. Report inappropriate content with the “Report” button — we will review, fix or remove it.</p>
<h2>4. Not allowed</h2><ul><li>insults, threats, bullying, hate, adult or illegal content;</li><li>publishing other people’s personal data or photos without their consent;</li><li>attempts to hack the system, bypass limits or send automated bulk requests;</li><li>forcing the AI to produce harmful or non-educational content.</li></ul>
<p>We may restrict or delete accounts that break these rules without notice.</p>
<h2>5. Intellectual property</h2><p>The platform’s code, design and logo belong to the Operator. Your texts belong to you; we process them only to provide the service.</p>
<h2>6. Limitation of liability</h2><p>To the extent permitted by law, the Operator is not liable for indirect damages arising from use of the service.</p>
<h2>7. Account deletion</h2><p>You can delete your account at any time: Profile → “Delete account” or <a href="${c.delete_url}">follow these steps</a>.</p>
<h2>8. Governing law</h2><p>These terms are governed by the laws of the Republic of Kazakhstan. Contact: <a href="mailto:${c.email}">${c.email}</a>.</p>`,
  delete: (c) => `
<p>You can delete your AI-bolat account and its data at any time, free of charge.</p>
<h2>Option 1: in the app (instant)</h2><ol><li>Sign in to AI-bolat (website or Android app).</li><li>Open the <b>Profile</b> page.</li><li>Tap <b>“Delete account”</b> at the bottom and enter your password.</li></ol>
<p><a class="btn" href="/app/#/profile">Open profile →</a></p>
<h2>Option 2: by e-mail</h2><p>If you forgot your password or cannot sign in, e-mail <a href="mailto:${c.email}?subject=AI-bolat%20account%20deletion">${c.email}</a> with the account’s phone number. We will confirm ownership by SMS and delete the account within 10 business days. Parents can request deletion of their child’s account.</p>
<h2>What is deleted</h2><ul><li>the account (name, phone, password hash, settings);</li><li>lesson/test results, XP, progress and lab data;</li><li>all chats with Bolat and uploaded images;</li><li>your messages and reports;</li><li>for teachers — your classes, assignments and announcements (students keep their own accounts).</li></ul>
<h2>What may be kept</h2><p>Backups are overwritten automatically within ${c.backup_days} days. Anonymous aggregate statistics and generic AI-generated lesson texts without personal data may be kept.</p>`
};
