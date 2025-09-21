const dotenv = require("dotenv");
dotenv.config();
const nodemailer = require("nodemailer");
const schedule = require("node-schedule");
const fs = require("fs");
const path = require("path");

// persistence file for scheduled jobs
const JOBS_FILE = path.join(__dirname, "scheduled-jobs.json");

// in-memory map of jobId -> { job, meta }
const scheduledJobs = new Map();

function loadJobsFromFile() {
  if (!fs.existsSync(JOBS_FILE)) return;
  try {
    const raw = fs.readFileSync(JOBS_FILE, "utf8");
    const list = JSON.parse(raw || "[]");
    for (const item of list) {
      try {
        const sendAt = new Date(item.sendAt);
        // if already past, send immediately
        if (isNaN(sendAt.getTime())) continue;
        if (sendAt <= new Date()) {
          sendEmail(item.to, item.subject, item.text);
          continue;
        }

        const job = schedule.scheduleJob(sendAt, function () {
          sendEmail(item.to, item.subject, item.text);
          // after running, remove from persistence
          removeJob(item.id);
        });

        scheduledJobs.set(item.id, { job, meta: item });
      } catch (e) {
        console.error("Failed to restore job", item, e);
      }
    }
  } catch (e) {
    console.error("Could not read scheduled jobs file", e);
  }
}

function saveJobsToFile() {
  const arr = Array.from(scheduledJobs.values()).map((v) => v.meta);
  try {
    fs.writeFileSync(JOBS_FILE, JSON.stringify(arr, null, 2), "utf8");
  } catch (e) {
    console.error("Could not write scheduled jobs file", e);
  }
}

function addJobToPersistence(id, meta, job) {
  scheduledJobs.set(id, { meta, job });
  saveJobsToFile();
}

function removeJob(id) {
  const entry = scheduledJobs.get(id);
  if (entry) {
    try {
      entry.job.cancel();
    } catch (e) {
      // ignore
    }
    scheduledJobs.delete(id);
    saveJobsToFile();
  }
}

function listJobs() {
  return Array.from(scheduledJobs.values()).map((v) => v.meta);
}

let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

function sendEmail(to, subject, text) {
  let mailDetails = {
    from: process.env.EMAIL,
    to: to,
    subject: subject,
    text: text,
  };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log(`Error Occurs ${err}`);
    } else {
      console.log(`Email sent successfully ${JSON.stringify(data)}`);
    }
  });
}

/**
 * Schedule an email to be sent at a specific time.
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @param {Date|string} sendAt - Date object or ISO string when the email should be sent
 * @returns {Job} node-schedule Job instance (can call .cancel())
 */
function scheduleEmail(to, subject, text, sendAt) {
  let date;
  if (sendAt instanceof Date) {
    date = sendAt;
  } else {
    date = new Date(sendAt);
  }

  if (isNaN(date.getTime())) {
    throw new Error("Invalid sendAt date");
  }

  if (date <= new Date()) {
    throw new Error("sendAt must be a future date/time");
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const job = schedule.scheduleJob(date, function () {
    sendEmail(to, subject, text);
    // after running, remove from persistence
    removeJob(id);
  });

  const meta = { id, to, subject, text, sendAt: date.toISOString() };
  addJobToPersistence(id, meta, job);

  return { id, job };
}

/**
 * Convenience helper: schedule using a Date object (validates input)
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @param {Date} dateObj
 * @returns {{id: string, job: Job}}
 */
function scheduleEmailAt(to, subject, text, dateObj) {
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    throw new Error('dateObj must be a valid Date');
  }
  return scheduleEmail(to, subject, text, dateObj);
}

// load persisted jobs at startup
loadJobsFromFile();

module.exports = { sendEmail, scheduleEmail, scheduleEmailAt, removeJob, listJobs };
