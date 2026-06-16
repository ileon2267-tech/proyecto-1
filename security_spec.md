# Security Spec: PerioDash v15 CRM

## 1. Data Invariants
1. **Patient Invariant**: A Patient record must always have a unique `id` and a valid non-empty `name`. It is clinical private data under HIPAA; only authenticated users may view or register patients.
2. **Appointment Invariant**: An Appointment must link to a valid `patientId`, have a specific `date` (YYYY-MM-DD), `time` (HH:MM), and a standard `status` state (e.g., 'Pending', 'Confirmed', 'Completed', 'Cancelled').
3. **Temporal Invariant**: Creation and updates must stamp reliable records without allowing historical backdating of actions using client-side clocks.

## 2. The "Dirty Dozen" Payloads (Identity, Integrity and State Violations)
The following 12 malicious payloads are checked to ensure they return `PERMISSION_DENIED`:

### 1. Zero-ID Poisoning
An anonymous client tries to write a patient with a corrupted ID:
```json
{
  "id": "../../hack",
  "name": "Corrupt Doc"
}
```

### 2. Privilege Escalation (User Level Injection)
A client tries to set their profile role unilaterally to `admin` or bypass the verified clinician list.
```json
{
  "role": "admin",
  "email": "malicious@hack.com"
}
```

### 3. Patient Identity Theft
An authenticated client attempts to overwrite another client's patient:
```json
{
  "id": "pat-1",
  "name": "Carlos Mendoza Silva",
  "notes": "Injected notes by unauthorized user"
}
```

### 4. Backdated Clinical Timestamp Injection
An attacker attempts to write an appointment or consultation with a fake `createdAt` in 2010.
```json
{
  "id": "app-100",
  "patientId": "pat-1",
  "createdAt": "2010-01-01T00:00:00Z"
}
```

### 5. Invalid Diagnosis Condition (State Bypass)
Injecting an invalid condition not permitted by FDI Tooth dental specification.
```json
{
  "toothNumber": 16,
  "condition": "corrupt_state"
}
```

### 6. PII Scraping Without Authorization
An unauthenticated or unverified user requests list operations across all patients:
`GET /patients` without passing auth token email validation.

### 7. Overriding Terminal Appointment Outcomes
Attempting to overwrite a completed or cancelled appointment status.
```json
{
  "id": "app-finished",
  "status": "Confirmed"
}
```

### 8. Massive Overwrite Denial-of-Wallet
Uploading a patient record whose properties or notes list array exceed the 1MB or 2MB sizing boundaries.

### 9. Fake Medical Prescription Attachment
An unauthorized client appends clinical notes or dental recipes to a clinical file.

### 10. Orphaning Medical History
Deleting a clinical patient while there are active unpaid treatments, breaking medical integrity.

### 11. Cross-Site Scripting Injection in Notes
Injecting HTML `script` tags into patient names or notasSistemicas.
```json
{
  "name": "<script>alert('xss')</script>"
}
```

### 12. Impersonating Clinic Doctor
Signing in with unverified email credentials or claims.
