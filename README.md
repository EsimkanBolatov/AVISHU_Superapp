# AVISHU Superapp Core MVP

MVP по проекту №1 из ТЗ: `Expo Router` frontend + `Express + Socket.io` core API. Проект №2 (`AI Vision`) сознательно не включен в реализацию.

## Что уже есть

- Три ролевых сценария: клиент, франчайзи, цех.
- Премиальная монохромная дизайн-система с light/dark темой.
- Адаптивные экраны для web/mobile.
- Сквозной realtime-поток заказа: клиент создает, франчайзи переводит в производство, цех завершает.
- Локализация заготовлена для `ru`, `kk`, `en`.
- Prisma-схема для `PostgreSQL` добавлена как контракт на следующий этап.

## MVP-допущение

Текущий runtime `core-api` работает на in-memory данных, чтобы проект запускался сразу без локального PostgreSQL. При этом схема под `Prisma/PostgreSQL` уже лежит в [server/core-api/prisma/schema.prisma](/c:/Users/Админ/PycharmProjects/AVISHU_Superapp/server/core-api/prisma/schema.prisma) и готова для следующего шага интеграции.

## Запуск

1. Установить зависимости core API:

```bash
cd server/core-api
npm install
```

2. Вернуться в корень и поднять frontend + API:

```bash
npm run dev
```

3. Либо запускать по отдельности:

```bash
npm run dev:web
npm run dev:core
```

## Переменные окружения

Корень:

```bash
EXPO_PUBLIC_CORE_API_URL=http://localhost:3000
```

Core API:

```bash
PORT=3000
JWT_SECRET=super_hackathon_secret_avishu
```

## Демо-флоу

1. Войти как `Клиент`, оформить заказ на карточке товара.
2. Переключиться на роль `Франчайзи` в профиле и перевести заказ в производство.
3. Переключиться на роль `Цех` и завершить этап.
4. Вернуться к клиенту и увидеть статус `Готово`.
