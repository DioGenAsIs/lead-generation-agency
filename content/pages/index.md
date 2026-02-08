---
type: PageLayout
title: Home
colors: colors-a
backgroundImage:
  type: BackgroundImage
  url: /images/bg1.jpg
  backgroundSize: cover
  backgroundPosition: center
  backgroundRepeat: no-repeat
  opacity: 75

sections:
  # HERO
  - type: HeroSection
    elementId: hero
    colors: colors-f
    backgroundSize: full
    title: >-
      Лидоген для онлайн-курсов: заявки через Яндекс и Telegram
    subtitle: >-
      Запускаем рекламу, подключаем сбор заявок (сайт + Telegram) и даём понятную
      воронку: лид → дозвон → продажа. Можно стартовать без сложных интеграций.
    actions:
      - type: Link
        label: Оставить заявку
        url: /#lead
      - type: Link
        label: Написать в Telegram
        url: https://t.me/YOUR_TELEGRAM
    styles:
      self:
        height: auto
        width: wide
        margin: [mt-0, mb-0, ml-0, mr-0]
        padding: [pt-36, pb-48, pl-4, pr-4]
        flexDirection: row
        textAlign: left

  # CASES (можно использовать твои projects как "кейсы")
  - type: FeaturedProjectsSection
    elementId: cases
    colors: colors-f
    variant: variant-b
    subtitle: Кейсы
    showDate: false
    showDescription: true
    showFeaturedImage: true
    showReadMoreLink: true
    actions:
      - type: Link
        label: Смотреть все кейсы
        url: /projects
    projects:
      - content/pages/projects/project-two.md
      - content/pages/projects/project-three.md
      - content/pages/projects/project-one.md
    styles:
      self:
        height: auto
        width: wide
        padding: [pt-24, pb-24, pl-4, pr-4]
        textAlign: left

  # SERVICES (временно как отдельная "контактная" секция с текстом — если у темы есть FeaturesSection, лучше его)
  - type: ContactSection
    elementId: services
    colors: colors-f
    backgroundSize: full
    title: "Что мы делаем"
    form:
      type: FormBlock
      elementId: services-note
      fields:
        - type: CheckboxFormControl
          name: srv_ads
          label: "Настройка рекламы (Яндекс Поиск/РСЯ)"
          isRequired: false
          width: full
        - type: CheckboxFormControl
          name: srv_funnel
          label: "Воронка: лендинг + Telegram + сбор заявок"
          isRequired: false
          width: full
        - type: CheckboxFormControl
          name: srv_analytics
          label: "Аналитика: лид → дозвон → продажа"
          isRequired: false
          width: full
        - type: CheckboxFormControl
          name: srv_opt
          label: "Оптимизация CPL/CR и качество лидов"
          isRequired: false
          width: full
      submitLabel: "Понятно ✅"
      styles:
        self:
          textAlign: left
    styles:
      self:
        height: auto
        width: narrow
        margin: [mt-0, mb-0, ml-0, mr-0]
        padding: [pt-24, pb-24, pr-4, pl-4]
        flexDirection: row
        textAlign: left

  # LEAD FORM
  - type: ContactSection
    elementId: lead
    colors: colors-f
    backgroundSize: full
    title: "Оставить заявку"
    form:
      type: FormBlock
      elementId: lead-form
      fields:
        - type: TextFormControl
          name: name
          label: Имя
          hideLabel: true
          placeholder: "Имя (необязательно)"
          isRequired: false
          width: 1/2

        - type: TextFormControl
          name: phone
          label: Телефон
          hideLabel: true
          placeholder: "Телефон (обязательно)"
          isRequired: true
          width: 1/2

        - type: TextFormControl
          name: telegram
          label: Telegram
          hideLabel: true
          placeholder: "Telegram @username (необязательно)"
          isRequired: false
          width: 1/2

        - type: TextFormControl
          name: course
          label: Курс
          hideLabel: true
          placeholder: "Курс/ниша (опционально)"
          isRequired: false
          width: 1/2

        - type: TextFormControl
          name: budget
          label: Бюджет
          hideLabel: true
          placeholder: "Бюджет в день (опционально)"
          isRequired: false
          width: full

        - type: CheckboxFormControl
          name: consent
          label: "Согласен на обработку персональных данных"
          isRequired: true
          width: full

      submitLabel: "Отправить заявку 🚀"
      styles:
        self:
          textAlign: center
    styles:
      self:
        height: auto
        width: narrow
        margin: [mt-0, mb-0, ml-0, mr-0]
        padding: [pt-24, pb-24, pr-4, pl-4]
        flexDirection: row
        textAlign: left
---
