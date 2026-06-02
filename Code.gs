// ── Config ────────────────────────────────────────────────────────────────────
// Set this to your Google Doc ID (from the URL: /d/<DOC_ID>/edit)
const DOC_ID = 'YOUR_GOOGLE_DOC_ID_HERE';

// ── Entry point ───────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    appendStandup(payload.date, payload.slackText, payload.projects);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Append standup entry to the Google Doc ────────────────────────────────────
function appendStandup(isoDate, slackText, projects) {
  const doc = DocumentApp.openById(DOC_ID);
  const body = doc.getBody();

  const label = formatDateLabel(isoDate);
  const divider = '────────────────────────────────';

  // Top divider with date
  body.appendParagraph('── ' + label + ' ' + divider.slice(label.length + 4));
  body.appendParagraph('');

  // Projects and tasks
  projects.forEach(function(project) {
    if (!project.tasks.length && !project.name.trim()) return;

    const projPara = body.appendParagraph(project.name || 'Untitled Project');
    projPara.setBold(true);

    project.tasks.forEach(function(task) {
      const text = (task.text || '').trim() || '(empty task)';
      const line = task.done ? '- ~' + text + '~' : '- ' + text;
      body.appendParagraph(line);
    });

    body.appendParagraph('');
  });

  // Bottom divider
  body.appendParagraph(divider);
  body.appendParagraph('');

  doc.saveAndClose();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDateLabel(isoDate) {
  // isoDate: "2026-06-02" → "2 Jun 2026"
  const parts = isoDate.split('-');
  const d = new Date(
    parseInt(parts[0]),
    parseInt(parts[1]) - 1,
    parseInt(parts[2])
  );
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}
