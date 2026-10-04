from lib import *

def insurance():
    body = f"""
{kv([("Client / booking reference", F("WBM-2026-0000")), ("Client name", F("full name")), ("Journey and dates", F("journey, departure to return"))])}
<p>World Bridge Meridian strongly recommends comprehensive travel insurance for every journey. It should cover at least trip cancellation and interruption, emergency medical care and evacuation, and baggage loss. World Bridge Meridian is not an insurer and does not sell, arrange or give advice on insurance policies; you arrange insurance directly with a licensed insurer or broker, and its cost is not included in your journey price.</p>
<h2>Please choose one</h2>
<p>{box("<b>I have arranged travel insurance.</b>")}</p>
{kv([("Insurer", ""), ("Policy number", ""), ("Policy dates", ""), ("Emergency assistance number", ""), ("Travellers covered", "")])}
<p>{box("<b>I will arrange travel insurance before my first non-refundable payment</b> and send the details above before departure.")}</p>
<p>{box("<b>I have chosen not to buy travel insurance.</b> I understand that I may have to pay in full for cancellations, medical treatment, evacuation, delays or losses that insurance could have covered, and that World Bridge Meridian is not responsible for those costs.")}</p>
<h2>I acknowledge</h2>
<ul><li>Insurance may exclude pre-existing conditions, certain activities and cancellations for reasons not covered, and may need to be bought soon after the first payment to be effective.</li><li>I am responsible for reading my policy and for making any insurance claim myself.</li></ul>
{sig("Client signature", "Printed name", "Date")}
"""
    return ("04_Send4_Insurance", "09_Travel_Insurance_Acknowledgement.pdf", page("WBM-DOC-09 · SEND 4", "Travel Insurance Acknowledgement", "Record that insurance was recommended and what the client chose", body, draft=True))

def invoice():
    body = f"""
{kv([("Invoice no.", F("INV-0000")), ("Invoice date", F("date")), ("Payment due by", F("date and time (and time zone)")), ("Booking reference", F("WBM-2026-0000")), ("Proposal no.", F("WBM-P-0000")), ("PO number (companies)", F("if provided"))])}
<table><tr><th>Billed to</th><th>Issued by</th></tr><tr><td>{F("Client name / company")}<br>{F("address")}<br>{F("email")}</td><td>{ENTITY}<br>{ADDR}<br>{EMAIL}<br>{F("tax / registration no., if applicable")}</td></tr></table>
<h2>Charges</h2>
{grid(["Description", "Amount"], [[F("e.g. Deposit (30%) for Winter in the Dolomites, 4 travellers"), F("amount")], [F("e.g. Planning and service fee"), F("amount")], [F("Taxes, if applicable"), F("amount")]])}
<table class="tot"><tr><td>Total due on this invoice</td><td class="r">{F("amount and currency")}</td></tr><tr><td>Previously paid (receipt nos.)</td><td class="r">{F("amount or 0")}</td></tr><tr><td>Balance remaining after this invoice</td><td class="r">{F("amount")}</td></tr></table>
<h2>How to pay</h2>
{grid(["Payment detail", "For this invoice"], [["Asset", F("e.g. USDC")], ["Network", F("e.g. Ethereum / Solana")], ["Amount to send", F("exact amount in the asset")], ["Rate used", F("rate, source and time")], ["Rate held until", F("date and time")]])}
{warn(f"<b>Pay only on the official payments page: {PAY_URL}.</b> Check the address on that page against the QR code before you send. The Company never sends wallet addresses by email, message or document, and no consultant collects payment. If anything looks different, stop and contact us at {EMAIL} or {PHONE}.")}
<p>After you send payment, submit the transaction reference on the payments page together with this invoice number. Your payment is confirmed only after our team verifies it and sends you a receipt.</p>
<p class="small">Payment terms are set out in your Client Services Agreement. Network fees are paid by the sender. If the verified amount is lower than the amount shown, the shortfall remains due.</p>
"""
    return ("05_Send5_Payment", "10_Invoice.pdf", page("WBM-DOC-10 · SEND 5", "Invoice", "Amount due and how to pay", body))

def pay_auth():
    body = f"""
{kv([("Invoice no.", F("INV-0000")), ("Booking reference", F("WBM-2026-0000")), ("Payer name", F("full name / company")), ("Amount", F("amount and currency")), ("Payment method", "Cryptocurrency via the official payments page"), ("Asset and network", F("asset") + " on " + F("network"))])}
<h2>I authorise and confirm</h2>
<ul>
<li>{box("I authorise payment of the amount above for the invoice above, and I am the person or authorised representative of the company making this payment.")}</li>
<li>{box("I will pay only through the official World Bridge Meridian payments page, and I will check that the address matches the one published there before I send.")}</li>
<li>{box("I understand World Bridge Meridian never sends wallet addresses by email, message or document, and that no consultant collects payments, private keys or seed phrases.")}</li>
<li>{box("I understand cryptocurrency transfers are irreversible; I am responsible for the correct asset, network and amount, and for network fees.")}</li>
<li>{box("I understand my payment counts only after the Company verifies it and issues a receipt, and that the exchange rate on the invoice is valid only until the time shown.")}</li>
<li>{box("I understand refunds, if any, follow my signed agreement and are paid only to an address I confirm through a secure channel.")}</li>
<li>{box("The funds I am sending are my own or my company's, and come from a lawful source.")}</li>
</ul>
{sig("Payer signature", "Printed name", "Date")}
<p class="small">Return this signed form before sending payment. Payments made without a signed authorization may be delayed while we verify them.</p>
"""
    return ("05_Send5_Payment", "11_Payment_Authorization.pdf", page("WBM-DOC-11 · SEND 5", "Payment Authorization", "Client authorisation and security acknowledgement for payment", body, draft=True))

def pay_sheet():
    body = f"""
<p>Follow these steps exactly. Keep this sheet with your invoice. Your consultant can walk you through them, but <b>will never collect payment for you</b>.</p>
<h2>Step by step</h2>
<ol>
<li><b>Open the official payments page yourself.</b> Type <b>{PAY_URL}</b> into your browser. Do not use a link from an email, message or social post.</li>
<li><b>Choose the asset and network on your invoice.</b> Asset: {F("asset")}. Network: {F("network")}. A different network can mean the funds are lost.</li>
<li><b>Verify the address.</b> Compare the address shown with the QR code on the same page. Check the first and last characters carefully.</li>
<li><b>Send the exact amount</b> shown on the invoice: {F("amount")}. Include enough to cover the network fee, so the full amount arrives.</li>
<li><b>Submit your transaction reference</b> on the payments page: the transaction hash, your name and your invoice number {F("INV-0000")}.</li>
<li><b>Wait for verification.</b> Our team confirms every transaction against the blockchain, usually within {F("number")} business hours. You will receive a receipt by email. Your booking proceeds only after that receipt.</li>
</ol>
{warn("<b>Protect yourself.</b><ul><li>World Bridge Meridian <b>never</b> sends wallet addresses by email, chat or documents.</li><li>We <b>never</b> ask for your private key, seed phrase, password or exchange login.</li><li>If someone gives you a different address, <b>do not send</b>. Contact us using the details below.</li><li>If you think you were sent wrong instructions, contact us immediately.</li></ul>")}
<h2>Common mistakes</h2>
{grid(["Mistake", "What to do instead"], [["Sending on the wrong network", "Match the network on your invoice exactly"], ["Sending a different asset", "Send only the asset on your invoice"], ["Sending less than the invoice (after fees)", "Allow for network fees so the full amount arrives"], ["Paying after the rate expiry time", "Contact us for a new invoice before sending"], ["Forgetting the reference", "Submit the transaction hash and invoice number on the payments page"]])}
<h2>Need help?</h2>
<p>Email {EMAIL} or call {PHONE}. Use only these official contact details.</p>
"""
    return ("05_Send5_Payment", "12_Payment_Instruction_Sheet.pdf", page("WBM-DOC-12 · SEND 5", "Payment Instruction Sheet", "How to pay safely on the official payments page", body))

def receipt():
    body = f"""
{kv([("Receipt no.", F("REC-0000")), ("Date payment verified", F("date and time")), ("Received from", F("payer name")), ("Invoice no. / booking reference", F("INV-0000 / WBM-2026-0000"))])}
{grid(["Detail", "Information"], [["Amount received", F("amount")], ["Asset and network", F("asset / network")], ["Transaction reference (first and last characters)", F("hash excerpt")], ["Applied to", F("e.g. Deposit for ...")], ["Total paid to date", F("amount")], ["Balance remaining", F("amount")], ["Next payment due", F("date and amount, or 'none'")]])}
<p>Thank you. We have verified your payment. We will now book the suppliers for your Journey and send you the supplier confirmations. Please keep this receipt with your records.</p>
<p class="small">Issued by {ENTITY}, {ADDR}.</p>
"""
    return ("06_Send6_Receipt", "13_Receipt.pdf", page("WBM-DOC-13 · SEND 6", "Receipt and Payment Confirmation", "Issued after the payment is verified", body))

def traveler_form():
    def person(n):
        return f"""<h2>Traveller {n}</h2>
{kv([("Full name exactly as on passport", ""), ("Date of birth", "DD / MM / YYYY"), ("Nationality", ""), ("Passport issuing country", ""), ("Passport number", ""), ("Passport issue and expiry dates", ""), ("Email and phone", ""), ("Frequent flyer / loyalty numbers (optional)", "")])}"""
    body = f"""
{warn("<b>Return this form only through the secure link or portal your consultant provides. Do not send it as an ordinary email attachment or message.</b> We collect passport details only after payment is verified, and delete them after your trip as explained in the Privacy Notice.")}
{kv([("Booking reference", F("WBM-2026-0000")), ("Lead traveller", F("name"))])}
{person(1)}
<div class="pb"></div>
{person(2)}
<p class="small">Add one block per traveller (copy this form). Children: please give date of birth and the passport details of the child.</p>
<div class="pb"></div>
<h2>Emergency contact (not travelling with you)</h2>
{kv([("Name and relationship", ""), ("Phone (with country code)", ""), ("Email", "")])}
<h2>Special requirements (optional)</h2>
<p class="small">Share only what a supplier needs to know, for example a wheelchair, a dietary requirement or an accessible room. Do not include medical history or diagnoses.</p>
{kv([("Dietary requirements", ""), ("Accessibility or mobility needs", ""), ("Seating, room or other requests", "")])}
"""
    return ("07_Send7_TravelerDetails", "14_Traveler_Information_Form.pdf", page("WBM-DOC-14 · SEND 7", "Traveller Information Form", "Details needed by airlines, hotels and other suppliers to make the bookings", body))

def consent():
    body = f"""
<p>This notice explains how {ENTITY} ("we") uses your personal information to arrange your journey. {F("Lawyer to adapt to the privacy laws of the countries where you operate, such as GDPR, UK GDPR, CCPA, PIPEDA.")}</p>
<h2>What we collect</h2>
<ul><li>Contact details, names and dates of birth as shown on your passport.</li><li>Passport and nationality details, frequent flyer numbers and emergency contact.</li><li>Special requirements you choose to give us (for example accessibility or dietary needs).</li><li>Payment references (for example transaction hashes), but never private keys, seed phrases or exchange logins.</li></ul>
<h2>Why we use it</h2>
<p>To prepare, book and manage your journey and to support you while you travel; to meet legal duties (such as sanctions checks and accounting); and, only if you agree below, to send you travel ideas.</p>
<h2>Who receives it</h2>
<p>Only the suppliers and authorities needed for your journey: airlines, hotels, cruise lines, tour operators, transfer companies, border and security authorities as required, and service providers who help us operate (for example secure storage and e-signature). These recipients may be in other countries. {F("Describe safeguards for international transfers.")}</p>
<h2>How long we keep it</h2>
<p>Passport and identity details are deleted within {F("number")} days after your journey ends unless the law requires us to keep them. Booking, invoice and payment records are kept for {F("number")} years for accounting and legal reasons. {F("Confirm retention periods with counsel and your accountant.")}</p>
<h2>Your rights</h2>
<p>Depending on where you live, you can ask to see, correct or delete your information, object to certain uses or withdraw consent. Contact {EMAIL}. You can also contact your local data-protection authority.</p>
<h2>Consent</h2>
{kv([("Booking reference", F("WBM-2026-0000")), ("Name", "")])}
<p>{box("<b>Required.</b> I consent to World Bridge Meridian collecting and sharing my details, and those of the travellers I am registering, with the suppliers and authorities needed to arrange this journey. I have the authority to give this consent for the other travellers.")}</p>
<p>{box("<b>Optional.</b> I consent to receiving news and travel ideas from World Bridge Meridian by email. I can unsubscribe at any time.")}</p>
<p>{box("<b>Optional.</b> I have chosen to provide accessibility, dietary or similar information for the sole purpose of arranging suitable services, and I consent to it being shared with the relevant suppliers.")}</p>
{sig("Signature", "Printed name", "Date")}
"""
    return ("07_Send7_TravelerDetails", "15_Consent_and_Privacy_Notice.pdf", page("WBM-DOC-15 · SEND 7", "Consent and Privacy Notice", "How we use your information, and your consent", body, draft=True))

def booking_conf():
    body = f"""
{kv([("Booking reference", F("WBM-2026-0000")), ("Date issued", F("date")), ("Lead traveller", F("name")), ("Travellers", F("names"))])}
<p>We have booked the following services for your Journey. Please check every name, date and detail carefully and tell us immediately if anything is incorrect.</p>
{blank_rows(["Supplier", "Service and dates", "Supplier confirmation no.", "Status", "Free-change / cancellation deadline"], 8)}
<h2>Important dates</h2>
{grid(["Date", "What happens"], [[F("date"), F("e.g. final payment due, name-change deadline, online check-in opens")], [F("date"), F("")]])}
<p class="small">Supplier terms apply to each booking, as listed in your Supplier Terms Acknowledgement.</p>
"""
    return ("08_Send8_BookingConfirmation", "16_Supplier_Booking_Confirmation.pdf", page("WBM-DOC-16 · SEND 8", "Booking Confirmation", "What has been booked for your journey", body))

def itinerary():
    body = f"""
{kv([("Booking reference", F("WBM-2026-0000")), ("Travellers", F("names")), ("Dates", F("departure to return")), ("Your consultant", F("name, phone"))])}
<h2>Flights</h2>
{blank_rows(["Date", "Flight", "From to", "Departs / arrives", "Confirmation"], 4)}
<h2>Accommodation</h2>
{blank_rows(["Hotel", "Check-in to check-out", "Address and phone", "Confirmation"], 3)}
<h2>Day by day</h2>
{blank_rows(["Day / date", "Plan", "Meeting point and time", "Notes"], 9)}
<h2>Transfers and transport</h2>
{blank_rows(["Date and time", "From to", "Provider and contact", "Notes"], 3)}
<h2>Reminders</h2>
<ul><li>Check passports are valid for the period required by your destination.</li><li>Check in online where possible and arrive at airports early.</li><li>Keep this itinerary and your vouchers accessible offline.</li></ul>
"""
    return ("09_Send9_BeforeDeparture", "17_Final_Itinerary.pdf", page("WBM-DOC-17 · SEND 9", "Final Itinerary", "Your journey, day by day", body))

def voucher():
    body = f"""
{kv([("Voucher no.", F("V-0000")), ("Booking reference", F("WBM-2026-0000")), ("Traveller(s)", F("names")), ("Supplier", F("name")), ("Service", F("e.g. 3 nights, deluxe room, breakfast")), ("Dates", F("from to")), ("Supplier confirmation no.", F("number")), ("Supplier address and phone", F("details")), ("Special arrangements", F("details"))])}
<p>Please present this voucher, or show it on your phone, to the supplier on arrival. It confirms that this service has been booked and arranged by World Bridge Meridian. {F("State whether the service is prepaid in full or whether the traveller pays anything locally, e.g. city tax.")}</p>
<p class="small">If you have any difficulty with this service, contact World Bridge Meridian at {PHONE} or {EMAIL}. Use one voucher per service; copy this template for each.</p>
"""
    return ("09_Send9_BeforeDeparture", "18_Service_Voucher.pdf", page("WBM-DOC-18 · SEND 9", "Service Voucher", "Present to the supplier on arrival", body))

def entry_notice():
    body = f"""
<p>Entry, visa and health requirements depend on your nationality, passport, route and the countries you visit, and they can change at short notice. <b>You are responsible for checking and meeting them.</b> The information below is guidance only and is not legal advice. Always confirm with the official government sources listed.</p>
{kv([("Booking reference", F("WBM-2026-0000")), ("Destination(s) and transit points", F("countries and airports")), ("Date issued", F("date"))])}
<h2>Requirements by traveller</h2>
{blank_rows(["Traveller and nationality", "Passport validity needed", "Visa or travel authorisation", "Other requirements"], 5)}
<h2>Official sources checked</h2>
<ul><li>{F("Official government immigration or foreign-affairs page")}</li><li>{F("Official health or vaccination page, if relevant")}</li><li>{F("Your own government's travel advice")}</li></ul>
<h2>Also remember</h2>
<ul><li>Many countries require a passport valid for six months after your arrival date or return date, with blank pages.</li><li>Some countries need an electronic authorisation before you fly.</li><li>Check airline rules for proof of onward travel and for connecting flights.</li><li>Check customs limits for goods, cash and medication.</li></ul>
"""
    return ("09_Send9_BeforeDeparture", "19_Entry_and_Visa_Requirements_Notice.pdf", page("WBM-DOC-19 · SEND 9", "Entry and Visa Requirements Notice", "Guidance to check before you travel", body, draft=True))

def emergency():
    body = f"""
{kv([("Booking reference", F("WBM-2026-0000")), ("Travellers", F("names"))])}
<h2>World Bridge Meridian support</h2>
{kv([("Your consultant", F("name and phone")), ("Support line during travel", F("24/7 number, if offered") + " or " + PHONE), ("Email", EMAIL), ("Support hours", F("hours and time zone"))])}
<p>Call us first for any change, delay, missed connection, lost document or problem with a service. We will help you rebook, contact suppliers and keep your records.</p>
<h2>If something happens</h2>
{grid(["Situation", "What to do"], [["Flight delayed or cancelled", "Speak to the airline at the airport, then call us with your booking reference."], ["Lost or stolen passport", "Report it to local police and your embassy, then call us."], ["Medical emergency", "Call local emergency services first. Then contact your insurer's emergency line and tell us."], ["Problem with a hotel or service", "Tell the supplier on the spot, then contact us the same day."], ["Concern about a payment request", "Do not send anything. Contact us on the official details above."]])}
<h2>Your insurance</h2>
{kv([("Insurer and policy number", F("from your insurance acknowledgement")), ("Insurer's 24-hour emergency number", F("number"))])}
<h2>Local emergency numbers and embassies</h2>
{blank_rows(["Country", "Police / ambulance", "Your embassy or consulate (address and phone)"], 3)}
"""
    return ("09_Send9_BeforeDeparture", "20_Emergency_Contacts_and_Support.pdf", page("WBM-DOC-20 · SEND 9", "Emergency Contacts and Support", "Who to call and what to do while you travel", body))

def feedback():
    rate = lambda q: f"<tr><td>{q}</td>" + "".join(f"<td style='text-align:center'>{box('')}</td>" for _ in range(5)) + "</tr>"
    body = f"""
<p>Thank you for travelling with World Bridge Meridian. Your honest feedback helps us improve and design better journeys for others.</p>
{kv([("Booking reference", F("WBM-2026-0000")), ("Name (optional)", "")])}
<table><tr><th>Please rate (1 = poor, 5 = excellent)</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>
{rate("Planning and communication before travel")}{rate("Quality of the itinerary and suppliers")}{rate("Support during your journey")}{rate("Clarity of documents and payment process")}{rate("Overall experience")}</table>
<h2>Tell us more</h2>
<p>What did you enjoy most?<br>{line("l")}<br>{line("l")}</p>
<p>What could we do better?<br>{line("l")}<br>{line("l")}</p>
<p>Would you recommend us? {box("Yes")} {box("Maybe")} {box("No")}</p>
<h2>Permission</h2>
<p>{box("I allow World Bridge Meridian to quote my comments on its website and materials with my first name and initial only.")}</p>
<p class="small">Leave this unticked if you prefer your feedback to stay private. Return by replying to our email.</p>
"""
    return ("10_Send10_AfterTrip", "21_Feedback_Request.pdf", page("WBM-DOC-21 · SEND 10", "Feedback Request", "How was your journey?", body))

def change_form():
    body = f"""
<p>Use this form to ask for a change or a cancellation. Making the request in writing gives both of us a dated record. <b>Submitting it does not itself change or cancel anything.</b> We will first send you a written cost statement.</p>
{kv([("Booking reference", ""), ("Client name", ""), ("Email and phone", ""), ("Date of request", "")])}
<h2>What would you like?</h2>
<p>{box("Cancel the whole journey")}<br>{box("Cancel part of the journey (specify below)")}<br>{box("Change travel dates")}<br>{box("Change or add a traveller")}<br>{box("Change a hotel, flight or experience")}<br>{box("Other: ")} {line()}</p>
<h2>Details</h2>
<p>{line("l")}</p><p>{line("l")}</p><p>{line("l")}</p>
<p>Reason (optional; this helps us when talking to suppliers): {line("l")}</p>
<h2>Please note</h2>
<ul><li>Supplier charges and our change or cancellation fee may apply, as set out in your signed agreement and the supplier terms.</li><li>Some bookings cannot be changed or refunded.</li><li>If you have travel insurance, you may need to notify your insurer yourself.</li></ul>
{sig("Client signature", "Printed name", "Date")}
<table><tr><th colspan="2">For office use</th></tr><tr><td>Date received</td><td></td></tr><tr><td>Handled by</td><td></td></tr><tr><td>Cost statement sent (date)</td><td></td></tr></table>
"""
    return ("11_WhenNeeded_ChangeOrCancel", "22_Change_or_Cancellation_Request_Form.pdf", page("WBM-DOC-22 · WHEN NEEDED", "Change or Cancellation Request Form", "Client request, sent only when needed", body))

def cost_statement():
    body = f"""
{kv([("Booking reference", F("WBM-2026-0000")), ("Request received", F("date")), ("Statement date", F("date")), ("Client", F("name")), ("Request", F("e.g. cancel the whole journey / move dates"))])}
<h2>What this will cost</h2>
{grid(["Item", "Amount"], [["Amount paid to date", F("amount")], ["Supplier charges, cancellation or change penalties (itemised below)", F("amount")], ["World Bridge Meridian fee", F("amount")], ["Difference in price for new dates or services, if any", F("amount")], ['<b>Net amount refundable to you</b> (or additional amount payable)', F("amount")]])}
<h2>Supplier charges (itemised)</h2>
{blank_rows(["Supplier and service", "Charge", "Basis (supplier term or date)"], 4)}
<h2>To proceed</h2>
<p>Please confirm below by {F("date and time")}. If we do not hear from you by then, supplier deadlines may change the amounts above. After you confirm we will carry out the change with the suppliers and send a Refund Statement if money is owed back.</p>
<p>{box("I accept this cost statement and ask World Bridge Meridian to proceed.")}</p>
<p>{box("I do not wish to proceed. Please leave my booking as it is.")}</p>
{sig("Client signature", "Printed name", "Date")}
"""
    return ("11_WhenNeeded_ChangeOrCancel", "23_Change_or_Cancellation_Cost_Statement.pdf", page("WBM-DOC-23 · WHEN NEEDED", "Change or Cancellation Cost Statement", "Written cost sent before any change is made", body, draft=True))

def refund():
    body = f"""
{kv([("Refund no.", F("REF-0000")), ("Date issued", F("date")), ("Booking reference", F("WBM-2026-0000")), ("Client", F("name")), ("Related cost statement", F("date"))])}
<h2>Calculation</h2>
{grid(["Item", "Amount"], [["Total payments received (receipt nos. listed)", F("amount")], ["Less: supplier charges", F("amount")], ["Less: World Bridge Meridian fee", F("amount")], ["Less: refunds still awaited from suppliers (to follow)", F("amount")], ['<b>Net refund</b>', F("amount")]])}
<h2>How it will be paid</h2>
{kv([("Method", "Same asset and network as the original payment, or as agreed in writing"), ("Destination address", "Confirmed by the client through a secure channel and verified by a call. Never sent in this document."), ("Expected date", F("date")), ("Reference to quote", F("REF-0000"))])}
{note(f"Cryptocurrency refunds cannot be reversed once sent. We send them only to an address you confirm through a secure channel. Network fees for the refund transfer are {F('borne by ... / deducted as stated in the agreement')}.")}
<p>If any supplier refund is still outstanding, we will send you a further statement when it arrives. Please keep this statement for your records.</p>
"""
    return ("11_WhenNeeded_ChangeOrCancel", "24_Refund_Statement.pdf", page("WBM-DOC-24 · WHEN NEEDED", "Refund Statement", "Shows every deduction and how the refund is paid", body, draft=True))

ALL = [insurance, invoice, pay_auth, pay_sheet, receipt, traveler_form, consent, booking_conf, itinerary, voucher, entry_notice, emergency, feedback, change_form, cost_statement, refund]
