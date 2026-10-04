from lib import *

def guide():
    rows = [
        ("Send 1", "First reply", "01 Acknowledgement Email · 02 Journey Request Form", "Client fills in the form"),
        ("Send 2", "Proposal", "03 Proposal", "Client reviews"),
        ("Send 3", "Signing bundle", "04 Client Services Agreement · 05 Proposal Acceptance · 06 Supplier Terms Acknowledgement  (groups: 07 Group Booking Contract · companies: 08 Corporate Services Agreement)", "Client signs; companies also send their purchase order"),
        ("Send 4", "Insurance", "09 Travel Insurance Acknowledgement", "Client signs"),
        ("Send 5", "Payment", "10 Invoice · 11 Payment Authorization · 12 Payment Instruction Sheet", "Client signs the authorization, then pays on the official payments page"),
        ("Send 6", "Payment verified", "13 Receipt", "-"),
        ("Send 7", "Traveler details", "14 Traveler Information Form · 15 Consent and Privacy Notice", "Client returns securely"),
        ("Send 8", "Suppliers booked", "16 Supplier Booking Confirmation", "-"),
        ("Send 9", "Before departure", "17 Final Itinerary · 18 Service Voucher · 19 Entry and Visa Notice · 20 Emergency Contacts", "-"),
        ("Send 10", "After the trip", "21 Feedback Request", "Optional reply"),
        ("When needed", "Change or cancellation", "22 Request Form (client) · 23 Cost Statement · 24 Refund Statement", "Client confirms the cost statement"),
    ]
    body = f"""
<p>This pack contains every document WBM needs for the full booking process, grouped in the order you send them. Each folder is one send; the documents in a folder go out together.</p>
{grid(["Send", "Stage", "Documents (in the folder)", "Client action"], rows)}
<h2>Before you use any document</h2>
<ol>
<li>Replace every <span class="fill">[highlighted bracket]</span> with your real details: legal entity name, address, licence or registration numbers, deposit and cancellation rules, governing law. Nothing in this pack has been invented for you.</li>
<li>Have a <b>travel-industry lawyer</b> review the agreements, acknowledgements, payment authorization and consent form for the countries you sell in. Documents marked <span class="draft">DRAFT FOR LEGAL REVIEW</span> carry that tag; remove it only after review.</li>
<li>Save each filled document as a PDF named with the client and booking reference, for example <i>WBM-2026-0001_Smith_ClientServicesAgreement.pdf</i>.</li>
<li>Use an e-signature service for the signed documents so every signature is dated and recorded.</li>
</ol>
<h2>Security rules (always)</h2>
{warn("<b>Never put wallet addresses in emails, chats or documents.</b> Payment is made only on the official WBM payments page. No consultant collects payments, private keys or seed phrases.")}
<ul>
<li>Passport and personal details travel only through a secure form or portal, never plain email. Collect them after payment and delete them after the trip as your privacy notice states.</li>
<li>Keep signed copies of everything for the period your accountant and lawyer advise.</li>
<li>Cross-reference every document by the same booking reference, invoice number and receipt number.</li>
</ul>
"""
    return [("00_Guide", "00_Sending_Guide.pdf", page("WBM-GUIDE", "Booking Documents: Sending Guide", "Which documents to send together, in order, and how to use them", body))]

def send1():
    ack = f"""
<p class="small">Send within a few hours of the client's first reply. Replace the highlighted fields.</p>
{kv([("To", F("Client name / email")), ("From", F("Consultant name") + f" &lt;{EMAIL}&gt;"), ("Subject", "Thank you, let's design your journey")])}
<p>Dear {F("Client first name")},</p>
<p>Thank you for getting back to us. We are delighted to hear from you and would love to help plan your journey.</p>
<p>My name is {F("Consultant name")}, and I will be your point of contact at World Bridge Meridian from first idea to the day you return. To begin, please complete our short journey request form. It tells us where you would like to go, when, who is travelling and what matters most to you:</p>
<p><b>{JOURNEY_URL}</b> (or use the attached form and reply to this email).</p>
<p>Once I have your answers, I will prepare a personalised proposal with the itinerary and pricing. Nothing is booked and nothing is charged at this stage.</p>
<p>If you would prefer to talk it through first, reply with a time that suits you and I will call.</p>
<p>Warm regards,<br>{F("Consultant name")}<br>{COMPANY}<br>{EMAIL}  ·  {PHONE}</p>
{note("<b>Please note:</b> World Bridge Meridian will never ask you to send payment details, passport numbers or wallet information by email. Payments are made only through the official payments page on our website, after you have accepted a proposal and received an invoice.")}
"""
    return ("01_Send1_FirstReply", "01_Acknowledgement_Email.pdf", page("WBM-DOC-01 · SEND 1", "Acknowledgement Email", "Template for the first reply to a client", ack))

def journey_form():
    tr = lambda n: "".join(f"<tr><td>{n}</td><td></td><td></td></tr>" for _ in range(1))
    body = f"""
<p>Please tell us about the journey you are imagining. Complete as much as you like. You can also complete this online at <b>{JOURNEY_URL}</b>. <b>Please do not include passport numbers or payment details on this form.</b></p>
<h2>1. About you</h2>
{kv([("Full name", ""), ("Email", ""), ("Phone (with country code)", ""), ("Preferred contact method", box("Email") + "&nbsp;&nbsp;" + box("Phone") + "&nbsp;&nbsp;" + box("WhatsApp")), ("City / country you travel from", "")])}
<h2>2. Your journey</h2>
{kv([("Where do you want to go?", box("A specific destination") + "<br>" + box("Several destinations") + "<br>" + box("Not sure yet") + "<br>Notes: " + line("l")),
     ("Preferred dates", "From " + line("s") + " to " + line("s")),
     ("Are your dates flexible?", box("Fixed") + "&nbsp;&nbsp;" + box("Flexible by a few days") + "&nbsp;&nbsp;" + box("Very flexible")),
     ("Length of trip", line("s") + " nights"),
     ("Who is travelling?", "Adults " + line("s") + "<br>Children (with ages) " + line()),
     ("Occasion", box("Holiday / leisure") + " " + box("Honeymoon") + " " + box("Anniversary") + "<br>" + box("Family trip") + " " + box("Group trip") + " " + box("Cruise") + "<br>" + box("Cultural / arts") + " " + box("Corporate / retreat") + " " + box("Other: ") + line("s"))])}
<h2>3. Your preferences</h2>
{kv([("Interests", box("Art and culture") + " " + box("Food and wine") + " " + box("Nature") + " " + box("Adventure") + "<br>" + box("Wellness") + " " + box("History") + " " + box("Beach") + " " + box("Festivals and events") + " " + box("Other: ") + line("s")),
     ("Accommodation style", box("Boutique") + " " + box("Luxury") + " " + box("Comfortable mid-range") + " " + box("Villa or apartment") + " " + box("No preference")),
     ("Travel pace", box("Relaxed") + " " + box("Balanced") + " " + box("Full and active")),
     ("Approximate total budget (all travellers)", line() + " (currency: " + line("s") + ")"),
     ("Anything we should know?", "(accessibility needs, dietary requirements, must-do experiences, things to avoid)<br><br><br><br>")])}
<h2>4. Contact permission</h2>
<p>{box("I agree that World Bridge Meridian may contact me about this journey request.")}</p>
<p class="small">How did you hear about us? {line("l")}</p>
{note("Submitting this form does not commit you to anything. We will reply with a proposal for your review.")}
"""
    return ("01_Send1_FirstReply", "02_Journey_Request_Form.pdf", page("WBM-DOC-02 · SEND 1", "Journey Request Form", "Tell us about the journey you have in mind", body))

def proposal():
    body = f"""
{kv([("Proposal no.", F("WBM-P-0000")), ("Date issued", F("date")), ("Valid until", F("date, e.g. 7 days")), ("Prepared for", F("Client name(s)")), ("Prepared by", F("Consultant name")), ("Client reference", F("WBM-2026-0000"))])}
<h2>Your journey at a glance</h2>
{kv([("Journey title", F("e.g. Winter in the Dolomites")), ("Destinations", F("destinations")), ("Dates", F("departure date") + " to " + F("return date")), ("Travellers", F("number, adults / children")), ("Occasion / purpose", F("occasion"))])}
<p>{F("A short, personal summary of why this journey suits the client and what makes it distinctive.")}</p>
<h2>Itinerary</h2>
{blank_rows(["Day / date", "Location", "Activities and experiences", "Accommodation"], 7)}
<h2>What is included</h2>
<ul><li>{F("e.g. return international flights, economy / business")}</li><li>{F("e.g. 7 nights accommodation, breakfast daily")}</li><li>{F("e.g. private airport transfers")}</li><li>{F("e.g. guided experiences listed above")}</li><li>Planning, booking coordination and support before and during travel by {COMPANY}</li></ul>
<h2>What is not included</h2>
<ul><li>{F("e.g. meals not listed, personal expenses, optional activities")}</li><li>{F("e.g. visas, vaccinations, airport and departure taxes unless stated")}</li><li>Travel insurance (strongly recommended, arranged by you directly with an insurer)</li></ul>
<h2>Investment</h2>
{grid(["Item", "Details", "Amount"], [["Journey components", F("flights, stays, transfers, experiences"), F("amount")], ["Planning and service fee", F("fee description"), F("amount")], ["Taxes and mandatory charges", F("if applicable"), F("amount")], ['<b>Total journey investment</b>', "", F("<b>total and currency</b>")]])}
<h2>Payment schedule</h2>
{grid(["Payment", "Due date", "Amount"], [["Deposit " + F("%"), F("date"), F("amount")], ["Balance", F("date, e.g. 60-90 days before departure"), F("amount")]])}
<p>Payment is made only on the official payments page of the World Bridge Meridian website, after you accept this proposal and receive an invoice. We accept {F("currencies and assets offered, e.g. Bitcoin, Ethereum, Tether, USD Coin, Solana")}. Your consultant never collects payments directly.</p>
<h2>Important information</h2>
<ul>
<li>Prices and availability are confirmed by suppliers only when booked. Until your deposit or payment is verified, nothing is reserved and the quoted price may change.</li>
<li>This proposal is valid until the date above. After that date prices may need to be re-quoted.</li>
<li>Supplier cancellation and change conditions apply to each booking and will be listed in your Supplier Terms Acknowledgement.</li>
<li>Travel documents, entry requirements and health requirements are your responsibility; we will send guidance.</li>
</ul>
<h2>To accept</h2>
<p>Reply to confirm you would like to proceed. We will then send your agreement documents for signature.</p>
"""
    return ("02_Send2_Proposal", "03_Proposal.pdf", page("WBM-DOC-03 · SEND 2", "Journey Proposal", "Itinerary, inclusions and investment", body))

def agreement():
    body = f"""
<p class="small">This is the master agreement between World Bridge Meridian and an individual client or party of individual travellers. It is sent together with the Proposal Acceptance and the Supplier Terms Acknowledgement.</p>
{kv([("Agreement / booking reference", F("WBM-2026-0000")), ("Date", F("date")), ("The Company", ENTITY + ", " + ADDR), ("Registration / licence", F("seller-of-travel or other registration numbers, where applicable")), ("The Client (lead traveller)", F("full name, address, email")), ("Proposal", F("WBM-P-0000, dated ...."))])}
<div class="cl">
<h2>Definitions and this agreement</h2>
<p>"Journey" means the travel arrangements in the accepted Proposal. "Suppliers" means the independent airlines, hotels, cruise lines, tour operators, transport providers and other businesses that provide the Journey's services. "Travellers" means everyone named for the Journey. "Fees" means the amounts in the accepted Proposal. This agreement, the accepted Proposal and the Supplier Terms Acknowledgement together are the entire agreement.</p>
<h2>Our services and role</h2>
<p>The Company designs, arranges and coordinates the Journey and supports the Travellers. {F("Lawyer to confirm role: The Company acts as an agent arranging services provided by independent Suppliers / The Company acts as principal for package components")}. The services themselves are provided by the Suppliers under their own terms.</p>
<h2>Price and fees</h2>
<p>The total price and any planning or service fee are set out in the accepted Proposal. Prices are quoted in {F("currency")}. Supplier prices may change before booking; once the Company confirms a booking in writing and payment is verified, the confirmed price is fixed, except for surcharges that Suppliers are allowed to apply under their terms, which the Company will pass on with notice.</p>
<h2>Payment</h2>
<ol>
<li><b>Schedule.</b> A deposit of {F("%")} is due within {F("number")} days of signing. The balance is due {F("number")} days before departure. For journeys departing within {F("number")} days of booking, full payment is due on booking.</li>
<li><b>Official channel only.</b> Payment is made only through the official payments page of the Company's website, using the asset and network shown on the invoice. The Company's consultants do not collect payments, and the Company never sends wallet addresses by email, message or document. The Client must verify the address against the official payments page before sending.</li>
<li><b>Cryptocurrency.</b> Each invoice states the amount, asset, network and the exchange rate used, and how long that rate is held. Network fees are paid by the Client. Cryptocurrency transfers cannot be reversed. A payment is treated as received only when the Company has verified it against the blockchain and issued a receipt. The Client is responsible for sending the correct amount, asset and network; the Company is not responsible for funds sent to a wrong address or network.</li>
<li><b>Underpayment and late payment.</b> If the verified amount is less than the invoice, the Company will notify the Client and the shortfall must be paid by the due date. If a payment is late, the Company may re-price the Journey, cancel unpaid bookings and apply the cancellation terms below.</li>
</ol>
<h2>Booking and confirmation</h2>
<p>The Company books Suppliers only after payment has been verified. Bookings are confirmed when the Company sends written supplier confirmations. The Company does not guarantee availability before then.</p>
<h2>Client information and responsibilities</h2>
<p>The Client must give accurate information, including names exactly as shown on passports. The Client and every Traveller are responsible for valid passports, visas, entry and health requirements, check-in times and following Supplier and local rules. Errors in names or details may incur Supplier charges for which the Client is responsible. The Company will give guidance on entry requirements but is not a substitute for official sources.</p>
<h2>Changes by the Client</h2>
<p>Requests to change the Journey must be made in writing using the Change or Cancellation Request Form. The Company will send a written cost statement showing Supplier charges and its own fee of {F("amount or %")}. A change is made only after the Client confirms the cost statement in writing. Some bookings cannot be changed.</p>
<h2>Cancellation by the Client</h2>
<p>Cancellations must be requested in writing. The Client is responsible for all Supplier cancellation charges plus the Company's fee. Unless Supplier terms are stricter (in which case those apply), the Company's cancellation charges are:</p>
{grid(["Time before departure", "Charge to the Client"], [[F("91 days or more"), F("% of total")], [F("61 to 90 days"), F("% of total")], [F("31 to 60 days"), F("% of total")], [F("30 days or less / after departure"), F("100%")]])}
<p>The Company's planning and service fee is {F("non-refundable / refundable as follows ...")}.</p>
<h2>Changes or cancellation by the Company or Suppliers</h2>
<p>If a Supplier changes or cancels a service, the Company will inform the Client promptly and offer a comparable alternative or a refund of the affected amount that the Supplier returns, less any non-refundable Company fee as stated above. The Company is not liable for events outside its reasonable control (for example severe weather, strikes, government action, pandemics, airspace or border closures), except to pass on any refund or credit it receives.</p>
<h2>Refunds</h2>
<p>Approved refunds are issued by the Company within {F("number")} business days of receiving the funds back from Suppliers, or of the Company's own approval, using the same method as the original payment where possible. For cryptocurrency, refunds are paid in the same asset and network to an address the Client confirms through a secure channel, {F("lawyer to confirm: at the amount in the original asset / at the value on the original invoice date")}. The Company will issue a Refund Statement showing every deduction.</p>
<h2>Travel insurance</h2>
<p>The Company strongly recommends comprehensive travel insurance covering cancellation, interruption, emergency medical care, evacuation and baggage. Insurance is arranged by the Client directly with an insurer and is not included in the Journey price. The Company does not sell insurance. The Client will complete the Travel Insurance Acknowledgement.</p>
<h2>Responsibility and liability</h2>
<p>The Company takes reasonable care in selecting Suppliers and arranging the Journey. Suppliers are independent businesses. {F("Lawyer to define the limit of liability, exclusions, and consumer-law rights that cannot be excluded in the jurisdictions served.")}</p>
<h2>Complaints</h2>
<p>If something goes wrong, tell the Company at once, during the Journey if possible, so it can help put it right. Written complaints can be sent to {EMAIL}. The Company will acknowledge within {F("number")} business days and aim to resolve within {F("number")} days.</p>
<h2>Privacy and communications</h2>
<p>The Company uses personal information only as described in its Privacy Notice and the Consent form. Official communications are by the email address {EMAIL} and the Company's website. Payment instructions are never sent in chats or social media messages.</p>
<h2>General</h2>
<p>This agreement is governed by the laws of {F("governing law and jurisdiction")}. Disputes will be resolved by {F("courts / arbitration / mediation first")}. Changes must be in writing and agreed by both parties. This agreement may be signed electronically and in counterparts. If any part is unenforceable, the rest continues.</p>
</div>
<h2>Signatures</h2>
<p>By signing, the Client confirms that they have read and accept this agreement and are authorised to accept it for all Travellers named in the Proposal.</p>
{sig("Client signature", "Printed name", "Date")}
{sig("For World Bridge Meridian (authorised signatory)", "Printed name and title", "Date")}
"""
    return ("03_Send3_SigningBundle", "04_Client_Services_Agreement.pdf", page("WBM-DOC-04 · SEND 3", "Client Services Agreement", "Master agreement for an individual client or travel party", body, draft=True))

def acceptance():
    body = f"""
{kv([("Client / booking reference", F("WBM-2026-0000")), ("Proposal no. and date", F("WBM-P-0000, ...")), ("Client name", F("full name")), ("Journey", F("title, destinations, dates")), ("Travellers", F("number and names"))])}
<h2>I accept</h2>
<p>I confirm that I have reviewed the Proposal referenced above and that I accept it, including:</p>
<ul>
<li>{box("The itinerary, inclusions and exclusions described in the Proposal.")}</li>
<li>{box("The total journey investment of")} {F("amount and currency")}, {box("and the payment schedule shown.")}</li>
<li>{box("The options I have selected:")} {F("list any optional extras chosen, or write 'none'")}</li>
<li>{box("That prices and availability are confirmed only when suppliers book after my payment is verified.")}</li>
<li>{box("That this acceptance is subject to the Client Services Agreement, which I am signing together with this document.")}</li>
</ul>
<h2>Changes requested before booking (optional)</h2>
<p>{line("l")}</p><p>{line("l")}</p>
{sig("Client signature", "Printed name", "Date")}
{note("Returning this form does not by itself create a booking. A booking is made only after the agreement is signed, the invoice is paid and verified, and the Company has sent supplier confirmations.")}
"""
    return ("03_Send3_SigningBundle", "05_Proposal_Acceptance.pdf", page("WBM-DOC-05 · SEND 3", "Proposal Acceptance", "Client confirmation of the journey and price", body))

def supplier_ack():
    body = f"""
<p>Your Journey is provided by independent suppliers (airlines, hotels, cruise lines, tour operators and others). Each supplier has its own terms, which can include non-refundable payments, name-change fees, strict cancellation windows and baggage and check-in rules. These terms apply in addition to the Client Services Agreement and, where stricter, take priority over the Company's own cancellation schedule.</p>
{kv([("Client / booking reference", F("WBM-2026-0000")), ("Client name", F("full name"))])}
<h2>Suppliers and key conditions</h2>
{blank_rows(["Supplier and service", "Link or attachment to terms", "Key restrictions (non-refundable, name changes, deadlines)"], 7)}
<h2>I acknowledge</h2>
<ul>
<li>{box("I have been given access to the supplier terms listed above and have read the key restrictions.")}</li>
<li>{box("Some bookings may be non-refundable or non-changeable once made, including after only a deposit has been paid.")}</li>
<li>{box("Supplier deadlines (for example name changes, final payment, check-in and baggage rules) are my responsibility to meet, and the Company will remind me of the main dates.")}</li>
<li>{box("If a supplier changes or cancels, the Company will pass on any refund or credit it actually receives, as set out in my agreement.")}</li>
</ul>
{sig("Client signature", "Printed name", "Date")}
"""
    return ("03_Send3_SigningBundle", "06_Supplier_Terms_Acknowledgement.pdf", page("WBM-DOC-06 · SEND 3", "Supplier Terms Acknowledgement", "Confirmation that supplier conditions have been shared and understood", body, draft=True))

def group_contract():
    body = f"""
<p class="small">Use instead of, or alongside, the Client Services Agreement when one person books for a group. The Client Services Agreement terms (payment, cancellation, liability, privacy) apply to the group unless this contract states otherwise.</p>
{kv([("Booking reference", F("WBM-G-0000")), ("Group name", F("group name")), ("Group leader (signing party)", F("name, email, phone")), ("The Company", ENTITY + ", " + ADDR), ("Journey", F("title, destinations, dates")), ("Estimated group size", F("minimum") + " to " + F("maximum") + " travellers")])}
<h2>1. Group leader's authority</h2>
<p>The group leader signs for the group, is the Company's main contact, and confirms they have authority to bind the group members they register. Each member remains responsible for providing accurate personal details and meeting entry and supplier requirements.</p>
<h2>2. Group size and deadlines</h2>
{grid(["Milestone", "Deadline"], [["Initial deposit", F("date and amount")], ["Final headcount confirmed", F("date")], ["Rooming list and traveller details received", F("date")], ["Final payment", F("date")], ["Name changes locked", F("date")]])}
<h2>3. Pricing and attrition</h2>
<p>Group pricing is based on a minimum of {F("number")} paying travellers. If the headcount falls below the minimum or below {F("%")} of the confirmed number, prices may be re-quoted and supplier attrition charges may apply. The group leader will be told in writing before any extra charge is applied.</p>
<h2>4. Payment</h2>
<p>Payments are made only through the official payments page, as stated in the invoice. {F("Choose: the group leader pays one consolidated invoice / each traveller pays an individual invoice")}. The Company never collects payments or sends wallet addresses by email or message.</p>
<h2>5. Cancellations and changes</h2>
<p>Cancellation of the whole group or of individual members follows the cancellation schedule in the Client Services Agreement or the supplier terms, whichever is stricter. Replacement travellers are allowed only if the supplier permits and before the name-change deadline above.</p>
<h2>6. Responsibilities</h2>
<ul><li>The group leader will distribute information from the Company to members.</li><li>Members must provide personal details securely and sign the Consent form.</li><li>Members are responsible for travel documents, visas, health and behaviour consistent with supplier rules.</li></ul>
<h2>7. Law and signature</h2>
<p>Governing law and dispute resolution are as stated in the Client Services Agreement: {F("governing law")}.</p>
{sig("Group leader signature", "Printed name", "Date")}
{sig("For World Bridge Meridian (authorised signatory)", "Printed name and title", "Date")}
<div class="pb"></div>
<h2>Annex A: Rooming and traveller list</h2>
<p class="small">Return by the deadline above through the secure form. Do not email passport numbers.</p>
{blank_rows(["#", "Traveller full name (as on passport)", "Room type / sharing with", "Dietary or accessibility needs"], 14)}
"""
    return ("03_Send3_SigningBundle", "07_Group_Booking_Contract_(groups_only).pdf", page("WBM-DOC-07 · SEND 3 · GROUPS", "Group Booking Contract", "For group trips: school, family, club, wedding, event and incentive groups", body, draft=True))

def corporate():
    body = f"""
<p class="small">Use instead of, or as an umbrella above, the Client Services Agreement when the client is a company or organisation. For repeat clients, keep this agreement and use a short booking confirmation for each trip.</p>
{kv([("Agreement no. and date", F("WBM-C-0000, date")), ("The Company", ENTITY + ", " + ADDR), ("The Client", F("company legal name, registration no., address")), ("Client's authorised representative", F("name, title, email")), ("Client's travel contact", F("name, email, phone"))])}
<h2>1. Scope</h2>
<p>The Company will plan, arrange and coordinate business travel, events, retreats, incentive or group travel for the Client and its personnel and guests as requested in writing during the term.</p>
<h2>2. Requests and purchase orders</h2>
<p>Each trip begins with a written request and Proposal. The Client authorises a trip by accepting the Proposal and, where the Client uses purchase orders, by sending a purchase order number before the Company books. The Company will quote the PO number on its invoice.</p>
<h2>3. Fees</h2>
<p>Fees and mark-ups are listed in Schedule A or in each Proposal. Supplier prices are confirmed when booked after payment is verified.</p>
<h2>4. Invoicing and payment</h2>
<p>The Company invoices the Client in {F("currency")}. Payment terms: {F("e.g. due on receipt / deposit then balance by date")}. Payment is made only through the official payments page, using the asset and network on the invoice, and is treated as received only when verified and receipted. The Company's staff never collect payments and never send wallet addresses by email or message. Network fees are borne by the Client.</p>
<h2>5. Changes and cancellation</h2>
<p>Changes and cancellations must be requested in writing. The Client is liable for supplier charges plus the Company's fee of {F("amount or %")}. Supplier terms apply. The Company will send a written cost statement before acting.</p>
<h2>6. Client responsibilities</h2>
<p>The Client is responsible for ensuring its travellers have valid travel documents and approvals, and for providing accurate traveller information through secure channels. {F("Optional: duty-of-care and travel-risk responsibilities to be defined with counsel.")}</p>
<h2>7. Confidentiality and data protection</h2>
<p>Each party keeps the other's non-public information confidential. The Company processes traveller data only to arrange the trips and as stated in its Privacy Notice, and will delete passport data after the trip as stated there. {F("Data processing terms to be added if required.")}</p>
<h2>8. Liability</h2>
<p>{F("Lawyer to define liability, exclusions and insurance to be held by the Company.")}</p>
<h2>9. Term and termination</h2>
<p>This agreement starts on {F("date")} and continues for {F("term")} unless ended by either party on {F("number")} days' written notice. Accepted bookings continue under this agreement after termination.</p>
<h2>10. Law</h2>
<p>Governing law and courts: {F("governing law and jurisdiction")}.</p>
{sig("For the Client (authorised signatory)", "Printed name and title", "Date")}
{sig("For World Bridge Meridian (authorised signatory)", "Printed name and title", "Date")}
<h2>Schedule A: Fees and rates</h2>
{blank_rows(["Service", "Fee / mark-up", "Notes"], 5)}
"""
    return ("03_Send3_SigningBundle", "08_Corporate_Services_Agreement_(companies_only).pdf", page("WBM-DOC-08 · SEND 3 · COMPANIES", "Corporate Services Agreement", "For company, institution and organisation clients", body, draft=True))
