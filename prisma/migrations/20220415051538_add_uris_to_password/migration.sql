/*
  Warnings:

  - Added the required column `username` to the `Password` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Uri" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uri" TEXT NOT NULL,
    "passwordId" TEXT NOT NULL,
    CONSTRAINT "Uri_passwordId_fkey" FOREIGN KEY ("passwordId") REFERENCES "Password" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Password" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Password_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Password" ("categoryId", "id", "name", "password", "userId") SELECT "categoryId", "id", "name", "password", "userId" FROM "Password";
DROP TABLE "Password";
ALTER TABLE "new_Password" RENAME TO "Password";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
