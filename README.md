# AVISHU Superapp

AVISHU Superapp — это full-stack проект премиального fashion-магазина с `web` и `mobile` клиентом, `Express` API, `Prisma`-слоем данных и `PostgreSQL`.

В репозитории реализованы:

- клиентская витрина магазина с отдельными `web` и `mobile` сценариями;
- лендинг, контентный слой и мультиязычность `ru / kk / en`;
- роли `client`, `admin`, `franchisee`, `production`, `support`;
- каталог, `PDP`, корзина, checkout, избранное, история просмотров;
- профиль с адресами, картами, loyalty-данными и уведомлениями;
- операционные кабинеты для обработки заказов;
- `Socket.io` для live-обновлений статусов.

Проект `AI Vision` в этот репозиторий не входит.

## Быстрый запуск

### 1. Требования

- `Node.js` 22+
- `npm` 10+
- `PostgreSQL` 15+ локально или через `Docker`

### 2. Установка зависимостей

Из корня проекта:

```bash
npm install
cd server/core-api
npm install
cd ../..
```

### 3. Настройка `env`

Создай файлы `.env` на основе шаблонов.

Корневой `.env` для `frontend`:

```env
EXPO_PUBLIC_CORE_API_URL=http://localhost:3001
```

`server/core-api/.env` для `backend`:

```env
PORT=3001
JWT_SECRET=change_me_for_local_dev
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/avishu_core?schema=public
```

Если приложение открывается на физическом телефоне, в корневом `.env` нельзя использовать `localhost`. Нужно указать локальный IP компьютера:

```env
EXPO_PUBLIC_CORE_API_URL=http://xxx.xxx.x.xx:3001
```

Телефон и компьютер должны быть в одной сети.

### 4. Подготовка базы данных

Если `PostgreSQL` уже установлен локально и база создана, этот блок можно выполнять без `Docker`.

Вариант через локальный `PostgreSQL`:

```bash
cd server/core-api
npx prisma generate
npx prisma migrate deploy
npm run db:seed
cd ../..
```

Вариант через `Docker`:

```bash
npm run db:up
cd server/core-api
npx prisma generate
npx prisma migrate deploy
npm run db:seed
cd ../..
```

### 5. Запуск проекта

Запуск `frontend` и `backend` одновременно:

```bash
npm run dev
```

Раздельный запуск:

```bash
npm run dev:web
npm run dev:core
```

### 6. Что открыть после запуска

- `web`: адрес из `Expo`, обычно `http://localhost:8081`
- `API health`: `http://localhost:3001/health`

### 7. Тестовые аккаунты

- `client@avishu.kz / Client123!`
- `admin@avishu.kz / Admin123!`
- `franchisee@avishu.kz / Franchisee123!`
- `production@avishu.kz / Production123!`
- `support@avishu.kz / Support123!`

## Команды разработки

Из корня проекта:

```bash
npm run dev
npm run dev:web
npm run dev:core
npm run db:up
npm run db:down
npm run db:migrate
npm run db:seed
npm run typecheck
```

Из `server/core-api`:

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db push
npx tsc --noEmit -p .
```

## Архитектура проекта

### `frontend`

Технологии:

- `Expo`
- `React Native`
- `Expo Router`
- `TypeScript`
- `Zustand`
- `i18next`
- `Socket.io client`

Зоны интерфейса:

- публичный лендинг;
- клиентский каталог и commerce flow;
- профиль пользователя;
- контентные страницы;
- операционные кабинеты ролей.

### `backend`

Технологии:

- `Node.js`
- `Express`
- `Prisma`
- `PostgreSQL`
- `Socket.io`
- `JWT`

Назначение `backend`:

- аутентификация и сессии;
- выдача `bootstrap` данных;
- управление профилем, адресами, картами;
- работа с каталогом и контентом;
- создание и обновление заказов;
- уведомления и live-события;
- `admin`-операции.

## Структура репозитория

```text
app/                    Expo Router routes
src/components/         общие UI-компоненты
src/features/           platform-specific и shared feature layers
src/lib/                API, theme, i18n, helpers
src/store/              Zustand store
server/core-api/src/    Express API
server/core-api/prisma/ schema, migrations, seed
assets/                 изображения и брендовые ресурсы
```

## Маршруты `frontend`

Публичные маршруты:

- `/` — лендинг магазина
- `/login` — вход
- `/content` — список контентных материалов
- `/content/[slug]` — статья, lookbook или campaign page

Клиентские маршруты:

- `/client` — витрина и каталог
- `/client/collection/[id]` — коллекция
- `/client/product/[id]` — карточка товара
- `/client/cart` — корзина
- `/client/checkout/[id]` — checkout
- `/client/saved` — saved items и repeat order
- `/profile` — профиль, адреса, карты, loyalty, уведомления

Операционные маршруты:

- `/admin` — управление каталогом и контентом
- `/franchisee` — операционная роль франчайзи
- `/production` — производственный контур
- `/support` — поддержка и сопровождение заказов

## Роли и права

### `client`

Доступ:

- просмотр каталога;
- работа с корзиной;
- оформление заказа;
- избранное;
- история просмотров;
- сохраненные адреса и карты;
- уведомления;
- история заказов и repeat order.

### `admin`

Доступ:

- создание, изменение и удаление товаров;
- управление контентом;
- контроль каталога и наполнения.

### `franchisee`

Доступ:

- работа с входящими заказами;
- перевод заказов по стадиям;
- контроль клиентских заявок.

### `production`

Доступ:

- производственная очередь;
- изменение статусов;
- комментарии;
- контроль исполнения.

### `support`

Доступ:

- сопровождение заказов;
- уведомления;
- обработка проблемных кейсов;
- возвраты, отмены, обмены и коммуникация.

## Модель данных

Основные `enum`:

- `Role`
- `ProductAvailability`
- `OrderStatus`
- `PaymentStatus`
- `DeliveryMethod`
- `PaymentMethod`
- `TryOnStatus`
- `MediaKind`
- `PriorityLevel`
- `NotificationType`
- `ContentKind`
- `LoyaltyTier`

Основные сущности:

- `User`
- `Session`
- `Category`
- `Product`
- `ProductMedia`
- `ProductVariant`
- `ProductFavorite`
- `ProductView`
- `SavedAddress`
- `SavedPaymentCard`
- `Reward`
- `Recommendation`
- `ContentEntry`
- `TryOnSession`
- `Order`
- `OrderComment`
- `OrderAttachment`
- `OrderAuditLog`
- `OrderTag`
- `Notification`

Схема находится в [server/core-api/prisma/schema.prisma](/c:/Users/Админ/PycharmProjects/AVISHU_Superapp/server/core-api/prisma/schema.prisma).

## API

Базовый префикс:

```text
/api/core/v1
```

Ключевые маршруты:

- `GET /health`
- `POST /api/core/v1/auth/login`
- `GET /api/core/v1/bootstrap`
- `PATCH /api/core/v1/profile`
- `POST /api/core/v1/profile/addresses`
- `PATCH /api/core/v1/profile/addresses/:id`
- `DELETE /api/core/v1/profile/addresses/:id`
- `POST /api/core/v1/profile/cards`
- `PATCH /api/core/v1/profile/cards/:id`
- `DELETE /api/core/v1/profile/cards/:id`
- `POST /api/core/v1/orders`
- `PATCH /api/core/v1/orders/:id/status`
- `PATCH /api/core/v1/orders/:id/workflow`
- `POST /api/core/v1/orders/:id/comments`
- `POST /api/core/v1/orders/:id/attachments`
- `PATCH /api/core/v1/notifications/:id/read`
- `GET /api/core/v1/content`
- `POST /api/core/v1/admin/products`
- `PATCH /api/core/v1/admin/products/:id`
- `DELETE /api/core/v1/admin/products/:id`
- `POST /api/core/v1/admin/content`
- `PATCH /api/core/v1/admin/content/:id`
- `DELETE /api/core/v1/admin/content/:id`

## Каталог и commerce-слой

В проекте реализованы:

- бренды, коллекции, дропы, сезонность и лимитированные позиции;
- фильтрация по размеру, цвету, материалу, посадке, availability и цене;
- `PDP` с `editorial story`, `size guide`, `care instructions`, `related looks`, `cross-sell`;
- избранное;
- история просмотров;
- корзина;
- checkout;
- repeat order.

## Контентный слой

Контентный слой предназначен для редакционного наполнения магазина и поддерживает:

- лендинг;
- журнал;
- lookbook;
- campaign page;
- коллекционные истории.

Контент хранится в `PostgreSQL` через `ContentEntry` и отдается из `backend`.

## Мультиязычность

Поддерживаются языки:

- `ru`
- `kk`
- `en`

Переключение языка доступно в интерфейсе. Локализация используется в клиентской части, профиле, публичных экранах и операционных кабинетах.

## Live-обновления

`Socket.io` используется для:

- синхронизации статусов заказов;
- обновления очередей;
- доставки изменений между клиентской и операционной частью.

## Mobile и web

Клиентская зона разделена на две `UI`-реализации:

- `web`-experience;
- `mobile`-experience.

Бизнес-логика, `store`, `API`, типы и данные остаются общими, а композиция экранов различается по платформе.

## Проверка проекта

Основные команды проверки:

```bash
npm run typecheck
cd server/core-api
npx tsc --noEmit -p .
```

Для проверки `Prisma`:

```bash
cd server/core-api
npx prisma generate
npx prisma migrate deploy
```

## Частые проблемы

### `EADDRINUSE`

Причина: порт уже занят другим процессом.

Проверка:

```bash
netstat -ano | findstr :3001
```

Завершение процесса:

```bash
taskkill /PID <PID> /F
```

### `Network request failed` на телефоне

Причина: в корневом `.env` указан `localhost`.

Решение:

- указать IP компьютера вместо `localhost`;
- убедиться, что телефон и компьютер находятся в одной сети;
- проверить доступность `http://<LOCAL_IP>:3001/health` с телефона.

### Старые ошибки `Prisma` в IDE

Если IDE показывает ошибки по `PrismaClient`, но проект уже собирается, нужно:

```bash
cd server/core-api
npx prisma generate
```

После этого перезапустить `TypeScript service` или IDE.

## Ограничения текущей реализации

В проекте пока отсутствуют production-интеграции:

- реальный `payment gateway`;
- объектное хранилище для файлов;
- production-ready `AI try-on backend`;
- внешняя `CRM`;
- полноценный `push`-канал уведомлений.

Текущая версия — это развитый продуктовый прототип с реальной архитектурной основой, а не финальный production release.
