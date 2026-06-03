import { prisma } from "../lib/prisma.js";

async function main() {
  await prisma.fAQ.deleteMany();

  await prisma.fAQ.createMany({
    data: [
      {
        question: "What is Spur?",
        answer:
          "Spur is a multi-channel AI Agent for marketing and customer support that helps you sell more, support better, and automate everything. It links your website, Instagram, Facebook, and WhatsApp accounts to one platform.",
      },
      {
        question: "What features are included in Spur?",
        answer:
          "Spur includes marketing automation features, a chatbot builder, 12 pre-made segments, 10 e-commerce specific workflows (like Abandoned Cart, Review Collection), WhatsApp/Instagram/Facebook/Email channels, integrations with Stripe/Razorpay/Returnprime/Nector/Shopify/WooCommerce, and Link Products (auto-replies to IG Comments with DMs).",
      },
      {
        question: "Do you integrate with Shopify, WooCommerce, or Custom Stores?",
        answer:
          "Yes, Spur supports Shopify, WooCommerce, and custom stores. You can also use our API to integrate with any custom e-commerce store.",
      },
      {
        question: "What is the WhatsApp Business API?",
        answer:
          "The WhatsApp Business API is a way to send and receive messages from your customers on WhatsApp at scale.",
      },
      {
        question: "What is Instagram DM Automation?",
        answer:
          "Instagram DM Automation is a way to send and receive messages from your customers on Instagram automatically, including sending private DMs to users who comment on your posts.",
      },
      {
        question: "How do I get a demo of Spur?",
        answer:
          "You can book a personalized live demo with our team using the demo booking link on our website or by contacting support.",
      },
      {
        question: "Is Spur approved by Shopify?",
        answer:
          "Yes, we are officially listed on the Shopify App Store with over 55+ positive reviews.",
      },
      {
        question: "How is Spur better than other tools?",
        answer:
          "Spur is built for modern e-commerce challenges of 2024 (like rising CAC, privacy concerns, and competition). We have an agile team of 5 that actively listens to customer feedback, resolves bugs instantly, and offers top-notch proactive support.",
      },
      {
        question: "Are your automations approved by Meta?",
        answer:
          "Yes, Spur is an official Meta Tech Provider, and all our automations are fully approved.",
      },
      {
        question: "What is Spur's refund policy?",
        answer:
          "Subscription charges and WhatsApp conversation charges are non-refundable. For Indian customers, paid plans auto-debit via card e-mandate. For international customers, recurring charges continue until cancelled. Upon cancellation, remaining wallet balance and AI credits are forfeited and are non-recoverable. No refunds are issued if you fail to cancel before the billing date.",
      },
      {
        question: "How can I contact Spur support or report a bug?",
        answer:
          "You can email us at support@spurnow.com, contact us via WhatsApp at +919599055272, or use the 'Report a bug' or 'Contact us' options in the platform.",
      },
      {
        question: "What is Spur's company address?",
        answer:
          "Our company address is: A-1/75 SF, Kh No 152/1, Freedom Fighter Enclave, Neb Sarai, Dist - South West Delhi, New Delhi - 110068, India.",
      },
      {
        question: "Who is on the Spur team?",
        answer:
          "Our core team of 5 consists of: Rohan Rajpal (Co-founder), Royal Tomar (Co-founder), Shiv Sarthak Sabhlok (Founding Engineer), Divyansh Balchandani (Customer Success Lead), and Chirag (Founding Designer).",
      },
      {
        question: "Is Spur GDPR compliant?",
        answer:
          "Yes, Spur is fully GDPR compliant. All our servers and databases are located in Frankfurt, Germany. We ensure WhatsApp Business API data is localized in Europe by setting the data_localization_region option to Europe during setup.",
      },
      {
        question: "What is the Spur Partner Program?",
        answer:
          "Our partner program offers a 20% recurring commission on AI plans (AI Start, AI Acquire, AI Accelerate, AI Max). Furthermore, once referred customers upgrade, you earn 60% of their subscription cost for the 2nd and 3rd months (minimum $60, no upper limit). Payouts are made monthly through the partner portal.",
      },
      {
        question: "How does the partner lead sharing process work?",
        answer:
          "When we receive relevant inquiries via our website forms, we seamlessly forward them to our agency partners, helping you connect directly with potential clients.",
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
