import argon2 from "argon2";
import { faker, fakerRU } from "@faker-js/faker";
import { db, schema } from ".";

const LETTERS = "АВЕКМНОРСТУХ".split("");
const REGIONS = [
  "01",
  "101",
  "02",
  "102",
  "702",
  "03",
  "103",
  "04",
  "05",
  "105",
  "06",
  "07",
  "08",
  "09",
  "109",
  "10",
  "11",
  "111",
  "12",
  "13",
  "113",
  "14",
  "15",
  "115",
  "16",
  "116",
  "716",
  "17",
  "18",
  "118",
  "19",
  "20",
  "95",
  "21",
  "121",
  "22",
  "122",
  "23",
  "93",
  "123",
  "193",
  "323",
  "24",
  "84",
  "88",
  "124",
  "25",
  "125",
  "725",
  "26",
  "126",
  "27",
  "127",
  "28",
  "29",
  "30",
  "130",
  "31",
  "131",
  "32",
  "33",
  "34",
  "134",
  "35",
  "36",
  "136",
  "37",
  "38",
  "138",
  "39",
  "91",
  "139",
  "40",
  "41",
  "42",
  "142",
  "43",
  "44",
  "45",
  "46",
  "47",
  "147",
  "48",
  "49",
  "50",
  "90",
  "150",
  "190",
  "250",
  "550",
  "750",
  "790",
  "51",
  "52",
  "152",
  "252",
  "53",
  "54",
  "154",
  "754",
  "55",
  "155",
  "56",
  "156",
  "57",
  "58",
  "158",
  "59",
  "159",
  "60",
  "61",
  "161",
  "761",
  "62",
  "63",
  "163",
  "763",
  "64",
  "164",
  "65",
  "66",
  "96",
  "196",
  "67",
  "68",
  "69",
  "169",
  "70",
  "71",
  "72",
  "172",
  "73",
  "173",
  "74",
  "174",
  "774",
  "75",
  "76",
  "77",
  "97",
  "99",
  "177",
  "197",
  "199",
  "777",
  "797",
  "799",
  "977",
  "78",
  "98",
  "178",
  "198",
  "79",
  "80",
  "180",
  "81",
  "181",
  "82",
  "182",
  "83",
  "84",
  "184",
  "85",
  "185",
  "86",
  "186",
  "87",
  "89",
  "92",
  "192",
  "188",
  "94",
];

const createFakeUser = (): typeof schema.users.$inferInsert => {
  const sex = faker.helpers.arrayElement(["male", "female"]);
  return {
    firstName: fakerRU.person.firstName(sex),
    lastName: fakerRU.person.lastName(sex),
    middleName: fakerRU.person.middleName(sex),
  };
};

const createFakeNumber = (
  userId: number,
): typeof schema.numbers.$inferInsert => {
  const l1 = faker.helpers.arrayElement(LETTERS);
  const l2 = faker.helpers.arrayElement(LETTERS);
  const l3 = faker.helpers.arrayElement(LETTERS);
  const num = faker.number
    .int({ min: 1, max: 999 })
    .toString()
    .padStart(3, "0");
  const reg = faker.helpers.arrayElement(REGIONS);
  return {
    number: l1 + num + l2 + l3 + reg,
    userId,
    car:
      fakerRU.vehicle.color() +
      " " +
      fakerRU.vehicle.manufacturer() +
      " " +
      fakerRU.vehicle.model(),
  };
};

const createAmount = <T>(createFn: () => T, amount: number) => {
  const result: T[] = [];
  while (result.length < amount) {
    result.push(createFn());
  }
  return result;
};

await db.delete(schema.numbers);
await db.delete(schema.users);
console.log("deleted the whole database");

const users = await db
  .insert(schema.users)
  .values(createAmount(createFakeUser, 100))
  .returning();
console.log("seeded users");

const numbers = await db
  .insert(schema.numbers)
  .values(users.map(({ id: userId }) => createFakeNumber(userId)))
  .returning();
console.log("seeded numbers");

await db.insert(schema.admins).values({
  login: "admin",
  passwordHash: await argon2.hash("admin"),
});
console.log("seeded admins");
