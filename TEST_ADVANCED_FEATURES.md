# Testing Guide for Advanced Features

## Quick Test Checklist

### 1. Auto-categorization ✅
**Test Steps**:
1. Open Create Ticket page
2. Enter title: "My laptop won't turn on"
3. Enter description: "I pressed the power button but nothing happens. The screen is black."
4. **Expected**: Category should auto-select "Technical Support"

**Alternative Test**:
- Title: "I need help with my tuition payment"
- **Expected**: Category auto-selects "Financial"

---

### 2. Duplicate Detection ✅
**Test Steps**:
1. Create first ticket:
   - Title: "Cannot login to student portal"
   - Description: "Getting error when trying to login"
   - Submit ticket
2. Create second ticket:
   - Title: "Login problems with portal"
   - Description: "Can't access my account"
   - Submit ticket
3. **Expected**: After submission, see orange warning showing similar ticket #1

---

### 3. Heatmap Data ✅
**Test Steps**:
1. Login as admin (admin@university.edu)
2. Navigate to Analytics page
3. Scroll down past the metric cards
4. **Expected**: See two bar charts:
   - "Tickets by Hour of Day" (0-23)
   - "Tickets by Day of Week" (Mon-Sun)

**Note**: Charts will be empty if no tickets exist. Create a few tickets first.

---

### 4. Satisfaction Rating ✅
**Test Steps**:
1. Login as student
2. Create a new ticket
3. Login as admin
4. Open the ticket and mark as "Resolved"
5. Logout and login as student again
6. Open the resolved ticket
7. **Expected**: Modal appears with 5 emoji ratings (😞 😐 🙂 😊 😍)
8. Select a rating and optionally add feedback
9. Click Submit
10. **Expected**: Modal closes, "Thank you for your feedback!" message appears

**Verification**:
- Refresh page - modal should NOT appear again (already rated)
- Check database: `satisfaction_ratings` table should have new entry

---

### 5. Estimated Response Time ✅
**Test Steps**:
1. Open Create Ticket page
2. **Expected**: See teal banner at top saying:
   - "Average Response Time"
   - "Our team typically responds within X hours"

**Note**: 
- If no tickets have been resolved yet, banner may not appear
- Create and resolve a few tickets to see accurate data

---

### 6. Rich Text Editor ✅
**Test Steps**:
1. Open any ticket details page (student or admin)
2. In the reply box, you should see a toolbar with formatting options
3. Type some text and format it:
   - Select text and click **B** for bold
   - Select text and click *I* for italic
   - Click bullet list icon and type items
   - Click code block icon and type code
4. Submit the reply
5. **Expected**: Reply appears with proper formatting preserved

**Test Formatting**:
- **Bold text**
- *Italic text*
- Bullet lists
- Numbered lists
- `Code blocks`
- Links

---

### 7. Bulk Actions ✅
**Test Steps**:
1. Login as admin
2. Go to "All Tickets" page
3. Create 3-5 test tickets first (if needed)
4. Check the checkbox next to 2-3 tickets
5. **Expected**: Fixed bar appears at bottom with:
   - "X tickets selected"
   - Buttons: Resolve, Close, Delete, Cancel
6. Click "Resolve"
7. **Expected**: Confirmation dialog appears
8. Confirm action
9. **Expected**: 
   - Success message appears
   - Tickets are marked as resolved
   - Checkboxes are cleared
   - Table refreshes

**Test Each Action**:
- ✅ Resolve - marks tickets as resolved
- ✅ Close - marks tickets as closed
- ✅ Delete - permanently deletes tickets
- ✅ Cancel - clears selection

---

## Backend API Testing

### Using curl (Terminal)

**1. Get Estimated Response Time**:
```bash
curl http://localhost:8000/api/tickets/estimated-response-time \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response**:
```json
{
  "avg_response_hours": 2.5
}
```

---

**2. Get Heatmap Data**:
```bash
curl http://localhost:8000/api/tickets/admin/heatmap \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response**:
```json
{
  "by_hour": [0, 2, 1, 0, 0, 0, 0, 0, 3, 5, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  "by_day": [5, 8, 6, 7, 9, 2, 1]
}
```

---

**3. Submit Satisfaction Rating**:
```bash
curl -X POST http://localhost:8000/api/tickets/TICKET_ID/satisfaction \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "feedback": "Great support!"
  }'
```

**Expected Response**:
```json
{
  "message": "Rating submitted successfully",
  "rating": {
    "id": "...",
    "ticket_id": "...",
    "rating": 5,
    "feedback": "Great support!",
    "created_at": "2026-04-21T..."
  }
}
```

---

**4. Bulk Actions**:
```bash
curl -X POST http://localhost:8000/api/tickets/bulk-action \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_ids": ["ticket_id_1", "ticket_id_2"],
    "action": "resolve"
  }'
```

**Expected Response**:
```json
{
  "message": "Bulk action completed",
  "updated_count": 2,
  "action": "resolve"
}
```

---

## Common Issues & Solutions

### Issue: Estimated response time not showing
**Solution**: 
- Create at least one ticket
- Have admin reply to it
- The calculation needs at least one resolved ticket with admin comments

### Issue: Heatmap charts empty
**Solution**:
- Create several tickets at different times/days
- Charts show distribution, need data to visualize

### Issue: Satisfaction modal not appearing
**Solution**:
- Ensure ticket status is "resolved" or "closed"
- Ensure you're logged in as the ticket owner (student)
- Check that ticket hasn't been rated already
- Wait 1 second after page load (modal has delay)

### Issue: Similar tickets not showing
**Solution**:
- Create tickets with overlapping keywords
- Similarity threshold is 30% - tickets must have common words
- Check backend logs for AI service errors

### Issue: Rich text not rendering
**Solution**:
- Check browser console for errors
- Ensure react-quill is installed: `npm install react-quill`
- Clear browser cache
- Check that content is being saved as HTML in database

### Issue: Bulk actions not working
**Solution**:
- Ensure you're logged in as admin
- Check that ticket IDs are valid
- Look for error messages in the UI
- Check backend logs for authorization errors

---

## Database Verification

### Check Satisfaction Ratings
```sql
SELECT * FROM satisfaction_ratings ORDER BY created_at DESC LIMIT 10;
```

### Check Ticket Comments (HTML content)
```sql
SELECT id, text FROM comments ORDER BY created_at DESC LIMIT 5;
```

### Check Ticket Categories
```sql
SELECT category, COUNT(*) as count FROM tickets GROUP BY category;
```

---

## Performance Testing

### Load Test Bulk Actions
1. Create 50 test tickets
2. Select all 50 tickets
3. Click "Resolve"
4. **Expected**: All tickets updated within 2-3 seconds

### Load Test Heatmap
1. Create 100+ tickets at various times
2. Navigate to Analytics
3. **Expected**: Charts render within 1 second

---

## Browser Compatibility

Test in:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

---

## Mobile Testing

Test on:
- ✅ iPhone (Safari)
- ✅ Android (Chrome)

Features to verify:
- Rich text editor works on mobile
- Satisfaction modal is responsive
- Bulk action bar is accessible
- Charts are readable

---

## Accessibility Testing

- ✅ Keyboard navigation works
- ✅ Screen reader compatible
- ✅ Color contrast meets WCAG standards
- ✅ Focus indicators visible

---

## Final Verification

Run through this complete user flow:

1. **Student creates ticket**:
   - See estimated response time ✅
   - AI suggests category ✅
   - FAQ suggestions appear ✅
   - Submit ticket

2. **Check for similar tickets**:
   - Create another similar ticket ✅
   - See duplicate warning ✅

3. **Admin responds**:
   - Login as admin ✅
   - Open ticket ✅
   - Use rich text editor to reply ✅
   - Mark as resolved ✅

4. **Student rates experience**:
   - Login as student ✅
   - Open resolved ticket ✅
   - Rating modal appears ✅
   - Submit rating ✅

5. **Admin views analytics**:
   - Go to Analytics page ✅
   - See heatmap charts ✅
   - Verify data accuracy ✅

6. **Admin uses bulk actions**:
   - Go to All Tickets ✅
   - Select multiple tickets ✅
   - Bulk resolve/close ✅
   - Verify updates ✅

---

## Success Criteria

All features should:
- ✅ Work without errors
- ✅ Display correctly in light/dark mode
- ✅ Be responsive on mobile
- ✅ Show appropriate loading states
- ✅ Display success/error messages
- ✅ Persist data correctly
- ✅ Update UI in real-time (where applicable)

---

**If all tests pass, the implementation is COMPLETE!** 🎉
