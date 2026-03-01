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
    title: "Лидогенерация под ключ: реклама + аналитика + воронка продаж"
    subtitle: 'Запускаем и ведём рекламные кампании, улучшаем конверсию посадочной страницы и настраиваем измеримую аналитику. Прогноз CPL за 24 часа после получения вводных: ниша, гео, бюджет, сайт/офер.'
    text: 'Обычно отвечаем в течение 15 минут в рабочее время. Без спама — только 3 уточняющих вопроса по нише, гео и бюджету.'
    actions:
      - type: Button
        label: Получить аудит и план
        url: "/#lead"
        style: primary
      - type: Button
        label: Написать в Telegram
        url: "https://t.me/YOUR_TELEGRAM"
        style: secondary
      - type: Button
        label: Написать в WhatsApp
        url: "https://wa.me/79991234567"
        style: secondary

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
          placeholder: "Имя (обязательно)"
          isRequired: true
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
          placeholder: "Telegram @username (если нет WhatsApp)"
          isRequired: false
          width: 1/2

        - type: TextFormControl
          name: whatsapp
          label: WhatsApp
          hideLabel: true
          placeholder: "WhatsApp (номер, если нет Telegram)"
          isRequired: false
          width: 1/2

        - type: TextFormControl
          name: website
          label: Ссылка на сайт
          hideLabel: true
          placeholder: "Ссылка на сайт (опционально)"
          isRequired: false
          width: full

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
