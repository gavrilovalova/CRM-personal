// Fills the database with realistic test contacts and notes.
// Usage: pnpm db:seed            (only into an empty database)
//        pnpm db:seed --reset    (wipes existing contacts and notes first)
import { fakerRU as faker } from "@faker-js/faker";
import { count, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { contacts, notes, type NewContact } from "../db/schema";

const CONTACT_COUNT = 1000;

try {
  process.loadEnvFile(".env");
} catch {
  // No .env file: rely on variables already set in the environment
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

type Sex = "male" | "female";
// [male form, female form]
type Gendered = readonly [string, string];

const pick = <T>(items: readonly T[]): T => faker.helpers.arrayElement(items);
const g = (sex: Sex, [male, female]: Gendered) => (sex === "male" ? male : female);

const ABOUT: Gendered[] = [
  ["Дизайнер интерфейсов", "Дизайнер интерфейсов"],
  ["Бывший коллега", "Бывшая коллега"],
  ["Однокурсник", "Однокурсница"],
  ["Одноклассник", "Одноклассница"],
  ["Сосед по подъезду", "Соседка по подъезду"],
  ["Стоматолог", "Стоматолог"],
  ["Тренер по плаванию", "Тренер по плаванию"],
  ["Юрист, помог с договором аренды", "Юрист, помогла с договором аренды"],
  ["Фотограф", "Фотограф"],
  ["Риелтор", "Риелтор"],
  ["Ментор по Python", "Ментор по Python"],
  ["Папа одноклассника сына", "Мама одноклассника сына"],
  ["Бухгалтер", "Бухгалтер"],
  ["Продакт-менеджер", "Продакт-менеджер"],
  ["Друг детства", "Подруга детства"],
  ["Мастер по ремонту", "Мастер по маникюру"],
  ["Преподаватель английского", "Преподаватель английского"],
  ["Рекрутер", "Рекрутер"],
  ["Основатель стартапа", "Основательница стартапа"],
  ["Врач-терапевт", "Врач-терапевт"],
  ["Архитектор", "Архитектор"],
  ["Аналитик данных", "Аналитик данных"],
  ["Бывший руководитель", "Бывшая руководительница"],
  ["Друг брата", "Подруга сестры"],
  ["Сосед по даче", "Соседка по даче"],
  ["Инструктор по йоге", "Инструктор по йоге"],
  ["Маркетолог", "Маркетолог"],
  ["Разработчик, фронтенд", "Разработчица, фронтенд"],
  ["Психолог", "Психолог"],
  ["Финансовый консультант", "Финансовый консультант"],
  ["Автомеханик", "Ветеринар"],
  ["Журналист", "Журналистка"],
  ["Организатор митапов", "Организатор митапов"],
  ["Партнёр по теннису", "Партнёр по теннису"],
];

const COMPANIES = [
  "Яндексе", "Сбере", "Авито", "Тинькофф", "Озоне", "VK", "Касперском",
  "МТС", "Skyeng", "Wildberries", "Ростелекоме", "одном стартапе", "агентстве",
];
const UNIVERSITIES = ["МГУ", "ВШЭ", "МФТИ", "СПбГУ", "Бауманке", "РУДН", "УрФУ", "НГУ"];
const EVENTS = [
  "конференции Highload++", "митапе по продукту", "хакатоне", "дне рождения у Лены",
  "свадьбе у друзей", "фестивале Пикник Афиши", "курсах английского", "воркшопе по UX",
  "забеге в Лужниках", "выставке в Гараже",
];
const FRIENDS = ["Машу", "Диму", "Олю", "Артёма", "Катю", "Сергея", "Аню", "Никиту"];
const PLACES = [
  "в спортзале", "в походе на Алтай", "в бассейне", "в поезде до Казани",
  "на даче", "в очереди в МФЦ", "в коворкинге", "в языковой школе", "на йоге",
];

function howWeMet(): string {
  const year = faker.number.int({ min: 2008, max: 2026 });
  return pick([
    () => `Работали вместе в ${pick(COMPANIES)}`,
    () => `Учились вместе в ${pick(UNIVERSITIES)}`,
    () => `Познакомились на ${pick(EVENTS)} в ${year}`,
    () => `Познакомились через ${pick(FRIENDS)}`,
    () => `Познакомились ${pick(PLACES)}`,
    () => `Соседи по ${pick(["дому", "даче", "офису", "коворкингу"])}`,
    () => `Вместе ${pick(["ходили в турклуб", "играли в футбол по выходным", "были в летнем лагере", "волонтёрили на фестивале"])}`,
  ])();
}

const TOPICS = [
  "переезд в Питер", "новую работу", "идею совместного проекта", "поездку в Грузию",
  "ремонт квартиры", "курс по UX", "ипотеку", "запуск своего продукта", "поиск няни",
  "книгу «Думай медленно… решай быстро»", "отпуск в Турции", "выбор школы для детей",
  "смену профессии", "покупку машины", "аренду офиса",
];
const AGREEMENTS = [
  "созвониться в пятницу", "встретиться после отпуска", "что я пришлю ссылку на вакансию",
  "сходить на концерт в ноябре", "обменяться контактами юристов", "вернуться к разговору через месяц",
  "что я познакомлю с Димой из маркетинга", "вместе сходить на митап", "что я перешлю презентацию",
  "списаться на следующей неделе", "сыграть в теннис в субботу",
];
const FACTS: Gendered[] = [
  ["Не пьёт кофе, только чай", "Не пьёт кофе, только чай"],
  ["Любит настольные игры, особенно «Каркассон»", "Любит настольные игры, особенно «Каркассон»"],
  ["Есть собака — корги по кличке Бублик", "Есть собака — корги по кличке Бублик"],
  ["Двое детей: Миша и Аня", "Двое детей: Миша и Аня"],
  ["Аллергия на орехи — учесть, если звать в гости", "Аллергия на орехи — учесть, если звать в гости"],
  ["Болеет за «Спартак»", "Болеет за «Спартак»"],
  ["Бегает марафоны", "Бегает марафоны"],
  ["Переехал в Казань", "Переехала в Казань"],
  ["Учит испанский", "Учит испанский"],
  ["Вегетарианец", "Вегетарианка"],
];

function agreement(): string {
  const text = pick(AGREEMENTS);
  return `Договорились${text.startsWith("что") ? "," : ""} ${text}.`;
}

function noteBody(sex: Sex): string {
  return pick([
    () => `Созвонились, обсудили ${pick(TOPICS)}. ${agreement()}`,
    () => `Встретились на кофе. ${g(sex, ["Рассказал", "Рассказала"])} про ${pick(TOPICS)}.`,
    () => `${g(sex, ["Написал", "Написала"])} в Telegram, спрашивал${g(sex, ["", "а"])} совета про ${pick(TOPICS)}. ${agreement()}`,
    () => g(sex, pick(FACTS)),
    () => `День рождения — ${faker.date.birthdate().toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}`,
    () => `${g(sex, ["Получил", "Получила"])} повышение — теперь руководит командой из ${faker.number.int({ min: 3, max: 25 })} человек.`,
    () => `Обещал${g(sex, ["", "а"])} прислать рекомендацию ${pick(["врача", "автосервиса", "школы английского", "бухгалтера"])}.`,
  ])();
}

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
  у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "",
  э: "e", ю: "yu", я: "ya",
};
const translit = (text: string) =>
  [...text.toLowerCase()].map((ch) => TRANSLIT[ch] ?? ch).join("");

function email(firstName: string, lastName: string): string {
  const first = translit(firstName);
  const last = translit(lastName);
  const local = pick([
    `${first}.${last}`,
    `${first[0]}.${last}`,
    `${last}${faker.number.int({ min: 1, max: 99 })}`,
    `${first}${last}`,
    `${first}_${faker.number.int({ min: 1980, max: 2005 })}`,
  ]);
  return `${local}@${pick(["gmail.com", "yandex.ru", "mail.ru", "icloud.com", "outlook.com"])}`;
}

function phone(): string {
  const d = (len: number) => faker.string.numeric({ length: len, allowLeadingZeros: true });
  return `+7 9${d(2)} ${d(3)}-${d(2)}-${d(2)}`;
}

function buildContact(): { sex: Sex; contact: NewContact } {
  const sex: Sex = faker.helpers.arrayElement(["male", "female"]);
  const firstName = faker.person.firstName(sex);
  const lastName = faker.person.lastName(sex);
  const createdAt = faker.date.past({ years: 3 });
  return {
    sex,
    contact: {
      name: `${firstName} ${lastName}`,
      about: faker.datatype.boolean(0.9) ? g(sex, pick(ABOUT)) : "",
      howWeMet: faker.datatype.boolean(0.85) ? howWeMet() : "",
      phone: faker.datatype.boolean(0.9) ? phone() : "",
      email: faker.datatype.boolean(0.75) ? email(firstName, lastName) : "",
      createdAt,
      updatedAt: createdAt,
    },
  };
}

async function main() {
  const reset = process.argv.includes("--reset");
  const client = postgres(databaseUrl!, { max: 1 });
  const db = drizzle({ client });

  try {
    const [{ value: existing }] = await db.select({ value: count() }).from(contacts);
    if (existing > 0 && !reset) {
      console.error(
        `The database already has ${existing} contacts. Nothing was changed.\n` +
          "To wipe them and load test data again, run: pnpm db:seed --reset",
      );
      process.exitCode = 1;
      return;
    }

    faker.seed(20261011);
    const built = Array.from({ length: CONTACT_COUNT }, buildContact);

    await db.transaction(async (tx) => {
      if (reset) {
        await tx.execute(sql`truncate table ${notes}, ${contacts} restart identity`);
      }

      const inserted = await tx
        .insert(contacts)
        .values(built.map(({ contact }) => contact))
        .returning({ id: contacts.id });

      const newNotes = inserted.flatMap(({ id }, index) => {
        const { sex, contact } = built[index];
        const noteCount = faker.helpers.weightedArrayElement([
          { weight: 30, value: 0 },
          { weight: 30, value: 1 },
          { weight: 20, value: 2 },
          { weight: 12, value: 3 },
          { weight: 8, value: 5 },
        ]);
        return Array.from({ length: noteCount }, () => ({
          contactId: id,
          body: noteBody(sex),
          createdAt: faker.date.between({ from: contact.createdAt!, to: new Date() }),
        }));
      });

      for (let i = 0; i < newNotes.length; i += 1000) {
        await tx.insert(notes).values(newNotes.slice(i, i + 1000));
      }

      console.log(`Inserted ${inserted.length} contacts and ${newNotes.length} notes.`);
    });
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
