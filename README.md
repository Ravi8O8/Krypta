<div align="center">

# 🔐 Krypta

**Твоя личная, полностью офлайн-медиатека.**

[![Build APK](https://github.com/Ravi8O8/Krypta/actions/workflows/build.yml/badge.svg)](https://github.com/Ravi8O8/Krypta/actions/workflows/build.yml)
![Version](https://img.shields.io/badge/version-1.0.4-purple)
![Platform](https://img.shields.io/badge/platform-Android%20%7C%20Web-blue)
![Status](https://img.shields.io/badge/status-beta-orange)
[![Made with DeepSeek](https://img.shields.io/badge/Made%20with-DeepSeek-4D6BFE?logo=deepseek&logoColor=white)](https://deepseek.com)

---

*Никаких серверов. Никаких аккаунтов. Никакой синхронизации. Только ваши файлы, защищенные на вашем устройстве.*

[Скачать APK](https://github.com/Ravi8O8/Krypta/releases) · [Сообщить об ошибке](https://github.com/Ravi8O8/Krypta/issues)

</div>

## ✨ Главное

| Фича | Описание |
| :--- | :--- |
| 📁 **Офлайн-хранилище** | Файлы живут в приватной ФС (OPFS) и IndexedDB. |
| ⚡ **Виртуализация** | Плавный скролл даже на 5000+ фото и видео. |
| 📋 **Копирование** | Перемещайте и копируйте файлы/папки в один клик. |
| 🎨 **4 темы** | Тёмная, Светлая, Тёплая (уютная) и Сепия (для глаз). |
| 🛡️ **Безопасность** | Защита входа паролем (PBKDF2 + SHA-256). |
| 📦 **ZIP-архивы** | Импорт и экспорт (стриминг без OOM) с сохранением папок. |
| 🗑️ **Умная корзина** | Автоочистка + отмена удаления (Undo). |
| 🏷️ **Порядок** | Папки с цветами, теги, избранное, поиск дубликатов. |

## 🛠️ Стек

- **Frontend:** Vanilla JS, HTML5, CSS3 (Zero dependencies)
- **Native:** Capacitor 6 (`@capacitor/filesystem`, `@capacitor/share`)
- **Storage:** OPFS + IndexedDB
- **Build:** GitHub Actions (авто-сборка APK)

## 🚀 Установка

1. Перейди в раздел **[Releases](https://github.com/Ravi8O8/Krypta/releases)**.
2. Скачай последний `Krypta.apk`.
3. Установи на Android (разреши установку из неизвестных источников).

> 💡 **Обновления ставятся поверх старой версии** без потери данных.

## ⚠️ Важно

- Это **тестовый проект** (Beta). Не храните здесь единственные копии важных файлов.
- Пароль защищает *вход в приложение*, но не шифрует сами файлы на диске.
- Огромные ZIP-архивы (>3 ГБ) импортируются долго (используется потоковое чтение).

---
<div align="center">
  <i>Создано в паре с <a href="https://deepseek.com">DeepSeek</a></i>
</div>
