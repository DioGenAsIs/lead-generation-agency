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
    title: "Лидоген для онлайн-курсов: заявки через Яндекс и Telegram"
    subtitle: "Запускаем рекламу, подключаем сбор заявок (сайт + Telegram) и даём понятную воронку: лид → дозвон → продажа."
    actions:
      - type: Link
        label: Оставить заявку
        url: "/#lead"
      - type: Link
        label: Написать в Telegram
        url: "https://t.me/YOUR_TELEGRAM"

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
        width: narrow
        padding: [pt-24, pb-24, pr-4, pl-4]
---
