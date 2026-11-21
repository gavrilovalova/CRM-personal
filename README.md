# Личная CRM

Приложение для своих контактов — людей, которых знаю лично: кто это, откуда знакомы, телефон и почта, о чём договорились. Не для продаж, а чтобы не терять людей и контекст общения с ними.

Что умеет:

- список всех контактов по алфавиту и поиск по имени
- добавление контакта и правка его данных
- карточка контакта с лентой заметок после разговоров

Идея и критерии успеха — в [`specs/01-продуктовая-идея.md`](specs/01-продуктовая-идея.md).

Стек: Next.js (App Router), TypeScript, React, Tailwind CSS, shadcn/ui, PostgreSQL в Docker, Drizzle ORM, pnpm.

## Что нужно установить

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — запущен (иконка кита в строке меню)
- [Node.js](https://nodejs.org/) LTS (версия 20.12 или новее)
- pnpm: `npm install -g pnpm` (или `corepack enable pnpm`)

## Первый запуск

1. Скачать проект и перейти в его папку:

   ```sh
   git clone https://github.com/gavrilovalova/CRM-personal.git
   cd CRM-personal
   ```

2. Создать файл с настройками базы — скопировать шаблон и заполнить значения:

   ```sh
   cp .env.example .env
   ```

   Например (пароль придумайте свой):

   ```sh
   POSTGRES_USER=personal_crm
   POSTGRES_PASSWORD=change_me
   POSTGRES_DB=personal_crm
   POSTGRES_PORT=5433
   DATABASE_URL=postgresql://personal_crm:change_me@localhost:5433/personal_crm
   ```

   В `DATABASE_URL` должны быть те же пользователь, пароль, порт и имя базы, что и в строках выше.

3. Установить библиотеки, запустить базу, создать таблицы и загрузить тестовые данные:

   ```sh
   pnpm install
   docker compose up -d
   pnpm db:migrate
   pnpm db:seed
   ```

   `pnpm db:seed` загружает 1000 тестовых контактов с заметками — только если база пустая.

4. Запустить приложение и открыть http://localhost:3000:

   ```sh
   pnpm dev
   ```

## Обычный запуск

1. `docker compose up -d` — запустить базу
2. `pnpm dev` — запустить приложение
3. Открыть http://localhost:3000

| Действие | Команда |
|---|---|
| Запустить приложение | `pnpm dev` |
| Остановить приложение | `Ctrl + C` в окне терминала, где запущен `pnpm dev` |
| Создать таблицы / применить новые миграции | `pnpm db:migrate` |
| Загрузить тестовые контакты в пустую базу | `pnpm db:seed` |
| **Стереть все контакты** и загрузить тестовые заново | `pnpm db:seed --reset` |
| Проверить код (типы и линтер) | `pnpm typecheck && pnpm lint` |

## База данных

PostgreSQL работает в Docker. Настройки подключения лежат в `.env` (его нет в git). Шаблон — `.env.example`.

Таблицы описаны в `db/schema.ts`, миграции лежат в папке `drizzle/`.

| Действие | Команда |
|---|---|
| Запустить базу | `docker compose up -d` |
| Проверить, что работает | `docker compose ps` — у `db` статус `healthy` |
| Остановить (данные сохранятся) | `docker compose stop` |
| Открыть консоль базы | `docker compose exec db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'` |

База доступна на `localhost:5433` (порт 5432 может быть занят другим Postgres на компьютере).

`docker compose down -v` удаляет базу вместе со всеми данными.

## Выкатка

Приложение работает на своём сервере: https://app.relma.online — браузер спросит логин и пароль (`BASIC_AUTH_USER` и `BASIC_AUTH_PASSWORD` в `.env` на сервере). Адрес `/health` открыт без пароля: по нему выкатка проверяет, что приложение и база отвечают.

**Как выкатить новую версию:** закоммитить изменения и отправить их на GitHub в ветку `main`. Дальше всё само:

1. GitHub Actions собирает образ приложения и кладёт его в GitHub Container Registry (GHCR) с номером коммита.
2. Копирует на сервер скрипты из `deploy/` и запускает `deploy/deploy.sh`.
3. На сервере: разовый контейнер применяет миграции базы → если они прошли, стартует новая версия → проверка `/health`.
4. Проверка `https://app.relma.online/health` снаружи.

Ход выкатки — вкладка **Actions** в репозитории на GitHub. Зелёная галочка — новая версия на сервере. Красный крестик — выкатка упала; если упали миграции, старая версия продолжает работать.

Откат — только вручную. Номер прошлой версии лежит на сервере в файле `/opt/crm/prod/previous-image`:

```sh
ssh crm
cat /opt/crm/prod/previous-image        # ghcr.io/gavrilovalova/crm-personal:<номер>
bash /opt/crm/prod/deploy.sh <номер>
```

Что на сервере:

| Что | Где |
|---|---|
| Приложение и база (docker compose, проект `prod`) | `/opt/crm/prod/` |
| Пароль базы, логин и пароль входа в приложение — только на сервере, права 600 | `/opt/crm/prod/.env` |
| nginx: https и пересылка на приложение | `/etc/nginx/sites-available/app.relma.online` |

Ключ, по которому GitHub заходит на сервер, и адрес сервера — в настройках репозитория: Settings → Secrets and variables → Actions.

## Структура проекта

| Папка / файл | Что там |
|---|---|
| `app/` | страницы: список контактов (`page.tsx`), карточка (`contacts/[id]/page.tsx`), серверные действия (`actions.ts`) |
| `components/` | части интерфейса; `components/ui/` — компоненты shadcn/ui |
| `db/` | схема таблиц, подключение к базе и запросы |
| `drizzle/` | миграции базы |
| `lib/` | проверка полей форм, форматирование дат и чисел |
| `scripts/seed.ts` | генератор тестовых данных |
| `scripts/migrate.mjs` | применение миграций на сервере |
| `Dockerfile` | как собирается образ приложения |
| `deploy/` | выкатка на сервер: состав контейнеров и скрипт |
| `.github/workflows/deploy.yml` | автовыкатка после пуша в `main` |
| `specs/` | продуктовая идея и критерии успеха |
