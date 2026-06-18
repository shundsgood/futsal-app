import "dotenv/config";

async function main() {
  console.log("Seed complete (no data to seed).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
