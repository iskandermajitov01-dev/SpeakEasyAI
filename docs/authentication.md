# SpeakEasy accounts

SpeakEasy uses its own username/password accounts. `getAppUser()` authorizes
every learning API from an opaque session cookie; platform identity headers do
not sign a visitor into a learning account.

## Behaviour

- Register with a case-insensitive login (3–24 ASCII letters, numbers, `.`, `_`,
  `-`, starting with a letter or number) and a password of 12–128 characters.
- New accounts choose a display name, daily goal and interests, then take the
  placement check. Leaderboard sharing and conversation memory start disabled.
- Platform identity headers are ignored. Legacy ChatGPT profile import is disabled on Vercel.
- Sign out is a same-origin POST to `/api/auth`. It revokes the current session,
  expires its cookie and returns to the home page. It does not sign out of ChatGPT.
- Settings provides password changes with current-password reauthentication.
  All existing sessions are revoked, and this browser receives a fresh session.
- Forgotten-password recovery is not implemented. No unverified email recovery
  or fake reset link is offered.

## Storage and security

`app_accounts`, `app_auth_sessions` and `app_auth_attempts` are created by
`drizzle/0003_smooth_carlie_cooper.sql`. `npm run db:migrate` applies migrations to local SQLite or remote Turso; Vercel builds run this automatically. See ../VERCEL.md.

Passwords use native `node:crypto` scrypt with N=32768, r=8, p=3, a random
128-bit salt and a 64-byte result. This is one of the profiles in the
[OWASP password storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).
Comparison is constant-time. Missing users perform the same derivation.
Plaintext passwords and raw session tokens are not persisted or logged.

Sessions use 256-bit random tokens and SHA-256 token hashes in D1. The cookie
is HttpOnly, SameSite=Lax, Path=/ and Secure on HTTPS/non-loopback hosts.
Default expiration is one day; Remember me selects 30 days. Expiration is
enforced in the server query, regardless of the browser cookie's lifetime.
Authentication responses are no-store. Every authentication mutation checks
Origin and bounds the JSON body. Persistent atomic rate counters limit IPs,
IP/login combinations, registration and password changes before expensive KDFs.

Vercel and local previews use only SpeakEasy accounts. The previous private Sites publication has its own platform gate; this source change does not alter that publication.

## Verification

With a local development preview on port 5174:

```powershell
node scripts/test-auth.mjs
```

`AUTH_TEST_ORIGIN` can select another localhost port. The script refuses remote
hosts, creates disposable local accounts and checks registration, duplicate
logins, login normalization, wrong passwords, profile isolation, CSRF, cookie
lifetime, password/session rotation, logout revocation and rate limiting.
Repeated runs in the same time window intentionally encounter production-like
rate limits. Test accounts are not migrated or deployed with the source.
