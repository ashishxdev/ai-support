import { prisma } from "../lib/prisma.js";

async function main() {
  await prisma.fAQ.deleteMany();

  await prisma.fAQ.createMany({
    data: [
      {
        question: "Refund Policy",
        answer:
          "Subscription charges and WhatsApp conversation charges are non-refundable.",
      },
      {
        question: "How do I cancel my subscription?",
        answer:
          "You must cancel your subscription through Settings in Spur before the next billing date.",
      },
      {
        question: "What happens to AI credits after cancellation?",
        answer:
          "Remaining wallet balance and AI credits are forfeited and are non-recoverable.",
      },
      {
        question: "Support Contact",
        answer: "For questions about the service, contact support@spurnow.com.",
      },
      {
        question: "Account Responsibility",
        answer:
          "Users are responsible for maintaining the confidentiality of their account and password.",
      },
      {
        question: "Governing Law",
        answer: "These Terms are governed by the laws of India.",
      },
      {
        question: "Termination",
        answer:
          "Spur may terminate or suspend access to the service at its discretion.",
      },
    ],
  });

  console.log("FAQ Seeded Successfully");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
