# Riventra API

Node.js API using Express and MongoDB. The configured database is `sit`, and the server listens on port `3000` by default.

On the first successful connection, startup creates an `app_metadata` record so MongoDB Atlas persists the `sit` database.

## Run locally

```bash
npm install
npm run dev
```

Check the service:

```bash
curl http://localhost:3000/
curl http://localhost:3000/health/live
curl http://localhost:3000/health/ready
```

Copy `.env.example` to `.env` when configuring another environment. Never commit `.env` or database credentials.

MongoDB Atlas must allow the server's public IP under **Security > Network Access**. Prefer a single-IP `/32` entry instead of allowing access from everywhere.

## Security defaults

- Helmet security headers and disabled Express fingerprinting
- Explicit CORS origin allowlist
- IP rate limiting
- HTTP parameter pollution and MongoDB operator sanitization
- Small request body and parameter limits
- Generic production-safe server errors
- MongoDB connection pooling and bounded server selection timeout

## API routes

All request and response bodies use JSON except the QR/barcode endpoint, which returns a PNG. Mobile numbers must use E.164 format, such as `+919876543210`.

### Authentication

| Method | Route | Access |
| --- | --- | --- |
| POST | `/api/auth/super-admin/signup` | `x-admin-signup-key` header |
| POST | `/api/auth/super-admin/signin` | Public, rate limited |
| POST | `/api/auth/company/signin` | Public, rate limited |
| POST | `/api/auth/signin` | Public role-aware alias |

Send authenticated requests with `Authorization: Bearer <accessToken>`.

### Super admin

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/super-admin/companies/signup` | Create a company and its first admin |
| POST | `/api/super-admin/companies` | Create a company |
| PATCH | `/api/super-admin/companies/:companyId` | Update or reactivate a company |
| DELETE | `/api/super-admin/companies/:companyId` | Soft-delete company and deactivate its users/products |

Company signup body:

```json
{
  "company": {
    "companyName": "Example Foods",
    "address": {
      "line1": "1 Market Road",
      "line2": "",
      "city": "Surat",
      "state": "Gujarat",
      "postalCode": "395007",
      "country": "India"
    },
    "contactNumber": "+919876543210"
  },
  "admin": {
    "firstName": "Company",
    "lastName": "Admin",
    "mobileNumber": "+919876543211",
    "password": "StrongPass!1"
  }
}
```

### Company admin

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/company/products` | Add a product |
| PATCH | `/api/company/products/:productId` | Update a product |
| GET | `/api/company/products/:productId/code?type=qr` | Generate QR PNG |
| GET | `/api/company/products/:productId/code?type=barcode` | Generate Code 128 barcode PNG |
| DELETE | `/api/company/products/:productId` | Soft-delete a product |
| POST | `/api/company/products/:productId/restore` | Restore a deleted product |

Product descriptions accept sanitized rich-text HTML. Script, style, image, iframe, and unsafe link content is removed before storage.
