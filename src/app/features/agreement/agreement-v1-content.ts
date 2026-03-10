export interface AgreementV1Clause {
  number: number;
  title: string;
  body: string;
}

export interface AgreementV1Section {
  id: string;
  label: string;
  title: string;
  clauses: AgreementV1Clause[];
}

export const AGREEMENT_V1_SECTIONS: AgreementV1Section[] = [
  {
    id: 'section-a',
    label: 'Section A',
    title: 'Customer Eligibility and Voluntary Consent',
    clauses: [
      {
        number: 1,
        title: 'Eligibility Declaration and Voluntary Consent',
        body: `I hereby declare and confirm that I am a citizen/resident of India, aged 18 (eighteen) years or above as of the date of this Agreement, and that I meet the minimum monthly income requirement as specified and verified by Fastemis at the time of application. I further confirm that I am entering into this EMI Agreement of my own free will, without any force, coercion, misrepresentation, or undue influence from Fastemis, its representatives, or any affiliated vendor. This EMI arrangement has been chosen voluntarily by me as a buyer, and I accept full legal and financial responsibility for all obligations arising hereunder.`
      },
      {
        number: 2,
        title: 'Full Understanding and Acceptance of Terms and Conditions',
        body: `I confirm that I have read, understood, and unconditionally accepted all terms and conditions of this Fastemis EMI Agreement prior to executing it. I acknowledge that I was provided adequate opportunity to review the agreement, seek independent legal advice if required, and raise any queries before proceeding. No claim of ignorance of any term, condition, policy, or clause contained herein shall constitute a valid defence against any action or recovery initiated by Fastemis. By proceeding with the EMI, I am legally bound by all provisions of this Agreement in their entirety.`
      },
      {
        number: 3,
        title: 'No Force or Manipulation Declaration',
        body: `I solemnly affirm and declare that at no point during the EMI application, discussion, or execution process was I forced, coerced, intimidated, misled, or manipulated by Fastemis or any of its representatives, employees, vendors, or associated parties into entering into this EMI Agreement. This Agreement reflects my own informed, voluntary, and independent decision to avail of the EMI facility. This declaration is made to conclusively negate any future allegation of undue influence, fraud, or misrepresentation against Fastemis, and I accept that this declaration shall be binding on me and shall be admissible in any legal proceeding.`
      },
      {
        number: 4,
        title: 'Language Comprehension Declaration and Checkbox Consent Binding Clause',
        body: `I expressly declare and confirm that I am proficient in the English language and possess sufficient comprehension to fully understand each and every clause, term, condition, obligation, and consequence set forth in this Agreement, which has been presented to me in English. I confirm that I did not require translation, interpretation, or third-party assistance to understand the contents of this Agreement, and that the language of this document has not posed any barrier to my informed consent. I further acknowledge that by checking/clicking the checkbox provided at the end of this Agreement I am providing my free, informed, unequivocal, and legally binding consent to all 28 (twenty-eight) clauses of this Agreement collectively and individually. Such checkbox consent shall carry the same legal weight and enforceability as a wet-ink physical signature, and I shall not at any future point dispute the validity, enforceability, or binding nature of this Agreement on the grounds that it was executed digitally, that I did not read it, or that I did not understand the language in which it was presented.`
      },
      {
        number: 5,
        title: 'Fastemis Agreement Authenticity, R and D Declaration and Unconditional No-Objection Confirmation',
        body: `I hereby acknowledge, confirm, and declare without any reservation, objection, or dispute that the entire Fastemis EMI Agreement including all its clauses, conditions, penalties, policies, processes, and operational frameworks has been formulated by Fastemis on the basis of thorough research and development, operational experience, risk assessment, legal consultation, and legitimate business necessity. I confirm that I have been made fully aware of the background, rationale, and intent behind each provision of this Agreement prior to execution. I raise absolutely no objection to the manner in which these terms have been drafted, structured, or presented, and I confirm that I consider all provisions to be fair, reasonable, clearly communicated, and understood by me before granting consent. I expressly and irrevocably waive any right, whether current or future, to challenge the validity, fairness, proportionality, or enforceability of any clause of this Agreement on the grounds that it was drafted in favour of Fastemis, or that I was not adequately informed of its terms. My consent to this Agreement is final, unconditional, and irrevocable from the moment of execution.`
      }
    ]
  },
  {
    id: 'section-b',
    label: 'Section B',
    title: 'Document Requirements and Submission Obligations',
    clauses: [
      {
        number: 6,
        title: 'Mandatory Document List and Fraud / Non-Submission Consequences',
        body: `I acknowledge that the following documents are mandatory for processing my EMI application: (a) Aadhaar Card - Government-issued identity and address proof; (b) PAN Card - income tax identification; (c) Bank Account Details - account number and IFSC code. In the event that Fastemis requires any additional document beyond this standard set, I shall be duly notified and I unconditionally agree to submit the same within 48 (forty-eight) hours of such demand. I further acknowledge and agree that: (i) failure to submit the demanded document within the stipulated time, or (ii) submission of any forged, tampered, fabricated, or otherwise fraudulent document, shall result in immediate disqualification of my application, cancellation of any ongoing EMI arrangement without further notice, forfeiture of any amounts paid, and may expose me to civil and criminal liability under applicable Indian law including but not limited to the Indian Penal Code, 1860 and the Information Technology Act, 2000.`
      },
      {
        number: 7,
        title: 'Standard Documentation Policy and Process Failure Liability',
        body: `I acknowledge that Fastemis operates a standardised documentation process for EMI applications. I understand that submission of incomplete, incorrect, or fraudulent documents including Aadhaar Card, PAN Card, and Bank Details, or failure to comply with any document request within the stipulated 48-hour window, may result in termination of the application or ongoing EMI process without any obligation on Fastemis to refund processing efforts or extend timelines. Any loss, inconvenience, or financial impact resulting from process failure due to my non-compliance with documentation requirements shall be borne entirely by me.`
      },
      {
        number: 8,
        title: 'Exhaustive Document Obligation - Full List Disclosed in Advance and Sole Liability for Failure',
        body: `I acknowledge that Fastemis has clearly, completely, and specifically informed me in advance of the full list of documents that may be required during the EMI process. These documents, as explained to me before I agreed to this arrangement, include: (i) Aadhaar Card as government-issued identity and address proof; (ii) PAN Card as income tax identification; (iii) Bank Account Details including account number and IFSC code; (iv) Bank Statement or Transaction History clearly showing regular monthly income credit of the minimum amount as specified by Fastemis; (v) Residence Certificate issued by competent authority in the same calendar month as the EMI application; (vi) Voter ID Card as supplementary identity or address proof; and (vii) Electricity Bill issued in the name matching the Aadhaar Card holder and reflecting the same address as on the Aadhaar Card. I confirm that Fastemis proactively disclosed and explained this complete list to me before I initiated this EMI process, and I have had full advance knowledge of all documentary requirements. I accept and agree that: (i) I shall submit any demanded document within a strict, non-extendable period of 48 hours; (ii) Failure to submit for any reason whatsoever makes the resulting EMI cancellation MY SOLE AND ABSOLUTE RESPONSIBILITY; (iii) Fastemis bears zero liability for EMI failure arising from my non-submission; (iv) I had advance knowledge and cannot claim surprise, ignorance, or lack of notice; (v) Any legal action by me against Fastemis citing document-related failure or non-refund is entirely without merit; and (vi) Filing a frivolous proceeding exposes me to cost liability under Section 26 CPA 2019, damages under ICA 1872, and contempt under applicable law.`
      },
      {
        number: 9,
        title: 'Document Demand - Deemed Delivery, Communication Channels and 48-Hour Clock Commencement',
        body: `I acknowledge and agree to the following binding terms governing the document demand and delivery process: (A) AUTHORISED COMMUNICATION CHANNELS: Fastemis may issue document demands through any of: (i) email to my registered email address; (ii) SMS to my registered mobile number; (iii) WhatsApp message to my registered mobile number; (iv) in-app notification on the Fastemis platform; or (v) registered post or courier to my registered address. (B) DEEMED DELIVERY: Any communication sent by Fastemis shall be deemed duly delivered: (i) for email - within 2 hours of sending, regardless of whether I have read it; (ii) for SMS/WhatsApp - immediately upon transmission, regardless of whether I have read it; (iii) for registered post - on the 3rd working day after dispatch. (C) 48-HOUR CLOCK: The 48-hour window commences from the time of deemed delivery as defined above, and NOT from the time of my actual reading or acknowledgment. (D) CONTACT DETAILS RESPONSIBILITY: I am solely responsible for ensuring my registered contact details are active and correct. Failure of delivery due to my incorrect or inaccessible details shall not delay or pause the clock. (E) PARTIAL SUBMISSION EQUALS NON-COMPLIANCE: Submission of some but not all demanded documents shall be treated as COMPLETE NON-COMPLIANCE. Each document is a standalone, non-waivable requirement. (F) ELECTRONIC RECORDS ADMISSIBILITY: All electronic communications including emails, SMS, WhatsApp messages, screenshots, and delivery receipts exchanged between me and Fastemis shall constitute valid, admissible electronic records under Section 65B of the Indian Evidence Act, 1872, and I shall not raise any objection to their admissibility in any proceeding.`
      },
      {
        number: 10,
        title: 'Fastemis Final Document Adequacy Determination - No Force Majeure, No Extension',
        body: `I acknowledge and unconditionally agree to the following: (A) FASTEMIS SOLE DETERMINATION RIGHT: Fastemis shall be the sole, final, and binding arbiter of whether any document submitted by me meets the required standard of authenticity, currency, legibility, completeness, and relevance. Fastemis decision to accept or reject any submitted document shall be final and conclusive and shall not be subject to challenge in any forum. (B) DOCUMENT NON-SUBSTITUTABILITY: Each document on the required list is non-substitutable unless Fastemis explicitly approves an alternative in writing. (C) SAME-MONTH RESIDENCE CERTIFICATE - ADVANCE AWARENESS: I specifically confirm that I was informed in advance that the Residence Certificate must be issued in the same calendar month as my EMI application, and I have assessed and confirmed my own practical ability to procure this document before entering this Agreement. I waive any right to claim this requirement is impossible, impractical, or unreasonable. (D) ABSOLUTE EXCLUSION OF FORCE MAJEURE: No event of force majeure, personal emergency, hospitalization, family bereavement, natural disaster, government office closure, or any other circumstance shall excuse, delay, or extend my document submission obligation. Time is expressly of the essence. (E) EXTENSION REQUESTS DO NOT PAUSE THE CLOCK: Any request by me for an extension shall not pause, extend, or reset the clock. An extension is valid only if Fastemis provides written approval. Absence of response from Fastemis shall not constitute implied approval of any extension under any circumstance.`
      }
    ]
  },
  {
    id: 'section-c',
    label: 'Section C',
    title: 'Payment Terms and EMI Structure',
    clauses: [
      {
        number: 11,
        title: 'EMI Due Date - Fixed 10th of Every Month',
        body: `I understand and agree that the EMI payment due date is fixed as the 10th (tenth) day of every calendar month, regardless of the date of purchase or commencement of this agreement. Whether my purchase was made on the 1st, 9th, 11th, 25th, or any other date of any month, my EMI obligation shall always fall due on the 10th of each subsequent month without exception. No request for alteration of the EMI due date shall be entertained by Fastemis. I accept this fixed due-date structure unconditionally as a material term of this Agreement.`
      },
      {
        number: 12,
        title: 'Payment Responsibility and Advance Payment Advisory',
        body: `I accept that the sole responsibility for timely EMI payment lies entirely with me. I am aware and acknowledge that technical failures of payment platforms including but not limited to UPI, internet banking, mobile banking applications, payment gateways, or any other payment method, shall not constitute a valid excuse for delay or non-payment of EMI. Fastemis bears no liability whatsoever for payment failures arising from external systems or infrastructure beyond its control. I further acknowledge the advisory issued by Fastemis recommending that I make my EMI payment 1 to 2 days in advance of the 10th of each month to avoid technical delays. Failure to heed this advisory and consequent late or missed payments shall be entirely my responsibility.`
      },
      {
        number: 13,
        title: 'Missed EMI Penalty - Slab-Wise Structure',
        body: `I acknowledge and agree that in the event I fail to pay my EMI by the 10th of any month, the following compulsory penalty shall apply in addition to the outstanding EMI amount. Upon missing the due date, I shall be required to pay the missed EMI amount PLUS the next month's EMI amount PLUS a mandatory penalty charge based on the following device value slabs: (a) Device value up to Rs.40,000 - Penalty: Rs.1,000/-; (b) Device value Rs.41,001 to Rs.70,000 - Penalty: Rs.1,700/-; (c) Device value Rs.71,001 to Rs.1,00,000 - Penalty: Rs.2,100/-; (d) Device value above Rs.1,00,000 - Penalty: Rs.2,999/-. This penalty structure shall apply cumulatively for each subsequent missed month. I expressly agree that these penalties are a genuine pre-estimate of administrative costs and losses suffered by Fastemis and are not a penalty in the penal sense.`
      },
      {
        number: 14,
        title: 'Limitation on Concurrent EMI / Loan Obligations',
        body: `I declare that as on the date of this Agreement, I do not have more than 3 (three) active, ongoing, or subsisting loan or EMI obligations across any lender(s), financier(s), or EMI platform(s). I understand that having 3 or more concurrent obligations at the time of my application disqualifies me from availing this EMI facility. I confirm that the information provided in this regard is accurate and truthful, and I accept that any misrepresentation shall entitle Fastemis to cancel the EMI arrangement, recall the device, and initiate recovery proceedings without notice.`
      },
      {
        number: 15,
        title: 'Pre-Closure of Cost EMI - Minimum 3 EMIs + 2% Charge',
        body: `I understand that where the EMI arrangement is structured as a Cost EMI (that is, with applicable interest charges), I am entitled to apply for pre-closure only after successfully paying a minimum of 3 (three) monthly EMIs. Pre-closure prior to completing 3 EMIs shall not be permitted under any circumstances. In the event of pre-closure after 3 EMIs, a pre-closure charge of 2% (two percent) of the total outstanding principal amount at the time of pre-closure shall be levied and must be paid by me in addition to the outstanding balance. I accept this charge as a reasonable and contractually agreed fee.`
      },
      {
        number: 16,
        title: 'Pre-Closure of No-Cost EMI - Anytime, No Charge',
        body: `I understand that where the EMI arrangement is structured as a No-Cost EMI (that is, with no interest charged), I am entitled to apply for pre-closure at any time during the EMI tenure without any pre-closure charges or penalties. I acknowledge and confirm that the distinction between Cost EMI and No-Cost EMI as applicable to my transaction has been clearly communicated to me before executing this Agreement, and I accept the respective pre-closure terms accordingly.`
      }
    ]
  },
  {
    id: 'section-d',
    label: 'Section D',
    title: 'Device Rights, Security and Tracking',
    clauses: [
      {
        number: 17,
        title: 'Device Locking Right - Remote Restriction and Physical Repossession',
        body: `I hereby expressly consent to and authorise Fastemis to remotely lock, restrict, or disable the functionality of the device financed under this Agreement in the event of: (a) failure to pay any EMI on or before the due date; (b) breach of any material condition of this Agreement; (c) commencement of legal or recovery proceedings. I acknowledge that such device locking is a contractually agreed-upon security mechanism and not unlawful seizure or interference. I waive any right to claim damages, compensation, or injunctive relief against Fastemis for exercising this right. I further understand and agree that Fastemis or its authorised recovery representatives may physically collect the device from my possession in accordance with applicable law upon default, and I shall not obstruct, resist, or prevent such collection.`
      },
      {
        number: 18,
        title: 'Device Location Tracking Consent',
        body: `I voluntarily and explicitly consent to Fastemis tracking the geographical location of the financed device during the entire tenure of this EMI Agreement. I acknowledge that this tracking is limited to the purpose of asset protection, default management, and recovery, and I have been informed of this practice prior to executing this Agreement. I confirm that such tracking does not constitute unlawful surveillance, and I waive any objection thereto for the duration of the outstanding EMI. This consent is given in accordance with applicable privacy laws of India and shall remain valid until all EMI obligations have been fully and finally discharged.`
      },
      {
        number: 19,
        title: 'Prohibition on Sale, Transfer or Encumbrance of Device During EMI Tenure',
        body: `I agree and undertake that I shall not sell, transfer, gift, pledge, hypothecate, or in any manner part with the possession or ownership of the financed device to any third party within 30 (thirty) days from the date of purchase under this Agreement. Furthermore, Fastemis strongly advises and I acknowledge this advisory that I should refrain from selling or transferring the device to any third party until all outstanding EMI amounts have been fully cleared. Any sale, transfer, or encumbrance of the device in breach of this clause shall constitute a material default under this Agreement, entitling Fastemis to invoke all available remedies including immediate recovery of the full outstanding amount and/or device repossession.`
      }
    ]
  },
  {
    id: 'section-e',
    label: 'Section E',
    title: 'Non-Refund Policy and Financial Liability Protection',
    clauses: [
      {
        number: 20,
        title: 'Absolute Non-Refundability of All Payments - Advance, Booking and Downpayment',
        body: `Any and all amounts paid by me to Fastemis at any stage of the EMI process including but not limited to advance booking amount, downpayment, part-payment, or any other consideration, shall be STRICTLY, ABSOLUTELY, and PERMANENTLY NON-REFUNDABLE under all circumstances whatsoever, including cancellation of the EMI process, failure of document verification, my inability or failure to submit required documents within the stipulated time, withdrawal of my EMI application, or any other reason attributable to me. I acknowledge and agree that the booking/reservation of the device in my name during the EMI application period causes direct, real, and quantifiable commercial loss to Fastemis, including: (i) removal of the device from active sale, depriving Fastemis of other potential buyers; (ii) loss of potential revenue during the entire booking period; (iii) exposure to device price fluctuations and inventory risk during the hold period; and (iv) direct expenditure of Fastemis operational time, administrative effort, manpower, and resources. I confirm and agree that the advance/downpayment amount is a genuine, mutually agreed-upon, pre-estimated compensation for these identifiable losses and is NOT a security deposit, refundable advance, or any form of returnable consideration. I expressly and permanently waive all statutory and common law rights to demand any refund of paid amounts where the EMI process fails for any reason attributable directly or indirectly to me.`
      },
      {
        number: 21,
        title: 'Liquidated Damages Declaration - Section 74, Indian Contract Act 1872',
        body: `I expressly acknowledge, confirm, and agree that all amounts paid by me to Fastemis as advance booking amount, downpayment, or any other pre-EMI payment constitute LIQUIDATED DAMAGES as defined and governed under Section 74 of the Indian Contract Act, 1872, and not a penalty or unjustified forfeiture. I confirm that the parties have genuinely and consciously pre-estimated the loss that Fastemis would suffer in the event of cancellation or failure of the EMI process attributable to me, and that the said amount represents a reasonable, proportionate, and genuine pre-estimate of Fastemis minimum identifiable losses including: (a) opportunity cost of removing the device from active inventory; (b) time value of Fastemis operational and administrative resources dedicated exclusively to my application; (c) loss of potential revenue from other buyers denied access to the device during the booking period; (d) price fluctuation risk and inventory carrying cost borne by Fastemis; and (e) verification, processing, and compliance costs incurred specifically for my application. I irrevocably waive any right to challenge or seek judicial reduction of the forfeited amount on the grounds that it constitutes a disproportionate penalty, and I confirm that no court, tribunal, or forum shall have grounds to reduce the forfeiture under Section 74 ICA since it represents a genuine pre-estimate mutually acknowledged by both parties.`
      },
      {
        number: 22,
        title: 'Consumer Protection Act 2019 - Service Deficiency Inapplicability and Non-Refund as Lawful Compensation',
        body: `I hereby acknowledge and declare, with full legal understanding, the following: (A) The failure of the EMI process resulting from my inability or failure to submit required documents within the stipulated 48-hour period does NOT constitute a deficiency in service as defined under Section 2(11) of the Consumer Protection Act, 2019. The failure is entirely attributable to me, and Fastemis has performed its contractual obligations by: (i) disclosing all required documents in advance; (ii) issuing a formal demand through proper channels; (iii) providing a 48-hour compliance window; and (iv) maintaining the device booking exclusively for me during that period. (B) The non-refund of advance/downpayment amounts constitutes contractual liquidated damages and not an unfair trade practice or unfair contract term under Sections 2(47) and 2(46) of the Consumer Protection Act, 2019, since the said forfeiture is mutually pre-agreed, proportionate, fully disclosed before payment, and voluntarily accepted by me. (C) I shall not file any complaint before any District Consumer Disputes Redressal Commission, State Commission, or NCDRC alleging deficiency in service or unfair trade practice by Fastemis in relation to document-related EMI failure or non-refund of advance amounts. Any such complaint shall be frivolous, and I shall be liable for costs under Section 26 of the Consumer Protection Act, 2019. (D) I acknowledge that Consumer Forum territorial jurisdiction under Section 34 of the CPA 2019 is not waived by this Agreement, but I affirm that the cause of action in document-related EMI failure arises entirely from my own non-compliance and therefore Fastemis shall have a complete and irrefutable defence in any Consumer Forum regardless of its location.`
      }
    ]
  },
  {
    id: 'section-f',
    label: 'Section F',
    title: 'Legal Framework, Jurisdiction and Platform Terms',
    clauses: [
      {
        number: 23,
        title: 'Jurisdiction - Exclusive Courts of Mumbai, Maharashtra',
        body: `I unconditionally agree and submit that any and all disputes, differences, claims, or legal proceedings arising from, out of, or in connection with this Agreement, whether contractual, tortious, statutory, or otherwise, shall be subject exclusively to the jurisdiction of the competent courts located in Mumbai, Maharashtra, India. I hereby waive any objection to the laying of venue in Mumbai on grounds of inconvenience or otherwise, and I accept Mumbai as the sole and exclusive forum for civil court resolution of any dispute with Fastemis. This jurisdictional clause shall survive termination or expiry of this Agreement.`
      },
      {
        number: 24,
        title: 'Default and Acceleration of Full Outstanding Amount',
        body: `I agree that in the event of any default under this Agreement, including but not limited to non-payment of EMI, breach of any covenant, misrepresentation, or device disposal in violation of this Agreement, Fastemis shall have the right to declare the entire outstanding balance immediately due and payable without further notice or demand. I waive any right to challenge such acceleration as premature or unjust, and agree that the total outstanding amount together with applicable penalties, charges, and costs shall be immediately recoverable by Fastemis through all legally available means including civil suit, recovery proceedings, device repossession, or any combination thereof.`
      },
      {
        number: 25,
        title: 'Right to Assign Claims and Engage Recovery Agents',
        body: `I acknowledge and agree that Fastemis reserves the right to assign, transfer, or novate its rights and claims under this Agreement to any third party, including debt recovery agencies or financial institutions, without my prior consent. I further agree that Fastemis or its authorised agents may contact me, my references, and in appropriate circumstances, visit my registered address, for the purpose of EMI reminders, overdue collection, or asset recovery. I confirm that such actions are consented to herein and shall not constitute harassment under any applicable regulation.`
      },
      {
        number: 26,
        title: 'Warranty, Guarantee and After-Sales Support - Brand Responsibility, Not Fastemis',
        body: `I acknowledge and agree that Fastemis is solely an EMI financing facilitator and does not manufacture, supply, or sell the device. Accordingly, all warranty obligations, guarantee claims, product defects, after-sales service, repairs, and replacement matters shall be governed exclusively by the terms and policies of the respective device manufacturer or brand. Fastemis bears no liability whatsoever for any defect, malfunction, damage, or warranty-related issue arising with the device. I confirm that I shall not use any product-related grievance as a justification for non-payment or delay of EMI, and that my EMI obligation is independent of and unaffected by any product dispute.`
      },
      {
        number: 27,
        title: 'Governing Law - Republic of India',
        body: `This Agreement shall be governed by and construed in accordance with the laws of the Republic of India, including but not limited to the Indian Contract Act, 1872, the Consumer Protection Act, 2019, the Information Technology Act, 2000, and all other applicable statutes, rules, and regulations as may be in force from time to time. In the event of any conflict or ambiguity, the interpretation most favourable to the enforcement of Fastemis rights and interests shall prevail, consistent with applicable law.`
      }
    ]
  },
  {
    id: 'section-g',
    label: 'Section G',
    title: 'Digital Consent, Data Protection and Final Execution',
    clauses: [
      {
        number: 28,
        title: 'Digital Consent Authentication, DPDP Act 2023 Compliance and Final Binding Execution',
        body: `I acknowledge and agree to the following: (A) DIGITAL CONSENT AUTHENTICATION: I confirm that at the time of executing this Agreement digitally, Fastemis has captured and shall retain as permanent record: (i) the timestamp of my checkbox consent; (ii) the IP address of the device used for consent; (iii) the device fingerprint or browser signature; (iv) the OTP or email confirmation link verification completed by me; and (v) my typed full name as part of the digital consent process. I agree that these authentication records constitute conclusive and irrefutable proof that I personally executed this Agreement, and I shall not at any future time dispute the validity or attribution of this consent. (B) BINDING EFFECT UNDER IT ACT 2000: This Agreement executed digitally constitutes a valid, legally binding, and enforceable electronic contract under Section 10A of the Information Technology Act, 2000. The electronic record of this Agreement shall be admissible as evidence under Sections 85A, 85B, and 88A of the Indian Evidence Act, 1872. (C) DATA PROTECTION CONSENT - DPDP ACT 2023: I hereby provide my free, specific, informed, and unambiguous consent under the Digital Personal Data Protection Act, 2023 for Fastemis to collect, process, store, and use my personal data including Aadhaar number, PAN number, bank account details, transaction history, mobile number, email address, and device location data for the following specific purposes: (i) EMI application verification and approval; (ii) ongoing EMI management, collection, and recovery; (iii) KYC compliance and regulatory reporting; (iv) fraud prevention and risk assessment; and (v) device tracking for asset protection as consented in Clause 18 of this Agreement. My personal data may be retained by Fastemis for the duration of this Agreement plus 5 (five) years thereafter for legal and compliance purposes. I agree that any data protection grievance shall be first raised with Fastemis designated Data Protection Officer and shall not be used as a collateral weapon to avoid or delay EMI obligations. (D) FINAL DECLARATION: I hereby confirm that I have read, understood, and voluntarily agree to each and every one of the 28 (twenty-eight) clauses of this Agreement. I have had the opportunity to seek legal counsel. My digital checkbox consent is my final, binding, and irrevocable execution of this Agreement. No amendment to this Agreement shall be valid unless made in writing and acknowledged by Fastemis.`
      }
    ]
  }
];

export const AGREEMENT_V1_VIDEO_GUIDELINES: string[] = [
  'Record or upload a short video directly from your phone or browser.',
  'Keep the video between 30 and 45 seconds. Face must be clearly visible with good lighting.',
  "Say your full name, Aadhaar last 4 digits, Agreement ID, today's date, and confirm that all uploaded documents are genuine.",
  'Confirm that you are agreeing voluntarily and that the agreement is being accepted by your own choice.'
];

export const AGREEMENT_V1_VIDEO_POWER_POINTS: string[] = [
  'Your face is visible on camera.',
  'Your voice confirms the agreement terms in real time.',
  'The Agreement ID is unique to this execution and links the full case file.',
  'Your Aadhaar last 4 digits and the date make the recording specific to you and that day.'
];

export const AGREEMENT_V1_AGREEMENT_ID_STEPS: string[] = [
  'FEMI is the Fastemis EMI brand prefix.',
  'The date block ties the agreement to the day the form was opened.',
  'The last 5 random characters keep every agreement unique even on the same day.',
  'The same Agreement ID is used to connect your profile, uploads, timestamps, and consent video.'
];

export const AGREEMENT_V1_CLAUSES: AgreementV1Clause[] = AGREEMENT_V1_SECTIONS.flatMap((section) => section.clauses);
