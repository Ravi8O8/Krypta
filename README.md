<div align="center">

# 🔐 Krypta

**Локальная медиатека для Android и браузера**

[![Build APK](https://github.com/Ravi8O8/Krypta/actions/workflows/build.yml/badge.svg)](https://github.com/Ravi8O8/Krypta/actions/workflows/build.yml)
![Version](https://img.shields.io/badge/version-1.0.3-purple)
![Platform](https://img.shields.io/badge/platform-Android%20%7C%20Web-blue)
![Status](https://img.shields.io/badge/status-beta-orange)
[![Made with DeepSeek](https://img.shields.io/badge/Made%20with-DeepSeek-4D6BFE?logo=deepseek&logoColor=white)](https://deepseek.com)

</div>

---

## 💡 О проекте

**Krypta** — полностью офлайн-медиатека. Все фото и видео хранятся **только на устройстве**, в приватной файловой системе (OPFS) и IndexedDB. Никаких серверов, аккаунтов и синхронизации.

> ⚠️ **Тестовый проект.** Демонстрация возможностей Capacitor + Web APIs. Не используйте как единственное хранилище важных данных.

> 🤖 **Написано в паре с [DeepSeek](https://deepseek.com)** — весь код, архитектура и решения созданы с ИИ-ассистентом.

---

## ✨ Возможности

- 📁 **Папки с цветами** — организация медиатеки
- 🏷️ **Теги и избранное** — быстрый поиск по метаданным
- 🗑️ **Корзина с автоочисткой** — ничего не теряется
- 🔍 **Мгновенный поиск** — по имени и тегам
- 🎞️ **Слайдшоу и рандом** — просмотр в один клик
- 🔐 **Пароль на вход** — PBKDF2 + SHA-256
- 🗜️ **Сжатие фото** — экономия места
- 🔎 **Поиск дубликатов** — по хэшу файла
- 📤 **Экспорт в ZIP** — полный бэкап (потоково, без OOM)
- 📥 **Импорт из ZIP** — структура папок сохраняется
- 💾 **Скачивание файлов** — через системное меню Android
- 🎨 **4 темы** — Тёмная, Светлая, AMOLED, Nord
- 🖼️ **Кастомный фон** — своё изображение с прозрачностью
- ⌨️ **Своя клавиатура** — для устройств с лагающей нативной

---

## 🛠️ Технологии

| Слой | Стек |
|------|------|
| **Frontend** | Vanilla JS, HTML5, CSS3 (без фреймворков) |
| **Хранилище** | OPFS + IndexedDB |
| **Упаковка** | Capacitor 6 |
| **Плагины** | `@capacitor/filesystem`, `@capacitor/share` |
| **Сборка** | GitHub Actions → APK |
| **Криптография** | Web Crypto API (PBKDF2, SHA-256) |
| **AI-ассистент** | [DeepSeek](https://deepseek.com) |

---

## 📁 Структура

```

krypta/
├── .github/workflows/build.yml   # Автосборка APK
├── assets/                       # Иконки и splash
├── www/                          # Исходники
│   ├── index.html
│   ├── style.css
│   └── app.js
├── capacitor.config.json
└── package.json

```

---

## ⚠️ Ограничения

- 🚫 **Пароль защищает вход**, а не шифрует файлы на диске
- 🚫 **Импорт ZIP > 1.5 ГБ** — читается в память, может вылететь
- 🚫 **Нет облачной синхронизации** — философия проекта
- 🚫 **Тестовый статус** — не для критичных данных

---

## 🤝 Вклад

Личный тестовый проект. PR приветствуются, но приоритет — эксперименты, а не production-стабильность.

---

<div align="center">

<a href="https://deepseek.com">
  <img src="https://img.shields.io/badge/DeepSeek-4D6BFE?style=for-the-badge&logo=deepseek&logoColor=white" alt="DeepSeek" height="40">
</a>

[GitHub](https://github.com/Ravi8O8/Krypta) · [Issues](https://github.com/Ravi8O8/Krypta/issues)

</div>
