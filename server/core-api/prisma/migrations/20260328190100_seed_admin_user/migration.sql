INSERT INTO "User" (
  "id",
  "email",
  "passwordHash",
  "name",
  "role",
  "phone",
  "avatarUrl",
  "loyaltyProgress",
  "createdAt",
  "updatedAt"
)
VALUES (
  'u-admin-001',
  'admin@avishu.kz',
  '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121',
  'Aruzhan D.',
  'admin',
  '+7 701 900 44 11',
  'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=400&q=80',
  100,
  NOW(),
  NOW()
)
ON CONFLICT ("email") DO NOTHING;
