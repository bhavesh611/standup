// ── Config ────────────────────────────────────────────────────────────────────
// Set this to your Google Doc ID (from the URL: /d/<DOC_ID>/edit)
const DOC_ID = '17UyU4ZK5FvtVvZBQ9cMk9TAjXEKbkDF1JqodvYHyTtY';
const SYNC_KEY = 'standup_data';

// ── Load endpoint (GET) — returns stored standup data for cross-device sync ───
function doGet(e) {
  const props = PropertiesService.getScriptProperties();
  const raw = props.getProperty(SYNC_KEY);
  const data = raw ? JSON.parse(raw) : null;
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Entry point (POST) ────────────────────────────────────────────────────────
function doPost(e) {
  try {
    // Body is sent as text/plain from the webapp (required for no-cors mode)
    const payload = JSON.parse(e.postData.contents);

    if (payload.action === 'sync') {
      // Store standup data for cross-device sync
      const props = PropertiesService.getScriptProperties();
      props.setProperty(SYNC_KEY, JSON.stringify(payload.data));
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Default: log to Google Doc
    appendStandup(payload.date, payload.syncUps || [], payload.projects || []);
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
function appendStandup(isoDate, syncUps, projects) {
  const doc = DocumentApp.openById(DOC_ID);
  const body = doc.getBody();
  const label = formatDateLabel(isoDate);

  // Top rule with date
  body.appendParagraph('── ' + label + ' ──────────────────────────────────');

  // Sync ups
  if (syncUps.length) {
    body.appendParagraph('');
    const syncHeader = body.appendParagraph('Sync ups');
    syncHeader.setBold(true);
    syncUps.forEach(function(s) {
      if (s.trim()) body.appendParagraph('• ' + s.trim());
    });
  }

  // Tasks
  const taskProjects = projects.filter(function(p) {
    return p.tasks.length || p.name.trim();
  });

  if (taskProjects.length) {
    body.appendParagraph('');
    const tasksHeader = body.appendParagraph('Tasks');
    tasksHeader.setBold(true);

    taskProjects.forEach(function(project) {
      body.appendParagraph('');
      const projPara = body.appendParagraph(project.name || 'Untitled Project');
      projPara.setBold(true);
      project.tasks.forEach(function(task) {
        const text = (task.text || '').trim() || '(empty task)';
        body.appendParagraph(task.done ? '• ~' + text + '~' : '• ' + text);
      });
    });
  }

  body.appendParagraph('');
  body.appendParagraph('────────────────────────────────────────');
  body.appendParagraph('');

  doc.saveAndClose();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDateLabel(isoDate) {
  const parts = isoDate.split('-');
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}
