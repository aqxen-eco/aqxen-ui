const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  await prisma.badges.createMany({
    data: [
      {
        symbol: "CHA",
        name: "Charity",
        rarityCounts: "17",
      },
      {
        symbol: "TRA",
        name: "Transparency",
        rarityCounts: "22",
      },
      {
        symbol: "ELE",
        name: "Election",
        rarityCounts: "1",
      },
      {
        symbol: "DCM",
        name: "Documentation",
        rarityCounts: "7",
      },
      {
        symbol: "TKN",
        name: "Token",
        rarityCounts: "2",
      },
      {
        symbol: "RSP",
        name: "Charity",
        rarityCounts: "20",
      },
      {
        symbol: "PAR",
        name: "Participation",
        rarityCounts: "18",
      },
      {
        symbol: "RES",
        name: "Responsibility",
        rarityCounts: "0",
      },
    ],
  })
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })