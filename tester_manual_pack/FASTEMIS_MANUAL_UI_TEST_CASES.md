# FastEMIs Manual UI Test Cases

## For Manual Tester

This document is for UI testing only.
Do not use database, API tools, console, or code.
Only test from the website screens.

After each test case:
- take screenshots
- paste them in the Word file
- write PASS or FAIL
- if FAIL, write a short bug note

## Basic Rules

- Test on desktop browser.
- Test again in mobile view.
- Use simple clear screenshots.
- If one step fails, write the exact page and exact action.
- Do not skip validation checks.

## Before You Start

You need:
- 2 new user accounts created from UI
- 1 agent login given by team
- stable internet
- desktop Chrome browser
- mobile responsive mode in browser or real phone if available

Suggested screenshot file names:
- TC1_User1_Signup.png
- TC1_User2_CompleteProfile.png
- TC2_UserChatToAgent.png
- TC3_GlobalPaymentConfig.png
- TC4_AgreementSignature.png
- TC5_CommunityChat.png
- TC6_UIConfig.png
- TC7_SecurityTest.png

## Bug Report Format

Use this simple format if something fails:

- Test Case ID:
- Page URL:
- What you clicked:
- What happened:
- What should happen:
- Screenshot name:

---

# Test Case 1 - User Sign Up and Complete Profile

## Goal
Check that 2 users can sign up from UI and complete profile details properly.

## Pages
- /sign-up
- /dashboard/complete-profile
- /dashboard
- agent side applicants/profile details

## Steps
1. Open the sign up page.
2. Create User 1 from UI using a fresh Gmail ID.
3. Create User 2 from UI using another fresh Gmail ID.
4. After sign up, check that the user goes to the second details page.
5. On the complete profile page, first try to click submit without filling all required fields.
6. Check if validation messages are shown correctly.
7. Fill all fields for User 1.
8. Fill all fields for User 2.
9. Upload all required files.
10. Save the profile.
11. Open user side My Profile and check all saved details.
12. Login from agent side.
13. Open applicants page.
14. Open both user profile details from agent side.
15. Check that agent can see the same saved details.

## Expected Result
- Sign up works for both users.
- Required field validation works.
- Complete profile page saves correctly.
- My Profile shows saved details.
- Agent side also shows the same details.

## Tester Notes
- Check desktop and mobile layout.
- Check if file preview is visible.
- Check if any field value is missing after save.

## Screenshots to Add
- Sign up page for User 1
- Sign up page for User 2
- Validation error example
- Completed profile page for User 1
- Completed profile page for User 2
- User My Profile page
- Agent applicant profile detail page

[PASTE SCREENSHOTS FOR TEST CASE 1 HERE]

---

# Test Case 2 - Support Chat Between User and Agent

## Goal
Check that both users can chat with agent and both sides can read messages correctly.

## Pages
- user side support chat
- agent side support chat list and chat window

## Steps
1. Login as User 1.
2. Open Chat With Support.
3. Send this message: `Hi sir, I have filled up details. What's next?`
4. Upload a screenshot of User 1 My Profile page in the support chat.
5. Login as User 2.
6. Repeat the same test for User 2.
7. Login as agent.
8. Open support chat list.
9. Open chat of User 1 and User 2.
10. Check that text and uploaded screenshot are clearly visible.
11. Reply to both users: `Next step is do the payment.`
12. Login back as User 1 and User 2.
13. Check if agent reply is visible.
14. Send reply from user side: `Ok sir, we will do the payment.`
15. Check from agent side again.

## Expected Result
- Text messages appear on both sides.
- Uploaded screenshot is visible clearly.
- Time order is correct.
- No overlap in chat UI.
- Agent and user both can read the full message and media.

## Tester Notes
- Test desktop and mobile view.
- Check scroll behavior.
- Check that last message is not hidden under input box.

## Screenshots to Add
- User 1 support chat
- User 2 support chat
- Agent support chat for User 1
- Agent support chat for User 2
- Example with uploaded image visible

[PASTE SCREENSHOTS FOR TEST CASE 2 HERE]

---

# Test Case 3 - Payment Config and Payment Proof

## Goal
Check global payment config, user-specific payment config, payment page, timer, and payment proof upload.

## Pages
- /agent/payments
- user side payment page
- support chat

## Steps
1. Login as agent.
2. Open Payment Home.
3. Create one Global Payment Config.
4. Save it.
5. Tell both users by support chat: `Payment config updated. You can do the payment.`
6. Login as User 1.
7. Open payment page.
8. Check that payment details are visible.
9. Check timer and payment UI behavior.
10. Upload payment proof from User 1 side.
11. Login as agent and check if payment proof is visible.
12. Now create one User-Specific Payment Config only for User 2.
13. Save it.
14. Login as User 2.
15. Open payment page.
16. Check that User 2 sees the user-specific payment config, not only the global config.
17. Upload payment proof from User 2 side.
18. Login as agent and check proof again.

## Expected Result
- Global payment config works.
- User-specific payment config overrides global for that one user.
- Timer works properly.
- Payment proof upload works.
- Agent can view uploaded proof.

## Tester Notes
- Test QR only flow if available.
- Test bank details only flow if available.
- Check if wrong user gets wrong payment config.

## Screenshots to Add
- Global payment config screen
- User 1 payment page
- User 1 payment proof uploaded
- User-specific payment config for User 2
- User 2 payment page showing override
- Agent side payment proof view

[PASTE SCREENSHOTS FOR TEST CASE 3 HERE]

---

# Test Case 4 - Agreement Flow

## Goal
Check full agreement flow very deeply because this is very important.

## Pages
- agent agreements area
- user agreement page
- agent agreement document view

## Steps
1. Login as agent.
2. Unlock agreement section for User 1 and User 2 after payment.
3. Send support chat message to user: `Now fill the agreement.`
4. Login as User 1.
5. Open agreement page.
6. Read the agreement screen.
7. Try to submit without checkbox or signature and check validation.
8. Tick checkbox.
9. Add digital signature.
10. Check signature preview before final submit.
11. Submit signature.
12. Record or upload consent video.
13. Final submit agreement.
14. After submit, check that the final agreement document page is visible.
15. Check that signature is visible.
16. Check that consent video is visible.
17. Check Aadhaar, PAN, live photo, contact details, email, IP address, and other agreement details.
18. Login as agent.
19. Open same user agreement document view.
20. Check that agent can see all the same details.
21. If PDF download option is available, test it.
22. Repeat key agreement flow for User 2 also.

## Expected Result
- Agreement validation works.
- Signature preview works.
- Consent video upload works.
- Final agreement document is visible on user side.
- Final agreement document is visible on agent side.
- Signature must be visible clearly. This is critical.

## Tester Notes
- Test on desktop and mobile.
- Check if any media card is blank.
- Check if signature is cut, cropped, or missing.
- Check if consent video opens and plays.

## Screenshots to Add
- Agreement form before submit
- Validation message example
- Signature preview
- Consent video screen
- Final agreement document on user side
- Final agreement document on agent side
- Signature visible screenshot

[PASTE SCREENSHOTS FOR TEST CASE 4 HERE]

---

# Test Case 5 - Community Chat and Private Chat

## Goal
Check public community chat and private community chat with 2 users.

## Pages
- user community chat
- user private community PMs
- agent community chat
- agent ghost chat/private chat

## Steps
1. Login as User 1.
2. Open community chat.
3. Send one public message.
4. Login as User 2.
5. Open community chat.
6. Send one public message.
7. Check if public messages appear correctly.
8. Login as agent.
9. Open community chat.
10. Reply through ghost identity if required.
11. Check reply visibility.
12. From community area, open private chat if available.
13. Send a private message flow and test from both sides.
14. Check unread count, order, and visibility.

## Expected Result
- Public messages appear in correct order.
- Private chat works separately.
- Messages are visible clearly.
- No overlapping text or hidden media.

## Tester Notes
- Report if one user can wrongly see another private message.
- Report if visibility rules are wrong.
- Report if reply buttons are missing or confusing.

## Screenshots to Add
- User 1 community chat
- User 2 community chat
- Agent community reply
- Private chat example

[PASTE SCREENSHOTS FOR TEST CASE 5 HERE]

---

# Test Case 6 - Config and Management Pages

## Goal
Check all important agent config pages and management tools.

## Items to Test
- UI Locker
- Stock Management
- Server Busy Status
- Chat Delete for Everyone
- Stock Update
- Testimonial Video Management
- Hero On/Off
- Sound On/Off
- Announcements
- Payment Templates
- Community Visibility

## Steps
1. Login as agent.
2. Open UI Config page.
3. Lock one section for one user and check user side blur + lock.
4. Turn on Server Busy for one user and check login block.
5. Open stock management.
6. Add stock, edit stock, update stock, delete stock if allowed.
7. Open testimonial management.
8. Upload one video if needed.
9. Check hero on/off toggle.
10. Check sound on/off toggle.
11. Open announcements page.
12. Create, edit, and delete one test announcement.
13. Open payment templates and check create/edit behavior.
14. Open community visibility page and change visibility for one user.
15. Open a chat and test delete for everyone if available.

## Expected Result
- Each config page works from UI.
- User side effect is visible where needed.
- No broken button, no hidden save issue, no wrong page refresh.

## Tester Notes
- Focus on mobile usability too.
- Check if buttons overlap.
- Check if saved data really reflects on related user pages.

## Screenshots to Add
- UI Config page
- Server Busy example
- Stock management page
- Testimonial management page
- Announcement page
- Payment template page
- Community visibility page

[PASTE SCREENSHOTS FOR TEST CASE 6 HERE]

---

# Test Case 7 - Security Testing From UI Level

## Goal
Check basic visible security controls from UI level.

## Important
This is manual UI testing only.
Do not use hacker tools.
Just test normal user actions.

## Items to Check
- Right click disabled or not
- Inspect shortcut blocked or not
- View source shortcut blocked or not
- Testimonial video easy download possible or not
- Raw media file path visible or not in normal UI

## Steps
1. Open user side pages.
2. Try right click.
3. Try common inspect shortcuts.
4. Open testimonials page.
5. Try easy video download from normal controls.
6. Check if raw backend media path is openly shown in normal UI.
7. Repeat on agent side if needed.

## Expected Result
- Security restrictions should work as designed.
- Testimonial videos should not have easy normal download path from UI controls.
- Source-view shortcuts should be blocked if that feature is active.

## Tester Notes
- If anything is visible, write exact page and exact method.
- Add screenshot if possible.

## Screenshots to Add
- Right click blocked example
- Shortcut blocked example
- Testimonial video control example
- Any visible raw path example

[PASTE SCREENSHOTS FOR TEST CASE 7 HERE]

---

# Final Tester Summary

After all 7 test cases, add this summary:

- Total test cases run:
- Passed:
- Failed:
- Need retest:
- Biggest bug found:
- Pages that felt confusing:
- Mobile issues found:
- Desktop issues found:
- Final recommendation:

[WRITE FINAL SUMMARY HERE]
