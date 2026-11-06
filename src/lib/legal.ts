/* Draft legal documents — to be reviewed by a Nigerian lawyer before launch. */
export const LEGAL_DOCS = {
  "terms": {
    "title": "Terms of Service",
    "updated": "6 October 2026",
    "intro": "These terms govern your use of ModelClic, a marketplace that connects verified students and talent with Event Hosts for paid, part-time event work in Nigeria. By creating an account you agree to them.",
    "sections": [
      {
        "heading": "1. Eligibility",
        "points": [
          "You must be at least 18 years old and legally able to work in Nigeria.",
          "You must complete identity verification (NIN, selfie and liveness check) before bidding on or posting events.",
          "One person, one account. Accounts may not be shared, sold or transferred."
        ]
      },
      {
        "heading": "2. How bidding works",
        "points": [
          "Talent bid on events using Bid Points. Each bid uses 3 points; points are non-refundable once a bid is placed, except where an event is cancelled by the Host.",
          "A Host may accept, decline or shortlist any bid. A bid is not a guarantee of work.",
          "Once you accept a job offer you are expected to attend. Repeated no-shows lead to lower visibility, suspension or removal."
        ]
      },
      {
        "heading": "3. Payments and escrow",
        "points": [
          "Hosts fund the full staff pay into ModelClic escrow before an event is confirmed, plus a 10% service charge.",
          "Escrow is released to Talent after both parties mark the job complete, or automatically 12 hours after the event ends if no dispute is raised.",
          "Withdrawals are paid to a verified Nigerian bank account in the account holder’s own name.",
          "Talent are independent workers, not employees of ModelClic or the Host, and are responsible for their own taxes."
        ]
      },
      {
        "heading": "4. Cancellations",
        "points": [
          "If a Host cancels an event, escrowed funds are refunded to the Host wallet, less any cancellation fee owed to Talent who had already been confirmed.",
          "If Talent withdraw from a confirmed job less than 24 hours before the start time, it counts as a late cancellation on their record."
        ]
      },
      {
        "heading": "5. Disputes",
        "points": [
          "Either party may raise a dispute before escrow is released. Funds stay on hold while ModelClic Trust & Safety reviews the evidence.",
          "ModelClic’s decision on a dispute is final within the platform, without affecting your statutory rights."
        ]
      },
      {
        "heading": "6. Prohibited conduct",
        "points": [
          "Taking payment or arranging work off-platform for jobs found on ModelClic.",
          "Misrepresenting your identity, age, appearance or experience.",
          "Posting events that are unlawful, sexual in nature, or that misdescribe the work, pay or location.",
          "Harassing, threatening or discriminating against any user."
        ]
      },
      {
        "heading": "7. Suspension and termination",
        "points": [
          "We may suspend or close accounts that break these terms or put other users at risk. Funds owed to you for completed work will still be paid out.",
          "You can delete your account at any time from Settings."
        ]
      },
      {
        "heading": "8. Liability",
        "points": [
          "ModelClic is a marketplace and does not organise events. To the extent the law allows, our liability is limited to the service charges paid to us in the 12 months before a claim.",
          "These terms are governed by the laws of the Federal Republic of Nigeria."
        ]
      }
    ]
  },
  "privacy": {
    "title": "Privacy Policy",
    "updated": "6 October 2026",
    "intro": "ModelClic processes personal data in line with the Nigeria Data Protection Act 2023. This policy explains what we collect, why, and the choices you have.",
    "sections": [
      {
        "heading": "What we collect",
        "points": [
          "Account details: name, date of birth, gender, phone number, email address and password (stored hashed).",
          "Verification data: your NIN, selfie and liveness capture, and for Hosts, CAC registration details.",
          "Profile details you choose to add: photos, bio, skills, physical attributes, location and availability.",
          "Payment details: bank account name and number for withdrawals, and wallet transaction history.",
          "Safety data: emergency contact, SOS alerts, and location shared during an active SOS."
        ]
      },
      {
        "heading": "Why we use it",
        "points": [
          "To verify identities and keep fraudulent accounts off the platform.",
          "To match Talent with suitable events and show Hosts relevant profiles.",
          "To hold payments in escrow, process withdrawals and resolve disputes.",
          "To respond to SOS alerts and support requests."
        ]
      },
      {
        "heading": "Who sees it",
        "points": [
          "Hosts see your public profile: first name, photos, skills, ratings and job history. They never see your NIN, phone, email, bank details or emergency contact.",
          "Identity checks are carried out by our verification partner (SmileID). Payments are processed by licensed Nigerian payment providers.",
          "We share data with law enforcement only when legally required or when someone’s safety is at serious risk."
        ]
      },
      {
        "heading": "How long we keep it",
        "points": [
          "Verification images are deleted 90 days after successful verification; the verification result is kept while your account is open.",
          "Transaction records are kept for 6 years to meet financial record-keeping obligations.",
          "Other data is deleted within 30 days of closing your account."
        ]
      },
      {
        "heading": "Your rights",
        "points": [
          "You can access, correct, export or delete your data, and object to or restrict certain processing.",
          "Email privacy@modelclic.com to make a request. We respond within 30 days.",
          "You may also complain to the Nigeria Data Protection Commission (NDPC)."
        ]
      }
    ]
  },
  "guidelines": {
    "title": "Community Guidelines",
    "updated": "6 October 2026",
    "intro": "ModelClic works because Hosts and Talent can trust each other. These guidelines apply to everyone, at every event.",
    "sections": [
      {
        "heading": "For everyone",
        "points": [
          "Be who you say you are. Profiles and photos must be recent and accurate.",
          "Keep payments on ModelClic. Off-platform deals lose escrow protection and break our terms.",
          "Treat people with respect. Harassment, threats and discrimination of any kind are not tolerated.",
          "Rate honestly. Ratings help the whole community make safe choices."
        ]
      },
      {
        "heading": "For Talent",
        "points": [
          "Show up on time, dressed as the brief asks. If you can’t make it, withdraw as early as possible.",
          "Follow the Host’s reasonable instructions on the day.",
          "You can leave any event that feels unsafe. Use SOS and tell us what happened."
        ]
      },
      {
        "heading": "For Event Hosts",
        "points": [
          "Describe the job, pay, hours, dress code and location accurately.",
          "No requests for sexual services, revealing outfits beyond the stated dress code, or work that isn’t in the brief.",
          "Provide a safe workplace, breaks for long shifts, and a named on-site contact.",
          "Confirm completion promptly so Talent are paid on time."
        ]
      },
      {
        "heading": "Safety",
        "points": [
          "SOS on an active job alerts our Trust & Safety team and your emergency contact.",
          "Report anything that worries you from the event page, chat or Help. Reports are confidential.",
          "Accounts that put others at risk are suspended while we investigate."
        ]
      }
    ]
  }
} as const;

export type LegalKey = keyof typeof LEGAL_DOCS;
