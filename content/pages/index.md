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
# HERO
  - type: HeroSection
    elementId: hero
    colors: colors-f
    backgroundSize: full
    title: "Лидогенерация для бизнеса по всему миру"
    subtitle: "Запускаем рекламу и выстраиваем систему привлечения заявок в любых странах и каналах: от лида до продажи. Оставьте заявку удобным способом: сайт / Telegram / WhatsApp. Нужна консультация? Бот подскажет или запишем на созвон."
    actions:
      - type: Link
        label: Оставить заявку
        url: "/#lead"
      - type: Link
        label: Получить консультацию
        url: "/#lead"

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
