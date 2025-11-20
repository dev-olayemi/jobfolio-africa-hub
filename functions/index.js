/* Cloud Function: upload image, resize, upload to Google Drive and return a public link

Environment (set via Firebase functions config or env vars):
- GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL
- GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY  (with actual newlines or with \n -- code replaces \n)
- DRIVE_FOLDER_ID (optional)
- FIREBASE_SERVICE_ACCOUNT_JSON (optional) - if omitted firebase-admin will use default credentials when deployed

Deploy: from `functions/` run `npm install` then `firebase deploy --only functions` (ensure firebase-tools logged in)
*/

const functions = require("firebase-functions");
const express = require("express");
const Busboy = require("busboy");
const sharp = require("sharp");
const { google } = require("googleapis");
const streamifier = require("streamifier");
const admin = require("firebase-admin");
const cors = require("cors");

// Initialize Firebase admin (will use application default credentials when deployed)
try {
  if (!admin.apps.length) {
    const svc = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (svc) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(svc)),
      });
    } else {
      admin.initializeApp();
    }
  }
} catch (err) {
  console.error("Firebase admin init error", err);
}

const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));

// Helper: get google auth JWT
function getDriveClient() {
  const clientEmail =
    process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL ||
    functions.config().drive?.client_email;
  const privateKeyRaw =
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ||
    functions.config().drive?.private_key;
  const privateKey = privateKeyRaw
    ? privateKeyRaw.replace(/\\n/g, "\n")
    : undefined;

  if (!clientEmail || !privateKey) {
    throw new Error(
      'Missing Drive service account credentials. Set GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY or use `firebase functions:config:set drive.client_email=... drive.private_key="..."`'
    );
  }

  const auth = new google.auth.JWT(clientEmail, null, privateKey, [
    "https://www.googleapis.com/auth/drive",
  ]);
  return google.drive({ version: "v3", auth });
}

// POST /upload/profile
// fields: uid (user id), optionally folderId override
app.post("/upload/profile", async (req, res) => {
  try {
    const busboy = new Busboy({ headers: req.headers });
    const fields = {};
    let fileBuffer = null;
    let fileName = null;
    let mimeType = null;

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      const buffers = [];
      file.on("data", (data) => buffers.push(data));
      file.on("end", () => {
        fileBuffer = Buffer.concat(buffers);
        fileName = filename;
        mimeType = mimetype;
      });
    });

    busboy.on("field", (fieldname, val) => {
      fields[fieldname] = val;
    });

    busboy.on("finish", async () => {
      try {
        const uid = fields.uid;
        if (!uid) return res.status(400).json({ error: "Missing uid" });
        if (!fileBuffer)
          return res.status(400).json({ error: "No file uploaded" });

        // resize/compress with sharp (produce jpeg)
        const resized = await sharp(fileBuffer)
          .rotate()
          .resize(800, 800, { fit: "inside" })
          .jpeg({ quality: 80 })
          .toBuffer();

        const drive = getDriveClient();
        const folderId =
          fields.folderId ||
          process.env.DRIVE_FOLDER_ID ||
          functions.config().drive?.folder_id;
        const generatedName = `user-${uid}-${Date.now()}.jpg`;

        // upload
        const media = {
          mimeType: "image/jpeg",
          body: streamifier.createReadStream(resized),
        };

        const resource = { name: generatedName };
        if (folderId) resource.parents = [folderId];

        const created = await drive.files.create({
          resource,
          media,
          fields: "id, name",
        });

        const fileId = created.data.id;

        // make shareable (anyone with link)
        await drive.permissions.create({
          fileId,
          requestBody: { role: "reader", type: "anyone" },
        });

        // build direct view link (uc link works well for images)
        const link = `https://drive.google.com/uc?export=view&id=${fileId}`;

        // persist to Firestore user profile
        await db
          .doc(`profiles/${uid}`)
          .set({ photoURL: link }, { merge: true });

        return res.json({ link, fileId });
      } catch (err) {
        console.error("upload error", err);
        return res.status(500).json({ error: err.message || err.toString() });
      }
    });

    req.pipe(busboy);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

exports.uploadToDrive = functions.https.onRequest(app);

// Firestore trigger: when a comment is created under posts/{postId}/comments/{commentId}
// create a notification for the post owner (server-side write so clients don't need to trust the caller)
exports.onCommentCreate = functions.firestore
  .document("posts/{postId}/comments/{commentId}")
  .onCreate(async (snap, context) => {
    try {
      const comment = snap.data();
      const postId = context.params.postId;
      const commentId = context.params.commentId;

      // load post to find owner
      const postRef = db.doc(`posts/${postId}`);
      const postSnap = await postRef.get();
      if (!postSnap.exists) return null;
      const post = postSnap.data();

      const to = post?.authorId || post?.postedById || null;
      if (!to) return null;

      // don't notify if the author commented on their own post
      if (to === comment.authorId) return null;

      await db.collection("notifications").add({
        to,
        from: comment.authorId || null,
        type: "comment",
        postId,
        commentId,
        read: false,
        message: (comment.authorName || "Someone") + " commented on your post",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return null;
    } catch (err) {
      console.error("onCommentCreate error", err);
      return null;
    }
  });

// Firestore trigger: when a job application is created, notify the job owner (if available)
exports.onApplicationCreate = functions.firestore
  .document("jobs/{jobId}/applications/{applicationId}")
  .onCreate(async (snap, context) => {
    try {
      const application = snap.data();
      const jobId = context.params.jobId;

      const jobRef = db.doc(`jobs/${jobId}`);
      const jobSnap = await jobRef.get();
      if (!jobSnap.exists) return null;
      const job = jobSnap.data();

      const to = job?.postedById || job?.authorId || null;
      if (!to) return null;

      // don't notify if applicant is the owner
      if (to === application?.applicantId) return null;

      await db.collection("notifications").add({
        to,
        from: application?.applicantId || null,
        type: "application",
        jobId,
        applicationId: context.params.applicationId,
        read: false,
        message:
          (application?.applicantName || "Someone") + " applied to your job",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return null;
    } catch (err) {
      console.error("onApplicationCreate error", err);
      return null;
    }
  });

// Firestore trigger: when a like is created under jobs/{jobId}/likes/{likeId}
// notify the job owner (server-side write)
exports.onLikeCreate = functions.firestore
  .document("jobs/{jobId}/likes/{likeId}")
  .onCreate(async (snap, context) => {
    try {
      const like = snap.data();
      const jobId = context.params.jobId;

      const jobRef = db.doc(`jobs/${jobId}`);
      const jobSnap = await jobRef.get();
      if (!jobSnap.exists) return null;
      const job = jobSnap.data();

      const to = job?.postedById || job?.authorId || null;
      if (!to) return null;

      // don't notify if liker is the owner
      if (to === like?.userId) return null;

      await db.collection("notifications").add({
        to,
        from: like?.userId || null,
        type: "like",
        jobId,
        likeId: context.params.likeId,
        read: false,
        message: (like?.userName || "Someone") + " liked your job",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return null;
    } catch (err) {
      console.error("onLikeCreate error", err);
      return null;
    }
  });

// Firestore trigger: when a like is removed under jobs/{jobId}/likes/{likeId}
// decrement job likes and remove the notification created for the like
exports.onLikeDelete = functions.firestore
  .document("jobs/{jobId}/likes/{likeId}")
  .onDelete(async (snap, context) => {
    try {
      const like = snap.data();
      const jobId = context.params.jobId;

      // decrement likes counter on job (safely)
      try {
        await db
          .doc(`jobs/${jobId}`)
          .update({ likes: admin.firestore.FieldValue.increment(-1) });
      } catch (e) {
        // if field doesn't exist, ignore
      }

      // remove any notification tied to this like
      const likeId = context.params.likeId;
      const notifSnap = await db
        .collection("notifications")
        .where("likeId", "==", likeId)
        .get();
      const batch = db.batch();
      notifSnap.forEach((d) => batch.delete(d.ref));
      if (!notifSnap.empty) await batch.commit();

      return null;
    } catch (err) {
      console.error("onLikeDelete error", err);
      return null;
    }
  });

// Firestore trigger: when an application is removed, decrement applies count and remove notifications
exports.onApplicationDelete = functions.firestore
  .document("jobs/{jobId}/applications/{applicationId}")
  .onDelete(async (snap, context) => {
    try {
      const applicationId = context.params.applicationId;
      const jobId = context.params.jobId;

      try {
        await db
          .doc(`jobs/${jobId}`)
          .update({ applies: admin.firestore.FieldValue.increment(-1) });
      } catch (e) {
        // ignore
      }

      const notifSnap = await db
        .collection("notifications")
        .where("applicationId", "==", applicationId)
        .get();
      const batch = db.batch();
      notifSnap.forEach((d) => batch.delete(d.ref));
      if (!notifSnap.empty) await batch.commit();

      return null;
    } catch (err) {
      console.error("onApplicationDelete error", err);
      return null;
    }
  });

// Firestore trigger: when a post comment is deleted, remove the notification for that comment
exports.onPostCommentDelete = functions.firestore
  .document("posts/{postId}/comments/{commentId}")
  .onDelete(async (snap, context) => {
    try {
      const commentId = context.params.commentId;
      const notifSnap = await db
        .collection("notifications")
        .where("commentId", "==", commentId)
        .get();
      const batch = db.batch();
      notifSnap.forEach((d) => batch.delete(d.ref));
      if (!notifSnap.empty) await batch.commit();
      return null;
    } catch (err) {
      console.error("onPostCommentDelete error", err);
      return null;
    }
  });
