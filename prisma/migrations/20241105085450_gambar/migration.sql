-- CreateTable
CREATE TABLE "pictures" (
    "id" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "deskription" TEXT NOT NULL,
    "url_gambar" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pictures_pkey" PRIMARY KEY ("id")
);
