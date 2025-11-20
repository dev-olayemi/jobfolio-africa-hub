Example Firestore rules for `posts` and `posts/{postId}/comments`

These rules are a minimal, safe starting point. Adjust `request.auth.token.admin == true`
to match your admin claim strategy (custom claims or a list of admin UIDs).

rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
// Allow authenticated users to read public collections
match /posts/{postId} {
allow read: if true;

      // Create: authenticated users can create posts with required fields
      allow create: if request.auth != null
        && request.resource.data.keys().hasAll(['authorId','content','createdAt'])
        && request.resource.data.authorId == request.auth.uid
        && request.resource.data.content is string
        && request.resource.data.content.size() <= 2000
        && (request.resource.data.media == null || (request.resource.data.media is list && request.resource.data.media.size() <= 5));

      // Update: only post owner or admin can update
      allow update: if request.auth != null && (
        resource.data.authorId == request.auth.uid || request.auth.token.admin == true
      );

      // Delete: only owner or admin
      allow delete: if request.auth != null && (
        resource.data.authorId == request.auth.uid || request.auth.token.admin == true
      );

      // Comments subcollection
      match /comments/{commentId} {
        allow read: if true;

        // allow authenticated users to create comments on a post
        allow create: if request.auth != null
          && request.resource.data.authorId == request.auth.uid
          && request.resource.data.content is string
          && request.resource.data.content.size() <= 1000;

        // allow comment owner or admin to update/delete their comment
        allow update, delete: if request.auth != null && (
          resource.data.authorId == request.auth.uid || request.auth.token.admin == true
        );
      }
    }

}
}

Notes:

- Use custom claims (`request.auth.token.admin`) for admin checks, or replace with a known admin UID list.
- Keep limits conservative (max lengths and media array sizes) to prevent abuse.
- Consider adding validation for drive URLs if you only accept Drive-hosted media.
