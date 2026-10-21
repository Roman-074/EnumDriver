/* EMUN TAXI — strings: [ru, en, he]. Hebrew is the product default (RTL); the prototype
   shell starts in Russian for review and switches live (M20 or the panel). */
(function () {
  const ET = (window.ET = window.ET || {});
  const IDX = { ru: 0, en: 1, he: 2 };
  const T = {
    /* common */
    'common.cancel': ['Отмена', 'Cancel', 'ביטול'],
    'common.ok': ['Понятно', 'Got it', 'הבנתי'],
    'common.optional': ['необязательно', 'optional', 'אופציונלי'],
    'common.retry': ['Повторить', 'Try again', 'נסו שוב'],
    'common.save': ['Сохранить', 'Save', 'שמירה'],
    'a11y.back': ['Назад', 'Back', 'חזרה'],
    'a11y.close': ['Закрыть', 'Close', 'סגירה'],
    'a11y.clear': ['Очистить', 'Clear', 'ניקוי'],
    'a11y.prev': ['Предыдущий месяц', 'Previous month', 'החודש הקודם'],
    'a11y.next': ['Следующий месяц', 'Next month', 'החודש הבא'],
    'a11y.swap': ['Поменять местами', 'Swap pickup and destination', 'החלפת מוצא ויעד'],
    'tab.services': ['Услуги', 'Services', 'שירותים'],
    'tab.orders': ['Заказы', 'Orders', 'הזמנות'],
    'tab.profile': ['Профиль', 'Profile', 'פרופיל'],
    'net.offline': ['Нет подключения к интернету', 'No internet connection', 'אין חיבור לאינטרנט'],
    'err.emailFormat': ['Проверьте email — например, name@gmail.com', 'Check the email — e.g. name@gmail.com', 'בדקו את כתובת האימייל — למשל name@gmail.com'],
    'err.nameReq': ['Укажите имя', 'Enter your name', 'הזינו שם'],
    'err.agreeReq': ['Чтобы продолжить, примите условия', 'Accept the terms to continue', 'כדי להמשיך יש לאשר את התנאים'],
    'err.network': ['Нет соединения с сервером. Проверьте интернет и попробуйте ещё раз.', "Can't reach the server. Check your connection and try again.", 'אין חיבור לשרת. בדקו את החיבור לאינטרנט ונסו שוב.'],
    'err.server': ['Сервис временно недоступен. Попробуйте через минуту.', 'The service is temporarily unavailable. Try again in a minute.', 'השירות אינו זמין כרגע. נסו שוב בעוד דקה.'],
    'f.email': ['Email', 'Email', 'אימייל'],
    'f.name': ['Имя', 'Name', 'שם'],
    'f.namePh': ['Как к вам обращаться', 'What should we call you', 'איך לפנות אליכם'],

    /* M1 */
    'm1.checking': ['Проверяем сессию…', 'Checking your session…', 'בודקים התחברות…'],

    /* M2 */
    'm2.title': ['Вход в EMUN TAXI', 'Sign in to EMUN TAXI', 'כניסה ל-EMUN TAXI'],
    'm2.signIn': ['Войти в аккаунт', 'Sign in', 'כניסה לחשבון'],
    'm2.register': ['Создать новый аккаунт', 'Create a new account', 'יצירת חשבון חדש'],

    /* M3 */
    'm3.lead': ['Отправим код на ваш email', "We'll send a code to your email", 'נשלח קוד לאימייל שלכם'],
    'm3.getCode': ['Получить код', 'Get code', 'שליחת קוד'],
    'm3.sending': ['Отправляем…', 'Sending…', 'שולחים…'],
    'm3.notFound': ['Аккаунт {email} не найден. Возможно, вы ещё не регистрировались.', "No account found for {email}. Maybe you haven't registered yet.", 'לא נמצא חשבון עבור {email}. ייתכן שעדיין לא נרשמתם.'],
    'm3.createAcc': ['Создать аккаунт', 'Create account', 'יצירת חשבון'],
    'm3.changeEmail': ['Изменить email', 'Change email', 'שינוי אימייל'],
    'm3.limit': ['Слишком много запросов кода. Запросить новый можно через 5 минут.', 'Too many code requests. You can request a new one in 5 minutes.', 'יותר מדי בקשות לקוד. אפשר לבקש קוד חדש בעוד 5 דקות.'],

    /* M4 */
    'm4.title': ['Подтверждение email', 'Confirm email', 'אימות אימייל'],
    'm4.lead': ['Мы отправили 6-значный код на {email}.', 'We sent a 6-digit code to {email}.', 'שלחנו קוד בן 6 ספרות אל {email}.'],
    'm4.change': ['Изменить', 'Change', 'שינוי'],
    'm4.codeLabel': ['Код из письма', 'Code from the email', 'הקוד מהמייל'],
    'm4.confirm': ['Подтвердить', 'Confirm', 'אישור'],
    'm4.checking': ['Проверяем…', 'Checking…', 'בודקים…'],
    'm4.resendIn': ['Отправить код повторно можно через {t}', 'You can resend the code in {t}', 'אפשר לשלוח קוד חדש בעוד {t}'],
    'm4.resend': ['Отправить код ещё раз', 'Resend code', 'שליחת קוד חדש'],
    'm4.sent': ['Новый код отправлен', 'New code sent', 'נשלח קוד חדש'],
    'm4.spam': ['Письма нет? Проверьте папку «Спам» или «Промоакции».', 'No email? Check your Spam or Promotions folder.', 'המייל לא הגיע? בדקו בתיקיית הספאם או בקידומי מכירות.'],
    'm4.err.wrong': ['Неверный код. Осталось попыток: {n}', 'Incorrect code. Attempts left: {n}', 'קוד שגוי. נותרו {n} ניסיונות'],
    'm4.err.expired': ['Срок действия кода истёк. Запросите новый код.', 'The code has expired. Request a new one.', 'תוקף הקוד פג. בקשו קוד חדש.'],
    'm4.err.locked': ['Превышено число попыток. Запросите новый код.', 'Too many attempts. Request a new code.', 'חרגתם ממספר הניסיונות. בקשו קוד חדש.'],
    'm4.welcomeNew': ['Аккаунт создан', 'Account created', 'החשבון נוצר'],

    /* M5 */
    'm5.title': ['Регистрация', 'Sign up', 'הרשמה'],
    'm5.lead': ['Создайте аккаунт, если вы ещё не заказывали в EMUN TAXI. Email подтвердим кодом — пароль не нужен.', "Create an account if you haven't booked with EMUN TAXI before. We'll confirm your email with a code — no password needed.", 'צרו חשבון אם עוד לא הזמנתם ב-EMUN TAXI. נאמת את האימייל עם קוד — בלי סיסמה.'],
    'm5.emailHelp': ['На этот адрес придёт код подтверждения', "We'll send the confirmation code here", 'לכתובת הזו יישלח קוד האימות'],
    'm5.agree': ['Я принимаю {terms} и {privacy}', 'I accept the {terms} and the {privacy}', 'אני מאשר/ת את {terms} ואת {privacy}'],
    'm5.create': ['Создать аккаунт', 'Create account', 'יצירת חשבון'],
    'm5.haveAcc': ['У меня уже есть аккаунт', 'I already have an account', 'כבר יש לי חשבון'],
    'm5.exists': ['Этот email уже зарегистрирован. Войдите в существующий аккаунт — история заказов сохранится.', 'This email is already registered. Sign in to your existing account — your order history is kept.', 'האימייל הזה כבר רשום. התחברו לחשבון הקיים — היסטוריית ההזמנות נשמרת.'],
    'm5.sendFail': ['Не удалось отправить код на этот email. Проверьте адрес и попробуйте ещё раз.', "We couldn't send a code to this email. Check the address and try again.", 'לא הצלחנו לשלוח קוד לאימייל הזה. בדקו את הכתובת ונסו שוב.'],
    'doc.terms': ['Условия оказания услуг', 'Terms of Service', 'תנאי השירות'],
    'doc.privacy': ['Политика конфиденциальности', 'Privacy Policy', 'מדיניות הפרטיות'],
    'doc.privacyShort': ['Политику обработки данных', 'Data Processing Policy', 'מדיניות עיבוד הנתונים'],

    /* M6 */
    'm6.title': ['Услуги', 'Services', 'שירותים'],
    'm6.transferCta': ['Рассчитать стоимость', 'Check the price', 'לבדיקת המחיר'],
    'm6.other': ['Другие услуги', 'Other services', 'שירותים נוספים'],
    'm6.naTag': ['В разработке', 'In development', 'בפיתוח'],
    'm6.errT': ['Не удалось загрузить услуги', "Couldn't load services", 'לא הצלחנו לטעון את השירותים'],
    'm6.errS': ['Проверьте соединение и попробуйте ещё раз.', 'Check your connection and try again.', 'בדקו את החיבור ונסו שוב.'],
    'svc.transfer': ['Трансферы', 'Transfers', 'הסעות'],
    'svc.courier': ['Курьер', 'Courier', 'שליחויות'],
    'svc.courier.d': ['Доставка документов и посылок', 'Documents and parcels delivery', 'משלוח מסמכים וחבילות'],
    'svc.tours': ['Экскурсии', 'Tours', 'סיורים'],
    'svc.tours.d': ['Индивидуальные и групповые', 'Private and group tours', 'סיורים פרטיים וקבוצתיים'],
    'svc.driver': ['Личный водитель', 'Private driver', 'נהג צמוד'],
    'svc.driver.d': ['Авто с водителем на несколько часов', 'Car with a driver by the hour', 'רכב עם נהג לפי שעות'],

    /* M8 */
    'm8.title': ['Трансфер', 'Transfer', 'הסעה'],
    'm8.from': ['Откуда', 'From', 'מאיפה'],
    'm8.to': ['Куда', 'To', 'לאן'],
    'm8.when': ['Дата и время подачи', 'Pickup date & time', 'תאריך ושעת איסוף'],
    'm8.transport': ['Транспорт и цена', 'Vehicle & price', 'רכב ומחיר'],
    'm8.capacity': ['Пассажиров: {p}. Мест для багажа: {b}.', 'Passengers: {p}. Luggage capacity: {b}.', 'נוסעים: {p}. מקומות למטען: {b}.'],
    'm8.calc': ['Рассчитываем…', 'Calculating…', 'מחשבים…'],
    'm8.priceErr': ['Не удалось рассчитать цену. Попробуйте ещё раз.', "Couldn't calculate the price. Please try again.", 'לא הצלחנו לחשב את המחיר. נסו שוב.'],
    'm8.priceOffline': ['Нет интернета — цены обновятся, когда связь восстановится.', "You're offline — prices will update when you're back online.", 'אין חיבור — המחירים יתעדכנו כשהחיבור יחזור.'],
    'm8.hintSame': ['Точки маршрута совпадают', 'Pickup and destination are the same', 'נקודת המוצא והיעד זהות'],
    'm8.hintErr': ['Цена не рассчитана', 'Price not calculated', 'המחיר לא חושב'],
    'm8.order': ['Заказать', 'Book', 'להזמנה'],
    'm8.same': ['Точки маршрута совпадают — выберите другой пункт назначения', 'Pickup and destination are the same — choose another destination', 'נקודת המוצא והיעד זהות — בחרו יעד אחר'],
    'cls.eco': ['Эконом', 'Economy', 'אקונומי'],
    'cls.business': ['Бизнес', 'Business', 'ביזנס'],
    'cls.minivan': ['Минивэн', 'Minivan', 'מיניוואן'],
    'cls.minibus': ['Минибус', 'Minibus', 'מיניבוס'],

    /* M10 */

    /* M14 */
    'm14.title': ['Оплата', 'Payment', 'תשלום'],
    'm14.creating': ['Создаём заказ…', 'Creating your order…', 'יוצרים את ההזמנה…'],
    'm14.gettingLink': ['Готовим оплату…', 'Preparing payment…', 'מכינים את התשלום…'],
    'm14.creatingSub': ['Проверяем цену. Повторное нажатие не создаст второй заказ.', "Checking the price. Tapping again won't create a second order.", 'בודקים את המחיר. לחיצה נוספת לא תיצור הזמנה כפולה.'],
    'm14.errT': ['Не удалось получить ссылку на оплату', "Couldn't get the payment link", 'לא הצלחנו לקבל קישור לתשלום'],
    'm14.errS': ['Заказ {id} сохранён и не оплачен. Попробуйте ещё раз — деньги не спишутся дважды.', "Order {id} is saved and unpaid. Try again — you won't be charged twice.", 'ההזמנה {id} נשמרה וטרם שולמה. נסו שוב — לא תחויבו פעמיים.'],
    'm14.total': ['Сумма', 'Total', 'סכום'],
    'm14.pay': ['Перейти к оплате', 'Go to payment', 'למעבר לתשלום'],
    'm14.opening': ['Открываем браузер…', 'Opening browser…', 'פותחים דפדפן…'],

    /* M15 */
    'm15.title': ['Статус оплаты', 'Payment status', 'סטטוס תשלום'],
    'm15.checkT': ['Проверяем оплату', 'Checking payment', 'בודקים את התשלום'],
    'm15.checkS': ['Получаем подтверждение от банка. Обычно это занимает несколько секунд.', 'Getting confirmation from the bank. This usually takes a few seconds.', 'מקבלים אישור מהבנק. זה לוקח בדרך כלל כמה שניות.'],
    'm15.failT': ['Платёж не прошёл', 'Payment declined', 'התשלום נדחה'],
    'm15.failS': ['Банк отклонил оплату. Заказ {id} сохранён — оплатить его можно в «Моих заказах».', 'The bank declined the payment. Order {id} is saved — you can pay it from My orders.', 'הבנק דחה את התשלום. ההזמנה {id} נשמרה — אפשר לשלם עליה דרך ההזמנות שלי.'],
    'm15.cancelT': ['Оплата отменена', 'Payment cancelled', 'התשלום בוטל'],
    'm15.cancelS': ['Подтверждение 3-D Secure не завершено. Заказ {id} сохранён — оплатить его можно в «Моих заказах».', "3-D Secure wasn't completed. Order {id} is saved — you can pay it from My orders.", 'אימות 3-D Secure לא הושלם. ההזמנה {id} נשמרה — אפשר לשלם עליה דרך ההזמנות שלי.'],
    'm15.orders': ['Мои заказы', 'My orders', 'ההזמנות שלי'],
    'm15.openOrder': ['Открыть заказ', 'Open order', 'לפתיחת ההזמנה'],
    'm15.wait': ['Дождитесь результата проверки', 'Please wait for the check to finish', 'המתינו לסיום הבדיקה'],

    /* M16 */
    'm16.okT': ['Оплата прошла', 'Payment successful', 'התשלום התקבל'],
    'm16.okS': ['Оплата прошла. Оператор подтвердит заказ и назначит водителя — статус обновится в разделе «Заказы».', 'Payment received. An operator will confirm the order and assign a driver — track the status in Orders.', 'התשלום התקבל. נציג יאשר את ההזמנה וישבץ נהג — הסטטוס יתעדכן בלשונית "הזמנות".'],
    'm16.number': ['Номер заказа', 'Order number', 'מספר הזמנה'],
    'm16.payment': ['Оплата', 'Payment', 'תשלום'],
    'm16.home': ['На главную', 'Go to home', 'למסך הראשי'],

    /* M17 */
    'm17.title': ['Заказы', 'Orders', 'הזמנות'],
    'm17.active': ['Активные', 'Active', 'פעילות'],
    'm17.done': ['Завершённые', 'Past', 'שהסתיימו'],
    'm17.refresh': ['Обновить', 'Refresh', 'רענון'],
    'm17.refreshed': ['Список обновлён', 'List updated', 'הרשימה עודכנה'],
    'm17.errT': ['Не удалось загрузить заказы', "Couldn't load orders", 'לא הצלחנו לטעון את ההזמנות'],
    'm17.errS': ['Проверьте соединение и обновите список.', 'Check your connection and refresh.', 'בדקו את החיבור ורעננו.'],
    'm17.emptyT': ['Активных заказов нет', 'No active orders', 'אין הזמנות פעילות'],
    'm17.emptyS': ['Оформите трансфер — заказ появится здесь со статусом и данными водителя.', "Book a transfer — it'll appear here with its status and driver details.", 'הזמינו הסעה — היא תופיע כאן עם הסטטוס ופרטי הנהג.'],
    'm17.newTransfer': ['Оформить трансфер', 'Book a transfer', 'הזמנת הסעה'],
    'm17.emptyDoneT': ['Здесь появятся прошлые поездки', 'Past trips will appear here', 'כאן יופיעו נסיעות קודמות'],
    'm17.emptyDoneS': ['Завершённые и отменённые заказы хранятся в истории.', 'Completed and cancelled orders are kept in your history.', 'הזמנות שהושלמו או בוטלו נשמרות בהיסטוריה.'],
    'm17.loadingMore': ['Загружаем историю…', 'Loading history…', 'טוענים היסטוריה…'],
    'm17.showMore': ['Показать ещё', 'Show more', 'להציג עוד'],
    'm17.allLoaded': ['Это все заказы', "That's all your orders", 'אלה כל ההזמנות'],
    'st.awaiting_payment': ['Ожидает оплаты', 'Awaiting payment', 'ממתינה לתשלום'],
    'st.awaiting_confirmation': ['Ожидает подтверждения', 'Awaiting confirmation', 'ממתינה לאישור'],
    'st.confirmed': ['Подтверждён', 'Confirmed', 'אושרה'],
    'st.driver_assigned': ['Водитель назначен', 'Driver assigned', 'שובץ נהג'],
    'st.completed': ['Завершён', 'Completed', 'הושלמה'],
    'st.cancelled': ['Отменён', 'Cancelled', 'בוטלה'],
    'st.rejected': ['Отклонён', 'Rejected', 'נדחתה'],
    'pay.pending': ['Проверяется', 'Checking', 'בבדיקה'],
    'pay.succeeded': ['Оплачено', 'Paid', 'שולם'],
    'pay.failed': ['Платёж отклонён', 'Declined', 'נדחה'],
    'pay.unpaid': ['Не оплачено', 'Unpaid', 'לא שולם'],
    'pay.refund_pending': ['Возврат в процессе', 'Refund in progress', 'החזר בטיפול'],
    'pay.refunded': ['Возвращено', 'Refunded', 'הוחזר'],

    /* M18 */
    'm18.title': ['Заказ {id}', 'Order {id}', 'הזמנה {id}'],
    'm18.titleShort': ['Заказ', 'Order', 'הזמנה'],
    'm18.notFound': ['Заказ не найден', 'Order not found', 'ההזמנה לא נמצאה'],
    'm18.st.awaiting_payment': ['Ожидает оплаты', 'Awaiting payment', 'ממתינה לתשלום'],
    'm18.st.awaiting_confirmation': ['Ожидает подтверждения', 'Awaiting confirmation', 'ממתינה לאישור'],
    'm18.st.confirmed': ['Заказ подтверждён', 'Order confirmed', 'ההזמנה אושרה'],
    'm18.st.driver_assigned': ['Водитель назначен', 'Driver assigned', 'שובץ נהג'],
    'm18.st.completed': ['Поездка завершена', 'Trip completed', 'הנסיעה הסתיימה'],
    'm18.st.cancelled': ['Заказ отменён', 'Order cancelled', 'ההזמנה בוטלה'],
    'm18.st.rejected': ['Заказ отклонён', 'Order rejected', 'ההזמנה נדחתה'],
    'm18.refundPending': ['Возврат {p} оформлен. Деньги вернутся на карту — срок зачисления зависит от банка.', 'A refund of {p} has been issued. It will return to your card — timing depends on your bank.', 'בוצעה בקשת החזר של {p}. הכסף יחזור לכרטיס — מועד הזיכוי תלוי בבנק.'],
    'm18.refunded': ['Возврат {p} выполнен полностью.', '{p} was refunded in full.', 'סכום של {p} הוחזר במלואו.'],
    'm18.callSupport': ['Позвонить в поддержку', 'Call support', 'התקשרות לתמיכה'],
    'm18.supportDemo': ['Звонок в поддержку — демо', 'Support call — demo', 'שיחה לתמיכה — הדגמה'],
    'm18.payNow': ['Оплатить · {p}', 'Pay · {p}', 'לתשלום · {p}'],
    'm18.newStatus': ['Новый статус: {s}', 'New status: {s}', 'סטטוס חדש: {s}'],
    'm18.upToDate': ['Статус актуален', 'Status is up to date', 'הסטטוס עדכני'],

    /* M19 */
    'm19.title': ['Профиль', 'Profile', 'פרופיל'],
    'm19.verified': ['Email подтверждён', 'Email verified', 'האימייל אומת'],
    'm19.version': ['версия', 'version', 'גרסה'],




    /* M23 */
    'm23.title': ['Удалить аккаунт', 'Delete account', 'מחיקת חשבון'],
    'm23.screen': ['Удаление аккаунта', 'Account deletion', 'מחיקת חשבון'],
    'm23.q': ['Удалить аккаунт?', 'Delete your account?', 'למחוק את החשבון?'],
    'm23.sub': ['Удаление необратимо. Если есть активный заказ, удалить аккаунт можно только после его завершения.', "Deletion can't be undone. If you have an active order, you can delete the account only after it's finished.", 'המחיקה אינה הפיכה. אם יש הזמנה פעילה, אפשר למחוק את החשבון רק לאחר סיומה.'],
    'm23.c1': ['Профиль и подтверждённый email будут удалены', 'Your profile and verified email will be deleted', 'הפרופיל והאימייל המאומת יימחקו'],
    'm23.c2': ['История заказов и данные поездок будут удалены', 'Your order history and trip data will be deleted', 'היסטוריית ההזמנות ונתוני הנסיעות יימחקו'],
    'm23.c3': ['Восстановить аккаунт будет невозможно', "The account can't be restored", 'לא ניתן יהיה לשחזר את החשבון'],
    'm23.c4': ['Для новых заказов понадобится зарегистрироваться заново', "You'll need to sign up again to book", 'כדי להזמין שוב תצטרכו להירשם מחדש'],

    'm14.toPay': ['К оплате', 'Amount due', 'לתשלום'],
    'm14.secure': ['Откроется защищённая страница банка', 'The bank\'s secure page will open', 'ייפתח דף מאובטח של הבנק'],
    'm18.when': ['Дата и время', 'Date & time', 'תאריך ושעה'],
    'm18.cls': ['Класс авто', 'Car class', 'סוג רכב'],
    'tm.from': ['Откуда', 'From', 'מאיפה'],
    'tm.to': ['Куда', 'To', 'לאיפה'],
    'tm.search': ['Поиск…', 'Search…', 'חפש…'],
    'tm.recent': ['Недавние', 'Recent', 'לאחרונה'],
    'tm.notFound': ['Города не найдены', 'No cities found', 'לא נמצאו ערים'],
    'tm.netErr': ['Проблема с подключением к интернету', 'Internet connection problem', 'נתקל בבעיות בחיבור לאינטרנט'],
    'tm.language': ['Язык', 'Language', 'שפה'],
    'tm.currency': ['Валюта', 'Currency', 'מטבע'],
    'cur.dollar': ['Доллар', 'Dollar', 'דולר'],
    'cur.euro': ['Евро', 'Euro', 'יורו'],
    'cur.shekel': ['Шекель', 'Shekel', 'שקל'],
    /* sheets */
    'sh.del.t': ['Удалить аккаунт навсегда?', 'Delete account forever?', 'למחוק את החשבון לצמיתות?'],
    'sh.del.s': ['Профиль, email и история заказов будут удалены без возможности восстановления.', 'Your profile, email and order history will be deleted permanently.', 'הפרופיל, האימייל והיסטוריית ההזמנות יימחקו ללא אפשרות שחזור.'],
    'sh.del.go': ['Удалить навсегда', 'Delete forever', 'מחיקה לצמיתות'],
    'sh.del.busy': ['Удаляем…', 'Deleting…', 'מוחקים…'],
    'sh.blk.t': ['Сейчас удалить аккаунт нельзя', "You can't delete the account yet", 'אי אפשר למחוק את החשבון כרגע'],
    'sh.blk.s': ['У вас есть активный заказ {id}. Удалить аккаунт можно после его завершения или отмены через поддержку.', "You have an active order {id}. You can delete the account after it's completed or cancelled via support.", 'יש לכם הזמנה פעילה {id}. אפשר למחוק את החשבון לאחר שתסתיים או תבוטל דרך התמיכה.'],
    'sh.blk.orders': ['Открыть заказы', 'Open orders', 'להזמנות'],
    'sh.derr.t': ['Не удалось удалить аккаунт', "Couldn't delete the account", 'לא הצלחנו למחוק את החשבון'],
    'sh.derr.s': ['Произошла ошибка на сервере. Аккаунт не изменён — попробуйте ещё раз.', "A server error occurred. Your account wasn't changed — please try again.", 'אירעה שגיאה בשרת. החשבון לא השתנה — נסו שוב.'],
    'sh.done.t': ['Аккаунт удалён', 'Account deleted', 'החשבון נמחק'],
    'sh.done.s': ['Все ваши данные удалены из системы. Спасибо, что были с EMUN TAXI.', 'All your data has been deleted. Thank you for riding with EMUN TAXI.', 'כל הנתונים שלכם נמחקו מהמערכת. תודה שהייתם איתנו ב-EMUN TAXI.'],

    /* external browser simulation */
    'br.label': ['Внешний браузер · симуляция для прототипа', 'External browser · prototype simulation', 'דפדפן חיצוני · הדמיה לאב-טיפוס'],
    'br.payTitle': ['Оплата заказа', 'Order payment', 'תשלום על ההזמנה'],
    'br.processing': ['Подтверждаем платёж…', 'Confirming payment…', 'מאשרים את התשלום…'],
    'br.confirmT': ['Подтверждение платежа', 'Payment confirmation', 'אישור תשלום'],
    'br.confirmS': ['Введите код подтверждения, который банк отправил на {email}.', 'Enter the confirmation code your bank sent to {email}.', 'הזינו את קוד האימות שהבנק שלח אל {email}.'],
    'br.sms': ['Код из письма', 'Code from the email', 'הקוד מהמייל'],
    'br.confirm': ['Подтвердить', 'Confirm', 'אישור'],
    'br.cancel': ['Отменить оплату', 'Cancel payment', 'ביטול התשלום'],
    'br.test': ['Тест: ответ банка', 'Test: bank response', 'בדיקה: תשובת הבנק'],
    'br.r.success': ['Успех', 'Success', 'הצלחה'],
    'br.r.failed': ['Отказ', 'Declined', 'דחייה'],
    'br.docRev': ['Текст документа предоставляет заказчик.', 'Document text is provided by the client.', 'נוסח המסמך יסופק על ידי הלקוח.']
  };

  ET.I18N = T;
  ET.t = function (lang, key, vars) {
    const e = T[key];
    let s;
    if (!e) { console.warn('[i18n] missing', key); s = key; }
    else s = e[IDX[lang]] != null ? e[IDX[lang]] : e[0];
    if (lang === 'he') s = s.replace(/3-D Secure/g, '\u20663-D Secure\u2069');
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return s;
  };
})();
